'use client';

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
  const now = Date.now();

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">विक्रेता विनंत्या</h2>
        <p className="font-ui text-xs text-charcoal-soft">
          SLA: २ तासांत प्रतिसाद • {toDevanagariDigits(leads.length)} विनंत्या
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {leads.map((lead) => {
          const minutesLeft = Math.round((new Date(lead.responseDueAt).getTime() - now) / 60_000);
          const late = lead.status === 'new' && minutesLeft < 0;
          return (
            <li key={lead.id} className="rounded-xl border border-gold/25 bg-ivory px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-charcoal">{vendorCategoryLabel(lead.category)}</p>
                <span
                  className={
                    late
                      ? 'rounded-full border border-maroon/40 bg-maroon/8 px-2 py-0.5 text-[11px] text-maroon'
                      : 'rounded-full border border-gold/45 bg-gold/10 px-2 py-0.5 text-[11px] text-charcoal'
                  }
                >
                  {leadStatusLabel(lead.status)}
                  {late ? ' • मुदत संपली' : ''}
                </span>
              </div>
              <p className="mt-1 text-xs text-charcoal-soft">
                प्रतिसाद मुदत {formatMarathiDateTime(lead.responseDueAt)} • स्रोत: {lead.source}
                {lead.sponsored ? ' • प्रायोजित' : ''}
              </p>
            </li>
          );
        })}
        {leads.length === 0 ? (
          <li className="rounded-xl border border-dashed border-gold/40 px-3 py-6 text-center text-sm text-charcoal-soft">
            अजून विनंती नाही — खालील शिफारस केलेल्या विक्रेत्यांना विनंती पाठवा.
          </li>
        ) : null}
      </ul>

      {suggested.length ? (
        <div className="mt-5">
          <h3 className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">या शहरातील पडताळलेले विक्रेते</h3>
          <ul className="mt-2 space-y-2">
            {suggested.slice(0, 4).map((vendor) => (
              <li key={vendor.id} className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-ivory-deep/40 px-3 py-2">
                <span>
                  <span className="block text-sm font-semibold text-charcoal">{vendor.name}</span>
                  <span className="block font-ui text-xs text-charcoal-soft">
                    {vendorCategoryLabel(vendor.category)} • ★ {toDevanagariDigits(vendor.rating.toFixed(1))}
                  </span>
                </span>
                <form
                  action={async (formData) => {
                    setBusy(vendor.id);
                    try {
                      await requestQuoteAction(formData);
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="vendorId" value={vendor.id} />
                  <button
                    type="submit"
                    disabled={busy === vendor.id}
                    className="rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-ivory disabled:opacity-60"
                  >
                    {busy === vendor.id ? 'पाठवत आहे…' : 'कोट मागवा'}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
