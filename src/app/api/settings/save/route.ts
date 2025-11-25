import { NextRequest, NextResponse } from "next/server";
import { saveSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    // Verify admin password
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { knowledgeBase, geminiApiKey } = await request.json();

    await saveSettings({
      knowledgeBase: knowledgeBase || "",
      geminiApiKey: geminiApiKey || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
