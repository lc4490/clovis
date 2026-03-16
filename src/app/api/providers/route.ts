import { NextRequest, NextResponse } from "next/server";
import type { ProviderSearchResponse } from "@/types";
import { fetchProviders } from "@/lib/providers";

export async function GET(req: NextRequest): Promise<NextResponse<ProviderSearchResponse | { error: string }>> {
  const { searchParams } = new URL(req.url);

  try {
    const data = await fetchProviders(searchParams);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to reach provider search" }, { status: 502 });
  }
}
