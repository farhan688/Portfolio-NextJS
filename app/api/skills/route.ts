import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        category: "asc",
      },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// CREATE a new skill
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category } = body;

    if (!name || !category) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSkill = await prisma.skill.create({
      data: {
        name,
        category,
      },
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error("Failed to create skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

// UPDATE an existing skill
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name,
        category,
      },
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error("Failed to update skill:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE a skill
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}