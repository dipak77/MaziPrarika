import {
  formatMarathiCurrency,
  formatMarathiDate,
  formatMarathiDateTime,
  formatMarathiRelative,
  toDevanagariDigits,
} from '@mazi/marathi';

export { formatMarathiCurrency, formatMarathiDate, formatMarathiDateTime, formatMarathiRelative, toDevanagariDigits };

/** Paise → "₹१,५०,०००" in Devanagari digits, the way invoices are read aloud. */
export function devRupees(paise: number): string {
  return toDevanagariDigits(formatMarathiCurrency(paise / 100));
}

export function devNumber(value: number): string {
  return toDevanagariDigits(value);
}

export function percent(value: number, digits = 0): string {
  return `${toDevanagariDigits((value * 100).toFixed(digits))}%`;
}

export function daysUntil(dateIso: string | undefined, from: Date = new Date()): number | null {
  if (!dateIso) return null;
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.round((target - from.getTime()) / 86_400_000);
}

export function shortDate(dateIso: string | undefined): string {
  if (!dateIso) return '—';
  return formatMarathiDate(`${dateIso}T00:00:00Z`, 'day-month');
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'कार्यक्रम';
}
