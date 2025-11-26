"use client";

import { useState, useEffect, useCallback } from "react";
import { Toast } from "@/components/Toast";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/get");
      const data = await response.json();
      setKnowledgeBase(data.knowledgeBase || "");
      if (data.hasApiKey) {
        setGeminiApiKey(data.geminiApiKey || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  useEffect(() => {
    // Check if already authenticated (from session storage)
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      loadSettings();
    }
  }, [loadSettings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        sessionStorage.setItem("adminToken", data.token);
        loadSettings();
        setToast({ message: "Login successful!", type: "success" });
      } else {
        setToast({ message: data.error || "Invalid password", type: "error" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setToast({ message: "Login failed. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          knowledgeBase,
          geminiApiKey: geminiApiKey.startsWith("••••")
            ? undefined
            : geminiApiKey,
        }),
      });

      if (response.ok) {
        setToast({ message: "Settings saved successfully!", type: "success" });
      } else {
        const data = await response.json();
        setToast({
          message: data.error || "Failed to save settings",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setToast({
        message: "Failed to save settings. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken("");
    setPassword("");
    sessionStorage.removeItem("adminToken");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Admin Login
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Enter your password to continue
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-blue-500 hover:text-blue-600 text-sm">
                ← Back to Interview
              </a>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          ⚙️ Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Settings Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Knowledge Base */}
          <div className="mb-8">
            <label
              htmlFor="knowledgeBase"
              className="block text-lg font-semibold text-gray-800 dark:text-white mb-3"
            >
              💼 Candidate Profile & Experience
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Enter your professional background, skills, and experience that
              interviewers should know about.
            </p>
            <textarea
              id="knowledgeBase"
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
              placeholder="Example:
My name is [Your Name].
I am a [Job Title] with [X] years of experience.
My technical skills include: React, Node.js, Python, AWS...
Previous companies: [Company 1], [Company 2]...
Key achievements: Led a team of 5, increased revenue by 30%...
Education: BS in Computer Science from [University]...
Why I'm interested in this role: [Your motivation]...
..."
            />
          </div>

          {/* Gemini API Key */}
          <div className="mb-8">
            <label
              htmlFor="apiKey"
              className="block text-lg font-semibold text-gray-800 dark:text-white mb-3"
            >
              🔑 Gemini API Key
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get your API key from{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                Google AI Studio
              </a>
            </p>
            <input
              type="password"
              id="apiKey"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your Gemini API key"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <a href="/" className="text-blue-500 hover:text-blue-600">
              ← Back to Interview
            </a>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
            >
              {isLoading ? "Saving..." : "💾 Save Settings"}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Interview Tips
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Include your work experience, projects, and achievements</li>
            <li>
              • Add answers to common interview questions (e.g., &quot;Tell me about
              yourself&quot;)
            </li>
            <li>• Mention your technical skills and certifications</li>
            <li>
              • Include your career goals and why you&apos;re interested in the role
            </li>
            <li>• The more detailed your profile, the better the responses</li>
          </ul>
        </div>

        {/* Vercel Notice */}
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            ⚠️ Vercel Deployment Note
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            On Vercel, settings saved here are temporary and will reset on cold
            starts. For permanent settings, configure{" "}
            <strong>GEMINI_API_KEY</strong>, <strong>KNOWLEDGE_BASE</strong>,
            and <strong>ADMIN_PASSWORD</strong> as environment variables in your
            Vercel project dashboard.
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
