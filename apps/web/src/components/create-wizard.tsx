'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

interface AssistantResponse {
  answer: string;
  summary: string;
  clarifications: string[];
  plan: Array<{ tool: string; rationale: string; requiresConfirmation: boolean }>;
  results: Array<{ tool: string; ok: boolean; error?: string; requiresConfirmation?: boolean }>;
  pendingConfirmation: string[];
  vendors: Array<{ id: string; name: string; category: string; startingPricePaise: number; rating: number }>;
  muhurats: Array<{ date: string; weekday: string; score: number; band: string }>;
  budget: Array<{ category: string; label: string; estimatedPaise: number }>;
  event: { slug: string; title: string; id: string } | null;
  provider: { id: string; model: string; fallback: boolean; latencyMs: number };
  error?: string;
}

const TOOL_LABELS: Record<string, string> = {
  CreateEvent: 'कार्यक्रम वर्कस्पेस तयार करणे',
  UpdateEvent: 'कार्यक्रम अद्ययावत करणे',
  SearchVendors: 'विक्रेते शोधणे',
  GetAvailability: 'उपलब्धता तपासणे',
  GetPanchang: 'पंचांग काढणे',
  FindMuhurat: 'मुहूर्त अनुकूलता शोधणे',
  CalculateKundali: 'गुण मिलान (खाजगी)',
  CreateInvitation: 'पत्रिका तयार करणे',
  CreateQuote: 'कोट तयार करणे',
  GetBudget: 'बजेट वाटप काढणे',
  AddGuest: 'पाहुणे जोडणे',
  SendReminder: 'स्मरणिका पाठवणे',
  CreatePrintOrder: 'छपाई ऑर्डर तयार करणे',
};

function isAssistantResponse(data: unknown): data is AssistantResponse {
  if (typeof data !== 'object' || data === null) return false;
  const value = data as Partial<AssistantResponse>;
  return (
    typeof value.answer === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.plan) &&
    Array.isArray(value.results) &&
    Array.isArray(value.pendingConfirmation) &&
    Array.isArray(value.vendors) &&
    Array.isArray(value.muhurats) &&
    Array.isArray(value.budget) &&
    Array.isArray(value.clarifications) &&
    typeof value.provider === 'object' &&
    value.provider !== null &&
    typeof value.provider.id === 'string'
  );
}

export function CreateWizard({ examples }: { examples: string[] }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string, confirm: boolean) => {
    setPending(true);
    setError(null);
    try {
      const result = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, confirm }),
      });
      let data: unknown = null;
      try {
        data = await result.json();
      } catch {
        data = null;
      }
      if (!result.ok) {
        const failure =
          data && typeof data === 'object' && typeof (data as { error?: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'सहाय्यक उत्तर देत नाही.';
        setError(failure);
        return;
      }
      if (isAssistantResponse(data)) {
        setResponse(data);
      } else {
        setError('सहाय्यक उत्तर देत नाही.');
      }
    } catch {
      setError('नेटवर्क अडचण — पुन्हा प्रयत्न करा.');
    } finally {
      setPending(false);
    }
  }, []);

  const view = response !== null && isAssistantResponse(response) ? response : null;
  const submitted = view !== null;

  return (
    <section className="surface-elevated overflow-hidden p-0" aria-busy={pending}>
      <div className="paithani-edge h-1.5" aria-hidden />
      <form
        className="p-6 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault();
          if (message.trim().length < 2) return;
          void send(message, false);
        }}
      >
        <div className="flex items-center gap-2">
          <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-maroon text-gold-shimmer ring-1 ring-gold/30">✦</span>
          <label htmlFor="request" className="font-display text-lg font-bold tracking-tight text-charcoal">
            कार्यक्रमाबद्दल सांगा
          </label>
          <span className="ml-auto rounded-full bg-gold/12 px-2.5 py-1 font-ui text-xs font-semibold text-gold-ink ring-1 ring-gold/25">AI Studio</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
          शहर, तारीख (किंवा महिना), पाहुण्यांची संख्या आणि बजेट — जेवढे सांगाल तेवढे अचूक नियोजन.
        </p>
        <div className="relative mt-4">
          <textarea
            id="request"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={1200}
            className="min-h-[7.5rem] w-full resize-none rounded-2xl border border-gold/30 bg-white px-4 py-3.5 text-base leading-relaxed text-charcoal placeholder:text-charcoal-muted/60 shadow-sm outline-none transition focus:border-maroon/60 focus:ring-2 focus:ring-maroon/12"
            placeholder="उदा. पुण्यात एप्रिल २०२७ मध्ये लग्न आहे, ६५० पाहुणे, बजेट १८ लाख…"
          />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
        </div>
        <p className="mt-2 flex items-center justify-between text-xs text-charcoal-soft" aria-live="polite">
          <span className="font-ui">उदाहरणावर टॅप करा → मजकूर भरेगा</span>
          <span className="font-ui font-medium">{toDevanagariDigits(message.length)} / {toDevanagariDigits(1200)} अक्षरे</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold/30 bg-ivory-surface px-3.5 py-2 text-xs font-medium leading-tight text-charcoal-soft shadow-2xs transition hover:border-maroon/30 hover:bg-ivory-deep hover:text-maroon"
            >
              <span className="size-1.5 rounded-full bg-gold/60 group-hover:bg-maroon" aria-hidden />
              {example.slice(0, 46)}…
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending || message.trim().length < 2} className="btn-base btn-maroon px-7 text-sm shadow-sm disabled:opacity-60">
            {pending ? 'नियोजन तयार होत आहे…' : 'नियोजन तयार करा'}
            <span aria-hidden>↗</span>
          </button>
          {submitted ? (
            <button
              type="button"
              onClick={() => {
                setResponse(null);
                setError(null);
                setMessage('');
              }}
              className="btn-base btn-outline px-5 text-sm"
            >
              नवीन विनंती
            </button>
          ) : null}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs leading-relaxed text-charcoal-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-paithani" />
          मुहूर्त व दर पंचांग-गणना व विक्रेत्यांच्या खऱ्या माहितीवरून — AI स्वतः तयार करत नाही.
        </p>
      </form>

      {error ? (
        <div className="mx-6 mb-6 rounded-2xl border border-maroon/20 bg-maroon/5 px-4 py-4 sm:mx-7">
          <p role="alert" className="text-sm font-medium leading-relaxed text-maroon">{error}</p>
          <button
            type="button"
            onClick={() => {
              if (message.trim().length >= 2) void send(message, false);
            }}
            disabled={pending}
            className="btn-base btn-maroon mt-3 px-5 text-sm"
          >
            पुन्हा प्रयत्न करा
          </button>
        </div>
      ) : null}

      {view ? (
        <div className="border-t border-gold/20 bg-ivory-deep/40 p-6 sm:p-7 space-y-6" aria-live="polite">
          <div className="rounded-2xl border border-gold/25 bg-ivory-surface p-4 shadow-sm">
            <p className="inline-flex flex-wrap items-center gap-2 font-ui text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-gold-ink ring-1 ring-gold/30">{view.summary}</span>
              <span>{view.provider.id}{view.provider.fallback ? ' (नियम-आधारित)' : ''}</span>
              <span>• {toDevanagariDigits(view.provider.latencyMs)} मिसे</span>
            </p>
            <pre className="mt-3 whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-charcoal">
              {view.answer}
            </pre>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-charcoal">केलेली पायरे</h3>
            <ol className="mt-3 space-y-2">
              {view.plan.map((call) => {
                const result = view.results.find((r) => r.tool === call.tool);
                const state = result?.ok ? 'done' : result?.requiresConfirmation ? 'confirm' : 'failed';
                return (
                  <li key={call.tool} className="flex items-start gap-3 rounded-2xl border border-gold/20 bg-ivory-surface px-4 py-3 shadow-2xs">
                    <span
                      aria-hidden
                      className={
                        state === 'done'
                          ? 'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-paithani text-xs font-bold text-ivory shadow-sm'
                          : state === 'confirm'
                            ? 'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-ink shadow-sm'
                            : 'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-maroon text-xs font-bold text-ivory shadow-sm'
                      }
                    >
                      {state === 'done' ? '✓' : state === 'confirm' ? '⏸' : '×'}
                    </span>
                    <span className="min-w-0">
                      <span className="text-sm font-semibold text-charcoal">{TOOL_LABELS[call.tool] ?? call.tool}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-soft">{call.rationale}</span>
                      {result?.error ? <span className="mt-1 block rounded-lg bg-maroon/6 px-2 py-1 text-xs font-medium text-maroon">{result.error}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {view.pendingConfirmation.length ? (
            <div className="rounded-2xl border border-gold/40 bg-amber-50/70 p-4 shadow-sm">
              <p className="text-sm leading-relaxed text-charcoal">
                पुढील पायऱ्यांसाठी तुमची पुष्टी आवश्यक आहे: <span className="font-semibold">{view.pendingConfirmation.map((tool) => TOOL_LABELS[tool] ?? tool).join(', ')}</span>.
              </p>
              <button type="button" onClick={() => void send(message, true)} disabled={pending} className="btn-base btn-maroon mt-3 px-5 text-sm">
                हो, पुढे जा — कार्यक्रम तयार करा
              </button>
            </div>
          ) : null}

          {view.muhurats.length ? (
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-charcoal">मुहूर्त अनुकूलता</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {view.muhurats.map((muhurat) => (
                  <li key={muhurat.date} className="rounded-2xl border border-gold/20 bg-ivory-surface px-4 py-3 shadow-2xs">
                    <p className="text-sm font-semibold text-charcoal">{muhurat.weekday}, {muhurat.date}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-paithani-soft px-2.5 py-1 text-xs font-semibold text-paithani ring-1 ring-paithani/20">
                      {muhurat.band} • {toDevanagariDigits(muhurat.score)}/१००
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">ही अनुकूलता गणना आहे; अंतिम निर्णय कुटुंबीय व गुरुजींच्या सल्ल्याने घ्यावा.</p>
            </div>
          ) : null}

          {view.budget.length ? (
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-charcoal">अंदाजे बजेट वाटप</h3>
              <ul className="mt-3 overflow-hidden rounded-2xl border border-gold/20 bg-ivory-surface shadow-2xs">
                {view.budget.slice(0, 8).map((line) => (
                  <li key={line.category} className="flex items-center justify-between gap-4 border-b border-gold/12 px-4 py-3 last:border-0">
                    <span className="text-sm text-charcoal">{line.label}</span>
                    <span className="rounded-full bg-maroon-light px-2.5 py-1 text-sm font-bold text-maroon ring-1 ring-maroon/10">₹{toDevanagariDigits((line.estimatedPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }))}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {view.vendors.length ? (
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-charcoal">या विनंतीसाठी उपलब्ध विक्रेते</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {view.vendors.map((vendor) => (
                  <li key={vendor.id} className="rounded-2xl border border-gold/20 bg-ivory-surface px-4 py-3 shadow-2xs">
                    <p className="text-sm font-semibold text-charcoal">{vendor.name}</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-charcoal-soft">
                      <span className="rounded-full bg-gold/14 px-2 py-0.5 font-bold text-maroon">★ {toDevanagariDigits(vendor.rating.toFixed(1))}</span>
                      <span>₹{toDevanagariDigits((vendor.startingPricePaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }))} पासून</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {view.event ? (
            <div className="rounded-2xl border border-paithani/30 bg-linear-to-br from-paithani/10 via-ivory-surface to-ivory-deep p-4 shadow-sm">
              <p className="text-sm font-medium leading-relaxed text-charcoal">कार्यक्रम वर्कस्पेस तयार आहे — बजेट व कार्यसूची पारंपरिक रचनेनुसार भरलेली आहे.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/studio/${view.event.slug}`} className="btn-base btn-maroon px-5 py-2.5 text-sm">वर्कस्पेस उघडा</Link>
                <Link href={`/studio/${view.event.slug}/invitation`} className="btn-base btn-outline px-5 py-2.5 text-sm bg-white">पत्रिका तयार करा</Link>
              </div>
            </div>
          ) : null}

          {view.clarifications.length ? (
            <div className="rounded-2xl border border-gold/30 bg-white px-4 py-3 shadow-sm">
              {view.clarifications.map((question) => (
                <p key={question} className="flex gap-2 text-sm leading-relaxed text-charcoal-soft"><span aria-hidden>❓</span>{question}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
