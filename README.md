# Storytime with Sunny

A real-time AI conversation app where kids can talk with an AI about images. Built with React, Node.js, Gemini AI, and ElevenLabs voice.

## Features

- **Voice Conversation:** Talk naturally with the AI about images
- **AI Vision:** Gemini AI can actually see and describe images
- **Interactive Effects:** Animations triggered by the conversation (stars, sparkles)
- **Natural Voice:** High-quality text-to-speech responses
- **Real-time:** Live transcription and instant responses

## Quick Start

**1. Install:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**2. Set up API keys in `backend/.env`:**
```env
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

**3. Run:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**4. Open:** http://localhost:5173

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript  
**AI:** Google Gemini (vision & chat), ElevenLabs (voice)
