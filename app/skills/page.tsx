"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle } from "lucide-react"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading skills...
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
          className="text-4xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          Skills
        </motion.h1>
        <div className="space-y-12">
          {skills.map((skill, index) => (
            <motion.div
              key={skill._id?.toString() || `skill-${skill.category}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-white">
                {skill.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
                {skill.items.map((item, i) => (
                  <motion.div
                    key={`${skill._id?.toString() || skill.category}-item-${i}`}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (index * 0.1) + (i * 0.05),
                      duration: 0.2
                    }}
                  >
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span className="text-white text-lg">{item}</span>
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

