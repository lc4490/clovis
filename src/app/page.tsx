"use client";

import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { SetupPage } from "@/components/SetupPage";
import type { Member } from "@/types";

export default function Home() {
  const [member, setMember] = useState<Member | null>(null);
  const sendQuickRef = useRef<(prompt: string) => void>(() => {});

  const registerSendQuick = useCallback((fn: (prompt: string) => void) => {
    sendQuickRef.current = fn;
  }, []);

  const handleSidebarAction = useCallback((prompt: string) => {
    sendQuickRef.current(prompt);
  }, []);

  if (!member) {
    return <SetupPage onComplete={setMember} />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-clover-dark bg-clover-bg">
      <div className="hidden sm:flex h-full">
        <Sidebar onQuickAction={handleSidebarAction} member={member} />
      </div>
      <Chat onQuickAction={registerSendQuick} member={member} />
    </div>
  );
}
