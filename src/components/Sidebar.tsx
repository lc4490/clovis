"use client";

import { PHONE_NUMBER, UI_STRINGS } from "@/lib/constants";
import type { Language } from "@/lib/constants";
import type { Member } from "@/types";

interface SidebarProps {
  onQuickAction: (prompt: string) => void;
  member: Member;
  language?: Language;
  onClose?: () => void;
  fontSize?: string;
}

export function Sidebar({ onQuickAction, member, language = "en", onClose, fontSize = "16px" }: SidebarProps) {
  const strings = UI_STRINGS[language];
  return (
    <aside className="w-[280px] h-full bg-clover-green flex flex-col flex-shrink-0 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.06] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-black/[0.08] pointer-events-none" />

      {/* Header — pinned */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10 relative z-20 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "#52B788", borderRadius: "50% 4px 50% 4px" }}
          >
            🍀
          </div>
          <span
            className="text-white text-xl tracking-tight flex-1"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Clover Health
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 transition-colors text-white/60 flex-shrink-0"
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-white/55 text-[11px] uppercase tracking-widest ml-[42px] font-normal">
          {strings.memberPortal}
        </p>
      </div>

      {/* Scrollable middle */}
      <div className="flex-1 overflow-y-auto relative z-20">
        {/* Member card */}
        <div className="mx-4 my-5 bg-white/10 border border-white/20 rounded-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-medium mb-1.5">
            {strings.signedInAs}
          </p>
          <p className="text-white font-semibold mb-0.5" style={{ fontSize }}>{member.name}</p>
          <p className="text-white/60 text-xs font-light">{strings.memberId}: {member.memberId}</p>
          <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] bg-clover-light text-white px-2 py-0.5 rounded-full font-medium">
              {member.plan}
            </span>
            <span className="text-[11px] text-white/60">
              {"⭐".repeat(member.stars)} {member.stars}-Star Plan
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <p className="px-4 pb-2 text-[10px] text-white/50 uppercase tracking-widest font-medium">
          {strings.commonTopics}
        </p>

        <nav className="flex flex-col gap-0.5 pb-4">
          {strings.quickActions.map(({ icon, label, prompt }) => (
            <button
              key={label}
              onClick={() => onQuickAction(prompt)}
              className="flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg hover:bg-white/15 active:bg-white/20 transition-all text-left w-[calc(100%-16px)] group"
            >
              <div className="w-7 h-7 bg-white/[0.15] rounded-md flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-white/25 transition-colors">
                {icon}
              </div>
              <span className="text-white/90 font-normal group-hover:text-white transition-colors" style={{ fontSize }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer CTA — pinned */}
      <div className="p-4 border-t border-white/10 relative z-20 flex-shrink-0">
        <a
          href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
          className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-[10px] px-3.5 py-3 hover:bg-white/20 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <span className="text-lg">📞</span>
          <div className="flex-1">
            <p className="font-semibold text-white" style={{ fontSize }}>{strings.stillNeedHelp}</p>
            <p className="text-white/50" style={{ fontSize }}>{strings.callLabel(PHONE_NUMBER)}</p>
          </div>
        </a>
      </div>
    </aside>
  );
}
