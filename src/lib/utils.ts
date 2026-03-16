import type { Message } from "@/types";
import { ESCALATION_TRIGGERS } from "./constants";

/** Parse CHIPS: [a] | [b] out of bot text, return clean text + chip labels */
export function parseChips(raw: string): { clean: string; chips: string[] } {
  const chipsIndex = raw.search(/CHIPS:/i);
  if (chipsIndex === -1) return { clean: raw, chips: [] };
  const chips = [...raw.slice(chipsIndex).matchAll(/\[(.+?)\]/g)].map((m) => m[1]);
  const clean = raw.slice(0, chipsIndex).trim();
  return { clean, chips };
}

/** Detect whether a reply should surface the phone escalation CTA */
export function shouldEscalate(text: string): boolean {
  const lower = text.toLowerCase();
  return ESCALATION_TRIGGERS.some((t) => lower.includes(t));
}

/** Convert plain-text Claude response into safe React-renderable segments */
export type Segment =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseSegments(text: string): Segment[] {
  const lines = text.split("\n");
  const segments: Segment[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      segments.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      segments.push({ type: "paragraph", text: line });
    }
  }
  flushList();
  return segments;
}

/** Inline bold: replace **text** with <strong>text</strong> segments */
export function parseBold(text: string): Array<string | { bold: string }> {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? { bold: p } : p));
}

/** Create a Message object from a bot reply string */
export function buildBotMessage(raw: string): Message {
  const { clean, chips } = parseChips(raw);
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: clean,
    chips,
    showEscalate: shouldEscalate(clean),
  };
}
