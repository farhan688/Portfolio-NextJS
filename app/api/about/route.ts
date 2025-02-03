import { NextResponse } from "next/server"
import { About } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const about = await db.collection('about').findOne({})
    
    if (!about) {
      return NextResponse.json({
        _id: null,
        title: "",
        description: "",
        imageUrl: "",
        socialLinks: {
          github: "",
          linkedin: "",
          twitter: "",
          email: ""
        }
      })
    }
    
    return NextResponse.json({
      ...about,
      _id: about._id.toString()
    })
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
    const socialLinks = JSON.parse(formData.get('socialLinks') as string)
    const imageFile = formData.get('image') as File | null

    let imageUrl = ''

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    }

    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('about').insertOne({
      title,
      description,
      socialLinks,
      imageUrl,
      createdAt: new Date()
    })
    
    return NextResponse.json({ 
      title,
      description,
      socialLinks,
      imageUrl,
      _id: result.insertedId.toString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create about' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const socialLinks = JSON.parse(formData.get('socialLinks') as string)
    const imageFile = formData.get('image') as File | null
    const existingImageUrl = formData.get('imageUrl') as string
    const _id = formData.get('_id') as string | null

    // Validate _id if provided
    if (_id && !ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
    }

    let imageUrl = existingImageUrl

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    }

    await client.connect()
    const db = client.db('portfolio')

    const updateData = {
      title,
      description,
      socialLinks,
      imageUrl,
      updatedAt: new Date()
    }

    if (!_id) {
      const result = await db.collection('about').updateOne(
        {},
        { $set: updateData },
        { upsert: true }
      )
      return NextResponse.json({ 
        ...updateData,
        _id: result.upsertedId?.toString() || null 
      })
    }

    const result = await db.collection('about').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "About not found" }, { status: 404 })
    }

    return NextResponse.json(updateData)

  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Failed to update about' }, { status: 500 })
  } finally {
    await client.close()
  }
}