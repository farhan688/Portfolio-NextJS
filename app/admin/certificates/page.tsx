"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Certificate } from "@/app/types"

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [formData, setFormData] = useState<Partial<Certificate>>({
    title: "",
    organization: "",
    date: "",
    credentialUrl: "",
    imageUrl: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    try {
      const response = await fetch("/api/certificates")
      if (!response.ok) throw new Error("Failed to fetch certificates")
      const data = await response.json()
      setCertificates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = isEditing ? "/api/certificates" : "/api/certificates"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save certificate")
      
      await fetchCertificates()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return
    
    try {
      const response = await fetch(`/api/certificates?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete certificate")
      
      await fetchCertificates()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleEdit = (cert: Certificate) => {
    setFormData(cert)
    setIsEditing(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      organization: "",
      date: "",
      credentialUrl: "",
      imageUrl: "",
    })
    setIsEditing(false)
  }

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Certificates</h1>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form Tambah/Edit Sertifikat */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Certificate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="text"
              placeholder="Organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="url"
              placeholder="Credential URL"
              value={formData.credentialUrl}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="url"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="bg-gray-700 p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Certificate
          </button>
        </form>

        {/* Daftar Sertifikat */}
        <div className="space-y-4">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{cert.title}</h3>
                <p className="text-gray-400">{cert.organization}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cert)}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 