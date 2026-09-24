import type { PanchangResult } from '@mazi/panchang';

import { toDevanagariDigits } from '@/lib/format';

/**
 * The daily panchang, presented the way a Marathi household reads it:
 * तिथी → नक्षत्र → सूर्योदय/सूर्यास्त → राहुकाळ → चौघडिया.
 * No good/bad verdicts — only named windows with their traditional quality.
 */
export function PanchangStrip({ panchang, city }: { panchang: PanchangResult; city: string }) {
  const dayWindows = panchang.choghadiyaDay.slice(0, 8);

  return (
    <section aria-labelledby="panchang-heading" className="surface overflow-hidden">
      <div className="paithani-edge h-1.5" />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">आजचे पंचांग</p>
          <h2 id="panchang-heading" className="mt-2 font-display text-2xl font-bold text-maroon">
            {panchang.weekdayName}, {toDevanagariDigits(panchang.date.split('-')[2] ?? '')}
          </h2>
          <p className="mt-1 text-sm text-charcoal-soft">
            {city} • शक {toDevanagariDigits(panchang.shakaYear)} • विक्रम संवत {toDevanagariDigits(panchang.vikramSamvat)} • {panchang.masa}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'तिथी', value: `${panchang.tithi.paksha} ${panchang.tithi.name}` },
              { label: 'तिथी समाप्ती', value: panchang.tithi.endsAt },
              { label: 'नक्षत्र', value: `${panchang.nakshatra.name} (पाद ${toDevanagariDigits(panchang.nakshatra.pada)})` },
              { label: 'सूर्योदय', value: panchang.sunrise ?? '—' },
              { label: 'सूर्यास्त', value: panchang.sunset ?? '—' },
              { label: 'दिवस मान', value: panchang.dayLength },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-gold/25 bg-ivory-deep/60 px-3 py-2">
                <dt className="font-ui text-[0.66rem] uppercase tracking-wider text-charcoal-soft">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-charcoal">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[panchang.rahuKaal, panchang.abhijitMuhurat, panchang.godhuliMuhurat].map((window) => (
              <div key={window.label} className="rounded-xl border border-maroon/20 bg-maroon/5 px-3 py-2">
                <p className="font-ui text-[0.66rem] uppercase tracking-wider text-maroon">{window.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-charcoal">
                  {window.start} – {window.end}
                </p>
                {window.note ? <p className="mt-1 text-xs text-charcoal-soft">{window.note}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">दिवसाच्या चौघडिया</p>
          <ul className="mt-3 divide-y divide-gold/20 overflow-hidden rounded-xl border border-gold/25">
            {dayWindows.map((window) => (
              <li key={`${window.label}-${window.start}`} className="flex items-center justify-between gap-3 bg-ivory px-3 py-2">
                <span className="text-sm font-semibold text-charcoal">{window.label}</span>
                <span className="font-ui text-xs text-charcoal-soft">
                  {window.start} – {window.end}
                </span>
                <span
                  className={
                    window.quality === 'शुभ'
                      ? 'rounded-full bg-paithani/12 px-2 py-0.5 font-ui text-[0.68rem] font-semibold text-paithani'
                      : window.quality === 'अशुभ'
                        ? 'rounded-full bg-maroon/10 px-2 py-0.5 font-ui text-[0.68rem] font-semibold text-maroon'
                        : 'rounded-full bg-gold/15 px-2 py-0.5 font-ui text-[0.68rem] font-semibold text-charcoal-soft'
                  }
                >
                  {window.quality}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charcoal-soft">
            गणना पद्धत: {panchang.method.ephemeris} • अयनांश: लाहिरी {toDevanagariDigits(panchang.ayanamsa.toFixed(3))}°
          </p>
        </div>
      </div>
    </section>
  );
}
