import { NextRequest, NextResponse } from "next/server";
import type { FormularyDrug, FormularySearchResponse } from "@/types";

const UPSTREAM = "https://public-api.cloverhealth.com/formulary/api/MedicationKnowledge";

// Extension URL suffixes used by the DaVinci PDex formulary FHIR profile
const EXT = {
  tierID:       "usdf-DrugTierID-extension",
  priorAuth:    "usdf-PriorAuthorization-extension",
  stepTherapy:  "usdf-StepTherapyLimit-extension",
  quantityLimit:"usdf-QuantityLimit-extension",
  qtyAmount:    "usdf-QuantityLimitAmount-extension",
  qtyDays:      "usdf-QuantityLimitDays-extension",
  dosageForm:   "usdf-DosageForm-extension",
  strength:     "usdf-Strength-extension",
  planId:       "usdf-PlanID-extension",
} as const;

interface FhirExtension {
  url: string;
  valueBoolean?: boolean;
  valueString?: string;
  valueCodeableConcept?: {
    coding: { system: string; code: string; display: string }[];
  };
}

interface FhirMedicationKnowledge {
  resourceType: "MedicationKnowledge";
  id: string;
  extension?: FhirExtension[];
  code?: { coding: { system: string; code: string; display: string }[] };
}

interface FhirBundle {
  resourceType: "Bundle";
  total?: number;
  entry?: { resource: FhirMedicationKnowledge }[];
}

function ext(extensions: FhirExtension[], suffix: string): FhirExtension | undefined {
  return extensions.find((e) => e.url.endsWith(suffix));
}

function parseDrug(resource: FhirMedicationKnowledge): FormularyDrug {
  const exts = resource.extension ?? [];

  const tierExt = ext(exts, EXT.tierID);
  const cloverTier = tierExt?.valueCodeableConcept?.coding.find((c) =>
    c.system.includes("cloverhealth")
  );
  const stdTier = tierExt?.valueCodeableConcept?.coding.find((c) =>
    !c.system.includes("cloverhealth")
  );

  return {
    id:                 resource.id,
    name:               resource.code?.coding[0]?.display ?? "Unknown",
    dosageForm:         ext(exts, EXT.dosageForm)?.valueString ?? "",
    strength:           ext(exts, EXT.strength)?.valueString ?? "",
    tier:               cloverTier?.code ?? stdTier?.code ?? "",
    tierLabel:          cloverTier?.display ?? stdTier?.display ?? "",
    priorAuth:          ext(exts, EXT.priorAuth)?.valueBoolean ?? false,
    stepTherapy:        ext(exts, EXT.stepTherapy)?.valueBoolean ?? false,
    quantityLimit:      ext(exts, EXT.quantityLimit)?.valueBoolean ?? false,
    quantityLimitAmount: ext(exts, EXT.qtyAmount)?.valueString,
    quantityLimitDays:   ext(exts, EXT.qtyDays)?.valueString,
    planId:             ext(exts, EXT.planId)?.valueString ?? "",
  };
}

export async function GET(req: NextRequest): Promise<NextResponse<FormularySearchResponse | { error: string }>> {
  const { searchParams } = new URL(req.url);

  const upstreamUrl = new URL(UPSTREAM);
  searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  try {
    const res = await fetch(upstreamUrl.toString(), {
      headers: { Accept: "application/fhir+json" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const bundle = (await res.json()) as FhirBundle;
    const results = (bundle.entry ?? []).map((e) => parseDrug(e.resource));

    return NextResponse.json({ total: bundle.total ?? results.length, results });
  } catch {
    return NextResponse.json({ error: "Failed to reach formulary API" }, { status: 502 });
  }
}
