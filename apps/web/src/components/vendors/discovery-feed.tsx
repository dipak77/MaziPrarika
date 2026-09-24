'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

/**
 * The live discovery feed.
 *
 * Why it exists: a family narrows down by city → category → date → budget, and a
 * full page reload at every step is how you lose them. This component queries the
 * ranked API as filters change (debounced), keeps a visible result count, and
 * shows skeletons only for the first load — never a spinner that hides state.
 *
 * It also degrades honestly: if the API fails it says so instead of rendering an
 * empty grid that looks like "no vendors exist".
 */

interface VendorRow {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  city: string;
  about: string;
  startingPricePaise: number;
  rating: number;
  reviewCount: number;
  bookingsCompleted: number;
  responseMinutes: number;
  languages: string[];
  badges: string[];
  organicScore: number;
  position: number;
  sponsored: boolean;
  availability: { status: string; bookable: boolean; reason: string } | null;
}

interface FeedResponse {
  total: number;
  sponsoredCount: number;
  results: VendorRow[];
  meta: { ranking: string };
}

const rupees = (paise: number): string => `₹${toDevanagariDigits(Math.round(paise / 100).toLocaleString('en-IN'))}`;

export function DiscoveryFeed({
  cities,
  categories,
  initial,
  sponsoredCount,
}: {
  cities: string[];
  categories: Array<{ key: string; label: string }>;
  initial: { city: string; date?: string };
  sponsoredCount: number;
}) {
  const [city, setCity] = useState(initial.city);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(initial.date ?? '');
  const [maxBudget, setMaxBudget] = useState('');
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState('loading');

    const params = new URLSearchParams({ city, limit: '12' });
    if (category) params.set('category', category);
    if (date) params.set('date', date);
    if (maxBudget) params.set('maxPricePaise', String(Number(maxBudget) * 100));
    if (query.trim().length > 1) params.set('q', query.trim());

    try {
      const response = await fetch(`/api/vendors?${params.toString()}`, { signal: next.signal });
      if (!response.ok) throw new Error('bad status');
      const data = (await response.json()) as FeedResponse;
      setFeed(data);
      setState('ready');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setState('error');
    }
  }, [city, category, date, maxBudget, query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 220);
    return () => clearTimeout(timer);
  }, [load]);

  const categoryLabel = categories.find((entry) => entry.key === category)?.label;

  return (
    <section className="mt-6">
      <div className="surface grid gap-3 p-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">शोध</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="नाव किंवा सेवा — उदा. कॅन्डिड"
            className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">शहर</span>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
          >
            {cities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">श्रेणी</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
          >
            <option value="">सर्व श्रेणी</option>
            {categories.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">कार्यक्रम तारीख</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-2 py-2 text-xs"
            />
          </label>
          <label className="text-sm">
            <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">बजेट पर्यंत (₹)</span>
            <input
              inputMode="numeric"
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value.replace(/[^0-9]/g, ''))}
              placeholder="उदा. 200000"
              className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-2 py-2 text-xs"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-charcoal-soft">
        <span
          aria-live="polite"
          className={
            state === 'error'
              ? 'rounded-full border border-maroon/40 bg-maroon/8 px-3 py-1 text-maroon'
              : 'rounded-full border border-gold/40 bg-ivory px-3 py-1'
          }
        >
          {state === 'loading'
            ? 'शोधत आहे…'
            : state === 'error'
              ? 'शोध उपलब्ध नाही — पान पुन्हा लोड करा'
              : `${toDevanagariDigits(feed?.total ?? 0)} निकाल • ${city}${categoryLabel ? ` • ${categoryLabel}` : ''}${date ? ` • ${date}` : ''}`}
        </span>
        {feed && feed.sponsoredCount > 0 ? (
          <span className="rounded-full border border-haldi/50 bg-haldi/10 px-3 py-1 text-charcoal">
            {toDevanagariDigits(feed.sponsoredCount)} प्रायोजित निकाल चिन्हांकित
          </span>
        ) : null}
        {sponsoredCount > 0 ? (
          <span className="font-ui text-[11px] uppercase tracking-wider text-charcoal-soft">
            {toDevanagariDigits(sponsoredCount)} सक्रिय जाहिरात मोहीम
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state === 'loading' && !feed
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface h-48 animate-pulse bg-ivory-deep/40" aria-hidden />
            ))
          : null}

        {feed?.results.map((vendor) => (
          <article
            key={vendor.id}
            className={
              vendor.sponsored
                ? 'surface relative p-5 ring-1 ring-haldi/50'
                : 'surface relative p-5 transition hover:-translate-y-0.5 hover:shadow-lift'
            }
          >
            {vendor.sponsored ? (
              <span className="absolute right-4 top-4 rounded-full bg-haldi/15 px-2 py-0.5 text-[11px] font-semibold text-haldi">
                प्रायोजित
              </span>
            ) : (
              <span className="absolute right-4 top-4 font-ui text-[11px] text-charcoal-soft">
                #{toDevanagariDigits(vendor.position)}
              </span>
            )}

            <p className="font-ui text-xs uppercase tracking-wider text-gold">{vendor.categoryLabel}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-charcoal">{vendor.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-charcoal-soft">{vendor.about}</p>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-charcoal-soft">सुरुवातीचा दर</dt>
                <dd className="font-semibold text-maroon">{rupees(vendor.startingPricePaise)}</dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">प्रतिसाद</dt>
                <dd className="font-semibold text-charcoal">{toDevanagariDigits(vendor.responseMinutes)} मिनिटे</dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">रेटिंग</dt>
                <dd className="font-semibold text-charcoal">
                  ★ {toDevanagariDigits(vendor.rating.toFixed(1))} ({toDevanagariDigits(vendor.reviewCount)})
                </dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">पूर्ण बुकिंग</dt>
                <dd className="font-semibold text-charcoal">{toDevanagariDigits(vendor.bookingsCompleted)}</dd>
              </div>
            </dl>

            {vendor.availability ? (
              <p
                className={
                  vendor.availability.bookable
                    ? 'mt-3 rounded-lg border border-paithani/40 bg-paithani/8 px-2 py-1 text-[11px] text-paithani'
                    : 'mt-3 rounded-lg border border-maroon/40 bg-maroon/8 px-2 py-1 text-[11px] text-maroon'
                }
              >
                {vendor.availability.reason}
              </p>
            ) : null}

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {vendor.badges.slice(0, 3).map((badge) => (
                <li key={badge} className="rounded-full border border-gold/35 bg-ivory-deep/40 px-2 py-0.5 text-[11px] text-charcoal-soft">
                  {badge}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-ui text-[11px] text-charcoal-soft">गुण {toDevanagariDigits(vendor.organicScore)}/१००</span>
              <Link href={`/vendors/${vendor.id}`} className="rounded-full bg-maroon px-4 py-2 text-xs font-semibold text-ivory">
                प्रोफाइल व कोट
              </Link>
            </div>
          </article>
        ))}

        {state === 'ready' && feed?.results.length === 0 ? (
          <div className="surface p-6 sm:col-span-2 lg:col-span-3">
            <p className="font-display text-lg font-bold text-charcoal">या निकषांना जुळणारा विक्रेता सापडला नाही</p>
            <p className="mt-1 text-sm text-charcoal-soft">
              बजेट वाढवा, तारीख बदला किंवा दुसरे शहर पाहा. नवीन विक्रेते सामील होताच इथे दिसतील.
            </p>
          </div>
        ) : null}
      </div>

      {feed ? <p className="mt-4 text-xs text-charcoal-soft">क्रमवारी नियम: {feed.meta.ranking}</p> : null}
    </section>
  );
}
