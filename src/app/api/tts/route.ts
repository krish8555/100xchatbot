import { NextRequest, NextResponse } from "next/server";

// Camb.AI API Configuration
const CAMB_AI_API_BASE_URL = "https://client.camb.ai/apis";
const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 30; // 60 seconds max wait time

// Voice and Language Configuration
const DEFAULT_VOICE_ID = 20037; // English male voice
const LANGUAGE_ENGLISH = 1;
const GENDER_MALE = 1;

// Task Status Constants
const STATUS_SUCCESS = "SUCCESS";
const STATUS_FAILED = "FAILED";
const STATUS_ERROR = "ERROR";

// Camb.AI API response types
interface TaskResponse {
  task_id: string;
}

interface StatusResponse {
  status: string;
  run_id?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get the Camb.AI API key from environment
    const apiKey = process.env.CAMB_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Camb.AI API key is not configured. Please set CAMB_AI_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    // Step 1: Create TTS task
    const ttsPayload = {
      text,
      voice_id: DEFAULT_VOICE_ID,
      language: LANGUAGE_ENGLISH,
      gender: GENDER_MALE,
    };

    const createResponse = await fetch(`${CAMB_AI_API_BASE_URL}/tts`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ttsPayload),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Camb.AI TTS create error:", errorText);
      return NextResponse.json(
        { error: "Failed to create TTS task" },
        { status: 500 }
      );
    }

    const taskData: TaskResponse = await createResponse.json();
    const taskId = taskData.task_id;

    // Step 2: Poll for completion
    let runId: number | null = null;
    let attempts = 0;

    while (attempts < MAX_POLLING_ATTEMPTS) {
      const statusResponse = await fetch(
        `${CAMB_AI_API_BASE_URL}/tts/${taskId}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
          },
        }
      );

      if (!statusResponse.ok) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        continue;
      }

      const statusData: StatusResponse = await statusResponse.json();

      if (statusData.status === STATUS_SUCCESS && statusData.run_id) {
        runId = statusData.run_id;
        break;
      }

      if (statusData.status === STATUS_FAILED || statusData.status === STATUS_ERROR) {
        return NextResponse.json(
          { error: "TTS task failed" },
          { status: 500 }
        );
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    if (!runId) {
      return NextResponse.json(
        { error: "TTS task timed out" },
        { status: 500 }
      );
    }

    // Step 3: Get the audio result
    const audioResponse = await fetch(
      `${CAMB_AI_API_BASE_URL}/tts-result/${runId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error("Camb.AI TTS result error:", errorText);
      return NextResponse.json(
        { error: "Failed to retrieve TTS result" },
        { status: 500 }
      );
    }

    // Get the audio as a buffer
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    // Camb.AI returns audio in WAV format by default
    return NextResponse.json({
      audioContent: audioBase64,
      contentType: "audio/wav",
    });
  } catch (error) {
    console.error("Error in /api/tts:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again." },
      { status: 500 }
    );
  }
}
