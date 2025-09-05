import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all experiences
export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
    // Note: description is stored as a JSON string. The client will need to parse it.
    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// CREATE a new experience
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, company, startDate, endDate, description } = body;

    if (!role || !company || !startDate || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newExperience = await prisma.experience.create({
      data: {
        role,
        company,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        // Convert array to JSON string before saving
        description: JSON.stringify(description),
      },
    });

    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Failed to create experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}

// UPDATE an existing experience
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, role, company, startDate, endDate, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Experience ID is required" }, { status: 400 });
    }

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        role,
        company,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        // Convert array to JSON string before saving
        description: JSON.stringify(description),
      },
    });

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Failed to update experience:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE an experience
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.experience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete experience:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}