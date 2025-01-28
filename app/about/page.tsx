"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"
import type { About } from "@/app/types"

export default function About() {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAbout() {
      try {
        const response = await fetch("/api/about")
        if (!response.ok) throw new Error("Failed to fetch about data")
        const data = await response.json()
        setAbout(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchAbout()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    )
  }

  if (error || !about) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold text-white">
              {about.title}
            </h1>
            <div className="prose prose-invert">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {about.description}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {about.socialLinks?.github && (
                <a
                  href={about.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {about.socialLinks?.linkedin && (
                <a
                  href={about.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {about.socialLinks?.twitter && (
                <a
                  href={about.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {about.socialLinks?.email && (
                <a
                  href={`mailto:${about.socialLinks.email}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-6 h-6" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
  
  