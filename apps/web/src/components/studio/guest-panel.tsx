'use client';

import { useState } from 'react';

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
  yes: 'border-paithani/50 bg-paithani/10 text-paithani',
  no: 'border-maroon/40 bg-maroon/8 text-maroon',
  maybe: 'border-gold/60 bg-gold/12 text-charcoal',
  pending: 'border-gold/30 bg-ivory-deep/60 text-charcoal-soft',
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

  const filtered = guests.filter((guest) => {
    const matchesQuery = query
      ? `${guest.name} ${guest.relation ?? ''} ${guest.phone ?? ''} ${guest.code}`.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesSide = side === 'all' ? true : guest.side === side;
    return matchesQuery && matchesSide;
  });

  const responseRate = rsvp.invited ? Math.round((rsvp.responded / rsvp.invited) * 100) : 0;

  return (
    <section className="surface mt-6 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">पाहुणे व आर.एस.व्ही.पी.</h2>
        <p className="font-ui text-xs text-charcoal-soft">
          आमंत्रित {toDevanagariDigits(rsvp.invited)} • उत्तर {toDevanagariDigits(rsvp.responded)} ({toDevanagariDigits(responseRate)}%) • अपेक्षित व्यक्ती{' '}
          {toDevanagariDigits(rsvp.expectedHeads)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'येतील', value: rsvp.yes, tone: 'paithani' },
          { label: 'येणार नाहीत', value: rsvp.no, tone: 'maroon' },
          { label: 'कदाचित', value: rsvp.maybe, tone: 'gold' },
          { label: 'प्रतीक्षेत', value: rsvp.invited - rsvp.responded, tone: 'soft' },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl border border-gold/25 bg-ivory-deep/40 p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{tile.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-charcoal">{toDevanagariDigits(tile.value)}</p>
          </div>
        ))}
      </div>

      <form
        action={addGuestAction}
        className="mt-5 grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.9fr_auto]"
      >
        <input type="hidden" name="slug" value={slug} />
        <input
          name="name"
          required
          maxLength={120}
          placeholder="पाहुण्याचे नाव"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="phone"
          inputMode="tel"
          pattern="[0-9+ -]{8,15}"
          placeholder="मोबाइल (ऐच्छिक)"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="relation"
          placeholder="नाते — उदा. मामा"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="guestCount"
          type="number"
          min={1}
          max={50}
          defaultValue={1}
          aria-label="किती व्यक्ती"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <select
          name="side"
          defaultValue="both"
          aria-label="कडे"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        >
          <option value="groom">वरकडील</option>
          <option value="bride">वधूकडील</option>
          <option value="both">दोन्हीकडील</option>
          <option value="host">यजमान</option>
        </select>
        <button type="submit" className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-ivory">
          पाहुणा जोडा
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="शोधा — नाव, नाते किंवा संहिता"
          className="min-w-56 flex-1 rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        {(['all', 'groom', 'bride', 'both'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSide(option)}
            className={
              side === option
                ? 'rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-ivory'
                : 'rounded-full border border-gold/40 bg-ivory px-3 py-1.5 text-xs text-charcoal-soft'
            }
          >
            {option === 'all' ? 'सर्व' : SIDE_LABEL[option]}
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-gold/20">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ivory-deep/90 backdrop-blur">
            <tr className="text-left font-ui text-xs uppercase tracking-wider text-charcoal-soft">
              <th className="px-3 py-2">नाव</th>
              <th className="px-3 py-2">नाते</th>
              <th className="px-3 py-2">कडे</th>
              <th className="px-3 py-2 text-right">व्यक्ती</th>
              <th className="px-3 py-2">आर.एस.व्ही.पी.</th>
              <th className="px-3 py-2">संहिता</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((guest) => (
              <tr key={guest.id} className="border-t border-gold/15">
                <td className="px-3 py-2 font-semibold text-charcoal">{guest.name}</td>
                <td className="px-3 py-2 text-charcoal-soft">{guest.relation ?? '—'}</td>
                <td className="px-3 py-2 text-charcoal-soft">{SIDE_LABEL[guest.side ?? 'guest']}</td>
                <td className="px-3 py-2 text-right text-charcoal">{toDevanagariDigits(guest.guestCount)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${RSVP_STYLE[guest.rsvpStatus] ?? RSVP_STYLE.pending}`}>
                    {guest.rsvpStatus === 'yes' ? 'येतील' : guest.rsvpStatus === 'no' ? 'नाही' : guest.rsvpStatus === 'maybe' ? 'कदाचित' : 'प्रतीक्षेत'}
                  </span>
                </td>
                <td className="px-3 py-2 font-ui text-xs text-charcoal-soft">{guest.code}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-charcoal-soft">
                  जुळणारे पाहुणे नाहीत.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-charcoal-soft">
        {toDevanagariDigits(Math.min(60, filtered.length))} / {toDevanagariDigits(filtered.length)} पाहुणे दाखवत आहोत — डिजिटल पानावरून
        आर.एस.व्ही.पी. आपोआप अद्ययावत होते.
      </p>
    </section>
  );
}
