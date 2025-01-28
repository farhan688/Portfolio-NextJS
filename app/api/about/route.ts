import { NextResponse } from "next/server"
import { About } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "about.json")

async function readData(): Promise<About> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return {
      id: "1",
      title: "",
      description: "",
      socialLinks: {}
    }
  }
}

async function writeData(data: About): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const about = await request.json()
  await writeData(about)
  return NextResponse.json(about)
} 