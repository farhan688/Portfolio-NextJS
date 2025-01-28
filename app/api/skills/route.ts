import { NextResponse } from "next/server"
import { Skill } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "skills.json")

async function readData(): Promise<Skill[]> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeData(data: Skill[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const skill = await request.json()
  const skills = await readData()
  
  const newSkill = {
    ...skill,
    id: Date.now().toString(),
  }
  
  skills.push(newSkill)
  await writeData(skills)
  
  return NextResponse.json(newSkill)
}

export async function PUT(request: Request) {
  const skill = await request.json()
  const skills = await readData()
  
  const index = skills.findIndex((s) => s.id === skill.id)
  if (index === -1) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  }
  
  skills[index] = skill
  await writeData(skills)
  
  return NextResponse.json(skill)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  const skills = await readData()
  const filtered = skills.filter((s) => s.id !== id)
  await writeData(filtered)
  
  return NextResponse.json({ success: true })
} 