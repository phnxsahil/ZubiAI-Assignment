# Quick Start Guide

## Prerequisites

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **API Keys:**
  - Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - ElevenLabs API key from [ElevenLabs](https://elevenlabs.io)

## Setup (First Time)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend  
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**

Copy the example and add your keys:

```bash
cd backend
cp .env.example .env
```

Then edit `.env` with your API keys:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Get from https://elevenlabs.io
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

**Frontend (`frontend/.env`):**

Already configured for local development - no changes needed!

```env
VITE_API_URL=http://localhost:3001
```

## Running the Application

### Option 1: Manual (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `🚀 Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173`

### Option 2: Using the Root Scripts

From the project root:

```bash
# Terminal 1
npm run dev:backend

# Terminal 2 (in a new terminal)
npm run dev:frontend
```

## Accessing the Application

1. Open your browser to: [http://localhost:5173](http://localhost:5173)
2. Click "Start Talking with Sunny!"
3. Allow microphone access when prompted
4. Start chatting!

## Troubleshooting

### Backend Not Starting

**Error:** `Please set GEMINI_API_KEY`
- Solution: Add your API keys to `backend/.env`

**Error:** `Port 3001 already in use`
- Solution: Kill the process using port 3001 or change PORT in `.env`

```bash
# Windows - Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=3002
```

### Frontend Can't Connect to Backend

**Error:** `Failed to fetch` or network errors
- Solution: Make sure backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`

### Microphone Not Working

**Error:** `Please allow microphone access`
- Chrome/Edge: Click the lock icon in address bar → Site settings → Microphone
- Ensure browser has microphone permissions
- Try refreshing the page

### TypeScript Errors

```bash
# Backend
cd backend
npx tsc --noEmit

# Frontend
cd frontend
npx tsc --noEmit
```

## Development Workflow

### Making Backend Changes

1. Edit files in `backend/src/`
2. Server auto-reloads (watch mode)
3. Check terminal for errors

### Making Frontend Changes

1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. Changes appear instantly in browser

### Adding New Dependencies

**Backend:**
```bash
cd backend
npm install package-name
npm install --save-dev @types/package-name  # For TypeScript types
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

Outputs compiled JavaScript to `backend/dist/`

### Frontend

```bash
cd frontend
npm run build
```

Outputs optimized static files to `frontend/dist/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

## API Documentation

### Health Check
```bash
curl http://localhost:3001/health
```

### Send Message
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "conversationHistory": [],
    "imageData": "data:image/jpeg;base64,..."
  }'
```

### Synthesize Speech
```bash
curl -X POST http://localhost:3001/api/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.ts      # AI chat endpoint
│   │   │   └── tts.ts       # Text-to-speech endpoint
│   │   └── server.ts        # Express server setup
│   ├── .env                 # Your API keys (DO NOT COMMIT)
│   └── package.json
│
├── frontend/
│   ├──  src/
│   │   ├── app/
│   │   │   ├── components/  # React components
│   │   │   ├── styles/      # CSS and themes
│   │   │   └── App.tsx      # Main app
│   │   ├── services/
│   │   │   └── api.ts       # Backend API service
│   │   └── main.tsx         # Entry point
│   ├── .env                 # Backend URL config
│   └── package.json
│
└── README.md                # This file
```

## Need Help?

- Check [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) for architecture details
- Review the main [README.md](./README.md) for full documentation
- Open an issue if you encounter problems

## Tips

1. **Keep both terminals open** - You need both backend and frontend running
2. **Check backend terminal first** - Most errors come from backend
3. **Refresh browser** - If frontend seems stuck
4. **Clear cache** - `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
5. **Check console** - Browser DevTools (F12) for frontend errors

Happy coding! 🚀
