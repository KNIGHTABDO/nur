import React, { useEffect, useState, useRef } from "react";

interface VoiceOverlayProps {
  onClose: () => void;
  onSubmitQuery: (query: string) => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onClose, onSubmitQuery }) => {
  const [visualizerHeights, setVisualizerHeights] = useState([20, 45, 80, 30, 60, 40, 70]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Tap the microphone to speak...");
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsSpeaking(true);
        setStatusMessage("Listening...");
      };

      rec.onresult = (e: any) => {
        const text = Array.from(e.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setTranscriptText(text);
      };

      rec.onend = () => {
        setIsSpeaking(false);
        setStatusMessage("Processing transcript...");
        
        // Auto submit if the user actually said something
        if (recognitionRef.current && recognitionRef.current.activeTranscript) {
          const finalVal = recognitionRef.current.activeTranscript;
          setTimeout(() => {
            onSubmitQuery(finalVal);
          }, 1000);
        } else {
          setStatusMessage("Didn't catch that. Tap the mic to try again.");
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsSpeaking(false);
        setStatusMessage("Voice recognition error or not supported.");
      };

      recognitionRef.current = rec;
      
      // Auto start on mount
      try {
        rec.start();
      } catch (err) {}
    } else {
      setStatusMessage("Web Speech API not supported in this browser. Try Chrome.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [onSubmitQuery]);

  // Keep track of transcription dynamically inside ref for asynchronous callbacks
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.activeTranscript = transcriptText;
    }
  }, [transcriptText]);

  // Generate dynamic waveform animations
  useEffect(() => {
    const timer = setInterval(() => {
      setVisualizerHeights(() => {
        return Array.from({ length: 7 }, () => {
          return isSpeaking 
            ? Math.floor(Math.random() * 80) + 20 
            : Math.floor(Math.random() * 20) + 10;
        });
      });
    }, 150);

    return () => clearInterval(timer);
  }, [isSpeaking]);

  const handleMicToggle = () => {
    if (!recognitionRef.current) return;

    if (isSpeaking) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      setTranscriptText("");
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen flex items-center justify-center relative overflow-hidden font-body-md antialiased transition-all duration-500">
      {/* Ambient Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-background z-0"></div>
      
      {/* Dynamic Stardust Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute w-full h-full bg-cover bg-center bg-no-repeat islamic-pattern bg-blend-overlay"></div>
      </div>
      
      {/* Central Cinematic Lighting Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen z-0 pointer-events-none"></div>

      {/* Top Close Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
        <button 
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            close
          </span>
          <span className="font-label-md text-label-md">Close</span>
        </button>
        <div className="font-headline-md text-headline-md font-medium text-primary tracking-widest opacity-35">NUR</div>
        <div className="w-20"></div> {/* Spacer for symmetry */}
      </div>

      {/* Main Canvas: Voice Interaction Interface */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4">
        {/* The Spiritual Orb (Core AI Entity) */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12 animate-float">
          
          {/* Concentric Pinging Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-full border border-primary/20 rounded-full animate-ping" style={{ animationDuration: "3s" }}></div>
            <div className="absolute w-[120%] h-[120%] border border-primary/10 rounded-full animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }}></div>
            <div className="absolute w-[140%] h-[140%] border border-primary/5 rounded-full animate-ping" style={{ animationDuration: "5s", animationDelay: "2s" }}></div>
          </div>

          {/* The Core Glowing Orb */}
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary via-primary-container to-background flex items-center justify-center shadow-[0_0_80px_rgba(212,175,55,0.4),_inset_0_0_40px_rgba(212,175,55,0.6)] animate-breathe">
            {/* Inner Glass Layer */}
            <div className="absolute inset-2 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/10">
              {/* Dynamic Waveform Visualizer inside Orb */}
              <div className="flex items-center justify-center gap-1.5 h-12 w-full px-4 opacity-80">
                {visualizerHeights.map((h, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-primary rounded-full transition-all duration-150"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            
            {/* Central Graphic Equalizer Icon */}
            <span className="material-symbols-outlined text-primary text-4xl md:text-5xl absolute z-20 opacity-30 pointer-events-none">
              graphic_eq
            </span>
          </div>

          {/* Slow Rotating Islamic Geometry Motif */}
          <div className="absolute inset-[-15%] animate-spin-slow opacity-15 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full stroke-primary stroke-[0.3]" fill="none" viewBox="0 0 100 100">
              <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"></path>
              <path d="M15 15 L50 30 L85 15 L70 50 L85 85 L50 70 L15 85 L30 50 Z"></path>
            </svg>
          </div>
        </div>

        {/* Status & Text Prompts */}
        <div className="text-center z-20 flex flex-col items-center gap-6 glass-panel px-12 py-8 rounded-3xl border border-white/5 shadow-2xl min-w-[280px] md:min-w-[400px]">
          <h2 className="font-headline-lg text-headline-lg md:text-[36px] font-medium text-divine-ivory tracking-wide animate-pulse">
            {statusMessage}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto font-light leading-relaxed min-h-[40px] italic">
            {transcriptText ? `"${transcriptText}"` : "Speak your question about Islam, the Quran, or Hadith."}
          </p>
          
          {/* Active Voice Controls */}
          <div className="mt-6 flex items-center gap-6">
            {/* Keyboard input mode switch */}
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-surface-container-highest/50 border border-white/10 flex items-center justify-center text-on-surface hover:bg-white/10 hover:text-primary transition-all backdrop-blur-xl"
              title="Switch to Keyboard"
            >
              <span className="material-symbols-outlined text-xl">keyboard</span>
            </button>
            
            {/* Central Mic Toggle Button */}
            <button 
              onClick={handleMicToggle}
              className={`w-18 h-18 rounded-full border flex items-center justify-center transition-all overflow-hidden p-4 ${
                isSpeaking 
                  ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:bg-primary/30" 
                  : "bg-surface-container-high/60 border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30"
              }`}
              title={isSpeaking ? "Stop Recording" : "Start Recording"}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isSpeaking ? "mic" : "mic_off"}
              </span>
            </button>
            
            {/* Cancel / Stop button */}
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-surface-container-highest/50 border border-white/10 flex items-center justify-center text-error hover:bg-error/10 transition-all backdrop-blur-xl"
              title="Stop listening"
            >
              <span className="material-symbols-outlined text-xl">stop_circle</span>
            </button>
          </div>
        </div>
      </main>

      {/* Embedded CSS for Islamic Geometrics */}
      <style>{`
        .islamic-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
        .w-18 { width: 4.5rem; }
        .h-18 { height: 4.5rem; }
      `}</style>
    </div>
  );
};
