'use client';

import { PageBanner } from '@/components/page-banner';
import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

export function EventsHeader() {
  const { lang, isEn, isHi } = useLanguage();
  const copy = uiCopy[lang].events;

  return (
    <PageBanner
      lang={isHi ? 'hi' : isEn ? 'en' : 'mr'}
      kicker={copy.kicker}
      title={copy.title}
      description={copy.desc}
    />
  );
}
