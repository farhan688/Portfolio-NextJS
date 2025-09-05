import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET the about page data (singleton)
export async function GET() {
  try {
    const about = await prisma.about.findFirst();
    // If no data, return a default object to prevent frontend errors
    if (!about) {
      return NextResponse.json({
        id: "",
        title: "",
        description: "",
        imageUrl: "",
        socialLinks: "{}", // Return as a stringified JSON object
      });
    }
    return NextResponse.json(about);
  } catch (error) {
    console.error("Failed to fetch about data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// UPSERT (create or update) the about page data
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // socialLinks is received as a JSON string and stored as a string
    const socialLinks = formData.get("socialLinks") as string;
    const imageFile = formData.get("image") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string;

    let imageUrl = existingImageUrl;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    const data = {
      title,
      description,
      socialLinks,
      imageUrl,
    };

    // Since it's a singleton, we find the first record to get its ID, or create a new one.
    const existingAbout = await prisma.about.findFirst();

    const upsertedAbout = await prisma.about.upsert({
      where: { id: existingAbout?.id || "" },
      update: data,
      create: data,
    });

    return NextResponse.json(upsertedAbout);
  } catch (error) {
    console.error("Failed to update about data:", error);
    return NextResponse.json(
      { error: "Failed to update about data" },
      { status: 500 }
    );
  }
}
