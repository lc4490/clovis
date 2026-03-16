import { NextRequest, NextResponse } from "next/server";
import type { CloverPlan } from "@/types";

const YEAR = "2026";

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip_code");
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Valid 5-digit ZIP required" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(
      `https://www.cloverhealth.com/plans?zip_code=${zip}&year=${YEAR}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Failed to reach Clover Health" }, { status: 502 });
  }

  // Detect out-of-service ZIP — page shows "We're not in your county yet."
  if (html.includes("not in your county") || html.includes("not available in your area")) {
    return NextResponse.json(
      { error: "Clover Health does not currently offer plans in that ZIP code." },
      { status: 404 }
    );
  }

  // Try __NEXT_DATA__ first (Clover Health is a Next.js site)
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const plans = extractPlansFromNextData(data);
      if (plans.length > 0) return NextResponse.json({ plans });
    } catch {
      // fall through
    }
  }

  // Fallback: parse plan cards from data-plan-id attributes
  const plans = parseHTMLPlans(html);
  if (plans.length > 0) return NextResponse.json({ plans });

  return NextResponse.json({ error: "No plans found for this ZIP code" }, { status: 404 });
}

// Recursively search __NEXT_DATA__ for an array of plan-like objects
function extractPlansFromNextData(obj: unknown, depth = 0): CloverPlan[] {
  if (depth > 12 || obj === null || typeof obj !== "object") return [];

  if (Array.isArray(obj)) {
    if (obj.length >= 1 && looksLikePlan(obj[0])) {
      const plans = obj.flatMap((p) => {
        const plan = toPlan(p as Record<string, unknown>);
        return plan ? [plan] : [];
      });
      if (plans.length > 0) return plans;
    }
    for (const item of obj) {
      const found = extractPlansFromNextData(item, depth + 1);
      if (found.length > 0) return found;
    }
    return [];
  }

  for (const val of Object.values(obj as Record<string, unknown>)) {
    const found = extractPlansFromNextData(val, depth + 1);
    if (found.length > 0) return found;
  }
  return [];
}

function looksLikePlan(obj: unknown): boolean {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const keys = Object.keys(obj as object).map((k) => k.toLowerCase());
  const hasName = keys.some((k) => k.includes("plan") || k === "name" || k === "title");
  const hasCost = keys.some((k) =>
    k.includes("premium") || k.includes("price") || k.includes("cost") || k.includes("amount")
  );
  return hasName && hasCost;
}

function toPlan(obj: Record<string, unknown>): CloverPlan | null {
  const name = String(
    obj.planName ?? obj.plan_name ?? obj.name ?? obj.title ?? ""
  ).trim();
  if (!name) return null;

  const id = String(obj.planId ?? obj.plan_id ?? obj.id ?? obj.contractPlanId ?? "");
  const rawPremium = obj.monthlyPremium ?? obj.premium ?? obj.monthlyCost ?? obj.cost ?? 0;
  const premium =
    typeof rawPremium === "number" ? rawPremium : parseFloat(String(rawPremium)) || 0;
  const type = /hmo/i.test(name) ? "HMO" : "PPO";

  return { id, name, premium, type, stars: 4 };
}

// Parse plan cards using data-plan-id / data-plan-name attributes
function parseHTMLPlans(html: string): CloverPlan[] {
  // Matches: data-plan-id="004" data-plan-name="Choice PPO"
  const cardRe = /data-plan-id="(\d+)"\s+data-plan-name="([^"]+)"/g;
  const plans: CloverPlan[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(cardRe)) {
    const id = match[1];
    const name = match[2].trim();
    if (seen.has(id)) continue;
    seen.add(id);

    // Price is in <span class="price">$31.00</span> within the next ~600 chars
    const ctx = html.slice(match.index!, match.index! + 600);
    const priceMatch = ctx.match(/<span[^>]*class="price"[^>]*>\s*\$(\d+(?:\.\d+)?)\s*<\/span>/);
    const premium = priceMatch ? parseFloat(priceMatch[1]) : 0;
    const type = /hmo/i.test(name) ? "HMO" : "PPO";

    plans.push({ id, name, premium, type, stars: 4 });
  }

  return plans;
}
