"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface ProjectCardProps {
  title: string
  description: string
  techStack: string[]
  imageUrl: string
  demoUrl?: string
  repoUrl?: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, techStack, imageUrl, demoUrl, repoUrl }) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={title}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-2 text-blue-400">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-gray-200">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <span key={index} className="bg-gray-700 text-blue-300 px-2 py-1 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          {demoUrl && (
            <Link
              href={demoUrl}
              className="text-blue-400 hover:text-blue-300 font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Demo
            </Link>
          )}
          {repoUrl && (
            <Link
              href={repoUrl}
              className="text-blue-400 hover:text-blue-300 font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Repository
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard

