import type { Member } from "@/types";

export type Language = "en" | "es" | "zh";

export const LANGUAGES: { code: Language; flag: string; nativeLabel: string }[] = [
  { code: "en", flag: "🇺🇸", nativeLabel: "English" },
  { code: "es", flag: "🇪🇸", nativeLabel: "Español" },
  { code: "zh", flag: "🇨🇳", nativeLabel: "中文" },
];

export const UI_STRINGS: Record<
  Language,
  {
    // Chat
    welcome: (name: string) => string;
    welcomeChips: { label: string; prompt: string }[];
    disclaimer: string;
    textSizeLabel: string;
    available: string;
    errorMsg: string;
    // Chat header / input
    askClovis: string;
    inputPlaceholder: string;
    inputHint: string;
    // Escalation notice
    escalateText: string;
    escalateCall: string;
    escalateHours: string;
    // Sidebar
    memberPortal: string;
    quickActions: { icon: string; label: string; prompt: string }[];
    stillNeedHelp: string;
    callLabel: (phone: string) => string;
    commonTopics: string;
    signedInAs: string;
    // Setup page
    setup: {
      heading: string;
      subtitle: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      zipCode: string;
      findPlans: string;
      searching: string;
      selectPlan: string;
      startChatting: string;
      disclaimer: string;
      features: { icon: string; text: string }[];
      errorNoPlans: string;
      errorFailed: string;
      chooseLanguage: string;
    };
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
    disclaimer:    "General plan information only — not medical advice.",
    textSizeLabel: "Text size:",
    available:     "Available 24/7",
    errorMsg:        "I'm sorry, I ran into a technical issue. Please try again, or call us at 1-800-801-2060 for immediate help.",
    askClovis:       "Ask",
    inputPlaceholder:"Type your question here…",
    inputHint:       "Enter to send · Shift+Enter for new line",
    escalateText:    "A live agent can help with this.",
    escalateCall:    "Call",
    escalateHours:   "(Mon–Fri, 8am–8pm ET)",
    memberPortal:    "Member Portal",
    quickActions: [
      { icon: "🦷", label: "Dental & Vision",     prompt: "What does my plan cover for dental?" },
      { icon: "📋", label: "Check a Claim",        prompt: "How do I check the status of a claim?" },
      { icon: "👩‍⚕️", label: "Find a Doctor",       prompt: "Is my doctor in-network?" },
      { icon: "💊", label: "OTC Allowance",        prompt: "Tell me about the OTC allowance benefit" },
      { icon: "📝", label: "Prior Authorization",  prompt: "What is prior authorization and how do I get it?" },
      { icon: "🏆", label: "Rewards Program",      prompt: "How do I earn my $400 wellness reward?" },
    ],
    stillNeedHelp: "Still need help?",
    callLabel:     (phone) => `Call ${phone}`,
    commonTopics:  "Common Topics",
    signedInAs:    "Signed In As",
    setup: {
      heading:              "Set up your profile",
      subtitle:             "Enter your ZIP code to find your Clover Health plan.",
      firstName:            "First name",
      firstNamePlaceholder: "Margaret",
      lastName:             "Last name",
      lastNamePlaceholder:  "Torres",
      zipCode:              "ZIP code",
      findPlans:            "Find Plans",
      searching:            "Searching…",
      selectPlan:           "Select your plan",
      startChatting:        "Start chatting →",
      disclaimer:           "General plan information only — not medical advice.",
      features: [
        { icon: "🔍", text: "Understand your benefits" },
        { icon: "📋", text: "Check on claims instantly" },
        { icon: "👩‍⚕️", text: "Find in-network doctors" },
        { icon: "💊", text: "Manage your OTC allowance" },
      ],
      errorNoPlans: "No plans found for this ZIP code.",
      errorFailed:  "Failed to load plans. Please try again.",
      chooseLanguage: "Choose your language",
    },
  },
  es: {
    welcome: (name) =>
      `¡Hola, ${name}! 👋 Soy su asistente de Clover Health — aquí para ayudarle a entender sus beneficios, verificar reclamaciones, encontrar médicos y mucho más.\n\n¿En qué puedo ayudarle hoy?`,
    welcomeChips: [
      { label: "Mis beneficios",      prompt: "¿Cuáles son los beneficios de mi plan?" },
      { label: "Buscar proveedor",    prompt: "¿Cómo encuentro un médico o especialista en la red?" },
      { label: "Ver reclamación",     prompt: "¿Cómo verifico el estado de una reclamación?" },
      { label: "Autorización previa", prompt: "¿Qué es la autorización previa y cómo la obtengo?" },
    ],
    disclaimer:    "Información general del plan — no es consejo médico.",
    textSizeLabel: "Tamaño de texto:",
    available:     "Disponible 24/7",
    errorMsg:        "Lo siento, encontré un problema técnico. Intente de nuevo o llámenos al 1-800-801-2060.",
    askClovis:       "Preguntar a",
    inputPlaceholder:"Escriba su pregunta aquí…",
    inputHint:       "Enter para enviar · Shift+Enter para nueva línea",
    escalateText:    "Un agente en vivo puede ayudarle.",
    escalateCall:    "Llamar al",
    escalateHours:   "(Lun–Vie, 8am–8pm ET)",
    memberPortal:    "Portal del Miembro",
    quickActions: [
      { icon: "🦷", label: "Dental y Visión",        prompt: "¿Qué cubre mi plan para dental?" },
      { icon: "📋", label: "Ver Reclamación",         prompt: "¿Cómo verifico el estado de una reclamación?" },
      { icon: "👩‍⚕️", label: "Buscar Médico",          prompt: "¿Mi médico está en la red?" },
      { icon: "💊", label: "Beneficio OTC",           prompt: "Cuéntame sobre el beneficio de la tarjeta OTC" },
      { icon: "📝", label: "Autorización Previa",     prompt: "¿Qué es la autorización previa y cómo la obtengo?" },
      { icon: "🏆", label: "Programa de Recompensas", prompt: "¿Cómo gano mi recompensa de bienestar de $400?" },
    ],
    stillNeedHelp: "¿Necesita ayuda?",
    callLabel:     (phone) => `Llamar al ${phone}`,
    commonTopics:  "Temas Comunes",
    signedInAs:    "Conectado Como",
    setup: {
      heading:              "Configure su perfil",
      subtitle:             "Ingrese su código postal para encontrar su plan de Clover Health.",
      firstName:            "Nombre",
      firstNamePlaceholder: "María",
      lastName:             "Apellido",
      lastNamePlaceholder:  "Torres",
      zipCode:              "Código postal",
      findPlans:            "Buscar Planes",
      searching:            "Buscando…",
      selectPlan:           "Seleccione su plan",
      startChatting:        "Comenzar a chatear →",
      disclaimer:           "Información general del plan — no es consejo médico.",
      features: [
        { icon: "🔍", text: "Entienda sus beneficios" },
        { icon: "📋", text: "Verifique reclamaciones al instante" },
        { icon: "👩‍⚕️", text: "Encuentre médicos en la red" },
        { icon: "💊", text: "Administre su beneficio OTC" },
      ],
      errorNoPlans: "No se encontraron planes para este código postal.",
      errorFailed:  "Error al cargar los planes. Inténtelo de nuevo.",
      chooseLanguage: "Elige tu idioma",
    },
  },
  zh: {
    welcome: (name) =>
      `您好，${name}！👋 我是您的Clover Health助手 — 帮助您了解福利、查看理赔、寻找医生等。\n\n今天我能为您做什么？`,
    welcomeChips: [
      { label: "我的福利", prompt: "我的计划有哪些福利？" },
      { label: "查找医生", prompt: "如何找到网络内的医生或专科医生？" },
      { label: "查看理赔", prompt: "如何查看理赔状态？" },
      { label: "预先授权", prompt: "什么是预先授权，如何申请？" },
    ],
    disclaimer:    "仅供一般计划信息参考 — 非医疗建议。",
    textSizeLabel: "文字大小：",
    available:     "全天候服务",
    errorMsg:        "抱歉，遇到技术问题。请重试或拨打 1-800-801-2060 获取帮助。",
    askClovis:       "询问",
    inputPlaceholder:"在此输入您的问题…",
    inputHint:       "按Enter发送 · Shift+Enter换行",
    escalateText:    "人工客服可以为您提供帮助。",
    escalateCall:    "拨打",
    escalateHours:   "（周一至周五，上午8点–晚上8点 ET）",
    memberPortal:    "会员门户",
    quickActions: [
      { icon: "🦷", label: "牙科与视力", prompt: "我的计划涵盖哪些牙科服务？" },
      { icon: "📋", label: "查看理赔",   prompt: "如何查看理赔状态？" },
      { icon: "👩‍⚕️", label: "查找医生", prompt: "我的医生在网络内吗？" },
      { icon: "💊", label: "OTC津贴",    prompt: "介绍一下OTC津贴福利" },
      { icon: "📝", label: "预先授权",   prompt: "什么是预先授权，如何申请？" },
      { icon: "🏆", label: "奖励计划",   prompt: "如何获得400美元的健康奖励？" },
    ],
    stillNeedHelp: "仍需帮助？",
    callLabel:     (phone) => `拨打 ${phone}`,
    commonTopics:  "常见话题",
    signedInAs:    "已登录为",
    setup: {
      heading:              "设置您的个人资料",
      subtitle:             "输入您的邮政编码以查找您的Clover Health计划。",
      firstName:            "名字",
      firstNamePlaceholder: "华",
      lastName:             "姓氏",
      lastNamePlaceholder:  "李",
      zipCode:              "邮政编码",
      findPlans:            "查找计划",
      searching:            "搜索中…",
      selectPlan:           "选择您的计划",
      startChatting:        "开始聊天 →",
      disclaimer:           "仅供一般计划信息参考 — 非医疗建议。",
      features: [
        { icon: "🔍", text: "了解您的福利" },
        { icon: "📋", text: "即时查看理赔状态" },
        { icon: "👩‍⚕️", text: "查找网络内医生" },
        { icon: "💊", text: "管理您的OTC津贴" },
      ],
      errorNoPlans: "未找到该邮政编码的计划。",
      errorFailed:  "加载计划失败，请重试。",
      chooseLanguage: "选择语言",
    },
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
