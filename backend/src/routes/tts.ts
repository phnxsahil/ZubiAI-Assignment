import { Router } from 'express';

const router = Router();

router.post('/synthesize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({ 
      audio: `data:audio/mpeg;base64,${base64Audio}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to synthesize speech'
    });
  }
});

export { router as ttsRouter };
