import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const parsedProjects = projects.map(project => ({
      ...project,
      techStack: JSON.parse(project.techStack),
    }));
    return NextResponse.json(parsedProjects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// CREATE a new project
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // techStack is received as a JSON string and stored as a string
    const techStack = formData.get("techStack") as string;
    const demoUrl = formData.get("demoUrl") as string;
    const repoUrl = formData.get("repoUrl") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !description || !techStack) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        techStack, // Stored as a string
        imageUrl,
        demoUrl,
        repoUrl,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// UPDATE an existing project
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get("_id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // techStack is received as a JSON string and stored as a string
    const techStack = formData.get("techStack") as string;
    const demoUrl = formData.get("demoUrl") as string;
    const repoUrl = formData.get("repoUrl") as string;
    const imageFile = formData.get("image") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    let imageUrl = existingImageUrl;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        techStack, // Stored as a string
        imageUrl,
        demoUrl,
        repoUrl,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Failed to update project:", error);
    // Prisma's P2025 error code is for "not found"
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete project:", error);
    // Prisma's P2025 error code is for "not found"
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
