'use client';

import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

import { placePrintOrderAction, setDesignStatusAction } from '@/app/studio/[slug]/invitation/actions';
import { devRupees, percent, shortDate } from '@/lib/format';

export interface PrintQuoteView {
  quantity: number;
  unitPricePaise: number;
  subtotalPaise: number;
  shippingPaise: number;
  expressPaise: number;
  gstPaise: number;
  totalPaise: number;
  commissionPaise: number;
  contributionPaise: number;
  vendorPayoutPaise: number;
}

export function PrintOrderPanel({
  slug,
  designId,
  quote,
  history,
  eventDateLabel,
  printerLabel,
  expressDefault,
  paper,
  finishing,
}: {
  slug: string;
  designId: string;
  quote: PrintQuoteView;
  history: Array<{ id: string; name: string; version: number; status: string; updatedAt: string; scheme: string }>;
  eventDateLabel: string;
  printerLabel: string;
  expressDefault: boolean;
  paper: string;
  finishing: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const current = history.find((entry) => entry.id === designId);

  return (
    <>
      <section className="surface-elevated overflow-hidden p-0">
        <div aria-hidden className="paithani-edge h-1.5" />
        <div className="p-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">छपाई ऑर्डर</h2>
          <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-ivory-deep px-3 py-1 text-xs font-medium text-charcoal-soft ring-1 ring-gold/20">
            {toDevanagariDigits(quote.quantity)} कार्डे • {devRupees(quote.unitPricePaise)}/कार्ड • {printerLabel}
          </p>

          <dl className="mt-4 space-y-0 overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-2xs">
            <div className="space-y-0 divide-y divide-gold/10 text-sm">
              <Row label="कार्डे" value={devRupees(quote.subtotalPaise)} />
              <Row label="वाहतूक" value={quote.shippingPaise === 0 ? 'मोफत' : devRupees(quote.shippingPaise)} />
              {quote.expressPaise > 0 ? <Row label="एक्स्प्रेस (१८%)" value={devRupees(quote.expressPaise)} /> : null}
              <Row label="GST १८%" value={devRupees(quote.gstPaise)} />
            </div>
            <div className="bg-ivory-deep/50 px-4 py-3">
              <Row label="एकूण देय" value={devRupees(quote.totalPaise)} strong />
            </div>
          </dl>

          <details className="mt-4 rounded-2xl border border-gold/15 bg-ivory-deep/40 px-4 py-3 text-xs leading-relaxed text-charcoal-soft">
            <summary className="cursor-pointer font-bold text-charcoal">पारदर्शकता — रकमेचा प्रवाह</summary>
            <ul className="mt-2 space-y-1.5">
              <li className="flex justify-between"><span>छपाईकारास देय</span><span className="font-semibold text-charcoal">{devRupees(quote.vendorPayoutPaise)}</span></li>
              <li className="flex justify-between"><span>प्लॅटफॉर्म कमिशन</span><span className="font-semibold text-charcoal">{devRupees(quote.commissionPaise)}</span></li>
              <li className="flex justify-between"><span>गेटवे शुल्क</span><span>−{devRupees(quote.commissionPaise - quote.contributionPaise)}</span></li>
              <li className="flex justify-between border-t border-gold/20 pt-1.5 font-bold text-charcoal"><span>निव्वळ उत्पन्न</span><span>{devRupees(quote.contributionPaise)}</span></li>
            </ul>
          </details>

          <form
            action={(formData) => {
              setResult(null);
              startTransition(async () => {
                try {
                  await placePrintOrderAction(formData);
                  setResult({ ok: true, message: 'ऑर्डर नोंदवली — प्रूफ पाठवले जाईल.' });
                } catch (error) {
                  setResult({
                    ok: false,
                    message: error instanceof Error ? error.message : 'ऑर्डर नोंदवता आली नाही — पुन्हा प्रयत्न करा.',
                  });
                }
              });
            }}
            className="mt-4 space-y-3"
          >
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="designId" value={designId} />
            <input type="hidden" name="quantity" value={quote.quantity} />
            <input type="hidden" name="paper" value={paper} />
            {finishing.map((code) => (
              <input key={code} type="hidden" name="finishing" value={code} />
            ))}
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-gold/20 bg-white px-3 py-2 text-sm font-medium text-charcoal-soft shadow-2xs">
              <input type="checkbox" name="express" defaultChecked={expressDefault} className="size-4 rounded accent-[var(--color-maroon)]" />
              एक्स्प्रेस छपाई (३ दिवसांत) — विवाहापूर्वी {eventDateLabel}
            </label>
            <button type="submit" disabled={pending} className="btn-base btn-maroon w-full px-5 py-3 text-sm shadow-sm disabled:opacity-60">
              {pending ? 'ऑर्डर नोंदवत आहे…' : 'छपाई ऑर्डर द्या (प्रूफ आधी पाठवले जाईल)'}
            </button>
          </form>

          {result ? (
            <p className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${result.ok ? 'border-paithani/30 bg-paithani-soft text-paithani' : 'border-maroon/20 bg-maroon-light text-maroon'}`} role={result.ok ? 'status' : 'alert'}>
              {result.message}
            </p>
          ) : null}

          {current && (current.status === 'draft' || current.status === 'review') ? (
            <form
              action={(formData) => {
                setResult(null);
                startTransition(async () => {
                  try {
                    await setDesignStatusAction(formData);
                    setResult({ ok: true, message: 'डिझाइन मंजूर — छपाईसाठी पाठवले.' });
                  } catch (error) {
                    setResult({
                      ok: false,
                      message: error instanceof Error ? error.message : 'मंजुरी अपयशी — पुन्हा प्रयत्न करा.',
                    });
                  }
                });
              }}
              className="mt-3"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="designId" value={designId} />
              <input type="hidden" name="status" value="approved" />
              <button type="submit" disabled={pending} className="btn-base w-full border border-paithani/30 bg-white px-5 py-3 text-sm font-bold text-paithani shadow-2xs hover:bg-paithani-soft disabled:opacity-60">
                {pending ? 'मंजूर करत आहे…' : 'डिझाइन मंजूर करा (छपाईसाठी पाठवा)'}
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">आवृत्ती इतिहास</h2>
        <p className="mt-1 text-xs leading-relaxed text-charcoal-soft">प्रत्येक जतन जुन्या आवृत्तीला स्पर्श न करता नवीन आवृत्ती तयार करते — कोणतीही पत्रिका हरवत नाही.</p>
        <ol className="mt-4 space-y-2">
          {history.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-gold/15 bg-white px-3.5 py-3 shadow-2xs">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-charcoal">{entry.name}</p>
                <p className="mt-0.5 font-ui text-xs font-medium text-charcoal-soft">आवृत्ती {toDevanagariDigits(entry.version)} • {entry.scheme} • {shortDate(entry.updatedAt)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ivory-deep px-2.5 py-1 font-ui text-xs font-semibold text-charcoal-soft ring-1 ring-gold/20">{entry.status}</span>
            </li>
          ))}
          {history.length === 0 ? <li className="rounded-xl border border-dashed border-gold/30 bg-ivory-deep/40 px-4 py-6 text-center text-sm text-charcoal-soft">अजून जतन केलेली आवृत्ती नाही.</li> : null}
        </ol>
        <p className="mt-3 text-center font-ui text-xs font-medium text-charcoal-muted">{percent(1)} प्री-फ्लाइट तपासणी उत्तीर्ण • bleed • CMYK • फॉइल जाडी</p>
      </section>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className={strong ? 'text-sm font-bold text-charcoal' : 'text-sm text-charcoal-soft'}>{label}</dt>
      <dd className={strong ? 'font-display text-lg font-bold text-maroon' : 'text-sm font-semibold text-charcoal'}>{value}</dd>
    </div>
  );
}
