'use client';

import { Chip, Eyebrow } from "@/components/ui";
import { useLanguage } from "@/context/language-context";

export function ConsoleHeader() {
  const { isEn } = useLanguage();

  return (
    <header className="flex flex-wrap items-end justify-between gap-4" lang={isEn ? 'en' : 'mr'}>
      <div>
        <Eyebrow>{isEn ? 'Platform Health & Ops' : 'प्लॅटफॉर्म आरोग्य व ऑप्स'}</Eyebrow>
        <h1 className="font-marathi-display mt-2 text-3xl font-bold text-maroon-900 sm:text-4xl">
          {isEn ? 'Super Admin Console' : 'सुपर ॲडमिन कन्सोल'}
        </h1>
        <p className="mt-1 text-[14px] text-ink-600">
          {isEn
            ? 'Marketplace health, north-star funnel, GMV, take-rate, and vendor SLA tracking in real-time.'
            : 'मार्केटप्लेस आरोग्य, नॉर्थ-स्टार फनेल, GMV, टेक-रेट आणि व्हेंडर SLA ट्रॅकर.'}
        </p>
      </div>
      <Chip tone="gold">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold-600" />
        {isEn ? 'Pune Edition · Live Sync' : 'पुणे आवृत्ती · लाइव्ह सिंक'}
      </Chip>
    </header>
  );
}
