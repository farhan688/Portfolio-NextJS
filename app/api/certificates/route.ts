import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all certificates
export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// CREATE a new certificate
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const organization = formData.get("organization") as string;
    const dateString = formData.get("date") as string;
    const credentialUrl = formData.get("credentialUrl") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    const newCertificate = await prisma.certificate.create({
      data: {
        title,
        organization,
        date: new Date(dateString),
        credentialUrl,
        imageUrl,
      },
    });

    return NextResponse.json(newCertificate, { status: 201 });
  } catch (error) {
    console.error("Failed to create certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}

// UPDATE an existing certificate
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get("_id") as string;
    const title = formData.get("title") as string;
    const organization = formData.get("organization") as string;
    const dateString = formData.get("date") as string;
    const credentialUrl = formData.get("credentialUrl") as string;
    const imageFile = formData.get("image") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string;

    if (!id) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 });
    }

    let imageUrl = existingImageUrl;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        title,
        organization,
        date: new Date(dateString),
        credentialUrl,
        imageUrl,
      },
    });

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error("Failed to update certificate:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    );
  }
}

// DELETE a certificate
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.certificate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete certificate:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
