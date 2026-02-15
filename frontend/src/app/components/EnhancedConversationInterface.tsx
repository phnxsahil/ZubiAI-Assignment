import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Star, Volume2, RefreshCw, Home, Loader2, StopCircle, Pause, Play } from 'lucide-react';
import { apiService } from '../../services/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cocomelonTheme } from '../styles/theme';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface EnhancedConversationInterfaceProps {
  onBackToHome: () => void;
}

import { CHILD_IMAGES } from '../constants/images';

export function EnhancedConversationInterface({ onBackToHome }: EnhancedConversationInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showStars, setShowStars] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [imageFilter, setImageFilter] = useState('none');
  const [backgroundColor, setBackgroundColor] = useState('#FFE66D');
  const [currentImage, setCurrentImage] = useState(CHILD_IMAGES[0].url);
  const [currentImageContext, setCurrentImageContext] = useState(CHILD_IMAGES[0].context);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aiImageDescription, setAiImageDescription] = useState('Click "Start Talking" to begin! 🎤');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [recognitionReady, setRecognitionReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentImageRef = useRef(CHILD_IMAGES[0].url);
  const currentImageContextRef = useRef(CHILD_IMAGES[0].context);
  const animationFrameRef = useRef<number | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to track state for speech recognition handlers
  const isListeningRef = useRef(isListening);
  const isConversationActiveRef = useRef(isConversationActive);
  const messagesRef = useRef(messages);
  const isProcessingRef = useRef(isProcessing);
  const isLoadingVoiceRef = useRef(isLoadingVoice);

  // Sync refs with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isConversationActiveRef.current = isConversationActive;
  }, [isConversationActive]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isLoadingVoiceRef.current = isLoadingVoice;
  }, [isLoadingVoice]);

  // Keep image refs in sync with state
  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

  useEffect(() => {
    currentImageContextRef.current = currentImageContext;
  }, [currentImageContext]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, transcribedText, isProcessing]);

  // Helper to proxy TMDB images through CORS-safe service
  const getProxiedImageUrl = (url: string): string => {
    if (url.startsWith('https://image.tmdb.org/')) {
      // Use weserv.nl as CORS proxy for TMDB images
      return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace('https://', ''))}`;
    }
    return url;
  };

  // Set initial image with proxy on mount
  useEffect(() => {
    setCurrentImage(getProxiedImageUrl(CHILD_IMAGES[0].url));
  }, []);

  // Backend API is ready - no client-side API keys needed!

  // Initialize Speech Recognition
  useEffect(() => {
    console.log('Initializing speech recognition...');

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      toast.error('Voice input not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Single utterance mode prevents echo
      recognition.interimResults = true; // Show what's being said in real-time
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        // ✅ CRITICAL: Ignore ALL speech while AI is speaking, processing, or loading voice
        if (isSpeakingRef.current || isProcessingRef.current || isLoadingVoiceRef.current) {
          setTranscribedText(''); // Clear any partial transcription
          try {
            recognition.abort(); // Force stop
          } catch (e) {
            // Ignore
          }
          return;
        }

        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        // Show interim results only if AI is not busy
        if (!isSpeakingRef.current && !isProcessingRef.current && !isLoadingVoiceRef.current) {
          setTranscribedText(transcript);
        }

        if (event.results[event.results.length - 1].isFinal) {
          // Double check AI is not speaking before processing
          if (isSpeakingRef.current || isProcessingRef.current || isLoadingVoiceRef.current) {
            setTranscribedText('');
            return;
          }
          console.log('✅ Final speech detected:', transcript);
          handleUserSpeech(transcript);
          setTranscribedText('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        // Provide specific error messages
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access and try again.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // console.log('🔇 [recognition.onerror] No speech detected, continuing to listen...'); // Keep this commented out if needed for future debug.
        } else if (event.error !== 'aborted') {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false); // Mark as not listening

        // ✅ CRITICAL: Only restart if AI is NOT busy and conversation is active
        if (isConversationActiveRef.current &&
            !isSpeakingRef.current &&
            !isProcessingRef.current &&
            !isLoadingVoiceRef.current) {
          // Restart after a longer delay to ensure no interruptions
          setTimeout(() => {
            if (isConversationActiveRef.current &&
                !isSpeakingRef.current &&
                !isProcessingRef.current &&
                !isLoadingVoiceRef.current) {
              try {
                recognition.start();
                setIsListening(true);
              } catch (error) {
                console.error('❌ [recognition.onend] Error auto-restarting recognition:', error);
              }
            }
          }, 1000); // Longer delay to prevent interrupting AI
        } else {
          //
        }
      };

      recognitionRef.current = recognition;
      setRecognitionReady(true);
      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      toast.error('Failed to initialize voice input');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Generate new image using Gemini AI
  // Generate new image
  const generateNewImage = async () => {
    if (isLoadingImage) {
      console.log('Image is already loading, skipping...');
      return; // Prevent multiple clicks while loading
    }

    setIsLoadingImage(true);

    // Get a different image than the current one
    let randomIndex;
    let attempts = 0;
    do {
      randomIndex = Math.floor(Math.random() * CHILD_IMAGES.length);
      attempts++;
    } while (randomIndex === currentImageIndex && attempts < 10 && CHILD_IMAGES.length > 1);

    const randomImage = CHILD_IMAGES[randomIndex];

    try {
      console.log('Loading new image:', randomImage.context);

      // Preload the image before switching (use proxy for TMDB images)
      const img = new Image();
      img.src = getProxiedImageUrl(randomImage.url);
      
      img.onload = async () => {
        // Update both state AND refs immediately after image loads (use proxied URL)
        setCurrentImage(getProxiedImageUrl(randomImage.url));
        setCurrentImageContext(randomImage.context);
        setCurrentImageIndex(randomIndex);
        setAiImageDescription('Let me look at this new picture...');
        currentImageRef.current = randomImage.url;
        currentImageContextRef.current = randomImage.context;

        // If conversation is active, AI analyzes the new image using its vision
        if (isConversationActive) {
          // Stop listening before AI speaks  
          stopListening();
          setIsProcessing(true);
          
          // Generate AI response about the new image using vision  
          await getAIResponse(
            "[SYSTEM: A new picture just appeared! Look at it with excitement and tell the child what you see! Ask them what they notice too!]",
            randomImage.url,
            randomImage.context
          );
          
          setIsProcessing(false);
        }

        setIsLoadingImage(false);
        toast.success('New picture loaded!');
      };

      img.onerror = () => {
        console.error('Image failed to load, trying direct URL:', randomImage.url);
        // Still update even if preload fails (use proxied URL)
        setCurrentImage(getProxiedImageUrl(randomImage.url));
        setCurrentImageContext(randomImage.context);
        setCurrentImageIndex(randomIndex);
        setAiImageDescription('Let me look at this new picture...');
        currentImageRef.current = randomImage.url;
        currentImageContextRef.current = randomImage.context;
        setIsLoadingImage(false);
        toast.info('New picture loaded!');
      };

      // Timeout after 3 seconds
      setTimeout(() => {
        if (isLoadingImage) {
          console.log('Image load timeout, proceeding anyway');
          img.onload = null;
          img.onerror = null;
          setCurrentImage(randomImage.url);
          setCurrentImageContext(randomImage.context);
          setCurrentImageIndex(randomIndex);
          currentImageRef.current = randomImage.url;
          currentImageContextRef.current = randomImage.context;
          setIsLoadingImage(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Error loading image:', error);
      toast.error('Could not load new image. Try again!');
      setIsLoadingImage(false);
    }
  };

  // Start the conversation
  const startConversation = async () => {
    console.log('Starting conversation...');
    console.log('Recognition ready:', recognitionReady);
    console.log('Recognition object:', recognitionRef.current);

    if (!recognitionReady || !recognitionRef.current) {
      toast.error('Voice input not ready. Please refresh the page.');
      console.error('Recognition not initialized');
      return;
    }

    // Request microphone permission explicitly
    console.log('Requesting microphone permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      // Stop the stream immediately, we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      toast.success('Microphone ready!');
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast.error('Please allow microphone access to start the conversation.');
      return;
    }

    setIsConversationActive(true);
    setMessages([]);
    setImageFilter('none');
    setAiImageDescription('AI is looking at the picture...');

    // AI initiates by looking at the current picture and starting the conversation
    // Simulate it as if the system is asking the AI to start
    setIsProcessing(true);
    await getAIResponse("[SYSTEM: Start the conversation! Look at the image and greet the child with excitement about what you see. Ask them what they notice!]");
    setIsProcessing(false);

    startListening();
  };

  // End the conversation
  const endConversation = () => {
    setIsConversationActive(false);
    stopListening();

    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setAudioLevel(0);
    setIsSpeaking(false);
    setAiImageDescription('Click "Start Talking" to begin again! 🎤');
    toast.success('Conversation completed! Great job!');
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      console.error('Recognition object not available');
      toast.error('Voice input not initialized');
      return;
    }

    // ✅ CRITICAL: Don't start if AI is busy
    if (isSpeakingRef.current || isProcessingRef.current || isLoadingVoiceRef.current) {
      return;
    }

    try {
      // Only start if not already running
      if (!isListeningRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        // Already listening, skipping start
      }
    } catch (error: any) {
      if (error.name !== 'InvalidStateError') {
        console.error('Error starting recognition:', error);
        toast.error(`Could not start listening: ${error.message}`);
      }
    }
  };

  // Stop listening - FORCE STOP with abort
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort(); // Use abort() instead of stop() for immediate termination
        setIsListening(false);
        setTranscribedText(''); // Clear any interim text
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  // Pause conversation
  const pauseConversation = () => {
    console.log('Pausing conversation...');
    setIsPaused(true);
    stopListening();
    toast.info('Conversation paused');
  };

  // Resume conversation
  const resumeConversation = () => {
    console.log('Resuming conversation...');
    setIsPaused(false);
    if (isConversationActive && !isSpeaking) {
      startListening();
      toast.success('Conversation resumed');
    }
  };

  // Handle user speech
  const handleUserSpeech = async (text: string) => {
    if (!text.trim() || !isConversationActiveRef.current) return;

    // Stop listening immediately when user finishes speaking
    stopListening();

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTranscribedText('');
    setIsProcessing(true);

    // ✅ Get AI response
    await getAIResponse(text);
    setIsProcessing(false);
  };

  // Smart rate limit handler that extracts and waits the exact time from API
  const handleRateLimitRetry = async (error: any): Promise<number> => {
    // Extract retry time from error message (e.g., "retry in 38.611512867s")
    const retryMatch = error?.message?.match(/retry in ([\d.]+)s/i);
    if (retryMatch) {
      const retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
      return retrySeconds;
    }
    return 60; // Default to 60 seconds if we can't parse
  };

  // Get AI response (with optional overrides for new images)
  const getAIResponse = async (userInput: string, imageUrlOverride?: string, imageContextOverride?: string) => {
    // Use overrides or current refs for image data
    const imageToFetch = imageUrlOverride || currentImageRef.current;
    const contextToUse = imageContextOverride || currentImageContextRef.current;

    try {
      // Convert conversation history to API format
      const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = messagesRef.current.map((msg) => ({
        role: msg.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: msg.content
      }));

      // Get image data if available
      let imageData: string | undefined;
      try {
        console.log('🖼️ Fetching image for vision:', imageToFetch);
        const proxiedUrl = imageToFetch.startsWith('https://image.tmdb.org/')
          ? `https://images.weserv.nl/?url=${encodeURIComponent(imageToFetch.replace('https://', ''))}`
          : imageToFetch;
        const imageResponse = await fetch(proxiedUrl);
        const imageBlob = await imageResponse.blob();
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageBlob);
        });
      } catch (error) {
        console.error('Error fetching image:', error);
        toast.error('Could not load image for AI vision.');
      }

      // Call backend API
      const response = await apiService.sendMessage(userInput, conversationHistory, imageData);
      const text = response.message;

      if (text) {
        // Extract description for UI
        const cleanText = text.replace(/\[SYSTEM:.*?\]/g, '').replace(/[🎉🎨😊✨🌟🔍💭🎯❤️💬📏👀]/g, '').trim();
        const firstSentence = cleanText.split(/[.!?]/)[0].trim();
        const description = firstSentence.substring(0, 120);
        
        if (description && description.length > 0) {
          setAiImageDescription(description + (cleanText.length > description.length ? '...' : ''));
        }
        
        await sendAIMessage(text);
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast.error('AI had trouble responding. Try again! 🔄');
      setAiImageDescription('⚠️ Error - try again');
    }
  };

  // Execute tool calls
  const executeToolCall = (toolName: string, args: any) => {
    switch (toolName) {
      case 'showStars':
        setShowStars(true);
        setTimeout(() => setShowStars(false), (args.duration || 3) * 1000);
        break;
      case 'showSparkles':
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), (args.duration || 3) * 1000);
        break;
      case 'changeImageFilter':
        setImageFilter(args.filter || 'none');
        break;
      case 'changeBackground':
        setBackgroundColor(args.color || '#FFE66D');
        break;
    }
  };

  // Send AI message with voice synthesis
  const sendAIMessage = async (text: string, shouldResumeListening: boolean = true) => {
    const aiMessage: Message = {
      role: 'ai',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    // FORCE STOP listening while AI speaks to prevent echo/feedback
    console.log('🛑 FORCE STOPPING speech recognition before AI speaks...');
    await stopListening();

    // Short delay to ensure mic is released
    await new Promise(resolve => setTimeout(resolve, 200));

    await speakWithTTS(text, shouldResumeListening);
  };

  // Analyze audio levels for visual feedback
  const analyzeAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level (0-1)
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = average / 255;
    
    setAudioLevel(normalizedLevel);
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  };

  // Cleanup audio analysis
  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  };

  // Text-to-Speech via backend API
  const speakWithTTS = async (text: string, shouldResumeListening: boolean = true) => {
    setIsLoadingVoice(true);
    setIsSpeaking(true);

    try {
      const response = await apiService.synthesizeSpeech(text);
      const audioUrl = response.audio;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Simple pulse animation
      pulseIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 0.5 + 0.3);
      }, 100);

      audio.onplay = () => {
        console.log('🔊 AI audio started playing');
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
            setIsListening(false);
            setTranscribedText('');
          } catch (e) {
            // Ignore errors
          }
        }
      };

      audio.onended = () => {
        console.log('🔊 AI audio playback ended');
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }
        setAudioLevel(0);
        setIsSpeaking(false);
        setIsLoadingVoice(false);

        // Resume listening after audio ends
        if (shouldResumeListening && isConversationActiveRef.current && !isPaused) {
          setTimeout(() => {
            if (isConversationActiveRef.current && !isPaused && !isSpeakingRef.current) {
              startListening();
            }
          }, 1800);
        }
      };

      audio.onerror = () => {
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }
        setAudioLevel(0);
        setIsSpeaking(false);
        setIsLoadingVoice(false);
        toast.error('Audio playback error');
      };

      await audio.play();
      setIsLoadingVoice(false);
    } catch (error) {
      console.error('ElevenLabs error:', error);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      setAudioLevel(0);
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      toast.error('Voice generation failed');
    }
  };

  // Get filter CSS
  const getFilterStyle = () => {
    switch (imageFilter) {
      case 'sepia': return 'sepia(80%)';
      case 'grayscale': return 'grayscale(100%)';
      case 'brightness': return 'brightness(1.3)';
      case 'blur': return 'blur(2px)';
      default: return 'none';
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-700 ease-in-out flex flex-col p-4 md:p-6 lg:p-8"
      style={{
        background: cocomelonTheme.colors.skyGradient,
      }}
    >  {/* Stars Effect */}
      <AnimatePresence>
        {showStars && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1.5, 0],
                  rotate: [0, 180, 360],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 2, delay: i * 0.1 }}
                className="absolute"
              >
                <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Sparkles Effect */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -100],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
                className="absolute"
              >
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Speaking Animation Circles */}
      <AnimatePresence>
        {isSpeaking && (
          <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500"
                animate={{
                  scale: [1, 1.5 + audioLevel * 0.5, 1],
                  opacity: [0.8, 0.2, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Middle ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-pink-500"
                animate={{
                  scale: [1, 1.3 + audioLevel * 0.4, 1],
                  opacity: [0.6, 0.3, 0.6],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
              
              {/* Center circle */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2 + audioLevel * 0.3, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3" style={{
            background: cocomelonTheme.colors.softWhite,
            padding: '16px 24px',
            borderRadius: cocomelonTheme.borderRadius.large,
            boxShadow: cocomelonTheme.shadows.soft,
          }}>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            <h1 className="text-2xl md:text-4xl font-black" style={{
              color: cocomelonTheme.colors.darkText,
              textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8)',
            }}>Picture Talk AI</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onBackToHome}
              variant="ghost"
              size="sm"
              style={{
                borderRadius: cocomelonTheme.borderRadius.medium,
                backgroundColor: cocomelonTheme.colors.lavender,
                color: cocomelonTheme.colors.darkText,
              }}
              className="font-bold gap-2 hover:scale-105 transition-transform"
            >
              <Home className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Home</span>
            </Button>

            {!isConversationActive && (
              <Button
                onClick={startConversation}
                size="sm"
                style={{
                  background: cocomelonTheme.colors.playfulGradient,
                  borderRadius: cocomelonTheme.borderRadius.xlarge,
                  padding: '12px 24px',
                  boxShadow: cocomelonTheme.shadows.soft,
                }}
                className="text-white font-bold gap-2 hover:scale-110 transition-all duration-300"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Start Talking</span>
                <span className="sm:hidden">Start</span>
              </Button>
            )}

            {isConversationActive && (
              <>
                <Button
                  onClick={isPaused ? resumeConversation : pauseConversation}
                  size="sm"
                  variant={isPaused ? "default" : "outline"}
                  style={{
                    background: isPaused ? cocomelonTheme.colors.success : cocomelonTheme.colors.warmYellow,
                    borderRadius: cocomelonTheme.borderRadius.xlarge,
                    padding: '12px 20px',
                    boxShadow: cocomelonTheme.shadows.soft,
                    color: cocomelonTheme.colors.darkText,
                  }}
                  className="font-bold gap-2 hover:scale-110 transition-all duration-300"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={endConversation}
                  size="sm"
                  variant="destructive"
                  style={{
                    background: cocomelonTheme.colors.coral,
                    borderRadius: cocomelonTheme.borderRadius.xlarge,
                    padding: '12px 20px',
                    boxShadow: cocomelonTheme.shadows.soft,
                  }}
                  className="font-bold gap-2 hover:scale-110 transition-all duration-300"
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">End</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content - Image-Centered Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Image Display - TAKES CENTER STAGE (3 of 5 columns on desktop) */}
          <Card style={{
            background: cocomelonTheme.colors.softWhite,
            borderRadius: cocomelonTheme.borderRadius.xlarge,
            padding: '20px',
            boxShadow: cocomelonTheme.shadows.medium,
          }} className="space-y-4 md:space-y-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 900,
                color: cocomelonTheme.colors.darkText,
              }}>🖼️ Today's Picture!</h2>
              <Button
                onClick={generateNewImage}
                disabled={isLoadingImage}
                size="sm"
                style={{
                  background: isLoadingImage ? cocomelonTheme.colors.lightText : cocomelonTheme.colors.mintGreen,
                  borderRadius: cocomelonTheme.borderRadius.large,
                  boxShadow: cocomelonTheme.shadows.soft,
                  color: cocomelonTheme.colors.darkText,
                }}
                className="font-bold hover:scale-105 transition-transform"
              >
                {isLoadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">New Image</span>
              </Button>
            </div>

            {/* HUGE Image with TV Frame Effect */}
            <div style={{
              position: 'relative',
              borderRadius: cocomelonTheme.borderRadius.xlarge,
              overflow: 'hidden',
              aspectRatio: '16/9',
              background: cocomelonTheme.colors.lavender,
              padding: '16px',
              boxShadow: `inset 0 0 0 8px ${cocomelonTheme.colors.softWhite}, inset 0 0 0 12px ${cocomelonTheme.colors.lavender}, ${cocomelonTheme.shadows.medium}`,
            }}>
              <div style={{
                borderRadius: cocomelonTheme.borderRadius.large,
                overflow: 'hidden',
                height: '100%',
                position: 'relative',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isLoadingImage && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 10,
                  }}>
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                  </div>
                )}
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={currentImageContext}
                  className="w-full h-full object-contain transition-all duration-700"
                  style={{ 
                    filter: getFilterStyle(),
                    opacity: isLoadingImage ? 0.5 : 1,
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', currentImage);
                    // Fallback to a reliable placeholder service
                    e.currentTarget.src = 'https://placehold.co/1920x1080/9370DB/FFFFFF?text=Loading+poster...';
                  }}
                />
              </div>
            </div>

            <p style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 700,
              textAlign: 'center',
              background: cocomelonTheme.colors.lightBlue,
              borderRadius: cocomelonTheme.borderRadius.large,
              padding: '16px 24px',
              color: cocomelonTheme.colors.darkText,
            }}>
              🖼️ {aiImageDescription}
            </p>
          </Card>

          {/* Conversation Panel - Chat sidebar */}
          <Card style={{
            background: cocomelonTheme.colors.softWhite,
            borderRadius: cocomelonTheme.borderRadius.xlarge,
            padding: '16px',
            boxShadow: cocomelonTheme.shadows.medium,
          }} className="flex flex-col lg:col-span-2">
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 900,
              color: cocomelonTheme.colors.darkText,
              marginBottom: '16px',
            }}>💬 Chat</h2>

            {/*Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] md:max-h-[500px] min-h-[200px] md:min-h-[300px] pr-2">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {message.role === 'ai' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: cocomelonTheme.colors.playfulGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden', // Ensure image is contained within the circle
                    }}>
                      <img src="https://i.imgur.com/2PzQ8wG.png" alt="AI Avatar" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div style={{
                    maxWidth: '75%',
                    borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    padding: '16px 20px',
                    boxShadow: cocomelonTheme.shadows.soft,
                    background: message.role === 'user' ? cocomelonTheme.colors.babyBlue : cocomelonTheme.colors.warmYellow,
                  }}>
                    <p style={{
                      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                      fontWeight: 600,
                      color: cocomelonTheme.colors.darkText,
                      lineHeight: '1.5',
                    }}>{message.content}</p>
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: cocomelonTheme.colors.babyBlue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: `3px solid ${cocomelonTheme.colors.darkText}`,
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>👤</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Interim Transcription (User Speaking) */}
              {transcribedText && isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 justify-end"
                >
                  <div className="max-w-[75%] rounded-2xl px-3 py-2 md:px-4 md:py-3 bg-gray-200 text-gray-600 italic border-2 border-dashed border-gray-400">
                    <p className="text-sm md:text-base">{transcribedText}</p>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: cocomelonTheme.colors.babyBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `3px solid ${cocomelonTheme.colors.darkText}`,
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>👤</span>
                  </div>
                </motion.div>
              )}

              {/* AI Processing Indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 justify-start"
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: cocomelonTheme.colors.playfulGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div style={{
                    borderRadius: '20px 20px 20px 4px',
                    padding: '16px 20px',
                    boxShadow: cocomelonTheme.shadows.soft,
                    background: cocomelonTheme.colors.warmYellow,
                  }}>
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: cocomelonTheme.colors.darkText,
                        }}
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: cocomelonTheme.colors.darkText,
                        }}
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: cocomelonTheme.colors.darkText,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.length === 0 && !isConversationActive && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2 p-4">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto" />
                    <p className="text-sm md:text-base text-gray-500 font-medium">
                      Click "Start Talking" to begin!
                    </p>
                  </div>
                </div>
              )}

              {/* Autoscroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Status Indicators */}
            <div className="pt-3 md:pt-4 border-t space-y-2">
              {/* Listening Status */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                    </motion.div>
                  ) : (
                    <MicOff className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                  )}
                  <span className="text-xs md:text-sm font-bold" style={{
                    color: isListening ? cocomelonTheme.colors.success : cocomelonTheme.colors.lightText
                  }}>
                    {isListening ? '🎤 Listening to you...' : 'Microphone off'}
                  </span>
                </div>
              </div>

              {/* AI Status */}
              {(isSpeaking || isLoadingVoice || isProcessing) && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-spin" />
                      ) : isLoadingVoice ? (
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-purple-500 animate-spin" />
                      ) : (
                        <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                      )}
                    </motion.div>
                    <span className="text-xs md:text-sm font-bold" style={{ color: cocomelonTheme.colors.coral }}>
                      {isProcessing ? '🤔 AI is thinking...' : isLoadingVoice ? '🎵 Preparing voice...' : '🗣️ AI Speaking'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
