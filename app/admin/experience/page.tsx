"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Experience } from "@/app/types"

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: "",
    company: "",
    period: "",
    achievements: [],
  })
  const [achievementInput, setAchievementInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExperiences()
  }, [])

  async function fetchExperiences() {
    try {
      const response = await fetch("/api/experience")
      if (!response.ok) throw new Error("Failed to fetch experiences")
      const data = await response.json()
      setExperiences(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = isEditing ? "/api/experience" : "/api/experience"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save experience")
      
      await fetchExperiences()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return
    
    try {
      const response = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete experience")
      
      await fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleEdit = (exp: Experience) => {
    setFormData(exp)
    setIsEditing(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      period: "",
      achievements: [],
    })
    setAchievementInput("")
    setIsEditing(false)
  }

  const handleAddAchievement = () => {
    if (achievementInput.trim() && formData.achievements) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, achievementInput.trim()]
      })
      setAchievementInput("")
    }
  }

  const handleRemoveAchievement = (index: number) => {
    if (formData.achievements) {
      setFormData({
        ...formData,
        achievements: formData.achievements.filter((_, i) => i !== index)
      })
    }
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Experience</h1>
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
            {isEditing ? "Edit Experience" : "Add New Experience"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Period (e.g., 2020 - Present)"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add Achievement"
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  className="bg-gray-700 p-2 rounded flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.achievements?.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded"
                  >
                    <span>{achievement}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? "Update Experience" : "Add Experience"}
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

        {/* Experience List */}
        <div className="space-y-4">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{exp.title}</h3>
                  <p className="text-gray-400">{exp.company}</p>
                  <p className="text-gray-500">{exp.period}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-400">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
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