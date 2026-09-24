import { toDevanagariDigits } from '@mazi/marathi';

import type { ReadinessReport } from '@mazi/commerce';

const SEVERITY_STYLE: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-maroon/20 bg-maroon-light text-maroon',
  medium: 'border-gold/30 bg-gold/10 text-charcoal',
  low: 'border-paithani/20 bg-paithani-soft text-charcoal',
};

export function ReadinessPanel({ report, daysToEvent }: { report: ReadinessReport; daysToEvent: number }) {
  const circumference = 2 * Math.PI * 42;
  const dash = (report.score / 100) * circumference;

  return (
    <section className="surface-elevated overflow-hidden p-0" aria-labelledby="readiness-heading">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="p-5 sm:p-6">
        <h2 id="readiness-heading" className="font-display text-xl font-bold tracking-tight text-charcoal">
          तयारी स्थिती
        </h2>

        <div className="mt-5 flex items-center gap-5">
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 100 100" className="size-28" role="img" aria-label={`तयारी ${report.score} पैकी १००`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-ivory-deep)" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={report.score >= 85 ? 'var(--color-paithani)' : report.score >= 65 ? 'var(--color-gold-bright)' : 'var(--color-maroon)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                transform="rotate(-90 50 50)"
                className="drop-shadow-sm"
              />
              <text x="50" y="52" textAnchor="middle" className="font-display" fontSize="22" fontWeight="700" fill="var(--color-charcoal)">
                {toDevanagariDigits(report.score)}
              </text>
              <text x="50" y="66" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-charcoal-soft)">
                पैकी १००
              </text>
            </svg>
            <span aria-hidden className="absolute inset-0 rounded-full bg-gold/5 blur-xl" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-maroon">{report.grade}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-ivory-deep px-3 py-1 font-ui text-xs font-medium text-charcoal-soft ring-1 ring-gold/15">
              {toDevanagariDigits(daysToEvent)} दिवस शिल्लक • {toDevanagariDigits(report.dimensions.length)} निकष
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {report.dimensions.map((dimension) => (
            <li key={dimension.key} className="rounded-xl border border-gold/12 bg-white px-3.5 py-3 shadow-2xs">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-bold text-charcoal">{dimension.label}</span>
                <span className="rounded-full bg-ivory-deep px-2 py-0.5 font-ui text-xs font-semibold text-charcoal-soft">
                  {toDevanagariDigits(dimension.score)} • वजन {toDevanagariDigits(dimension.weight)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory-deep p-0.5">
                <div className="h-full rounded-full bg-linear-to-r from-paithani to-paithani-light transition-all" style={{ width: `${dimension.score}%` }} role="presentation" />
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
          <div className="mt-5 space-y-2">
            {report.risks.slice(0, 4).map((risk) => (
              <div key={risk.message} className={`rounded-xl border px-3.5 py-2.5 text-xs shadow-2xs ${SEVERITY_STYLE[risk.severity]}`}>
                <p className="font-bold leading-tight">{risk.message}</p>
                <p className="mt-1 leading-relaxed opacity-90">पुढील पायरी: {risk.action}</p>
              </div>
            ))}
          </div>
        ) : report.score >= 85 ? (
          <p className="mt-5 rounded-xl border border-paithani/20 bg-paithani-soft px-3.5 py-2.5 text-center text-xs font-bold text-paithani">✓ सर्व निकष पूर्ण — कार्यक्रम तयार आहे.</p>
        ) : null}
      </div>
    </section>
  );
}
