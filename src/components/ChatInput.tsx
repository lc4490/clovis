"use client";

import {
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    autoResize();
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div className="px-7 pb-5 pt-4 bg-white border-t border-clover-border flex-shrink-0">
      <div
        className={`flex gap-2.5 items-start bg-clover-bg rounded-2xl px-[18px] py-2.5 pr-3 border-2 transition-all ${
          disabled ? "border-clover-border" : "border-clover-border focus-within:border-clover-light focus-within:shadow-[0_0_0_3px_rgba(82,183,136,0.1)]"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="Type your question here…"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-[15px] text-clover-dark placeholder:text-clover-muted resize-none max-h-[120px] min-h-[24px] leading-relaxed font-sans disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="w-[38px] h-[38px] mt-0.5 bg-clover-green rounded-[10px] flex items-center justify-center flex-shrink-0 hover:bg-clover-light hover:scale-[1.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-clover-border transition-all shadow-[0_1px_3px_rgba(82,183,136,0.4)]"
          aria-label="Send message"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[15px] h-[15px] stroke-white fill-none"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className="text-[10.5px] text-clover-muted text-center mt-1.5 opacity-70">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
