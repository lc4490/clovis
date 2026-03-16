import type { Member } from "@/types";

export type Language = "en" | "es" | "zh";

export const LANGUAGES: { code: Language; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
  { code: "zh", nativeLabel: "中文" },
];

export const UI_STRINGS: Record<
  Language,
  {
    welcome: (name: string) => string;
    welcomeChips: { label: string; prompt: string }[];
    disclaimer: string;
    textSizeLabel: string;
    available: string;
    errorMsg: string;
    stillNeedHelp: string;
    callLabel: (phone: string) => string;
    commonTopics: string;
    signedInAs: string;
  }
> = {
  en: {
    welcome: (name) =>
      `Hello, ${name}! 👋 I'm your Clover Health assistant — here to help you understand your benefits, check on claims, find doctors, and much more.\n\nWhat can I help you with today?`,
    welcomeChips: [
      { label: "My benefits",         prompt: "What are my plan benefits?" },
      { label: "Find a provider",     prompt: "How do I find an in-network doctor or specialist?" },
      { label: "Check a claim",       prompt: "How do I check the status of a claim?" },
      { label: "Prior authorization", prompt: "What is prior authorization and how do I get it?" },
    ],
    disclaimer:     "General plan information only — not medical advice.",
    textSizeLabel:  "Text size:",
    available:      "Available 24/7",
    errorMsg:       "I'm sorry, I ran into a technical issue. Please try again, or call us at 1-800-801-2060 for immediate help.",
    stillNeedHelp:  "Still need help?",
    callLabel:      (phone) => `Call ${phone}`,
    commonTopics:   "Common Topics",
    signedInAs:     "Signed In As",
  },
  es: {
    welcome: (name) =>
      `¡Hola, ${name}! 👋 Soy su asistente de Clover Health — aquí para ayudarle a entender sus beneficios, verificar reclamaciones, encontrar médicos y mucho más.\n\n¿En qué puedo ayudarle hoy?`,
    welcomeChips: [
      { label: "Mis beneficios",      prompt: "What are my plan benefits?" },
      { label: "Buscar proveedor",    prompt: "How do I find an in-network doctor or specialist?" },
      { label: "Ver reclamación",     prompt: "How do I check the status of a claim?" },
      { label: "Autorización previa", prompt: "What is prior authorization and how do I get it?" },
    ],
    disclaimer:    "Información general del plan — no es consejo médico.",
    textSizeLabel: "Tamaño de texto:",
    available:     "Disponible 24/7",
    errorMsg:      "Lo siento, encontré un problema técnico. Intente de nuevo o llámenos al 1-800-801-2060.",
    stillNeedHelp: "¿Necesita ayuda?",
    callLabel:     (phone) => `Llamar al ${phone}`,
    commonTopics:  "Temas Comunes",
    signedInAs:    "Conectado Como",
  },
  zh: {
    welcome: (name) =>
      `您好，${name}！👋 我是您的Clover Health助手 — 帮助您了解福利、查看理赔、寻找医生等。\n\n今天我能为您做什么？`,
    welcomeChips: [
      { label: "我的福利", prompt: "What are my plan benefits?" },
      { label: "查找医生", prompt: "How do I find an in-network doctor or specialist?" },
      { label: "查看理赔", prompt: "How do I check the status of a claim?" },
      { label: "预先授权", prompt: "What is prior authorization and how do I get it?" },
    ],
    disclaimer:    "仅供一般计划信息参考 — 非医疗建议。",
    textSizeLabel: "文字大小：",
    available:     "全天候服务",
    errorMsg:      "抱歉，遇到技术问题。请重试或拨打 1-800-801-2060 获取帮助。",
    stillNeedHelp: "仍需帮助？",
    callLabel:     (phone) => `拨打 ${phone}`,
    commonTopics:  "常见话题",
    signedInAs:    "已登录为",
  },
};

export const MEMBER: Member = {
  name:      "Margaret T.",
  initials:  "MT",
  memberId:  "CLOV-2847-NJ",
  plan:      "PPO Choice",
  planId:    "",
  planType:  "PPO",
  premium:   0,
  stars:     4,
  zipCode:   "",
};

export const QUICK_ACTIONS = [
  { icon: "🦷", label: "Dental & Vision",     prompt: "What does my plan cover for dental?" },
  { icon: "📋", label: "Check a Claim",        prompt: "How do I check the status of a claim?" },
  { icon: "👩‍⚕️", label: "Find a Doctor",       prompt: "Is my doctor in-network?" },
  { icon: "💊", label: "OTC Allowance",        prompt: "Tell me about the OTC allowance benefit" },
  { icon: "📝", label: "Prior Authorization",  prompt: "What is prior authorization and how do I get it?" },
  { icon: "🏆", label: "Rewards Program",      prompt: "How do I earn my $400 wellness reward?" },
] as const;

export const WELCOME_CHIPS = [
  { label: "My benefits",          prompt: "What are my plan benefits?" },
  { label: "Find a provider",      prompt: "How do I find an in-network doctor or specialist?" },
  { label: "Check a claim",        prompt: "How do I check the status of a claim?" },
  { label: "Prior authorization",  prompt: "What is prior authorization and how do I get it?" },
] as const;

export const PHONE_NUMBER = "1-800-801-2060";

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish (Español)",
  zh: "Simplified Chinese (中文)",
};

export function buildSystemPrompt(
  memberName: string,
  memberPlan: string,
  memberZip?: string,
  memberPlanType?: string,
  memberPremium?: number,
  language?: string,
): string {
  const planDetail = memberPlanType ? ` (${memberPlanType})` : "";
  const premiumLine = memberPremium !== undefined
    ? ` Their monthly premium is $${memberPremium}.`
    : "";
  const zipLine = memberZip
    ? ` Their ZIP code is ${memberZip} — use this automatically when searching for nearby providers without asking for it.`
    : "";
  const languageLine = language && LANGUAGE_NAMES[language]
    ? `\n\nIMPORTANT: You must respond ONLY in ${LANGUAGE_NAMES[language]}. All responses — including chip suggestions after CHIPS: — must be written in this language.`
    : "";
  return `You are Ask Clovis, a friendly and knowledgeable Medicare support assistant for Clover Health members. You're speaking with ${memberName}, a member on the Clover Health ${memberPlan}${planDetail} plan in New Jersey.${premiumLine}${zipLine}`
    + SYSTEM_PROMPT_BODY
    + languageLine;
}

const SYSTEM_PROMPT_BODY = `

Your personality:
- Warm, patient, and clear — you talk to seniors who may not be tech-savvy
- Use plain language, short sentences, and avoid jargon
- Never condescending; always respectful
- Reassuring when members are confused or anxious

What you know about Clover Health:
- Clover Health is a Medicare Advantage (Part C) insurer operating in New Jersey and other states
- They offer PPO and HMO plans; the PPO is their flagship (95%+ of members)
- 2025 PPO plans received a 4-Star CMS rating
- Key benefits include: $0/month premium on most plans, dental/vision/hearing coverage, OTC allowance, prescription drug coverage (Part D included), prior authorization processes, wellness rewards program up to $400/year
- Their technology platform is called Clover Assistant — it helps doctors make better decisions about member care
- Common member questions: claim status, prior authorizations, finding in-network providers, OTC card balance, appeals, prescription coverage

How to respond:
- For benefit questions: explain clearly, mention they can check their Summary of Benefits for exact amounts
- For claim status: explain you can look that up, but for this demo ask them for the claim number
- For prior authorizations: explain what it is, why it's needed, and the general process
- For doctor/network questions: use the search_providers tool — ask for their ZIP code and specialty if not provided. Present results conversationally: name, specialty, address as a markdown link using the mapsUrl field (e.g. [123 Main St, City, NJ 07030](mapsUrl)), phone, whether they're accepting new patients, and preferred status. Mention total count if more results exist.
- For prescription/drug questions: use the search_formulary tool — search by drug name. Present results conversationally: drug name, strength, dosage form, tier (e.g. "Tier 1 – Preferred Generic"), and any restrictions (prior authorization, step therapy, quantity limits). If no results are found, let the member know the drug may not be on the formulary and suggest calling ${PHONE_NUMBER}.
- For emergencies or urgent medical issues: always direct to 911 or their doctor first
- If you genuinely cannot help (appeals, billing disputes, account changes): acknowledge warmly and offer to connect them to a live agent at ${PHONE_NUMBER}
- Keep responses concise — 2-4 short paragraphs max
- End complex answers with 1-2 follow-up suggestions formatted as: CHIPS: [option1] | [option2]

Format rules:
- Use plain paragraph text mostly; only bullet lists for 3+ distinct items
- Don't use markdown headers
- Be conversational, not clinical`;


export const ESCALATION_TRIGGERS = [
  "1-800-801",
  "live agent",
  "call us",
  "contact us",
  "reach our team",
];
