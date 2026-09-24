import { toDevanagariDigits } from '@mazi/marathi';

import type { ReadinessReport } from '@mazi/commerce';

const SEVERITY_STYLE: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-maroon/40 bg-maroon/8 text-maroon',
  medium: 'border-gold/50 bg-gold/10 text-charcoal',
  low: 'border-paithani/40 bg-paithani/8 text-charcoal',
};

/**
 * Readiness is a *risk* instrument, not a score to game: every dimension shows
 * the weight behind it, and every risk carries the concrete next action.
 */
export function ReadinessPanel({ report, daysToEvent }: { report: ReadinessReport; daysToEvent: number }) {
  const circumference = 2 * Math.PI * 42;
  const dash = (report.score / 100) * circumference;

  return (
    <section className="surface p-5" aria-labelledby="readiness-heading">
      <h2 id="readiness-heading" className="font-display text-xl font-bold text-charcoal">
        तयारी स्थिती
      </h2>

      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="size-28 shrink-0" role="img" aria-label={`तयारी ${report.score} पैकी १००`}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-ivory-deep)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={report.score >= 85 ? 'var(--color-paithani)' : report.score >= 65 ? 'var(--color-gold)' : 'var(--color-maroon)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="52" textAnchor="middle" className="font-display" fontSize="22" fontWeight="700" fill="var(--color-charcoal)">
            {toDevanagariDigits(report.score)}
          </text>
          <text x="50" y="66" textAnchor="middle" fontSize="9" fill="var(--color-charcoal-soft)">
            पैकी १००
          </text>
        </svg>
        <div>
          <p className="font-display text-2xl font-bold text-maroon">{report.grade}</p>
          <p className="mt-1 text-sm text-charcoal-soft">
            कार्यक्रमाला {toDevanagariDigits(daysToEvent)} दिवस • {toDevanagariDigits(report.dimensions.length)} निकष तपासले
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {report.dimensions.map((dimension) => (
          <li key={dimension.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-charcoal">{dimension.label}</span>
              <span className="font-ui text-xs text-charcoal-soft">
                {toDevanagariDigits(dimension.score)} • वजन {toDevanagariDigits(dimension.weight)}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-ivory-deep">
              <div
                className="h-full rounded-full bg-paithani"
                style={{ width: `${dimension.score}%` }}
                role="presentation"
              />
            </div>
            <p className="mt-1 text-xs text-charcoal-soft">{dimension.note}</p>
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
              <div key={dimension.key} className="rounded-xl border border-gold/45 bg-gold/10 px-3 py-2 text-xs text-charcoal">
                <p className="font-semibold">{dimension.label} अजून पूर्ण नाही ({toDevanagariDigits(dimension.score)}/१००)</p>
                <p className="mt-0.5 opacity-90">{dimension.note}</p>
              </div>
            ))}
        </div>
      ) : null}

      {report.risks.length ? (
        <div className="mt-5 space-y-2">
          {report.risks.slice(0, 4).map((risk) => (
            <div key={risk.message} className={`rounded-xl border px-3 py-2 text-xs ${SEVERITY_STYLE[risk.severity]}`}>
              <p className="font-semibold">{risk.message}</p>
              <p className="mt-0.5 opacity-90">पुढील पायरी: {risk.action}</p>
            </div>
          ))}
        </div>
      ) : report.score >= 85 ? (
        <p className="mt-5 rounded-xl border border-paithani/40 bg-paithani/8 px-3 py-2 text-xs text-charcoal">
          सर्व निकष पूर्ण — कार्यक्रम तयार आहे.
        </p>
      ) : null}
    </section>
  );
}
