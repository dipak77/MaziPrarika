'use client';

import Link from 'next/link';

import { EPHEMERIS_VERSION } from '@mazi/panchang';
import { useLanguage } from '@/context/language-context';

export function SiteFooter() {
  const { isEn } = useLanguage();

  const trustSeals = isEn
    ? [
        { icon: '⚖️', title: 'Double-Entry Ledger', desc: 'Zero-balance financial tracking for every transaction' },
        { icon: '🌙', title: 'Surya Siddhanta Panchang', desc: 'Accurate tithi & muhurat calculated to local sunrise' },
        { icon: '🖨️', title: '3mm Bleed Guarantee', desc: 'CMYK-safe precision, exact match to screen' },
        { icon: '🛡️', title: 'Secure Escrow', desc: 'Vendor payout released upon verified milestone delivery' },
      ]
    : [
        { icon: '⚖️', title: 'दुहेरी नोंदणी लेजर', desc: 'पैशाची प्रत्येक देवाणघेवाण शून्य-समतोल' },
        { icon: '🌙', title: 'सूर्यसिद्धांत पंचांग', desc: 'स्थानिक सूर्योदयानुसार अचूक तिथी व मुहूर्त' },
        { icon: '🖨️', title: '३ मिमी ब्लीड हमी', desc: 'CMYK-सुरक्षित, स्क्रीनप्रमाणेच छपाई' },
        { icon: '🛡️', title: 'सुरक्षित एस्क्रो', desc: 'काम पूर्ण झाल्यावर विक्रेत्याला थेट सेटलमेंट' },
      ];

  const columns = isEn
    ? [
        {
          title: 'Create & Design',
          links: [
            { href: '/create', label: 'AI Smart Setup' },
            { href: '/studio/patil-patil-vivah-2027/invitation', label: 'Invitation Studio (WYSIWYP)' },
            { href: '/studio/patil-patil-vivah-2027', label: 'Event Workspace' },
            { href: '/events', label: 'Public Sample Cards' },
          ],
        },
        {
          title: 'Find & Book',
          links: [
            { href: '/vendors', label: 'Maharashtra Vendors' },
            { href: '/vendors?category=venue&city=पुणे', label: 'Marriage Halls & Lawns' },
            { href: '/vendors?category=photographer&city=पुणे', label: 'Photographers & Cinema' },
            { href: '/panchang', label: 'Panchang, Tithi & Choghadiya' },
          ],
        },
        {
          title: 'Management & Control',
          links: [
            { href: '/vendor', label: 'Vendor Operating Desk' },
            { href: '/vendor/leads/lead_2', label: 'Quotes & Bookings Manager' },
            { href: '/admin', label: 'Marketplace & Ledger Health' },
            { href: '/api/health', label: 'System Status & Version' },
          ],
        },
      ]
    : [
        {
          title: 'तयार करा',
          links: [
            { href: '/create', label: 'AI स्मार्ट सेटअप' },
            { href: '/studio/patil-patil-vivah-2027/invitation', label: 'पत्रिका स्टुडिओ (WYSIWYP)' },
            { href: '/studio/patil-patil-vivah-2027', label: 'कार्यक्रम वर्कस्पेस' },
            { href: '/events', label: 'सार्वजनिक नमुना पत्रिका' },
          ],
        },
        {
          title: 'शोधा व बुक करा',
          links: [
            { href: '/vendors', label: 'महाराष्ट्रीयन विक्रेते' },
            { href: '/vendors?category=venue&city=पुणे', label: 'मंगल कार्यालय व हॉल' },
            { href: '/vendors?category=photographer&city=पुणे', label: 'फोटोग्राफर व सिनेमॅटोग्राफी' },
            { href: '/panchang', label: 'पंचांग, तिथी व चौघडिया' },
          ],
        },
        {
          title: 'व्यवस्थापन व नियंत्रण',
          links: [
            { href: '/vendor', label: 'विक्रेता ऑपरेटिंग डेस्क' },
            { href: '/vendor/leads/lead_2', label: 'थेट कोट व बुकिंग व्यवस्थापक' },
            { href: '/admin', label: 'मार्केटप्लेस व लेजर आरोग्य' },
            { href: '/api/health', label: 'सिस्टम स्थिती व व्हर्जन' },
          ],
        },
      ];

  return (
    <footer className="relative mt-28 border-t border-gold/40 bg-linear-to-b from-ivory-deep via-ivory to-ivory-deep text-charcoal">
      <div aria-hidden className="paithani-edge absolute inset-x-0 top-0 h-2 opacity-80" />

      {/* Trust Guarantee Band */}
      <div className="border-b border-gold/25 bg-ivory/60 py-8 backdrop-blur-xs">
        <div className="shell grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trustSeals.map((seal) => (
            <div key={seal.title} className="flex items-start gap-3">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-lg border border-gold/30">
                {seal.icon}
              </span>
              <div>
                <h4 className="text-xs font-bold text-maroon">{seal.title}</h4>
                <p className="mt-0.5 text-xs text-charcoal-muted leading-tight">{seal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-gold/25 py-4">
        <div className="shell flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          <p className="text-xs font-bold text-maroon">
            {isEn ? 'For Partners & Vendors' : 'भागीदार व व्हेंडरांसाठी'}
          </p>
          <p className="text-xs text-charcoal-muted">
            {isEn
              ? 'WYSIWYP Proofing · 60 FPS Editor · Double-Entry Ledger'
              : 'WYSIWYP प्रूफिंग · ६० FPS एडिटर · दुहेरी-नोंदणी लेजर'}
          </p>
          <Link href="/api/health" className="inline-flex min-h-[44px] items-center rounded-full border border-gold/35 px-3.5 text-xs font-bold text-maroon transition hover:text-gold-deep">
            {isEn ? 'System Status →' : 'सिस्टम स्थिती →'}
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-maroon text-gold-shimmer shadow-xs">
              <span className="font-script text-xl leading-none">मा</span>
            </span>
            <span className="font-display text-xl font-bold text-maroon">माझी पत्रिका</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-charcoal-soft leading-relaxed">
            {isEn
              ? 'Where Marathi culture meets cutting-edge technology — create invitations, find muhurats, allocate budgets, and manage vendors all in one unified workspace.'
              : 'मराठी संस्कृती आणि आधुनिक तंत्रज्ञानाचा संगम — पत्रिका तयार करा, मुहूर्त शोधा, बजेट सांभाळा, पाहुणे व विक्रेते एकाच जोडलेल्या वर्कस्पेसमध्ये नियंत्रित करा.'}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-ivory px-3.5 py-1 text-xs font-medium text-gold-deep shadow-2xs">
            <span>{isEn ? `Panchang Engine ${EPHEMERIS_VERSION}` : `पंचांग इंजिन ${EPHEMERIS_VERSION}`}</span>
            <span>•</span>
            <span>{isEn ? 'Built for Maharashtra' : 'महाराष्ट्र निर्मित'}</span>
            <span aria-hidden="true">🇮🇳</span>
          </div>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-maroon">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-charcoal-soft transition hover:text-maroon focus-visible:ring-1 focus-visible:ring-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-gold/25 py-6">
        <div className="shell flex flex-wrap items-center justify-between gap-4 text-xs text-charcoal-muted">
          <p>
            {isEn
              ? '© 2026 Mazi Patrika. All rights reserved. Precision astronomical calculations per Surya Siddhanta.'
              : '© २०२६ माझी पत्रिका. सर्व हक्क राखीव. सूर्यसिद्धांत पंचांग गणितावर आधारित.'}
          </p>
          <p className="flex items-center gap-4">
            <Link href="/robots.txt" className="hover:text-maroon">Robots</Link>
            <Link href="/sitemap.xml" className="hover:text-maroon">Sitemap</Link>
            <Link href="/api/health" className="hover:text-maroon">Health</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
