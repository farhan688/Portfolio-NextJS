import { NextResponse } from "next/server"
import { Project } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const projects = await db.collection('projects').find({}).toArray()
    
    const formattedProjects = projects.map(project => ({
      ...project,
      _id: project._id.toString()
    }))
    
    return NextResponse.json(formattedProjects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const techStack = JSON.parse(formData.get('techStack') as string)
    const demoUrl = formData.get('demoUrl') as string
    const repoUrl = formData.get('repoUrl') as string
    const imageFile = formData.get('image') as File | null

    let imageUrl = ''

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    }

    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('projects').insertOne({
      title,
      description,
      techStack,
      imageUrl,
      demoUrl,
      repoUrl,
      createdAt: new Date()
    })
    
    return NextResponse.json({ 
      title,
      description,
      techStack,
      imageUrl,
      demoUrl,
      repoUrl,
      _id: result.insertedId.toString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const techStack = JSON.parse(formData.get('techStack') as string)
    const demoUrl = formData.get('demoUrl') as string
    const repoUrl = formData.get('repoUrl') as string
    const imageFile = formData.get('image') as File | null
    const existingImageUrl = formData.get('imageUrl') as string
    const _id = formData.get('_id') as string

    let imageUrl = existingImageUrl

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    }

    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          title,
          description,
          techStack,
          imageUrl,
          demoUrl,
          repoUrl,
          updatedAt: new Date()
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      _id,
      title,
      description,
      techStack,
      imageUrl,
      demoUrl,
      repoUrl
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(id)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  } finally {
    await client.close()
  }
}