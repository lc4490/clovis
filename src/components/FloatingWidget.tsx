"use client";

import { useState, useRef, useCallback } from "react";
import { Chat } from "./Chat";
import { MEMBER } from "@/lib/constants";
import type { Language } from "@/lib/constants";

const TEXT_SIZES = ["14px", "16px", "19px", "22px"];

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [textIdx, setTextIdx] = useState(1); // default 16px
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-[4.5rem] right-4 sm:right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-clover-border flex flex-col bg-white"
          style={{
            height: "min(580px, calc(100dvh - 6rem))",
            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
          }}
        >
          <Chat
            onQuickAction={registerSendQuick}
            member={MEMBER}
            language={language}
            onLanguageChange={setLanguage}
            textIdx={textIdx}
            onTextIdxChange={setTextIdx}
            textSizes={TEXT_SIZES}
          />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ background: "#52B788" }}
        aria-label={isOpen ? "Close chat" : "Open Ask Clovis"}
      >
        {isOpen ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
