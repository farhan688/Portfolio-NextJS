'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Skill } from "@/app/types"

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [formData, setFormData] = useState<Partial<Skill>>({
    name: "",
    category: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    fetchSkills()
  }, [])

  async function fetchSkills() {
    setLoading(true)
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

    if (!formData.name || !formData.category) {
      setError("Name and category are required.")
      return
    }
    
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
      id: skill.id,
      name: skill.name || "",
      category: skill.category || "",
    })
    setIsEditing(true)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      name: "",
      category: "",
    })
    setIsEditing(false)
  }

  // Group skills by category for display
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

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

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4">
          <h2 className="text-xl font-semibold">{isEditing ? "Edit Skill" : "Add New Skill"}</h2>
          <div>
            <label htmlFor="name" className="block mb-2">Skill Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g., JavaScript"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block mb-2">Category</label>
            <input
              id="category"
              type="text"
              placeholder="e.g., Frontend"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded"
              required
            />
          </div>

          

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? "Update Skill" : "Add Skill"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Skills List */}
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([category, skillsInCategory]) => (
            <div key={category}>
              <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillsInCategory.map((skill) => (
                  <motion.div
                    key={skill.id}
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div>
                      <p className="font-semibold">{skill.name}</p>
                      
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="bg-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="bg-red-600 px-3 py-1 text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}