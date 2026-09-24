/**
 * Kundali primitives + Ashtakoot Guna Milan (private, traditional).
 *
 * SCOPE & ETHICS
 * --------------
 * • This module is used for a family's *private* documents (biodata packet,
 *   guna-milan sheet). There is no public ranking, matching or discovery.
 * • Every score is returned with the table version and methodology so a priest
 *   can audit and overrule it. We never render a "suitable / not suitable"
 *   verdict — only the arithmetic and its classical basis.
 * • Tables differ slightly between panchangs; where they do, the variation is
 *   named in `methodology.variations`.
 */

import { computePanchang, NAKSHATRA_NAMES_MR, RASHI_LORDS_MR, RASHI_NAMES_MR, type PanchangLocation } from './panchang.js';
import { luminaries, toSidereal, type AyanamsaMethod } from './astronomy.js';
import { julianDay } from './astronomy.js';

export const GUNA_TABLE_VERSION = 'ashtakoot-mr-1.0.0';

export interface BirthMoment {
  /** ISO date of birth (local calendar date). */
  dob: string;
  /** Local clock time, "HH:MM" 24h. Required for pada-precision rashi. */
  time: string;
  place: PanchangLocation;
  ayanamsa?: AyanamsaMethod;
}

export interface KundaliCore {
  /** Moon sign (जन्मराशी) 1..12 */
  rashi: number;
  rashiName: string;
  rashiLord: string;
  /** Birth nakshatra 1..27 */
  nakshatra: number;
  nakshatraName: string;
  pada: 1 | 2 | 3 | 4;
  nakshatraLord: string;
  /** Nakshatra deity (देवता) — used in classical texts. */
  nakshatraDevata: string;
  /** Navatara index from the janma nakshatra (1 = जन्म). */
  gana: 'देव' | 'मनुष्य' | 'राक्षस';
  nadi: 'आदि' | 'मध्य' | 'अंत्य';
  yoni: string;
  varna: 'ब्राह्मण' | 'क्षत्रिय' | 'वैश्य' | 'शूद्र';
  vashya: 'चतुष्पद' | 'मनुष्य' | 'जलचर' | 'वनचर' | 'कीट';
  moonLongitude: number;
  computedWith: { ayanamsa: AyanamsaMethod; ephemeris: string; accuracyNote: string };
}

const NAKSHATRA_LORDS = [
  'केतू', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगळ', 'राहू', 'गुरु', 'शनि', 'बुध',
] as const;

const NAKSHATRA_DEVATA = [
  'अश्विनीकुमार', 'यम', 'अग्नी', 'ब्रह्मा', 'सोम', 'रुद्र', 'अदिती', 'बृहस्पती', 'सर्प',
  'पितर', 'भग', 'अर्यमा', 'सविता', 'त्वष्टा', 'वायू', 'इंद्राग्नी', 'मित्र', 'इंद्र', 'निरृती',
  'आपः', 'विश्वेदेव', 'विष्णू', 'वसू', 'वरुण', 'अजैकपाद', 'अहिर्बुध्न्य', 'पूषा',
] as const;

/** 27 nakshatras → yoni (14 animal symbols). */
const YONI_BY_NAKSHATRA = [
  'अश्व', 'गज', 'मेष', 'सर्प', 'सर्प', 'श्वान', 'मार्जार', 'मेष', 'मार्जार',
  'मूषक', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'महिष', 'व्याघ्र', 'मृग', 'मृग', 'श्वान',
  'वानर', 'नकुल', 'वानर', 'सिंह', 'अश्व', 'सिंह', 'गौ', 'गज',
] as const;

/** Classical sworn-enemy yoni pairs → 0 points. */
export const YONI_SWORN_ENEMIES: Array<[string, string]> = [
  ['गौ', 'व्याघ्र'], ['गज', 'सिंह'], ['अश्व', 'महिष'], ['श्वान', 'मृग'],
  ['मार्जार', 'मूषक'], ['वानर', 'मेष'], ['नकुल', 'सर्प'],
];

/** Friendly yonis → 3 points. */
const YONI_FRIENDS: Array<[string, string]> = [
  ['गौ', 'मृग'], ['गौ', 'मेष'], ['गज', 'महिष'], ['अश्व', 'अश्व'],
  ['सर्प', 'मृग'], ['मार्जार', 'मृग'], ['वानर', 'मृग'], ['सिंह', 'मृग'],
];

const GANA_BY_NAKSHATRA: Array<KundaliCore['gana']> = [
  'देव', 'मनुष्य', 'राक्षस', 'मनुष्य', 'देव', 'मनुष्य', 'देव', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'देव', 'राक्षस', 'देव', 'राक्षस', 'राक्षस',
  'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव',
];

const NADI_BY_NAKSHATRA: Array<KundaliCore['nadi']> = (() => {
  const nadi = new Array<KundaliCore['nadi']>(27).fill('मध्य');
  const adi = [1, 6, 7, 12, 13, 18, 19, 24, 25];
  const antya = [3, 4, 9, 10, 15, 16, 21, 22, 27];
  for (const n of adi) nadi[n - 1] = 'आदि';
  for (const n of antya) nadi[n - 1] = 'अंत्य';
  return nadi;
})();

const VARNA_BY_RASHI: Array<KundaliCore['varna']> = [
  'क्षत्रिय', 'वैश्य', 'शूद्र', 'ब्राह्मण', 'क्षत्रिय', 'वैश्य',
  'शूद्र', 'ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र', 'ब्राह्मण',
];

const VASHYA_BY_RASHI: Array<KundaliCore['vashya']> = [
  'चतुष्पद', 'चतुष्पद', 'मनुष्य', 'जलचर', 'वनचर', 'मनुष्य',
  'मनुष्य', 'कीट', 'चतुष्पद', 'चतुष्पद', 'मनुष्य', 'जलचर',
];

export const VARNA_RANK: Record<KundaliCore['varna'], number> = {
  ब्राह्मण: 4, क्षत्रिय: 3, वैश्य: 2, शूद्र: 1,
};

/** Compute the core kundali values from a birth moment (moon-based). */
export function kundaliFromBirth(birth: BirthMoment): KundaliCore {
  const ayanamsa = birth.ayanamsa ?? 'lahiri';
  const [y, m, d] = birth.dob.split('-').map(Number) as [number, number, number];
  const [hh, mm] = birth.time.split(':').map(Number) as [number, number];
  const tz = birth.place.tzOffsetHours ?? 5.5;
  const instant = new Date(Date.UTC(y, m - 1, d, hh, mm) - tz * 3_600_000);

  const { moon } = luminaries(instant, ayanamsa);
  const moonLongitude = moon.sidereal;
  const rashi = Math.floor(moonLongitude / 30) + 1;
  const nakshatra = Math.floor(moonLongitude / (360 / 27)) + 1;
  const pada = (Math.floor((moonLongitude % (360 / 27)) / (360 / 108)) + 1) as 1 | 2 | 3 | 4;

  const panchang = computePanchang(y, m, d, birth.place, ayanamsa);

  return {
    rashi,
    rashiName: RASHI_NAMES_MR[rashi - 1] as string,
    rashiLord: RASHI_LORDS_MR[rashi - 1] as string,
    nakshatra,
    nakshatraName: NAKSHATRA_NAMES_MR[nakshatra - 1] as string,
    pada,
    nakshatraLord: NAKSHATRA_LORDS[(nakshatra - 1) % 9] as string,
    nakshatraDevata: NAKSHATRA_DEVATA[nakshatra - 1] as string,
    gana: GANA_BY_NAKSHATRA[nakshatra - 1] as KundaliCore['gana'],
    nadi: NADI_BY_NAKSHATRA[nakshatra - 1] as KundaliCore['nadi'],
    yoni: YONI_BY_NAKSHATRA[nakshatra - 1] as string,
    varna: VARNA_BY_RASHI[rashi - 1] as KundaliCore['varna'],
    vashya: VASHYA_BY_RASHI[rashi - 1] as KundaliCore['vashya'],
    moonLongitude: Number(moonLongitude.toFixed(4)),
    computedWith: {
      ayanamsa,
      ephemeris: panchang.method.ephemeris,
      accuracyNote: 'चंद्राची स्थिती ±०.०२° अचूक. पद (pada) सीमेवर असल्यास ±२ मिनिटांची अस्थिरता शक्य — गुरुजींकडून पडताळणी करावी.',
    },
  };
}

/* ------------------------------------------------------------------ */
/* Ashtakoot (36 guna)                                                 */
/* ------------------------------------------------------------------ */

export interface GunaInput {
  /** Moon sign 1..12 */
  rashi: number;
  /** Birth nakshatra 1..27 */
  nakshatra: number;
}

export interface KootaScore {
  key: string;
  name: string;
  max: number;
  score: number;
  detail: string;
}

export interface GunaMilanResult {
  total: number;
  maxTotal: 36;
  kootas: KootaScore[];
  bride: KundaliCore | GunaInput;
  groom: KundaliCore | GunaInput;
  methodology: {
    table: string;
    variations: string[];
    disclaimer: string;
  };
}

const PLANET_FRIENDS: Record<string, { friends: string[]; enemies: string[] }> = {
  सूर्य: { friends: ['चंद्र', 'मंगळ', 'गुरु'], enemies: ['शुक्र', 'शनि'] },
  चंद्र: { friends: ['सूर्य', 'बुध'], enemies: [] },
  मंगळ: { friends: ['सूर्य', 'चंद्र', 'गुरु'], enemies: ['बुध'] },
  बुध: { friends: ['सूर्य', 'शुक्र'], enemies: ['चंद्र'] },
  गुरु: { friends: ['सूर्य', 'चंद्र', 'मंगळ'], enemies: ['बुध', 'शुक्र'] },
  शुक्र: { friends: ['बुध', 'शनि'], enemies: ['सूर्य', 'चंद्र'] },
  शनि: { friends: ['बुध', 'शुक्र'], enemies: ['सूर्य', 'चंद्र', 'मंगळ'] },
};

function naturalRelationship(a: string, b: string): 'friend' | 'enemy' | 'neutral' {
  if (a === b) return 'friend';
  if (PLANET_FRIENDS[a]?.friends.includes(b)) return 'friend';
  if (PLANET_FRIENDS[a]?.enemies.includes(b)) return 'enemy';
  return 'neutral';
}

/** वर्ण koota (1 point). */
export function varnaKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const bv = VARNA_RANK[VARNA_BY_RASHI[bride.rashi - 1] as KundaliCore['varna']];
  const gv = VARNA_RANK[VARNA_BY_RASHI[groom.rashi - 1] as KundaliCore['varna']];
  const score = gv >= bv ? 1 : 0;
  return {
    key: 'varna', name: 'वर्ण', max: 1, score,
    detail: `वधू ${VARNA_BY_RASHI[bride.rashi - 1]} • वर ${VARNA_BY_RASHI[groom.rashi - 1]}`,
  };
}

/** वश्य koota (2 points) — traditional table, almanacs vary slightly. */
export function vashyaKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const b = VASHYA_BY_RASHI[bride.rashi - 1] as KundaliCore['vashya'];
  const g = VASHYA_BY_RASHI[groom.rashi - 1] as KundaliCore['vashya'];
  let score = 2;
  if (b !== g) {
    const pair = new Set([b, g]);
    if (pair.has('वनचर') || pair.has('कीट')) score = 0;
    else if (pair.has('जलचर') && pair.has('चतुष्पद')) score = 1;
    else if (pair.has('मनुष्य')) score = 1;
    else score = 2;
  }
  return { key: 'vashya', name: 'वश्य', max: 2, score, detail: `वधू ${b} • वर ${g}` };
}

/** तारा (दिन) koota (3 points) — both directions are checked. */
export function taraKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const count = (from: number, to: number) => ((to - from + 27) % 27) + 1;
  if (bride.nakshatra === groom.nakshatra) {
    return {
      key: 'tara', name: 'तारा', max: 3, score: 3,
      detail: 'दोघांचे जन्मनक्षत्र समान — जन्म तारा (समान नक्षत्र नियमानुसार पूर्ण गुण)',
    };
  }
  const taras = [
    count(bride.nakshatra, groom.nakshatra),
    count(groom.nakshatra, bride.nakshatra),
  ];
  const goodTaras = [2, 4, 6, 8, 9];
  const goodCount = taras.filter((t) => goodTaras.includes(((t - 1) % 9) + 1)).length;
  const score = goodCount * 1.5;
  return {
    key: 'tara', name: 'तारा', max: 3, score,
    detail: `वधू→वर तारा ${((taras[0]! - 1) % 9) + 1}, वर→वधू तारा ${((taras[1]! - 1) % 9) + 1} (शुभ तारा: २,४,६,८,९)`,
  };
}

/** योनी koota (4 points). */
export function yoniKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const b = YONI_BY_NAKSHATRA[bride.nakshatra - 1] as string;
  const g = YONI_BY_NAKSHATRA[groom.nakshatra - 1] as string;
  let score = 2;
  if (b === g) score = 4;
  else if (YONI_SWORN_ENEMIES.some(([x, y]) => (x === b && y === g) || (x === g && y === b))) score = 0;
  else if (YONI_FRIENDS.some(([x, y]) => (x === b && y === g) || (x === g && y === b))) score = 3;
  return { key: 'yoni', name: 'योनी', max: 4, score, detail: `वधू ${b} • वर ${g}` };
}

/** ग्रह मैत्री koota (5 points). */
export function grahaMaitriKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const bl = RASHI_LORDS_MR[bride.rashi - 1] as string;
  const gl = RASHI_LORDS_MR[groom.rashi - 1] as string;
  const a = naturalRelationship(gl, bl);
  const b = naturalRelationship(bl, gl);
  const both = new Set([a, b]);
  let score = 3;
  if (a === 'friend' && b === 'friend') score = 5;
  else if (both.has('friend') && both.has('neutral')) score = 4;
  else if (a === 'neutral' && b === 'neutral') score = 3;
  else if (a === 'enemy' && b === 'enemy') score = 0;
  else if (both.has('enemy')) score = 1;
  return {
    key: 'grahaMaitri', name: 'ग्रह मैत्री', max: 5, score,
    detail: `वधू राशीश ${bl} • वर राशीश ${gl}`,
  };
}

/** गण koota (6 points). */
export function ganaKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const b = GANA_BY_NAKSHATRA[bride.nakshatra - 1] as KundaliCore['gana'];
  const g = GANA_BY_NAKSHATRA[groom.nakshatra - 1] as KundaliCore['gana'];
  let score: number;
  if (b === g) score = 6;
  else if (new Set([b, g]).has('देव') && new Set([b, g]).has('मनुष्य')) score = 5;
  else if (new Set([b, g]).has('देव') && new Set([b, g]).has('राक्षस')) score = 1;
  else score = 0;
  return { key: 'gana', name: 'गण', max: 6, score, detail: `वधू ${b} गण • वर ${g} गण` };
}

/** भकूट koota (7 points). */
export function bhakootKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const d1 = ((groom.rashi - bride.rashi + 12) % 12) + 1;
  const d2 = ((bride.rashi - groom.rashi + 12) % 12) + 1;
  const pair = [Math.min(d1, d2), Math.max(d1, d2)].join('-');
  const dosha = ['2-12', '5-9', '6-8'].includes(pair);
  return {
    key: 'bhakoot', name: 'भकूट', max: 7, score: dosha ? 0 : 7,
    detail: `राशी अंतर ${d1}/${d2}${dosha ? ' — भकूट दोष स्थिती' : ''}`,
  };
}

/** नाडी koota (8 points). */
export function nadiKoota(bride: GunaInput, groom: GunaInput): KootaScore {
  const b = NADI_BY_NAKSHATRA[bride.nakshatra - 1] as KundaliCore['nadi'];
  const g = NADI_BY_NAKSHATRA[groom.nakshatra - 1] as KundaliCore['nadi'];
  return {
    key: 'nadi', name: 'नाडी', max: 8, score: b === g ? 0 : 8,
    detail: b === g ? `दोघांचीही ${b} नाडी — नाडी दोष स्थिती` : `वधू ${b} नाडी • वर ${g} नाडी`,
  };
}

/**
 * Ashtakoot Guna Milan — 36 points across 8 kootas.
 * Presented as arithmetic + classical rationale. No verdict, by design.
 */
export function gunaMilan(bride: GunaInput, groom: GunaInput): GunaMilanResult {
  const kootas = [
    varnaKoota(bride, groom),
    vashyaKoota(bride, groom),
    taraKoota(bride, groom),
    yoniKoota(bride, groom),
    grahaMaitriKoota(bride, groom),
    ganaKoota(bride, groom),
    bhakootKoota(bride, groom),
    nadiKoota(bride, groom),
  ];
  const total = Number(kootas.reduce((sum, k) => sum + k.score, 0).toFixed(2));
  return {
    total,
    maxTotal: 36,
    kootas,
    bride,
    groom,
    methodology: {
      table: GUNA_TABLE_VERSION,
      variations: [
        'वश्य व योनी गुणांकन पंचांगानुसार थोडे बदलते — स्थानिक गुरुजींची सारणी प्रमाण मानावी.',
        'भकूट दोषाची गणना २/१२, ५/९, ६/८ राशी अंतरानुसार.',
        'समान जन्मनक्षत्र असल्यास तारा गुण पूर्ण (३) गणले जातात.',
      ],
      disclaimer:
        'हा केवळ पारंपारिक अष्टकूट गणिताचा निकाल आहे. कोणताही निष्कर्ष, शिफारस किंवा योग्य/अयोग्य ठराव यामध्ये नाही. अंतिम निर्णय कुटुंब व गुरुजींचा.',
    },
  };
}

/** Nakshatra name helper for UI dropdowns. */
export function nakshatraOptions(): Array<{ value: number; label: string }> {
  return NAKSHATRA_NAMES_MR.map((label, i) => ({ value: i + 1, label }));
}

export function rashiOptions(): Array<{ value: number; label: string }> {
  return RASHI_NAMES_MR.map((label, i) => ({ value: i + 1, label }));
}

export { julianDay };
