'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

/**
 * The AI setup wizard.
 *
 * Two-phase by design: the first call only *proposes* a plan (read-only tools
 * run immediately so the user sees real value), and nothing that writes to the
 * account happens until the user confirms. That is the difference between an
 * assistant and an agent that spends your money.
 */

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
      const data = (await result.json()) as AssistantResponse;
      if (!result.ok) {
        setError(data.error ?? 'सहाय्यक उत्तर देत नाही.');
      }
      setResponse(data);
    } catch {
      setError('नेटवर्क अडचण — पुन्हा प्रयत्न करा.');
    } finally {
      setPending(false);
    }
  }, []);

  const submitted = response !== null;

  return (
    <section className="surface p-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (message.trim().length < 2) return;
          void send(message, false);
        }}
      >
        <label htmlFor="request" className="font-display text-lg font-bold text-charcoal">
          कार्यक्रमाबद्दल सांगा
        </label>
        <p className="mt-1 text-sm text-charcoal-soft">
          शहर, तारीख (किंवा महिना), पाहुण्यांची संख्या आणि बजेट — जेवढे सांगाल तेवढे अचूक नियोजन.
        </p>
        <textarea
          id="request"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          maxLength={1200}
          className="mt-3 w-full rounded-xl border border-gold/40 bg-ivory px-4 py-3 text-base text-charcoal outline-none focus:border-maroon"
          placeholder="उदा. पुण्यात एप्रिल २०२७ मध्ये लग्न आहे, ६५० पाहुणे, बजेट १८ लाख…"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="rounded-full border border-gold/40 bg-ivory px-3 py-1.5 text-xs text-charcoal-soft transition hover:border-maroon hover:text-maroon"
            >
              {example.slice(0, 46)}…
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || message.trim().length < 2}
            className="rounded-full bg-maroon px-6 py-3 font-semibold text-ivory shadow-soft transition hover:bg-maroon-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'नियोजन तयार होत आहे…' : 'नियोजन तयार करा'}
          </button>
          {submitted ? (
            <button
              type="button"
              onClick={() => {
                setResponse(null);
                setMessage('');
              }}
              className="text-sm font-semibold text-charcoal-soft underline decoration-gold decoration-2 underline-offset-4"
            >
              नवीन विनंती
            </button>
          ) : null}
          <span className="font-ui text-xs text-charcoal-soft">
            मुहूर्त व दर पंचांग-गणना व विक्रेत्यांच्या खऱ्या माहितीवरून — AI स्वतः तयार करत नाही.
          </span>
        </div>
      </form>

      {error ? (
        <p className="mt-5 rounded-xl border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon">{error}</p>
      ) : null}

      {response ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-gold/30 bg-ivory-deep/60 p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
              {response.summary} • {response.provider.id}
              {response.provider.fallback ? ' (नियम-आधारित)' : ''} • {toDevanagariDigits(response.provider.latencyMs)} मिसे
            </p>
            <pre className="mt-3 whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-charcoal">
              {response.answer}
            </pre>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-charcoal">केलेली पायरे</h3>
            <ol className="mt-3 space-y-2">
              {response.plan.map((call) => {
                const result = response.results.find((r) => r.tool === call.tool);
                const state = result?.ok
                  ? 'done'
                  : result?.requiresConfirmation
                    ? 'confirm'
                    : 'failed';
                return (
                  <li key={call.tool} className="flex items-start gap-3 rounded-xl border border-gold/25 bg-ivory px-4 py-3">
                    <span
                      aria-hidden
                      className={
                        state === 'done'
                          ? 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-paithani text-xs text-ivory'
                          : state === 'confirm'
                            ? 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold text-xs text-ivory'
                            : 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-maroon text-xs text-ivory'
                      }
                    >
                      {state === 'done' ? '✓' : state === 'confirm' ? '⏸' : '×'}
                    </span>
                    <span>
                      <span className="font-semibold text-charcoal">{TOOL_LABELS[call.tool] ?? call.tool}</span>
                      <span className="mt-0.5 block text-xs text-charcoal-soft">{call.rationale}</span>
                      {result?.error ? <span className="mt-1 block text-xs text-maroon">{result.error}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {response.pendingConfirmation.length ? (
            <div className="rounded-xl border border-gold/50 bg-gold/10 p-4">
              <p className="text-sm text-charcoal">
                पुढील पायऱ्यांसाठी तुमची पुष्टी आवश्यक आहे: {response.pendingConfirmation.map((tool) => TOOL_LABELS[tool] ?? tool).join(', ')}.
              </p>
              <button
                type="button"
                onClick={() => void send(message, true)}
                disabled={pending}
                className="mt-3 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory transition hover:bg-maroon-soft disabled:opacity-60"
              >
                हो, पुढे जा — कार्यक्रम तयार करा
              </button>
            </div>
          ) : null}

          {response.muhurats.length ? (
            <div>
              <h3 className="font-display text-lg font-bold text-charcoal">मुहूर्त अनुकूलता</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {response.muhurats.map((muhurat) => (
                  <li key={muhurat.date} className="rounded-xl border border-gold/25 bg-ivory px-4 py-3">
                    <p className="font-semibold text-charcoal">
                      {muhurat.weekday}, {muhurat.date}
                    </p>
                    <p className="mt-1 text-xs text-charcoal-soft">
                      {muhurat.band} • {toDevanagariDigits(muhurat.score)}/१००
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-charcoal-soft">
                ही अनुकूलता गणना आहे; अंतिम निर्णय कुटुंबीय व गुरुजींच्या सल्ल्याने घ्यावा.
              </p>
            </div>
          ) : null}

          {response.budget.length ? (
            <div>
              <h3 className="font-display text-lg font-bold text-charcoal">अंदाजे बजेट वाटप</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {response.budget.slice(0, 8).map((line) => (
                  <li key={line.category} className="flex items-center justify-between gap-4 border-b border-gold/20 py-1.5">
                    <span className="text-charcoal">{line.label}</span>
                    <span className="font-semibold text-maroon">
                      ₹{toDevanagariDigits((line.estimatedPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {response.vendors.length ? (
            <div>
              <h3 className="font-display text-lg font-bold text-charcoal">या विनंतीसाठी उपलब्ध विक्रेते</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {response.vendors.map((vendor) => (
                  <li key={vendor.id} className="rounded-xl border border-gold/25 bg-ivory px-4 py-3">
                    <p className="font-semibold text-charcoal">{vendor.name}</p>
                    <p className="mt-1 text-xs text-charcoal-soft">
                      ★ {toDevanagariDigits(vendor.rating.toFixed(1))} • ₹
                      {toDevanagariDigits((vendor.startingPricePaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }))} पासून
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {response.event ? (
            <div className="rounded-xl border border-paithani/40 bg-paithani/8 p-4">
              <p className="text-sm text-charcoal">
                कार्यक्रम वर्कस्पेस तयार आहे — बजेट व कार्यसूची पारंपरिक रचनेनुसार भरलेली आहे.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href={`/studio/${response.event.slug}`} className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory">
                  वर्कस्पेस उघडा
                </Link>
                <Link
                  href={`/studio/${response.event.slug}/invitation`}
                  className="rounded-full border border-maroon/30 px-5 py-2.5 text-sm font-semibold text-maroon"
                >
                  पत्रिका तयार करा
                </Link>
              </div>
            </div>
          ) : null}

          {response.clarifications.length ? (
            <div className="rounded-xl border border-gold/40 bg-ivory px-4 py-3 text-sm text-charcoal-soft">
              {response.clarifications.map((question) => (
                <p key={question}>❓ {question}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
