import type { Member } from "@/types";
import type { MockMember } from "@/lib/mockMembers";

export type Language = "en" | "es" | "zh";

export const LANGUAGES: {
  code: Language;
  nativeLabel: string;
}[] = [
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
  { code: "zh", nativeLabel: "中文" },
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
    memberId: string;
    quickActions: { icon: string; label: string; prompt: string }[];
    stillNeedHelp: string;
    callLabel: (phone: string) => string;
    commonTopics: string;
    signedInAs: string;
    // Language switch warning
    langSwitchTitle: string;
    langSwitchBody: string;
    langSwitchConfirm: string;
    langSwitchCancel: string;
    // Auth flow
    verifyingIdentity: string;
    identityVerificationRequired: string;
    authWelcome: string;
    authVerified: (firstName: string) => string;
    authFailed: string;
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
      { label: "My benefits", prompt: "What are my plan benefits?" },
      {
        label: "Find a provider",
        prompt: "How do I find an in-network doctor or specialist?",
      },
      {
        label: "Check a claim",
        prompt: "How do I check the status of a claim?",
      },
      {
        label: "Prior authorization",
        prompt: "What is prior authorization and how do I get it?",
      },
    ],
    disclaimer: "General plan information only — not medical advice.",
    textSizeLabel: "Text size:",
    available: "Available 24/7",
    errorMsg:
      "I'm sorry, I ran into a technical issue. Please try again, or call us at 1-800-801-2060 for immediate help.",
    askClovis: "Ask",
    inputPlaceholder: "Type your question here…",
    inputHint: "Enter to send · Shift+Enter for new line",
    escalateText: "A live agent can help with this.",
    escalateCall: "Call",
    escalateHours: "(Mon–Fri, 8am–8pm ET)",
    memberPortal: "Member Portal",
    memberId: "Member ID",
    quickActions: [
      {
        icon: "📋",
        label: "Check a Claim",
        prompt: "How do I check the status of a claim?",
      },
      {
        icon: "🦷",
        label: "Dental & Vision",
        prompt: "What does my plan cover for dental?",
      },
      {
        icon: "👩‍⚕️",
        label: "Find a Doctor",
        prompt: "Is my doctor in-network?",
      },
      {
        icon: "💊",
        label: "OTC Allowance",
        prompt: "Tell me about the OTC allowance benefit",
      },
      {
        icon: "📝",
        label: "Prior Authorization",
        prompt: "What is prior authorization and how do I get it?",
      },
      {
        icon: "🏆",
        label: "Rewards Program",
        prompt: "How do I earn my $400 wellness reward?",
      },
      {
        icon: "🧾",
        label: "Dispute a Bill",
        prompt: "I have a billing issue I'd like to dispute. How do I do that?",
      },
      {
        icon: "⚖️",
        label: "Appeal a Denial",
        prompt: "How do I appeal a denied claim or prior authorization?",
      },
    ],
    stillNeedHelp: "Still need help?",
    callLabel: (phone) => `Call ${phone}`,
    commonTopics: "Common Topics",
    signedInAs: "Signed In As",
    langSwitchTitle: "Switch language?",
    langSwitchBody: "Switching languages will clear your current conversation.",
    langSwitchConfirm: "Switch & clear chat",
    langSwitchCancel: "Cancel",
    verifyingIdentity: "Verifying identity…",
    identityVerificationRequired: "Identity verification required",
    authWelcome:
      "Hello! I'm Clovis, your Clover Health assistant. 👋\n\nBefore I can access your account details, I need to verify your identity — it'll only take a moment.\n\nCould you please start by telling me your **full name**?",
    authVerified: (firstName: string) =>
      `Identity verified — welcome, ${firstName}! How can I help you today? CHIPS: [My benefits] | [My providers] | [My claims] | [Prior authorization]`,
    authFailed:
      "I'm sorry, I wasn't able to verify your identity with the information provided. Please double-check your details and try again, or call us at 1-800-801-2060 to speak with a live agent. CHIPS: [Try again]",
    setup: {
      heading: "Set up your profile",
      subtitle: "Enter your ZIP code to find your Clover Health plan.",
      firstName: "First name",
      firstNamePlaceholder: "Margaret",
      lastName: "Last name",
      lastNamePlaceholder: "Torres",
      zipCode: "ZIP code",
      findPlans: "Find Plans",
      searching: "Searching…",
      selectPlan: "Select your plan",
      startChatting: "Start chatting →",
      disclaimer: "General plan information only — not medical advice.",
      features: [
        { icon: "🔍", text: "Understand your benefits" },
        { icon: "📋", text: "Check on claims instantly" },
        { icon: "👩‍⚕️", text: "Find in-network doctors" },
        { icon: "💊", text: "Manage your OTC allowance" },
      ],
      errorNoPlans: "No plans found for this ZIP code.",
      errorFailed: "Failed to load plans. Please try again.",
      chooseLanguage: "Choose your language",
    },
  },
  es: {
    welcome: (name) =>
      `¡Hola, ${name}! 👋 Soy su asistente de Clover Health — aquí para ayudarle a entender sus beneficios, verificar reclamaciones, encontrar médicos y mucho más.\n\n¿En qué puedo ayudarle hoy?`,
    welcomeChips: [
      {
        label: "Mis beneficios",
        prompt: "¿Cuáles son los beneficios de mi plan?",
      },
      {
        label: "Buscar proveedor",
        prompt: "¿Cómo encuentro un médico o especialista en la red?",
      },
      {
        label: "Ver reclamación",
        prompt: "¿Cómo verifico el estado de una reclamación?",
      },
      {
        label: "Autorización previa",
        prompt: "¿Qué es la autorización previa y cómo la obtengo?",
      },
    ],
    disclaimer: "Información general del plan — no es consejo médico.",
    textSizeLabel: "Tamaño de texto:",
    available: "Disponible 24/7",
    errorMsg:
      "Lo siento, encontré un problema técnico. Intente de nuevo o llámenos al 1-800-801-2060.",
    askClovis: "Preguntar a",
    inputPlaceholder: "Escriba su pregunta aquí…",
    inputHint: "Enter para enviar · Shift+Enter para nueva línea",
    escalateText: "Un agente en vivo puede ayudarle.",
    escalateCall: "Llamar al",
    escalateHours: "(Lun–Vie, 8am–8pm ET)",
    memberPortal: "Portal del Miembro",
    memberId: "ID de Miembro",
    quickActions: [
      {
        icon: "📋",
        label: "Ver Reclamación",
        prompt: "¿Cómo verifico el estado de una reclamación?",
      },
      {
        icon: "🦷",
        label: "Dental y Visión",
        prompt: "¿Qué cubre mi plan para dental?",
      },
      {
        icon: "👩‍⚕️",
        label: "Buscar Médico",
        prompt: "¿Mi médico está en la red?",
      },
      {
        icon: "💊",
        label: "Beneficio OTC",
        prompt: "Cuéntame sobre el beneficio de la tarjeta OTC",
      },
      {
        icon: "📝",
        label: "Autorización Previa",
        prompt: "¿Qué es la autorización previa y cómo la obtengo?",
      },
      {
        icon: "🏆",
        label: "Programa de Recompensas",
        prompt: "¿Cómo gano mi recompensa de bienestar de $400?",
      },
      {
        icon: "🧾",
        label: "Disputar un Cobro",
        prompt: "Tengo un problema de facturación que quiero disputar. ¿Cómo lo hago?",
      },
      {
        icon: "⚖️",
        label: "Apelar una Denegación",
        prompt: "¿Cómo apelo una reclamación denegada o una autorización previa?",
      },
    ],
    stillNeedHelp: "¿Necesita ayuda?",
    callLabel: (phone) => `Llamar al ${phone}`,
    commonTopics: "Temas Comunes",
    signedInAs: "Conectado Como",
    langSwitchTitle: "¿Cambiar idioma?",
    langSwitchBody: "Cambiar el idioma borrará su conversación actual.",
    langSwitchConfirm: "Cambiar y borrar chat",
    langSwitchCancel: "Cancelar",
    verifyingIdentity: "Verificando identidad…",
    identityVerificationRequired: "Verificación de identidad requerida",
    authWelcome:
      "¡Hola! Soy Clovis, su asistente de Clover Health. 👋\n\nAntes de acceder a los detalles de su cuenta, necesito verificar su identidad — solo tomará un momento.\n\n¿Podría comenzar diciéndome su **nombre completo**?",
    authVerified: (firstName: string) =>
      `Identidad verificada — ¡bienvenido/a, ${firstName}! ¿En qué puedo ayudarle hoy? CHIPS: [Mis beneficios] | [Mis proveedores] | [Mis reclamaciones] | [Autorización previa]`,
    authFailed:
      "Lo siento, no pude verificar su identidad con la información proporcionada. Por favor, revise sus datos e inténtelo de nuevo, o llame al 1-800-801-2060 para hablar con un agente en vivo. CHIPS: [Intentar de nuevo]",
    setup: {
      heading: "Configure su perfil",
      subtitle:
        "Ingrese su código postal para encontrar su plan de Clover Health.",
      firstName: "Nombre",
      firstNamePlaceholder: "María",
      lastName: "Apellido",
      lastNamePlaceholder: "Torres",
      zipCode: "Código postal",
      findPlans: "Buscar Planes",
      searching: "Buscando…",
      selectPlan: "Seleccione su plan",
      startChatting: "Comenzar a chatear →",
      disclaimer: "Información general del plan — no es consejo médico.",
      features: [
        { icon: "🔍", text: "Entienda sus beneficios" },
        { icon: "📋", text: "Verifique reclamaciones al instante" },
        { icon: "👩‍⚕️", text: "Encuentre médicos en la red" },
        { icon: "💊", text: "Administre su beneficio OTC" },
      ],
      errorNoPlans: "No se encontraron planes para este código postal.",
      errorFailed: "Error al cargar los planes. Inténtelo de nuevo.",
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
    disclaimer: "仅供一般计划信息参考 — 非医疗建议。",
    textSizeLabel: "文字大小：",
    available: "全天候服务",
    errorMsg: "抱歉，遇到技术问题。请重试或拨打 1-800-801-2060 获取帮助。",
    askClovis: "问",
    inputPlaceholder: "在此输入您的问题…",
    inputHint: "按Enter发送 · Shift+Enter换行",
    escalateText: "人工客服可以为您提供帮助。",
    escalateCall: "拨打",
    escalateHours: "（周一至周五，上午8点–晚上8点 ET）",
    memberPortal: "会员门户",
    memberId: "会员编号",
    quickActions: [
      { icon: "📋", label: "查看理赔", prompt: "如何查看理赔状态？" },
      { icon: "🦷", label: "牙科与视力", prompt: "我的计划涵盖哪些牙科服务？" },
      { icon: "👩‍⚕️", label: "查找医生", prompt: "我的医生在网络内吗？" },
      { icon: "💊", label: "OTC津贴", prompt: "介绍一下OTC津贴福利" },
      { icon: "📝", label: "预先授权", prompt: "什么是预先授权，如何申请？" },
      { icon: "🏆", label: "奖励计划", prompt: "如何获得400美元的健康奖励？" },
      { icon: "🧾", label: "账单异议", prompt: "我有一个账单问题需要提出异议，该怎么做？" },
      { icon: "⚖️", label: "申请复议", prompt: "如何对被拒绝的理赔或预先授权提出申请？" },
    ],
    stillNeedHelp: "仍需帮助？",
    callLabel: (phone) => `拨打 ${phone}`,
    commonTopics: "常见话题",
    signedInAs: "已登录为",
    langSwitchTitle: "切换语言？",
    langSwitchBody: "切换语言将清除您当前的对话记录。",
    langSwitchConfirm: "切换并清除对话",
    langSwitchCancel: "取消",
    verifyingIdentity: "正在验证身份…",
    identityVerificationRequired: "需要身份验证",
    authWelcome:
      "您好！我是Clovis，您的Clover Health助手。👋\n\n在访问您的账户详情之前，我需要验证您的身份 — 只需片刻。\n\n请问您能先告诉我您的**全名**吗？",
    authVerified: (firstName: string) =>
      `身份已验证 — 欢迎，${firstName}！今天有什么可以帮您的？ CHIPS: [我的福利] | [我的医生] | [我的理赔] | [预先授权]`,
    authFailed:
      "很抱歉，我无法使用您提供的信息验证您的身份。请仔细检查您的信息并重试，或拨打 1-800-801-2060 与客服代表通话。 CHIPS: [重试]",
    setup: {
      heading: "设置您的个人资料",
      subtitle: "输入您的邮政编码以查找您的Clover Health计划。",
      firstName: "名字",
      firstNamePlaceholder: "华",
      lastName: "姓氏",
      lastNamePlaceholder: "李",
      zipCode: "邮政编码",
      findPlans: "查找计划",
      searching: "搜索中…",
      selectPlan: "选择您的计划",
      startChatting: "开始聊天 →",
      disclaimer: "仅供一般计划信息参考 — 非医疗建议。",
      features: [
        { icon: "🔍", text: "了解您的福利" },
        { icon: "📋", text: "即时查看理赔状态" },
        { icon: "👩‍⚕️", text: "查找网络内医生" },
        { icon: "💊", text: "管理您的OTC津贴" },
      ],
      errorNoPlans: "未找到该邮政编码的计划。",
      errorFailed: "加载计划失败，请重试。",
      chooseLanguage: "选择语言",
    },
  },
};

export const MEMBER: Member = {
  name: "Margaret T.",
  initials: "MT",
  memberId: "CLOV-2847-NJ",
  plan: "PPO Choice",
  planId: "",
  planType: "PPO",
  premium: 0,
  stars: 4,
  zipCode: "",
};

export const QUICK_ACTIONS = [
  {
    icon: "🦷",
    label: "Dental & Vision",
    prompt: "What does my plan cover for dental?",
  },
  {
    icon: "📋",
    label: "Check a Claim",
    prompt: "How do I check the status of a claim?",
  },
  { icon: "👩‍⚕️", label: "Find a Doctor", prompt: "Is my doctor in-network?" },
  {
    icon: "💊",
    label: "OTC Allowance",
    prompt: "Tell me about the OTC allowance benefit",
  },
  {
    icon: "📝",
    label: "Prior Authorization",
    prompt: "What is prior authorization and how do I get it?",
  },
  {
    icon: "🏆",
    label: "Rewards Program",
    prompt: "How do I earn my $400 wellness reward?",
  },
] as const;

export const WELCOME_CHIPS = [
  { label: "My benefits", prompt: "What are my plan benefits?" },
  {
    label: "Find a provider",
    prompt: "How do I find an in-network doctor or specialist?",
  },
  { label: "Check a claim", prompt: "How do I check the status of a claim?" },
  {
    label: "Prior authorization",
    prompt: "What is prior authorization and how do I get it?",
  },
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
  const premiumLine =
    memberPremium !== undefined
      ? ` Their monthly premium is $${memberPremium}.`
      : "";
  const zipLine = memberZip
    ? ` Their ZIP code is ${memberZip} — use this automatically when searching for nearby providers without asking for it.`
    : "";
  const languageLine =
    language && LANGUAGE_NAMES[language]
      ? `\n\nIMPORTANT: You must respond ONLY in ${LANGUAGE_NAMES[language]}. All responses — including chip suggestions after CHIPS: — must be written in this language.`
      : "";
  return (
    `You are Clovis, a friendly and knowledgeable Medicare support assistant for Clover Health members. You're speaking with ${memberName}, a member on the Clover Health ${memberPlan}${planDetail} plan in New Jersey.${premiumLine}${zipLine}` +
    SYSTEM_PROMPT_BODY +
    languageLine
  );
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
- For doctor/network questions: before calling search_providers, evaluate what information you already have and what is missing. Follow this logic:

  STEP 1 — SPECIALTY: If the request is vague (e.g. "find a doctor", "find a provider", "is my doctor in-network" without naming a specialty), ask what type they need:
  "What type of doctor are you looking for?
  CHIPS: [Primary Care] | [Cardiologist] | [Dermatologist] | [Orthopedist] | [OB/GYN] | [Neurologist] | [Dentist] | [Eye Doctor]"
  If the specialty is already clear from the message (e.g. "find a cardiologist"), skip this step.

  STEP 2 — DISTANCE: If you have the specialty but no distance preference stated, ask:
  "How far are you willing to travel?
  CHIPS: [Within 5 miles] | [Within 10 miles] | [Within 20 miles] | [Any distance]"
  If the user already mentioned a distance, skip this step.

  STEP 3 — SEARCH: Once you have specialty + distance, call search_providers using the member's ZIP code. Map distance chips to radius values: 5 miles → 5, 10 miles → 10, 20 miles → 20, Any distance → 50.

  Present each result as a structured block (one blank line between providers):

**[Full Name]**
Specialty: [specialty]
Practice: [practice name]
Address: [[address]](mapsUrl)
Phone: [phone]
Accepting new patients: Yes / No
Preferred provider: Yes / No
Distance: [X.X mi]

  Mention the total count if more results exist. If checking whether a specific named doctor is in-network, search by their name directly and skip the filter steps. If the member asks for a specific doctor's contact details (phone number, address, office location), search by their name using the 'q' parameter and present the full result block — phone and address are included in every result. If the member asks for a practice or group's phone number (e.g. "What is Garden State Healthcare Associates' number?") without naming a specific doctor, do NOT search yet — instead ask: "Which doctor at [practice name] are you trying to reach?" Wait for them to name a doctor, then search by that doctor's name.
- For prescription/drug questions: use the search_formulary tool — search by drug name. Present results conversationally: drug name, strength, dosage form, tier (e.g. "Tier 1 – Preferred Generic"), and any restrictions (prior authorization, step therapy, quantity limits). If the search returns one or more results, state the coverage definitively — do not hedge or add disclaimers. If the search returns no results, tell the member that drug does not appear to be covered under their plan and recommend they call ${PHONE_NUMBER} to confirm.
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

const AUTH_BASE = `You are Clovis, a warm and friendly Clover Health assistant. Before you can help with account questions, you need to verify the member's identity.

You need three pieces of information: their full name, date of birth, and either their Member ID or the last 4 digits of their Social Security Number. Gather these naturally in conversation — there's no required order, and you don't need to ask for them one at a time if the member volunteers multiple pieces at once.

Be conversational and relaxed. If they give you their name and DOB in the same message, great — just ask for the one remaining piece. If they seem nervous about sharing info, reassure them warmly. Never ask for the full SSN — only the last 4 digits.

Once you have all three pieces, repeat them back clearly and ask the member to confirm before proceeding. For example:
"Just to confirm — I have:
• Name: [name]
• Date of birth: [dob]
• Member ID / SSN last 4: [id]
Does everything look right, or would you like to change anything?"

If the member confirms (says yes, correct, looks good, etc.), respond with ONLY this token — no other text:

VERIFY:{"name":"[full name]","dob":"[MM/DD/YYYY]","memberIdOrSsn":"[member id or last 4 ssn]"}

If the member wants to change something, update whichever field they correct, repeat the full summary again, and ask for confirmation again before emitting the token.`;

const AUTH_VOICE_ADDENDUM = `

**Name spelling confirmation (required for this voice session):** As soon as you receive the member's name, immediately spell it back letter by letter and ask them to confirm before collecting anything else. For example: "Got it — so that's spelled J-O-H-N S-M-I-T-H, is that right?" Wait for their confirmation. If they correct you, spell it back again and confirm once more before proceeding.`;

export function buildAuthSystemPrompt(voiceMode: boolean, language?: string): string {
  const languageLine =
    language && LANGUAGE_NAMES[language]
      ? `\n\nIMPORTANT: You must respond ONLY in ${LANGUAGE_NAMES[language]}.`
      : "";
  const base = voiceMode ? AUTH_BASE + AUTH_VOICE_ADDENDUM : AUTH_BASE;
  return base + languageLine;
}

/** @deprecated use buildAuthSystemPrompt */
export const SYSTEM_PROMPT_AUTH = AUTH_BASE;

export function buildMockMemberSystemPrompt(
  member: MockMember,
  language?: string,
): string {
  const claimsText = member.claims
    .map((c) => {
      if (c.status === "PROCESSED")
        return `- ${c.service} at ${c.provider} (${c.date}): Processed — Plan paid $${c.planPaid ?? 0}, member owes $${c.memberOwes ?? 0}`;
      if (c.status === "PARTIALLY_DENIED")
        return `- ${c.service} at ${c.provider} (${c.date}): Partially Denied — ${c.denialReason ?? ""}. Appeal deadline: ${c.appealDeadline ?? "unknown"}`;
      if (c.status === "PENDING")
        return `- ${c.service} at ${c.provider} (${c.date}): Pending — claim submitted, awaiting processing`;
      if (c.status === "PRIOR_AUTH")
        return `- ${c.service}: Prior Authorization approved through ${c.authApprovedThrough ?? "unknown"}. ${c.notes ?? ""}`;
      return `- ${c.service}: ${c.status}`;
    })
    .join("\n");

  const languageLine =
    language && LANGUAGE_NAMES[language]
      ? `\n\nIMPORTANT: You must respond ONLY in ${LANGUAGE_NAMES[language]}. All responses — including chip suggestions after CHIPS: — must be written in this language.`
      : "";

  return (
    `You are Clovis, a friendly and knowledgeable Medicare support assistant for Clover Health members. You're speaking with ${member.name}, a verified member on the Clover Health ${member.plan} (${member.planType}) plan in New Jersey. Their ZIP code is ${member.zip} — use this automatically when searching for nearby providers without asking for it.

Their account details:
- Member ID: ${member.memberId}
- Primary Care Physician: ${member.primaryCarePhysician}
- OTC Card Balance: $${member.otcBalance.toFixed(2)}
- Wellness Rewards: $${member.rewardsEarned} earned of $${member.rewardsTotal} target

Their recent claims:
${claimsText}

When the member asks about claims, bills, or EOBs, reference the specific claim data above and provide precise details. For denied or partially denied claims, explain the denial reason and appeal process. For prior authorizations, confirm what's approved and through when.` +
    SYSTEM_PROMPT_BODY +
    languageLine
  );
}
