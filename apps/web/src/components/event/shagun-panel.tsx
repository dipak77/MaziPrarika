import type { CardLang } from '@/lib/i18n';
import { getCardCopy } from '@/lib/i18n';

function digitsOf(phone: string): string {
  return phone.replace(/\D/g, '');
}

function payeeFor(ownerPhone?: string): string {
  if (ownerPhone) {
    const digits = digitsOf(ownerPhone);
    const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
    if (last10.length >= 10) return `${last10}@upi`;
    if (last10.length > 0) return `${last10}@upi`;
  }
  return 'family@upi';
}

export function ShagunPanel({ title, ownerPhone, lang }: { title: string; ownerPhone?: string; lang: CardLang }) {
  const copy = getCardCopy(lang);
  const payee = payeeFor(ownerPhone);
  const note = lang === 'mr' ? `आहेर — ${title}` : `Shagun — ${title}`;
  const href = `upi://pay?pa=${encodeURIComponent(payee)}&pn=${encodeURIComponent(title.slice(0, 40))}&cu=INR&tn=${encodeURIComponent(note.slice(0, 80))}`;
  return (
    <section aria-labelledby="shagun-heading" className="surface p-5">
      <h2 id="shagun-heading" className="font-display text-lg font-bold text-charcoal">
        {copy.shagunTitle}
      </h2>
      <p className="mt-1 text-sm font-semibold text-paithani">{copy.shagunZero}</p>
      <p className="mt-1 text-xs text-charcoal-soft">{copy.shagunLedger}</p>
      <p className="mt-2 break-all rounded-xl border border-gold/25 bg-ivory-deep/40 px-3 py-2 font-mono text-sm text-charcoal">
        {payee}
      </p>
      <a
        href={href}
        aria-label={copy.shagunPay}
        className="btn-base btn-maroon mt-3 inline-flex min-h-11 w-full items-center justify-center px-4 py-2 text-sm"
      >
        {copy.shagunPay}
      </a>
      <p className="mt-3 rounded-xl border border-paithani/30 bg-paithani/5 px-3 py-2 text-xs leading-relaxed text-charcoal-soft">
        {copy.shagunReceipt}
      </p>
    </section>
  );
}
