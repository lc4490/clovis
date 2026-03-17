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
  onSidebarToggle?: () => void;
  textIdx: number;
  onTextIdxChange: (i: number) => void;
  textSizes: string[];
}

export function Chat({
  onQuickAction,
  member,
  language,
  onLanguageChange,
  onSidebarToggle,
  textIdx,
  onTextIdxChange,
  textSizes,
}: ChatProps) {
  const firstName = member.name.split(" ")[0];
  const strings = UI_STRINGS[language];

  const [messages, setMessages] = useState<Message[]>(() => [
    makeWelcome(firstName, language),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
          body: JSON.stringify({
            messages: history,
            memberName: member.name,
            memberPlan: member.plan,
            memberPlanId: member.planId,
            memberPlanType: member.planType,
            memberPremium: member.premium,
            memberZip: member.zipCode,
            language,
          }),
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        const { reply, error } = await res.json();
        if (error) throw new Error(error);

        setMessages((prev) => [...prev, buildBotMessage(reply)]);
      } catch {
        setMessages((prev) => [...prev, buildBotMessage(strings.errorMsg)]);
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="px-4 sm:px-8 py-5 bg-white border-b border-clover-border flex items-center gap-4 flex-shrink-0 shadow-sm">
        {/* Logo button — mobile only, opens sidebar drawer */}
        <button
          className="sm:hidden w-9 h-9 flex items-center justify-center text-base flex-shrink-0 shadow-sm"
          style={{ background: "#7ECBA5", borderRadius: "50% 6px 50% 6px" }}
          onClick={onSidebarToggle}
          aria-label="Open menu"
        >
          🍀
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h1
            className="text-[28px] sm:text-[32px] text-clover-dark font-normal leading-none tracking-tight"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            {strings.askClovis}{" "}
            <em className="text-clover-green" style={{ fontStyle: "italic" }}>
              Clovis
            </em>
          </h1>
          <div className="inline-flex items-center gap-2 bg-clover-mint border border-clover-light/50 rounded-full pl-2 pr-3 py-1 w-fit">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clover-light opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-clover-green" />
            </span>
            <span className="text-[12px] text-clover-green font-semibold leading-none">{strings.available}</span>
          </div>
        </div>

        {/* Log out */}
        <button
          onClick={() => window.location.reload()}
          className="hidden sm:flex items-center gap-2 bg-clover-bg border border-clover-border rounded-xl px-3.5 py-2 text-[13px] text-clover-mid font-medium hover:bg-clover-pale hover:border-clover-light hover:text-clover-dark transition-all flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>

      {/* Accessibility bar */}
      <div className="flex items-center gap-3 px-4 sm:px-7 py-2.5 bg-clover-bg border-b border-clover-border flex-shrink-0">
        <span className="text-[13px] font-semibold text-clover-dark mr-1">
          {strings.textSizeLabel}
        </span>
        <button
          onClick={() => onTextIdxChange(Math.max(0, textIdx - 1))}
          disabled={textIdx === 0}
          className="text-[16px] w-8 h-8 flex items-center justify-center border-2 rounded-lg transition-all font-sans bg-white border-clover-border text-clover-mid hover:bg-clover-pale hover:border-clover-light hover:text-clover-green disabled:opacity-30 disabled:cursor-not-allowed font-bold"
        >
          −
        </button>
        <span className="text-[13px] font-semibold text-clover-dark w-8 text-center">
          {textSizes[textIdx]}
        </span>
        <button
          onClick={() =>
            onTextIdxChange(Math.min(textSizes.length - 1, textIdx + 1))
          }
          disabled={textIdx === textSizes.length - 1}
          className="text-[16px] w-8 h-8 flex items-center justify-center border-2 rounded-lg transition-all font-sans bg-white border-clover-border text-clover-mid hover:bg-clover-pale hover:border-clover-light hover:text-clover-green disabled:opacity-30 disabled:cursor-not-allowed font-bold"
        >
          +
        </button>

        {/* Language dropdown */}
        <div className="ml-auto relative">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="appearance-none bg-white border border-clover-border rounded-lg pl-2.5 pr-7 py-1 text-clover-mid font-medium outline-none cursor-pointer hover:border-clover-light focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
            style={{ fontSize: textSizes[textIdx] }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-clover-muted"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto px-4 sm:px-7 pt-5 sm:pt-7 pb-5 flex flex-col gap-[18px] scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-clover-border [&::-webkit-scrollbar-thumb]:rounded`}
        style={{ fontSize: textSizes[textIdx] }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onChipClick={handleChipClick}
            initials={member.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
            escalate={{
              text: strings.escalateText,
              call: strings.escalateCall,
              hours: strings.escalateHours,
            }}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="border-t border-clover-border px-4 sm:px-7 py-1.5 text-[11px] text-clover-muted flex items-center gap-2 flex-shrink-0 bg-clover-bg">
        <span className="opacity-60">ⓘ</span>
        <span>{strings.disclaimer}</span>
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={loading}
        placeholder={strings.inputPlaceholder}
        hint={strings.inputHint}
        fontSize={textSizes[textIdx]}
      />
    </div>
  );
}
