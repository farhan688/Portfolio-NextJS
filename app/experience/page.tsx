"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Experience } from "@/app/types"

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    fetchExperiences()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading experiences...
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
    <AnimatePresence>
      <div className="max-w-4xl mx-auto p-8">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          Professional Experience
        </motion.h1>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div 
              key={exp.id} 
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <h2 className="text-2xl font-semibold text-blue-300">{exp.title}</h2>
              <p className="text-xl text-gray-400 mb-2">{exp.company}</p>
              <p className="text-gray-500 mb-4">{exp.period}</p>
              <ul className="list-disc list-inside space-y-2">
                {exp.achievements.map((achievement, i) => (
                  <motion.li 
                    key={i} 
                    className="text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (i * 0.05) }}
                  >
                    {achievement}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  )
}

