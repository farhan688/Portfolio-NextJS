import { NextResponse } from "next/server"
import { ContactMessage } from "@/app/types"
import fs from "fs/promises"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "contact.json")

async function readData(): Promise<ContactMessage[]> {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeData(data: ContactMessage[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
}

export async function POST(request: Request) {
  try {
    const message = await request.json()
    const messages = await readData()
    
    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...message
    }
    
    messages.push(newMessage)
    await writeData(messages)
    
    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}