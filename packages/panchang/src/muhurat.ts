/**
 * Muhurat suitability engine.
 *
 * PRODUCT RULE (from the platform charter): never print a "good date / bad
 * date" label. Instead we publish a *suitability score with its methodology*
 * — classical muhurat rules, the ephemeris and ayanamsa used, and every
 * contributing factor listed. The family and their priest decide; the software
 * only does the arithmetic consistently.
 */

import { computePanchang, NAKSHATRA_NAMES_MR, TITHI_NAMES_MR, WEEKDAY_MR, type PanchangLocation, type PanchangResult, type TimeWindow } from './panchang.js';
import type { AyanamsaMethod } from './astronomy.js';

export type MuhuratMethod = 'विवाह मुहूर्त (सौर सिद्धांत)' | 'गृहप्रवेश मुहूर्त' | 'नामकरण मुहूर्त' | 'सामान्य शुभ मुहूर्त' | 'सत्यनारायण पूजा' | 'जावळ/मुंडन मुहूर्त' | 'भूमिपूजन मुहूर्त';

export interface MuhuratFactor {
  id: string;
  label: string;
  /** Points added (positive) or removed (negative) from the 100-point base. */
  delta: number;
  impact: 'positive' | 'neutral' | 'negative';
  detail: string;
}

export interface MuhuratSuitability {
  date: string;
  weekday: string;
  score: number;
  /** Plain, non-judgemental banding. */
  band: 'उत्तम अनुकूलता' | 'चांगली अनुकूलता' | 'मध्यम अनुकूलता' | 'मर्यादित अनुकूलता';
  factors: MuhuratFactor[];
  recommendedWindows: TimeWindow[];
  avoidWindows: TimeWindow[];
  panchang: PanchangResult;
  methodology: {
    name: MuhuratMethod;
    ayanamsa: AyanamsaMethod;
    ephemeris: string;
    note: string;
  };
}

/** Classical vivah nakshatras (11). */
const VIVAH_NAKSHATRA = [4, 5, 10, 12, 13, 15, 17, 19, 21, 26, 27];
/** Classical gruhapravesh nakshatras. */
const GRUHA_NAKSHATRA = [4, 5, 12, 13, 14, 15, 17, 21, 27];
/** Shubh (auspicious) nakshatras for general ceremonies. */
const SHUBH_NAKSHATRA = [1, 4, 5, 7, 8, 12, 13, 15, 17, 21, 22, 23, 24, 27];
/** Rikta tithis (4, 9, 14) + amavasya — avoided for most samskaras. */
const RIKTA_TITHI_NUMBERS = [4, 9, 14];
const AUSPICIOUS_WEEKDAYS = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri

const TITHI_NUMBER = (index: number): number => (index % 15) + 1;

function bandFor(score: number): MuhuratSuitability['band'] {
  if (score >= 85) return 'उत्तम अनुकूलता';
  if (score >= 70) return 'चांगली अनुकूलता';
  if (score >= 50) return 'मध्यम अनुकूलता';
  return 'मर्यादित अनुकूलता';
}

export interface MuhuratRequest {
  /** Event type key from @mazi/marathi taxonomy (loosely typed to avoid a cycle). */
  eventType: string;
  date: { year: number; month: number; day: number };
  location: PanchangLocation;
  ayanamsa?: AyanamsaMethod;
}

function methodFor(eventType: string): MuhuratMethod {
  switch (eventType) {
    case 'wedding': return 'विवाह मुहूर्त (सौर सिद्धांत)';
    case 'engagement':
    case 'sakharpuda': return 'सामान्य शुभ मुहूर्त';
    case 'gruhapravesh': return 'गृहप्रवेश मुहूर्त';
    case 'bhoomipujan': return 'भूमिपूजन मुहूर्त';
    case 'naming':
    case 'annaprashan': return 'नामकरण मुहूर्त';
    case 'mundan': return 'जावळ/मुंडन मुहूर्त';
    case 'satyanarayan': return 'सत्यनारायण पूजा';
    default: return 'सामान्य शुभ मुहूर्त';
  }
}

/**
 * Evaluate the Muhurat suitability of one calendar date for one event type.
 */
export function evaluateMuhurat(request: MuhuratRequest): MuhuratSuitability {
  const { eventType, date, location } = request;
  const ayanamsa = request.ayanamsa ?? 'lahiri';
  const panchang = computePanchang(date.year, date.month, date.day, location, ayanamsa);
  const factors: MuhuratFactor[] = [];
  let score = 70; // neutral baseline; factors move it up or down

  const tithiNumber = TITHI_NUMBER(panchang.tithi.index);
  const nak = panchang.nakshatra.index + 1;

  /* ---- tithi ---- */
  if (panchang.tithi.isAmavasya) {
    score -= 20;
    factors.push({ id: 'tithi-amavasya', label: 'अमावास्या', delta: -20, impact: 'negative', detail: 'अमावास्या — बहुतेक मंगल कार्यांसाठी वर्ज्य' });
  } else if (panchang.tithi.isPurnima) {
    // Purnima is श्रेष्ठ for सत्यनारायण पूजा but वर्ज्य for विवाह and most samskaras.
    const samskara = eventType === 'wedding' || eventType === 'engagement' || eventType === 'sakharpuda' || eventType === 'naming';
    const delta = eventType === 'satyanarayan' ? 18 : samskara ? -12 : 4;
    score += delta;
    factors.push({
      id: 'tithi-purnima',
      label: 'पौर्णिमा',
      delta,
      impact: delta >= 0 ? 'positive' : 'negative',
      detail: eventType === 'satyanarayan'
        ? 'सत्यनारायण पूजेसाठी पौर्णिमा श्रेष्ठ'
        : samskara
          ? 'पौर्णिमा — विवाहादी मंगल कार्यास सामान्यतः वर्ज्य'
          : 'पौर्णिमा — सामान्य कार्यास अनुकूल',
    });
  } else if (RIKTA_TITHI_NUMBERS.includes(tithiNumber)) {
    // रिक्ता तिथी (चतुर्थी, नवमी, चतुर्दशी) — वर्ज्य for samskaras, discouraged otherwise.
    const samskara = eventType === 'wedding' || eventType === 'engagement' || eventType === 'sakharpuda'
      || eventType === 'naming' || eventType === 'annaprashan' || eventType === 'gruhapravesh' || eventType === 'bhoomipujan';
    const delta = samskara ? -22 : -15;
    score += delta;
    factors.push({
      id: 'tithi-rikta',
      label: `रिक्ता तिथी (${TITHI_NAMES_MR[tithiNumber - 1]})`,
      delta,
      impact: 'negative',
      detail: samskara
        ? 'चतुर्थी, नवमी, चतुर्दशी — रिक्ता तिथी, मंगल कार्यास वर्ज्य'
        : 'चतुर्थी, नवमी, चतुर्दशी — रिक्ता तिथी, शुभ कार्यास टाळाव्यात',
    });
  } else if ([2, 3, 5, 7, 10, 11, 12, 13].includes(tithiNumber)) {
    score += 10;
    factors.push({ id: 'tithi-shubh', label: `तिथी (${TITHI_NAMES_MR[tithiNumber - 1]})`, delta: 10, impact: 'positive', detail: 'शुभ तिथी — कार्यास अनुकूल' });
  } else {
    factors.push({ id: 'tithi-neutral', label: `तिथी (${TITHI_NAMES_MR[tithiNumber - 1]})`, delta: 0, impact: 'neutral', detail: 'तिथी तटस्थ' });
  }

  /* ---- nakshatra ---- */
  const preferred = eventType === 'wedding' || eventType === 'engagement' || eventType === 'sakharpuda'
    ? VIVAH_NAKSHATRA
    : eventType === 'gruhapravesh' || eventType === 'bhoomipujan'
      ? GRUHA_NAKSHATRA
      : eventType === 'mundan'
        ? [4, 5, 8, 13, 14, 15, 22, 23, 27]
        : SHUBH_NAKSHATRA;
  if (preferred.includes(nak)) {
    score += 15;
    factors.push({ id: 'nakshatra', label: `नक्षत्र — ${NAKSHATRA_NAMES_MR[nak - 1]}`, delta: 15, impact: 'positive', detail: 'या कार्यासाठी पारंपरिक शुभ नक्षत्र' });
  } else {
    score -= 12;
    factors.push({ id: 'nakshatra-off', label: `नक्षत्र — ${NAKSHATRA_NAMES_MR[nak - 1]}`, delta: -12, impact: 'negative', detail: 'या कार्यासाठी या नक्षत्राचा समावेश शुभ नक्षत्रांत नाही' });
  }

  /* ---- weekday ---- */
  if (AUSPICIOUS_WEEKDAYS.includes(panchang.weekday)) {
    score += 8;
    factors.push({ id: 'weekday', label: panchang.weekdayName, delta: 8, impact: 'positive', detail: 'सोम, बुध, गुरु, शुक्र — मंगल कार्यास अनुकूल' });
  } else if (panchang.weekday === 2 || panchang.weekday === 6) {
    score -= 6;
    factors.push({ id: 'weekday-hard', label: panchang.weekdayName, delta: -6, impact: 'negative', detail: 'मंगळवार/शनिवार — विवाहादी कार्यास सामान्यतः टाळतात (अपवाद: विशेष मास)' });
  } else {
    factors.push({ id: 'weekday-neutral', label: panchang.weekdayName, delta: 0, impact: 'neutral', detail: 'वार तटस्थ' });
  }

  /* ---- Rahu Kaal ---- */
  factors.push({
    id: 'rahu',
    label: `राहुकाळ ${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}`,
    delta: -4,
    impact: 'negative',
    detail: 'राहुकाळात मुख्य विधी टाळावा; अभिजित मुहूर्त उपलब्ध',
  });
  score -= 4;
  factors.push({
    id: 'abhijit',
    label: `अभिजित मुहूर्त ${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`,
    delta: 6,
    impact: 'positive',
    detail: 'अभिजित मुहूर्त — बहुतेक विधींसाठी शुभ',
  });
  score += 6;

  /* ---- Kharmas (Sun in Sagittarius) — wedding houses avoid ---- */
  if (eventType === 'wedding' && panchang.sunRashi === 'धनु') {
    score -= 18;
    factors.push({ id: 'kharmas', label: 'खरमास (सूर्य धनु राशीत)', delta: -18, impact: 'negative', detail: 'खरमास काळात विवाह विधी प्रचलित नाही' });
  }

  /* ---- Adhik / Guru-pushya style notes ---- */
  if (panchang.yoga.name === 'व्यतीपात' || panchang.yoga.name === 'वैधृती' || panchang.yoga.name === 'विष्कुंभ') {
    score -= 8;
    factors.push({ id: 'yoga', label: `योग — ${panchang.yoga.name}`, delta: -8, impact: 'negative', detail: 'अशुभ योग — मुख्य विधी टाळावा' });
  } else if (['सौभाग्य', 'शोभन', 'शुभ', 'सिद्ध', 'सुकर्मा', 'धृव', 'ध्रुव', 'वृद्धी', 'हर्षण'].includes(panchang.yoga.name)) {
    score += 6;
    factors.push({ id: 'yoga-shubh', label: `योग — ${panchang.yoga.name}`, delta: 6, impact: 'positive', detail: 'शुभ योग' });
  }

  /**
   * Ceiling: no date is presented as a guaranteed 100/100. The final judgement
   * belongs to the family and their purohit, and the score should reflect that
   * a muhurat is traditional guidance rather than a certainty.
   */
  score = Math.max(0, Math.min(98, Math.round(score)));

  const recommendedWindows = [
    panchang.abhijitMuhurat,
    ...panchang.choghadiyaDay.filter((w) => w.quality === 'शुभ' && w.label !== 'काल'),
    ...panchang.choghadiyaDay.filter((w) => w.label === 'लाभ' || w.label === 'अमृत'),
  ]
    .filter((w) => overlaps(w, panchang.rahuKaal) === false)
    .sort((a, b) => a.startIso.localeCompare(b.startIso));

  const avoidWindows = [panchang.rahuKaal, panchang.yamaganda, panchang.gulikaKaal];

  return {
    date: panchang.date,
    weekday: panchang.weekdayName,
    score,
    band: bandFor(score),
    factors,
    recommendedWindows: dedupeWindows(recommendedWindows),
    avoidWindows,
    panchang,
    methodology: {
      name: methodFor(eventType),
      ayanamsa,
      ephemeris: panchang.method.ephemeris,
      note: 'ही अनुकूलता पारंपारिक मुहूर्त शास्त्राच्या नियमांवर आधारित गणना आहे. अंतिम निर्णय कुटुंब व गुरुजींच्या सल्ल्याने घ्यावा.',
    },
  };
}

function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.startIso < b.endIso && b.startIso < a.endIso;
}

function dedupeWindows(windows: TimeWindow[]): TimeWindow[] {
  const seen = new Set<string>();
  const out: TimeWindow[] = [];
  for (const w of windows) {
    const key = `${w.startIso}-${w.endIso}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

export interface MuhuratSearchOptions {
  eventType: string;
  location: PanchangLocation;
  /** Inclusive ISO date range. */
  from: string;
  to: string;
  /** Maximum number of dates to return. */
  limit?: number;
  /** Only return dates at/above this score. */
  minScore?: number;
  ayanamsa?: AyanamsaMethod;
}

/**
 * Scan a date range and rank candidate dates for an event type.
 * This is the deterministic engine behind "मुहूर्त शोधा" in the AI planner —
 * the model never invents a muhurat, it only explains this output.
 */
export function findMuhurats(options: MuhuratSearchOptions): MuhuratSuitability[] {
  const { eventType, location, from, to, limit = 10, minScore = 0 } = options;
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];

  const out: MuhuratSuitability[] = [];
  const cursor = new Date(start.getTime());
  let guard = 0;
  while (cursor <= end && guard < 800) {
    guard += 1;
    const result = evaluateMuhurat({
      eventType,
      date: { year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1, day: cursor.getUTCDate() },
      location,
      ...(options.ayanamsa ? { ayanamsa: options.ayanamsa } : {}),
    });
    if (result.score >= minScore) out.push(result);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return out
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, limit);
}

/** Human summary line for UI/WhatsApp, e.g. "गुरुवार, १२ डिसेंबर २०२६ — उत्तम अनुकूलता (९१/१००)". */
export function summariseMuhurat(result: MuhuratSuitability): string {
  return `${result.weekday}, ${result.date} — ${result.band} (${result.score}/100) • ${result.methodology.name}`;
}

export const MUHURAT_WEEKDAY_NAMES = WEEKDAY_MR;
