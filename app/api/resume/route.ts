import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET resume data OR download the PDF
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download");

    const resume = await prisma.resume.findFirst();

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // If 'download=true' query param is present, return the PDF file
    if (download === "true") {
      if (!resume.pdfFileData || !resume.contentType) {
        return NextResponse.json({ error: "No PDF file found for this resume" }, { status: 404 });
      }
      const buffer = Buffer.from(resume.pdfFileData, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': resume.contentType,
          'Content-Disposition': `attachment; filename="${resume.pdfFileName || 'resume.pdf'}"`,
        },
      });
    }

    // Otherwise, return the resume data
    // Note: several fields are stored as JSON strings. The client will need to parse them.
    return NextResponse.json(resume);

  } catch (error) {
    console.error("Failed to fetch resume data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}


// UPSERT (create or update) the resume data
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File | null;
    const resumeDataString = formData.get("resumeData") as string;

    if (!resumeDataString) {
      return NextResponse.json({ error: "Resume data is missing" }, { status: 400 });
    }

    const resumeData = JSON.parse(resumeDataString);

    const data: any = {
      personalInfo: resumeData.personalInfo || '{}',
      summary: resumeData.summary || "",
      education: resumeData.education || '[]',
      experience: resumeData.experience || '[]',
    };

    if (pdfFile) {
      const buffer = await pdfFile.arrayBuffer();
      data.pdfFileData = Buffer.from(buffer).toString('base64');
      data.pdfFileName = pdfFile.name;
      data.contentType = pdfFile.type;
    }

    const existingResume = await prisma.resume.findFirst();

    const upsertedResume = await prisma.resume.upsert({
      where: { id: existingResume?.id || "" },
      update: data,
      create: data,
    });

    revalidatePath('/resume');

    return NextResponse.json(upsertedResume);
  } catch (error) {
    console.error("Failed to update resume:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update resume" },
      { status: 500 }
    );
  }
}
