import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import twilio from "twilio";
import { buildSystemPrompt } from "@/lib/constants";
import { runAgenticLoop } from "@/lib/chatEngine";
import type { Role } from "@/types";

const redis = Redis.fromEnv();

const HISTORY_TTL = 60 * 60 * 24; // 24 hours — conversation resets after a day of inactivity
const MAX_HISTORY_TURNS = 10; // keep last 10 user/assistant pairs

type HistoryMessage = { role: Role; content: string };

function historyKey(phone: string) {
  return `sms:history:${phone}`;
}

/** Strip CHIPS: lines, markdown bold, and markdown links for plain SMS text */
function formatForSms(text: string): string {
  return text
    .replace(/^CHIPS:.*$/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twimlResponse(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse Twilio's application/x-www-form-urlencoded body
  const formData = await req.formData();
  const from = formData.get("From") as string | null;
  const body = formData.get("Body") as string | null;

  if (!from || !body) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Validate Twilio signature in production
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken) {
    const signature = req.headers.get("x-twilio-signature") ?? "";
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL ?? req.url;
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") params[key] = value;
    });
    const valid = twilio.validateRequest(authToken, signature, webhookUrl, params);
    if (!valid) {
      console.warn("Invalid Twilio signature from", from);
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Load conversation history from Redis
  const key = historyKey(from);
  const history: HistoryMessage[] = (await redis.get<HistoryMessage[]>(key)) ?? [];

  // Build messages for the agentic loop (keep last N turns)
  const trimmed = history.slice(-(MAX_HISTORY_TURNS * 2));
  const messages = [...trimmed, { role: "user" as Role, content: body.trim() }];

  // Use default member context for SMS (no auth flow)
  const systemPrompt = buildSystemPrompt("the member", "PPO Choice");

  let reply: string;
  try {
    reply = await runAgenticLoop(messages, systemPrompt);
  } catch (err) {
    console.error("SMS chat error:", err);
    return twimlResponse(
      "Sorry, I ran into a technical issue. Please call us at 1-800-801-2060 for immediate help.",
    );
  }

  // Save updated history to Redis with TTL
  const updatedHistory: HistoryMessage[] = [
    ...trimmed,
    { role: "user", content: body.trim() },
    { role: "assistant", content: reply },
  ];
  await redis.set(key, updatedHistory, { ex: HISTORY_TTL });

  return twimlResponse(formatForSms(reply));
}
