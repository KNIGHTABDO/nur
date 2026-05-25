import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { HomeView } from "./views/HomeView";
import { ThinkingView } from "./views/ThinkingView";
import { ChatView } from "./views/ChatView";
import { VoiceOverlay } from "./views/VoiceOverlay";
import {
  HistoryView,
  BookmarksView,
  SourcesView,
  ProfileView,
  SettingsView,
} from "./views/MockViews";
import { fetchNurResponse } from "./services/gemini";
import type { NurResponse, ChatTurn } from "./services/gemini";
import type { ChatMessage } from "./views/ChatView";

type ViewState =
  | "home"
  | "thinking"
  | "chat"
  | "history"
  | "bookmarks"
  | "sources"
  | "profile"
  | "settings";

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Dialog session thread containing all interactive turns
  const [chatSession, setChatSession] = useState<ChatMessage[]>([]);
  // Keep track of which message in the session is currently loading
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);

  // Active Session Identifier
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Track if the API is currently loading
  const [isApiLoading, setIsApiLoading] = useState(false);
  // Keep track of compiled data ready to render
  const [pendingResponse, setPendingResponse] = useState<NurResponse | null>(null);

  // Helper to determine if the query is a simple greeting or short conversational talk
  const isSimpleConversational = (text: string): boolean => {
    const t = text.toLowerCase().trim();
    const greetings = [
      "hey", "hello", "hi", "salam", "assalam", "assalamu", "peace", 
      "who are you", "what is your name", "how are you", "good morning",
      "good evening", "how's it going", "as-salamu", "as-salāmu"
    ];
    const isGreeting = greetings.some(g => t.startsWith(g) || t === g);
    
    const keywords = [
      "quran", "hadith", "verse", "ayah", "surah", "ruling", "fiqh", 
      "fatwa", "fasting", "prayer", "charity", "zakat", "hajj", "wudu", 
      "ramadan", "prophet", "allah", "sin", "halal", "haram"
    ];
    const hasKeyword = keywords.some(k => t.includes(k));
    
    return isGreeting && !hasKeyword && t.length < 50;
  };

  // Listen to native window hashchange for isolated sessions and view routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith("#/chat/")) {
        const sessionId = hash.replace("#/chat/", "");
        setActiveSessionId(sessionId);
        
        const rawSessions = localStorage.getItem("nur_chat_sessions") || "{}";
        try {
          const sessions = JSON.parse(rawSessions);
          if (sessions[sessionId]) {
            setChatSession(sessions[sessionId]);
            setCurrentView("chat");
          } else {
            // New empty session
            setChatSession([]);
            setCurrentView("home");
          }
        } catch (e) {
          setChatSession([]);
          setCurrentView("home");
        }
      } else if (hash === "" || hash === "#/" || hash === "#/home") {
        setActiveSessionId(null);
        setChatSession([]);
        setCurrentView("home");
      } else {
        const view = hash.replace("#/", "");
        if (["history", "bookmarks", "sources", "profile", "settings"].includes(view)) {
          setCurrentView(view as any);
        } else {
          setActiveSessionId(null);
          setChatSession([]);
          setCurrentView("home");
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // initial invoke on mount

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Helper to persist conversation threads to specific session storage slots
  const saveSessionToLocal = (id: string, sessionData: ChatMessage[]) => {
    const rawSessions = localStorage.getItem("nur_chat_sessions") || "{}";
    try {
      const sessions = JSON.parse(rawSessions);
      sessions[id] = sessionData;
      localStorage.setItem("nur_chat_sessions", JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save session to local storage", e);
    }
  };

  // Transition: Submit Query -> Kickoff Asynchronous AI fetch in parallel with thinking timers
  const handleSubmitQuery = async (queryText: string) => {
    setIsVoiceActive(false);
    setPendingResponse(null);
    setIsApiLoading(true);

    const isConversational = isSimpleConversational(queryText);
    
    // 1. Establish the session ID
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = Math.floor(1000000 + Math.random() * 9000000) + "-" + Math.floor(1000000 + Math.random() * 9000000);
      setActiveSessionId(sessionId);
      window.location.hash = `#/chat/${sessionId}`;
    }

    const newMessageId = String(Date.now());

    // Create the temporary loading/thinking placeholder message
    const newMsg: ChatMessage = {
      id: newMessageId,
      query: queryText,
      response: {
        answer: isConversational ? "Nur is writing..." : "Nur is thinking...",
        quran: [],
        hadith: [],
        fiqh: [],
        sources: []
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update session state
    const updatedSession = [...chatSession, newMsg];
    setChatSession(updatedSession);
    saveSessionToLocal(sessionId, updatedSession);

    if (isConversational) {
      // For simple greetings, go straight to ChatView instantly
      setCurrentView("chat");
    } else {
      // For informational searches, transition to the ThinkingView animation timeline
      setPendingMessageId(newMessageId);
      setCurrentView("thinking");
    }

    // Save query to legacy LocalStorage history logs for backup
    const rawHistory = localStorage.getItem("nur_chat_history") || "[]";
    try {
      const historyList = JSON.parse(rawHistory);
      if (historyList[0]?.query !== queryText) {
        const category = queryText.toLowerCase().includes("quran") 
          ? "Quranic Study" 
          : queryText.toLowerCase().includes("hadith") 
            ? "Hadith Studies" 
            : "Islamic Fiqh";
            
        const newItem = {
          query: queryText,
          date: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category
        };
        historyList.unshift(newItem);
        localStorage.setItem("nur_chat_history", JSON.stringify(historyList.slice(0, 50)));
      }
    } catch (e) {
      console.error("Failed to update history log", e);
    }

    // Build multi-turn chat history context payload from this specific session only!
    const historyPayload: ChatTurn[] = [];
    chatSession.forEach(msg => {
      if (msg.response.answer !== "Nur is writing..." && msg.response.answer !== "Nur is thinking...") {
        historyPayload.push({ role: "user", text: msg.query });
        historyPayload.push({ role: "model", text: JSON.stringify(msg.response) });
      }
    });

    // Dispatch the live API request
    try {
      const key = localStorage.getItem("nur_gemini_api_key") || "";
      const result = await fetchNurResponse(queryText, key, historyPayload);
      
      const finalSession = updatedSession.map(msg => 
        msg.id === newMessageId 
          ? { ...msg, response: result.response }
          : msg
      );

      if (isConversational) {
        setChatSession(finalSession);
        saveSessionToLocal(sessionId, finalSession);
      } else {
        setPendingResponse(result.response);
      }
    } catch (err) {
      console.error("Generative AI Query failed", err);
      const errResponse = {
        answer: "As-salāmu 'alaykum. I encountered an issue while generating a response. Please check your network connection or API settings.",
        quran: [],
        hadith: [],
        fiqh: [],
        sources: [{ name: "Error Handler", url: "https://generativelanguage.googleapis.com" }]
      };
      const finalSession = updatedSession.map(msg => 
        msg.id === newMessageId 
          ? { ...msg, response: errResponse }
          : msg
      );
      setChatSession(finalSession);
      saveSessionToLocal(sessionId, finalSession);
    } finally {
      setIsApiLoading(false);
    }
  };

  // Thinking step timeline completes
  const handleFinishedThinking = () => {
    if (pendingResponse && pendingMessageId && activeSessionId) {
      const finalSession = chatSession.map(msg => 
        msg.id === pendingMessageId 
          ? { ...msg, response: pendingResponse }
          : msg
      );
      setChatSession(finalSession);
      saveSessionToLocal(activeSessionId, finalSession);
      setPendingMessageId(null);
      setCurrentView("chat");
    } else {
      const checkTimer = setInterval(() => {
        const raw = localStorage.getItem("nur_gemini_api_key");
        if (!isApiLoading || !raw) {
          clearInterval(checkTimer);
          const fetchResponse = (window as any).activeNurResponse || pendingResponse;
          if (activeSessionId && pendingMessageId) {
            if (fetchResponse) {
              const finalSession = chatSession.map(msg => 
                msg.id === pendingMessageId 
                  ? { ...msg, response: fetchResponse }
                  : msg
              );
              setChatSession(finalSession);
              saveSessionToLocal(activeSessionId, finalSession);
            } else {
              const fallbackResponse = {
                answer: "Connection processing delayed. Please refresh or check your API key in settings.",
                quran: [],
                hadith: [],
                fiqh: ["Request timed out or encountered resolving loops."],
                sources: [{ name: "Network Safety Timeout", url: "https://generativelanguage.googleapis.com" }]
              };
              const finalSession = chatSession.map(msg => 
                msg.id === pendingMessageId 
                  ? { ...msg, response: fallbackResponse }
                  : msg
              );
              setChatSession(finalSession);
              saveSessionToLocal(activeSessionId, finalSession);
            }
          }
          setPendingMessageId(null);
          setCurrentView("chat");
        }
      }, 500);
    }
  };

  // Capture background pending responses in global ref for timing checks
  useEffect(() => {
    if (pendingResponse) {
      (window as any).activeNurResponse = pendingResponse;
      if (currentView === "thinking" && !isApiLoading && pendingMessageId && activeSessionId) {
        const finalSession = chatSession.map(msg => 
          msg.id === pendingMessageId 
            ? { ...msg, response: pendingResponse }
            : msg
        );
        setChatSession(finalSession);
        saveSessionToLocal(activeSessionId, finalSession);
        setPendingMessageId(null);
        setCurrentView("chat");
      }
    }
  }, [pendingResponse, isApiLoading, currentView, pendingMessageId, activeSessionId]);

  // Sidebar navigation routing via native URL hashes
  const handleNavigate = (view: string) => {
    setIsVoiceActive(false);
    if (view === "home") {
      // Start a fresh, clean, isolated new chat session!
      const newId = Math.floor(1000000 + Math.random() * 9000000) + "-" + Math.floor(1000000 + Math.random() * 9000000);
      window.location.hash = `#/chat/${newId}`;
    } else {
      window.location.hash = `#/${view}`;
    }
  };

  const handleSelectSession = (sessionId: string) => {
    window.location.hash = `#/chat/${sessionId}`;
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden selection:bg-primary-container/30 selection:text-primary relative text-on-surface">
      {/* Cinematic background shaders and stardust particles */}
      <AmbientBackdrop />

      {/* Responsive layout Sidebar drawer */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Reopen Sidebar Trigger (visible only on desktop when sidebar is collapsed) */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden md:flex absolute top-6 left-6 z-50 w-12 h-12 rounded-full glass-card border border-primary/20 items-center justify-center text-primary hover:bg-primary/10 hover:border-primary/40 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] pointer-events-auto"
          title="Open Sidebar"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      )}

      {/* Main Canvas view router */}
      <main className={`flex-1 h-screen overflow-y-auto relative flex flex-col items-center justify-center px-6 pt-24 pb-32 md:py-12 z-10 transition-all duration-300 ${
        isSidebarCollapsed ? "md:ml-0" : "md:ml-64"
      }`}>
        {(() => {
          switch (currentView) {
            case "home":
              return (
                <HomeView
                  onSubmitQuery={handleSubmitQuery}
                  onOpenVoice={() => setIsVoiceActive(true)}
                />
              );
            case "thinking":
              return <ThinkingView onFinishedThinking={handleFinishedThinking} />;
            case "chat":
              return (
                <ChatView
                  chatSession={chatSession}
                  onSubmitQuery={handleSubmitQuery}
                  onOpenVoice={() => setIsVoiceActive(true)}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              );
            case "history":
              return <HistoryView onSelectSession={handleSelectSession} />;
            case "bookmarks":
              return <BookmarksView onSelectQuery={handleSubmitQuery} />;
            case "sources":
              return <SourcesView />;
            case "profile":
              return <ProfileView />;
            case "settings":
              return <SettingsView />;
            default:
              return (
                <HomeView
                  onSubmitQuery={handleSubmitQuery}
                  onOpenVoice={() => setIsVoiceActive(true)}
                />
              );
          }
        })()}
      </main>

      {/* Speech-activated Voice Overlay */}
      {isVoiceActive && (
        <VoiceOverlay
          onClose={() => setIsVoiceActive(false)}
          onSubmitQuery={handleSubmitQuery}
        />
      )}
    </div>
  );
};

export default App;
