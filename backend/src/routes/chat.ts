import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/message', async (req, res) => {
  try {
    const { message, imageData, conversationHistory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // Build conversation context
    const history = conversationHistory || [];
    
    // Create chat with history
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    // Send message (with or without image)
    let result;
    if (imageData) {
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data URL prefix
          mimeType: 'image/jpeg'
        }
      };
      result = await chat.sendMessage([message, imagePart]);
    } else {
      result = await chat.sendMessage(message);
    }

    const response = await result.response;
    const text = response.text();

    res.json({ 
      message: text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process message'
    });
  }
});

export { router as chatRouter };
