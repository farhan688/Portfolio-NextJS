"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Skill } from "@/app/types"

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [formData, setFormData] = useState<Partial<Skill>>({
    category: "",
    items: [],
  })
  const [itemInput, setItemInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  async function fetchSkills() {
    try {
      const response = await fetch("/api/skills")
      if (!response.ok) throw new Error("Failed to fetch skills")
      const data = await response.json()
      setSkills(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = isEditing ? "/api/skills" : "/api/skills"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save skill")
      
      await fetchSkills()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill category?")) return
    
    try {
      const response = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete skill")
      
      await fetchSkills()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleEdit = (skill: Skill) => {
    setFormData(skill)
    setIsEditing(true)
  }

  const resetForm = () => {
    setFormData({
      category: "",
      items: [],
    })
    setItemInput("")
    setIsEditing(false)
  }

  const handleAddItem = () => {
    if (itemInput.trim() && formData.items) {
      setFormData({
        ...formData,
        items: [...formData.items, itemInput.trim()]
      })
      setItemInput("")
    }
  }

  const handleRemoveItem = (index: number) => {
    if (formData.items) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      })
    }
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Skills</h1>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Skill Category" : "Add New Skill Category"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Category (e.g., Programming Languages)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add Skill"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  className="bg-gray-700 p-2 rounded flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.items?.map((item, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? "Update Skills" : "Add Skills"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Skills List */}
        <div className="space-y-4">
          {skills.map((skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{skill.category}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skill.items.map((item, index) => (
                      <span
                        key={index}
                        className="bg-blue-500 px-2 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 