import React, { useState } from "react";

interface HomeViewProps {
  onSubmitQuery: (query: string) => void;
  onOpenVoice: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubmitQuery, onOpenVoice }) => {
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    "Ask about Quran",
    "Hadith",
    "Fiqh Questions",
    "Daily Du'a"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmitQuery(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        onSubmitQuery(inputValue.trim());
      }
    }
  };

  return (
    <div className="w-full max-w-[800px] flex flex-col items-center text-center animate-float relative" style={{ animationDuration: "8s" }}>
      {/* Breathing Glow Background */}
      <div className="absolute top-[20%] left-1/2 w-[600px] h-[300px] bg-primary/20 blur-[100px] rounded-[100%] pointer-events-none mix-blend-screen animate-breath"></div>
      
      {/* Ornate Arch / Crown Motif */}
      <div className="mb-8 relative w-48 h-32 flex items-end justify-center opacity-85">
        <div className="absolute w-full h-full border-t border-primary/20 rounded-t-full"></div>
        <div className="absolute w-3/4 h-3/4 border-t border-primary/40 rounded-t-full"></div>
        <div className="absolute w-1/2 h-1/2 border-t border-primary/60 rounded-t-full shadow-[0_-10px_20px_rgba(212,175,55,0.2)]"></div>
        <span className="material-symbols-outlined text-primary text-4xl mb-4 relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
          brightness_empty
        </span>
      </div>

      {/* Giant Elegant Greeting */}
      <h1 className="font-display-lg-mobile md:font-display-lg text-divine-ivory mb-6 text-glow tracking-tight leading-tight relative z-10">
        As-salāmu ‘alaykum
      </h1>
      
      {/* Subtitle */}
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-16 font-light relative z-10">
        I’m Nur, your AI companion for Islamic knowledge.
      </p>

      {/* Ultra-luxurious AI Input Bar */}
      <form onSubmit={handleSubmit} className="w-full relative group mb-12 z-20">
        {/* Shimmering Border Wrapper */}
        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/80 to-primary/20 opacity-70 blur-[1px]"></div>
        
        {/* Outer Glow Container */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 pointer-events-none"></div>
        
        {/* The Input Glass Panel */}
        <div className="relative w-full rounded-full bg-midnight-glass/95 backdrop-blur-2xl transition-all duration-500 flex items-center p-2 shadow-2xl pl-8 pr-3 overflow-hidden border border-white/5">
          <div className="glass-noise rounded-full"></div>
          
          <div className="flex-1 flex flex-col items-start justify-center relative z-10">
            <input 
              className="w-full bg-transparent border-none outline-none text-divine-ivory placeholder:text-on-surface-variant/50 font-body-md text-body-md focus:ring-0 p-0" 
              placeholder="Ask anything about Islam..." 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          {/* Voice / Submit Actions */}
          <div className="flex items-center gap-2 ml-4 relative z-10">
            <button 
              type="button"
              onClick={onOpenVoice}
              className="p-3 rounded-full text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all flex items-center justify-center"
              title="Voice Search"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button 
              type="submit"
              className="w-12 h-12 rounded-full bg-primary text-on-primary shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center hover:scale-105 hover:bg-primary-fixed transition-all duration-300"
              title="Submit Query"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Floating Suggestion Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-2xl relative z-10">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSubmitQuery(text)}
            className="glass-panel rounded-full px-6 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-all group duration-300 cursor-pointer text-left border border-white/5"
          >
            <div className="glass-noise rounded-full"></div>
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-divine-ivory transition-colors">
              {text}
            </span>
          </button>
        ))}
      </div>

      {/* Decorative Quote Card */}
      <div className="mt-20 glass-panel rounded-2xl p-6 md:p-8 max-w-3xl opacity-80 hover:opacity-100 transition-opacity duration-500 relative overflow-hidden z-10 border border-white/5">
        <div className="glass-noise"></div>
        <p className="font-body-md text-body-md text-on-surface-variant/80 italic text-center leading-relaxed">
          "And [recall] when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the call of the caller when he calls upon Me."
        </p>
        <p className="font-label-md text-label-md text-primary mt-4 text-center tracking-widest opacity-80 uppercase">
          — Quran 2:186
        </p>
      </div>
    </div>
  );
};
