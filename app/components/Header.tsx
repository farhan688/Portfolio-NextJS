"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Home, User, FileText, Briefcase, Code, Award, Mail } from "lucide-react"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: User },
    { href: "/resume", label: "Resume", icon: FileText },
    { href: "/experience", label: "Experience", icon: Briefcase },
    { href: "/projects", label: "Projects", icon: Code },
    { href: "/skills", label: "Skills", icon: Award },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            Farhan Aditya
          </Link>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
          <ul className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <motion.li key={item.href} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link href={item.href} className="text-gray-300 hover:text-blue-400 flex items-center">
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                    <item.icon className="w-5 h-5 mr-2" />
                  </motion.div>
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
        {isOpen && (
          <motion.ul
            className="mt-4 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {menuItems.map((item) => (
              <motion.li key={item.href} whileTap={{ scale: 0.95 }}>
                <Link href={item.href} className="flex items-center py-2 text-gray-300 hover:text-blue-400">
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </nav>
    </header>
  )
}

export default Header

