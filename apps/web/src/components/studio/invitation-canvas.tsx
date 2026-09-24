'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

/**
 * The canvas.
 *
 * The SVG is rendered *on the server* from the Design JSON and streamed in, so
 * what the customer sees is byte-for-byte what the printer's proof contains.
 * The client only chooses options — it never owns the artwork.
 */

export interface CanvasState {
  templateId: string;
  schemeId: string;
  includeEnglish: boolean;
  includePanchang: boolean;
  includeQr: boolean;
  note: string;
  quantity: number;
  paper: string;
  express: boolean;
  finishing: string[];
}

export function InvitationCanvas({
  slug,
  svg,
  printSvg,
  current,
  templates,
  schemes,
  papers,
  finishing,
}: {
  slug: string;
  svg: string;
  printSvg: string;
  current: CanvasState;
  templates: Array<{ id: string; name: string; tags: string[] }>;
  schemes: Array<{ id: string; label: string; surface: string; accent: string; primary: string }>;
  papers: Array<{ paper: string; label: string }>;
  finishing: Array<{ code: string; label: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<'proof' | 'screen'>('proof');
  const [state, setState] = useState<CanvasState>(current);

  const push = (next: Partial<CanvasState>) => {
    const merged = { ...state, ...next };
    setState(merged);
    const params = new URLSearchParams({
      template: merged.templateId,
      scheme: merged.schemeId,
      english: merged.includeEnglish ? '1' : '0',
      panchang: merged.includePanchang ? '1' : '0',
      qr: merged.includeQr ? '1' : '0',
      qty: String(merged.quantity),
      paper: merged.paper,
      express: merged.express ? '1' : '0',
      ...(merged.note ? { note: merged.note } : {}),
    });
    for (const code of merged.finishing) params.append('finish', code);
    startTransition(() => {
      router.replace(`/studio/${slug}/invitation?${params.toString()}`);
    });
  };

  return (
    <div className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('proof')}
            className={
              view === 'proof'
                ? 'rounded-full bg-maroon px-4 py-1.5 text-xs font-semibold text-ivory'
                : 'rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold text-charcoal-soft'
            }
          >
            प्रिंट प्रूफ (bleed + crop marks)
          </button>
          <button
            type="button"
            onClick={() => setView('screen')}
            className={
              view === 'screen'
                ? 'rounded-full bg-maroon px-4 py-1.5 text-xs font-semibold text-ivory'
                : 'rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold text-charcoal-soft'
            }
          >
            स्क्रीन प्रीव्ह्यू
          </button>
        </div>
        <p className="font-ui text-xs text-charcoal-soft">
          {pending ? 'अद्ययावत होत आहे…' : 'प्रत्येक बदल सर्व्हरवर पुन्हा रेंडर होतो — शून्य फरक'}
        </p>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-xl border border-gold/30 bg-[repeating-conic-gradient(#f0e7d8_0%_25%,#fbf7f0_0%_50%)] bg-[length:18px_18px] p-4"
        style={{ display: 'grid', placeItems: 'center' }}
      >
        <div
          className="max-h-[34rem] w-full overflow-auto"
          style={{ display: 'grid', placeItems: 'center' }}
        >
          {/* Server-rendered SVG. Text stays text: selectable, searchable, printable. */}
          <div className="w-full max-w-md [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: view === 'proof' ? printSvg : svg }} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">टेम्पलेट</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => push({ templateId: template.id })}
                className={
                  state.templateId === template.id
                    ? 'rounded-xl border-2 border-maroon bg-ivory px-3 py-2 text-left'
                    : 'rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-left hover:border-maroon/60'
                }
              >
                <span className="block text-sm font-semibold text-charcoal">{template.name}</span>
                <span className="mt-0.5 block text-[11px] text-charcoal-soft">{template.tags.slice(0, 2).join(' • ')}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">रंगसंगती (पारंपरिक)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {schemes.map((scheme) => (
              <button
                key={scheme.id}
                type="button"
                onClick={() => push({ schemeId: scheme.id })}
                aria-label={scheme.label}
                className={
                  state.schemeId === scheme.id
                    ? 'flex items-center gap-2 rounded-full border-2 border-maroon bg-ivory px-3 py-1.5'
                    : 'flex items-center gap-2 rounded-full border border-gold/40 bg-ivory px-3 py-1.5 hover:border-maroon/60'
                }
              >
                <span aria-hidden className="flex">
                  <span className="size-4 rounded-full border border-black/10" style={{ background: scheme.surface }} />
                  <span className="-ml-1.5 size-4 rounded-full border border-black/10" style={{ background: scheme.accent }} />
                  <span className="-ml-1.5 size-4 rounded-full border border-black/10" style={{ background: scheme.primary }} />
                </span>
                <span className="text-xs font-semibold text-charcoal">{scheme.label}</span>
              </button>
            ))}
          </div>

          <h3 className="mt-5 font-ui text-xs uppercase tracking-wider text-charcoal-soft">पर्याय</h3>
          <div className="mt-2 space-y-2 text-sm">
            {(
              [
                { key: 'includePanchang' as const, label: 'पंचांग ओळी (तिथी, नक्षत्र, राहुकाळ)' },
                { key: 'includeQr' as const, label: 'डिजिटल पान QR (नकाशा + आर.एस.व्ही.पी.)' },
                { key: 'includeEnglish' as const, label: 'इंग्रजी ओळ (मिश्र पाहुण्यांसाठी)' },
              ]
            ).map((option) => (
              <label key={option.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state[option.key]}
                  onChange={(event) => push({ [option.key]: event.target.checked } as Partial<CanvasState>)}
                  className="size-4 accent-[var(--color-maroon)]"
                />
                <span className="text-charcoal-soft">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-gold/25 pt-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">कागद</span>
          <select
            value={state.paper}
            onChange={(event) => push({ paper: event.target.value })}
            className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
          >
            {papers.map((paper) => (
              <option key={paper.paper} value={paper.paper}>
                {paper.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
            प्रमाण — {toDevanagariDigits(state.quantity)} कार्डे
          </span>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={state.quantity}
            onChange={(event) => push({ quantity: Number(event.target.value) })}
            className="mt-3 w-full accent-[var(--color-maroon)]"
          />
        </label>
        <div className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">फिनिशिंग</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {finishing.map((item) => {
              const active = state.finishing.includes(item.code);
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() =>
                    push({
                      finishing: active
                        ? state.finishing.filter((code) => code !== item.code)
                        : [...state.finishing, item.code],
                    })
                  }
                  className={
                    active
                      ? 'rounded-full bg-paithani px-3 py-1 text-xs font-semibold text-ivory'
                      : 'rounded-full border border-gold/40 px-3 py-1 text-xs text-charcoal-soft'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
