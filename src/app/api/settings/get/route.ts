import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSettings();

    // Don't expose the full API key, just indicate if it's set
    return NextResponse.json({
      knowledgeBase: settings.knowledgeBase || "",
      hasApiKey: !!settings.geminiApiKey,
      geminiApiKey: settings.geminiApiKey
        ? "••••••••" + settings.geminiApiKey.slice(-4)
        : "",
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}
