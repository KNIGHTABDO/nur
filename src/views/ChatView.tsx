import React, { useState, useEffect } from "react";
import type { NurResponse } from "../services/gemini";

export interface ChatMessage {
  id: string;
  query: string;
  response: NurResponse;
  timestamp: string;
}

interface ChatViewProps {
  chatSession: ChatMessage[];
  onSubmitQuery: (query: string) => void;
  onOpenVoice: () => void;
  isSidebarCollapsed?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  chatSession, 
  onSubmitQuery, 
  onOpenVoice,
  isSidebarCollapsed = false
}) => {
  const [inputValue, setInputValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Derive latest query/response for copy, bookmark, and global triggers
  const latestMessage = chatSession[chatSession.length - 1];
  const response = latestMessage?.response || { answer: "", quran: [], hadith: [], fiqh: [], sources: [] };
  const query = latestMessage?.query || "";

  // Sync bookmark state with localStorage
  useEffect(() => {
    const raw = localStorage.getItem("nur_bookmarks");
    if (raw) {
      try {
        const list = JSON.parse(raw);
        const exists = list.some((b: any) => b.title === (response.quran[0]?.reference || query));
        setBookmarked(exists);
      } catch (e) {}
    } else {
      setBookmarked(false);
    }
  }, [response, query]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleBookmarkToggle = () => {
    const raw = localStorage.getItem("nur_bookmarks") || "[]";
    try {
      let list = JSON.parse(raw);
      if (bookmarked) {
        // Remove bookmark
        list = list.filter((b: any) => b.title !== (response.quran[0]?.reference || query));
        setBookmarked(false);
      } else {
        // Add bookmark
        const newItem = {
          title: response.quran[0]?.reference || query,
          content: response.answer.slice(0, 160) + (response.answer.length > 160 ? "..." : ""),
          tag: response.quran.length > 0 ? "Quranic Verse" : "Islamic Answer",
          dateSaved: `Saved ${new Date().toLocaleDateString()}`,
          query: query
        };
        list.push(newItem);
        setBookmarked(true);
      }
      localStorage.setItem("nur_bookmarks", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to toggle bookmark", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmitQuery(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto flex flex-col pb-32 px-4 relative">
      {/* Chat Conversation Area */}
      <div className="flex-1 flex flex-col gap-8 pb-12 w-full animate-float" style={{ animationDuration: "16s" }}>
        {chatSession.map((msg) => {
          const isMsgLoading = msg.response.answer === "Nur is writing..." || msg.response.answer === "Nur is thinking...";
          const hasSources = msg.response.sources && msg.response.sources.length > 0;
          
          return (
            <div key={msg.id} className="flex flex-col gap-8 w-full">
              {/* User Message Bubble */}
              <div className="flex flex-col items-end w-full max-w-3xl self-end">
                <div className="bg-surface-container-low px-6 py-4 rounded-2xl rounded-tr-sm border border-white/5 shadow-md">
                  <p className="font-body-md text-body-md text-on-surface">
                    {msg.query}
                  </p>
                </div>
              </div>

              {/* Nur Response Container */}
              <div className="flex gap-4 md:gap-6 w-full max-w-5xl self-start">
                {/* Nur Avatar */}
                <div className="flex-shrink-0 pt-2">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low border border-primary/30 flex items-center justify-center glow-primary">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      spa
                    </span>
                  </div>
                </div>

                {isMsgLoading ? (
                  /* Loading Pulse Bubble */
                  <div className="glass-card rounded-2xl p-6 border border-white/5 text-on-surface-variant font-light italic flex items-center gap-3 animate-pulse">
                    <span className="material-symbols-outlined text-primary text-xl animate-spin">progress_activity</span>
                    <span>Nur is contemplating...</span>
                  </div>
                ) : (
                  /* Response Content Grid */
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                    {/* Main Text Response */}
                    <div className={`${hasSources ? "lg:col-span-8" : "lg:col-span-12"} glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 w-full border border-white/5`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                        <span className="font-label-md text-label-md text-primary tracking-widest uppercase text-xs">
                          Answer
                        </span>
                      </div>
                      
                      <p className="font-body-md text-body-md text-on-surface leading-relaxed font-light whitespace-pre-wrap">
                        {msg.response.answer}
                      </p>

                      {/* Dynamic Quranic Quote Blocks */}
                      {msg.response.quran && msg.response.quran.map((verse, vIdx) => (
                        <div key={vIdx} className="bg-surface-container-lowest/60 rounded-xl p-6 border-l-2 border-primary/50 relative overflow-hidden group border border-white/5">
                          <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-[64px]">menu_book</span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant mb-4 font-light">Allah ﷻ says in the Holy Quran:</p>
                          <p className="font-arabic-quote text-arabic-quote text-right text-divine-ivory mb-6 leading-[2.2] tracking-wide" dir="rtl">
                            {verse.arabic}
                          </p>
                          <p className="font-body-md text-body-md text-on-surface/90 italic mb-3 font-light">
                            "{verse.english}"
                          </p>
                          <div className="flex items-center justify-between text-on-surface-variant/60 relative z-10">
                            <span className="font-label-md text-label-md text-[12px]">— ({verse.reference})</span>
                            <button 
                              onClick={() => handleCopy(`"${verse.english}" — ${verse.reference}`, vIdx)}
                              className="hover:text-primary transition-colors flex items-center gap-1 text-xs"
                              title="Copy Verse"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {copiedIndex === vIdx ? "check" : "content_copy"}
                              </span>
                              <span>{copiedIndex === vIdx ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Dynamic Hadith Quote Blocks */}
                      {msg.response.hadith && msg.response.hadith.map((item, hIdx) => (
                        <div key={hIdx} className="bg-surface-container-lowest/60 rounded-xl p-6 border-l-2 border-sacred-emerald/50 relative overflow-hidden group border border-white/5">
                          <p className="font-body-md text-body-md text-on-surface-variant mb-4 font-light">In authentic narrations, the Prophet ﷺ said:</p>
                          {item.arabic && (
                            <p className="font-arabic-quote text-arabic-quote text-right text-divine-ivory mb-6 leading-[2.2] tracking-wide" dir="rtl">
                              {item.arabic}
                            </p>
                          )}
                          <p className="font-body-md text-body-md text-on-surface/90 italic mb-3 font-light">
                            "{item.english}"
                          </p>
                          <div className="flex items-center justify-between text-on-surface-variant/60">
                            <span className="font-label-md text-label-md text-[12px]">— ({item.reference})</span>
                          </div>
                        </div>
                      ))}

                      {/* Fiqh Consensus summary block if available */}
                      {msg.response.fiqh && msg.response.fiqh.length > 0 && (
                        <div className="bg-surface-container-lowest/40 rounded-xl p-6 border border-white/5">
                          <h4 className="font-headline-md text-headline-md text-[16px] text-primary mb-3">Jurisprudential & Fiqh Summary</h4>
                          <ul className="list-disc list-inside space-y-2 text-sm text-on-surface-variant/90 font-light">
                            {msg.response.fiqh.map((bullet, fIdx) => (
                              <li key={fIdx} className="leading-relaxed">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={handleBookmarkToggle}
                            className={`transition-colors flex items-center ${bookmarked ? "text-primary animate-pulse" : "text-on-surface-variant hover:text-primary"}`}
                            title={bookmarked ? "Bookmarked" : "Bookmark"}
                          >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                              bookmark
                            </span>
                          </button>
                          <button 
                            onClick={() => handleCopy(msg.response.answer, 999)}
                            className="text-on-surface-variant hover:text-primary transition-colors flex items-center" 
                            title="Copy Answer"
                          >
                            <span className="material-symbols-outlined">
                              {copiedIndex === 999 ? "check" : "share"}
                            </span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sacred-emerald shadow-[0_0_6px_#004D40]"></span>
                          <span className="font-label-md text-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">
                            Verified Sources
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Source Drawer / Panel (Right) */}
                    {hasSources && (
                      <div className="lg:col-span-4 flex flex-col gap-4 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-headline-md text-headline-md text-[18px] text-divine-ivory">Sources</h3>
                          <span className="bg-surface-container-high px-2 py-1 rounded-md text-xs font-label-md text-on-surface-variant border border-white/5">
                            {msg.response.sources.length} Found
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          {msg.response.sources.map((src, sIdx) => {
                            const isQuran = src.name.toLowerCase().includes("quran") || src.name.toLowerCase().includes("surah");
                            const isHadith = src.name.toLowerCase().includes("bukhari") || src.name.toLowerCase().includes("muslim") || src.name.toLowerCase().includes("hadith") || src.name.toLowerCase().includes("tirmidhi") || src.name.toLowerCase().includes("majah") || src.name.toLowerCase().includes("dawud");
                            
                            return (
                              <a 
                                key={sIdx} 
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`glass-card p-4 rounded-xl flex items-center justify-between border border-white/5 border-l-2 hover:bg-white/5 transition-all cursor-pointer group ${
                                  isQuran 
                                    ? "border-l-primary/30 hover:border-l-primary" 
                                    : isHadith 
                                      ? "border-l-sacred-emerald/30 hover:border-l-sacred-emerald" 
                                      : "border-l-secondary-fixed-dim/30 hover:border-l-secondary-fixed-dim"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${
                                    isQuran ? "text-primary" : isHadith ? "text-sacred-emerald" : "text-secondary"
                                  }`}>
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                      {isQuran ? "menu_book" : isHadith ? "auto_stories" : "gavel"}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-headline-md text-headline-md text-[16px] text-on-surface group-hover:text-primary transition-colors">
                                      {src.name}
                                    </span>
                                    <span className="font-label-md text-label-md text-[11px] text-on-surface-variant">
                                      Click to Verify Citation
                                    </span>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1">
                                  open_in_new
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Input Bar */}
      <div className={`fixed bottom-0 md:bottom-8 left-0 right-0 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] md:pb-0 pointer-events-none flex justify-center z-40 transition-all duration-300 ${
        isSidebarCollapsed ? "md:left-0" : "md:left-64"
      }`}>
        <div className="w-full max-w-3xl pointer-events-auto">
          <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-2 flex flex-col gap-2 bg-midnight-glass/80 backdrop-blur-3xl border-2 border-white/10 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
            <div className="flex items-center px-4 py-2">
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body-lg text-body-lg placeholder:text-on-surface-variant/50 placeholder:font-body-md outline-none" 
                placeholder="Ask a follow-up question..." 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={onOpenVoice}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
                  title="Voice Search"
                >
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </button>
                <button 
                  type="submit"
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-fixed transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] ml-2"
                  title="Send message"
                >
                  <span className="material-symbols-outlined text-[20px] transform -rotate-45 ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 pb-2 text-[12px] text-on-surface-variant/60 font-label-md justify-center md:justify-start">
              <span>Nur AI can make mistakes. Consider verifying important information.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
