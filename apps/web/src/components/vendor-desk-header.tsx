'use client';

import Link from 'next/link';
import { Kicker } from '@/components/ui';
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
  const { isEn } = useLanguage();

  return (
    <header className="flex flex-wrap items-end justify-between gap-6" lang={isEn ? 'en' : 'mr'}>
      <div>
        <Kicker>Vendor OS</Kicker>
        <h1 className="mt-1 font-display text-4xl font-bold text-maroon">{vendorName}</h1>
        <p className="mt-2 text-charcoal-soft">
          {city} • {isEn ? `Plan: ${plan}` : `योजना ${plan}`} • {isEn ? `Trust Score ${organicScore}/100` : `सेंद्रिय गुण ${toDevanagariDigits(organicScore)}/१००`}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/vendors/${vendorId}`} className="btn-base btn-outline px-4 text-sm">
          {isEn ? 'Public Profile' : 'सार्वजनिक प्रोफाइल'}
        </Link>
        <Link href="/vendors" className="btn-base btn-maroon px-4 text-sm">
          {isEn ? 'Where Inquiries Originate' : 'नवीन विनंत्या कोठून येतात?'}
        </Link>
      </div>
    </header>
  );
}
