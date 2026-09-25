'use client';

import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

import type { Guest } from '@mazi/store';

import { addGuestAction } from '@/app/studio/[slug]/actions';

const SIDE_LABEL: Record<string, string> = {
  bride: 'वधूकडील',
  groom: 'वरकडील',
  both: 'दोन्हीकडील',
  host: 'यजमान',
  guest: 'पाहुणे',
};

const RSVP_STYLE: Record<string, string> = {
  yes: 'border-paithani/30 bg-paithani-soft text-paithani',
  no: 'border-maroon/25 bg-maroon-light text-maroon',
  maybe: 'border-gold/40 bg-gold/12 text-gold-ink',
  pending: 'border-gold/20 bg-ivory-deep text-charcoal-soft',
};

export function GuestPanel({
  slug,
  rsvp,
  guests,
}: {
  slug: string;
  rsvp: { invited: number; responded: number; yes: number; no: number; maybe: number; expectedHeads: number };
  guests: Guest[];
}) {
  const [query, setQuery] = useState('');
  const [side, setSide] = useState<'all' | 'bride' | 'groom' | 'both'>('all');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const filtered = guests.filter((guest) => {
    const matchesQuery = query
      ? `${guest.name} ${guest.relation ?? ''} ${guest.phone ?? ''} ${guest.code}`.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesSide = side === 'all' ? true : guest.side === side;
    return matchesQuery && matchesSide;
  });

  const responseRate = rsvp.invited ? Math.round((rsvp.responded / rsvp.invited) * 100) : 0;
  const awaiting = Math.max(0, rsvp.invited - rsvp.responded);

  return (
    <section aria-labelledby="guests-heading" className="surface-elevated animate-fade-up overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="guests-heading" className="tracking-tight text-charcoal">पाहुणे व आर.एस.व्ही.पी.</h2>
            <p className="mt-1 font-ui text-xs font-medium uppercase tracking-wider text-charcoal-soft">आदरयुक्त नातेसंबंध-आधारित यादी • QR आर.एस.व्ही.पी. स्वयंचलित</p>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-full bg-ivory-deep px-4 py-2 font-ui text-xs font-bold text-charcoal-soft ring-1 ring-gold/20">
            आमंत्रित {toDevanagariDigits(rsvp.invited)} • उत्तर {toDevanagariDigits(rsvp.responded)} ({toDevanagariDigits(responseRate)}%) • अपेक्षित {toDevanagariDigits(rsvp.expectedHeads)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'येतील', value: rsvp.yes, tone: 'paithani' },
            { label: 'येणार नाहीत', value: rsvp.no, tone: 'maroon' },
            { label: 'कदाचित', value: rsvp.maybe, tone: 'gold' },
            { label: 'प्रतीक्षेत', value: awaiting, tone: 'soft' },
          ].map((tile) => (
            <div
              key={tile.label}
              className={
                tile.tone === 'paithani'
                  ? 'rounded-2xl border border-paithani/20 bg-paithani-soft/70 p-3.5 shadow-2xs'
                  : tile.tone === 'maroon'
                    ? 'rounded-2xl border border-maroon/15 bg-maroon-light p-3.5 shadow-2xs'
                    : tile.tone === 'gold'
                      ? 'rounded-2xl border border-gold/30 bg-gold/10 p-3.5 shadow-2xs'
                      : 'rounded-2xl border border-gold/20 bg-ivory-deep/60 p-3.5 shadow-2xs'
              }
            >
              <p className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">{tile.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight text-charcoal">{toDevanagariDigits(tile.value)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-gold/20 bg-white px-4 py-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">प्रतिसाद दर — {toDevanagariDigits(responseRate)}%</p>
            <p className="font-ui text-xs font-semibold text-charcoal-muted">{toDevanagariDigits(rsvp.responded)}/{toDevanagariDigits(rsvp.invited)} उत्तरे</p>
          </div>
          <div
            className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-ivory-deep ring-1 ring-gold/15"
            role="progressbar"
            aria-valuenow={responseRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="आर.एस.व्ही.पी. प्रतिसाद दर"
          >
            <div className="h-full rounded-full bg-paithani transition-all duration-700" style={{ width: `${responseRate}%` }} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">
            {awaiting > 0
              ? `${toDevanagariDigits(awaiting)} पाहुण्यांकडून उत्तर बाकी — डिजिटल पानावरून स्मरण पाठवा.`
              : 'सर्व पाहुण्यांची उत्तरे आली — आसन व भोजन नियोजन निश्चित करा.'}
          </p>
        </div>

        <form
          action={(formData) => {
            setResult(null);
            startTransition(async () => {
              try {
                await addGuestAction(formData);
                setResult({ ok: true, message: 'पाहुणा जोडला — यादीत दिसेल.' });
              } catch (error) {
                setResult({
                  ok: false,
                  message: error instanceof Error ? error.message : 'पाहुणा जोडता आला नाही — पुन्हा प्रयत्न करा.',
                });
              }
            });
          }}
          className="mt-5 grid gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.9fr_auto]"
        >
          <input type="hidden" name="slug" value={slug} />
          <label className="sr-only" htmlFor={`guest-name-${slug}`}>पाहुण्याचे नाव</label>
          <input
            id={`guest-name-${slug}`}
            name="name"
            required
            maxLength={120}
            placeholder="पाहुण्याचे नाव *"
            className="min-h-11 rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm font-medium text-charcoal shadow-2xs outline-none placeholder:text-charcoal-muted/60 focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
          />
          <input
            name="phone"
            inputMode="tel"
            pattern="[0-9+ -]{8,15}"
            placeholder="मोबाइल (ऐच्छिक)"
            aria-label="मोबाइल क्रमांक"
            className="min-h-11 rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
          />
          <input
            name="relation"
            placeholder="नाते — उदा. मामा"
            aria-label="नाते"
            className="min-h-11 rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
          />
          <input
            name="guestCount"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            aria-label="किती व्यक्ती"
            className="min-h-11 rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm font-bold tabular-nums text-charcoal shadow-2xs outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
          />
          <select
            name="side"
            defaultValue="both"
            aria-label="कडे"
            className="min-h-11 rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm font-medium text-charcoal shadow-2xs outline-none focus:border-maroon/40"
          >
            <option value="groom">वरकडील</option>
            <option value="bride">वधूकडील</option>
            <option value="both">दोन्हीकडील</option>
            <option value="host">यजमान</option>
          </select>
          <button type="submit" disabled={pending} className="btn-base btn-maroon min-h-11 px-5 text-sm shadow-sm disabled:opacity-60">
            {pending ? 'जोडत आहे…' : 'पाहुणा जोडा'}
          </button>
        </form>

        {pending ? (
          <div aria-hidden className="mt-4 space-y-2">
            <div className="skeleton h-12 rounded-xl" />
          </div>
        ) : null}

        {result ? (
          <p
            className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-relaxed ${result.ok ? 'border-paithani/30 bg-paithani-soft text-paithani' : 'border-maroon/25 bg-maroon-light text-maroon'}`}
            role={result.ok ? 'status' : 'alert'}
          >
            {result.message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <label className="sr-only" htmlFor={`guest-search-${slug}`}>पाहुणे शोधा</label>
            <input
              id={`guest-search-${slug}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="शोधा — नाव, नाते किंवा संहिता"
              className="min-h-11 w-full rounded-full border border-gold/30 bg-white py-2 pl-10 pr-4 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
            />
            <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted">⌕</span>
          </div>
          {(['all', 'groom', 'bride', 'both'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSide(option)}
              aria-pressed={side === option}
              className={
                side === option
                  ? 'min-h-11 rounded-full bg-maroon px-4 text-xs font-bold text-white shadow-sm'
                  : 'min-h-11 rounded-full border border-gold/30 bg-white px-4 text-xs font-semibold text-charcoal-soft shadow-2xs transition hover:border-gold/50'
              }
            >
              {option === 'all' ? 'सर्व' : SIDE_LABEL[option]}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm">
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="sr-only">पाहुण्यांची यादी — नाव, नाते, कडे, व्यक्ती, आर.एस.व्ही.पी. व संहिता</caption>
              <thead className="sticky top-0 z-10 bg-ivory-deep/95 backdrop-blur">
                <tr className="text-left font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                  <th scope="col" className="px-4 py-3">नाव</th>
                  <th scope="col" className="px-3 py-3">नाते</th>
                  <th scope="col" className="px-3 py-3">कडे</th>
                  <th scope="col" className="px-3 py-3 text-right">व्यक्ती</th>
                  <th scope="col" className="px-3 py-3">आर.एस.व्ही.पी.</th>
                  <th scope="col" className="px-3 py-3">संहिता</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 60).map((guest) => (
                  <tr key={guest.id} className="border-t border-gold/10 transition hover:bg-ivory-deep/40">
                    <td className="px-4 py-3 font-semibold text-charcoal">{guest.name}</td>
                    <td className="px-3 py-3 text-charcoal-soft">{guest.relation ?? '—'}</td>
                    <td className="px-3 py-3 text-charcoal-soft">{SIDE_LABEL[guest.side ?? 'guest']}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-charcoal">{toDevanagariDigits(guest.guestCount)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex min-h-11 items-center rounded-full border px-2.5 py-1 text-xs font-bold ${RSVP_STYLE[guest.rsvpStatus] ?? RSVP_STYLE.pending}`}>
                        {guest.rsvpStatus === 'yes' ? 'येतील' : guest.rsvpStatus === 'no' ? 'नाही' : guest.rsvpStatus === 'maybe' ? 'कदाचित' : 'प्रतीक्षेत'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-ui text-xs font-medium text-charcoal-muted">{guest.code}</td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="font-display font-bold text-charcoal">{guests.length === 0 ? 'अजून पाहुणे नाहीत' : 'जुळणारे पाहुणे नाहीत'}</p>
                      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-charcoal-soft">
                        {guests.length === 0 ? 'वरच्या फॉर्ममध्ये पहिला पाहुणा जोडा — QR संहिता आपोआप तयार होईल.' : 'शोध शब्द बदला, बाजूची गाळणी बदला किंवा नवीन पाहुणा जोडा.'}
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2.5 text-center font-ui text-xs font-medium text-charcoal-muted">
          {toDevanagariDigits(Math.min(60, filtered.length))} / {toDevanagariDigits(filtered.length)} पाहुणे • डिजिटल पानावरून आर.एस.व्ही.पी. आपोआप अद्ययावत
        </p>
      </div>
    </section>
  );
}
