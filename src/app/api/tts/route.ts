import { NextRequest } from "next/server";

function cleanText(text: string): string {
  return text
    .replace(/CHIPS:.*$/m, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-•]\s+/gm, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const { text, voice = "fable" } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response("TTS not configured", { status: 503 });
  }

  const clean = cleanText(text);
  if (!clean) return new Response("Empty text", { status: 400 });

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "tts-1", input: clean, voice }),
  });

  if (!res.ok) {
    return new Response("TTS upstream error", { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
