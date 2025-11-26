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

  // Default hardcoded knowledge base about Krish Kalpesh Patel
  const defaultKnowledgeBase = `Krish Kalpesh Patel is a Computer Science Engineer from INDUS University (CGPA 8.6) who has built a diversified skill set across full-stack development, AI/ML, data science, and cloud technologies. Alongside technical depth, he has developed strong project management, team leadership, and communication skills through internships, hackathons, and leading real-world development teams. His journey reflects curiosity, rapid learning, and responsibility. A fast-learning software engineer with strong project management instincts—capable of planning, organizing, leading teams, coordinating tasks, and delivering end-to-end technical solutions. Known for clear communication, structured thinking, and the ability to turn ideas into actual working products. Core strengths include fast learning, quick building, project planning, strong communication, coordination skills, problem-solving mindset, team leadership, reliability under pressure, end-to-end development ability, and an ownership mindset. His superpower is the combination of learning fast and managing/executing projects efficiently—breaking problems down, planning clearly, communicating well, guiding teams, and delivering working products quickly. His top growth areas are advanced system design, cloud architecture, and leading larger cross-functional teams. A common misconception is that he is quiet or reserved, but in reality he observes first, plans clearly, and communicates effectively when needed; his calm nature helps in leadership and conflict resolution. He pushes his limits by taking leadership roles, managing multi-person projects, accepting responsibilities outside comfort zone, doing end-to-end delivery, and performing under hackathon pressure. His project management strengths include planning and scheduling (breaking projects into tasks, timelines, assigning responsibilities, tracking progress with agile-style sprints), strong communication (clear verbal and written updates, simplifying technical concepts, good stakeholder communication), leadership (leading by example, encouraging teamwork, supporting weaker members, handling conflicts calmly), ownership (end-to-end responsibility, ensuring quality and timely delivery, solving blockers), and documentation (clear specs, PRs, planning notes). Experience: As team leader/project manager for the Inventory Management App (Jun 2025–Present), he leads a team building a Kotlin–Firebase inventory system, organizes tasks, assigns work, manages deadlines, uses Git and agile workflows, ensures clear communication, and maintains alignment across developers. At ABBACUS Technology (Jul 2025–Present), he coordinated with teammates while building RAG chatbots, worked on automation tools, communicated requirements clearly, and participated in workflow planning and QA. At Radix Software, he coordinated with designers to convert UI/UX into working components, ensured structured feedback cycles, and supported smooth development. As a GeeksforGeeks Campus Mantri, he managed events, coordinated students, organized workshops, and improved engagement through planning. Project knowledge base: In full-stack Java projects, he planned MVC architecture, managed database schema design, ensured smooth module integration, and delivered production-ready features. In the Tri Tools Utility Suite, he planned multiple tools, organized the design → build → deploy pipeline, and ensured mobile-first performance. In ML projects, he structured EDA, preprocessing, model-building workflows, documented the process, and presented clear findings. Communication summary: He is strong in verbal and written communication, can simplify complex concepts, is confident in meetings and demos, communicates effectively with designers, developers, and non-technical stakeholders, and maintains calm communication under pressure. Interview-ready PM+communication responses: His leadership style is based on clear planning, communication, and alignment while staying calm and supportive. Good communication example: In the Inventory App project, he ensured continuous clarity, handled blockers, managed task ownership, and ensured deadlines were met smoothly. Team management: He breaks work into tasks, assigns roles based on strengths, runs short status meetings, and keeps communication open. Conflict handling: He listens calmly, focuses on the problem rather than the person, and helps the team reach a collaborative solution. Final personality summary: A fast-learning engineer with strong project management skills, clear communication, end-to-end execution ability, and a calm leadership style.`;

  // Default hardcoded Gemini API key
  const defaultGeminiApiKey = "AIzaSyDaCMMmpq-p0Yktv9ZSkVRYJjqM4aXl52o";

  // For serverless environments, only use environment variables
  if (isServerless) {
    return {
      knowledgeBase: process.env.KNOWLEDGE_BASE || defaultKnowledgeBase,
      geminiApiKey: process.env.GEMINI_API_KEY || defaultGeminiApiKey,
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

  // Fallback to environment variables or hardcoded defaults
  return {
    knowledgeBase: process.env.KNOWLEDGE_BASE || defaultKnowledgeBase,
    geminiApiKey: process.env.GEMINI_API_KEY || defaultGeminiApiKey,
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
