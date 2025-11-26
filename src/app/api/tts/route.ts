import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get the Google Cloud API key from environment
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Cloud API key is not configured. Please set GOOGLE_CLOUD_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    // Initialize the client with API key
    const client = new TextToSpeechClient({
      apiKey,
    });

    // Build the text-to-speech request
    const ttsRequest = {
      input: { text },
      // Select a male voice (en-US-Wavenet-D is a male voice)
      voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-D", // Male voice
        ssmlGender: "MALE" as const,
      },
      // Select the type of audio encoding
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate: 1.0,
        pitch: 0,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(ttsRequest);

    if (!response.audioContent) {
      return NextResponse.json(
        { error: "Failed to synthesize speech" },
        { status: 500 }
      );
    }

    // Convert the audio content to base64
    const audioBase64 = Buffer.from(response.audioContent).toString("base64");

    return NextResponse.json({
      audioContent: audioBase64,
      contentType: "audio/mp3",
    });
  } catch (error) {
    console.error("Error in /api/tts:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again." },
      { status: 500 }
    );
  }
}
