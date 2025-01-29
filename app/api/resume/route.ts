import { NextResponse } from "next/server"
import { Resume } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const resume = await db.collection('resume').findOne({})
    
    if (!resume) {
      return NextResponse.json({
        _id: null,
      personalInfo: {
        name: "",
        email: "",
        location: "",
        linkedin: ""
      },
      summary: "",
      education: [],
      experience: [],
      pdfUrl: ""
      })
    }
    
    return NextResponse.json({
      ...resume,
      _id: resume._id.toString(),
      education: resume.education.map((edu: any) => ({
        ...edu,
        _id: edu._id.toString()
      })),
      experience: resume.experience.map((exp: any) => ({
        ...exp,
        _id: exp._id.toString()
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
  const resume = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    // Persiapkan data untuk update
    const updateData = {
      personalInfo: {
        name: resume.personalInfo?.name || "",
        email: resume.personalInfo?.email || "",
        location: resume.personalInfo?.location || "",
        linkedin: resume.personalInfo?.linkedin || ""
      },
      summary: resume.summary || "",
      education: (resume.education || []).map((edu: any) => {
        const { _id, ...rest } = edu
        return {
          ...rest,
          _id: new ObjectId(), // Selalu buat ID baru
          degree: edu.degree || "",
          university: edu.university || "",
          year: edu.year || "",
          courses: Array.isArray(edu.courses) ? edu.courses : []
        }
      }),
      experience: (resume.experience || []).map((exp: any) => {
        const { _id, ...rest } = exp
        return {
          ...rest,
          _id: new ObjectId(), // Selalu buat ID baru
          title: exp.title || "",
          company: exp.company || "",
          period: exp.period || "",
          achievements: Array.isArray(exp.achievements) ? exp.achievements : []
        }
      }),
      pdfUrl: resume.pdfUrl || "",
      updatedAt: new Date()
    }

    // Cari dokumen yang ada
    const existingResume = await db.collection('resume').findOne({})
    
    if (!existingResume) {
      // Buat dokumen baru
      const result = await db.collection('resume').insertOne({
        ...updateData,
        createdAt: new Date()
      })
      
      const newResume = {
        ...updateData,
        _id: result.insertedId.toString(),
        education: updateData.education.map((edu: { _id: ObjectId }) => ({
          ...edu,
          _id: edu._id.toString()
        })),
        experience: updateData.experience.map((exp: { _id: ObjectId }) => ({
          ...exp,
          _id: exp._id.toString()
        }))
      }
      
      return NextResponse.json(newResume)
    }

    // Update dokumen yang ada
    const result = await db.collection('resume').replaceOne(
      { _id: existingResume._id },
      {
        ...updateData,
        createdAt: existingResume.createdAt // Pertahankan tanggal pembuatan asli
      }
    )

    if (result.modifiedCount === 0) {
      throw new Error('Failed to update resume')
    }

    // Ambil dokumen yang sudah diupdate
    const updatedResume = await db.collection('resume').findOne({ _id: existingResume._id })
    
    if (!updatedResume) {
      throw new Error('Failed to fetch updated resume')
    }

    // Format response
    const formattedResponse = {
      ...updatedResume,
      _id: updatedResume._id.toString(),
      education: updatedResume.education.map((edu: any) => ({
        ...edu,
        _id: edu._id.toString()
      })),
      experience: updatedResume.experience.map((exp: any) => ({
        ...exp,
        _id: exp._id.toString()
      }))
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update resume' 
    }, { status: 500 })
  } finally {
    await client.close()
  }
} 