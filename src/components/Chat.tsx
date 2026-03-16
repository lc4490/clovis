"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { LANGUAGES, UI_STRINGS } from "@/lib/constants";
import { buildBotMessage } from "@/lib/utils";
import type { Language } from "@/lib/constants";
import type { Member, Message } from "@/types";

function makeWelcome(firstName: string, lang: Language): Message {
  const s = UI_STRINGS[lang];
  return {
    id: "welcome",
    role: "assistant",
    content: s.welcome(firstName),
    chips: s.welcomeChips.map((c) => c.label),
  };
}

interface ChatProps {
  onQuickAction: (setter: (prompt: string) => void) => void;
  member: Member;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Chat({ onQuickAction, member, language, onLanguageChange }: ChatProps) {
  const firstName = member.name.split(" ")[0];
  const strings = UI_STRINGS[language];

  const [messages, setMessages] = useState<Message[]>(() => [makeWelcome(firstName, language)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const TEXT_SIZES = ["13px", "15px", "17px", "19px", "21px"];
  const [textIdx, setTextIdx] = useState(1);

  // Map welcome chip labels → prompts for current language
  const chipPromptMap = Object.fromEntries(
    strings.welcomeChips.map((c) => [c.label, c.prompt]),
  );

  function handleLanguageChange(lang: Language) {
    onLanguageChange(lang);
    setMessages([makeWelcome(firstName, lang)]);
    setInput("");
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Allow Sidebar to trigger quick-action sends
  useEffect(() => {
    onQuickAction((prompt) => {
      setInput(prompt);
      // Small delay so state flushes before send
      setTimeout(() => handleSendText(prompt), 50);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      // Build conversation history for API (exclude welcome, only real turns)
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, memberName: member.name, memberPlan: member.plan, memberPlanId: member.planId, memberPlanType: member.planType, memberPremium: member.premium, memberZip: member.zipCode, language }),
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        const { reply, error } = await res.json();
        if (error) throw new Error(error);

        setMessages((prev) => [...prev, buildBotMessage(reply)]);
      } catch {
        setMessages((prev) => [
          ...prev,
          buildBotMessage(strings.errorMsg),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const handleSend = useCallback(() => {
    const prompt = chipPromptMap[input] ?? input;
    handleSendText(prompt);
  }, [input, handleSendText, chipPromptMap]);

  const handleChipClick = useCallback(
    (chip: string) => {
      const prompt = chipPromptMap[chip] ?? chip;
      handleSendText(prompt);
    },
    [handleSendText, chipPromptMap],
  );

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <div className="px-7 py-[18px] bg-white border-b border-clover-border flex items-center justify-between flex-shrink-0 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div>
          <h1
            className="text-[22px] text-clover-dark font-normal leading-tight"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Ask{" "}
            <em className="text-clover-green" style={{ fontStyle: "italic" }}>
              Clovis
            </em>
          </h1>
          <p className="text-[11px] text-clover-muted mt-0.5">
            Hi, {member.name.split(" ")[0]} · {member.plan}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center gap-1 text-[12px] text-clover-mid">
            <span>🌐</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="bg-transparent border-none outline-none cursor-pointer text-[12px] text-clover-mid font-medium pr-1"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.nativeLabel}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-clover-mint border border-clover-border px-3.5 py-1.5 rounded-full text-[12px] text-clover-green font-medium">
            <span className="w-[7px] h-[7px] bg-clover-light rounded-full animate-pulse-dot" />
            {strings.available}
          </div>
        </div>
      </div>

      {/* Accessibility bar */}
      <div className="flex items-center gap-2.5 px-7 py-1.5 bg-clover-bg border-b border-clover-border flex-shrink-0">
        <span className="text-[11px] text-clover-muted mr-1">{strings.textSizeLabel}</span>
        <button
          onClick={() => setTextIdx((i) => Math.max(0, i - 1))}
          disabled={textIdx === 0}
          className="text-[13px] w-6 h-6 flex items-center justify-center border rounded-md transition-all font-sans bg-white border-clover-border text-clover-mid hover:bg-clover-pale hover:border-clover-light hover:text-clover-green disabled:opacity-30 disabled:cursor-not-allowed"
        >−</button>
        <span className="text-[11px] text-clover-muted w-6 text-center">{TEXT_SIZES[textIdx]}</span>
        <button
          onClick={() => setTextIdx((i) => Math.min(TEXT_SIZES.length - 1, i + 1))}
          disabled={textIdx === TEXT_SIZES.length - 1}
          className="text-[13px] w-6 h-6 flex items-center justify-center border rounded-md transition-all font-sans bg-white border-clover-border text-clover-mid hover:bg-clover-pale hover:border-clover-light hover:text-clover-green disabled:opacity-30 disabled:cursor-not-allowed"
        >+</button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-7 pt-7 pb-5 flex flex-col gap-[18px] scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-clover-border [&::-webkit-scrollbar-thumb]:rounded`} style={{ fontSize: TEXT_SIZES[textIdx] }}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onChipClick={handleChipClick}
            initials={member.name.split(" ").map((w) => w[0]).join("").toUpperCase()}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="border-t border-clover-border px-7 py-1.5 text-[11px] text-clover-muted flex items-center gap-2 flex-shrink-0 bg-clover-bg">
        <span className="opacity-60">ⓘ</span>
        <span>{strings.disclaimer}</span>
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={loading}
      />
    </div>
  );
}
