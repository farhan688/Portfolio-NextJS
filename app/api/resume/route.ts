import { NextResponse } from "next/server"
import { Resume } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "resume.json")

async function readData(): Promise<Resume> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return {
      id: "1",
      personalInfo: {
        name: "",
        email: "",
        location: "",
        linkedin: ""
      },
      summary: "",
      education: [],
      experience: [],
      pdfUrl: ""
    }
  }
}

async function writeData(data: Resume): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const resume = await request.json()
  await writeData(resume)
  return NextResponse.json(resume)
} 