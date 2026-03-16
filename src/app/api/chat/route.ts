import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/constants";
import type { ChatRequest, ChatResponse, FormularySearchResponse, ProviderSearchResponse } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROVIDER_SEARCH_TOOL: Anthropic.Tool = {
  name: "search_providers",
  description: "Search for in-network Clover Health providers by ZIP code, specialty, or name. Use this whenever a member asks to find a doctor, specialist, facility, or any provider.",
  input_schema: {
    type: "object",
    properties: {
      zip_code: {
        type: "string",
        description: "ZIP code to search near (required)",
      },
      q: {
        type: "string",
        description: "Optional name or specialty keyword (e.g. 'cardiologist', 'Dr. Smith')",
      },
      radius: {
        type: "number",
        enum: [5, 10, 20, 50],
        description: "Search radius in miles. Default 10.",
      },
      provider_types: {
        type: "array",
        items: { type: "string", enum: ["practitioner", "facility", "medical equipment"] },
        description: "Filter by provider type. Omit to search all types.",
      },
      page_size: {
        type: "number",
        description: "Number of results to return. Default 5 for chat context.",
      },
    },
    required: ["zip_code"],
  },
};

const FORMULARY_SEARCH_TOOL: Anthropic.Tool = {
  name: "search_formulary",
  description: "Search Clover Health's drug formulary to check if a medication is covered, what tier it's on, and whether prior authorization, step therapy, or quantity limits apply. Use this whenever a member asks about drug coverage, prescription costs, medication tiers, or whether a specific drug is on the formulary.",
  input_schema: {
    type: "object",
    properties: {
      drug_name: {
        type: "string",
        description: "Name of the drug to search for (brand or generic name, e.g. 'metformin', 'Lipitor')",
      },
      drug_tier: {
        type: "string",
        enum: ["preferred-generic", "generic", "non-preferred-generic", "preferred-brand", "non-preferred-brand", "specialty"],
        description: "Optional: filter results to a specific formulary tier",
      },
      page_size: {
        type: "number",
        description: "Number of results to return. Default 5.",
      },
    },
    required: ["drug_name"],
  },
};

async function callFormularySearch(input: Record<string, unknown>, planId?: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("DrugName", input.drug_name as string);
  if (input.drug_tier) params.set("DrugTier", input.drug_tier as string);
  params.set("_count", String(input.page_size ?? 5));
  if (planId) params.set("planId", planId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const url = `${baseUrl}/api/formulary?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    return JSON.stringify({ error: "Formulary search unavailable" });
  }

  const data = (await res.json()) as FormularySearchResponse;

  if (data.results.length === 0) {
    return JSON.stringify({ total: 0, results: [], note: "No formulary results found for that drug name." });
  }

  const summary = data.results.map((d) => ({
    name: d.name,
    dosageForm: d.dosageForm,
    strength: d.strength,
    tier: d.tier,
    tierLabel: d.tierLabel,
    priorAuth: d.priorAuth,
    stepTherapy: d.stepTherapy,
    quantityLimit: d.quantityLimit,
    ...(d.quantityLimit && d.quantityLimitAmount ? { quantityLimitAmount: d.quantityLimitAmount, quantityLimitDays: d.quantityLimitDays } : {}),
  }));

  return JSON.stringify({ total: data.total, results: summary });
}

async function callProviderSearch(input: Record<string, unknown>): Promise<string> {
  const params = new URLSearchParams();
  params.set("zip_code", input.zip_code as string);
  if (input.q) params.set("q", input.q as string);
  if (input.radius) params.set("radius", String(input.radius));
  if (input.page_size) params.set("page_size", String(input.page_size));
  if (input.provider_types) {
    (input.provider_types as string[]).forEach((t) => params.append("provider_types", t));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const url = `${baseUrl}/api/providers?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    return JSON.stringify({ error: "Provider search unavailable" });
  }

  const data = (await res.json()) as ProviderSearchResponse;

  // Trim to what's useful in chat context
  const summary = data.results.slice(0, 5).map((p) => {
    const address = `${p.address1}, ${p.city}, ${p.office_state} ${p.zip_code}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return {
      name: p.full_name,
      practice: p.practice_name,
      specialty: p.specialties?.[0] ?? "",
      address,
      mapsUrl,
      phone: p.phone,
      accepting: p.is_accepting_new_patients,
      preferred: p.is_preferred,
      distance: p.distance ? `${p.distance.toFixed(1)} mi` : null,
      languages: p.languages_spoken?.map((l) => l.label) ?? [],
    };
  });

  return JSON.stringify({ total: data.total, results: summary });
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body = (await req.json()) as ChatRequest;

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { reply: "", error: "Invalid request body" },
        { status: 400 }
      );
    }

    const messages: Anthropic.MessageParam[] = [...body.messages];
    const memberPlanId = body.memberPlanId;
    const systemPrompt = buildSystemPrompt(
      body.memberName ?? "the member",
      body.memberPlan ?? "PPO Choice",
      body.memberZip,
      body.memberPlanType,
      body.memberPremium,
      body.language,
    );

    // Agentic loop: allow Claude to call tools then produce a final reply
    let reply = "";
    for (let i = 0; i < 5; i++) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        tools: [PROVIDER_SEARCH_TOOL, FORMULARY_SEARCH_TOOL],
        messages,
      });

      if (response.stop_reason === "end_turn") {
        reply = response.content
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("");
        break;
      }

      if (response.stop_reason === "tool_use") {
        // Add Claude's response (with tool_use blocks) to history
        messages.push({ role: "assistant", content: response.content });

        // Execute each tool call and collect results
        const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
          response.content
            .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
            .map(async (block) => ({
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: block.name === "search_formulary"
                ? await callFormularySearch(block.input as Record<string, unknown>, memberPlanId)
                : await callProviderSearch(block.input as Record<string, unknown>),
            }))
        );

        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // Unexpected stop reason
      break;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { reply: "", error: "Service unavailable" },
      { status: 500 }
    );
  }
}
