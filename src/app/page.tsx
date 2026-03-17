"use client";

import { useRef, useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import type { Language } from "@/lib/constants";
import type { AuthStage } from "@/types";
import type { MockMember } from "@/lib/mockMembers";

const TEXT_SIZES = ["16px", "19px", "22px", "25px", "28px"];

export default function Home() {
  const [authStage, setAuthStage] = useState<AuthStage>("collecting");
  const [member, setMember] = useState<MockMember | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [textIdx, setTextIdx] = useState(0);
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  const handleSidebarAction = useCallback((prompt: string) => {
    setSidebarOpen(false);
    sendQuickRef.current(prompt);
  }, []);

  const handleAuthChange = useCallback((stage: AuthStage, m: MockMember | null) => {
    setAuthStage(stage);
    setMember(m);
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden font-sans text-clover-dark bg-clover-bg" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Mobile drawer */}
      {sidebarOpen && (
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

      {/* Sidebar — desktop only */}
      <div className="hidden sm:flex h-full">
        <Sidebar
          onQuickAction={handleSidebarAction}
          authStage={authStage}
          member={member}
          language={language}
          fontSize={TEXT_SIZES[textIdx]}
        />
      </div>

      <Chat
        onQuickAction={registerSendQuick}
        language={language}
        onLanguageChange={setLanguage}
        onSidebarToggle={() => setSidebarOpen(true)}
        textIdx={textIdx}
        onTextIdxChange={setTextIdx}
        textSizes={TEXT_SIZES}
        onAuthChange={handleAuthChange}
      />
    </div>
  );
}
