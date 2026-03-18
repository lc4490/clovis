"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Chat } from "./Chat";
import { Sidebar } from "./Sidebar";
import type { Language } from "@/lib/constants";
import type { AuthStage } from "@/types";
import type { MockMember } from "@/lib/mockMembers";

const TEXT_SIZES = ["16px", "19px", "22px", "25px", "28px"];

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [textIdx, setTextIdx] = useState(0);
  const [authStage, setAuthStage] = useState<AuthStage>("collecting");
  const [member, setMember] = useState<MockMember | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  const handleAuthChange = useCallback((stage: AuthStage, m: MockMember | null) => {
    setAuthStage(stage);
    setMember(m);
  }, []);

  const handleSidebarAction = useCallback((prompt: string) => {
    setSidebarOpen(false);
    sendQuickRef.current(prompt);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  const handleToggle = useCallback(() => setIsOpen((v) => !v), []);

  const handleExpand = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsFullscreen(false);
    setIsOpen(true);
  }, []);

  return (
    <>
      {(isOpen || isFullscreen) && (
        <div
          className={
            isFullscreen
              ? "fixed inset-0 z-50 flex overflow-hidden bg-clover-bg"
              : "fixed bottom-[4.5rem] right-4 sm:right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-clover-border flex bg-white"
          }
          style={{
            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
            ...(isFullscreen
              ? { paddingTop: "env(safe-area-inset-top)" }
              : { height: "min(580px, calc(100dvh - 6rem))" }),
          }}
        >
          {/* Mobile sidebar drawer — fullscreen only */}
          {isFullscreen && sidebarOpen && (
            <div className="sm:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute inset-y-0 left-0 z-50">
                <Sidebar
                  onQuickAction={handleSidebarAction}
                  authStage={authStage}
                  member={member}
                  language={language}
                  onClose={() => setSidebarOpen(false)}
                  fontSize={TEXT_SIZES[textIdx]}
                />
              </div>
            </div>
          )}

          {/* Desktop sidebar — fullscreen only */}
          {isFullscreen && (
            <div className="hidden sm:flex h-full">
              <Sidebar
                onQuickAction={handleSidebarAction}
                authStage={authStage}
                member={member}
                language={language}
                fontSize={TEXT_SIZES[textIdx]}
              />
            </div>
          )}

          <Chat
            onQuickAction={registerSendQuick}
            language={language}
            onLanguageChange={setLanguage}
            onSidebarToggle={isFullscreen ? () => setSidebarOpen(true) : undefined}
            onExpand={!isFullscreen ? handleExpand : undefined}
            onCollapse={isFullscreen ? handleCollapse : undefined}
            textIdx={textIdx}
            onTextIdxChange={setTextIdx}
            textSizes={TEXT_SIZES}
            onAuthChange={handleAuthChange}
          />
        </div>
      )}

      {!isFullscreen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: "#52B788" }}
          aria-label={isOpen ? "Close chat" : "Open Ask Clovis"}
        >
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}
