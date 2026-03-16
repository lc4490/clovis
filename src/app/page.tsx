"use client";

import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { SetupPage } from "@/components/SetupPage";
import type { Language } from "@/lib/constants";
import type { Member } from "@/types";

export default function Home() {
  const [member, setMember] = useState<Member | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  const handleSidebarAction = useCallback((prompt: string) => {
    setSidebarOpen(false);
    sendQuickRef.current(prompt);
  }, []);

  if (!member) {
    return <SetupPage onComplete={setMember} language={language} onLanguageChange={setLanguage} />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-clover-dark bg-clover-bg">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, static on sm+ */}
      <div
        className={`fixed sm:static inset-y-0 left-0 z-30 h-full transition-transform duration-300 sm:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:flex`}
      >
        <Sidebar
          onQuickAction={handleSidebarAction}
          member={member}
          language={language}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <Chat
        onQuickAction={registerSendQuick}
        member={member}
        language={language}
        onLanguageChange={setLanguage}
        onSidebarToggle={() => setSidebarOpen(true)}
      />
    </div>
  );
}
