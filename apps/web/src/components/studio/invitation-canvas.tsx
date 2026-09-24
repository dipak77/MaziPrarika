'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

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
    <div className="surface-elevated overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <div className="flex items-center gap-2 rounded-full bg-ivory-deep p-1 ring-1 ring-gold/25">
          <button
            type="button"
            onClick={() => setView('proof')}
            aria-pressed={view === 'proof'}
            className={
              view === 'proof'
                ? 'min-h-11 rounded-full bg-maroon px-4 py-2 text-xs font-bold text-ivory shadow-sm'
                : 'min-h-11 rounded-full px-4 py-2 text-xs font-semibold text-charcoal-soft hover:text-maroon'
            }
          >
            प्रिंट प्रूफ (bleed + crop)
          </button>
          <button
            type="button"
            onClick={() => setView('screen')}
            aria-pressed={view === 'screen'}
            className={
              view === 'screen'
                ? 'min-h-11 rounded-full bg-maroon px-4 py-2 text-xs font-bold text-ivory shadow-sm'
                : 'min-h-11 rounded-full px-4 py-2 text-xs font-semibold text-charcoal-soft hover:text-maroon'
            }
          >
            स्क्रीन प्रीव्ह्यू
          </button>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white px-3 py-1.5 font-ui text-xs font-medium text-charcoal-soft">
          <span className={`size-2 rounded-full ${pending ? 'bg-gold animate-pulse-subtle' : 'bg-paithani'}`} aria-hidden />
          {pending ? 'अद्ययावत होत आहे…' : 'प्रत्येक बदल सर्व्हरवर पुन्हा रेंडर — शून्य फरक'}
        </p>
      </div>

      <div className="p-5">
        <div
          className="overflow-hidden rounded-2xl border border-gold/20 bg-[repeating-conic-gradient(var(--color-checker-a)_0%_25%,var(--color-checker-b)_0%_50%)] bg-[length:20px_20px] p-3 sm:p-4 shadow-inner"
          style={{ display: 'grid', placeItems: 'center' }}
        >
          <div className="max-h-[36rem] w-full overflow-auto rounded-xl bg-white/80 p-2 shadow-sm ring-1 ring-gold/10 backdrop-blur" style={{ display: 'grid', placeItems: 'center' }}>
            <div className="w-full max-w-md [&_svg]:h-auto [&_svg]:w-full drop-shadow-sm" dangerouslySetInnerHTML={{ __html: view === 'proof' ? printSvg : svg }} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-charcoal-muted">टेम्पलेट</h3>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => push({ templateId: template.id })}
                  aria-pressed={state.templateId === template.id}
                  className={
                    state.templateId === template.id
                      ? 'min-h-11 rounded-2xl border-2 border-maroon bg-white px-3.5 py-3 text-left shadow-sm ring-1 ring-maroon/10'
                      : 'min-h-11 rounded-2xl border border-gold/25 bg-white px-3.5 py-3 text-left shadow-2xs hover:border-maroon/30 hover:shadow-sm'
                  }
                >
                  <span className="block text-sm font-bold leading-tight text-charcoal">{template.name}</span>
                  <span className="mt-1 block text-xs text-charcoal-soft">{template.tags.slice(0, 2).join(' • ')}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-charcoal-muted">रंगसंगती (पारंपरिक)</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {schemes.map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => push({ schemeId: scheme.id })}
                  aria-label={scheme.label}
                  aria-pressed={state.schemeId === scheme.id}
                  className={
                    state.schemeId === scheme.id
                      ? 'flex min-h-11 items-center gap-2 rounded-full border-2 border-maroon bg-white px-3.5 py-2 shadow-sm'
                      : 'flex min-h-11 items-center gap-2 rounded-full border border-gold/30 bg-white px-3.5 py-2 shadow-2xs hover:border-maroon/30'
                  }
                >
                  <span aria-hidden className="flex">
                    <span className="size-4 rounded-full border border-black/10" style={{ background: scheme.surface }} />
                    <span className="-ml-1.5 size-4 rounded-full border border-black/10" style={{ background: scheme.accent }} />
                    <span className="-ml-1.5 size-4 rounded-full border border-black/10" style={{ background: scheme.primary }} />
                  </span>
                  <span className="text-xs font-bold text-charcoal">{scheme.label}</span>
                </button>
              ))}
            </div>

            <h3 className="mt-6 font-ui text-xs font-bold uppercase tracking-widest text-charcoal-muted">पर्याय</h3>
            <div className="mt-3 space-y-2">
              {(
                [
                  { key: 'includePanchang' as const, label: 'पंचांग ओळी (तिथी, नक्षत्र, राहुकाळ)' },
                  { key: 'includeQr' as const, label: 'डिजिटल पान QR (नकाशा + आर.एस.व्ही.पी.)' },
                  { key: 'includeEnglish' as const, label: 'इंग्रजी ओळ (मिश्र पाहुण्यांसाठी)' },
                ]
              ).map((option) => (
                <label
                  key={option.key}
                  className={
                    state[option.key]
                      ? 'flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-maroon/30 bg-maroon-light px-3.5 shadow-2xs'
                      : 'flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-gold/25 bg-white px-3.5 shadow-2xs hover:border-gold/40'
                  }
                >
                  <input
                    type="checkbox"
                    checked={state[option.key]}
                    onChange={(event) => push({ [option.key]: event.target.checked } as Partial<CanvasState>)}
                    className="size-4 rounded border-gold/40 accent-[var(--color-maroon)]"
                  />
                  <span className="text-sm font-medium text-charcoal">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-gold/15 pt-6 sm:grid-cols-3">
          <label className="block">
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">कागद</span>
            <select
              value={state.paper}
              onChange={(event) => push({ paper: event.target.value })}
              className="mt-2 min-h-11 w-full rounded-xl border border-gold/30 bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-2xs outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
            >
              {papers.map((paper) => (
                <option key={paper.paper} value={paper.paper}>
                  {paper.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">
              प्रमाण — {toDevanagariDigits(state.quantity)} कार्डे
            </span>
            <div className="mt-3 rounded-full bg-ivory-deep p-1.5">
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={state.quantity}
                onChange={(event) => push({ quantity: Number(event.target.value) })}
                className="w-full accent-[var(--color-maroon)]"
              />
            </div>
            <span className="mt-1 block text-center font-ui text-xs font-medium text-charcoal-muted">५० — २०००</span>
          </label>
          <div>
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">फिनिशिंग</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {finishing.map((item) => {
                const active = state.finishing.includes(item.code);
                return (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      push({
                        finishing: active
                          ? state.finishing.filter((code) => code !== item.code)
                          : [...state.finishing, item.code],
                      })
                    }
                    className={
                      active
                        ? 'min-h-11 rounded-full bg-paithani px-4 py-2 text-xs font-bold text-white shadow-sm ring-1 ring-paithani/20'
                        : 'min-h-11 rounded-full border border-gold/30 bg-white px-4 py-2 text-xs font-semibold text-charcoal-soft shadow-2xs hover:border-gold/50'
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
    </div>
  );
}
