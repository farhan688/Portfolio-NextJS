"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Briefcase, Award, User, Code, Mail } from "lucide-react"

export default function Admin() {
  const menuItems = [
    {
      title: "About",
      icon: <User className="w-6 h-6" />,
      href: "/admin/about",
      description: "Manage your personal information and social links"
    },
    {
      title: "Resume",
      icon: <FileText className="w-6 h-6" />,
      href: "/admin/resume",
      description: "Update your resume and CV"
    },
    {
      title: "Experience",
      icon: <Briefcase className="w-6 h-6" />,
      href: "/admin/experience",
      description: "Manage your work experience"
    },
    {
      title: "Skills",
      icon: <Code className="w-6 h-6" />,
      href: "/admin/skills",
      description: "Update your technical skills"
    },
    {
      title: "Certificates",
      icon: <Award className="w-6 h-6" />,
      href: "/admin/certificates",
      description: "Manage your certificates and achievements"
    },
    {
      title: "Contact",
      icon: <Mail className="w-6 h-6" />,
      href: "/admin/contact",
      description: "See message from your visitors"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    {item.icon}
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                  </div>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 