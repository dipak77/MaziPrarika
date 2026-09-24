'use client';

import { useState } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

/**
 * Month grid.
 *
 * Rendered on the client because a family taps through a month looking for a
 * date that suits everyone — but every value in it was computed on the server by
 * the deterministic engine. Switching the highlighted day is a local state change
 * (no navigation, no spinner), which is what makes the calendar feel instant on a
 * phone.
 */
export interface MonthDay {
  date: string;
  weekday: string;
  tithi: string;
  nakshatra: string;
  isPurnima: boolean;
  isAmavasya: boolean;
  muhuratScore: number | null;
}

export function PanchangMonth({
  city,
  monthLabel,
  days,
}: {
  city: string;
  monthLabel: string;
  days: MonthDay[];
}) {
  const [selected, setSelected] = useState(days[0]?.date ?? '');
  const active = days.find((day) => day.date === selected) ?? days[0];

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">
          {monthLabel} — {city}
        </h2>
        <p className="font-ui text-xs text-charcoal-soft">
          तारखेवर टॅप करा • गडद छटा = जास्त अनुकूलता
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const score = day.muhuratScore ?? 0;
          const tint =
            score >= 85 ? 'bg-paithani/25' : score >= 70 ? 'bg-paithani/15' : score >= 50 ? 'bg-gold/15' : 'bg-ivory-deep/60';
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelected(day.date)}
              className={`rounded-lg border px-1 py-2 text-center text-xs transition ${
                day.date === selected ? 'border-maroon ring-1 ring-maroon' : 'border-gold/25'
              } ${tint}`}
              aria-pressed={day.date === selected}
            >
              <span className="block font-semibold text-charcoal">{toDevanagariDigits(day.date.slice(-2))}</span>
              <span className="block font-ui text-[10px] text-charcoal-soft">{day.weekday.slice(0, 3)}</span>
              {day.muhuratScore !== null ? (
                <span className="block font-ui text-[10px] text-charcoal-soft">{toDevanagariDigits(day.muhuratScore)}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="mt-4 rounded-xl border border-gold/25 bg-ivory px-4 py-3">
          <p className="font-display text-lg font-bold text-charcoal">
            {active.weekday}, {toDevanagariDigits(active.date)}
          </p>
          <p className="mt-1 text-sm text-charcoal-soft">
            तिथी {active.tithi} • नक्षत्र {active.nakshatra}
            {active.isPurnima ? ' • पौर्णिमा' : ''}
            {active.isAmavasya ? ' • अमावास्या' : ''}
          </p>
          {active.muhuratScore !== null ? (
            <p className="mt-1 text-sm text-charcoal-soft">
              निवडलेल्या कार्यक्रमासाठी अनुकूलता: {toDevanagariDigits(active.muhuratScore)}/१००
            </p>
          ) : (
            <p className="mt-1 text-xs text-charcoal-soft">या तारखेसाठी या कार्यक्रमाचे गुणांकन उपलब्ध नाही.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
