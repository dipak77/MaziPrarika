/* ── Mazi Patrika shared catalog & helpers ─────────────────────────────── */

export const IMG = {
  mandapStage: "/art/mandap.jpg",
  goldenColumns:
    "https://images.pexels.com/photos/14395559/pexels-photo-14395559.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  haldiDecor:
    "https://images.pexels.com/photos/31002035/pexels-photo-31002035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  haldiJoy:
    "https://images.pexels.com/photos/35508972/pexels-photo-35508972.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  bridePetals:
    "https://images.pexels.com/photos/19569602/pexels-photo-19569602.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  coupleRitual: "/art/camera.jpg",
  ceremonyColor:
    "https://images.pexels.com/photos/35872915/pexels-photo-35872915.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  mehndiHands:
    "https://images.pexels.com/photos/15460659/pexels-photo-15460659.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  mehndiFeet:
    "https://images.pexels.com/photos/21568655/pexels-photo-21568655.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  maharashtrianBride:
    "https://images.pexels.com/photos/38961898/pexels-photo-38961898.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  diya: "https://images.pexels.com/photos/14170937/pexels-photo-14170937.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  banquet: "/art/lawn.jpg",
  banquetTable:
    "https://images.pexels.com/photos/29410669/pexels-photo-29410669.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  thali: "/art/thali.jpg",
  thaliServe:
    "https://images.pexels.com/photos/8818723/pexels-photo-8818723.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dessertTable:
    "https://images.pexels.com/photos/18980077/pexels-photo-18980077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  pujaPrayer:
    "https://images.pexels.com/photos/8818667/pexels-photo-8818667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  craftCards:
    "https://images.pexels.com/photos/12426868/pexels-photo-12426868.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  marigoldFeet:
    "https://images.pexels.com/photos/31381690/pexels-photo-31381690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const EVENT_TYPES = [
  { value: "wedding", mr: "विवाह", en: "Wedding" },
  { value: "engagement", mr: "साखरपुडा", en: "Engagement" },
  { value: "birthday", mr: "वाढदिवस", en: "Birthday" },
  { value: "naming", mr: "नामकरण", en: "Naming" },
  { value: "gruhapravesh", mr: "गृहप्रवेश", en: "Gruha Pravesh" },
  { value: "puja", mr: "सत्यनारायण पूजा", en: "Satyanarayan Puja" },
  { value: "corporate", mr: "स्नेहसंमेलन", en: "Corporate" },
] as const;

export const eventTypeMr = (v: string) =>
  EVENT_TYPES.find((t) => t.value === v)?.mr ?? v;

export const CATEGORIES = [
  { value: "venue", mr: "लॉन आणि हॉल", en: "Venues" },
  { value: "decorator", mr: "डेकोरेशन", en: "Decorators" },
  { value: "photographer", mr: "फोटोग्राफी", en: "Photography" },
  { value: "caterer", mr: "कॅटरिंग", en: "Catering" },
  { value: "makeup", mr: "मेकअप", en: "Makeup" },
  { value: "mehndi", mr: "मेहंदी", en: "Mehndi" },
  { value: "music", mr: "ढोल आणि संगीत", en: "Music & Dhol" },
  { value: "florist", mr: "फुलकार", en: "Florists" },
  { value: "printer", mr: "छापखाना", en: "Print Works" },
  { value: "cake", mr: "केक", en: "Cakes" },
  { value: "pandit", mr: "पुरोहित", en: "Pundits" },
] as const;

export const categoryMr = (v: string) =>
  CATEGORIES.find((c) => c.value === v)?.mr ?? v;

export const BUDGET_CATEGORIES = [
  { value: "venue", mr: "स्थळ" },
  { value: "catering", mr: "कॅटरिंग" },
  { value: "decoration", mr: "डेकोरेशन" },
  { value: "photo", mr: "फोटो व व्हिडिओ" },
  { value: "clothing", mr: "कपडे व दागिने" },
  { value: "printing", mr: "छपाई व आमंत्रण" },
  { value: "music", mr: "संगीत" },
  { value: "other", mr: "इतर" },
];

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const formatLakh = (n: number) => {
  if (n >= 100000) {
    const l = n / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} लाख`;
  }
  return formatINR(n);
};

export const mrDate = (iso?: string | null) => {
  if (!iso) return "दिनांक ठरवायचे आहे";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  try {
    return new Intl.DateTimeFormat("mr-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(d);
  } catch {
    return iso;
  }
};

export const mrDateShort = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  try {
    return new Intl.DateTimeFormat("mr-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
};

export const daysUntil = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

/* ── Invitation design templates ──────────────────────────────────────── */
export type TemplateId = "paithani" | "warli" | "shubhra" | "rajmudra";

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  en: string;
  desc: string;
  price: number;
}[] = [
  {
    id: "paithani",
    name: "पैठणी राजे",
    en: "Paithani Royal",
    desc: "गुलाबी-सोनेरी पैठणी काठ, सोन्याच्या अक्षरांत.",
    price: 199,
  },
  {
    id: "warli",
    name: "वारली उत्सव",
    en: "Warli Utsav",
    desc: "मातीच्या रंगांतली वारली चित्रकला — हस्तकलेचा ठसा.",
    price: 149,
  },
  {
    id: "shubhra",
    name: "शुभ्र आधुनिक",
    en: "Ivory Modern",
    desc: "हस्तिदंती शुभ्रता, किंचित सोनेरी रेषा — संयमी लक्झरी.",
    price: 129,
  },
  {
    id: "rajmudra",
    name: "राजमुद्रा",
    en: "Rajmudra Deep",
    desc: "गडद किरमिजीवर सुवर्ण राजमुद्रा — भव्य, दरबारी.",
    price: 249,
  },
];

export const BLESSINGS = [
  "श्री गणेशाय नमः",
  "॥ श्री स्वामी समर्थ ॥",
  "शुभं भवतु",
  "अथ श्रीविवाहकलशं पूजयिष्ये",
];

export type DesignData = {
  template: TemplateId;
  eventType: string;
  personA: string;
  personB: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  host: string;
  blessing: string;
};

export const DEFAULT_DESIGN: DesignData = {
  template: "paithani",
  eventType: "wedding",
  personA: "तेजस प्रभुलकर देशमुख",
  personB: "अनन्या श्रीनिवास कुलकर्णी",
  date: "2026-11-24",
  time: "दुपारी १२:३० वा.",
  venue: "शिवनेरी लॉन्स, बाणेर",
  city: "पुणे",
  host: "श्री. देशमुख व श्री. कुलकर्णी कुटुंबीय",
  blessing: "श्री गणेशाय नमः",
};
