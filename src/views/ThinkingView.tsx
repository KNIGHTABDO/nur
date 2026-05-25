import React, { useEffect, useState } from "react";

interface ThinkingViewProps {
  onFinishedThinking: () => void;
}

export const ThinkingView: React.FC<ThinkingViewProps> = ({ onFinishedThinking }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // Start at index 2 (Searching Hadith)

  const steps = [
    { title: "Understanding your question", desc: "Clarifying intent and context..." },
    { title: "Searching the Quran", desc: "Scanning relevant verses..." },
    { title: "Searching Hadith", desc: "Exploring authentic narrations..." },
    { title: "Reviewing Fiqh Sources", desc: "Consulting classical scholars..." },
    { title: "Synthesizing & Analyzing", desc: "Connecting evidences..." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex >= steps.length - 1) {
          clearInterval(timer);
          // Wait a short bit on the final step before switching view
          setTimeout(() => {
            onFinishedThinking();
          }, 600);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [onFinishedThinking, steps.length]);

  return (
    <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 px-4">
      {/* Reasoning Panel (Left) */}
      <div className="lg:col-span-5 flex flex-col justify-center h-full">
        <div className="glass-panel rounded-2xl p-8 shadow-[0_0_40px_0_rgba(0,0,0,0.4)] relative overflow-hidden border border-white/5">
          {/* Subtle inner glow top edge */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 animate-glow-pulse">
              <span className="material-symbols-outlined text-primary text-sm">psychology</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-glow font-semibold tracking-wide text-primary">
              Nur is thinking...
            </h2>
          </div>

          <div className="space-y-6 pl-4 border-l border-white/5">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;

              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 relative transition-all duration-500 ${
                    isActive ? "opacity-100 translate-x-2" : isCompleted ? "opacity-80" : "opacity-45"
                  }`}
                >
                  {/* Timeline Indicator Dot */}
                  <div className={`absolute -left-[21px] w-[10px] h-[10px] rounded-full border-2 border-obsidian-base mt-1 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-sacred-emerald shadow-[0_0_10px_rgba(0,77,64,0.6)]" 
                      : isActive 
                        ? "bg-primary shadow-[0_0_15px_rgba(212,175,55,0.8)]" 
                        : "bg-white/10"
                  }`} />

                  {/* Icon Indicator */}
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-sacred-emerald animate-pulse-slow" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-primary animate-spin text-xl">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-white/20">
                        radio_button_unchecked
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className={`font-label-md text-label-md transition-colors duration-300 ${
                      isActive ? "text-primary font-bold" : "text-divine-ivory"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${
                      isActive ? "text-primary/70" : "text-on-surface-variant/80"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom loader message */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-sm text-on-surface-variant">
            <span>Synthesizing holy texts...</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-1 h-1 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-1 h-1 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Panel (Right) */}
      <div className="lg:col-span-7 flex items-center justify-center relative min-h-[500px]">
        {/* Central Focus (Rehal/Quran) */}
        <div className="absolute z-10 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-primary/5 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breath pointer-events-none"></div>
          <img 
            alt="Quran resting on Rehal woodstand" 
            className="w-64 h-auto object-contain drop-shadow-[0_20px_50px_rgba(212,175,55,0.4)] z-20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVp9OjZK_HGeaYFR28aG4I7uswNTO8DMk7hNegqVDD6w4AwNKSpWHOHwiNLy9UxNrSFQ45i6vHbqjqF-RzEMGviBh06M_YeYxzh0X7IxTa1YDkzrZ1Svpw1mrY9KsR6b2oTS5DE_mUYxf8uJWi0fhwpePFZPJakpoQFon58KwRqrS630taAjgzT-oiJ-_rggh-f596gkxmrURvt2IPqqddSzyQTtRVgdnRDh6yzIhX9ZbqdfkyjMWvlaT79dQvrcJXyx1OuL0rfZI4"
          />
        </div>

        {/* Source Stack Layering */}
        <div className="absolute top-10 right-10 z-30 pointer-events-none" style={{ perspective: "1000px" }}>
          <div 
            className="relative w-64 h-80 transform-gpu"
            style={{
              transform: "rotateY(-15deg) rotateX(10deg)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Card 1 (Back - Scholars) */}
            <div 
              className="absolute top-0 right-0 w-full h-24 glass-panel rounded-xl flex items-center px-4 opacity-40 border-white/5"
              style={{
                transform: "translateZ(-60px) translateY(-40px)",
                animation: "float 8s ease-in-out infinite"
              }}
            >
              <span className="material-symbols-outlined text-white/50 mr-3">menu_book</span>
              <span className="font-label-md text-label-md text-white/50">Scholars</span>
            </div>

            {/* Card 2 (Fiqh) */}
            <div 
              className="absolute top-10 right-5 w-full h-24 glass-panel rounded-xl flex items-center px-4 opacity-60 border-white/10"
              style={{
                transform: "translateZ(-30px) translateY(-20px)",
                animation: "float 7s ease-in-out infinite 1s"
              }}
            >
              <span className="material-symbols-outlined text-white/70 mr-3">gavel</span>
              <span className="font-label-md text-label-md text-white/70">Fiqh</span>
            </div>

            {/* Card 3 (Tafsir) */}
            <div 
              className="absolute top-20 right-10 w-full h-24 glass-panel rounded-xl flex items-center px-4 opacity-80 border-white/20"
              style={{
                transform: "translateZ(0px) translateY(0px)",
                animation: "float 9s ease-in-out infinite 2s"
              }}
            >
              <span className="material-symbols-outlined text-divine-ivory mr-3">translate</span>
              <span className="font-label-md text-label-md text-divine-ivory">Tafsir</span>
            </div>

            {/* Card 4 (Active/Front - Hadith) */}
            <div 
              className="absolute top-32 right-16 w-full h-24 glass-panel rounded-xl flex items-center justify-between px-4 border-primary/50 shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
              style={{
                transform: "translateZ(30px) translateY(20px)",
                animation: "float 8.5s ease-in-out infinite 0.5s"
              }}
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined text-primary mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_stories
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">Hadith</span>
              </div>
              <span className="material-symbols-outlined text-primary animate-spin text-sm">sync</span>
            </div>
          </div>
        </div>

        {/* Glowing Connection Light Trails */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-45">
          <defs>
            <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0"></stop>
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="1"></stop>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path 
            className="animate-pulse" 
            d="M 200,300 C 300,200 400,400 500,250" 
            fill="none" 
            stroke="url(#goldGradient)" 
            strokeWidth="2" 
          />
          <path 
            className="animate-pulse" 
            d="M 250,400 C 350,300 450,500 550,350" 
            fill="none" 
            stroke="url(#goldGradient)" 
            strokeWidth="1" 
            style={{ animationDelay: "1s" }} 
          />
        </svg>
      </div>
    </div>
  );
};
