interface Settings {
  knowledgeBase: string;
  geminiApiKey: string;
}

// In-memory cache for runtime settings (will reset on cold starts in serverless)
let runtimeSettings: Settings | null = null;

// Check if we're in a serverless/read-only environment (like Vercel)
const isServerless =
  process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

export async function getSettings(): Promise<Settings> {
  // If we have runtime settings cached, use them
  if (runtimeSettings) {
    return runtimeSettings;
  }

  // For serverless environments, only use environment variables
  if (isServerless) {
    return {
      knowledgeBase: process.env.KNOWLEDGE_BASE || "",
      geminiApiKey: process.env.GEMINI_API_KEY || "",
    };
  }

  // For local development, try to read from file system
  try {
    const fs = await import("fs");
    const path = await import("path");
    const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading settings from file:", error);
  }

  // Fallback to environment variables
  return {
    knowledgeBase: process.env.KNOWLEDGE_BASE || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  // Always cache in memory for the current runtime
  runtimeSettings = settings;

  // For serverless environments, we can only use runtime cache
  // Settings will need to be persisted via environment variables in Vercel dashboard
  if (isServerless) {
    console.log("Running in serverless mode - settings cached in memory only");
    console.log(
      "To persist settings, update environment variables in Vercel dashboard"
    );
    return;
  }

  // For local development, also save to file system
  try {
    const fs = await import("fs");
    const path = await import("path");
    const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving settings to file:", error);
    // Don't throw in serverless - we still have the runtime cache
    if (!isServerless) {
      throw error;
    }
  }
}
