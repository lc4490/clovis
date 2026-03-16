import type { FormularyDrug, FormularySearchResponse } from "@/types";

const BASE            = "https://www.medicareplanrx.com";
export const DEFAULT_PLAN_ID = "004";

function planInfoUrl(planId: string): string {
  return `${BASE}/MedicationPricingTool/planInfo.do?clientId=89&regionId=1&year=2026&contractId=H5141&planId=${planId}&lang=en&formularySearch=true`;
}

const TIER_MAP: Record<string, { tier: string; label: string }> = {
  "1": { tier: "preferred-generic",   label: "Tier 1 – Preferred Generic"  },
  "2": { tier: "generic",             label: "Tier 2 – Generic"            },
  "3": { tier: "preferred-brand",     label: "Tier 3 – Preferred Brand"    },
  "4": { tier: "non-preferred-brand", label: "Tier 4 – Non-Preferred Drug" },
  "5": { tier: "specialty",           label: "Tier 5 – Specialty"          },
};

const sessionCache: Record<string, { cookie: string; expiry: number }> = {};

export async function getSession(planId: string): Promise<string> {
  const cached = sessionCache[planId];
  if (cached && Date.now() < cached.expiry) return cached.cookie;

  const res = await fetch(planInfoUrl(planId), {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
    redirect: "follow",
  });

  const raw = res.headers.get("set-cookie") ?? "";
  const match = raw.match(/JSESSIONID=[^;]+/);
  if (!match) throw new Error("No session cookie from planInfo.do");

  sessionCache[planId] = {
    cookie: match[0],
    expiry: Date.now() + 20 * 60 * 1000,
  };
  return sessionCache[planId].cookie;
}

interface AutocompleteItem { label: string; value: string }

async function autocomplete(drugName: string, cookie: string, planId: string): Promise<AutocompleteItem[]> {
  const res = await fetch(`${BASE}/MedicationPricingTool/drugList.do`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: cookie,
      Referer: planInfoUrl(planId),
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ NAME: drugName, STARTS_WITH: false }),
  });
  if (!res.ok) return [];
  return res.json() as Promise<AutocompleteItem[]>;
}

async function lookupTier(
  label: string,
  ndc: string,
  cookie: string,
  planId: string,
): Promise<FormularyDrug | null> {
  const commonHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookie,
    Referer: planInfoUrl(planId),
    Origin: BASE,
    "User-Agent": "Mozilla/5.0",
  };

  const formBody = new URLSearchParams({
    drugQueryStr:        label,
    drugQueryStrNDC:     ndc,
    actionToDo:          "showStage2",
    formularySearch:     "true",
    drugToBeDeleted:     "",
    toggleSearchValue:   "",
    lang:                "en",
    therapeuticCategory: "",
    addToList:           "false",
  });
  await fetch(`${BASE}/MedicationPricingTool/formularyDrugSearchRI.do`, {
    method: "POST",
    headers: commonHeaders,
    body: formBody.toString(),
  });

  const therapBody = new URLSearchParams({
    drugQueryStr:        label,
    drugQueryStrNDC:     ndc,
    actionToDo:          "showStage2-0",
    formularySearch:     "true",
    toggleSearchValue:   "search",
    drugToBeDeleted:     "",
    lang:                "en",
    therapeuticCategory: "",
    addToList:           "false",
  });
  const html = await fetch(`${BASE}/MedicationPricingTool/therapeuticDrugSearchRI.do`, {
    method: "POST",
    headers: commonHeaders,
    body: therapBody.toString(),
  }).then((r) => r.text());

  const drugObjMatch = html.match(/new drug\(([\s\S]*?)\);/);
  if (!drugObjMatch) return null;

  const params = Array.from(drugObjMatch[1].matchAll(/"([^"]*)"/g)).map((m) => m[1]);
  if (params.length < 10) return null;

  const tierLevel = params[9];
  if (!tierLevel) return null;

  const tierInfo = TIER_MAP[tierLevel] ?? { tier: `tier-${tierLevel}`, label: `Tier ${tierLevel}` };

  return {
    id:            ndc,
    name:          toTitleCase(params[1]),
    strength:      params[2],
    dosageForm:    toTitleCase(params[10] || params[4]),
    tier:          tierInfo.tier,
    tierLabel:     tierInfo.label,
    priorAuth:     false,
    stepTherapy:   false,
    quantityLimit: false,
    planId:        `H5141-${planId}`,
  };
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchFormulary(
  drugName: string,
  drugTier: string | undefined,
  pageSize: number,
  planId: string = DEFAULT_PLAN_ID,
): Promise<FormularySearchResponse> {
  const cookie = await getSession(planId);
  const suggestions = await autocomplete(drugName, cookie, planId);

  if (suggestions.length === 0) return { total: 0, results: [] };

  const results: FormularyDrug[] = [];

  for (const item of suggestions) {
    if (results.length >= pageSize) break;
    const drug = await lookupTier(item.label, item.value, cookie, planId);
    if (!drug) continue;
    if (drugTier && drug.tier !== drugTier) continue;
    results.push(drug);
  }

  return { total: results.length, results };
}
