'use client';

import { Kicker } from '@/components/ui';
import { useLanguage } from '@/context/language-context';
import { toDevanagariDigits } from '@mazi/marathi';

interface VendorsHeaderProps {
  city: string;
  count: number;
}

export function VendorsHeader({ city, count }: VendorsHeaderProps) {
  const { isEn } = useLanguage();

  return (
    <header className="max-w-3xl" lang={isEn ? 'en' : 'mr'}>
      <Kicker>{isEn ? 'Marketplace' : 'मार्केटप्लेस'}</Kicker>
      <h1 className="mt-2 font-display text-4xl font-bold text-maroon">
        {isEn ? 'Find Verified Vendors' : 'विक्रेते शोधा'}
      </h1>
      <p className="mt-3 text-lg text-charcoal-soft">
        {isEn
          ? `${count} verified vendors in and around ${city} — every profile verified with track records, and sponsored listings clearly marked.`
          : `${toDevanagariDigits(count)} विक्रेते ${city} आणि परिसरात — प्रत्येक क्रमांक पडताळलेल्या पुराव्यावर, आणि प्रायोजित निकाल नेहमी स्पष्टपणे चिन्हांकित.`}
      </p>
    </header>
  );
}
