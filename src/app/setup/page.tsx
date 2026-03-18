"use client";

import { useRef, useCallback, useState } from "react";
import { SetupPage } from "@/components/SetupPage";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import type { Language } from "@/lib/constants";
import type { AuthStage, Member } from "@/types";

const TEXT_SIZES = ["16px", "19px", "22px", "25px", "28px"];

export default function SetupRoute() {
  const [member, setMember] = useState<Member | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [textIdx, setTextIdx] = useState(0);
  const [authStage] = useState<AuthStage>("authenticated");
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  const handleSidebarAction = useCallback((prompt: string) => {
    setSidebarOpen(false);
    sendQuickRef.current(prompt);
  }, []);

  if (!member) {
    return (
      <SetupPage
        onComplete={setMember}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <div
      className="flex h-[100dvh] overflow-hidden font-sans text-clover-dark bg-clover-bg"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar
              onQuickAction={handleSidebarAction}
              authStage={authStage}
              member={null}
              language={language}
              onClose={() => setSidebarOpen(false)}
              fontSize={TEXT_SIZES[textIdx]}
            />
          </div>
        </div>
      )}

      <div className="hidden sm:flex h-full">
        <Sidebar
          onQuickAction={handleSidebarAction}
          authStage={authStage}
          member={null}
          language={language}
          fontSize={TEXT_SIZES[textIdx]}
        />
      </div>

      <Chat
        onQuickAction={registerSendQuick}
        member={member}
        language={language}
        onLanguageChange={setLanguage}
        onSidebarToggle={() => setSidebarOpen(true)}
        textIdx={textIdx}
        onTextIdxChange={setTextIdx}
        textSizes={TEXT_SIZES}
      />
    </div>
  );
}
