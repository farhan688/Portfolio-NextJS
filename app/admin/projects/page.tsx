"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Project } from "@/app/types"

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    techStack: [],
    imageUrl: "",
    demoUrl: "",
    repoUrl: "",
  })
  const [techInput, setTechInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000) // Hide after 3 seconds
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title || '')
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('techStack', JSON.stringify(formData.techStack || []))
      formDataToSend.append('demoUrl', formData.demoUrl || '')
      formDataToSend.append('repoUrl', formData.repoUrl || '')
      formDataToSend.append('imageUrl', formData.imageUrl || '')

      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }

      if (isEditing && formData._id) {
        formDataToSend.append('_id', formData._id.toString())
      }

      const url = "/api/projects"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to save project")
      
      await fetchProjects()
      resetForm()
      showSuccessMessage(isEditing ? "Project updated successfully!" : "Project created successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete project")
      
      await fetchProjects()
      showSuccessMessage("Project deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleEdit = (project: Project) => {
    setFormData(project)
    setIsEditing(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      techStack: [],
      imageUrl: "",
      demoUrl: "",
      repoUrl: "",
    })
    setTechInput("")
    setIsEditing(false)
    setSelectedFile(null)
  }

  const handleAddTech = () => {
    if (techInput.trim() && formData.techStack) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()]
      })
      setTechInput("")
    }
  }

  const handleRemoveTech = (index: number) => {
    if (formData.techStack) {
      setFormData({
        ...formData,
        techStack: formData.techStack.filter((_, i) => i !== index)
      })
    }
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Add success message display */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500 text-white p-4 rounded-lg mb-4 flex justify-between items-center"
          >
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage("")}
              className="text-white hover:text-green-200"
            >
              ×
            </button>
          </motion.div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Projects</h1>
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
            {isEditing ? "Edit Project" : "Add New Project"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 p-2 rounded h-32"
            />
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add Technology"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="bg-gray-700 p-2 rounded flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.techStack?.map((tech, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(index)}
                      className="text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2">Upload Image (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="bg-gray-700 p-2 rounded w-full"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Current image:</p>
                  <img 
                    src={formData.imageUrl} 
                    alt="Project preview" 
                    className="max-w-xs rounded"
                  />
                </div>
              )}
            </div>
            <input
              type="url"
              placeholder="Demo URL"
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="url"
              placeholder="Repository URL"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? "Update Project" : "Add Project"}
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

        {/* Project List */}
        <div className="space-y-4">
          {projects.map((project) => (
            <motion.div
              key={project._id?.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{project.title}</h3>
                  <p className="text-gray-400 mt-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-blue-500 px-2 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id?.toString() || "")}
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