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
    const project = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('projects').insertOne({
      ...project,
      createdAt: new Date()
    })
    
    return NextResponse.json({ 
      ...project, 
      _id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const project = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(project._id) },
      { $set: { ...project, updatedAt: new Date() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    return NextResponse.json(project)
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