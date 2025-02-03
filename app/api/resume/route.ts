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
    const formData = await request.formData()
    const pdfFile = formData.get('pdfFile') as File | null
    const resumeDataString = formData.get('resumeData') as string
    
    if (!resumeDataString) {
      throw new Error('Resume data is missing')
    }

    const resumeData = JSON.parse(resumeDataString)

    await client.connect()
    const db = client.db('portfolio')

    // Prepare update data
    const updateData = {
      personalInfo: {
        name: resumeData.personalInfo?.name || "",
        email: resumeData.personalInfo?.email || "",
        location: resumeData.personalInfo?.location || "",
        linkedin: resumeData.personalInfo?.linkedin || ""
      },
      summary: resumeData.summary || "",
      education: Array.isArray(resumeData.education) ? resumeData.education.map((edu: any) => ({
        ...edu,
        _id: new ObjectId(),
        degree: edu.degree || "",
        university: edu.university || "",
        year: edu.year || "",
        courses: Array.isArray(edu.courses) ? edu.courses : []
      })) : [],
      experience: Array.isArray(resumeData.experience) ? resumeData.experience.map((exp: any) => ({
        ...exp,
        _id: new ObjectId(),
        title: exp.title || "",
        company: exp.company || "",
        period: exp.period || "",
        achievements: Array.isArray(exp.achievements) ? exp.achievements : []
      })) : [],
      updatedAt: new Date()
    }

    // Handle PDF file if present
    if (pdfFile) {
      const buffer = await pdfFile.arrayBuffer()
      const base64Data = Buffer.from(buffer).toString('base64')
      Object.assign(updateData, {
        pdfFileData: base64Data,
        pdfFileName: pdfFile.name,
        contentType: pdfFile.type
      })
    }

    // Find existing document
    const existingResume = await db.collection('resume').findOne({})

    if (!existingResume) {
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

    // Update existing document
    const result = await db.collection('resume').replaceOne(
      { _id: existingResume._id },
      {
        ...updateData,
        createdAt: existingResume.createdAt
      }
    )

    if (result.modifiedCount === 0) {
      throw new Error('Failed to update resume')
    }

    // Fetch updated document
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

// Add new download route handler
export async function POST(request: Request) {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const resume = await db.collection('resume').findOne({})

    if (!resume || !resume.pdfFileData) {
      return NextResponse.json({ error: 'No PDF file found' }, { status: 404 })
    }

    const buffer = Buffer.from(resume.pdfFileData, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': resume.contentType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.pdfFileName || 'resume.pdf'}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download PDF' }, { status: 500 })
  } finally {
    await client.close()
  }
}