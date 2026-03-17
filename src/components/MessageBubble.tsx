"use client";

import { parseSegments, parseBold, type InlinePart } from "@/lib/utils";
import { PHONE_NUMBER } from "@/lib/constants";
import type { Message } from "@/types";

interface EscalateStrings {
  text: string;
  call: string;
  hours: string;
}

interface MessageBubbleProps {
  message: Message;
  onChipClick: (text: string) => void;
  initials?: string;
  escalate?: EscalateStrings;
}

function InlineText({ text }: { text: string }) {
  const parts = parseBold(text);
  return (
    <>
      {parts.map((p: InlinePart, i) => {
        if (typeof p === "string") return <span key={i}>{p}</span>;
        if ("bold" in p) return <strong key={i} className="font-semibold">{p.bold}</strong>;
        return (
          <a
            key={i}
            href={p.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clover-green underline underline-offset-2 hover:text-clover-light transition-colors"
          >
            {p.link.text}
          </a>
        );
      })}
    </>
  );
}

function BotBubble({ message, onChipClick, escalate }: MessageBubbleProps) {
  const segments = parseSegments(message.content);

  return (
    <div className="flex gap-3 max-w-[96%] sm:max-w-[72%] animate-fade-up">
      {/* Avatar */}
      <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-sm bg-clover-pale border-2 border-clover-border mt-0.5">
        🍀
      </div>

      {/* Bubble */}
      <div className="bg-white border border-clover-border rounded-2xl rounded-tl-[4px] px-[18px] py-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] leading-relaxed text-clover-dark">
        {segments.map((seg, i) =>
          seg.type === "paragraph" ? (
            <p key={i} className="mb-2 last:mb-0">
              <InlineText text={seg.text} />
            </p>
          ) : (
            <ul key={i} className="list-disc ml-5 mb-2 space-y-1">
              {seg.items.map((item, j) => (
                <li key={j}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          )
        )}

        {/* Quick reply chips */}
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onChipClick(chip)}
                className="bg-clover-mint border border-clover-light text-clover-green px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-medium hover:bg-clover-pale hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Escalation notice */}
        {message.showEscalate && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[10px] px-3.5 py-3 text-amber-900 flex gap-2.5 items-center">
            <span className="text-base">📞</span>
            <span>
              {escalate?.text ?? "A live agent can help with this."}{" "}
              <a
                href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
                className="font-semibold underline underline-offset-2 hover:text-amber-700 transition-colors"
              >
                {escalate?.call ?? "Call"} {PHONE_NUMBER}
              </a>{" "}
              <span className="text-amber-700">{escalate?.hours ?? "(Mon–Fri, 8am–8pm ET)"}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ message, initials }: { message: Message; initials?: string }) {
  return (
    <div className="flex gap-3 max-w-[88%] sm:max-w-[72%] self-end flex-row-reverse animate-fade-up">
      <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-semibold bg-clover-green text-white mt-0.5">
        {initials ?? "?"}
      </div>
      <div className="bg-clover-green text-white rounded-2xl rounded-tr-[4px] px-[18px] py-[14px] leading-relaxed shadow-[0_2px_12px_rgba(82,183,136,0.25)]">
        {message.content}
      </div>
    </div>
  );
}

export function MessageBubble({ message, onChipClick, initials, escalate }: MessageBubbleProps) {
  if (message.role === "user") return <UserBubble message={message} initials={initials} />;
  return <BotBubble message={message} onChipClick={onChipClick} escalate={escalate} />;
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[88%] sm:max-w-[72%]">
      <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-sm bg-clover-pale border-2 border-clover-border mt-0.5">
        🍀
      </div>
      <div className="bg-white border border-clover-border rounded-2xl rounded-tl-[4px] px-5 py-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex gap-[5px] items-center">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-[7px] h-[7px] bg-clover-light rounded-full inline-block animate-bounce-dot opacity-80"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
