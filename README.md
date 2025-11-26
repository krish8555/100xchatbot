# 🎙️ Voice Chatbot

A voice-enabled personality chatbot built with Next.js 14 that responds exactly like you, based on a customizable knowledge base.

## ✨ Features

- **Voice Input/Output**: Big microphone button with smooth pulse animation
- **Speech-to-Text**: Converts your voice to text using Web Speech API
- **Text-to-Speech**: Bot responses are spoken aloud
- **Chat History**: All conversations displayed in beautiful chat bubbles
- **Dark Mode**: Toggle between light and dark themes
- **Admin Panel**: Password-protected settings page
- **Gemini AI**: Powered by Google's Gemini 2.0 Flash model

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your values:

```env
# Required: Set a secure admin password
ADMIN_PASSWORD=your-secure-password-here

# Optional: Set a default Gemini API key (can also be set via admin panel)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public voice chatbot page
│   ├── layout.tsx            # Root layout with theme provider
│   ├── globals.css           # Global styles with Tailwind
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard (password protected)
│   └── api/
│       ├── ask/
│       │   └── route.ts      # Gemini AI chat endpoint
│       ├── auth/
│       │   └── route.ts      # Admin authentication
│       └── settings/
│           ├── get/
│           │   └── route.ts  # Get current settings
│           └── save/
│               └── route.ts  # Save settings (authenticated)
├── components/
│   ├── ChatBubble.tsx        # Chat message bubbles
│   ├── MicrophoneButton.tsx  # Animated mic button
│   ├── ThemeProvider.tsx     # Dark mode context
│   ├── ThemeToggle.tsx       # Light/dark toggle button
│   └── Toast.tsx             # Notification toasts
├── hooks/
│   ├── useSpeechRecognition.ts  # Voice-to-text hook
│   └── useSpeechSynthesis.ts    # Text-to-voice hook
└── lib/
    └── settings.ts           # Settings storage utilities
```

## 🔐 Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

### Features:
- **Password Login**: Protected by `ADMIN_PASSWORD` environment variable
- **Knowledge Base**: Customize what the chatbot knows about you
- **API Key Management**: Set/update your Gemini API key
- **Settings Preview**: See your current configuration

### Default Credentials:
- Password: `admin123` (change this in production!)

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your admin panel or `.env.local`

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/voice-chatbot.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `ADMIN_PASSWORD`: Your secure admin password
   - `GEMINI_API_KEY`: Your Gemini API key (optional, can be set via admin)
4. Deploy!

### Important Notes for Production:

- **Change the default password** in your environment variables
- The settings are stored in a JSON file (`data/settings.json`) - for production, consider using:
  - Vercel KV
  - Vercel Postgres
  - Any database of your choice
- The current file-based storage works on Vercel but data may not persist between deployments

## 🎨 Customization

### Modify the System Prompt

Edit `src/app/api/ask/route.ts` to change how the AI responds:

```typescript
const systemPrompt = `SYSTEM INSTRUCTIONS:
You are a voice assistant that responds exactly as the user "John Pate".
// ... customize your prompt here
`;
```

### Change Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
},
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.0 Flash
- **Speech**: Web Speech API
- **Language**: TypeScript

## 📝 License

MIT License - Feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
