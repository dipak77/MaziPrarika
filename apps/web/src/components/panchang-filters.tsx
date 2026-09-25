'use client';

import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

interface PanchangFiltersProps {
  city: string;
  date: string;
  eventType: string;
  cityOptions: readonly string[];
  eventChoices: Array<{ key: string; label: string; enLabel?: string }>;
}

export function PanchangFilters({
  city,
  date,
  eventType,
  cityOptions,
  eventChoices,
}: PanchangFiltersProps) {
  const { lang, isEn } = useLanguage();
  const copy = uiCopy[lang].panchang;

  return (
    <form className="surface mt-6 grid gap-3 p-5 sm:grid-cols-3" method="get">
      <input type="hidden" name="lang" value={lang} />
      <label className="text-sm">
        <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
          {copy.cityLabel}
        </span>
        <select
          name="city"
          defaultValue={city}
          className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
        >
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
          {copy.dateLabel}
        </span>
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
        />
      </label>
      <label className="text-sm">
        <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
          {copy.eventLabel}
        </span>
        <select
          name="event"
          defaultValue={eventType}
          className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
        >
          {eventChoices.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-base btn-maroon px-5 text-sm sm:col-span-3">
        {copy.btnView}
      </button>
    </form>
  );
}
