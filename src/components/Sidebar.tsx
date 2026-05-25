import React from "react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { id: "home", label: "New Chat", icon: "add_comment" },
    { id: "history", label: "History", icon: "history" },
    { id: "bookmarks", label: "Bookmarks", icon: "bookmark" },
    { id: "sources", label: "Sources", icon: "auto_stories" },
  ];

  const bottomItems = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <>
      {/* SideNavBar (Desktop) */}
      <nav className={`hidden md:flex flex-col fixed left-0 top-0 h-full w-64 p-6 z-50 bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-white/10 shadow-[0px_0px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      }`}>
        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5 flex items-center justify-center z-20"
          title="Collapse Sidebar"
        >
          <span className="material-symbols-outlined text-xl">menu_open</span>
        </button>
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-12 mt-4 relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-container/20 to-transparent border border-primary/30 mb-4 animate-float relative z-10 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 blur-2xl rounded-full"></div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-wider text-glow">
            Nur
          </h1>
          <p className="font-label-md text-[10px] text-on-surface-variant tracking-widest uppercase mt-1 opacity-60">
            AI for Islamic Knowledge
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 flex-1 w-full">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === "home" && (currentView === "thinking" || currentView === "chat"));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-left ${
                  isActive
                    ? "bg-primary-container/10 text-primary border-l-2 border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)] scale-[0.98]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 hover:backdrop-blur-md"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-white/5 w-full">
          {bottomItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300 group text-left ${
                  isActive
                    ? "bg-primary-container/10 text-primary border-l-2 border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 hover:backdrop-blur-md"
                }`}
              >
                <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* TopAppBar (Mobile) */}
      <header className="flex justify-between items-center w-full px-6 py-4 md:hidden fixed top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          <span className="font-headline-md text-headline-md font-medium text-divine-ivory">Nur</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("sources")}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
          >
            <span className="material-symbols-outlined">menu_book</span>
          </button>
          <button 
            onClick={() => onNavigate("profile")}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 md:hidden bg-surface-container-lowest/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-lg h-16">
        <button
          onClick={() => onNavigate("home")}
          className={`flex flex-col items-center justify-center h-full min-w-[64px] transition-all ${
            currentView === "home" || currentView === "thinking" || currentView === "chat"
              ? "text-primary"
              : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: (currentView === "home" || currentView === "chat") ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span className="font-label-md text-[10px] leading-tight">Home</span>
        </button>
        
        <button
          onClick={() => onNavigate("history")}
          className={`flex flex-col items-center justify-center h-full min-w-[64px] transition-all ${
            currentView === "history" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined mb-1">history</span>
          <span className="font-label-md text-[10px] leading-tight">History</span>
        </button>

        <button
          onClick={() => onNavigate("sources")}
          className={`flex flex-col items-center justify-center h-full min-w-[64px] transition-all ${
            currentView === "sources" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined mb-1">menu_book</span>
          <span className="font-label-md text-[10px] leading-tight">Sources</span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          className={`flex flex-col items-center justify-center h-full min-w-[64px] transition-all ${
            currentView === "profile" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined mb-1">person</span>
          <span className="font-label-md text-[10px] leading-tight">Profile</span>
        </button>
      </nav>
    </>
  );
};
