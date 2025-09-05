'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Skill } from "@/app/types"

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkills() {
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

    fetchSkills()
  }, [])

  // Group skills by category for a structured display
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading skills...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="max-w-4xl mx-auto p-8 text-white">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          My Skills & Expertise
        </motion.h1>
        <div className="space-y-12">
          {Object.entries(groupedSkills).map(([category, skillsInCategory], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-700 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillsInCategory.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    className="bg-gray-800 p-4 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (index * 0.1) + (i * 0.05),
                      duration: 0.3
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{skill.name}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  )
}