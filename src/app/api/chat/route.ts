import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/constants";
import { runAgenticLoop } from "@/lib/chatEngine";
import type { ChatRequest, ChatResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body = (await req.json()) as ChatRequest;

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { reply: "", error: "Invalid request body" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(
      body.memberName ?? "the member",
      body.memberPlan ?? "PPO Choice",
      body.memberZip,
      body.memberPlanType,
      body.memberPremium,
      body.language,
    );

    const reply = await runAgenticLoop(body.messages, systemPrompt, body.memberPlanId);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { reply: "", error: "Service unavailable" },
      { status: 500 }
    );
  }
}
