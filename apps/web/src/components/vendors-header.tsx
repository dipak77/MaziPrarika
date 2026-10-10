'use client';

import { PageBanner } from '@/components/page-banner';
import { useLanguage } from '@/context/language-context';
import { toDevanagariDigits } from '@mazi/marathi';

interface VendorsHeaderProps {
  city: string;
  count: number;
}

export function VendorsHeader({ city, count }: VendorsHeaderProps) {
  const { isEn, isHi } = useLanguage();

  return (
    <PageBanner
      lang={isHi ? 'hi' : isEn ? 'en' : 'mr'}
      kicker={isEn ? 'Marketplace' : 'मार्केटप्लेस'}
      title={isEn ? 'Find Verified Vendors' : 'विक्रेते शोधा'}
      description={
        isEn
          ? `${count} verified vendors in and around ${city} — every profile verified with track records, and sponsored listings clearly marked.`
          : `${toDevanagariDigits(count)} विक्रेते ${city} आणि परिसरात — प्रत्येक क्रमांक पडताळलेल्या पुराव्यावर, आणि प्रायोजित निकाल नेहमी स्पष्टपणे चिन्हांकित.`
      }
    />
  );
}
