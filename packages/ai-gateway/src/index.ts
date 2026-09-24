/**
 * @mazi/ai-gateway — the AI *orchestrator*, not a guesser.
 *
 * The model never invents a muhurat, a price, an availability or a vendor. It
 * extracts intent in Marathi, proposes a plan of **tool calls**, and then
 * explains the deterministic engine's output back in Marathi.
 *
 * Layers:
 *   1. Guardrails      — scope, safety, prompt-injection, privacy
 *   2. Intent parser   — deterministic Marathi/English extraction (works offline)
 *   3. Planner         — intent → ordered tool calls with typed arguments
 *   4. Executor        — runs tools against injected, real implementations
 *   5. Explainer       — Marathi answer built from tool results only
 *   6. Cost/ledger     — tokens, cost, cache, budget caps per user & per event
 */

import { z } from 'zod';

import { formatMarathiCurrency, formatMarathiDate, MARATHI_MONTHS, toDevanagariDigits } from '@mazi/marathi';
import { evaluateMuhurat, findMuhurats, type MuhuratSuitability } from '@mazi/panchang';
import { gunaMilan, type GunaInput } from '@mazi/panchang';

export const AI_GATEWAY_VERSION = '1.0.0';

/* ------------------------------------------------------------------ */
/* Tool registry                                                       */
/* ------------------------------------------------------------------ */

export const ToolNameSchema = z.enum([
  'CreateEvent', 'UpdateEvent', 'SearchVendors', 'GetAvailability', 'GetPanchang',
  'FindMuhurat', 'CalculateKundali', 'CreateInvitation', 'CreateQuote', 'GetBudget',
  'AddGuest', 'SendReminder', 'CreatePrintOrder',
]);
export type ToolName = z.infer<typeof ToolNameSchema>;

export interface ToolDefinition<I = unknown, O = unknown> {
  name: ToolName;
  /** Marathi description shown in the UI when a tool runs. */
  description: string;
  /** Mutating tools require explicit user confirmation before execution. */
  mutating: boolean;
  /** Cost hint in "engine units" for rate limiting (not money). */
  cost: 'cheap' | 'moderate' | 'expensive';
  inputSchema: z.ZodType<I>;
  /** Pure documentation of the output type. */
  outputSchema?: z.ZodType<O>;
}

const EventTypeEnum = z.enum([
  'wedding', 'engagement', 'sakharpuda', 'haldi', 'sangeet', 'reception', 'birthday', 'naming',
  'annaprashan', 'mundan', 'thread', 'gruhapravesh', 'satyanarayan', 'ganpati', 'navratri',
  'bhoomipujan', 'punyatithi', 'corporate', 'school', 'community', 'other',
]);

export const TOOL_REGISTRY: Record<ToolName, ToolDefinition> = {
  CreateEvent: {
    name: 'CreateEvent', description: 'नवीन कार्यक्रम तयार करा (इव्हेंट वर्कस्पेस)',
    mutating: true, cost: 'cheap',
    inputSchema: z.object({
      eventType: EventTypeEnum,
      title: z.string().min(1),
      date: z.string(),
      city: z.string(),
      guestCount: z.number().int().positive().optional(),
      budgetPaise: z.number().int().positive().optional(),
    }),
  },
  UpdateEvent: {
    name: 'UpdateEvent', description: 'कार्यक्रमाची माहिती अद्ययावत करा',
    mutating: true, cost: 'cheap',
    inputSchema: z.object({ eventId: z.string(), patch: z.record(z.string(), z.unknown()) }),
  },
  SearchVendors: {
    name: 'SearchVendors', description: 'शहर, बजेट व दिनांकानुसार विक्रेते शोधा',
    mutating: false, cost: 'cheap',
    inputSchema: z.object({
      category: z.string(),
      city: z.string(),
      date: z.string().optional(),
      maxPricePaise: z.number().int().positive().optional(),
      limit: z.number().int().min(1).max(20).default(5),
    }),
  },
  GetAvailability: {
    name: 'GetAvailability', description: 'विक्रेत्याची उपलब्धता तपासा',
    mutating: false, cost: 'cheap',
    inputSchema: z.object({ vendorId: z.string(), date: z.string() }),
  },
  GetPanchang: {
    name: 'GetPanchang', description: 'दैनिक पंचांग (तिथी, नक्षत्र, राहुकाळ, चौघडिया)',
    mutating: false, cost: 'cheap',
    inputSchema: z.object({ date: z.string(), city: z.string() }),
  },
  FindMuhurat: {
    name: 'FindMuhurat', description: 'कार्यक्रमासाठी शुभ मुहूर्त शोधा (पद्धत व गुणांकनासह)',
    mutating: false, cost: 'moderate',
    inputSchema: z.object({
      eventType: EventTypeEnum,
      city: z.string(),
      from: z.string(),
      to: z.string(),
      limit: z.number().int().min(1).max(20).default(5),
    }),
  },
  CalculateKundali: {
    name: 'CalculateKundali', description: 'जन्म तपशिलावरून जन्मराशी/नक्षत्र व गुण मिलान (खाजगी)',
    mutating: false, cost: 'moderate',
    inputSchema: z.object({
      brideDob: z.string().optional(), brideTime: z.string().optional(),
      groomDob: z.string().optional(), groomTime: z.string().optional(),
      city: z.string().optional(),
      bride: z.object({ rashi: z.number().min(1).max(12), nakshatra: z.number().min(1).max(27) }).optional(),
      groom: z.object({ rashi: z.number().min(1).max(12), nakshatra: z.number().min(1).max(27) }).optional(),
    }),
  },
  CreateInvitation: {
    name: 'CreateInvitation', description: 'मराठी निमंत्रण पत्रिका तयार करा',
    mutating: true, cost: 'moderate',
    inputSchema: z.object({
      eventType: EventTypeEnum,
      eventId: z.string().optional(),
      hosts: z.array(z.string()),
      date: z.string(),
      venueName: z.string(),
      city: z.string(),
      muhuratLabel: z.string().optional(),
    }),
  },
  CreateQuote: {
    name: 'CreateQuote', description: 'विक्रेत्याकडून कोट (दरपत्रक) तयार करा',
    mutating: true, cost: 'cheap',
    inputSchema: z.object({ vendorId: z.string(), eventId: z.string(), category: z.string() }),
  },
  GetBudget: {
    name: 'GetBudget', description: 'कार्यक्रमाचे बजेट विश्लेषण व वाटप',
    mutating: false, cost: 'cheap',
    inputSchema: z.object({ eventId: z.string().optional(), eventType: EventTypeEnum, budgetPaise: z.number().int().positive() }),
  },
  AddGuest: {
    name: 'AddGuest', description: 'पाहुणे जोडा',
    mutating: true, cost: 'cheap',
    inputSchema: z.object({ eventId: z.string(), guests: z.array(z.object({ name: z.string(), phone: z.string().optional() })) }),
  },
  SendReminder: {
    name: 'SendReminder', description: 'पाहुण्यांना व्हॉट्सअ‍ॅप स्मरणिका पाठवा',
    mutating: true, cost: 'moderate',
    inputSchema: z.object({ eventId: z.string(), guestIds: z.array(z.string()).default([]), template: z.string().optional() }),
  },
  CreatePrintOrder: {
    name: 'CreatePrintOrder', description: 'छपाई ऑर्डर तयार करा (प्रूफ, प्रमाण, आकार)',
    mutating: true, cost: 'expensive',
    inputSchema: z.object({
      designId: z.string(),
      quantity: z.number().int().positive(),
      paper: z.string().default('मॅट ३०० GSM'),
      express: z.boolean().default(false),
    }),
  },
};

export const TOOL_LIST = Object.values(TOOL_REGISTRY);
export const MUTATING_TOOLS = TOOL_LIST.filter((t) => t.mutating).map((t) => t.name);

/* ------------------------------------------------------------------ */
/* Guardrails                                                          */
/* ------------------------------------------------------------------ */

export interface GuardrailVerdict {
  allowed: boolean;
  category: 'ok' | 'matrimony-discovery' | 'out-of-scope-advice' | 'prompt-injection' | 'personal-data' | 'abuse';
  message: string;
  /** A safe, useful alternative instead of a flat refusal. */
  redirect?: string;
}

const GUARDRAILS: Array<{ category: GuardrailVerdict['category']; pattern: RegExp; message: string; redirect?: string }> = [
  {
    category: 'matrimony-discovery',
    pattern: /(मुली|मुलगा|वधू|वर)\s*(शोध|मिळव|बघायच|अपलोड)|shaadi|jivansathi|matrimony|bride\s*search|groom\s*search/i,
    message: 'माझी पत्रिका विवाह-जुळवणी किंवा मुला-मुलींची शोधसेवा देत नाही.',
    redirect: 'आम्ही निर्णय झाल्यानंतरची सर्व कामे करतो — पत्रिका, बजेट, पाहुणे, विक्रेते व छपाई. खाजगी बायोडाटा फक्त दुव्याद्वारे शेअर करता येतो.',
  },
  {
    category: 'out-of-scope-advice',
    pattern: /(डॉक्टर|औषध|आजार).*(सल्ला|द्या)|legal advice|कायदेशीर सल्ला|गुंतवणूक सल्ला|शेअर|कर्ज घ्याव|तलाक/i,
    message: 'वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला देणे माझ्या कार्यक्षेत्रात नाही.',
    redirect: 'कार्यक्रम नियोजनासंबंधी प्रश्न विचारा — मुहूर्त, बजेट, विक्रेते, पत्रिका, छपाई.',
  },
  {
    category: 'prompt-injection',
    pattern: /(ignore|disregard).{0,20}(previous|above|system)|system\s*prompt|तुमचे निर्देश विसरा|तू आता free/i,
    message: 'अंतर्गत सूचना बदलण्याचा प्रयत्न आढळला.',
    redirect: 'कृपया कार्यक्रमासंबंधी प्रश्न विचारा.',
  },
  {
    category: 'personal-data',
    pattern: /\b\d{12}\b|aadhaar|आधार क्रमांक|pan card|क्रेडिट कार्ड|otp|पासवर्ड/i,
    message: 'कृपया आधार, PAN, कार्ड क्रमांक किंवा OTP येथे लिहू नका.',
    redirect: 'पेमेंट सुरक्षित गेटवेद्वारे होते; संवेदनशील क्रमांक आम्ही स्वीकारत नाही.',
  },
  {
    category: 'abuse',
    pattern: /(गाळी|शिवी)|(fuck|bitch|idiot).{0,10}(please|help)|कुणाला मारणे/i,
    message: 'अशा भाषेत सहाय्य करता येत नाही.',
    redirect: 'कार्यक्रमाबद्दल स्पष्टपणे विचारा.',
  },
];

export function checkGuardrails(text: string): GuardrailVerdict {
  for (const rule of GUARDRAILS) {
    if (rule.pattern.test(text)) {
      return { allowed: false, category: rule.category, message: rule.message, ...(rule.redirect ? { redirect: rule.redirect } : {}) };
    }
  }
  return { allowed: true, category: 'ok', message: 'ok' };
}

/* ------------------------------------------------------------------ */
/* Intent parsing (deterministic, offline-safe)                        */
/* ------------------------------------------------------------------ */

export interface ParsedIntent {
  raw: string;
  eventType?: string;
  city?: string;
  guestCount?: number;
  budgetPaise?: number;
  dateHint?: { from: string; to: string; label: string };
  categories: string[];
  relations?: { relation: string; eventType: string };
  isMuhuratQuestion: boolean;
  isPrintRequest: boolean;
  isInvitationRequest: boolean;
  isBudgetQuestion: boolean;
  language: 'mr' | 'en' | 'mixed';
}

/**
 * Marathi place names inflect (`पुणे` → `पुण्यात`, `मुंबई` → `मुंबईत`). We match
 * a vowel-stripped stem plus one Marathi suffix rather than requiring the exact
 * nominative form, so a natural sentence is understood as written.
 */
interface CityMatcher { pattern: RegExp; city: string }

const CITY_NAMES: Record<string, string> = {
  'पुणे': 'पुणे', pune: 'पुणे', 'पिंपरी': 'पिंपरी-चिंचवड', pimpri: 'पिंपरी-चिंचवड',
  'मुंबई': 'मुंबई', mumbai: 'मुंबई', 'नाशिक': 'नाशिक', nashik: 'नाशिक',
  'नागपूर': 'नागपूर', nagpur: 'नागपूर', 'ठाणे': 'ठाणे', thane: 'ठाणे',
  'कोल्हापूर': 'कोल्हापूर', kolhapur: 'कोल्हापूर', 'सातारा': 'सातारा', satara: 'सातारा',
  'सांगली': 'सांगली', sangli: 'सांगली', 'सोलापूर': 'सोलापूर', solapur: 'सोलापूर',
};

const CITY_MATCHERS: CityMatcher[] = Object.entries(CITY_NAMES)
  .map(([key, city]) => {
    if (/^[a-z\s]+$/i.test(key)) {
      return { pattern: new RegExp(`\\b${key}\\b`, 'i'), city };
    }
    const stem = key.length > 3 ? key.replace(/[ाीुूेैोौ]$/, '') : key;
    return { pattern: new RegExp(`${stem}[\\u0900-\\u097F]{0,4}(?![\\u0900-\\u097F])`), city };
  })
  .sort((a, b) => b.pattern.source.length - a.pattern.source.length);

const EVENT_KEYWORDS: Array<{ pattern: RegExp; eventType: string }> = [
  { pattern: /लग्न|विवाह|विवाहसोहळा|wedding|marriage/i, eventType: 'wedding' },
  { pattern: /साखरपुडा|engagement|सगाई/i, eventType: 'engagement' },
  { pattern: /हळदी|haldi/i, eventType: 'haldi' },
  { pattern: /संगीत|sangeet/i, eventType: 'sangeet' },
  { pattern: /स्वागत समारंभ|रिसेप्शन|reception/i, eventType: 'reception' },
  { pattern: /वाढदिवस|birthday/i, eventType: 'birthday' },
  { pattern: /नामकरण|naming/i, eventType: 'naming' },
  { pattern: /अन्नप्राशन/i, eventType: 'annaprashan' },
  { pattern: /जावळ|मुंडन|mundan/i, eventType: 'mundan' },
  { pattern: /मुंज|उपनयन|thread/i, eventType: 'thread' },
  { pattern: /गृहप्रवेश|house\s*warming|gruhapravesh/i, eventType: 'gruhapravesh' },
  { pattern: /सत्यनारायण|satyanarayan/i, eventType: 'satyanarayan' },
  { pattern: /गणेश स्थापना|गणपती|ganpati/i, eventType: 'ganpati' },
  { pattern: /नवरात्र|navratri/i, eventType: 'navratri' },
  { pattern: /भूमिपूजन|bhoomipujan/i, eventType: 'bhoomipujan' },
  { pattern: /पुण्यतिथी|श्राद्ध|punyatithi/i, eventType: 'punyatithi' },
  { pattern: /कॉर्पोरेट|corporate|conference/i, eventType: 'corporate' },
  { pattern: /शाळा|महाविद्यालय|school|college/i, eventType: 'school' },
  { pattern: /सामाजिक|community|स्नेहसंमेलन/i, eventType: 'community' },
];

const CATEGORY_KEYWORDS: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /मंगल कार्यालय|हॉल|लॉन|सभागृह|venue|मंगलकार्यालय|स्टेज|स्थळ/i, category: 'venue' },
  { pattern: /छायाचित्र|फोटोग्राफ|photograph|कॅमेरा/i, category: 'photographer' },
  { pattern: /व्हिडिओ|व्हिडीओ|video|सिनेमॅटिक/i, category: 'videographer' },
  { pattern: /सजावट|डेकोर|decor|फुलांची/i, category: 'decorator' },
  { pattern: /केटरिंग|भोजन|जेवण|खानावळ|catering|मेनू/i, category: 'caterer' },
  { pattern: /छपाई|प्रिंट|print|पत्रिका छपाई/i, category: 'printer' },
  { pattern: /मेकअप|पर्लर|makeup/i, category: 'makeup' },
  { pattern: /मेहंदी|mehendi|मेंदी/i, category: 'mehendi' },
  { pattern: /ढोल|ताशा|बैंड|dj|डीजे|वादक|संगीत संच/i, category: 'dj' },
  { pattern: /फोटो बूथ|प्रोजेक्टर|साऊंड|ध्वनी|lighting|लायटिंग/i, category: 'lighting' },
  { pattern: /केक|cake/i, category: 'cake' },
  { pattern: /फुल|फुलं|गुलाब|फुलवाला|florist/i, category: 'florist' },
  { pattern: /गुरुजी|भटजी|पुजारी|priest|बोवा/i, category: 'priest' },
  { pattern: /गाडी|वाहन|बस|ट्रॅव्हल|transport/i, category: 'transport' },
  { pattern: /गिफ्ट|भेटवस्तू|gifting/i, category: 'gifting' },
];

const MARATHI_NUMBER_WORDS: Record<string, number> = {
  एक: 1, दोन: 2, तीन: 3, चार: 4, पाच: 5, सहा: 6, सात: 7, आठ: 8, नऊ: 9, दहा: 10,
  वीस: 20, तीस: 30, चाळीस: 40, पन्नास: 50, साठ: 60, सत्तर: 70, ऐंशी: 80, नव्वद: 90, शंभर: 100,
  दीड: 1.5, अडीच: 2.5, सव्वा: 1.25,
};

/** Devanagari digits → ASCII, so "१५ लाख" and "15 लाख" behave identically. */
function normaliseDigits(text: string): string {
  return text.replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
}

function parseAmount(text: string): number | undefined {
  // "1 लाख", "₹1,50,000", "50 हजार", "दीड लाख"
  const lakhMatch = /(\d+(?:\.\d+)?)\s*(लाख|lakh|lac)/i.exec(text);
  if (lakhMatch) return Math.round(Number(lakhMatch[1]) * 100_000 * 100);
  const thousandMatch = /(\d+(?:\.\d+)?)\s*(हजार|thousand|k\b)/i.exec(text);
  if (thousandMatch) return Math.round(Number(thousandMatch[1]) * 1000 * 100);
  const rupeeMatch = /(?:₹|rs\.?\s*)(\d[\d,]{2,})/i.exec(text);
  if (rupeeMatch) return Math.round(Number(rupeeMatch[1]!.replace(/,/g, '')) * 100);
  for (const [word, value] of Object.entries(MARATHI_NUMBER_WORDS)) {
    if (new RegExp(`${word}\\s*लाख`).test(text)) return Math.round(value * 100_000 * 100);
    if (new RegExp(`${word}\\s*हजार`).test(text)) return Math.round(value * 1000 * 100);
  }
  return undefined;
}

function parseGuestCount(text: string): number | undefined {
  const match = /(\d{2,4})\s*(?:लोक|पाहुणे|माणसे|guests|people|जण)/i.exec(text);
  if (match) return Number(match[1]);
  const reverse = /(?:लोक|पाहुणे|guests|people)\s*(\d{2,4})/i.exec(text);
  if (reverse) return Number(reverse[1]);
  return undefined;
}

function parseDateHint(text: string, now: Date): ParsedIntent['dateHint'] {
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) return { from: iso[0], to: iso[0], label: iso[0] };
  const monthNames: Array<[RegExp, number]> = [
    [/जानेवारी|january/i, 1], [/फेब्रुवारी|february/i, 2], [/मार्च|march/i, 3], [/एप्रिल|april/i, 4],
    [/मे\b|may/i, 5], [/जून|june/i, 6], [/जुलै|july/i, 7], [/ऑगस्ट|august/i, 8],
    [/सप्टेंबर|september/i, 9], [/ऑक्टोबर|october/i, 10], [/नोव्हेंबर|november/i, 11], [/डिसेंबर|december/i, 12],
  ];
  for (const [pattern, month] of monthNames) {
    if (pattern.test(text)) {
      const yearMatch = /(\d{4})/.exec(text)?.[1];
      const y = yearMatch ? Number(yearMatch) : now.getUTCFullYear();
      const from = new Date(Date.UTC(y, month - 1, 1) - 86_400_000);
      const to = new Date(Date.UTC(y, month, 0));
      return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        label: `${MARATHI_MONTHS[month - 1] ?? month} ${toDevanagariDigits(y)}`,
      };
    }
  }
  if (/पुढच्या महिन्यात|पुढील महिन्यात|next month/i.test(text)) {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), label: 'पुढील महिना' };
  }
  if (/पुढच्या आठवड्यात|next week/i.test(text)) {
    const from = new Date(now.getTime() + 7 * 86_400_000);
    const to = new Date(now.getTime() + 14 * 86_400_000);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), label: 'पुढील आठवडा' };
  }
  if (/या महिन्यात|this month/i.test(text)) {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), label: 'हा महिना' };
  }
  return undefined;
}

function detectLanguage(text: string): ParsedIntent['language'] {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasLatin = /[A-Za-z]{3,}/.test(text);
  return hasDevanagari && hasLatin ? 'mixed' : hasDevanagari ? 'mr' : 'en';
}

/** Deterministic intent extraction — no model required, no hallucinations. */
export function parseIntent(text: string, now: Date = new Date()): ParsedIntent {
  const normalised = normaliseDigits(text);
  const city = CITY_MATCHERS.find((m) => m.pattern.test(text))?.city;
  const eventKeyword = EVENT_KEYWORDS.find((e) => e.pattern.test(text));
  const categories = CATEGORY_KEYWORDS.filter((c) => c.pattern.test(text)).map((c) => c.category);

  let relation: ParsedIntent['relations'];
  if (/मुलाचा|मुलगा|मुलाची|मुलीचा|मुलीचे|सुपुत्र|सुपुत्री|son|daughter/i.test(text)) {
    relation = { relation: /मुली|सुपुत्री|daughter/i.test(text) ? 'daughter' : 'son', eventType: eventKeyword?.eventType ?? 'birthday' };
  }

  return {
    raw: text,
    ...(eventKeyword ? { eventType: eventKeyword.eventType } : {}),
    ...(city ? { city } : {}),
    ...(parseGuestCount(normalised) ? { guestCount: parseGuestCount(normalised)! } : {}),
    ...(parseAmount(normalised) ? { budgetPaise: parseAmount(normalised)! } : {}),
    ...(parseDateHint(normalised, now) ? { dateHint: parseDateHint(normalised, now)! } : {}),
    categories,
    ...(relation ? { relations: relation } : {}),
    isMuhuratQuestion: /मुहूर्त|मुहुर्त|muhurat|शुभ दिवस|शुभ तारीख/i.test(text),
    isPrintRequest: /छपाई|छाप|प्रिंट|print|कार्ड/i.test(text),
    isInvitationRequest: /पत्रिक|निमंत्र|invitation|आमंत्रण/i.test(text),
    isBudgetQuestion: /बजेट|खर्च|budget|किती लागेल|अंदाज/i.test(text),
    language: detectLanguage(text),
  };
}

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export interface PlannedCall {
  tool: ToolName;
  args: Record<string, unknown>;
  /** Why this call is needed — shown in the UI and audited. */
  rationale: string;
  requiresConfirmation: boolean;
}

export interface Plan {
  summary: string;
  calls: PlannedCall[];
  /** Questions the assistant needs answered before it can act. */
  clarifications: string[];
}

export function planFromIntent(intent: ParsedIntent, context: { now?: Date } = {}): Plan {
  const now = context.now ?? new Date();
  const calls: PlannedCall[] = [];
  const clarifications: string[] = [];
  const eventType = intent.eventType ?? 'birthday';
  const city = intent.city ?? '';
  if (!city) clarifications.push('कार्यक्रम कोणत्या शहरात आहे?');

  if (intent.eventType) {
    calls.push({
      tool: 'CreateEvent',
      args: {
        eventType,
        title: `${eventSlug(eventType)} कार्यक्रम`,
        date: intent.dateHint?.from ?? now.toISOString().slice(0, 10),
        city,
        ...(intent.guestCount ? { guestCount: intent.guestCount } : {}),
        ...(intent.budgetPaise ? { budgetPaise: intent.budgetPaise } : {}),
      },
      rationale: 'कार्यक्रम वर्कस्पेस तयार करणे — पुढील सर्व कामांचा आधार',
      requiresConfirmation: true,
    });
  }

  if (intent.budgetPaise) {
    calls.push({
      tool: 'GetBudget',
      args: { eventType, budgetPaise: intent.budgetPaise },
      rationale: 'बजेटचे श्रेणीनुसार वाटप (पारंपरिक खर्च रचनेनुसार)',
      requiresConfirmation: false,
    });
  }

  const categories = intent.categories.length
    ? intent.categories
    : eventType === 'wedding' ? ['venue', 'caterer', 'photographer'] : ['caterer'];
  for (const category of categories) {
    calls.push({
      tool: 'SearchVendors',
      args: {
        category, city, limit: 5,
        ...(intent.budgetPaise ? { maxPricePaise: Math.round(intent.budgetPaise * 0.4) } : {}),
      },
      rationale: `${category} श्रेणीत उपलब्ध विक्रेते`,
      requiresConfirmation: false,
    });
  }

  if (intent.isMuhuratQuestion || eventType === 'wedding' || eventType === 'gruhapravesh') {
    const from = intent.dateHint?.from ?? now.toISOString().slice(0, 10);
    const to = intent.dateHint?.to ?? new Date(now.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
    calls.push({
      tool: 'FindMuhurat',
      args: { eventType, city, from, to, limit: 5 },
      rationale: 'पंचांग गणनेनुसार मुहूर्त अनुकूलता (पद्धतीसह)',
      requiresConfirmation: false,
    });
  }

  if (intent.isInvitationRequest) {
    calls.push({
      tool: 'CreateInvitation',
      args: {
        eventType, hosts: [], date: intent.dateHint?.from ?? now.toISOString().slice(0, 10),
        venueName: '', city,
      },
      rationale: 'मराठी पत्रिका तयार करणे (नंतर नावे/स्थळ भरता येईल)',
      requiresConfirmation: false,
    });
  }

  if (intent.isPrintRequest) {
    calls.push({
      tool: 'CreatePrintOrder',
      args: { designId: 'pending', quantity: intent.guestCount ?? 100, express: /तातडी|express|लवकर/i.test(intent.raw) },
      rationale: 'छपाई ऑर्डर — डिझाइन निवडल्यावर प्रमाण निश्चित होईल',
      requiresConfirmation: true,
    });
  }

  const summaryParts: string[] = [];
  if (intent.eventType) summaryParts.push(`${eventSlug(eventType)} (${eventType})`);
  if (city) summaryParts.push(city);
  if (intent.guestCount) summaryParts.push(`${toDevanagariDigits(intent.guestCount)} पाहुणे`);
  if (intent.budgetPaise) summaryParts.push(formatMarathiCurrency(intent.budgetPaise / 100, { words: true }));

  return {
    summary: summaryParts.length ? `समजले: ${summaryParts.join(' • ')}` : 'समजले: कार्यक्रम नियोजन विनंती',
    calls,
    clarifications,
  };
}

function eventSlug(eventType: string): string {
  const map: Record<string, string> = {
    wedding: 'विवाह', engagement: 'साखरपुडा', sakharpuda: 'साखरपुडा', birthday: 'वाढदिवस',
    naming: 'नामकरण', gruhapravesh: 'गृहप्रवेश', satyanarayan: 'सत्यनारायण पूजा',
    thread: 'उपनयन', haldi: 'हळदी', sangeet: 'संगीत', reception: 'स्वागत', corporate: 'कॉर्पोरेट',
    ganpati: 'गणेश स्थापना', navratri: 'नवरात्र', annaprashan: 'अन्नप्राशन', mundan: 'जावळ',
    bhoomipujan: 'भूमिपूजन', punyatithi: 'पुण्यतिथी', school: 'शालेय', community: 'सामाजिक', other: 'इतर',
  };
  return map[eventType] ?? 'कार्यक्रम';
}

/* ------------------------------------------------------------------ */
/* Execution                                                           */
/* ------------------------------------------------------------------ */

export interface ToolContext {
  searchVendors: (args: { category: string; city: string; date?: string; maxPricePaise?: number; limit?: number }) => Promise<Array<{ id: string; name: string; category: string; city: string; startingPricePaise: number; rating: number; verified: boolean }>>;
  getAvailability?: (args: { vendorId: string; date: string }) => Promise<{ status: string; reason: string }>;
  createEvent?: (args: Record<string, unknown>) => Promise<{ id: string; slug: string }>;
  getBudget?: (args: { eventType: string; budgetPaise: number }) => Promise<Array<{ category: string; label: string; estimatedPaise: number }>>;
  cityToLocation: (city: string) => { city: string; latitude: number; longitude: number; tzOffsetHours: number };
}

export interface ToolCallResult {
  tool: ToolName;
  ok: boolean;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  requiresConfirmation?: boolean;
  skipped?: string;
}

export interface ExecutionReport {
  results: ToolCallResult[];
  pendingConfirmation: ToolName[];
  /** Vendor shortlist merged across SearchVendors calls, deduped. */
  vendors: Array<{ id: string; name: string; category: string; city: string; startingPricePaise: number; rating: number; verified: boolean }>;
  muhurats: MuhuratSuitability[];
  budget?: Array<{ category: string; label: string; estimatedPaise: number }>;
  createdEvent?: { id: string; slug: string };
}

export async function executePlan(
  plan: Plan,
  ctx: ToolContext,
  opts: { confirmMutations?: boolean; now?: Date } = {},
): Promise<ExecutionReport> {
  const results: ToolCallResult[] = [];
  const pendingConfirmation: ToolName[] = [];
  const vendors: ExecutionReport['vendors'] = [];
  const muhurats: MuhuratSuitability[] = [];
  let budget: ExecutionReport['budget'];
  let createdEvent: ExecutionReport['createdEvent'];

  for (const call of plan.calls) {
    const definition = TOOL_REGISTRY[call.tool];
    if (definition.mutating && !opts.confirmMutations && call.tool !== 'CreateEvent') {
      pendingConfirmation.push(call.tool);
      results.push({ tool: call.tool, ok: false, args: call.args, requiresConfirmation: true, skipped: 'वापरकर्त्याच्या पुष्टीची प्रतीक्षा' });
      continue;
    }

    try {
      switch (call.tool) {
        case 'CreateEvent': {
          if (!ctx.createEvent) throw new Error('CreateEvent उपलब्ध नाही');
          if (definition.mutating && !opts.confirmMutations && call.requiresConfirmation) {
            pendingConfirmation.push(call.tool);
            results.push({ tool: call.tool, ok: false, args: call.args, requiresConfirmation: true, skipped: 'पुष्टीची प्रतीक्षा' });
            break;
          }
          const created = await ctx.createEvent(call.args);
          createdEvent = created;
          results.push({ tool: call.tool, ok: true, args: call.args, result: created });
          break;
        }
        case 'SearchVendors': {
          const found = await ctx.searchVendors(call.args as Parameters<ToolContext['searchVendors']>[0]);
          for (const v of found) if (!vendors.some((x) => x.id === v.id)) vendors.push(v);
          results.push({ tool: call.tool, ok: true, args: call.args, result: found });
          break;
        }
        case 'GetBudget': {
          if (!ctx.getBudget) throw new Error('GetBudget उपलब्ध नाही');
          budget = await ctx.getBudget(call.args as { eventType: string; budgetPaise: number });
          results.push({ tool: call.tool, ok: true, args: call.args, result: budget });
          break;
        }
        case 'FindMuhurat': {
          const args = call.args as { eventType: string; city: string; from: string; to: string; limit: number };
          const location = ctx.cityToLocation(args.city);
          const found = findMuhurats({
            eventType: args.eventType, location, from: args.from, to: args.to, limit: args.limit,
          });
          muhurats.push(...found);
          results.push({ tool: call.tool, ok: true, args: call.args, result: found.map((m) => ({ date: m.date, score: m.score, band: m.band })) });
          break;
        }
        case 'GetPanchang': {
          const args = call.args as { date: string; city: string };
          const location = ctx.cityToLocation(args.city);
          const [y, m, d] = args.date.split('-').map(Number) as [number, number, number];
          const evaluation = evaluateMuhurat({ eventType: 'other', date: { year: y, month: m, day: d }, location });
          results.push({ tool: call.tool, ok: true, args: call.args, result: evaluation.panchang });
          break;
        }
        case 'CalculateKundali': {
          const args = call.args as { bride?: GunaInput; groom?: GunaInput };
          if (args.bride && args.groom) {
            const milan = gunaMilan(args.bride, args.groom);
            results.push({ tool: call.tool, ok: true, args: call.args, result: milan });
          } else {
            results.push({ tool: call.tool, ok: false, args: call.args, error: 'वधू व वर दोघांची राशी व नक्षत्र आवश्यक' });
          }
          break;
        }
        case 'GetAvailability': {
          if (!ctx.getAvailability) throw new Error('GetAvailability उपलब्ध नाही');
          const res = await ctx.getAvailability(call.args as { vendorId: string; date: string });
          results.push({ tool: call.tool, ok: true, args: call.args, result: res });
          break;
        }
        default:
          results.push({ tool: call.tool, ok: false, args: call.args, error: 'या वातावरणात हे साधन उपलब्ध नाही' });
      }
    } catch (error) {
      results.push({ tool: call.tool, ok: false, args: call.args, error: error instanceof Error ? error.message : 'अज्ञात त्रुटी' });
    }
  }

  return { results, pendingConfirmation, vendors, muhurats, ...(budget ? { budget } : {}), ...(createdEvent ? { createdEvent } : {}) };
}

/* ------------------------------------------------------------------ */
/* Explainer — Marathi answers built only from tool results            */
/* ------------------------------------------------------------------ */

export function explainPlan(plan: Plan, report: ExecutionReport, intent: ParsedIntent): string {
  const lines: string[] = [];
  lines.push(plan.summary);

  if (intent.dateHint) lines.push(`कालावधी: ${intent.dateHint.label}`);

  if (report.createdEvent) {
    lines.push(`✅ कार्यक्रम वर्कस्पेस तयार: /studio/${report.createdEvent.slug}`);
  }
  if (plan.clarifications.length) {
    lines.push(`❓ ${plan.clarifications.join(' ')}`);
  }

  if (report.budget?.length) {
    lines.push('', 'अंदाजे बजेट वाटप:');
    for (const b of report.budget.slice(0, 6)) {
      lines.push(`  • ${b.label}: ${formatMarathiCurrency(b.estimatedPaise / 100)}`);
    }
  }

  if (report.muhurats.length) {
    lines.push('', 'मुहूर्त अनुकूलता (पद्धत: पारंपारिक मुहूर्त शास्त्र):');
    for (const m of report.muhurats.slice(0, 3)) {
      const weekday = m.weekday;
      lines.push(`  • ${weekday}, ${formatMarathiDate(`${m.date}T00:00:00Z`, 'long')} — ${m.band} (${toDevanagariDigits(m.score)}/१००)`);
    }
    lines.push('  ⓘ ही गणना आहे; अंतिम निर्णय गुरुजींच्या सल्ल्याने घ्यावा.');
  }

  if (report.vendors.length) {
    lines.push('', 'उपलब्ध विक्रेते:');
    for (const v of report.vendors.slice(0, 6)) {
      lines.push(`  • ${v.name} (${v.category}) — ${formatMarathiCurrency(v.startingPricePaise / 100)} पासून${v.verified ? ' ✓ पडताळलेले' : ''}`);
    }
  }

  if (report.pendingConfirmation.length) {
    lines.push('', `⏸ पुष्टी आवश्यक: ${report.pendingConfirmation.join(', ')} — "हो, पुढे जा" असे म्हणा.`);
  }

  const failures = report.results.filter((r) => !r.ok && !r.requiresConfirmation);
  if (failures.length) {
    lines.push('', 'काही पायऱ्या पूर्ण झाल्या नाहीत:');
    for (const f of failures) lines.push(`  • ${f.tool}: ${f.error ?? 'अज्ञात कारण'}`);
  }

  return lines.join('\n').trim();
}

/* ------------------------------------------------------------------ */
/* Providers, cost control, cache                                      */
/* ------------------------------------------------------------------ */

export type ProviderId = 'deterministic' | 'groq' | 'anthropic';

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

export interface ProviderResponse {
  text: string;
  provider: ProviderId;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  cached: boolean;
  latencyMs: number;
  /** True when the deterministic fallback produced the answer. */
  fallback: boolean;
}

export interface ProviderConfig {
  provider: ProviderId;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  /** Cost per 1M tokens (input, output) in USD — used for the cost ledger. */
  pricePerMTokUsd?: [number, number];
}

export const PROVIDER_DEFAULTS: Record<ProviderId, { model: string; pricePerMTokUsd: [number, number] }> = {
  deterministic: { model: 'mazi-rules-v1', pricePerMTokUsd: [0, 0] },
  groq: { model: 'llama-3.3-70b-versatile', pricePerMTokUsd: [0.59, 0.79] },
  anthropic: { model: 'claude-3-5-haiku-latest', pricePerMTokUsd: [0.8, 4.0] },
};

const estimateTokens = (text: string): number => Math.ceil(text.length / 3.6);

export interface CostRecord {
  at: string;
  userId: string;
  eventId?: string;
  provider: ProviderId;
  model: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  cached: boolean;
}

export class CostLedger {
  private records: CostRecord[] = [];
  /** Conservative USD→INR used only for internal budget alerts. */
  private readonly usdToInr: number;

  constructor(usdToInr = 88) {
    this.usdToInr = usdToInr;
  }

  record(entry: Omit<CostRecord, 'at' | 'costUsd'> & { at?: string }): CostRecord {
    const price = PROVIDER_DEFAULTS[entry.provider].pricePerMTokUsd;
    const costUsd = (entry.inputTokens / 1_000_000) * price[0] + (entry.outputTokens / 1_000_000) * price[1];
    const full: CostRecord = { at: entry.at ?? new Date().toISOString(), costUsd: Number(costUsd.toFixed(6)), ...entry };
    this.records.push(full);
    return full;
  }

  totalUsd(filter: Partial<Pick<CostRecord, 'userId' | 'eventId'>> = {}): number {
    return Number(this.records
      .filter((r) => (!filter.userId || r.userId === filter.userId) && (!filter.eventId || r.eventId === filter.eventId))
      .reduce((s, r) => s + r.costUsd, 0)
      .toFixed(6));
  }

  /** Cost per paid user must stay under ₹12 per the charter. */
  costPerPaidUserInr(paidUsers: number): number {
    return paidUsers <= 0 ? 0 : Number(((this.totalUsd() * this.usdToInr) / paidUsers).toFixed(2));
  }

  costPerEventInr(eventId: string): number {
    return Number((this.totalUsd({ eventId }) * this.usdToInr).toFixed(2));
  }

  withinBudget(monthlyBudgetInr: number): boolean {
    return this.totalUsd() * this.usdToInr <= monthlyBudgetInr;
  }

  snapshot(): CostRecord[] {
    return [...this.records];
  }
}

interface CacheEntry { key: string; response: ProviderResponse; expiresAt: number }

export class ResponseCache {
  private store = new Map<string, CacheEntry>();
  private readonly ttlMs: number;

  constructor(ttlMs = 7 * 24 * 3_600_000) {
    this.ttlMs = ttlMs;
  }

  keyOf(messages: ChatMessage[], model: string): string {
    const payload = JSON.stringify({ model, messages: messages.map((m) => [m.role, m.content]) });
    let hash = 0;
    for (let i = 0; i < payload.length; i += 1) {
      hash = (hash * 31 + payload.charCodeAt(i)) | 0;
    }
    return `c${hash.toString(36)}`;
  }

  get(messages: ChatMessage[], model: string): ProviderResponse | undefined {
    const key = this.keyOf(messages, model);
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return { ...hit.response, cached: true };
  }

  set(messages: ChatMessage[], model: string, response: ProviderResponse): void {
    this.store.set(this.keyOf(messages, model), { key: this.keyOf(messages, model), response, expiresAt: Date.now() + this.ttlMs });
  }

  size(): number {
    return this.store.size;
  }
}

/**
 * Deterministic explanation provider — produces a real Marathi answer from tool
 * results with zero cost and zero latency. Used in demo/dev and as the fallback
 * when a hosted model is unavailable.
 */
export function deterministicProvider(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const intent = parseIntent(lastUser);
  const plan = planFromIntent(intent);
  const facts: string[] = [];
  if (intent.guestCount) facts.push(`${toDevanagariDigits(intent.guestCount)} पाहुण्यांसाठी योग्य आकाराचे पॅकेज पाहू.`);
  if (intent.budgetPaise) facts.push(`${formatMarathiCurrency(intent.budgetPaise / 100, { words: true })} बजेटनुसार वाटप तयार करतो.`);
  if (intent.city) facts.push(`${intent.city} परिसरातील पडताळलेले विक्रेते दाखवतो.`);
  return [plan.summary, ...facts, 'पुढे जाण्यासाठी "हो" असे म्हणा.'].join('\n');
}

async function callGroq(config: ProviderConfig, messages: ChatMessage[]): Promise<ProviderResponse> {
  const started = Date.now();
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.apiKey ?? ''}` },
    body: JSON.stringify({
      model: config.model ?? PROVIDER_DEFAULTS.groq.model,
      messages, temperature: 0.3, max_tokens: 700,
    }),
    signal: AbortSignal.timeout(config.timeoutMs ?? 12_000),
  });
  if (!response.ok) throw new Error(`Groq ${response.status}`);
  const json = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };
  return {
    text: json.choices[0]?.message.content ?? '',
    provider: 'groq',
    model: config.model ?? PROVIDER_DEFAULTS.groq.model,
    usage: { inputTokens: json.usage?.prompt_tokens ?? 0, outputTokens: json.usage?.completion_tokens ?? 0 },
    cached: false,
    latencyMs: Date.now() - started,
    fallback: false,
  };
}

async function callAnthropic(config: ProviderConfig, messages: ChatMessage[]): Promise<ProviderResponse> {
  const started = Date.now();
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
  const rest = messages.filter((m) => m.role !== 'system');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.apiKey ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model ?? PROVIDER_DEFAULTS.anthropic.model,
      max_tokens: 700,
      ...(system ? { system } : {}),
      messages: rest.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal: AbortSignal.timeout(config.timeoutMs ?? 15_000),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}`);
  const json = await response.json() as {
    content: Array<{ text?: string }>;
    usage?: { input_tokens: number; output_tokens: number };
  };
  return {
    text: json.content.map((c) => c.text ?? '').join(''),
    provider: 'anthropic',
    model: config.model ?? PROVIDER_DEFAULTS.anthropic.model,
    usage: { inputTokens: json.usage?.input_tokens ?? 0, outputTokens: json.usage?.output_tokens ?? 0 },
    cached: false,
    latencyMs: Date.now() - started,
    fallback: false,
  };
}

export interface GenerateOptions {
  config: ProviderConfig;
  cache?: ResponseCache;
  ledger?: CostLedger;
  userId?: string;
  eventId?: string;
  purpose?: string;
  systemPrompt?: string;
  /** Skip the model entirely (pure deterministic pipeline). */
  forceDeterministic?: boolean;
}

const MAZI_SYSTEM_PROMPT = `तू "माझी पत्रिका" या मराठी कार्यक्रम-व्यवस्थापन प्लॅटफॉर्मचा सहाय्यक आहेस.
नियम:
1. केवळ मराठीत उत्तर दे (आवश्यक असल्यास इंग्रजी नावे ठेव).
2. मुहूर्त, दर, उपलब्धता किंवा विक्रेत्यांची माहिती स्वतः तयार करू नकोस — ती साधनांच्या (tools) निकालांवरूनच सांग.
3. विवाह-जुळवणी, वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला देऊ नकोस.
4. शुभ/अशुभ असे ठोकळ निर्णय देऊ नकोस — "मुहूर्त अनुकूलता" पद्धतीसह सांग.
5. वापरकर्त्याची वैयक्तिक माहिती (आधार, PAN, कार्ड) मागू नकोस.`;

export async function generate(
  userMessages: ChatMessage[],
  options: GenerateOptions,
): Promise<ProviderResponse> {
  const started = Date.now();
  const messages: ChatMessage[] = [
    { role: 'system', content: options.systemPrompt ?? MAZI_SYSTEM_PROMPT },
    ...userMessages,
  ];
  const model = options.config.model ?? PROVIDER_DEFAULTS[options.config.provider].model;

  const guard = checkGuardrails(userMessages.map((m) => m.content).join('\n'));
  if (!guard.allowed) {
    return {
      text: [guard.message, guard.redirect].filter(Boolean).join('\n'),
      provider: 'deterministic', model: 'guardrails', usage: { inputTokens: 0, outputTokens: 0 },
      cached: false, latencyMs: 0, fallback: true,
    };
  }

  const cache = options.cache;
  if (cache) {
    const hit = cache.get(messages, model);
    if (hit) {
      options.ledger?.record({
        userId: options.userId ?? 'anonymous', provider: hit.provider, model,
        purpose: options.purpose ?? 'chat', inputTokens: 0, outputTokens: 0, cached: true,
        ...(options.eventId ? { eventId: options.eventId } : {}),
      });
      return hit;
    }
  }

  const wantsModel = !options.forceDeterministic &&
    (options.config.provider === 'groq' || options.config.provider === 'anthropic') &&
    Boolean(options.config.apiKey);

  let response: ProviderResponse;
  if (wantsModel) {
    try {
      response = options.config.provider === 'groq'
        ? await callGroq(options.config, messages)
        : await callAnthropic(options.config, messages);
    } catch {
      response = {
        text: deterministicProvider(userMessages),
        provider: 'deterministic', model: 'mazi-rules-v1',
        usage: { inputTokens: estimateTokens(messages.map((m) => m.content).join(' ')), outputTokens: 0 },
        cached: false, latencyMs: Date.now() - started, fallback: true,
      };
    }
  } else {
    const text = deterministicProvider(userMessages);
    response = {
      text,
      provider: 'deterministic', model: 'mazi-rules-v1',
      usage: { inputTokens: estimateTokens(messages.map((m) => m.content).join(' ')), outputTokens: estimateTokens(text) },
      cached: false, latencyMs: Date.now() - started, fallback: true,
    };
  }

  if (cache && !response.fallback) cache.set(messages, model, response);
  options.ledger?.record({
    userId: options.userId ?? 'anonymous', provider: response.provider, model: response.model,
    purpose: options.purpose ?? 'chat', inputTokens: response.usage.inputTokens,
    outputTokens: response.usage.outputTokens, cached: response.cached,
    ...(options.eventId ? { eventId: options.eventId } : {}),
  });

  return response;
}

/* ------------------------------------------------------------------ */
/* High-level entry point used by the API routes                       */
/* ------------------------------------------------------------------ */

export interface AssistantTurn {
  intent: ParsedIntent;
  plan: Plan;
  report: ExecutionReport;
  answer: string;
  provider: ProviderResponse;
  guardrail: GuardrailVerdict;
}

export async function runAssistant(args: {
  message: string;
  ctx: ToolContext;
  confirmMutations?: boolean;
  generate?: GenerateOptions;
  now?: Date;
}): Promise<AssistantTurn> {
  const now = args.now ?? new Date();
  const guardrail = checkGuardrails(args.message);
  const intent = parseIntent(args.message, now);

  if (!guardrail.allowed) {
    const response: ProviderResponse = {
      text: [guardrail.message, guardrail.redirect].filter(Boolean).join('\n'),
      provider: 'deterministic', model: 'guardrails',
      usage: { inputTokens: 0, outputTokens: 0 }, cached: false, latencyMs: 0, fallback: true,
    };
    return {
      intent, plan: { summary: guardrail.message, calls: [], clarifications: [] },
      report: { results: [], pendingConfirmation: [], vendors: [], muhurats: [] },
      answer: response.text, provider: response, guardrail,
    };
  }

  const plan = planFromIntent(intent, { now });
  const report = await executePlan(plan, args.ctx, { confirmMutations: args.confirmMutations, now });
  const groundedAnswer = explainPlan(plan, report, intent);

  const generated = args.generate
    ? await generate([{ role: 'user', content: args.message }], { ...args.generate, systemPrompt: MAZI_SYSTEM_PROMPT })
    : {
      text: groundedAnswer,
      provider: 'deterministic' as const,
      model: 'mazi-rules-v1',
      usage: { inputTokens: 0, outputTokens: 0 },
      cached: false,
      latencyMs: 0,
      fallback: true,
    };

  // The model may rephrase, but the grounded facts must survive: if the answer
  // drops the tool-derived numbers we return the deterministic explanation.
  const answer = generated.fallback || !isGrounded(generated.text, groundedAnswer) ? groundedAnswer : generated.text;

  return { intent, plan, report, answer, provider: generated, guardrail };
}

/** Cheap grounding check: the answer must retain key numbers/dates from tools. */
function isGrounded(modelText: string, grounded: string): boolean {
  const numbers = grounded.match(/[०-९0-9]{2,}(?::[०-९0-9]{2})?/g) ?? [];
  if (!numbers.length) return true;
  const hits = numbers.filter((n) => modelText.includes(n)).length;
  return hits / numbers.length >= 0.5;
}

export { gunaMilan };
export type { GunaInput, MuhuratSuitability };
