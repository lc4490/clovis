import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchFormulary } from "@/lib/formulary";
import { fetchProviders } from "@/lib/providers";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROVIDER_SEARCH_TOOL: Anthropic.Tool = {
  name: "search_providers",
  description:
    "Search for in-network Clover Health providers by ZIP code, specialty, or name.",
  input_schema: {
    type: "object",
    properties: {
      zip_code: { type: "string", description: "ZIP code to search near (required)" },
      q: { type: "string", description: "Optional name or specialty keyword" },
      radius: { type: "number", enum: [5, 10, 20, 50], description: "Search radius in miles. Default 10." },
      provider_types: {
        type: "array",
        items: { type: "string", enum: ["practitioner", "facility", "medical equipment"] },
      },
      page_size: { type: "number", description: "Number of results. Default 5." },
    },
    required: ["zip_code"],
  },
};

const FORMULARY_SEARCH_TOOL: Anthropic.Tool = {
  name: "search_formulary",
  description:
    "Search Clover Health's drug formulary to check coverage, tier, and restrictions.",
  input_schema: {
    type: "object",
    properties: {
      drug_name: { type: "string", description: "Drug name (brand or generic)" },
      drug_tier: {
        type: "string",
        enum: ["preferred-generic", "generic", "non-preferred-generic", "preferred-brand", "non-preferred-brand", "specialty"],
      },
      page_size: { type: "number" },
    },
    required: ["drug_name"],
  },
};

async function callFormularySearch(
  input: Record<string, unknown>,
  planId?: string,
): Promise<string> {
  try {
    const data = await fetchFormulary(
      input.drug_name as string,
      input.drug_tier as string | undefined,
      Number(input.page_size ?? 5),
      planId,
    );
    if (data.results.length === 0)
      return JSON.stringify({ total: 0, results: [], note: "No formulary results found." });
    return JSON.stringify({
      total: data.total,
      results: data.results.map((d) => ({
        name: d.name,
        dosageForm: d.dosageForm,
        strength: d.strength,
        tier: d.tier,
        tierLabel: d.tierLabel,
        priorAuth: d.priorAuth,
        stepTherapy: d.stepTherapy,
        quantityLimit: d.quantityLimit,
        ...(d.quantityLimit && d.quantityLimitAmount
          ? { quantityLimitAmount: d.quantityLimitAmount, quantityLimitDays: d.quantityLimitDays }
          : {}),
      })),
    });
  } catch {
    return JSON.stringify({ error: "Formulary search unavailable" });
  }
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
  try {
    const data = await fetchProviders(params);
    return JSON.stringify({
      total: data.total,
      results: data.results.slice(0, 5).map((p) => {
        const address = `${p.address1}, ${p.city}, ${p.office_state} ${p.zip_code}`;
        return {
          name: p.full_name,
          practice: p.practice_name,
          specialty: p.specialties?.[0] ?? "",
          address,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
          phone: p.phone,
          accepting: p.is_accepting_new_patients,
          preferred: p.is_preferred,
          distance: p.distance ? `${p.distance.toFixed(1)} mi` : null,
        };
      }),
    });
  } catch {
    return JSON.stringify({ error: "Provider search unavailable" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { systemPrompt, planId } = body as {
      systemPrompt: string;
      planId?: string;
      messages: Anthropic.MessageParam[];
    };
    const messages: Anthropic.MessageParam[] = [...body.messages];

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
        reply = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
        break;
      }

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
          response.content
            .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
            .map(async (block) => ({
              type: "tool_result" as const,
              tool_use_id: block.id,
              content:
                block.name === "search_formulary"
                  ? await callFormularySearch(block.input as Record<string, unknown>, planId)
                  : await callProviderSearch(block.input as Record<string, unknown>),
            })),
        );
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      break;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Member chat error:", err);
    return NextResponse.json(
      { reply: "", error: "Service unavailable" },
      { status: 500 },
    );
  }
}
