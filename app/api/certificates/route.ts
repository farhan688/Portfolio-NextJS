import { NextResponse } from "next/server"
import { Certificate } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "certificates.json")

async function readData(): Promise<Certificate[]> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeData(data: Certificate[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const cert = await request.json()
  const certificates = await readData()
  
  const newCertificate = {
    ...cert,
    id: Date.now().toString(),
  }
  
  certificates.push(newCertificate)
  await writeData(certificates)
  
  return NextResponse.json(newCertificate)
}

export async function PUT(request: Request) {
  const cert = await request.json()
  const certificates = await readData()
  
  const index = certificates.findIndex((c) => c.id === cert.id)
  if (index === -1) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
  }
  
  certificates[index] = cert
  await writeData(certificates)
  
  return NextResponse.json(cert)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  const certificates = await readData()
  const filtered = certificates.filter((c) => c.id !== id)
  await writeData(filtered)
  
  return NextResponse.json({ success: true })
} 