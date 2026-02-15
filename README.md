# Storytime with Sunny

An interactive AI conversation app for children featuring real-time voice chat, image analysis, and text-to-speech capabilities.

## 🏗️ Project Structure

```
ZubiAi-Assignment/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── routes/  # API endpoints
│   │   └── server.ts
│   ├── package.json
│   └── .env         # Backend environment variables
│
├── frontend/         # React/Vite client application
│   ├── src/
│   │   ├── app/    # Main app components
│   │   ├── services/ # API service layer
│   │   └── styles/  # CSS and theme files
│   ├── package.json
│   └── .env         # Frontend environment variables
│
└── README.md        # This file
```

## ✨ Features

- **Voice Interaction**: Real-time speech recognition and synthesis
- **AI Vision**: Gemini AI analyzes images and engages kids in conversation
- **Text-to-Speech**: Natural-sounding voice responses via ElevenLabs
- **Interactive Effects**: Animated reactions, sparkles, and visual filters
- **Child-Friendly**: Colorful, engaging UI designed for kids

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- ElevenLabs API key from [ElevenLabs](https://elevenlabs.io)

### Installation

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

### Configuration

1. **Configure backend** (`backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

2. **Configure frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

2. **Start the frontend** (in a new terminal):
```bash
cd frontend
npm run dev
```

3. **Open your browser** to [http://localhost:5173](http://localhost:5173)

## 📡 API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `POST /api/chat/message` - Send message to AI
- `POST /api/tts/synthesize` - Convert text to speech

## 🛠️ Development

### Backend

```bash
cd backend
npm run dev      # Start development server with auto-reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🏗️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Google Generative AI (Gemini)
- ElevenLabs TTS API

### Frontend
- React 18
- TypeScript
- Vite
- Material-UI & Radix UI
- Tailwind CSS
- Motion (Framer Motion)

## 🔒 Security Notes

- API keys are stored server-side in the backend
- Frontend communicates with backend via REST API
- CORS is configured for local development
- Never expose API keys in frontend code

## 📝 License

This is a demonstration project for educational purposes.

## 🤝 Contributing

This is a personal project, but feel free to fork and experiment!

## 📧 Support

For issues or questions, please open an issue in the repository.
