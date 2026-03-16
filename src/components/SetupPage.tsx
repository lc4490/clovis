"use client";

import { useState } from "react";
import { LANGUAGES, UI_STRINGS } from "@/lib/constants";
import type { Language } from "@/lib/constants";
import type { Member, CloverPlan } from "@/types";

interface SetupPageProps {
  onComplete: (member: Member) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function SetupPage({ onComplete, language, onLanguageChange }: SetupPageProps) {
  const s = UI_STRINGS[language].setup;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");
  const [plans, setPlans] = useState<CloverPlan[] | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const canFindPlans = firstName.trim().length > 0 && /^\d{5}$/.test(zip);
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) ?? null;
  const canSubmit = selectedPlan !== null;

  async function handleFindPlans(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!canFindPlans) return;
    setLoading(true);
    setPlansError(null);
    setPlans(null);
    setSelectedPlanId(null);
    try {
      const res = await fetch(`/api/plans?zip_code=${encodeURIComponent(zip)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setPlansError(res.status === 404 ? s.errorNoPlans : s.errorFailed);
      } else {
        setPlans(data.plans);
      }
    } catch {
      setPlansError(s.errorFailed);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!canSubmit || !selectedPlan) return;

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const initials = `${firstName[0]}${lastName[0] ?? ""}`.toUpperCase();
    const memberId = `CLOV-${Math.floor(1000 + Math.random() * 9000)}-NJ`;

    onComplete({
      name: fullName,
      initials,
      memberId,
      plan: selectedPlan.name,
      planId: selectedPlan.id,
      planType: selectedPlan.type,
      premium: selectedPlan.premium,
      stars: selectedPlan.stars,
      zipCode: zip,
    });
  }

  return (
    <div className="min-h-screen bg-clover-bg flex font-sans">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[400px] bg-clover-green flex-col flex-shrink-0 relative overflow-hidden p-10">
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-black/[0.08] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
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

          <div className="mb-auto">
            <h1
              className="text-[38px] text-white font-normal leading-tight mb-4"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {UI_STRINGS[language].askClovis}{" "}<em style={{ fontStyle: "italic" }}>Clovis</em>
            </h1>
            <p className="text-white/65 text-[14px] leading-relaxed mb-10">
              {s.subtitle}
            </p>

            <div className="flex flex-col gap-3">
              {s.features.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-white/85 text-[13px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/35 text-[11px]">{s.disclaimer}</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
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

          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h2
              className="text-[28px] text-clover-dark font-normal leading-tight"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {s.heading}
            </h2>
            {/* Language dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="appearance-none bg-white border border-clover-border rounded-lg pl-2.5 pr-7 py-1.5 text-[12px] text-clover-mid font-medium outline-none cursor-pointer hover:border-clover-light focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-clover-muted"
                viewBox="0 0 12 12" fill="none"
              >
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-[13px] text-clover-muted mb-8">{s.subtitle}</p>

          <form onSubmit={plans ? handleSubmit : handleFindPlans} className="flex flex-col gap-5">
            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                  {s.firstName}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={s.firstNamePlaceholder}
                  className="bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark placeholder:text-clover-muted outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
                  autoFocus
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                  {s.lastName}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={s.lastNamePlaceholder}
                  className="bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark placeholder:text-clover-muted outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
                />
              </div>
            </div>

            {/* ZIP + Find Plans */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                {s.zipCode}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => {
                    setZip(e.target.value.replace(/\D/g, ""));
                    if (plans) { setPlans(null); setSelectedPlanId(null); setPlansError(null); }
                  }}
                  placeholder="07030"
                  className="flex-1 bg-white border border-clover-border rounded-xl px-4 py-3 text-[14px] text-clover-dark placeholder:text-clover-muted outline-none focus:border-clover-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.1)] transition-all"
                />
                <button
                  type="submit"
                  disabled={!canFindPlans || loading}
                  className="px-4 py-3 bg-clover-green text-white rounded-xl text-[13px] font-medium hover:bg-clover-light disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap shadow-[0_1px_3px_rgba(82,183,136,0.4)]"
                >
                  {loading ? s.searching : s.findPlans}
                </button>
              </div>
            </div>

            {/* Error */}
            {plansError && (
              <p className="text-[13px] text-red-500 -mt-1">{plansError}</p>
            )}

            {/* Plan cards */}
            {plans && plans.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-clover-mid uppercase tracking-wider font-medium">
                  {s.selectPlan}
                </label>
                <div className="flex flex-col gap-2">
                  {plans.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`w-full text-left rounded-xl border px-4 py-3 transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-clover-green bg-[rgba(82,183,136,0.06)] shadow-[0_0_0_2px_rgba(82,183,136,0.25)]"
                            : "border-clover-border bg-white hover:border-clover-light"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              p.type === "HMO"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {p.type}
                          </span>
                          <span className="text-[14px] text-clover-dark font-medium truncate">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[13px] text-clover-muted">
                            {p.premium === 0 ? "$0/mo" : `$${p.premium}/mo`}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-clover-green border-clover-green"
                                : "border-clover-border"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M1 4l2.5 2.5L9 1"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            {plans && (
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 bg-clover-green text-white rounded-xl py-3.5 text-[14px] font-medium hover:bg-clover-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(82,183,136,0.4)] hover:shadow-[0_4px_12px_rgba(82,183,136,0.35)] hover:-translate-y-px active:translate-y-0"
              >
                {s.startChatting}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
