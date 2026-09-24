/**
 * Marathi date, time and ritual vocabulary.
 *
 * Deliberately free of `Intl` so that server workers and browsers agree
 * character-for-character (print output must never drift between the
 * preview and the rendered PDF).
 */

import { toDevanagariDigits } from './numerals.js';

export const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
] as const;

export const MARATHI_MONTHS_SHORT = [
  'जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून',
  'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें',
] as const;

export const MARATHI_WEEKDAYS = [
  'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार',
] as const;

export const MARATHI_WEEKDAYS_SHORT = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'] as const;

/** Shaka (शालिवाहन शक) new year: 22 March, so Shaka year ≈ Gregorian − 78 (after 22 March). */
export function gregorianToShaka(date: Date): number {
  const y = date.getUTCFullYear();
  const beforeNewYear = date.getUTCMonth() < 2 || (date.getUTCMonth() === 2 && date.getUTCDate() < 22);
  return beforeNewYear ? y - 79 : y - 78;
}

export function formatMarathiDate(
  date: Date | string,
  style: 'full' | 'long' | 'short' | 'day-month' | 'month-year' = 'long',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const dd = toDevanagariDigits(day);
  const yyyy = toDevanagariDigits(year);
  switch (style) {
    case 'full':
      return `${MARATHI_WEEKDAYS[d.getUTCDay()]}, ${dd} ${MARATHI_MONTHS[month]} ${yyyy}`;
    case 'long':
      return `${dd} ${MARATHI_MONTHS[month as number]} ${yyyy}`;
    case 'short':
      return `${dd} ${MARATHI_MONTHS_SHORT[month as number]} ${yyyy}`;
    case 'day-month':
      return `${dd} ${MARATHI_MONTHS[month as number]}`;
    case 'month-year':
      return `${MARATHI_MONTHS[month as number]} ${yyyy}`;
  }
}

/**
 * Marathi clock time. Marathi convention is to write the period word first
 * with a 12 hour clock: "सकाळी १०:४२", "दुपारी १२:३०", "संध्याकाळी ६:१५",
 * "रात्री ९:०५".
 */
export function formatMarathiTime(date: Date | string, style: 'prefix' | 'short' = 'prefix'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const h24 = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = periodWord(h24);
  let h = h24 % 12;
  if (h === 0) h = 12;
  const time = `${toDevanagariDigits(h)}:${toDevanagariDigits(String(m).padStart(2, '0'))}`;
  return style === 'short' ? time : `${period} ${time}`;
}

export function periodWord(h24: number): string {
  if (h24 < 4) return 'रात्री';
  if (h24 < 12) return 'सकाळी';
  if (h24 < 16) return 'दुपारी';
  if (h24 < 20) return 'संध्याकाळी';
  return 'रात्री';
}

export function formatMarathiDateTime(date: Date | string): string {
  return `${formatMarathiDate(date, 'full')} | ${formatMarathiTime(date)}`;
}

/** Relative phrasing used by dashboards: "आज", "उद्या", "३ दिवसांत". */
export function formatMarathiRelative(target: Date | string, from: Date = new Date()): string {
  const t = typeof target === 'string' ? new Date(target) : target;
  const days = Math.round((Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) -
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())) / 86_400_000);
  if (days === 0) return 'आज';
  if (days === 1) return 'उद्या';
  if (days === 2) return 'परवा';
  if (days === -1) return 'काल';
  if (days > 0) return `${toDevanagariDigits(days)} दिवसांत`;
  return `${toDevanagariDigits(Math.abs(days))} दिवसांपूर्वी`;
}

/** Tithi / nakshatra / yoga names used by the Panchang module and Muhurat UI. */
export const TITHI_NAMES = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पौर्णिमा',
] as const;

export const PAKSHA_NAMES = ['शुक्ल', 'कृष्ण'] as const;

export const NAKSHATRA_NAMES = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्रा', 'पुनर्वसू', 'पुष्य', 'आश्लेषा', 'मघा',
  'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूळ', 'पूर्वाषाढा',
  'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपदा', 'उत्तरा भाद्रपदा', 'रेवती',
] as const;

export const YOGA_NAMES = [
  'विष्कुंभ', 'प्रीती', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृती', 'शूल', 'गंड',
  'वृद्धी', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धी', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव',
  'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृती',
] as const;

export const KARANA_NAMES = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टी',
] as const;

export const RASHI_NAMES = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तूळ', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

export const GRAHA_NAMES = [
  'सूर्य', 'चंद्र', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहू', 'केतू',
] as const;

export const WEEKDAY_LORDS = [
  'सूर्य', 'चंद्र', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि',
] as const;

/** Marathi ritual / ceremony vocabulary. */
export const RITUALS = {
  engagement: 'साखरपुडा',
  haldi: 'हळदी समारंभ',
  mehendi: 'मेहंदी',
  sangeet: 'संगीत समारंभ',
  vivah: 'विवाह',
  reception: 'स्वागत समारंभ',
  naming: 'नामकरण संस्कार',
  mundan: 'जावळ काढणे',
  thread: 'उपनयन संस्कार (मुंज)',
  gruhapravesh: 'गृहप्रवेश',
  vastushanti: 'वास्तुशांती',
  satyanarayan: 'श्री सत्यनारायण महापूजा',
  ganpati: 'श्री गणेश स्थापना',
  navratri: 'नवरात्र उत्सव',
  birthday: 'वाढदिवस',
  annaprashan: 'अन्नप्राशन',
  bhoomi: 'भूमिपूजन',
  shraddha: 'श्राद्ध विधी',
  punyatithi: 'पुण्यतिथी',
} as const;

export const INVOCATIONS = {
  ganesh: '॥ श्री गणेशाय नमः ॥',
  kuldevta: '॥ श्री कुलदेवतेच्या कृपेने ॥',
  shree: '॥ श्री ॥',
  swasti: '॥ स्वस्ति ॥',
} as const;

export const BLESSINGS = [
  'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.',
  'आपल्या उपस्थितीने कार्यक्रमाची शोभा वाढेल.',
  'सहकुटुंब सहपरिवार उपस्थित राहावे ही विनंती.',
] as const;
