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
    const about = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('about').insertOne({
      ...about,
      createdAt: new Date()
    })
    
    return NextResponse.json({ 
      ...about, 
      _id: result.insertedId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create about' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const about = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    // Jika tidak ada _id, coba update dokumen pertama
    if (!about._id) {
      const result = await db.collection('about').updateOne(
        {}, // update dokumen pertama
        { 
          $set: {
            title: about.title,
            description: about.description,
            imageUrl: about.imageUrl,
            socialLinks: about.socialLinks,
            updatedAt: new Date()
          }
        },
        { upsert: true } // create if not exists
      )
      return NextResponse.json({ ...about, _id: result.upsertedId || null })
    }

    // Jika ada _id, update berdasarkan _id
    const result = await db.collection('about').updateOne(
      { _id: new ObjectId(about._id) },
      { 
        $set: {
          title: about.title,
          description: about.description,
          imageUrl: about.imageUrl,
          socialLinks: about.socialLinks,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "About not found" }, { status: 404 })
    }
    
    return NextResponse.json(about)
  } catch (error) {
    console.error('Update error:', error) // untuk debugging
    return NextResponse.json({ error: 'Failed to update about' }, { status: 500 })
  } finally {
    await client.close()
  }
} 