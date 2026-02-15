import { Sparkles, Mic, ArrowRight, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { cocomelonTheme } from '../styles/theme';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div style={{
      background: cocomelonTheme.colors.skyGradient,
      minHeight: '100vh',
    }}>
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              background: i % 2 === 0 ? cocomelonTheme.colors.softPink : cocomelonTheme.colors.warmYellow,
              opacity: 0.15,
              borderRadius: '50%',
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              scale: Math.random() * 0.5 + 0.5,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
            animate={{
              y: -200,
              x: Math.random() * window.innerWidth,
              rotate: 360,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 relative z-10" style={{ maxHeight: '100vh' }}>
        <div className="max-w-6xl mx-auto">

          {/* HERO SECTION - Desktop Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-8"
          >
            {/* Mascot Icon - HUGE */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block mb-6"
            >
              <div style={{
                background: cocomelonTheme.colors.softWhite,
                borderRadius: cocomelonTheme.borderRadius.round,
                padding: '32px',
                boxShadow: cocomelonTheme.shadows.medium,
                display: 'inline-block',
              }}>
                <Sparkles style={{
                  width: '120px',
                  height: '120px',
                  color: cocomelonTheme.colors.lavender,
                }} />
              </div>
            </motion.div>

            {/* Title - MASSIVE */}
            <motion.h1
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                fontWeight: 900,
                color: cocomelonTheme.colors.darkText,
                marginBottom: '24px',
                textShadow: `4px 4px 0px ${cocomelonTheme.colors.softWhite}, 6px 6px 20px rgba(0,0,0,0.1)`,
                lineHeight: 1,
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Picture Talk AI! 🎨
            </motion.h1>

            {/* Subtitle - Mobile-Friendly */}
            <p style={{
              fontSize: 'clamp(1.1rem, 3.5vw, 2rem)', // Reduced for mobile
              fontWeight: 700,
              color: cocomelonTheme.colors.coral,
              marginBottom: 'clamp(16px, 4vw, 32px)',
              textShadow: `2px 2px 8px rgba(255,255,255,0.8)`,
              padding: '0 16px',
            }}>
              Let's Talk About Fun Pictures Together! 🗣️✨
            </p>

            {/* Start Button - Better Mobile UX */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onStart}
                size="lg"
                style={{
                  background: `linear-gradient(135deg, ${cocomelonTheme.colors.lavender} 0%, ${cocomelonTheme.colors.softPink} 100%)`,
                  borderRadius: cocomelonTheme.borderRadius.xlarge,
                  padding: 'clamp(20px 32px, 4vw 8vw, 32px 64px)',
                  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                  fontWeight: 900,
                  boxShadow: `0 12px 32px rgba(212, 197, 249, 0.5), ${cocomelonTheme.shadows.medium}`,
                  border: 'none',
                  color: cocomelonTheme.colors.darkText,
                  width: '90%',
                  maxWidth: '500px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="hover:shadow-2xl transition-all duration-300"
              >
                <Mic style={{ width: 'clamp(32px, 6vw, 48px)', height: 'clamp(32px, 6vw, 48px)', marginRight: 'clamp(8px, 2vw, 16px)' }} />
                START TALKING!
                <ArrowRight style={{ width: 'clamp(32px, 6vw, 48px)', height: 'clamp(32px, 6vw, 48px)', marginLeft: 'clamp(8px, 2vw, 16px)' }} />
              </Button>
            </motion.div>
          </motion.div>

          {/* Features - Bigger Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: cocomelonTheme.colors.softWhite,
              borderRadius: cocomelonTheme.borderRadius.xlarge,
              padding: '48px',
              boxShadow: cocomelonTheme.shadows.medium,
              marginBottom: '32px',
            }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: cocomelonTheme.colors.darkText,
              textAlign: 'center',
              marginBottom: '40px',
            }}>
              What Can You Do? 🎯
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Camera, color: cocomelonTheme.colors.warmYellow, title: '📸 See Pictures', desc: 'Look at colorful fun pictures!' },
                { icon: Mic, color: cocomelonTheme.colors.coral, title: '🎤 Talk & Listen', desc: 'Chat with AI like a friend!' },
                { icon: Sparkles, color: cocomelonTheme.colors.mintGreen, title: '✨ Magic Happens', desc: 'Watch cool effects appear!' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  style={{
                    background: feature.color,
                    borderRadius: cocomelonTheme.borderRadius.large,
                    padding: '32px',
                    boxShadow: cocomelonTheme.shadows.soft,
                    textAlign: 'center',
                  }}
                >
                  <feature.icon style={{
                    width: '64px',
                    height: '64px',
                    color: cocomelonTheme.colors.softWhite,
                    margin: '0 auto 16px',
                  }} />
                  <h3 style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: cocomelonTheme.colors.darkText,
                    marginBottom: '12px',
                  }}>{feature.title}</h3>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: cocomelonTheme.colors.darkText,
                    opacity: 0.9,
                  }}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Simple Steps */}
            <div style={{
              background: cocomelonTheme.colors.lightBlue,
              borderRadius: cocomelonTheme.borderRadius.large,
              padding: '32px',
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: cocomelonTheme.colors.darkText,
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                How to Play? 🎮
              </h3>

              <div className="space-y-4">
                {[
                  '1️⃣ Click the big button above',
                  '2️⃣ Look at the fun picture',
                  '3️⃣ Talk with the AI',
                  '4️⃣ Have fun for 60 seconds!',
                ].map((step, i) => (
                  <div key={i} style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: cocomelonTheme.colors.darkText,
                    padding: '16px',
                    background: cocomelonTheme.colors.softWhite,
                    borderRadius: cocomelonTheme.borderRadius.medium,
                    textAlign: 'center',
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
