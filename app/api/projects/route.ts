import { NextResponse } from "next/server"
import { Project } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "projects.json")

async function readData(): Promise<Project[]> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeData(data: Project[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const project = await request.json()
  const projects = await readData()
  
  const newProject = {
    ...project,
    id: Date.now().toString(),
  }
  
  projects.push(newProject)
  await writeData(projects)
  
  return NextResponse.json(newProject)
}

export async function PUT(request: Request) {
  const project = await request.json()
  const projects = await readData()
  
  const index = projects.findIndex((p) => p.id === project.id)
  if (index === -1) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }
  
  projects[index] = project
  await writeData(projects)
  
  return NextResponse.json(project)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  const projects = await readData()
  const filtered = projects.filter((p) => p.id !== id)
  await writeData(filtered)
  
  return NextResponse.json({ success: true })
} 