"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { Resume } from "@/app/types"

// Helper to parse JSON strings from API response
const parseJsonField = (data: any, field: string, defaultValue: any) => {
  if (data && typeof data[field] === 'string') {
    try {
      return JSON.parse(data[field]);
    } catch (e) {
      console.error(`Failed to parse ${field}`, e);
      return defaultValue;
    }
  }
  return data?.[field] || defaultValue;
};

export default function Resume() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResume() {
      try {
        const response = await fetch("/api/resume")
        if (!response.ok) throw new Error("Failed to fetch resume")
        let data = await response.json()

        if (data) {
          // Parse JSON string fields
          data.personalInfo = parseJsonField(data, 'personalInfo', {});
          data.education = parseJsonField(data, 'education', []);
          data.experience = parseJsonField(data, 'experience', []);

          // Ensure they are arrays, even if parsing failed or returned something else
          if (!Array.isArray(data.education)) {
            data.education = [];
          }
          if (!Array.isArray(data.experience)) {
            data.experience = [];
          }
        } else {
          // Initialize with default structure if no data exists
          data = {
            personalInfo: { name: "", email: "", location: "", linkedin: "" },
            summary: "",
            education: [],
            experience: [],
            pdfFileName: null,
            contentType: null,
          };
        }
        setResume(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
  }, [])

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/resume?download=true')
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resume?.pdfFileName || 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading resume...
        </div>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Resume
        </motion.h1>
        {resume?.pdfFileData && ( // Ubah dari pdfUrl menjadi pdfFileData
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-md flex items-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </motion.div>
        )}
      </div>

      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">Personal Information</h2>
        <div className="bg-gray-800 p-6 rounded-lg space-y-2">
          <p className="text-gray-300">
            <strong className="text-white">Name:</strong> {resume.personalInfo.name}
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Email:</strong> {resume.personalInfo.email}
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Location:</strong> {resume.personalInfo.location}
          </p>
        </div>
      </motion.section>

      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">Career Summary</h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 whitespace-pre-wrap">{resume.summary}</p>
        </div>
      </motion.section>

      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">Education</h2>
        <div className="space-y-4">
          {resume.education.map((edu) => (
            <motion.div 
              key={`edu-${edu.university}-${edu.year}`}
              className="bg-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-medium text-white">{edu.degree}</h3>
              <p className="text-gray-400 mb-2">{edu.university}, {edu.year}</p>
              {edu.courses && edu.courses.length > 0 && (
                <div>
                  <p className="text-white mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course, courseIndex) => (
                      <span 
                        key={`${edu.university}-course-${courseIndex}`}
                        className="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">Professional Experience</h2>
        <div className="space-y-4">
          {resume.experience.map((exp) => (
            <motion.div 
              key={`exp-${exp.company}-${exp.period}`}
              className="bg-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-medium text-white">{exp.title}</h3>
              <p className="text-gray-400 mb-2">{exp.company}, {exp.period}</p>
              <ul className="list-disc list-inside space-y-1">
                {exp.achievements && exp.achievements.map((achievement, achievementIndex) => (
                  <li 
                    key={`${exp.company}-achievement-${achievementIndex}`}
                    className="text-gray-300"
                  >
                    {achievement}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

