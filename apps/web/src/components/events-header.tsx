'use client';

import { Kicker } from '@/components/ui';
import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

export function EventsHeader() {
  const { lang, isEn } = useLanguage();
  const copy = uiCopy[lang].events;

  return (
    <header className="max-w-3xl" lang={isEn ? 'en' : 'mr'}>
      <Kicker>{copy.kicker}</Kicker>
      <h1 className="mt-1 font-display text-4xl font-bold text-maroon">
        {copy.title}
      </h1>
      <p className="mt-3 text-lg text-charcoal-soft">
        {copy.desc}
      </p>
    </header>
  );
}
