"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Certificate } from "@/app/types"
import { motion } from "framer-motion"

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    fetchCertificates()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading certificates...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Certificates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg shadow-md p-6 flex items-center"
          >
            <Image
              src={cert.imageUrl || "/placeholder.svg"}
              alt={`${cert.title} certificate`}
              width={100}
              height={100}
              className="mr-4 rounded-md"
            />
            <div>
              <h2 className="text-xl font-semibold mb-2 text-blue-300">{cert.title}</h2>
              <p className="text-gray-400 mb-2">{cert.organization}</p>
              <p className="text-gray-500 mb-4">{cert.date}</p>
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition duration-300"
                >
                  View Credential
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

