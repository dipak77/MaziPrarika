'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

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

export interface DesignVersionOption {
  id: string;
  name: string;
  version: number;
  status: string;
  updatedAt: string;
  scheme: string;
}

const ZOOMS = [75, 100, 125] as const;

function paramsFor(state: CanvasState, designSel: string) {
  const params = new URLSearchParams({
    template: state.templateId,
    scheme: state.schemeId,
    english: state.includeEnglish ? '1' : '0',
    panchang: state.includePanchang ? '1' : '0',
    qr: state.includeQr ? '1' : '0',
    qty: String(state.quantity),
    paper: state.paper,
    express: state.express ? '1' : '0',
  });
  if (state.note) params.set('note', state.note);
  if (designSel) params.set('design', designSel);
  for (const code of state.finishing) params.append('finish', code);
  return params;
}

export function QualityRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);
  const radius = 26;
  const circle = 2 * Math.PI * radius;
  const offset = circle - (circle * shown) / 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-16 shrink-0 place-items-center" role="img" aria-label={`गुणवत्ता गुण ${toDevanagariDigits(clamped)} शंभर पैकी`}>
        <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="8" className="stroke-gold/20" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-paithani ring-anim"
            strokeDasharray={circle}
            strokeDashoffset={offset}
          />
        </svg>
        <span aria-hidden className="absolute font-display text-sm font-bold text-maroon">
          {toDevanagariDigits(clamped)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-charcoal">छपाई-तयार गुण</p>
        <p aria-live="polite" className="font-ui text-xs text-charcoal-soft">
          {toDevanagariDigits(shown)}/१०० — शंभर म्हणजे प्रेस-तयार
        </p>
      </div>
    </div>
  );
}

export function ComposedCopyButtons({ plain, whatsapp }: { plain: string; whatsapp: string }) {
  const [copied, setCopied] = useState<'' | 'plain' | 'wa'>('');
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(''), 2200);
    return () => clearTimeout(timer);
  }, [copied]);
  const copyText = async (text: string, kind: 'plain' | 'wa') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        setCopied(kind);
      } catch {
        setCopied('');
      }
      document.body.removeChild(area);
    }
  };
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copyText(plain, 'plain')}
        aria-label="मुख्य आमंत्रण मजकूर प्रत करा"
        className="btn-base min-h-11 border border-maroon/30 px-4 text-xs font-bold text-maroon hover:bg-maroon/5"
      >
        {copied === 'plain' ? 'प्रत केली ✓' : 'मजकूर प्रत करा'}
      </button>
      <button
        type="button"
        onClick={() => copyText(whatsapp, 'wa')}
        aria-label="व्हॉट्सअॅप संदेश प्रत करा"
        className="btn-base min-h-11 bg-paithani px-4 text-xs font-bold text-white shadow-sm hover:brightness-110"
      >
        {copied === 'wa' ? 'प्रत केली ✓' : 'व्हॉट्सअॅप प्रत करा'}
      </button>
      <span aria-live="polite" role="status" className="sr-only">
        {copied === 'plain' ? 'मुख्य मजकूर प्रत झाला' : copied === 'wa' ? 'व्हॉट्सअॅप संदेश प्रत झाला' : ''}
      </span>
    </div>
  );
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
  designs,
  activeDesignId,
  designId,
}: {
  slug: string;
  svg: string;
  printSvg: string;
  current: CanvasState;
  templates: Array<{ id: string; name: string; tags: string[] }>;
  schemes: Array<{ id: string; label: string; surface: string; accent: string; primary: string }>;
  papers: Array<{ paper: string; label: string }>;
  finishing: Array<{ code: string; label: string }>;
  designs: DesignVersionOption[];
  activeDesignId: string;
  designId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<'proof' | 'screen'>('proof');
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [state, setState] = useState<CanvasState>(current);
  const [designSel, setDesignSel] = useState<string>(activeDesignId);
  const [noteDraft, setNoteDraft] = useState<string>(current.note);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDesignSel(activeDesignId);
  }, [activeDesignId]);

  useEffect(() => {
    if (noteDraft === state.note) return;
    const timer = setTimeout(() => {
      const merged = { ...state, note: noteDraft };
      setState(merged);
      const params = paramsFor(merged, designSel);
      startTransition(() => {
        router.replace(`/studio/${slug}/invitation?${params.toString()}`);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [noteDraft, state, designSel, slug, router]);

  useEffect(() => {
    const onFull = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFull);
    return () => document.removeEventListener('fullscreenchange', onFull);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '1') setView('proof');
      else if (event.key === '2') setView('screen');
      else if (event.key === '+' || event.key === '=') {
        const idx = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number]);
        const next = ZOOMS[Math.min(ZOOMS.length - 1, (idx < 0 ? 1 : idx) + 1)] ?? 125;
        setZoom(next);
      } else if (event.key === '-' || event.key === '_') {
        const idx = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number]);
        const next = ZOOMS[Math.max(0, (idx < 0 ? 1 : idx) - 1)] ?? 75;
        setZoom(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const push = (next: Partial<CanvasState>) => {
    const merged = { ...state, ...next };
    setState(merged);
    if (typeof next.note === 'string') setNoteDraft(next.note);
    const params = paramsFor(merged, designSel);
    startTransition(() => {
      router.replace(`/studio/${slug}/invitation?${params.toString()}`);
    });
  };

  const switchDesign = (id: string) => {
    setDesignSel(id);
    const params = paramsFor(state, id);
    startTransition(() => {
      router.replace(`/studio/${slug}/invitation?${params.toString()}`);
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await previewRef.current?.requestFullscreen();
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  const activeSvg = view === 'proof' ? printSvg : svg;

  return (
    <div className="surface-elevated overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />

      <div className="sticky top-0 z-30 border-b border-gold/15 bg-white/92 px-4 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-2xs">
            <span aria-hidden>◨</span>
            <span className="sr-only">टेम्पलेट निवडा</span>
            <select
              value={state.templateId}
              onChange={(event) => push({ templateId: event.target.value })}
              aria-label="टेम्पलेट निवडा"
              className="max-w-36 bg-transparent text-xs font-bold text-charcoal outline-none"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-2xs">
            <span aria-hidden>◍</span>
            <span className="sr-only">रंगसंगती निवडा</span>
            <select
              value={state.schemeId}
              onChange={(event) => push({ schemeId: event.target.value })}
              aria-label="रंगसंगती निवडा"
              className="max-w-32 bg-transparent text-xs font-bold text-charcoal outline-none"
            >
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex min-h-11 items-center gap-1 rounded-full bg-ivory-deep p-1 ring-1 ring-gold/25" role="group" aria-label="दृश्य निवडा">
            <button
              type="button"
              onClick={() => setView('proof')}
              aria-pressed={view === 'proof'}
              title="प्रिंट प्रूफ — १ दाबा"
              className={
                view === 'proof'
                  ? 'min-h-9 rounded-full bg-maroon px-3.5 py-1.5 text-xs font-bold text-ivory shadow-sm'
                  : 'min-h-9 rounded-full px-3.5 py-1.5 text-xs font-semibold text-charcoal-soft hover:text-maroon'
              }
            >
              प्रूफ
            </button>
            <button
              type="button"
              onClick={() => setView('screen')}
              aria-pressed={view === 'screen'}
              title="स्क्रीन प्रीव्ह्यू — २ दाबा"
              className={
                view === 'screen'
                  ? 'min-h-9 rounded-full bg-maroon px-3.5 py-1.5 text-xs font-bold text-ivory shadow-sm'
                  : 'min-h-9 rounded-full px-3.5 py-1.5 text-xs font-semibold text-charcoal-soft hover:text-maroon'
              }
            >
              स्क्रीन
            </button>
          </div>

          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-2xs">
            <span aria-hidden>⎘</span>
            <span className="sr-only">आवृत्ती निवडा</span>
            <select
              value={designSel}
              onChange={(event) => switchDesign(event.target.value)}
              aria-label="आवृत्ती निवडा"
              className="max-w-36 bg-transparent text-xs font-bold text-charcoal outline-none"
            >
              <option value="">चालू मसुदा</option>
              {designs.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} • आ. {entry.version}
                </option>
              ))}
            </select>
          </label>

          <div className="flex min-h-11 items-center gap-1 rounded-full border border-gold/25 bg-white px-1.5 py-1 shadow-2xs" role="group" aria-label="झूम निवडा">
            {ZOOMS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setZoom(level)}
                aria-pressed={zoom === level}
                aria-label={`झूम ${toDevanagariDigits(level)} टक्के`}
                title={level === 100 ? 'शंभर टक्के — + − ने बदला' : `झूम ${level}%`}
                className={
                  zoom === level
                    ? 'min-h-9 min-w-11 rounded-full bg-maroon px-2.5 py-1.5 font-ui text-xs font-bold text-ivory'
                    : 'min-h-9 min-w-11 rounded-full px-2.5 py-1.5 font-ui text-xs font-semibold text-charcoal-soft hover:text-maroon'
                }
              >
                {toDevanagariDigits(level)}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? 'पूर्णपडदा बंद करा' : 'पूर्णपडदा पूर्वावलोकन उघडा'}
            title="पूर्णपडदा पूर्वावलोकन"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold/25 bg-white px-3.5 py-2 text-xs font-bold text-charcoal shadow-2xs hover:border-maroon/30 hover:text-maroon"
          >
            <span aria-hidden>{isFullscreen ? '⤢' : '⤢'}</span>
            <span className="hidden sm:inline">{isFullscreen ? 'बंद करा' : 'पूर्णपडदा'}</span>
          </button>
        </div>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[11px] text-charcoal-muted">
          <span>
            <kbd className="rounded border border-gold/30 bg-ivory px-1 font-ui text-[11px] font-bold">१</kbd> प्रूफ
          </span>
          <span>
            <kbd className="rounded border border-gold/30 bg-ivory px-1 font-ui text-[11px] font-bold">२</kbd> स्क्रीन
          </span>
          <span>
            <kbd className="rounded border border-gold/30 bg-ivory px-1 font-ui text-[11px] font-bold">+</kbd>
            <kbd className="rounded border border-gold/30 bg-ivory px-1 font-ui text-[11px] font-bold">−</kbd> झूम
          </span>
          <span aria-live="polite">{pending ? 'जतन होत आहे…' : `आवृत्ती ${designId ? designId.slice(0, 18) : 'मसुदा'}`}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <p className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 bg-white px-3 py-1.5 font-ui text-xs font-medium text-charcoal-soft">
          <span className={`size-2 rounded-full ${pending ? 'bg-gold animate-pulse-subtle' : 'bg-paithani'}`} aria-hidden />
          <span aria-live="polite" role="status">
            {pending ? 'अद्ययावत होत आहे…' : 'प्रत्येक बदल सर्व्हरवर पुन्हा रेंडर — शून्य फरक'}
          </span>
        </p>
        <p className="font-ui text-xs text-charcoal-muted">
          झूम {toDevanagariDigits(zoom)}% • {view === 'proof' ? 'प्रिंट प्रूफ' : 'स्क्रीन प्रीव्ह्यू'}
        </p>
      </div>

      <div className="p-5">
        <div
          ref={previewRef}
          className={isFullscreen ? 'bg-ivory p-4' : ''}
        >
          <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[repeating-conic-gradient(var(--color-checker-a)_0%_25%,var(--color-checker-b)_0%_50%)] bg-[length:20px_20px] p-3 shadow-inner sm:p-4" style={{ display: 'grid', placeItems: 'center' }}>
            {pending ? (
              <div aria-hidden className="skeleton pointer-events-none absolute inset-0 opacity-70" />
            ) : null}
            <div className="max-h-[36rem] w-full overflow-auto rounded-xl bg-white/80 p-2 shadow-sm ring-1 ring-gold/10 backdrop-blur" style={{ display: 'grid', placeItems: 'center' }}>
              <div
                className="w-full max-w-md transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                <div key={view} className="animate-fade-in w-full drop-shadow-sm transition-opacity duration-300 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: activeSvg }} />
              </div>
            </div>
            {pending ? (
              <p className="shimmer-badge pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-maroon px-4 py-1.5 font-ui text-xs font-bold text-ivory shadow">
                मसुदा जतन होत आहे…
              </p>
            ) : null}
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
                  aria-label={`टेम्पलेट ${template.name} निवडा`}
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
            <label className="mt-4 block">
              <span className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">घरची टीप (पत्रिकेवर छापली जाते)</span>
              <input
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="उदा. मुहूर्तानुसार कार्यक्रम"
                aria-label="घरची टीप लिहा"
                className="mt-2 min-h-11 w-full rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
              />
            </label>
          </div>

          <div>
            <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-charcoal-muted">रंगसंगती (पारंपरिक)</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {schemes.map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => push({ schemeId: scheme.id })}
                  aria-label={`${scheme.label} रंगसंगती निवडा`}
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
                    aria-label={option.label}
                    className="size-4 rounded border-gold/40 accent-[var(--color-maroon)]"
                  />
                  <span className="text-sm font-medium text-charcoal">{option.label}</span>
                </label>
              ))}
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-gold/25 bg-white px-3.5 shadow-2xs hover:border-gold/40">
                <input
                  type="checkbox"
                  checked={state.express}
                  onChange={(event) => push({ express: event.target.checked })}
                  aria-label="एक्स्प्रेस छपाई"
                  className="size-4 rounded border-gold/40 accent-[var(--color-maroon)]"
                />
                <span className="text-sm font-medium text-charcoal">एक्स्प्रेस छपाई (३ दिवसांत)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-gold/15 pt-6 sm:grid-cols-3">
          <label className="block">
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">कागद</span>
            <select
              value={state.paper}
              onChange={(event) => push({ paper: event.target.value })}
              aria-label="कागद निवडा"
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
                aria-label={`प्रमाण ${toDevanagariDigits(state.quantity)} कार्डे`}
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
                    aria-label={`${item.label} ${active ? 'काढा' : 'जोडा'}`}
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

      <div className="h-20 lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-white/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="भ्रमण कृती">
          <button
            type="button"
            onClick={() => setView('proof')}
            aria-pressed={view === 'proof'}
            className={view === 'proof' ? 'btn-base min-h-11 bg-maroon px-2 text-xs font-bold text-ivory' : 'btn-base min-h-11 border border-gold/30 bg-white px-2 text-xs font-bold text-charcoal'}
          >
            प्रूफ
          </button>
          <button
            type="button"
            onClick={() => setView('screen')}
            aria-pressed={view === 'screen'}
            className={view === 'screen' ? 'btn-base min-h-11 bg-maroon px-2 text-xs font-bold text-ivory' : 'btn-base min-h-11 border border-gold/30 bg-white px-2 text-xs font-bold text-charcoal'}
          >
            स्क्रीन
          </button>
          <button
            type="button"
            onClick={() => {
              const idx = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number]);
              const next = ZOOMS[((idx < 0 ? 1 : idx) + 1) % ZOOMS.length] ?? 100;
              setZoom(next);
            }}
            aria-label={`झूम बदला — सध्या ${toDevanagariDigits(zoom)} टक्के`}
            className="btn-base min-h-11 border border-gold/30 bg-white px-2 text-xs font-bold text-charcoal"
          >
            {toDevanagariDigits(zoom)}%
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label="पूर्णपडदा पूर्वावलोकन"
            className="btn-base min-h-11 border border-gold/30 bg-white px-2 text-xs font-bold text-charcoal"
          >
            पूर्णपडदा
          </button>
        </div>
      </div>
    </div>
  );
}
