import { NextResponse } from "next/server"
import { ContactMessage } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const messages = await db.collection('contact').find({}).toArray()
    
    const formattedMessages = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString()
    }))
    
    return NextResponse.json(formattedMessages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const message = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('contact').insertOne({
      ...message,
      createdAt: new Date()
    })
    
    return NextResponse.json({ 
      ...message, 
      _id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
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
    
    const result = await db.collection('contact').deleteOne({
      _id: new ObjectId(id)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  } finally {
    await client.close()
  }
}