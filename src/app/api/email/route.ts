import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { Redis } from "@upstash/redis";
import { buildSystemPrompt } from "@/lib/constants";
import { runAgenticLoop } from "@/lib/chatEngine";
import type { Role } from "@/types";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const redis = Redis.fromEnv();

const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days — email threads are slower-paced
const MAX_HISTORY_TURNS = 10;

type HistoryMessage = { role: Role; content: string };

function historyKey(email: string) {
  return `email:history:${email.toLowerCase()}`;
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
    // Stop at signature block
    if (line.trim() === "--") break;

    // Stop at "On ... wrote:" divider (may span multiple lines, so match start)
    if (/^On .+wrote:$/i.test(line.trim())) break;

    // Stop at Outlook-style divider
    if (/^-{4,}(Original Message|Forwarded Message)-{4,}/i.test(line.trim()))
      break;

    // Skip quoted lines
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
  // SendGrid Inbound Parse sends multipart/form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const fromRaw = formData.get("from") as string | null;
  const subject = (formData.get("subject") as string | null) ?? "(no subject)";
  const textBody = (formData.get("text") as string | null) ?? "";
  console.log("RAW EMAIL BODY:", textBody);

  if (!fromRaw || !textBody) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const senderEmail = parseSenderEmail(fromRaw);
  const userMessage = stripReplyQuote(textBody);

  if (!userMessage) {
    // Empty after stripping — nothing to respond to
    return new NextResponse("OK", { status: 200 });
  }

  // Load conversation history from Redis
  const key = historyKey(senderEmail);
  const history: HistoryMessage[] =
    (await redis.get<HistoryMessage[]>(key)) ?? [];

  const trimmed = history.slice(-(MAX_HISTORY_TURNS * 2));
  const messages = [...trimmed, { role: "user" as Role, content: userMessage }];

  const systemPrompt = buildSystemPrompt("the member", "PPO Choice");

  let reply: string;
  try {
    reply = await runAgenticLoop(messages, systemPrompt);
  } catch (err) {
    console.error("Email chat error:", err);
    // Still return 200 to SendGrid so it doesn't retry
    return new NextResponse("OK", { status: 200 });
  }

  // Save updated history
  const updatedHistory: HistoryMessage[] = [
    ...trimmed,
    { role: "user", content: userMessage },
    { role: "assistant", content: reply },
  ];
  await redis.set(key, updatedHistory, { ex: HISTORY_TTL });

  const replyText = formatForEmail(reply);
  const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS ?? "ask@cloverhealth.example.com";

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

  // Always return 200 — SendGrid will retry on non-2xx
  return new NextResponse("OK", { status: 200 });
}
