import { NextRequest, NextResponse } from "next/server";
import type { FormularySearchResponse } from "@/types";
import { fetchFormulary, DEFAULT_PLAN_ID } from "@/lib/formulary";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<FormularySearchResponse | { error: string }>> {
  const { searchParams } = new URL(req.url);
  const drugName = searchParams.get("DrugName")?.trim();
  const drugTier = searchParams.get("DrugTier") ?? undefined;
  const pageSize = Math.min(parseInt(searchParams.get("_count") ?? "5", 10), 10);
  const planId   = searchParams.get("planId") ?? DEFAULT_PLAN_ID;

  if (!drugName) {
    return NextResponse.json({ error: "DrugName is required" }, { status: 400 });
  }

  try {
    const data = await fetchFormulary(drugName, drugTier, pageSize, planId);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Formulary lookup error:", err);
    return NextResponse.json({ error: "Formulary service unavailable" }, { status: 502 });
  }
}
