import { NextResponse } from "next/server"
import { Certificate } from "@/app/types"
import { MongoClient, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('portfolio')
    const certificates = await db.collection('certificates').find({}).toArray()
    
    return NextResponse.json(certificates.map(cert => ({
      ...cert,
      _id: cert._id.toString()
    })))
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const certificate = await request.json()
    await client.connect()
    const db = client.db('portfolio')
    
    const result = await db.collection('certificates').insertOne({
      ...certificate,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      ...certificate,
      _id: result.insertedId.toString()
    })
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request) {
  try {
    const certificate = await request.json()
    
    if (!certificate._id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    await client.connect()
    const db = client.db('portfolio')
    
    const { _id, ...updateData } = certificate
    
    // Cek apakah dokumen ada sebelum update
    const existingCert = await db.collection('certificates').findOne({ 
      _id: new ObjectId(_id) 
    })

    if (!existingCert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Update dokumen
    const result = await db.collection('certificates').updateOne(
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
    const updatedDoc = await db.collection('certificates').findOne({ 
      _id: new ObjectId(_id) 
    })

    if (!updatedDoc) {
      throw new Error('Failed to fetch updated document')
    }

    // Format response
    const updatedCertificate = {
      ...updatedDoc,
      _id: updatedDoc._id.toString()
    }

    return NextResponse.json(updatedCertificate)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update certificate' 
    }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 })
    }

    try {
      await client.connect()
      const db = client.db('portfolio')
      
      const result = await db.collection('certificates').deleteOne({ 
        _id: new ObjectId(id) 
      })
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
      }
      
      return NextResponse.json({ message: "Certificate deleted successfully" })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 })
  } finally {
    await client.close()
  }
} 