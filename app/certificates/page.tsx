"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Certificate } from "@/app/types"
import { motion, AnimatePresence } from "framer-motion"

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const certificatesPerPage = 8

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

  const totalPages = Math.ceil(certificates.length / certificatesPerPage)
  const indexOfLastCert = currentPage * certificatesPerPage
  const indexOfFirstCert = indexOfLastCert - certificatesPerPage
  const currentCertificates = certificates.slice(indexOfFirstCert, indexOfLastCert)

  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Certificates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {currentCertificates.map((cert) => (
          <motion.div
            key={cert._id?.toString() || `cert-${cert.title}-${cert.organization}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg shadow-md p-6 flex items-center"
          >
            <Image
              src={cert.imageUrl || "/placeholder.svg"}
              alt={`${cert.title} certificate`}
              width={100}
              height={100}
              className="mr-4 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage(cert.imageUrl)}
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Prev
          </button>

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-4 py-2 rounded ${
                currentPage === number
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Next
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <Image
                src={selectedImage}
                alt="Certificate large view"
                width={1200}
                height={800}
                className="w-full h-auto object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

