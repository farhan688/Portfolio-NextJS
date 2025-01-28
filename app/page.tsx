"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import type { About } from "./types"
import { Code, Terminal, Cpu } from "lucide-react"
import { TypeAnimation } from "react-type-animation"

export default function Home() {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-3xl">
        {about.imageUrl && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-48 h-48 mx-auto mb-8"
          >
            <div className="absolute inset-0">
              <Image
                src={about.imageUrl}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            {/* Animated dots around the image */}
            <div className="absolute inset-0 -m-4">
              <div className="w-full h-full rounded-full border-4 border-blue-500 border-dashed animate-spin-slow" />
            </div>
          </motion.div>
        )}

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Welcome, I&apos;m {about.title}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-gray-300 mb-8"
        >
          {about.description}
        </motion.p>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
          <Code size={40} className="text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold">Clean Code</h3>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
          <Terminal size={40} className="text-green-500 mb-2" />
          <h3 className="text-lg font-semibold">Problem Solving</h3>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
          <Cpu size={40} className="text-purple-500 mb-2" />
          <h3 className="text-lg font-semibold">Optimization</h3>
        </div>
      </motion.div>
      <motion.div
        className="mb-8 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <TypeAnimation
            sequence={[
              `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("World"));`,
              1000,
            ]}
            wrapper="span"
            cursor={true}
            repeat={Number.POSITIVE_INFINITY}
            style={{ fontSize: "0.8em", color: "#A0AEC0", display: "block", fontFamily: "monospace" }}
          />
        </div>
      </motion.div>
      <motion.a
        href="/contact"
        className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Get in Touch
      </motion.a>
    </div>
  )
}

