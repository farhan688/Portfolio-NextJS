import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from 'mongodb'
import twilio from 'twilio'

// Remove the initial connection check and move it inside each route handler
let client: MongoClient | null = null;

const getClient = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI)
  }
  return client
}

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are not defined')
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

export async function GET() {
  const mongoClient = getClient()
  try {
    await mongoClient.connect()
    const db = mongoClient.db('portfolio')
    const messages = await db.collection('contact').find({}).toArray()
    
    const formattedMessages = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString(),
      createdAt: msg.createdAt?.toISOString()
    }))
    
    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  } finally {
    await mongoClient.close()
  }
}

export async function POST(request: Request) {
  const mongoClient = getClient()
  try {
    const message = await request.json()
    await mongoClient.connect()
    const db = mongoClient.db('portfolio')
    
    const result = await db.collection('contact').insertOne({
      ...message,
      createdAt: new Date()
    })

    // Only attempt to send WhatsApp message if Twilio credentials exist
    try {
      if (process.env.TWILIO_WHATSAPP_FROM && process.env.TWILIO_WHATSAPP_TO) {
        const twilioClient = getTwilioClient()
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
          to: process.env.TWILIO_WHATSAPP_TO
        })
      }
    } catch (twilioError) {
      console.error('Twilio error:', twilioError)
      // Continue execution even if WhatsApp message fails
    }

    return NextResponse.json({ 
      ...message, 
      _id: result.insertedId 
    })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  } finally {
    await mongoClient.close()
  }
}

export async function DELETE(request: Request) {
  const mongoClient = getClient()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    
    await mongoClient.connect()
    const db = mongoClient.db('portfolio')
    
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
    await mongoClient.close()
  }
}