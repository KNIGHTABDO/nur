import React, { useState, useEffect } from "react";

// Helper keys for local storage
const KEYS = {
  API_KEY: "nur_gemini_api_key",
  MODEL: "nur_selected_model",
  CALENDAR: "nur_calendar_method",
  HISTORY: "nur_chat_history",
  BOOKMARKS: "nur_bookmarks"
};

// ==========================================
// 1. HISTORY VIEW
// ==========================================
import type { ChatMessage } from "./ChatView";

interface HistoryViewProps {
  onSelectSession: (sessionId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<{ [id: string]: ChatMessage[] }>({});

  useEffect(() => {
    const raw = localStorage.getItem("nur_chat_sessions");
    if (raw) {
      try {
        setSessions(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem("nur_chat_sessions");
    setSessions({});
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from navigating
    const raw = localStorage.getItem("nur_chat_sessions");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        delete parsed[id];
        localStorage.setItem("nur_chat_sessions", JSON.stringify(parsed));
        setSessions(parsed);
      } catch (err) {
        console.error("Failed to delete chat session", err);
      }
    }
  };

  const sessionIds = Object.keys(sessions).filter(id => sessions[id] && sessions[id].length > 0).sort((a, b) => {
    const firstMsgA = sessions[a][0];
    const firstMsgB = sessions[b][0];
    return (firstMsgB?.id || "").localeCompare(firstMsgA?.id || "");
  });

  return (
    <div className="w-full max-w-4xl px-4 animate-float" style={{ animationDuration: "12s" }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">history</span>
          <h2 className="font-headline-lg text-headline-lg text-divine-ivory font-bold">Chat Sessions</h2>
        </div>
        {sessionIds.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
          >
            <span className="material-symbols-outlined text-xs">delete_sweep</span>
            Clear All
          </button>
        )}
      </div>

      {sessionIds.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center border border-white/5">
          <p className="text-on-surface-variant">No chat history yet. Ask Nur anything about Islam to get started!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {sessionIds.map((id) => {
            const firstMsg = sessions[id][0];
            if (!firstMsg) return null;
            return (
              <div
                key={id}
                onClick={() => onSelectSession(id)}
                className="glass-card w-full p-5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all text-left border border-white/5 group cursor-pointer"
              >
                <div className="flex flex-col gap-1.5 flex-1 pr-4">
                  <p className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors font-light line-clamp-1">
                    {firstMsg.query}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant/60">
                    <span>ID: {id}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{sessions[id].length} Message{sessions[id].length > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <button 
                    onClick={(e) => handleDeleteSession(id, e)}
                    className="w-9 h-9 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all flex items-center justify-center opacity-40 group-hover:opacity-100"
                    title="Delete Chat Session"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-all opacity-40 group-hover:opacity-100 transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. BOOKMARKS VIEW
// ==========================================
interface BookmarkItem {
  title: string;
  content: string;
  tag: string;
  dateSaved: string;
  query: string;
}

interface BookmarksViewProps {
  onSelectQuery?: (query: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onSelectQuery }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEYS.BOOKMARKS);
    if (raw) {
      try {
        setBookmarks(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const handleDelete = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.title !== title);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    setBookmarks(updated);
  };

  return (
    <div className="w-full max-w-4xl px-4 animate-float" style={{ animationDuration: "14s" }}>
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-3xl">bookmark</span>
        <h2 className="font-headline-lg text-headline-lg text-divine-ivory font-bold">Saved Bookmarks</h2>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center border border-white/5">
          <p className="text-on-surface-variant">No saved bookmarks yet. Save Quranic citations and Hadith answers to access them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {bookmarks.map((bookmark, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectQuery && onSelectQuery(bookmark.query || bookmark.title)}
              className={`glass-card p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-primary/20 transition-all relative overflow-hidden group ${
                onSelectQuery ? "cursor-pointer" : ""
              }`}
            >
              <div className="glass-noise"></div>
              <div className="flex justify-between items-start z-10">
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-wider font-semibold rounded-full px-3 py-1">
                  {bookmark.tag}
                </span>
                <button 
                  onClick={(e) => handleDelete(bookmark.title, e)}
                  className="text-on-surface-variant hover:text-error transition-colors pointer-events-auto"
                  title="Remove Bookmark"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
              
              <h3 className="font-headline-md text-headline-md text-[18px] text-divine-ivory z-10 font-medium group-hover:text-primary transition-colors">
                {bookmark.title}
              </h3>
              
              <p className="font-body-md text-body-md text-on-surface-variant/80 italic leading-relaxed z-10 font-light flex-1">
                "{bookmark.content}"
              </p>
              
              <div className="text-xs text-on-surface-variant/40 pt-4 border-t border-white/5 z-10">
                {bookmark.dateSaved}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. SOURCES VIEW
// ==========================================
export const SourcesView: React.FC = () => {
  const libraryShelves = [
    {
      category: "Sovereign Islamic RAG Catalogs (Direct Integration)",
      items: [
        { 
          title: "Fanar-Sadiq Sovereign Database", 
          author: "Qatar Computing Research Institute (QCRI)", 
          volumes: "Classical Fiqh, Hadith & Tafsir Corpora", 
          status: "Active & Primary RAG Target",
          icon: "database"
        },
        { 
          title: "Tafsir Ibn Kathir & al-Jalalayn", 
          author: "Fanar Integrated Libraries", 
          volumes: "Full Jurisprudence Exegesis Indexes", 
          status: "Verified & Fully Synced",
          icon: "menu_book"
        }
      ]
    },
    {
      category: "Dynamic Fallback Databases (Resilient Failover Core)",
      items: [
        { 
          title: "Alquran.cloud Ingress API", 
          author: "Global Islamic Research Ingress", 
          volumes: "Verified Arabic Diacritics (Tashkeel) Ingestion", 
          status: "Active Web Fallback",
          icon: "cloud_sync"
        },
        { 
          title: "HadithAPI Global Catalog", 
          author: "Canonical Collections Index", 
          volumes: "Sahih al-Bukhari, Sahih Muslim, at-Tirmidhi, and Sunan Collections", 
          status: "Active Web Fallback",
          icon: "auto_stories"
        }
      ]
    },
    {
      category: "Cognitive Routing & Restructuring Engines",
      items: [
        { 
          title: "Groq Cognitive Router & Supervisor", 
          author: "llama-3.3-70b-versatile Engine", 
          volumes: "Intelligent Intent Classification & Limit Preservation", 
          status: "Active Gatekeeper",
          icon: "terminal"
        },
        { 
          title: "Zero-Creativity Synthesis Restructurer", 
          author: "Groq Restructure Parser Core", 
          volumes: "Strict schema formatting with 0% creativity guardrails", 
          status: "Active Gatekeeper",
          icon: "shield"
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl px-4 animate-float" style={{ animationDuration: "13s" }}>
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-3xl">library_books</span>
        <h2 className="font-headline-lg text-headline-lg text-divine-ivory font-bold">Islamic Reference Library</h2>
      </div>

      <div className="flex flex-col gap-10 max-h-[60vh] overflow-y-auto pr-2">
        {libraryShelves.map((shelf, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-primary font-medium tracking-wide border-b border-white/5 pb-2">
              {shelf.category}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelf.items.map((book, bIdx) => (
                <div key={bIdx} className="glass-card p-5 rounded-xl border border-white/5 flex gap-4 hover:bg-white/5 transition-all">
                  <div className="w-12 h-14 bg-primary/10 border border-primary/20 rounded flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined text-2xl">{book.icon}</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h4 className="font-label-md text-label-md text-divine-ivory font-semibold">{book.title}</h4>
                    <p className="text-xs text-on-surface-variant/80">{book.author} — <span className="text-primary/70">{book.volumes}</span></p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sacred-emerald shadow-[0_0_6px_rgba(0,77,64,1)]"></span>
                      <span className="text-[10px] text-sacred-emerald uppercase font-semibold tracking-wider">{book.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. PROFILE VIEW
// ==========================================
export const ProfileView: React.FC = () => {
  const [queryCount, setQueryCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const history = localStorage.getItem(KEYS.HISTORY);
    if (history) {
      try {
        setQueryCount(JSON.parse(history).length);
      } catch (e) {}
    }
    const bookmarks = localStorage.getItem(KEYS.BOOKMARKS);
    if (bookmarks) {
      try {
        setBookmarkCount(JSON.parse(bookmarks).length);
      } catch (e) {}
    }
  }, []);

  return (
    <div className="w-full max-w-3xl px-4 animate-float" style={{ animationDuration: "11s" }}>
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-white/5 shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="glass-noise"></div>
        
        {/* Profile Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container border-2 border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="material-symbols-outlined text-on-primary text-[48px]">person</span>
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-sacred-emerald border-2 border-obsidian-base flex items-center justify-center text-[12px] text-white" title="Verified Account">
            ✓
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-headline-lg text-headline-lg text-divine-ivory font-bold">Islamic Seeker</h2>
          <p className="text-sm text-on-surface-variant/85 font-light">Member since May 2026</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-md text-label-md text-primary text-xs uppercase tracking-widest font-bold">
            Gold Member Access
          </span>
        </div>

        {/* User Stats/Progress */}
        <div className="grid grid-cols-3 w-full border-t border-b border-white/5 py-6 my-4 gap-4">
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile text-primary font-bold">{queryCount}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Queries Asked</span>
          </div>
          <div className="flex flex-col items-center border-l border-r border-white/5">
            <span className="font-display-lg-mobile text-primary font-bold">{bookmarkCount}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Bookmarked Notes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile text-primary font-bold">100%</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Verified Feeds</span>
          </div>
        </div>

        {/* Spiritual Focus Areas */}
        <div className="w-full flex flex-col items-start gap-3">
          <h3 className="font-label-md text-label-md text-divine-ivory uppercase tracking-wider text-xs border-b border-white/5 pb-1 w-full text-left">
            Stellar Activity
          </h3>
          <div className="flex flex-wrap gap-2.5 w-full">
            <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-label-md text-on-surface-variant border border-white/5">
              🕌 Fiqh (Consensus)
            </span>
            <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-label-md text-on-surface-variant border border-white/5">
              📖 Surah Studies
            </span>
            <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-label-md text-on-surface-variant border border-white/5">
              ⚖️ Hadith Gradings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SETTINGS VIEW
// ==========================================
export const SettingsView: React.FC = () => {
  const [groqApiKey, setGroqApiKey] = useState("");
  const [fanarApiKey, setFanarApiKey] = useState("");
  const [calendar, setCalendar] = useState("Umm al-Qura Calendar, Saudi Arabia");
  const [showNotification, setShowNotification] = useState(false);

  const isGroqEnvActive = !!import.meta.env.VITE_GROQ_API_KEY;
  const isFanarEnvActive = !!import.meta.env.VITE_FANAR_API_KEY;

  useEffect(() => {
    setGroqApiKey(localStorage.getItem("nur_groq_api_key") || "");
    setFanarApiKey(localStorage.getItem("nur_fanar_api_key") || "");
    setCalendar(localStorage.getItem(KEYS.CALENDAR) || "Umm al-Qura Calendar, Saudi Arabia");
  }, [isFanarEnvActive]);

  const handleSave = () => {
    localStorage.setItem("nur_groq_api_key", groqApiKey);
    localStorage.setItem("nur_fanar_api_key", fanarApiKey);
    localStorage.setItem(KEYS.CALENDAR, calendar);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="w-full max-w-3xl px-4 animate-float" style={{ animationDuration: "15s" }}>
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-3xl">settings</span>
        <h2 className="font-headline-lg text-headline-lg text-divine-ivory font-bold">Preferences</h2>
      </div>

      <div className="glass-panel rounded-2xl p-8 flex flex-col gap-8 border border-white/5 shadow-2xl relative">
        <div className="glass-noise"></div>
        
        {/* Toggle options */}
        <div className="flex flex-col gap-6 relative z-10">
          <h3 className="font-headline-md text-headline-md text-primary text-[20px] font-semibold mb-2">
            AI Engine Credentials
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-divine-ivory font-medium">Fanar Specialized Arabic & Islamic API Key</label>
                {isFanarEnvActive && (
                  <span className="bg-sacred-emerald/20 border border-sacred-emerald/30 text-sacred-emerald text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5">
                    ✓ Server Env Active
                  </span>
                )}
              </div>
              <input 
                type="password"
                className="bg-midnight-glass border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 mt-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder={isFanarEnvActive ? "Configured in server environment (.env)..." : "Paste your Fanar API key here..."}
                value={fanarApiKey}
                onChange={(e) => setFanarApiKey(e.target.value)}
                disabled={isFanarEnvActive}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-divine-ivory font-medium">Groq Developer API Key</label>
                {isGroqEnvActive && (
                  <span className="bg-sacred-emerald/20 border border-sacred-emerald/30 text-sacred-emerald text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5">
                    ✓ Server Env Active
                  </span>
                )}
              </div>
              <input 
                type="password"
                className="bg-midnight-glass border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 mt-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder={isGroqEnvActive ? "Configured in server environment (.env)..." : "Paste your Groq API key here..."}
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                disabled={isGroqEnvActive}
              />
              <p className="text-[11px] text-on-surface-variant/70 mt-1">Credentials can be supplied in browser local storage, or statically loaded via Vercel/server `.env` environment variables.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 relative z-10">
          <h3 className="font-headline-md text-headline-md text-primary text-[20px] font-semibold mb-2">
            Regional Preferences
          </h3>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-divine-ivory font-medium">Islamic Calendar Calculation Method</label>
            <select 
              className="bg-midnight-glass border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 mt-1 w-full"
              value={calendar}
              onChange={(e) => setCalendar(e.target.value)}
            >
              <option value="Umm al-Qura Calendar, Saudi Arabia">Umm al-Qura Calendar, Saudi Arabia</option>
              <option value="Islamic Society of North America (ISNA)">Islamic Society of North America (ISNA)</option>
              <option value="Muslim World League (MWL)">Muslim World League (MWL)</option>
              <option value="Egyptian General Authority of Survey">Egyptian General Authority of Survey</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center relative z-10 mt-4 pt-6 border-t border-white/5">
          {showNotification ? (
            <span className="text-xs text-sacred-emerald font-semibold animate-pulse">✓ Preferences saved successfully</span>
          ) : (
            <span />
          )}
          <button
            onClick={handleSave}
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] font-semibold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
