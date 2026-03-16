"use client";

import { useState } from "react";
import type { Member } from "@/types";

const PLAN_OPTIONS = [
  { label: "PPO Choice",  value: "PPO Choice",  stars: 4 },
  { label: "PPO Plus",    value: "PPO Plus",    stars: 4 },
  { label: "HMO Classic", value: "HMO Classic", stars: 4 },
  { label: "HMO Flex",    value: "HMO Flex",    stars: 3 },
] as const;

interface SetupPageProps {
  onComplete: (member: Member) => void;
}

export function SetupPage({ onComplete }: SetupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [plan, setPlan]           = useState("PPO Choice");

  const canSubmit = firstName.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const selected  = PLAN_OPTIONS.find((p) => p.value === plan) ?? PLAN_OPTIONS[0];
    const fullName  = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const initials  = `${firstName[0]}${lastName[0] ?? ""}`.toUpperCase();
    const memberId  = `CLOV-${Math.floor(1000 + Math.random() * 9000)}-NJ`;

    onComplete({ name: fullName, initials, memberId, plan: selected.label, stars: selected.stars });
  };

  return (
    <div className="min-h-screen bg-clover-bg flex font-sans">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[400px] bg-clover-green flex-col flex-shrink-0 relative overflow-hidden p-10">
        {/* Depth overlays */}
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-black/[0.08] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-16">
            <div
              className="w-8 h-8 flex items-center justify-center text-base flex-shrink-0"
              style={{ background: "#52B788", borderRadius: "50% 4px 50% 4px" }}
            >
              🍀
            </div>
            <span
              className="text-white text-xl tracking-tight"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              Clover Health
            </span>
          </div>

          {/* Headline */}
          <div className="mb-auto">
            <h1
              className="text-[38px] text-white font-normal leading-tight mb-4"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              Ask{" "}
              <em style={{ fontStyle: "italic" }}>Clovis</em>
            </h1>
            <p className="text-white/65 text-[14px] leading-relaxed mb-10">
              Your personal Medicare guide — instant answers about your benefits, claims, and coverage.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: "🔍", text: "Understand your benefits" },
                { icon: "📋", text: "Check on claims instantly" },
                { icon: "👩‍⚕️", text: "Find in-network doctors" },
                { icon: "💊", text: "Manage your OTC allowance" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-white/85 text-[13px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/35 text-[11px]">
            General plan information only — not medical advice.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div
              className="w-7 h-7 flex items-center justify-center text-sm"
              style={{ background: "#52B788", borderRadius: "50% 4px 50% 4px" }}
            >
              🍀
            </div>
            <span
              className="text-clover-dark text-lg tracking-tight"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              Clover Health
            </span>
          </div>

          <h2
            className="text-[28px] text-clover-dark font-normal leading-tight mb-1"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Set up your profile
          </h2>
          <p className="text-[13px] text-clover-muted mb-8">
            This helps Clovis personalize answers to your specific plan and coverage.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Margaret"
                  className="bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark placeholder:text-clover-muted outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
                  autoFocus
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Torres"
                  className="bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark placeholder:text-clover-muted outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Plan select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                Your plan
              </label>
              <div className="relative">
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full appearance-none bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all pr-10 cursor-pointer"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} · {p.stars}-Star
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <svg
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-clover-muted pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Member ID note */}
            <p className="text-[12px] text-clover-muted -mt-1">
              A member ID will be generated automatically.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 bg-clover-green text-white rounded-xl py-3.5 text-[14px] font-medium hover:bg-clover-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(82,183,136,0.4)] hover:shadow-[0_4px_12px_rgba(82,183,136,0.35)] hover:-translate-y-px active:translate-y-0"
            >
              Start chatting →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
