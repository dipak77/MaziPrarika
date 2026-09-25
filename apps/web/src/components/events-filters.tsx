'use client';

import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

interface EventsFiltersProps {
  city: string;
  type: string;
  cityOptions: readonly string[];
  eventOptions: Array<{ key: string; label: string }>;
}

export function EventsFilters({
  city,
  type,
  cityOptions,
  eventOptions,
}: EventsFiltersProps) {
  const { lang, isEn } = useLanguage();
  const copy = uiCopy[lang].events;

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
          <option value="">{isEn ? 'All Cities' : 'सर्व शहरे'}</option>
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
          {copy.typeLabel}
        </span>
        <select
          name="type"
          defaultValue={type}
          className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">{isEn ? 'All Event Types' : 'सर्व प्रकार'}</option>
          {eventOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-base btn-maroon self-end px-5 text-sm">
        {isEn ? 'Search Invitations' : 'पत्रिका शोधा'}
      </button>
    </form>
  );
}
