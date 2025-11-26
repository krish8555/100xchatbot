import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let message: string = "";
    let audioData: string | null = null;
    let audioMimeType: string | null = null;

    // Check if it's a multipart form (audio) or JSON (text)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audioFile = formData.get("audio") as File | null;
      message = formData.get("message") as string || "";
      
      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        audioData = Buffer.from(arrayBuffer).toString("base64");
        audioMimeType = audioFile.type || "audio/webm";
      }
    } else {
      const json = await request.json();
      message = json.message;
    }

    if (!message && !audioData) {
      return NextResponse.json(
        { error: "Message or audio is required" },
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the system prompt
    const systemPrompt = `SYSTEM INSTRUCTIONS:
You are a voice assistant representing a job candidate in an interview setting.
You must ONLY use the following knowledge base to answer questions:

${knowledgeBase}

STRICT RULES:
- Do NOT break character. You ARE the candidate.
- Never say you are an AI, assistant, or language model.
- ONLY answer questions related to:
  * Job interviews and hiring processes
  * Your professional experience, skills, and qualifications
  * Your education and certifications
  * Your career goals and motivations
  * Work-related scenarios and behavioral questions
  * Anything directly mentioned in your knowledge base above
- For ANY question that is NOT related to interviews, hiring, or your professional background, politely redirect by saying something like: "I'd prefer to keep our conversation focused on the interview. Is there anything about my qualifications or experience you'd like to know?"
- Do NOT answer questions about:
  * General knowledge, trivia, or random topics
  * Personal opinions on politics, religion, or controversial subjects
  * Anything not relevant to a job interview context
- Keep responses concise and conversational since they will be spoken aloud.
- Use natural speech patterns and be personable.
- Highlight relevant skills, experiences, and achievements when appropriate.
- Be honest and authentic in your responses.`;

    // Build the message parts
    const messageParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    
    // Add audio if present
    if (audioData && audioMimeType) {
      messageParts.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioData,
        },
      });
      // Add instruction to process the audio
      messageParts.push({
        text: message || "Please listen to this audio and respond to what was said.",
      });
    } else {
      messageParts.push({ text: message });
    }

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

    // Send the message (with audio if present)
    const result = await chat.sendMessage(messageParts);
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
