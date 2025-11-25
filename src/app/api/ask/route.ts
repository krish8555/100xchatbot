import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get settings from storage
    const settings = await getSettings();

    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    const knowledgeBase =
      settings.knowledgeBase || process.env.KNOWLEDGE_BASE || "";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please set it in the admin panel.",
        },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the system prompt
    const systemPrompt = `SYSTEM INSTRUCTIONS:
You are a voice assistant representing a job candidate in an interview setting.
You must use the following knowledge base to answer all questions about the candidate:

${knowledgeBase}

Rules:
- Do NOT break character. You ARE the candidate.
- Never say you are an AI or assistant.
- Answer interview questions naturally and confidently as yourself.
- Keep responses concise and conversational since they will be spoken aloud.
- Use natural speech patterns and be personable.
- Highlight relevant skills, experiences, and achievements when appropriate.
- Be honest and authentic in your responses.`;

    // Create the chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will respond as the candidate naturally based on my background and experience.",
            },
          ],
        },
      ],
    });

    // Send the message
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
