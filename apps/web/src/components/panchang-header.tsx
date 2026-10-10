'use client';

import { PageBanner } from '@/components/page-banner';
import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

export function PanchangHeader() {
  const { lang, isEn, isHi } = useLanguage();
  const copy = uiCopy[lang].panchang;

  return (
    <PageBanner
      lang={isHi ? 'hi' : isEn ? 'en' : 'mr'}
      kicker={copy.kicker}
      title={copy.title}
      description={copy.desc}
    />
  );
}
