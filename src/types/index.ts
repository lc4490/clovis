export type Role = "user" | "assistant";

export type AuthStage = "collecting" | "verifying" | "authenticated" | "failed";

export interface AuthFields {
  name?: string;
  dob?: string;
  memberIdOrSsn?: string;
  zip?: string;
}

export interface Provider {
  provider_id: string;
  full_name: string;
  specialties: string[];
  provider_type: "practitioner" | "facility" | "medical equipment";
  practice_name: string;
  address1: string;
  city: string;
  office_state: string;
  zip_code: string;
  phone: string;
  is_accepting_new_patients: boolean;
  is_preferred: boolean;
  gender: string;
  languages_spoken: { code: string; label: string }[];
  distance: number;
}

export interface ProviderSearchParams {
  zip_code: string;
  radius?: number;
  provider_types?: string[];
  sort?: "relevant" | "distance";
  page?: number;
  page_size?: number;
  q?: string;
}

export interface ProviderSearchResponse {
  results: Provider[];
  total: number;
  page: number;
  page_size: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;        // raw text from Claude (may contain CHIPS: marker)
  chips?: string[];       // parsed quick-reply suggestions
  showEscalate?: boolean; // whether to show the phone CTA
}

export interface Member {
  name: string;
  initials: string;
  memberId: string;
  plan: string;
  planId: string;
  planType: string; // "PPO" | "HMO"
  premium: number;
  stars: number;
  zipCode: string;
}

export interface FormularyDrug {
  id: string;
  name: string;
  dosageForm: string;
  strength: string;
  tier: string;         // "Tier 1", "Tier 2", etc.
  tierLabel: string;    // "Preferred Generic", "Non-preferred Brand", etc.
  priorAuth: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  quantityLimitAmount?: string;
  quantityLimitDays?: string;
  planId: string;
}

export interface FormularySearchResponse {
  total: number;
  results: FormularyDrug[];
}

export interface CloverPlan {
  id: string;
  name: string;
  premium: number;
  type: string; // "PPO" | "HMO"
  stars: number;
}

export interface PlansResponse {
  plans: CloverPlan[];
  error?: string;
}

export interface ChatRequest {
  messages: { role: Role; content: string }[];
  memberName: string;
  memberPlan: string;
  memberPlanId?: string;
  memberPlanType?: string;
  memberPremium?: number;
  memberZip?: string;
  language?: string;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}
