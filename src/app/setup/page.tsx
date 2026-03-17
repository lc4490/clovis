"use client";

import { useState } from "react";
import { SetupPage } from "@/components/SetupPage";
import type { Language } from "@/lib/constants";
import type { Member } from "@/types";

/**
 * Hidden route — not linked from the main app.
 * Access at /setup to view the original SetupPage flow (for portfolio/process demo).
 */
export default function SetupRoute() {
  const [language, setLanguage] = useState<Language>("en");
  const [member, setMember] = useState<Member | null>(null);

  if (member) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-clover-bg font-sans">
        <div className="text-center max-w-sm px-6">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-[24px] text-clover-dark font-normal mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
            Setup complete
          </h2>
          <p className="text-clover-muted text-[15px] mb-1">Welcome, <strong>{member.name}</strong></p>
          <p className="text-clover-muted text-[13px]">{member.plan} · {member.memberId}</p>
          <p className="text-clover-muted text-[12px] mt-4 opacity-60">This is the /setup demo route — not connected to the live chat.</p>
        </div>
      </div>
    );
  }

  return (
    <SetupPage
      onComplete={setMember}
      language={language}
      onLanguageChange={setLanguage}
    />
  );
}
