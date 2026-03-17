"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { VoiceMode } from "./VoiceMode";
import { LANGUAGES, UI_STRINGS, buildMockMemberSystemPrompt } from "@/lib/constants";
import { buildBotMessage } from "@/lib/utils";
import { verifyMember } from "@/lib/mockMembers";
import type { Language } from "@/lib/constants";
import type { AuthStage, AuthFields, Member, Message } from "@/types";
import type { MockMember } from "@/lib/mockMembers";

function makeAuthWelcome(content: string): Message {
  return { id: "auth-welcome", role: "assistant", content };
}

function makeWelcome(firstName: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `Hello, ${firstName}! 👋 I'm your Clover Health assistant — here to help you understand your benefits, check on claims, find doctors, and much more.\n\nWhat can I help you with today?`,
    chips: ["My benefits", "Find a provider", "Check a claim", "Prior authorization"],
  };
}

function parseVerifyToken(raw: string): AuthFields | null {
  const match = raw.match(/^VERIFY:(\{[\s\S]*\})$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as AuthFields;
  } catch {
    return null;
  }
}

interface ChatProps {
  onQuickAction: (setter: (prompt: string) => void) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSidebarToggle?: () => void;
  textIdx: number;
  onTextIdxChange: (i: number) => void;
  textSizes: string[];
  onAuthChange?: (stage: AuthStage, member: MockMember | null) => void;
  member?: Member;
}

export function Chat({
  onQuickAction,
  language,
  onLanguageChange,
  onSidebarToggle,
  textIdx,
  onTextIdxChange,
  textSizes,
  onAuthChange,
  member: legacyMember,
}: ChatProps) {
  const strings = UI_STRINGS[language];
  const isLegacyMode = legacyMember !== undefined;
  const legacyFirstName = legacyMember?.name.split(" ")[0] ?? "";

  const [authStage, setAuthStage] = useState<AuthStage>(
    isLegacyMode ? "authenticated" : "collecting",
  );
  const [verifiedMember, setVerifiedMember] = useState<MockMember | null>(null);
  const [messages, setMessages] = useState<Message[]>(() =>
    isLegacyMode ? [makeWelcome(legacyFirstName)] : [makeAuthWelcome(strings.authWelcome)],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("general");
  const [showMemberCard, setShowMemberCard] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [pendingLang, setPendingLang] = useState<Language | null>(null);

  const displayName = isLegacyMode ? legacyMember!.name : verifiedMember?.name ?? null;
  const displayInitials = isLegacyMode
    ? legacyMember!.initials
    : verifiedMember?.name.split(" ").map((w) => w[0]).join("").toUpperCase() ?? null;
  const displayMemberId = isLegacyMode ? legacyMember!.memberId : verifiedMember?.memberId ?? null;
  const displayPlan = isLegacyMode ? legacyMember!.plan : verifiedMember?.plan ?? null;
  const displayStars = isLegacyMode ? legacyMember!.stars : verifiedMember?.stars ?? null;

  const showVoiceModeRef = useRef(showVoiceMode);
  useEffect(() => { showVoiceModeRef.current = showVoiceMode; }, [showVoiceMode]);

  function detectLoadingStatus(text: string): string {
    const t = text.toLowerCase();
    if (/doctor|provider|specialist|in.?network|physician|dentist|facility|find a/.test(t))
      return "provider";
    if (/drug|medication|prescription|formulary|pill|refill|covered|coverage/.test(t))
      return "formulary";
    return "general";
  }

  const chipPromptMap = Object.fromEntries(
    strings.welcomeChips.map((c) => [c.label, c.prompt]),
  );

  function applyLanguageChange(lang: Language) {
    onLanguageChange(lang);
    if (authStage !== "authenticated") setMessages([makeAuthWelcome(UI_STRINGS[lang].authWelcome)]);
    else setMessages([]);
    setInput("");
    setPendingLang(null);
  }

  function handleLanguageChange(lang: Language) {
    if (lang === language) return;
    const hasHistory = messages.some((m) => m.id !== "auth-welcome" && m.id !== "welcome");
    if (hasHistory) {
      setPendingLang(lang);
    } else {
      applyLanguageChange(lang);
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleSendTextRef = useRef<(text: string) => Promise<string | null>>(() =>
    Promise.resolve(null),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    onQuickAction((prompt) => {
      setInput(prompt);
      setTimeout(() => handleSendTextRef.current(prompt), 50);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendText = useCallback(
    async (text: string): Promise<string | null> => {
      const trimmed = text.trim();
      if (!trimmed || loading) return null;

      if (authStage === "failed") {
        setAuthStage("collecting");
        onAuthChange?.("collecting", null);
        setMessages([makeAuthWelcome(strings.authWelcome)]);
        setInput("");
        return null;
      }

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setLoadingStatus(detectLoadingStatus(trimmed));

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "auth-welcome" && m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        if (isLegacyMode && legacyMember) {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: history,
              memberName: legacyMember.name,
              memberPlan: legacyMember.plan,
              memberPlanId: legacyMember.planId,
              memberPlanType: legacyMember.planType,
              memberPremium: legacyMember.premium,
              memberZip: legacyMember.zipCode,
              language,
            }),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const { reply, error } = await res.json();
          if (error) throw new Error(error);
          setMessages((prev) => [...prev, buildBotMessage(reply)]);
          return reply as string;
        } else if (authStage === "collecting") {
          const res = await fetch("/api/auth-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history, voiceMode: showVoiceModeRef.current, language }),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const { reply, error } = await res.json();
          if (error) throw new Error(error);

          const rawReply = reply.trim();
          const verifyFields = parseVerifyToken(rawReply);

          if (verifyFields) {
            const verified = verifyMember({
              name: verifyFields.name ?? "",
              dob: verifyFields.dob ?? "",
              memberIdOrSsn: verifyFields.memberIdOrSsn ?? "",
            });

            if (verified) {
              setAuthStage("authenticated");
              setVerifiedMember(verified);
              onAuthChange?.("authenticated", verified);
              const firstName = verified.name.split(" ")[0];
              const welcomeText = strings.authVerified(firstName);
              setMessages([buildBotMessage(welcomeText)]);
              return welcomeText;
            } else {
              setAuthStage("failed");
              onAuthChange?.("failed", null);
              const failText = strings.authFailed;
              setMessages((prev) => [...prev, buildBotMessage(failText)]);
              return failText;
            }
          } else {
            setMessages((prev) => [...prev, buildBotMessage(rawReply)]);
            return rawReply;
          }
        } else if (authStage === "authenticated" && verifiedMember) {
          const systemPrompt = buildMockMemberSystemPrompt(verifiedMember, language);
          const res = await fetch("/api/member-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history, systemPrompt }),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const { reply, error } = await res.json();
          if (error) throw new Error(error);
          setMessages((prev) => [...prev, buildBotMessage(reply)]);
          return reply as string;
        }
        return null;
      } catch {
        setMessages((prev) => [...prev, buildBotMessage(strings.errorMsg)]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, authStage, verifiedMember, isLegacyMode, legacyMember, language, strings.errorMsg, onAuthChange],
  );

  useEffect(() => { handleSendTextRef.current = handleSendText; }, [handleSendText]);

  const handleSend = useCallback(() => {
    handleSendText(chipPromptMap[input] ?? input);
  }, [input, handleSendText, chipPromptMap]);

  const handleChipClick = useCallback(
    (chip: string) => handleSendText(chipPromptMap[chip] ?? chip),
    [handleSendText, chipPromptMap],
  );

  const showingMember = authStage === "authenticated" && displayName !== null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {pendingLang && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full">
            <p className="text-clover-dark font-semibold text-base mb-1">{strings.langSwitchTitle}</p>
            <p className="text-clover-mid text-sm mb-5">{strings.langSwitchBody}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingLang(null)}
                className="flex-1 py-2 rounded-lg border border-clover-border text-clover-mid text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {strings.langSwitchCancel}
              </button>
              <button
                onClick={() => applyLanguageChange(pendingLang)}
                className="flex-1 py-2 rounded-lg bg-clover-green text-white text-sm font-medium hover:bg-clover-dark transition-colors"
              >
                {strings.langSwitchConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVoiceMode && (
        <VoiceMode
          onClose={() => setShowVoiceMode(false)}
          onSend={handleSendText}
          language={language}
        />
      )}

      {/* Top bar */}
      <div className="px-4 sm:px-8 py-5 bg-white border-b border-clover-border flex items-center gap-4 flex-shrink-0 shadow-sm relative">
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
            <span className="text-[12px] text-clover-green font-semibold leading-none">
              {strings.available}
            </span>
          </div>
        </div>

        {showingMember && displayInitials && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMemberCard((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white hover:opacity-90 active:scale-95 transition-all shadow-sm"
              style={{ background: "#52B788" }}
              aria-label="View membership card"
              title={displayName ?? ""}
            >
              {displayInitials}
            </button>
            {showMemberCard && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMemberCard(false)} />
                <div
                  className="absolute top-[calc(100%+6px)] right-0 z-30 w-60 rounded-xl shadow-xl p-4 border border-white/30"
                  style={{ background: "#52B788" }}
                >
                  <p className="text-white font-semibold text-[14px] mb-0.5">{displayName}</p>
                  <p className="text-white/60 text-xs font-light">ID: {displayMemberId}</p>
                  <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[11px] bg-clover-light text-white px-2 py-0.5 rounded-full font-medium">
                      {displayPlan}
                    </span>
                    {displayStars !== null && (
                      <span className="text-[11px] text-white/60">
                        {"⭐".repeat(displayStars)} {displayStars}-Star
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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
          onClick={() => onTextIdxChange(Math.min(textSizes.length - 1, textIdx + 1))}
          disabled={textIdx === textSizes.length - 1}
          className="text-[16px] w-8 h-8 flex items-center justify-center border-2 rounded-lg transition-all font-sans bg-white border-clover-border text-clover-mid hover:bg-clover-pale hover:border-clover-light hover:text-clover-green disabled:opacity-30 disabled:cursor-not-allowed font-bold"
        >
          +
        </button>

        {/* Voice mode button */}
        <button
          type="button"
          onClick={() => setShowVoiceMode(true)}
          title="Start voice conversation"
          aria-label="Start voice conversation"
          className="w-8 h-8 flex items-center justify-center border-2 rounded-lg transition-all bg-white border-clover-border text-clover-muted hover:border-clover-light hover:text-clover-green hover:bg-clover-pale"
        >
          <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

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
        className="flex-1 overflow-y-auto px-4 sm:px-7 pt-5 sm:pt-7 pb-5 flex flex-col gap-[18px] scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-clover-border [&::-webkit-scrollbar-thumb]:rounded"
        style={{ fontSize: textSizes[textIdx] }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onChipClick={handleChipClick}
            initials={displayInitials ?? "?"}
            escalate={{
              text: strings.escalateText,
              call: strings.escalateCall,
              hours: strings.escalateHours,
            }}
          />
        ))}
        {loading && <TypingIndicator status={loadingStatus} />}
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
