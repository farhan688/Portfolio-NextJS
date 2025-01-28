export interface Certificate {
  id: string
  title: string
  organization: string
  date: string
  credentialUrl: string
  imageUrl: string
}

export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  imageUrl: string
  demoUrl?: string
  repoUrl?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  period: string
  achievements: string[]
}

export interface Skill {
  id: string
  category: string
  items: string[]
}

export interface About {
  id: string
  title: string
  description: string
  imageUrl?: string
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    email?: string
  }
}

export interface Resume {
  id: string
  personalInfo: {
    name: string
    email: string
    location: string
    linkedin?: string
  }
  summary: string
  education: {
    id: string
    degree: string
    university: string
    year: string
    courses: string[]
  }[]
  experience: {
    id: string
    title: string
    company: string
    period: string
    achievements: string[]
  }[]
  pdfUrl: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  date: string
} 