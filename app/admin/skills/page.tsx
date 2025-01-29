"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Skill } from "@/app/types"

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [formData, setFormData] = useState<Partial<Skill>>({
    category: "",
    items: []
  })
  const [itemInput, setItemInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

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

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSuccessMessage("")
    }, 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch("/api/skills", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save skill")
      }

      await fetchSkills()
      resetForm()
      showSuccess(isEditing ? "Skill updated successfully!" : "New skill added successfully!")
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleEdit = (skill: Skill) => {
    setFormData({
      _id: skill._id,
      category: skill.category || "",
      items: Array.isArray(skill.items) ? [...skill.items] : []
    })
    setIsEditing(true)
    setError(null)
  }

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this skill?")) return
    
    try {
      const response = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete skill")
      }
      
      await fetchSkills()
      showSuccess("Skill deleted successfully!")
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      items: []
    })
    setIsEditing(false)
    setItemInput("")
  }

  if (loading) return <div className="text-center p-8">Loading...</div>

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

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Skill Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add Skill Item"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                className="flex-1 bg-gray-700 p-2 rounded"
              />
              <button
                type="button"
                onClick={() => {
                  if (itemInput.trim()) {
                    setFormData({
                      ...formData,
                      items: [...(formData.items || []), itemInput.trim()]
                    })
                    setItemInput("")
                  }
                }}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.items?.map((item, index) => (
                <div key={`form-item-${index}`} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      items: formData.items?.filter((_, i) => i !== index)
                    })}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Update Skill" : "Add Skill"}
          </button>
        </form>

        {/* Skills List */}
        <div className="space-y-4">
          {skills.map((skill) => (
            <motion.div
              key={skill._id?.toString() || `skill-${skill.category}`}
              className="bg-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{skill.category}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill._id?.toString())}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item, index) => (
                  <span
                    key={`${skill._id}-item-${index}`}
                    className="bg-gray-700 px-3 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 