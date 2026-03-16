import type { ProviderSearchResponse } from "@/types";

const UPSTREAM = "https://www.cloverhealth.com/api/provider-search-v2/provider-search";

export async function fetchProviders(params: URLSearchParams): Promise<ProviderSearchResponse> {
  const upstreamUrl = new URL(UPSTREAM);
  params.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  const res = await fetch(upstreamUrl.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.cloverhealth.com/",
    },
  });

  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  return res.json() as Promise<ProviderSearchResponse>;
}
