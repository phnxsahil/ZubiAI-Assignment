/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

export interface TTSResponse {
  audio: string;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    imageData?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        imageData,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  async synthesizeSpeech(text: string): Promise<TTSResponse> {
    const response = await fetch(`${this.baseUrl}/api/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to synthesize speech');
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const apiService = new ApiService();
