import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb'
import twilio from 'twilio'

if (!process.env.MONGODB_URI || !process.env.TWILIO_WHATSAPP_TO) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function GET() {
  try {
    if (!client.connect) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    await client.connect()
    const db = client.db('portfolio')
    const messages = await db.collection('contact').find({}).toArray()
    
    const formattedMessages = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString(),
      createdAt: msg.createdAt?.toISOString()
    }))
    
    return NextResponse.json(formattedMessages)
  } catch (error: unknown) {
    console.error('Database error:', error)
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
    
    // Save to MongoDB
    const result = await db.collection('contact').insertOne({
      ...message,
      createdAt: new Date()
    })

    // Send WhatsApp message
    const whatsappMessage = `
    New Contact Form Submission:
    Name: ${message.name}
    Email: ${message.email}
    Phone: ${message.phone}
    Message: ${message.message}
    `.trim()

    await twilioClient.messages.create({
      body: whatsappMessage,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO as string
    })
    return NextResponse.json({ 
      ...message, 
      _id: result.insertedId 
    })
  } catch (error) {
    console.error('Error:', error)
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