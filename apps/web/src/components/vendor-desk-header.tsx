'use client';

import Link from 'next/link';
import { PageBanner } from '@/components/page-banner';
import { useLanguage } from '@/context/language-context';
import { toDevanagariDigits } from '@mazi/marathi';

interface VendorDeskHeaderProps {
  vendorName: string;
  vendorId: string;
  city: string;
  plan: string;
  organicScore: number;
}

export function VendorDeskHeader({
  vendorName,
  vendorId,
  city,
  plan,
  organicScore,
}: VendorDeskHeaderProps) {
  const { isEn, isHi } = useLanguage();

  return (
    <PageBanner
      lang={isHi ? 'hi' : isEn ? 'en' : 'mr'}
      kicker="Vendor OS"
      title={vendorName}
      description={`${city} • ${isEn ? `Plan: ${plan}` : `योजना ${plan}`} • ${isEn ? `Trust Score ${organicScore}/100` : `सेंद्रिय गुण ${toDevanagariDigits(organicScore)}/१००`}`}
      actions={
        <>
        <Link href={`/vendors/${vendorId}`} className="btn-base btn-outline px-4 text-sm">
          {isEn ? 'Public Profile' : 'सार्वजनिक प्रोफाइल'}
        </Link>
        <Link href="/vendors" className="btn-base btn-maroon px-4 text-sm">
          {isEn ? 'Where Inquiries Originate' : 'नवीन विनंत्या कोठून येतात?'}
        </Link>
        </>
      }
    />
  );
}
