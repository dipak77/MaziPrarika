/**
 * Marathi numerals, cardinal words and Indian-numbering helpers.
 *
 * Everything here is deterministic and dependency free so that it can run in
 * the browser (live editor preview), on the edge (public invitation page) and
 * in the server render workers (PDF / print) with byte identical output.
 */

/** Devanagari digits 0-9. */
export const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const;

/** Convert any string of Latin digits into Devanagari digits. */
export function toDevanagariDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)] as string);
}

/** Convert Devanagari digits back to Latin digits (input normalisation). */
export function toLatinDigits(value: string | number): string {
  return String(value).replace(/[\u0966-\u096F]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

/** Indian digit grouping: 12345678 -> 1,23,45,678 */
export function groupIndian(value: number | string): string {
  const n = Math.trunc(Number(value));
  const sign = n < 0 ? '-' : '';
  const s = Math.abs(n).toString();
  if (s.length <= 3) return sign + s;
  const head = s.slice(0, s.length - 3);
  const tail = s.slice(-3);
  return sign + head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
}

const ONE_TO_NINETY_NINE = [
  'शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
  'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
  'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
  'तीस', 'एकतीस', 'बत्तीस', 'तेहतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
  'चाळीस', 'एक्केचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
  'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
  'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
  'सत्तर', 'एक्काहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी',
  'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद',
  'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंचाण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव',
] as const;

const HUNDREDS = [
  '', 'शंभर', 'दोनशे', 'तीनशे', 'चारशे', 'पाचशे', 'सहाशे', 'सातशे', 'आठशे', 'नऊशे',
] as const;

/**
 * Cardinal Marathi words using the Indian lakh/crore system.
 * 150000 -> "एक लाख पन्नास हजार"
 */
export function numberToMarathiWords(value: number): string {
  if (!Number.isFinite(value)) return '';
  const n = Math.trunc(Math.abs(value));
  const negative = value < 0;
  const words = n === 0 ? ['शून्य'] : positiveWords(n);
  return (negative ? 'उणे ' : '') + words.join(' ');
}

function positiveWords(n: number): string[] {
  if (n < 100) return [ONE_TO_NINETY_NINE[n] as string];
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    const out = [HUNDREDS[h] as string];
    if (r) out.push(ONE_TO_NINETY_NINE[r] as string);
    return out;
  }
  const units: Array<[number, string]> = [
    [10_000_000, 'कोटी'],
    [100_000, 'लाख'],
    [1000, 'हजार'],
  ];
  const out: string[] = [];
  let rest = n;
  for (const [scale, label] of units) {
    if (rest >= scale) {
      const count = Math.floor(rest / scale);
      rest -= count * scale;
      out.push(...positiveWords(count), label);
    }
  }
  if (rest > 0) out.push(...positiveWords(rest));
  return out;
}

/**
 * Colloquial Marathi money magnitudes (सव्वा / दीड / अडीच / साडे).
 * These are what a Marathi speaker actually writes on an invitation.
 */
export function moneyToMarathiWords(amount: number): string {
  const n = Math.trunc(amount);
  const specials: Array<[number, string]> = [
    [125000, 'सव्वा लाख'], [250000, 'अडीच लाख'], [150000, 'दीड लाख'],
    [12500000, 'सव्वा कोटी'], [25000000, 'अडीच कोटी'], [15000000, 'दीड कोटी'],
    [1250, 'सव्वा हजार'], [2500, 'अडीच हजार'], [1500, 'दीड हजार'],
    [125, 'सव्वाशे'], [250, 'अडीचशे'], [150, 'दीडशे'],
  ];
  for (const [value, label] of specials) if (n === value) return label;
  return numberToMarathiWords(n);
}

/** "१,५०० रुपये" style currency. */
export function formatMarathiCurrency(
  amount: number,
  opts: { words?: boolean; symbol?: string } = {},
): string {
  const { words = false, symbol = '₹' } = opts;
  if (words) return `${moneyToMarathiWords(amount)} रुपये`;
  return `${symbol}${toDevanagariDigits(groupIndian(amount))}`;
}

/** 12 -> "१२ वा" (masculine) | "१२ वी" (feminine) — used for बारावी वाढदिवस. */
export function marathiOrdinal(n: number, gender: 'm' | 'f' = 'm'): string {
  return `${toDevanagariDigits(n)} ${gender === 'm' ? 'वा' : 'वी'}`;
}

/** "पहिला / दुसरा / तिसरा" ordinals used in वाढदिवस headings. */
const ORDINAL_WORDS = [
  'पहिला', 'दुसरा', 'तिसरा', 'चौथा', 'पाचवा', 'सहावा', 'सातवा', 'आठवा', 'नववा', 'दहावा',
  'अकरावा', 'बारावा', 'तेरावा', 'चौदावा', 'पंधरावा', 'सोळावा', 'सतरावा', 'अठरावा', 'एकोणिसावा', 'विसावा',
] as const;

export function marathiOrdinalWord(n: number, gender: 'm' | 'f' = 'm'): string {
  const base = ORDINAL_WORDS[n - 1];
  if (!base) return marathiOrdinal(n, gender);
  if (gender === 'f') {
    return base.endsWith('ा') ? `${base.slice(0, -1)}ी` : base;
  }
  return base;
}
