'use client';

import Link from 'next/link';
import { useState } from 'react';

import { formatMarathiDateTime, leadStatusLabel, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import type { Lead } from '@mazi/store';

import { requestQuoteAction } from '@/app/studio/[slug]/actions';

export function VendorDeskPanel({
  slug,
  leads,
  suggested,
}: {
  slug: string;
  leads: Lead[];
  suggested: Array<{ id: string; name: string; category: string; city: string; rating: number }>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);
  const now = Date.now();

  return (
    <section aria-labelledby="vendor-heading" className="surface-elevated animate-fade-up overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="vendor-heading" className="tracking-tight text-charcoal">विक्रेता विनंत्या</h2>
            <p className="mt-1 font-ui text-xs font-semibold uppercase tracking-wider text-charcoal-soft">थेट कॅलेंडर उपलब्धता • लेखी कोट • सुरक्षित बुकिंग</p>
          </div>
          <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gold/12 px-3.5 py-2 font-ui text-xs font-bold text-maroon ring-1 ring-gold/25">
            <span aria-hidden className="animate-pulse-dot inline-block size-2 rounded-full bg-maroon" />
            SLA: २ तास • {toDevanagariDigits(leads.length)} विनंत्या
          </span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {leads.map((lead) => {
            const minutesLeft = Math.round((new Date(lead.responseDueAt).getTime() - now) / 60_000);
            const late = lead.status === 'new' && minutesLeft < 0;
            return (
              <li key={lead.id} className={`rounded-2xl border bg-white px-4 py-3.5 shadow-2xs transition hover:shadow-soft ${late ? 'border-maroon/30' : 'border-gold/20 hover:border-gold/40'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-sm font-bold tracking-tight text-charcoal">
                    <span aria-hidden className={`grid size-2.5 shrink-0 rounded-full ${late ? 'bg-maroon' : lead.status === 'responded' || lead.status === 'quoted' ? 'bg-paithani' : 'bg-gold'}`} />
                    <span className="truncate">{vendorCategoryLabel(lead.category)}</span>
                  </p>
                  <span
                    className={
                      late
                        ? 'inline-flex min-h-11 shrink-0 items-center rounded-full border border-maroon/25 bg-maroon-light px-2.5 py-1 text-xs font-bold text-maroon'
                        : 'inline-flex min-h-11 shrink-0 items-center rounded-full border border-gold/25 bg-ivory-deep px-2.5 py-1 text-xs font-semibold text-charcoal-soft'
                    }
                  >
                    {leadStatusLabel(lead.status)}
                    {late ? ' • मुदत संपली' : ''}
                  </span>
                </div>
                <p className="mt-2 flex flex-wrap gap-1.5 font-ui text-xs font-medium text-charcoal-muted">
                  <span className="inline-flex items-center rounded-full bg-ivory-deep px-2.5 py-1">मुदत {formatMarathiDateTime(lead.responseDueAt)}</span>
                  <span className="inline-flex items-center rounded-full bg-ivory-deep px-2.5 py-1">स्रोत: {lead.source}</span>
                  {lead.sponsored ? <span className="inline-flex items-center rounded-full bg-haldi-soft px-2.5 py-1 font-bold text-haldi ring-1 ring-haldi/20">प्रायोजित</span> : null}
                </p>
              </li>
            );
          })}
          {leads.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-gold/30 bg-ivory-deep/40 px-4 py-9 text-center">
              <p className="text-sm font-bold text-charcoal">अजून विनंती नाही</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-charcoal-soft">खालील शिफारस केलेल्या पडताळलेल्या विक्रेत्यांना विनंती पाठवा — प्रतिसाद २ तासांत.</p>
            </li>
          ) : null}
        </ul>

        {busy ? (
          <div aria-hidden className="mt-3 space-y-2">
            <div className="skeleton h-16 rounded-2xl" />
          </div>
        ) : null}

        {suggested.length ? (
          <div className="mt-6 border-t border-gold/15 pt-5">
            <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-charcoal-soft">या शहरातील पडताळलेले विक्रेते</h3>
            <ul className="mt-3 space-y-2.5">
              {suggested.slice(0, 4).map((vendor) => (
                <li key={vendor.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-ivory-deep/50 px-3.5 py-3 shadow-2xs transition hover:border-gold/35 hover:bg-white">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-charcoal">{vendor.name}</span>
                    <span className="mt-0.5 block font-ui text-xs font-medium text-charcoal-soft">
                      {vendorCategoryLabel(vendor.category)} • {vendor.city} • <span className="font-bold text-maroon">★ {toDevanagariDigits(vendor.rating.toFixed(1))}</span>
                    </span>
                  </span>
                  <form
                    action={async (formData) => {
                      setBusy(vendor.id);
                      setResult(null);
                      try {
                        await requestQuoteAction(formData);
                        setResult({ id: vendor.id, ok: true, message: 'विनंती पाठवली — लवकर प्रतिसाद येईल.' });
                      } catch (error) {
                        setResult({
                          id: vendor.id,
                          ok: false,
                          message: error instanceof Error ? error.message : 'विनंती पाठवता आली नाही — पुन्हा प्रयत्न करा.',
                        });
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="vendorId" value={vendor.id} />
                    <button type="submit" disabled={busy === vendor.id} className="btn-base btn-maroon min-h-11 px-4 py-2 text-xs shadow-sm disabled:opacity-60">
                      {busy === vendor.id ? 'पाठवत आहे…' : 'कोट मागवा'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            {result ? (
              <p className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-relaxed ${result.ok ? 'border-paithani/30 bg-paithani-soft text-paithani' : 'border-maroon/25 bg-maroon-light text-maroon'}`} role={result.ok ? 'status' : 'alert'}>
                {result.message}
              </p>
            ) : null}
            <Link href="/vendors" className="btn-base btn-outline mt-4 min-h-11 w-full px-4 text-xs">
              सर्व पडताळलेले विक्रेते पहा →
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-paithani/20 bg-paithani-soft px-4 py-4 text-center">
            <p className="text-xs font-bold text-paithani">✓ या शहरातील सर्व सुचवलेले विक्रेते आधीच संपर्कात आहेत.</p>
            <Link href="/vendors" className="btn-base btn-outline mt-3 min-h-11 bg-white px-4 text-xs">
              आणखी विक्रेते शोधा →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
