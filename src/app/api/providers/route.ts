import { NextRequest, NextResponse } from "next/server";
import type { ProviderSearchResponse } from "@/types";

const UPSTREAM = "https://www.cloverhealth.com/api/provider-search-v2/provider-search";

export async function GET(req: NextRequest): Promise<NextResponse<ProviderSearchResponse | { error: string }>> {
  const { searchParams } = new URL(req.url);

  const upstreamUrl = new URL(UPSTREAM);
  searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  try {
    const res = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.cloverhealth.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json() as ProviderSearchResponse;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to reach provider search" }, { status: 502 });
  }
}
