import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { Redis } from "@upstash/redis";
import Anthropic from "@anthropic-ai/sdk";
import { buildAuthSystemPrompt, buildSystemPrompt } from "@/lib/constants";
import { runAgenticLoop } from "@/lib/chatEngine";
import type { Role } from "@/types";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const redis = Redis.fromEnv();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days
const MAX_HISTORY_TURNS = 10;

type HistoryMessage = { role: Role; content: string };

type EmailSession = {
  verified: boolean;
  memberName?: string;
  authHistory: HistoryMessage[];
  chatHistory: HistoryMessage[];
};

function sessionKey(email: string) {
  return `email:session:${email.toLowerCase()}`;
}

/**
 * Strip quoted reply history from inbound email body.
 * Handles:
 *   - Lines starting with ">" (standard quote)
 *   - "On <date>, <name> wrote:" dividers
 *   - "-----Original Message-----" dividers
 *   - Signature blocks starting with "-- " on its own line
 */
function stripReplyQuote(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    if (line.trim() === "--") break;
    if (/^On .+wrote:$/i.test(line.trim())) break;
    if (/^-{4,}(Original Message|Forwarded Message)-{4,}/i.test(line.trim())) break;
    if (line.startsWith(">")) continue;
    result.push(line);
  }

  return result.join("\n").trim();
}

/** Strip CHIPS lines and markdown for plain-text email */
function formatForEmail(text: string): string {
  return text
    .replace(/^CHIPS:.*$/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Extract sender email from "Name <email>" or bare "email" */
function parseSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const fromRaw = formData.get("from") as string | null;
  const subject = (formData.get("subject") as string | null) ?? "(no subject)";
  const textBody = (formData.get("text") as string | null) ?? "";

  if (!fromRaw || !textBody) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const senderEmail = parseSenderEmail(fromRaw);
  const userMessage = stripReplyQuote(textBody);

  if (!userMessage) {
    return new NextResponse("OK", { status: 200 });
  }

  // Load session from Redis
  const key = sessionKey(senderEmail);
  const session: EmailSession = (await redis.get<EmailSession>(key)) ?? {
    verified: false,
    authHistory: [],
    chatHistory: [],
  };

  let reply: string;

  if (!session.verified) {
    // ── AUTH PHASE ──
    const authTrimmed = session.authHistory.slice(-(MAX_HISTORY_TURNS * 2));
    const authMessages = [...authTrimmed, { role: "user" as Role, content: userMessage }];

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: buildAuthSystemPrompt(false),
        messages: authMessages,
      });
      reply = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    } catch (err) {
      console.error("Auth email error:", err);
      return new NextResponse("OK", { status: 200 });
    }

    // Check if Claude emitted the VERIFY token
    const verifyMatch = reply.match(/VERIFY:(\{.*\})/);
    if (verifyMatch) {
      let verifyData: { name?: string } = {};
      try {
        verifyData = JSON.parse(verifyMatch[1]);
      } catch {
        // ignore parse error
      }

      session.verified = true;
      session.memberName = verifyData.name ?? "the member";
      session.authHistory = [
        ...authTrimmed,
        { role: "user", content: userMessage },
        { role: "assistant", content: reply },
      ];

      // Replace reply with a friendly confirmed message
      reply = `Thank you, ${session.memberName}! I've verified your identity. How can I help you today?`;
    } else {
      session.authHistory = [
        ...authTrimmed,
        { role: "user", content: userMessage },
        { role: "assistant", content: reply },
      ];
    }
  } else {
    // ── CHAT PHASE ──
    const chatTrimmed = session.chatHistory.slice(-(MAX_HISTORY_TURNS * 2));
    const chatMessages = [...chatTrimmed, { role: "user" as Role, content: userMessage }];
    const systemPrompt = buildSystemPrompt(session.memberName ?? "the member", "PPO Choice");

    try {
      reply = await runAgenticLoop(chatMessages, systemPrompt);
    } catch (err) {
      console.error("Email chat error:", err);
      return new NextResponse("OK", { status: 200 });
    }

    session.chatHistory = [
      ...chatTrimmed,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ];
  }

  await redis.set(key, session, { ex: HISTORY_TTL });

  const replyText = formatForEmail(reply);
  const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? "ask@cloverhealth.example.com";

  try {
    await sgMail.send({
      to: senderEmail,
      from: fromAddress,
      subject: replySubject,
      text: replyText,
    });
  } catch (err) {
    console.error("SendGrid send error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}
