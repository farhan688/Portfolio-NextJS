import { NextResponse } from "next/server"
import { Experience } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "experience.json")

async function readData(): Promise<Experience[]> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeData(data: Experience[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const exp = await request.json()
  const experiences = await readData()
  
  const newExperience = {
    ...exp,
    id: Date.now().toString(),
  }
  
  experiences.push(newExperience)
  await writeData(experiences)
  
  return NextResponse.json(newExperience)
}

export async function PUT(request: Request) {
  const exp = await request.json()
  const experiences = await readData()
  
  const index = experiences.findIndex((e) => e.id === exp.id)
  if (index === -1) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 })
  }
  
  experiences[index] = exp
  await writeData(experiences)
  
  return NextResponse.json(exp)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  const experiences = await readData()
  const filtered = experiences.filter((e) => e.id !== id)
  await writeData(filtered)
  
  return NextResponse.json({ success: true })
} 