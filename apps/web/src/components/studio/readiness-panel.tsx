import { toDevanagariDigits } from '@mazi/marathi';

import type { ReadinessReport } from '@mazi/commerce';

const SEVERITY_STYLE: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-maroon/25 bg-maroon-light text-maroon',
  medium: 'border-gold/30 bg-gold/10 text-charcoal',
  low: 'border-paithani/25 bg-paithani-soft text-charcoal',
};

function barTone(score: number): string {
  if (score >= 85) return 'bg-paithani';
  if (score >= 65) return 'bg-gold-bright';
  return 'bg-maroon';
}

function badgeTone(score: number): string {
  if (score >= 85) return 'border-paithani/25 bg-paithani-soft text-paithani';
  if (score >= 65) return 'border-gold/30 bg-gold/10 text-gold-ink';
  return 'border-maroon/25 bg-maroon-light text-maroon';
}

export function ReadinessPanel({ report, daysToEvent }: { report: ReadinessReport; daysToEvent: number }) {
  const circumference = 2 * Math.PI * 42;
  const dash = (Math.max(0, Math.min(100, report.score)) / 100) * circumference;
  const ringColor = report.score >= 85 ? 'var(--color-paithani)' : report.score >= 65 ? 'var(--color-gold-bright)' : 'var(--color-maroon)';
  const nextBest = [...report.dimensions].filter((dimension) => dimension.score < 85).sort((a, b) => a.score - b.score)[0];

  return (
    <section aria-labelledby="readiness-heading" className="surface-elevated animate-fade-up overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 id="readiness-heading" className="tracking-tight text-charcoal">
            तयारी स्थिती
          </h2>
          <span className={`inline-flex min-h-11 items-center rounded-full border px-3.5 py-1.5 font-ui text-xs font-bold ${badgeTone(report.score)}`}>
            {report.grade}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 100 100" className="size-28" role="img" aria-label={`तयारी ${toDevanagariDigits(report.score)} पैकी १०० — ${report.grade}`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-ivory-deep)" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                transform="rotate(-90 50 50)"
                className="drop-shadow-sm"
                style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1), stroke 0.5s ease' }}
              />
              <text x="50" y="52" textAnchor="middle" className="font-display" fontSize="22" fontWeight="700" fill="var(--color-charcoal)">
                {toDevanagariDigits(report.score)}
              </text>
              <text x="50" y="66" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-charcoal-soft)">
                पैकी १००
              </text>
            </svg>
            <span aria-hidden className="absolute inset-0 -z-10 rounded-full bg-gold/10 blur-xl" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold tracking-tight text-maroon">{report.grade}</p>
            <p className="mt-1.5 inline-flex min-h-11 flex-wrap items-center gap-1.5 rounded-full bg-ivory-deep px-3.5 py-1.5 font-ui text-xs font-semibold text-charcoal-soft ring-1 ring-gold/15">
              {toDevanagariDigits(daysToEvent)} दिवस शिल्लक • {toDevanagariDigits(report.dimensions.length)} निकष
            </p>
          </div>
        </div>

        {nextBest ? (
          <div className="mt-5 rounded-2xl border border-gold/30 bg-gold-shimmer px-4 py-3.5 shadow-2xs">
            <p className="font-ui text-xs font-bold uppercase tracking-widest text-gold-ink">पुढील सर्वोत्तम पायरी</p>
            <p className="mt-1 text-sm font-bold leading-snug text-charcoal">{nextBest.label} — {toDevanagariDigits(nextBest.score)}/१००</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-soft">{nextBest.note}</p>
          </div>
        ) : null}

        <ul className="mt-5 space-y-3">
          {report.dimensions.map((dimension) => (
            <li key={dimension.key} className="rounded-2xl border border-gold/15 bg-white px-3.5 py-3.5 shadow-2xs transition hover:border-gold/30">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <span aria-hidden className={`grid size-2.5 rounded-full ${dimension.score >= 85 ? 'bg-paithani' : dimension.score >= 65 ? 'bg-gold-bright' : 'bg-maroon'}`} />
                  {dimension.label}
                </span>
                <span className={`inline-flex min-h-11 items-center rounded-full border px-2.5 py-1 font-ui text-xs font-bold tabular-nums ${badgeTone(dimension.score)}`}>
                  {toDevanagariDigits(dimension.score)} • {toDevanagariDigits(dimension.weight)}
                </span>
              </div>
              <div
                className="mt-2.5 h-2 overflow-hidden rounded-full bg-ivory-deep ring-1 ring-gold/10"
                role="progressbar"
                aria-valuenow={dimension.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${dimension.label} प्रगती`}
              >
                <div className={`h-full rounded-full transition-all duration-700 ${barTone(dimension.score)}`} style={{ width: `${Math.max(0, Math.min(100, dimension.score))}%` }} />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-soft">{dimension.note}</p>
            </li>
          ))}
        </ul>

        {report.risks.length === 0 && report.score < 85 ? (
          <div className="mt-5 space-y-2">
            {report.dimensions
              .filter((dimension) => dimension.score < 85)
              .sort((a, b) => a.score - b.score)
              .slice(0, 3)
              .map((dimension) => (
                <div key={dimension.key} className="rounded-xl border border-gold/25 bg-amber-50/70 px-3.5 py-2.5 text-xs shadow-2xs">
                  <p className="font-bold text-charcoal">{dimension.label} अजून पूर्ण नाही ({toDevanagariDigits(dimension.score)}/१००)</p>
                  <p className="mt-1 leading-relaxed text-charcoal-soft">{dimension.note}</p>
                </div>
              ))}
          </div>
        ) : null}

        {report.risks.length ? (
          <div className="mt-5 space-y-2" role="list" aria-label="जोखमी व पुढील पायऱ्या">
            {report.risks.slice(0, 4).map((risk) => (
              <div key={risk.message} className={`rounded-xl border px-3.5 py-2.5 text-xs shadow-2xs ${SEVERITY_STYLE[risk.severity]}`}>
                <p className="font-bold leading-tight">{risk.message}</p>
                <p className="mt-1 leading-relaxed opacity-90">पुढील पायरी: {risk.action}</p>
              </div>
            ))}
          </div>
        ) : report.score >= 85 ? (
          <p role="status" className="mt-5 rounded-xl border border-paithani/25 bg-paithani-soft px-3.5 py-3 text-center text-xs font-bold text-paithani">✓ सर्व निकष पूर्ण — कार्यक्रम तयार आहे.</p>
        ) : null}
      </div>
    </section>
  );
}
