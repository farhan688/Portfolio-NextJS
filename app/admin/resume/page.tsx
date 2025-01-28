"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Resume } from "@/app/types"

export default function AdminResume() {
  const [formData, setFormData] = useState<Resume>({
    id: "1",
    personalInfo: {
      name: "",
      email: "",
      location: "",
      linkedin: ""
    },
    summary: "",
    education: [],
    experience: [],
    pdfUrl: ""
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newEducation, setNewEducation] = useState({
    degree: "",
    university: "",
    year: "",
    courses: [] as string[]
  })
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    period: "",
    achievements: [] as string[]
  })
  const [courseInput, setCourseInput] = useState("")
  const [achievementInput, setAchievementInput] = useState("")

  useEffect(() => {
    fetchResume()
  }, [])

  async function fetchResume() {
    try {
      const response = await fetch("/api/resume")
      if (!response.ok) throw new Error("Failed to fetch resume")
      const data = await response.json()
      setFormData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/resume", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save resume")
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.university) {
      setFormData({
        ...formData,
        education: [
          ...formData.education,
          {
            ...newEducation,
            id: Date.now().toString(),
            courses: [...newEducation.courses]
          }
        ]
      })
      setNewEducation({
        degree: "",
        university: "",
        year: "",
        courses: []
      })
    }
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData({
        ...formData,
        experience: [
          ...formData.experience,
          {
            ...newExperience,
            id: Date.now().toString(),
            achievements: [...newExperience.achievements]
          }
        ]
      })
      setNewExperience({
        title: "",
        company: "",
        period: "",
        achievements: []
      })
    }
  }

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu.id !== id)
    })
  }

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter(exp => exp.id !== id)
    })
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Resume</h1>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, name: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, email: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  value={formData.personalInfo.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, location: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, linkedin: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Career Summary</h2>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded h-32"
            />
          </section>

          {/* Education */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Education</h2>
            <div className="space-y-4 mb-4">
              {formData.education.map((edu) => (
                <div key={edu.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p>{edu.university}, {edu.year}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {edu.courses.map((course, index) => (
                          <span key={index} className="bg-blue-500 px-2 py-1 rounded-full text-sm">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="University"
                  value={newEducation.university}
                  onChange={(e) => setNewEducation({ ...newEducation, university: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Course"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  className="flex-1 bg-gray-700 p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (courseInput.trim()) {
                      setNewEducation({
                        ...newEducation,
                        courses: [...newEducation.courses, courseInput.trim()]
                      })
                      setCourseInput("")
                    }
                  }}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add Course
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newEducation.courses.map((course, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => setNewEducation({
                        ...newEducation,
                        courses: newEducation.courses.filter((_, i) => i !== index)
                      })}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Add Education
              </button>
            </div>
          </section>

          {/* Experience */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
            <div className="space-y-4 mb-4">
              {formData.experience.map((exp) => (
                <div key={exp.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p>{exp.company}, {exp.period}</p>
                      <ul className="list-disc list-inside mt-2">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="text-gray-300">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Period"
                  value={newExperience.period}
                  onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
              </div>
              <div className="flex gap-2">
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
                      setNewExperience({
                        ...newExperience,
                        achievements: [...newExperience.achievements, achievementInput.trim()]
                      })
                      setAchievementInput("")
                    }
                  }}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add Achievement
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newExperience.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {achievement}
                    <button
                      type="button"
                      onClick={() => setNewExperience({
                        ...newExperience,
                        achievements: newExperience.achievements.filter((_, i) => i !== index)
                      })}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Add Experience
              </button>
            </div>
          </section>

          {/* Resume PDF */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Resume PDF</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">PDF URL</label>
                <input
                  type="url"
                  value={formData.pdfUrl || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    pdfUrl: e.target.value
                  })}
                  placeholder="URL to your resume PDF"
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <p className="text-sm text-gray-400">
                Upload your PDF resume to a cloud storage service and paste the URL here
              </p>
            </div>
          </section>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            >
              Save Resume
            </button>
            {success && (
              <span className="text-green-500">
                Resume saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 