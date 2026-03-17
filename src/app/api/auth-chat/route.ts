import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAuthSystemPrompt } from "@/lib/constants";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, voiceMode = false } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: buildAuthSystemPrompt(voiceMode),
      messages,
    });

    const reply = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Auth chat error:", err);
    return NextResponse.json(
      { reply: "", error: "Service unavailable" },
      { status: 500 },
    );
  }
}
