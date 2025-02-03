import { ObjectId } from 'mongodb'

export interface Certificate {
  _id?: ObjectId | string
  title: string
  organization: string
  date: string
  credentialUrl: string
  imageUrl: string
  file?: File | null
  fileName?: string
  fileType?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Project {
  _id?: ObjectId | string
  title: string
  description: string
  techStack: string[]
  imageUrl: string
  demoUrl?: string
  repoUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Experience {
  _id?: string | ObjectId
  title: string
  company: string
  period: string
  achievements: string[]
}

export interface Skill {
  _id?: ObjectId | string
  category: string
  items: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface About {
  _id?: ObjectId | string
  title: string
  description: string
  imageUrl?: string
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    email?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface Resume {
  _id?: ObjectId | string
  personalInfo: {
    name: string
    email: string
    location: string
    linkedin?: string
  }
  summary: string
  education: {
    _id?: ObjectId | string
    degree: string
    university: string
    year: string
    courses: string[]
  }[]
  experience: {
    _id?: ObjectId | string
    title: string
    company: string
    period: string
    achievements: string[]
  }[]
  pdfFile?: File | null
  pdfFileName?: string
  pdfFileData?: string
  contentType?: string
  pdfUrl: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ContactMessage {
  _id?: ObjectId | string
  name: string
  email: string
  phone: string
  message: string
  createdAt?: Date
  updatedAt?: Date
}