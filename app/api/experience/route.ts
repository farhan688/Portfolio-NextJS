import { NextResponse } from "next/server"
import { Experience } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const experiences = await db.collection('experience').find({}).toArray()
    
    return NextResponse.json(experiences.map(exp => ({
      ...exp,
      _id: exp._id.toString()
    })))
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const experience = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('experience').insertOne({
      ...experience,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      ...experience,
      _id: result.insertedId.toString()
    })
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const experience = await request.json() as Experience & { _id: string }
    
    if (!experience._id) {
      return NextResponse.json({ error: "ID diperlukan untuk update" }, { status: 400 })
    }

    await client.connect()
    const db = client.db('portfolio')
    
    const { _id, ...updateData } = experience
    
    // Cek apakah dokumen ada sebelum update
    const existingExp = await db.collection('experience').findOne({ 
      _id: new ObjectId(_id) 
    })

    if (!existingExp) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 })
    }

    // Gunakan updateOne sebagai gantinya
    const result = await db.collection('experience').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        } 
      }
    )
    
    if (result.modifiedCount === 0) {
      throw new Error('Update operation failed')
    }

    // Ambil dokumen yang sudah diupdate
    const updatedDoc = await db.collection('experience').findOne({ 
      _id: new ObjectId(_id) 
    })

    if (!updatedDoc) {
      throw new Error('Failed to fetch updated document')
    }

    // Format response
    const updatedExperience = {
      ...updatedDoc,
      _id: updatedDoc._id.toString()
    }

    return NextResponse.json(updatedExperience)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Gagal mengupdate pengalaman' 
    }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID pengalaman diperlukan' }, { status: 400 })
    }
    
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('experience').deleteOne({ 
      _id: new ObjectId(id) 
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Pengalaman tidak ditemukan" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: 'Gagal menghapus pengalaman'
    }, { status: 500 })
  } finally {
    await client.close()
  }
} 