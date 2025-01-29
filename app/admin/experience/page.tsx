"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Experience } from "@/app/types"

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: "",
    company: "", 
    period: "",
    achievements: []
  })
  const [achievementInput, setAchievementInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    setError(null)
    
    try {
      const method = isEditing ? "PUT" : "POST"
      
      // Pastikan _id terkirim saat update
      const dataToSend = isEditing 
        ? formData 
        : {
            title: formData.title || "",
            company: formData.company || "",
            period: formData.period || "",
            achievements: formData.achievements || []
          }

      console.log('Sending data:', dataToSend)

      const response = await fetch("/api/experience", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save experience")
      }

      await fetchExperiences()
      resetForm()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleEdit = (exp: Experience) => {
    if (!exp._id) return;
    setFormData({
      _id: exp._id,
      title: exp.title || "",
      company: exp.company || "",
      period: exp.period || "",
      achievements: Array.isArray(exp.achievements) ? [...exp.achievements] : []
    })
    setIsEditing(true)
    setError(null)
  }

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman kerja ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Gagal menghapus pengalaman")
      
      await fetchExperiences()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      period: "",
      achievements: []
    })
    setIsEditing(false)
    setAchievementInput("")
  }

  if (loading) return <div className="text-center p-8">Loading...</div>

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

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
            Experience saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>

          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add Achievement"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                className="flex-1 bg-gray-700 p-2 rounded"
              />
              <button
                type="button"
                onClick={() => {
                  if (achievementInput.trim()) {
                    setFormData({
                      ...formData,
                      achievements: [...(formData.achievements || []), achievementInput.trim()]
                    })
                    setAchievementInput("")
                  }
                }}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                  <span className="flex-1">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      achievements: formData.achievements?.filter((_, i) => i !== index)
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
            {isEditing ? "Update Experience" : "Add Experience"}
          </button>
        </form>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <motion.div
              key={exp._id?.toString()}
              className="bg-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{exp.title}</h3>
                  <p className="text-gray-400">{exp.company}</p>
                  <p className="text-gray-500">{exp.period}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => exp._id && handleDelete(exp._id.toString())}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {exp.achievements.map((achievement, index) => (
                  <li key={index} className="text-gray-300">
                    {achievement}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 