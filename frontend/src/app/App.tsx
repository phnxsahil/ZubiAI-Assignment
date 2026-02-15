import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { EnhancedConversationInterface } from './components/EnhancedConversationInterface';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <>
      {showLanding ? (
        <LandingPage onStart={() => setShowLanding(false)} />
      ) : (
        <EnhancedConversationInterface onBackToHome={() => setShowLanding(true)} />
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}