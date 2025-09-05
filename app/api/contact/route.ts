import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";

// Function to get Twilio client, ensures credentials are set
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials are not defined. Skipping WhatsApp notification.");
    return null;
  }
  return twilio(accountSid, authToken);
};

// GET all contact messages
export async function GET() {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// CREATE a new message and send notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Save message to database
    const newMessage = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    // Send WhatsApp notification via Twilio
    const twilioClient = getTwilioClient();
    if (twilioClient && process.env.TWILIO_WHATSAPP_FROM && process.env.TWILIO_WHATSAPP_TO) {
      const whatsappMessage = `
New Contact Form Submission:
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Message: ${message}
      `.trim();

      try {
        await twilioClient.messages.create({
          body: whatsappMessage,
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: process.env.TWILIO_WHATSAPP_TO,
        });
      } catch (twilioError) {
        // Log the error but don't fail the request if Twilio fails
        console.error("Twilio error:", twilioError);
      }
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// DELETE a message
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete message:", error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
