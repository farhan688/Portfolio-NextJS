import { Linkedin, Instagram, Facebook, Github, Mail } from "lucide-react"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-8 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="https://www.linkedin.com/in/farhan-aditya/" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors duration-300" />
          </Link>
          <Link href="https://instagram.com/frhn_adity" target="_blank" rel="noopener noreferrer">
            <Instagram className="w-6 h-6 text-gray-400 hover:text-pink-400 transition-colors duration-300" />
          </Link>
          <Link href="https://github.com/farhan688" target="_blank" rel="noopener noreferrer">
            <Github className="w-6 h-6 text-gray-400 hover:text-white transition-colors duration-300" />
          </Link>
          <Link href="mailto:farhanaditya688@gmail.com">
            <Mail className="w-6 h-6 text-gray-400 hover:text-red-400 transition-colors duration-300" />
          </Link>
        </div>
        <p className="text-gray-400">&copy; {new Date().getFullYear()} Farhan Aditya. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer