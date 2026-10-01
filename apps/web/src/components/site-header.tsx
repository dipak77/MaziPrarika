'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LangToggle } from '@/components/lang-toggle';
import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';
import { useEffect, useRef, useState, useTransition } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Inline Icon System (Crisp, High-Performance, Zero-Dependency)
═══════════════════════════════════════════════════════════════ */
function I({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    sparkle: <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zM19 15l.9 2.6L22.5 18l-2.6.9L19 21.5l-.9-2.6L15.5 18l2.6-.4L19 15z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 010 7M18.5 14.5c2 .8 3 2.7 3 5.5" /></>,
    store: <><path d="M4 8l1.5-4h13L20 8M4 8v11a1 1 0 001 1h14a1 1 0 001-1V8M4 8h16M9 20v-6h6v6" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h10" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
    bell: <><path d="M18 9a6 6 0 10-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9zM10 20a2.2 2.2 0 004 0" /></>,
    chevron: <path d="M6 9l6 6 6-6" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    video: <><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="M15.5 10.5l6-3.5v10l-6-3.5" /></>,
    doc: <><path d="M7 2.5h7l4.5 4.5v14a1 1 0 01-1 1H7a1 1 0 01-1-1v-17a1 1 0 011-1z" /><path d="M14 2.5V7h4.5M9 12h6M9 16h6" /></>,
    wand: <path d="M15 4V2M15 10V8M11 6H9M21 6h-2M17.5 3.5l-1 1M17.5 8.5l-1-1M12.5 8.5L3 18l3 3 9.5-9.5-3-3z" />,
    crown: <path d="M3 17l-1-9 5.5 4L12 5l4.5 7L22 8l-1 9H3zM3 20h18" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" /></>,
    camera: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
    utensils: <path d="M18 2v6a3 3 0 01-3 3h-1v11h-2V11H7a3 3 0 01-3-3V2h2v6a1 1 0 001 1h1V2h2v7h1a1 1 0 001-1V2h2z" />,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>,
    flower: <><circle cx="12" cy="12" r="3" /><path d="M12 3a3 3 0 00-3 3c0 2 3 5 3 5s3-3 3-5a3 3 0 00-3-3zM12 21a3 3 0 003-3c0-2-3-5-3-5s-3 3-3 5a3 3 0 003 3zM3 12a3 3 0 003 3c2 0 5-3 5-3s-3-3-5-3a3 3 0 00-3 3zM21 12a3 3 0 00-3-3c-2 0-5 3-5 3s3 3 5 3a3 3 0 003-3z" /></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    arrowUpRight: <path d="M7 17L17 7M7 7h10v10" />,
    ring: <><circle cx="12" cy="14" r="6.5" /><path d="M12 2l2.5 3.5h-5L12 2z" fill="currentColor" opacity="0.9" /></>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    idCard: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><line x1="14" y1="9" x2="18" y2="9" /><line x1="14" y1="13" x2="18" y2="13" /><line x1="6" y1="16" x2="18" y2="16" /></>,
    palette: <><circle cx="13.5" cy="6.5" r=".7" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".7" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".7" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".7" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-8.6-10-8.6z" /></>,
    cricket: <><circle cx="16" cy="8" r="4" /><path d="M4 20l8-8M3 21l2-2" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sub-level Definitions for Multi-Category Navigation
═══════════════════════════════════════════════════════════════ */
export type IconColor = 'violet' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'slate';

export interface SubItem {
  icon: string;
  badge?: string;
  color?: IconColor;
  href: string;
  target?: string;
  en: string;
  mr: string;
  hi: string;
  enD: string;
  mrD: string;
  hiD: string;
}

export interface NavColumn {
  titleEn: string;
  titleMr: string;
  titleHi: string;
  href?: string;
  items: SubItem[];
}

export interface NavSection {
  id: string;
  href: string;
  icon?: string;
  labelEn: string;
  labelMr: string;
  labelHi: string;
  badge?: string;
  badgeVariant?: 'gold' | 'maroon' | 'leaf';
  columns?: NavColumn[];
  items?: SubItem[];
  footer?: {
    bannerHighlightEn?: string;
    bannerHighlightMr?: string;
    bannerHighlightHi?: string;
    bannerEn: string;
    bannerMr: string;
    bannerHi: string;
    ctaEn: string;
    ctaMr: string;
    ctaHi: string;
    ctaHref: string;
    secondaryLinks?: {
      en: string;
      mr: string;
      hi: string;
      href: string;
    }[];
  };
}

export const ICON_COLOR_STYLES: Record<IconColor, string> = {
  violet: 'bg-violet-50 text-violet-600 border border-violet-200/70 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
  indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200/70 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
  emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
  rose: 'bg-rose-50 text-rose-600 border border-rose-200/70 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
  blue: 'bg-sky-50 text-sky-600 border border-sky-200/70 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
  slate: 'bg-slate-100 text-slate-800 border border-slate-200/70 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900',
};

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'studio',
    href: '/studio',
    icon: 'sparkle',
    labelEn: 'Studio',
    labelMr: 'स्टुडिओ',
    labelHi: 'स्टूडियो',
    columns: [
      {
        titleEn: 'Design & Canvas Studios',
        titleMr: 'डिझाइन व कॅनव्हास स्टुडिओ',
        titleHi: 'डिज़ाइन व कैनवास स्टूडियो',
        href: '/studio',
        items: [
          {
            icon: 'sparkle',
            color: 'violet',
            badge: 'NEW TAB ⤢',
            href: '/studio/editor',
            target: '_blank',
            en: 'Canva Pro Studio (Full View)',
            mr: 'कॅनव्हा प्रो स्टुडिओ (फुल स्क्रीन)',
            hi: 'कैनवा प्रो स्टूडियो (फुल स्क्रीन)',
            enD: '100% full screen canvas workspace with zero distraction',
            mrD: '१००% संपूर्ण स्क्रीन कॅनव्हास, अमर्याद जागा व टूल्स',
            hiD: '100% फुल स्क्रीन कैनवास, संपूर्ण स्पेस व टूल्स',
          },
          {
            icon: 'wand',
            color: 'violet',
            badge: 'PRO',
            href: '/studio?mode=pro-editor',
            en: 'Baroque Pro Editor',
            mr: 'बारोक प्रो एडिटर',
            hi: 'बारोक प्रो एडिटर',
            enD: 'Pixel-perfect custom canvas design with Devanagari fonts',
            mrD: 'पिक्सेल-परफेक्ट कस्टम कॅनव्हास डिझाइन व फॉन्ट्स',
            hiD: 'पिक्सेल-परफेक्ट कस्टम कैनवास डिज़ाइन व फॉन्ट्स',
          },
          {
            icon: 'sparkle',
            color: 'amber',
            badge: 'BETA',
            href: '/studio?mode=effects-lab',
            en: 'Effects Lab',
            mr: 'इफेक्ट्स लॅब',
            hi: 'इफेक्ट्स लैब',
            enD: 'Particles · Real-time gold dust · Glow shaders',
            mrD: 'पार्टिकल · सुवर्णकण · थेट ग्लो शेडर्स',
            hiD: 'पार्टिकल · स्वर्णकण · लाइव ग्लो शेडर्स',
          },
        ],
      },
      {
        titleEn: 'Card & Video Engines',
        titleMr: 'पत्रिका व व्हिडिओ इंजिन',
        titleHi: 'पत्रिका व वीडियो इंजन',
        href: '/studio?mode=video-studio',
        items: [
          {
            icon: 'video',
            color: 'rose',
            badge: 'NEW',
            href: '/studio?mode=video-studio',
            en: 'Video Studio',
            mr: 'व्हिडिओ स्टुडिओ',
            hi: 'वीडियो स्टूडियो',
            enD: 'Full HD MP4 export · Reels (9:16) & Status ready',
            mrD: 'फुल HD MP4 एक्सपोर्ट · रील्स व स्टेटस रेडी',
            hiD: 'फुल HD MP4 एक्सपोर्ट · रील्स व स्टेटस रेडी',
          },
          {
            icon: 'grid',
            color: 'emerald',
            badge: 'WYSIWYP',
            href: '/studio?mode=invitation',
            en: 'Classic Invitation Card',
            mr: 'पारंपरिक लग्नपत्रिका',
            hi: 'पारंपरिक विवाह पत्रिका',
            enD: 'Zero print error · 3mm full-bleed CMYK safe export',
            mrD: 'छपाईत शून्य चूक · ३ मिमी फुल ब्लीड एक्सपोर्ट',
            hiD: 'छपाई में शून्य त्रुटि · 3 मिमी फुल ब्लीड एक्सपोर्ट',
          },
          {
            icon: 'sparkle',
            color: 'indigo',
            badge: 'AI MAGIC',
            href: '/create',
            en: 'AI Smart Setup',
            mr: 'AI स्मार्ट सेटअप',
            hi: 'AI स्मार्ट सेटअप',
            enD: 'Plan full wedding card suite in 1 sentence with AI',
            mrD: 'एका वाक्यात संपूर्ण लग्नपत्रिका संच AI द्वारे तयार',
            hiD: 'एक वाक्य में संपूर्ण विवाह पत्रिका AI द्वारा तैयार',
          },
        ],
      },
      {
        titleEn: 'Templates & Catalog',
        titleMr: 'टेम्पलेट्स व कॅटलॉग',
        titleHi: 'टेम्पलेट्स व कैटलॉग',
        href: '/studio',
        items: [
          {
            icon: 'crown',
            color: 'amber',
            badge: '५०+',
            href: '/studio',
            en: 'All Event Studio',
            mr: 'सर्व सोहळा स्टुडिओ',
            hi: 'सभी इवेंट स्टूडियो',
            enD: '60 FPS live animated royal Devanagari templates',
            mrD: '६० FPS थेट ॲनिमेटेड राजेशाही टेम्पलेट्स',
            hiD: '60 FPS लाइव एनिमेटेड शाही टेम्पलेट्स',
          },
          {
            icon: 'doc',
            color: 'rose',
            badge: 'POPULAR',
            href: '/biodata',
            en: 'Marriage Biodata',
            mr: 'विवाह बायोडाटा',
            hi: 'विवाह बायोडाटा',
            enD: '8 Royal styles · 1-click WhatsApp PDF download',
            mrD: '८ राजेशाही शैली · १-क्लिक व्हॉट्सअॅप PDF',
            hiD: '८ शाही शैलियाँ · १-क्लिक व्हाट्सएप PDF',
          },
          {
            icon: 'calendar',
            color: 'blue',
            badge: 'PUBLIC',
            href: '/events',
            en: 'Public Event Cards',
            mr: 'सार्वजनिक सोहळा पत्रिका',
            hi: 'सार्वजनिक उत्सव पत्रिका',
            enD: 'Discover community celebrations across Maharashtra',
            mrD: 'महाराष्ट्रातील कुटुंबांनी शेअर केलेल्या पत्रिका',
            hiD: 'महाराष्ट्र भर में साझा की गई उत्सव पत्रिकाएं',
          },
        ],
      },
    ],
    footer: {
      bannerHighlightEn: '✨ Maha Canvas OS',
      bannerHighlightMr: '✨ महा कॅनव्हास OS',
      bannerHighlightHi: '✨ महा कैनवास OS',
      bannerEn: '50+ Artisan templates · Trilingual typing · Print & Video ready',
      bannerMr: '५०+ हस्तकला टेम्पलेट्स · त्रिभाषिक टायपिंग · प्रिंट व व्हिडिओ रेडी',
      bannerHi: '५०+ हस्तकला टेम्पलेट्स · त्रिभाषी टाइपिंग · प्रिंट व वीडियो रेडी',
      ctaEn: 'Open Studio',
      ctaMr: 'स्टुडिओ उघडा',
      ctaHi: 'स्टूडियो खोलें',
      ctaHref: '/studio',
      secondaryLinks: [
        { en: 'Free Templates', mr: 'मोफत टेम्पलेट्स', hi: 'मुफ्त टेम्पलेट्स', href: '/studio' },
        { en: 'Video Studio', mr: 'व्हिडिओ स्टुडिओ', hi: 'वीडियो स्टूडियो', href: '/studio?mode=video-studio' },
        { en: 'Print Proofs', mr: 'प्रिंट प्रूफ्स', hi: 'प्रिंट प्रूफ्स', href: '/studio?mode=invitation' },
      ],
    },
  },
  {
    id: 'wedding',
    href: '/studio?category=wedding',
    icon: 'ring',
    labelEn: 'Wedding Cards',
    labelMr: 'विवाह पत्रिका',
    labelHi: 'विवाह पत्रिका',
  },
  {
    id: 'biodata',
    href: '/biodata',
    icon: 'doc',
    labelEn: 'Biodata',
    labelMr: 'बायोडेटा',
    labelHi: 'बायोडाटा',
    columns: [
      {
        titleEn: 'Royal Styles & Full View',
        titleMr: 'राजेशाही शैली व फुल स्क्रीन',
        titleHi: 'शाही शैलियाँ व फुल स्क्रीन',
        href: '/biodata',
        items: [
          {
            icon: 'sparkle',
            color: 'violet',
            badge: 'NEW TAB ⤢',
            href: '/biodata/editor',
            target: '_blank',
            en: 'Biodata Maker (Full View)',
            mr: 'विवाह बायोडाटा (फुल स्क्रीन)',
            hi: 'विवाह बायोडाटा (फुल स्क्रीन)',
            enD: '100% full view workspace for distraction-free editing',
            mrD: 'संपूर्ण स्क्रीन जागेत बायोडाटा बनवा व प्रिंट करा',
            hiD: 'संपूर्ण स्क्रीन में बायोडाटा बनाएँ व प्रिंट करें',
          },
          {
            icon: 'crown',
            color: 'amber',
            badge: '८ STYLES',
            href: '/biodata#biodata-live',
            en: 'All 8 Royal Templates',
            mr: 'सर्व ८ राजेशाही टेम्पलेट्स',
            hi: 'सभी ८ शाही टेम्पलेट्स',
            enD: 'Shahi, Rajmahal, Damask, Heritage & Peshwa styles',
            mrD: 'शाही, राजमहाल, दमास्क, हेरिटेज व पेशवा शैली',
            hiD: 'शाही, राजमहल, दमास्क, हेरिटेज व पेशवा शैली',
          },
          {
            icon: 'sparkle',
            color: 'emerald',
            badge: 'INSTANT',
            href: '/biodata',
            en: '1-Click WhatsApp & PDF',
            mr: '१-क्लिक व्हॉट्सअॅप व PDF',
            hi: '१-क्लिक व्हाट्सएप व PDF',
            enD: 'Instant HD download & direct family share',
            mrD: 'थेट HD डाउनलोड व कुटुंबांना व्हॉट्सअॅप शेअर',
            hiD: 'तुरंत HD डाउनलोड व सीधे व्हाट्सएप शेयर',
          },
        ],
      },
      {
        titleEn: 'Profile Types',
        titleMr: 'बायोडाटा प्रकार',
        titleHi: 'बायोडाटा प्रकार',
        href: '/biodata',
        items: [
          {
            icon: 'users',
            color: 'blue',
            badge: 'वर',
            href: '/biodata?profile=groom',
            en: 'Groom Biodata Maker',
            mr: 'वर बायोडाटा मेकर',
            hi: 'वर बायोडाटा मेकर',
            enD: 'Education, profession, kul, gotra & family details',
            mrD: 'शिक्षण, नोकरी/व्यवसाय, कुल, गोत्र व कौटुंबिक माहिती',
            hiD: 'शिक्षा, व्यवसाय, कुल, गोत्र व पारिवारिक विवरण',
          },
          {
            icon: 'heart',
            color: 'rose',
            badge: 'वधू',
            href: '/biodata?profile=bride',
            en: 'Bride Biodata Maker',
            mr: 'वधू बायोडाटा मेकर',
            hi: 'वधू बायोडाटा मेकर',
            enD: 'Graceful typography, horoscope placement & photo framing',
            mrD: 'सुबक अक्षर, पत्रिका/कुंडली व सुंदर फोटो रचना',
            hiD: 'सुरुचिपूर्ण अक्षर, कुंडली व फोटो संयोजन',
          },
          {
            icon: 'sun',
            color: 'amber',
            badge: 'कुंडली',
            href: '/biodata',
            en: 'Horoscope & Kundali Format',
            mr: 'कुंडली व पत्रिका मांडणी',
            hi: 'कुंडली प्रारूप व विवरण',
            enD: 'Accurate Rashee, Nakshatra, Gan & Nadi formatting',
            mrD: 'रास, नक्षत्र, गण, नाडी व देवक अचूक मांडणी',
            hiD: 'राशि, नक्षत्र, गण, नाड़ी व गोत्र की सटीक मांडणी',
          },
        ],
      },
      {
        titleEn: 'Formats & Sharing',
        titleMr: 'फॉर्मेट्स व शेअरिंग',
        titleHi: 'फॉर्मेट व शेयरिंग',
        href: '/biodata',
        items: [
          {
            icon: 'doc',
            color: 'violet',
            badge: 'HD PRINT',
            href: '/biodata',
            en: 'High-Res Print PDF',
            mr: 'हाय-रिझोल्यूशन प्रिंट PDF',
            hi: 'हाई-रिज़ॉल्यूशन प्रिंट PDF',
            enD: 'Vector-crisp A4 & letter format with gold border trims',
            mrD: 'वेक्टर-क्रिस्प A4 फॉरमॅट व सुवर्ण बॉर्डर फिनिश',
            hiD: 'वेक्टर-क्रिस्प A4 फॉर्मेट व गोल्ड बॉर्डर फिनिश',
          },
          {
            icon: 'video',
            color: 'emerald',
            badge: '9:16',
            href: '/biodata',
            en: 'WhatsApp Status Story',
            mr: 'व्हॉट्सअॅप स्टेटस स्टोरी',
            hi: 'व्हाट्सएप स्टेटस स्टोरी',
            enD: 'Vertical mobile-optimized single-page presentation',
            mrD: 'मोबाईलसाठी अनुकूल ९:१६ व्हर्टिकल लेआउट',
            hiD: 'मोबाइल हेतु अनुकूल 9:16 वर्टिकल लेआउट',
          },
          {
            icon: 'shield',
            color: 'blue',
            badge: 'SECURE',
            href: '/biodata',
            en: 'Family Review Link',
            mr: 'कौटुंबिक पुनरावलोकन लिंक',
            hi: 'पारिवारिक समीक्षा लिंक',
            enD: 'Secure private share link for immediate elder review',
            mrD: 'कुटुंबातील ज्येष्ठांच्या मंजुरीसाठी खाजगी लिंक',
            hiD: 'परिवार के बड़ों के अनुमोदन हेतु निजी लिंक',
          },
        ],
      },
    ],
    footer: {
      bannerHighlightEn: '👑 Authentic Marathi Typography',
      bannerHighlightMr: '👑 अस्सल मराठी फॉन्ट मांडणी',
      bannerHighlightHi: '👑 प्रामाणिक मराठी फॉन्ट प्रारूप',
      bannerEn: 'Specially designed for Maharashtrian families with authentic Devanagari typography',
      bannerMr: 'महाराष्ट्रातील कुटुंबांसाठी पारंपरिक पद्धतीनुसार विशेष निर्मिती',
      bannerHi: 'पारंपरिक पद्धति के अनुसार विशेष रूप से निर्मित',
      ctaEn: 'Create Biodata',
      ctaMr: 'बायोडाटा बनवा',
      ctaHi: 'बायोडाटा बनाएं',
      ctaHref: '/biodata',
      secondaryLinks: [
        { en: 'Groom Biodata', mr: 'वर बायोडाटा', hi: 'वर बायोडाटा', href: '/biodata?profile=groom' },
        { en: 'Bride Biodata', mr: 'वधू बायोडाटा', hi: 'वधू बायोडाटा', href: '/biodata?profile=bride' },
        { en: '8 Royal Styles', mr: '८ राजेशाही शैली', hi: '८ शाही शैलियाँ', href: '/biodata#biodata-live' },
      ],
    },
  },
  {
    id: 'create',
    href: '/create',
    icon: 'cricket',
    labelEn: 'Cricket',
    labelMr: 'क्रिकेटे',
    labelHi: 'क्रिकेट',
  },
  {
    id: 'panchang',
    href: '/panchang',
    icon: 'calendar',
    labelEn: 'Panchang',
    labelMr: 'पंचांग व मुहूर्त',
    labelHi: 'पंचांग व मुहूर्त',
    columns: [
      {
        titleEn: 'Daily Ephemeris',
        titleMr: 'दैनिक पंचांग व चौघडिया',
        titleHi: 'दैनिक पंचांग व चौघड़िया',
        href: '/panchang',
        items: [
          {
            icon: 'sun',
            color: 'amber',
            badge: 'TODAY',
            href: '/panchang',
            en: 'Live Daily Panchang',
            mr: 'दैनिक थेट पंचांग',
            hi: 'दैनिक लाइव पंचांग',
            enD: 'Tithi, Nakshatra, Choghadiya & local sunrise timing',
            mrD: 'तिथी, नक्षत्र, चौघडिया, राहुकाळ व शुभ योग',
            hiD: 'तिथि, नक्षत्र, चौघड़िया, राहुकाल व शुभ योग',
          },
          {
            icon: 'sparkle',
            color: 'emerald',
            badge: 'CHOGHADIYA',
            href: '/panchang',
            en: 'Live Choghadiya Slots',
            mr: 'थेट चौघडिया वेळापत्रक',
            hi: 'लाइव चौघड़िया समय',
            enD: 'Amrit, Shubh & Labh auspicious daytime & night slots',
            mrD: 'अमृत, शुभ, लाभ, चल या शुभ चौघडिया वेळा',
            hiD: 'अमृत, शुभ, लाभ, चर आदि शुभ चौघड़िया समय',
          },
          {
            icon: 'shield',
            color: 'rose',
            badge: 'ALERT',
            href: '/panchang',
            en: 'Rahu Kaal & Varjya Windows',
            mr: 'राहुकाळ व वर्ज्य वेळा',
            hi: 'राहुकाल व वर्ज्य समय',
            enD: 'Inauspicious intervals calculated for your exact district',
            mrD: 'जिल्ह्यानुसार अचूक राहुकाळ व टाळायच्या वेळा',
            hiD: 'जिले के अनुसार सटीक राहुकाल व अशुभ समय',
          },
        ],
      },
      {
        titleEn: 'Auspicious Muhurats',
        titleMr: 'शुभ मुहूर्त २०२६-२७',
        titleHi: 'शुभ मुहूर्त २०२६-२७',
        href: '/panchang?event=wedding',
        items: [
          {
            icon: 'heart',
            color: 'rose',
            badge: '२०२६-२७',
            href: '/panchang?event=wedding',
            en: 'Shubh Vivah Muhurat',
            mr: 'शुभ विवाह मुहूर्त २०२६-२७',
            hi: 'शुभ विवाह मुहूर्त २०२६-२७',
            enD: 'Surya Siddhanta astronomical calculations for wedding dates',
            mrD: 'सूर्यसिद्धांत पद्धतीवर आधारित बिनचूक लग्न मुहूर्त',
            hiD: 'सूर्यसिद्धांत पद्धति पर आधारित सटीक विवाह मुहूर्त',
          },
          {
            icon: 'home',
            color: 'violet',
            badge: 'VASTU',
            href: '/panchang?event=vastu',
            en: 'Gruha Pravesh & Vastu',
            mr: 'गृहप्रवेश व वास्तुशांती',
            hi: 'गृह प्रवेश व वास्तु शांति',
            enD: 'Auspicious dates for entering your new home',
            mrD: 'नवीन घरात पाऊल ठेवण्यासाठी सर्वोत्तम तिथी',
            hiD: 'नए घर में प्रवेश के लिए सर्वोत्तम शुभ तिथियां',
          },
          {
            icon: 'flower',
            color: 'blue',
            badge: 'SAMSKARA',
            href: '/panchang',
            en: 'Naming & Samskaras',
            mr: 'बारसे व मुंज मुहूर्त',
            hi: 'नामकरण व संस्कार मुहूर्त',
            enD: 'Namkaran, Mundan & Upanayan auspicious lagna timings',
            mrD: 'नामकरण, जावळ व उपनयन संस्कारांसाठी शुभ तिथी',
            hiD: 'नामकरण, मुंडन व उपनयन संस्कारों हेतु शुभ लग्न समय',
          },
        ],
      },
      {
        titleEn: 'Astronomical Engine',
        titleMr: 'खगोलीय इंजिन व सोहळे',
        titleHi: 'खगोलीय इंजन व उत्सव',
        href: '/panchang',
        items: [
          {
            icon: 'calendar',
            color: 'blue',
            badge: 'PUBLIC',
            href: '/events',
            en: 'Public Event Cards',
            mr: 'सार्वजनिक सोहळा पत्रिका',
            hi: 'सार्वजनिक उत्सव पत्रिका',
            enD: 'Discover community celebrations across Maharashtra',
            mrD: 'महाराष्ट्रातील कुटुंबांनी शेअर केलेल्या पत्रिका',
            hiD: 'महाराष्ट्र भर में साझा की गई उत्सव पत्रिकाएं',
          },
          {
            icon: 'compass',
            color: 'amber',
            badge: 'ASTRONOMY',
            href: '/panchang',
            en: 'Surya Siddhanta Ephemeris',
            mr: 'सूर्यसिद्धांत खगोलीय गणित',
            hi: 'सूर्यसिद्धांत खगोलीय गणना',
            enD: 'Micro-latitude calibrated calculations for 36 districts',
            mrD: 'महाराष्ट्रातील ३६ जिल्ह्यांसाठी सूक्ष्म अक्षांश-रेखांश अचूकता',
            hiD: 'महाराष्ट्र के ३६ जिलों हेतु सूक्ष्म अक्षांश-देशांतर सटीकता',
          },
          {
            icon: 'grid',
            color: 'emerald',
            badge: 'LIVE API',
            href: '/api/health',
            en: 'Ephemeris Engine Health',
            mr: 'पंचांग इंजिन स्थिती v2.4',
            hi: 'पंचांग इंजन स्थिति v2.4',
            enD: '99.99% uptime with planetary coordinates verification',
            mrD: '९९.९९% अपटाइम व अचूक ग्रहस्थिती पडताळणी',
            hiD: '99.99% अपटाइम व सटीक ग्रह स्थिति सत्यापन',
          },
        ],
      },
    ],
    footer: {
      bannerHighlightEn: '☀️ Traditional Surya Siddhanta',
      bannerHighlightMr: '☀️ सूर्यसिद्धांत खगोलीय गणित',
      bannerHighlightHi: '☀️ सूर्यसिद्धांत खगोलीय गणना',
      bannerEn: 'Astronomical calculation fine-tuned for Maharashtra city micro-coordinates',
      bannerMr: 'महाराष्ट्रातील शहरांनुसार सूक्ष्म अक्षांश-रेखांश व सूर्यसिद्धांत खगोलीय गणित',
      bannerHi: 'महाराष्ट्र के शहरों हेतु सूर्यसिद्धांत खगोलीय गणना पर आधारित प्रामाणिक पंचांग',
      ctaEn: 'View Full Panchang',
      ctaMr: 'संपूर्ण पंचांग पाहा',
      ctaHi: 'पूरा पंचांग देखें',
      ctaHref: '/panchang',
      secondaryLinks: [
        { en: 'Vivah Muhurat', mr: 'विवाह मुहूर्त', hi: 'विवाह मुहूर्त', href: '/panchang?event=wedding' },
        { en: 'Gruha Pravesh', mr: 'गृहप्रवेश', hi: 'गृह प्रवेश', href: '/panchang?event=vastu' },
        { en: 'Daily Choghadiya', mr: 'दैनिक चौघडिया', hi: 'दैनिक चौघड़िया', href: '/panchang' },
      ],
    },
  },
  {
    id: 'business',
    href: '/vendor-os',
    icon: 'briefcase',
    labelEn: 'Business OS',
    labelMr: 'बिझनेस OS',
    labelHi: 'बिजनेस OS',
    badge: 'NEW',
    badgeVariant: 'gold',
    columns: [
      {
        titleEn: 'Vendor Operating Desk',
        titleMr: 'व्हेंडर ऑपरेटिंग डेस्क',
        titleHi: 'विक्रेता ऑपरेटिंग डेस्क',
        href: '/vendor-os',
        items: [
          {
            icon: 'briefcase',
            color: 'violet',
            badge: 'DESK',
            href: '/vendor-os',
            en: 'Vendor Operating Desk',
            mr: 'व्हेंडर ऑपरेटिंग डेस्क',
            hi: 'विक्रेता ऑपरेटिंग डेस्क',
            enD: 'Lead pipeline, quotes, booking calendar & payouts',
            mrD: 'लीड्स फनेल, कोट्स, बुकिंग कॅलेंडर व पेमेंट्स',
            hiD: 'लीड पाइपलाइन, कोट्स, बुकिंग कैलेंडर व भुगतान',
          },
          {
            icon: 'grid',
            color: 'emerald',
            badge: 'LEDGER',
            href: '/vendor-os',
            en: 'Double-Entry Ledger',
            mr: 'दुहेरी-नोंदणी लेजर',
            hi: 'दोहरी प्रविष्टि बहीखाता',
            enD: 'Zero-balance financial tracking with milestone escrow',
            mrD: 'पैशाची प्रत्येक देवाणघेवाण शून्य-समतोल व सुरक्षित एस्क्रो',
            hiD: 'प्रत्येक लेन-देन शून्य-संतुलन व सुरक्षित एस्क्रो',
          },
          {
            icon: 'sparkle',
            color: 'blue',
            badge: 'CRM',
            href: '/vendor-os',
            en: 'Automated WhatsApp CRM',
            mr: 'स्वयंचलित व्हॉट्सअॅप CRM',
            hi: 'स्वचालित व्हाट्सएप CRM',
            enD: 'Instant customer quotes, follow-up alerts & payment links',
            mrD: 'ग्राहकांना थेट कोट्स, फॉलो-अप संदेश व पेमेंट लिंक्स',
            hiD: 'ग्राहकों को तुरंत कोट, फॉलो-अप संदेश व पेमेंट लिंक',
          },
        ],
      },
      {
        titleEn: 'Marketplace Admin',
        titleMr: 'प्लॅटफॉर्म ॲडमिन व नियंत्रण',
        titleHi: 'प्लेटफ़ॉर्म एडमिन व नियंत्रण',
        href: '/console',
        items: [
          {
            icon: 'grid',
            color: 'violet',
            badge: 'ADMIN',
            href: '/console',
            en: 'Admin & Metrics Console',
            mr: 'कन्सोल व प्लॅटफॉर्म मेट्रिक्स',
            hi: 'कंसोल व प्लेटफ़ॉर्म मेट्रिक्स',
            enD: 'GMV, take-rate, SLA tracker & governance ledger',
            mrD: 'GMV, व्हेंडर SLA ट्रॅकर व सुरक्षित खातेवही नियंत्रण',
            hiD: 'GMV, वेंडर SLA ट्रैकर व सुरक्षित बहीखाता नियंत्रण',
          },
          {
            icon: 'store',
            color: 'amber',
            badge: 'PORTAL',
            href: '/vendor',
            en: 'Vendor Partner Portal',
            mr: 'व्हेंडर पार्टनर पोर्टल',
            hi: 'विक्रेता पार्टनर पोर्टल',
            enD: 'Register new service, manage packages & staff',
            mrD: 'नवीन सेवा नोंदणी, पॅकेजेस व सहकाऱ्यांचे नियोजन',
            hiD: 'नई सेवा पंजीयन, पैकेज व सहकर्मियों का प्रबंधन',
          },
          {
            icon: 'sparkle',
            color: 'rose',
            badge: 'DAROMA',
            href: '/dashboard',
            en: 'Daroma Modern Dashboard',
            mr: 'डारोमा मॉडर्न डॅशबोर्ड',
            hi: 'डारोमा मॉडर्न डैशबोर्ड',
            enD: 'Midnight & violet SaaS studio analytics, accounting & timeline',
            mrD: 'मिडनाइट व व्हायोलेट स्टुडिओ अनालिटिक्स, अकाउंटिंग व टाइमलाइन',
            hiD: 'मिडनाइट व वायलेट स्टूडियो एनालिटिक्स, अकाउंटिंग व टाइमलाइन',
          },
        ],
      },
      {
        titleEn: 'Platform Tools',
        titleMr: 'प्लॅटफॉर्म टूल्स व हमी',
        titleHi: 'प्लेटफ़ॉर्म टूल्स व गारंटी',
        href: '/create',
        items: [
          {
            icon: 'sparkle',
            color: 'violet',
            badge: 'AI MAGIC',
            href: '/create',
            en: 'AI Celebration Planner',
            mr: 'AI सोहळा नियोजक',
            hi: 'AI उत्सव नियोजक',
            enD: 'Plan full wedding in 1 sentence with budget & guests',
            mrD: 'एका वाक्यात बजेट, पाहुणे व विक्रेत्यांसह संपूर्ण नियोजन',
            hiD: 'एक वाक्य में बजट, अतिथि व विक्रेताओं सहित संपूर्ण योजना',
          },
          {
            icon: 'doc',
            color: 'blue',
            badge: 'WYSIWYP',
            href: '/studio?mode=invitation',
            en: 'WYSIWYP Print Proofing',
            mr: 'WYSIWYP प्रिंट हमी',
            hi: 'WYSIWYP प्रिंट गारंटी',
            enD: 'What You See Is What You Print — zero error guarantee',
            mrD: 'स्क्रीनप्रमाणेच अचूक छपाई — शून्य चूक हमी',
            hiD: 'स्क्रीन के समान सटीक छपाई — शून्य त्रुटि गारंटी',
          },
          {
            icon: 'shield',
            color: 'emerald',
            badge: 'STATUS',
            href: '/api/health',
            en: 'System Status & Telemetry',
            mr: 'सिस्टम आरोग्य व व्हर्जन',
            hi: 'सिस्टम स्थिति व वर्शन',
            enD: 'Real-time uptime, API health & astronomical telemetry',
            mrD: 'थेट अपटाइम, API आरोग्य व खगोलीय टेलिमेट्री',
            hiD: 'लाइव अपटाइम, API स्थिति व खगोलीय टेलीमेट्री',
          },
        ],
      },
    ],
    footer: {
      bannerHighlightEn: '💼 Maha Commerce Engine',
      bannerHighlightMr: '💼 महा कॉमर्स इंजिन',
      bannerHighlightHi: '💼 महा कॉमर्स इंजन',
      bannerEn: 'Enterprise operating system for wedding entrepreneurs, venues & caterers',
      bannerMr: 'लग्नसोहळा व्यावसायिक, मंगल कार्यालये व कॅटरर्ससाठी आधुनिक ऑपरेटिंग सिस्टीम',
      bannerHi: 'विवाह उद्यमियों, मंगल कार्यालयों व कैटरर्स हेतु आधुनिक ऑपरेटिंग सिस्टम',
      ctaEn: 'Open Business Desk',
      ctaMr: 'व्हेंडर डेस्क उघडा',
      ctaHi: 'विक्रेता डेस्क खोलें',
      ctaHref: '/vendor-os',
      secondaryLinks: [
        { en: 'Admin Console', mr: 'कन्सोल', hi: 'कंसोल', href: '/console' },
        { en: 'Vendor Portal', mr: 'पार्टनर पोर्टल', hi: 'पार्टनर पोर्टल', href: '/vendor' },
        { en: 'Daroma SaaS', mr: 'डारोमा डॅशबोर्ड', hi: 'डारोमा डैशबोर्ड', href: '/dashboard' },
      ],
    },
  },
  {
    id: 'crm',
    href: '/console',
    icon: 'idCard',
    labelEn: 'CRM',
    labelMr: 'CRM',
    labelHi: 'CRM',
  },
];

/* Flattened search items for the ⌘K command palette */
const ALL_SEARCH_ITEMS: SubItem[] = NAV_SECTIONS.flatMap((sec) => {
  if (sec.columns && sec.columns.length > 0) {
    return sec.columns.flatMap((col) => col.items);
  }
  return sec.items ?? [];
});

/* ═══════════════════════════════════════════════════════════════
   SITE HEADER COMPONENT
═══════════════════════════════════════════════════════════════ */
export function SiteHeader() {
  const { lang, isEn, isHi } = useLanguage();
  const t = uiCopy[lang].header;
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('studio');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const dropdownLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Helper for active route matching ── */
  const isSectionActive = (href: string) => {
    const base = (href.split('?')[0] ?? '').split('#')[0] ?? '';
    if (base === '/') return pathname === '/';
    return pathname === base || pathname.startsWith(base + '/');
  };

  /* ── Safe hover handler with 320ms safety threshold ── */
  const handleTriggerEnter = (id: string) => {
    if (dropdownLeaveTimer.current) {
      clearTimeout(dropdownLeaveTimer.current);
      dropdownLeaveTimer.current = null;
    }
    setActiveDropdown(id);
  };

  const handleTriggerLeave = () => {
    dropdownLeaveTimer.current = setTimeout(() => {
      // If the user has explicitly clicked and pinned this dropdown, don't close on hover leave
      if (!pinnedDropdown) {
        setActiveDropdown(null);
      }
    }, 320);
  };

  const handleTogglePin = (id: string) => {
    if (pinnedDropdown === id) {
      setPinnedDropdown(null);
      setActiveDropdown(null);
    } else {
      setPinnedDropdown(id);
      setActiveDropdown(id);
    }
  };

  const handleCloseAll = () => {
    if (dropdownLeaveTimer.current) clearTimeout(dropdownLeaveTimer.current);
    setActiveDropdown(null);
    setPinnedDropdown(null);
    setSearchOpen(false);
    setDrawerOpen(false);
  };

  /* ── Scroll-aware elevation ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Body scroll lock for mobile drawer ── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  /* ── Global Keyboard Shortcuts: ⌘K, Escape ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
        setActiveDropdown(null);
        setPinnedDropdown(null);
        setDrawerOpen(false);
      }
      if (e.key === 'Escape') {
        handleCloseAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── Click-outside detection for desktop dropdowns and search ── */
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setActiveDropdown(null);
        setPinnedDropdown(null);
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, []);

  /* ── Filtered search results ── */
  const searchResults = ALL_SEARCH_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.en.toLowerCase().includes(q) ||
      item.mr.toLowerCase().includes(q) ||
      item.hi.toLowerCase().includes(q) ||
      item.enD.toLowerCase().includes(q) ||
      item.mrD.toLowerCase().includes(q)
    );
  });

  const getLabel = (sec: { labelEn: string; labelMr: string; labelHi: string }) =>
    isEn ? sec.labelEn : isHi ? sec.labelHi : sec.labelMr;

  const getItemLabel = (m: { en: string; mr: string; hi: string }) =>
    isEn ? m.en : isHi ? m.hi : m.mr;

  const getItemDesc = (m: { enD: string; mrD: string; hiD: string }) =>
    isEn ? m.enD : isHi ? m.hiD : m.mrD;

  const getColumnTitle = (col: { titleEn: string; titleMr: string; titleHi: string }) =>
    isEn ? col.titleEn : isHi ? col.titleHi : col.titleMr;

  const activeSection = NAV_SECTIONS.find((s) => s.id === (pinnedDropdown || activeDropdown));

  return (
    <>
      <style jsx global>{`
        @keyframes hdr-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes hdr-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes hdr-ping {
          0% { transform: scale(1); opacity: 0.85; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes hdr-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hdr-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes hdr-pop {
          from { opacity: 0; transform: translateY(-6px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hdr-glow {
          0%, 100% { box-shadow: 0 0 16px rgba(212, 175, 55, 0.32); }
          50% { box-shadow: 0 0 32px rgba(212, 175, 55, 0.65); }
        }
        @keyframes hdr-shine {
          0% { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(240%) skewX(-18deg); }
        }
        @keyframes hdr-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }

        .hdr-shimmer-text {
          background: linear-gradient(100deg, #dfb150 20%, #fff7da 45%, #e8c15c 55%, #dfb150 80%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hdr-shimmer 4.5s linear infinite;
        }

        .hdr-glass-panel {
          background: rgba(255, 253, 250, 0.98);
          backdrop-filter: blur(28px) saturate(1.15);
          -webkit-backdrop-filter: blur(28px) saturate(1.15);
        }

        @media (prefers-reduced-motion: reduce) {
          .hdr-shimmer-text, .hdr-anim {
            animation: none !important;
          }
        }
      `}</style>

      {/* Main Header Container with Reference for Click Outside */}
      <header
        ref={navContainerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 shadow-[0_16px_45px_-12px_rgba(14,13,38,0.08)] backdrop-blur-2xl'
            : 'bg-white/95 shadow-[0_8px_30px_-10px_rgba(14,13,38,0.04)] backdrop-blur-xl'
        } border-b border-gray-100`}
      >
        {/* ═══════════ 1 · AUSPICIOUS ROYAL MICRO-BAR ═══════════ */}
        <div className="relative z-30 bg-[#22061f] text-white/90 px-3 py-1.5 sm:px-6 border-b border-white/10 text-xs">
          {/* Subtle Golden Starlight Micro-Pattern - Isolated in its own overflow-hidden layer */}
          <div
            aria-hidden="true"
            className="hdr-anim pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12]"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #dfb150 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                animation: 'hdr-shimmer 20s linear infinite',
              }}
            />
          </div>

          <div className="relative mx-auto flex max-w-[1440px] w-full items-center justify-between gap-4">
            {/* Left: Shree Ganeshaya Namah with gold crown emblem */}
            <div className="flex items-center gap-2 text-amber-200/95 font-serif tracking-wider font-semibold text-[11px] sm:text-xs">
              <span className="text-amber-400 text-sm">👑</span>
              <span>॥ श्री गणेशाय नमः ॥</span>
            </div>

            {/* Center: Auspicious Tagline matching reference 100% */}
            <div className="hidden lg:block text-center font-medium tracking-wide text-[11.5px] text-[#f5e6d3]">
              <span>महाराष्ट्राची संस्कृती</span>
              <span className="mx-2 text-amber-400/80">•</span>
              <span>सुरेख डिझाईन परंपरा</span>
              <span className="mx-2 text-amber-400/80">•</span>
              <span>आपल्या सर्व शुभकार्यांसाठी खास आमंत्रण</span>
            </div>

            {/* Right: Quick Links & Language Toggle */}
            <div className="relative z-40 flex items-center gap-3.5 sm:gap-4 text-[11px] sm:text-[11.5px] text-white">
              <Link href="/about" className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-white transition">
                <I name="heart" className="h-3.5 w-3.5 text-rose-300" />
                <span>आमच्याबद्दल</span>
              </Link>
              <Link href="/contact" className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-white transition">
                <I name="phone" className="h-3.5 w-3.5 text-amber-300" />
                <span>संपर्क</span>
              </Link>
              <Link href="/faq" className="flex items-center gap-1.5 text-white/90 hover:text-white transition">
                <I name="help" className="h-3.5 w-3.5 text-sky-300" />
                <span>मदत केंद्र</span>
              </Link>

              <div className="h-3 w-px bg-white/20 hidden sm:block" />

              <LangToggle compact />
            </div>
          </div>
        </div>

        {/* ═══════════ 2 · MAIN NAVIGATION BAR ═══════════ */}
        <div
          className={`relative z-10 mx-auto flex max-w-[1440px] w-full items-center justify-between gap-2 px-3 sm:px-6 xl:px-8 transition-all duration-300 ${
            scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-[4.25rem]'
          }`}
        >
          {/* ── Brand Logo & Royal Identity ── */}
          <Link
            href="/"
            onClick={handleCloseAll}
            aria-label={isEn ? 'Mazi Patrika home' : 'माझी पत्रिका — मुख्यपृष्ठ'}
            className="group relative flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-2xl p-1 focus-visible:outline-none"
          >
            {/* Medallion with "मा" Script */}
            <div className="relative">
              <div className="grid size-10 sm:size-11 place-items-center rounded-full bg-gradient-to-br from-[#26042b] via-[#35083a] to-[#1c0320] text-white shadow-md ring-2 ring-purple-900/15 group-hover:scale-105 transition-transform duration-300">
                <span className="font-script text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                  मा
                </span>
              </div>
            </div>

            <div className="hidden leading-tight xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#1c081e] group-hover:text-purple-800 transition">
                  माझी पत्रिका
                </span>
                <span className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white px-2 py-0.5 text-[9.5px] font-black tracking-wider uppercase shadow-xs">
                  PRO
                </span>
              </div>
              <span className="block text-[9.5px] uppercase tracking-[0.2em] font-semibold text-[#877a73]">
                MAZI PATRIKA • MAHA OS
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Bar ── */}
          <nav aria-label={isEn ? 'Main navigation' : 'मुख्य नेव्हिगेशन'} className="hidden items-center gap-0.5 xl:gap-1 lg:flex shrink-0">
            {NAV_SECTIONS.map((sec) => {
              const active = isSectionActive(sec.href);
              const isOpen = (activeDropdown === sec.id) || (pinnedDropdown === sec.id);
              const hasDropdown = (sec.columns && sec.columns.length > 0) || (sec.items && sec.items.length > 0);

              return (
                <div
                  key={sec.id}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleTriggerEnter(sec.id)}
                  onMouseLeave={handleTriggerLeave}
                >
                  <div className="flex items-center">
                    {/* Primary Navigation Link */}
                    <Link
                      href={sec.href}
                      onClick={() => {
                        setActiveDropdown(null);
                        setPinnedDropdown(null);
                      }}
                      className={`relative flex items-center gap-1 rounded-xl px-1.5 xl:px-2 py-1.5 text-[12.5px] xl:text-[13px] font-semibold whitespace-nowrap transition focus-visible:outline-none ${
                        active
                          ? 'text-[#7c3aed] bg-purple-50/80 font-bold'
                          : 'text-[#1c081e] hover:bg-gray-100/70 hover:text-[#7c3aed]'
                      }`}
                    >
                      {sec.icon && (
                        <span className="text-amber-600 transition-colors group-hover:text-amber-500">
                          <I name={sec.icon} className="h-4 w-4" />
                        </span>
                      )}
                      <span>{getLabel(sec)}</span>
                      {sec.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black tracking-wider ${
                            sec.badgeVariant === 'leaf'
                              ? 'bg-[#10b981]/15 text-[#047857] border border-[#10b981]/30'
                              : sec.badgeVariant === 'gold'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                              : 'bg-violet-100 text-violet-700 border border-violet-200'
                          }`}
                        >
                          {sec.badge}
                        </span>
                      )}
                      {hasDropdown && (
                        <I name="chevron" className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-600' : ''}`} />
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* ── Right Cluster: Search, Notifications, Lang, Vendor, CTA, Mobile ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Icon Button */}
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setActiveDropdown(null);
                  setPinnedDropdown(null);
                }}
                aria-label={isEn ? 'Quick search' : 'शोधा'}
                className="grid size-9 sm:size-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-900 transition shadow-2xs"
              >
                <I name="search" className="h-4 w-4" />
              </button>

              {/* ⌘K Search Dropdown Panel */}
              {searchOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(420px,94vw)] overflow-hidden rounded-3xl border border-[#dfb150]/45 bg-[#fffdfa] shadow-[0_24px_70px_-16px_rgba(74,9,20,0.40)] backdrop-blur-2xl"
                  style={{ animation: 'hdr-fade-up 0.25s cubic-bezier(0.2,0.9,0.3,1.2) both' }}
                >
                  <div className="flex items-center gap-2.5 border-b border-[#dfb150]/30 bg-linear-to-r from-[#dfb150]/15 via-white to-transparent px-4 py-3.5">
                    <I name="search" className="h-4 w-4 text-[#8a6a2b]" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Search templates, biodata, vendors, panchang…'
                          : isHi
                          ? 'टेम्पलेट, बायोडाटा, विक्रेता, पंचांग खोजें…'
                          : 'टेम्पलेट्स, बायोडाटा, व्हेंडर्स, पंचांग शोधा…'
                      }
                      className="w-full bg-transparent text-sm font-medium text-[#1e1917] outline-none placeholder:text-[#7a6e68]/70"
                    />
                    <kbd className="hidden rounded-md border border-[#dfb150]/50 bg-[#f8f2e6] px-1.5 py-0.5 text-[10px] font-bold text-[#7a6e68] sm:block">
                      ESC
                    </kbd>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {searchResults.length === 0 ? (
                      <p className="px-3 py-8 text-center text-sm font-medium text-[#7a6e68]">
                        {isEn ? 'No matches found' : isHi ? 'कोई परिणाम नहीं मिला' : 'काही सापडले नाही'}
                      </p>
                    ) : (
                      searchResults.map((m, i) => (
                        <Link
                          key={m.href + m.en + i}
                          href={m.href}
                          target={m.target}
                          rel={m.target === '_blank' ? 'noopener noreferrer' : undefined}
                          onClick={handleCloseAll}
                          className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-[#dfb150]/15"
                          style={{ animation: `hdr-fade-up 0.3s ${i * 35}ms both` }}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-[#4a0914] to-[#2d050a] text-[#fffdfa] shadow-xs ring-1 ring-[#dfb150]/40">
                            <I name={m.icon} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-[#1e1917] group-hover:text-[#6b1d2a]">
                              {getItemLabel(m)}
                            </span>
                            <span className="block truncate text-[11px] text-[#7a6e68]">
                              {getItemDesc(m)}
                            </span>
                          </span>
                          {m.badge && (
                            <span className="rounded-full bg-[#dfb150]/20 px-2 py-0.5 text-[9px] font-black text-[#8a6a2b]">
                              {m.badge}
                            </span>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <Link
              href="/console"
              onClick={handleCloseAll}
              aria-label={isEn ? 'Notifications' : 'सूचना'}
              className="relative hidden sm:grid size-9 sm:size-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-900 transition shadow-2xs"
            >
              <I name="bell" className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-rose-600 ring-2 ring-white" />
              </span>
            </Link>

            {/* AI Assistant Button (Electric Violet Gradient - ईम्रेस) */}
            <Link
              href="/studio/editor"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCloseAll}
              className="group relative inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#6b21a8] via-[#7c3aed] to-[#8b5cf6] px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-300/40 hover:shadow-purple-500/40 hover:scale-105 transition-all shrink-0"
            >
              <I name="sparkle" className="h-3.5 w-3.5 text-yellow-300" />
              <span>ईम्रेस</span>
            </Link>

            {/* Vendor Login Button (Warm Golden Pill Matching Image 100%) */}
            <Link
              href="/vendor"
              onClick={handleCloseAll}
              className="inline-flex min-h-8 sm:min-h-9 items-center rounded-full border border-amber-400/80 bg-gradient-to-r from-[#f7ca75] via-[#f5bf55] to-[#ebb042] px-4 sm:px-4.5 text-xs sm:text-[13px] font-bold text-[#3b1c00] hover:brightness-105 transition shadow-sm shrink-0 whitespace-nowrap"
            >
              विक्रेता प्रवेश
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={isEn ? 'Open menu' : 'मेनू उघडा'}
              className="grid size-9 sm:size-10 place-items-center rounded-xl border border-gray-200 bg-white text-[#4a0914] transition hover:bg-gray-100 shrink-0 lg:hidden"
            >
              <I name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══════════ 3 · DESKTOP MEGA-MENU / SUB-LEVEL DROPDOWN ═══════════ */}
        {activeSection && ((activeSection.columns && activeSection.columns.length > 0) || (activeSection.items && activeSection.items.length > 0)) && (
          <div
            className="absolute inset-x-0 top-full pt-1.5 before:absolute before:-top-5 before:inset-x-0 before:h-6 before:content-[''] hidden lg:block"
            onMouseEnter={() => handleTriggerEnter(activeSection.id)}
            onMouseLeave={handleTriggerLeave}
          >
            <div
              className="relative mx-auto w-full max-w-6xl px-4 sm:px-6"
              style={{ animation: 'hdr-pop 0.24s cubic-bezier(0.2,0.9,0.3,1.15) both' }}
            >
              <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_30px_90px_-20px_rgba(14,13,38,0.20)] backdrop-blur-3xl ring-1 ring-black/[0.04]">
                {/* Modern Violet Top Ribbon */}
                <div
                  aria-hidden="true"
                  className="h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600"
                />

                {/* Qualtrics-Style Multi-Column Grid */}
                {activeSection.columns && activeSection.columns.length > 0 ? (
                  <div className="grid grid-cols-3 divide-x divide-gray-100 p-6 lg:p-7 gap-6 lg:gap-8 bg-white">
                    {activeSection.columns.map((col, colIdx) => (
                      <div key={col.titleEn + colIdx} className="space-y-3.5">
                        {/* Column Header with ↗ */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                          <Link
                            href={col.href || activeSection.href}
                            onClick={handleCloseAll}
                            className="group/head flex items-center gap-1.5 text-[13px] font-bold text-slate-900 transition hover:text-violet-600"
                          >
                            <span>{getColumnTitle(col)}</span>
                            <I name="arrowUpRight" className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover/head:text-violet-600 group-hover/head:translate-x-0.5 group-hover/head:-translate-y-0.5" />
                          </Link>
                        </div>

                        {/* Column Items */}
                        <div className="space-y-2">
                          {col.items.map((m, i) => (
                            <Link
                              key={m.href + m.en + i}
                              href={m.href}
                              target={m.target}
                              rel={m.target === '_blank' ? 'noopener noreferrer' : undefined}
                              onClick={handleCloseAll}
                              className="group flex items-start gap-3.5 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-xs"
                            >
                              <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-200 group-hover:scale-105 shadow-xs ${ICON_COLOR_STYLES[m.color || 'violet']}`}>
                                <I name={m.icon} className="h-5 w-5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[13.5px] font-bold text-slate-900 transition-colors group-hover:text-violet-600">
                                    {getItemLabel(m)}
                                  </span>
                                  {m.badge && (
                                    <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[8.5px] font-black tracking-wider text-violet-700 border border-violet-200/60">
                                      {m.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[11.5px] leading-snug text-slate-500 line-clamp-2">
                                  {getItemDesc(m)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback for sections with flat items */
                  <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
                    {activeSection.items?.map((m, i) => (
                      <Link
                        key={m.href + m.en + i}
                        href={m.href}
                        target={m.target}
                        rel={m.target === '_blank' ? 'noopener noreferrer' : undefined}
                        onClick={handleCloseAll}
                        className="group flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-white/70 p-3.5 transition-all duration-300 hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-md"
                        style={{ animation: `hdr-fade-up 0.3s ${i * 35}ms both` }}
                      >
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl shadow-xs transition-all duration-300 group-hover:scale-105 ${ICON_COLOR_STYLES[m.color || 'violet']}`}>
                          <I name={m.icon} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-[#1e1917] group-hover:text-violet-600">
                            <span>{getItemLabel(m)}</span>
                            {m.badge && (
                              <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[8.5px] font-black tracking-wider text-violet-700 border border-violet-200/60">
                                {m.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-[12px] leading-snug text-[#7a6e68]">
                            {getItemDesc(m)}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Qualtrics-Style Bottom Dark Highlight Bar */}
                {activeSection.footer && (
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-[#0e0d26] px-7 py-3.5 text-white">
                    <Link
                      href={activeSection.footer.ctaHref}
                      onClick={handleCloseAll}
                      className="group/banner flex items-center gap-2.5 text-xs font-semibold text-white/90 transition hover:text-white"
                    >
                      {activeSection.footer.bannerHighlightEn && (
                        <span className="font-bold text-white flex items-center gap-1 group-hover/banner:underline">
                          {isEn
                            ? activeSection.footer.bannerHighlightEn
                            : isHi
                            ? activeSection.footer.bannerHighlightHi
                            : activeSection.footer.bannerHighlightMr}
                          <I name="arrowUpRight" className="h-3 w-3 inline text-amber-400" />
                        </span>
                      )}
                      <span className="hidden sm:inline text-white/70">
                        {isEn
                          ? activeSection.footer.bannerEn
                          : isHi
                          ? activeSection.footer.bannerHi
                          : activeSection.footer.bannerMr}
                      </span>
                    </Link>

                    <div className="flex items-center gap-3">
                      {activeSection.footer.secondaryLinks?.map((secLink, idx) => (
                        <span key={idx} className="flex items-center gap-3">
                          <Link
                            href={secLink.href}
                            onClick={handleCloseAll}
                            className="text-[11.5px] text-white/75 hover:text-white transition font-medium"
                          >
                            {isEn ? secLink.en : isHi ? secLink.hi : secLink.mr}
                          </Link>
                          {idx < (activeSection.footer?.secondaryLinks?.length ?? 0) - 1 && (
                            <span className="text-white/25">|</span>
                          )}
                        </span>
                      ))}

                      <Link
                        href={activeSection.footer.ctaHref}
                        onClick={handleCloseAll}
                        className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:scale-105 shadow-sm"
                      >
                        <span>
                          {isEn
                            ? activeSection.footer.ctaEn
                            : isHi
                            ? activeSection.footer.ctaHi
                            : activeSection.footer.ctaMr}
                        </span>
                        <I name="arrow" className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ 4 · SUBTLE CLEAN BOTTOM BORDER ═══════════ */}
        <div
          aria-hidden="true"
          className="h-px bg-stone-200/60"
        />
      </header>

      {/* ═══════════════════════════════════════════════════════
          MOBILE NAVIGATION DRAWER WITH ACCORDION SUB-LEVELS
      ═══════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? 'Navigation menu' : 'नेव्हिगेशन मेनू'}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#240307]/65 backdrop-blur-sm"
            onClick={handleCloseAll}
            style={{ animation: 'hdr-fade-up 0.25s both reverse' }}
          />

          {/* Slide-out Drawer Panel */}
          <div
            className="absolute right-0 top-0 flex h-full w-[min(420px,100vw)] flex-col overflow-hidden bg-linear-to-b from-[#fffdfa] via-[#fffdfa] to-[#f8f2e6] shadow-2xl"
            style={{ animation: 'hdr-slide-in 0.35s cubic-bezier(0.22,0.9,0.3,1) both' }}
          >
            {/* Top Gold Shimmer Trim */}
            <div aria-hidden="true" className="h-1.5 shrink-0 bg-linear-to-r from-transparent via-[#ffd700] to-transparent" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#dfb150]/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-[#4a0914] via-[#6b1d2a] to-[#2d050a] text-[#fffdfa] ring-1 ring-[#dfb150]/40">
                  <span className="font-script text-xl font-bold text-[#ffe599]">मा</span>
                </span>
                <div>
                  <p className="font-display text-base font-bold leading-none text-[#4a0914]">माझी पत्रिका</p>
                  <p className="mt-1 text-[9.5px] uppercase tracking-[0.22em] text-[#7a6e68]">Mazi Patrika • Maha OS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseAll}
                aria-label={isEn ? 'Close menu' : 'मेनू बंद करा'}
                className="grid size-10 place-items-center rounded-xl border border-[#dfb150]/35 text-[#4a0914] transition hover:bg-[#dfb150]/15"
              >
                <I name="x" className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Search */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#dfb150]/40 bg-white px-3.5 py-2 shadow-xs">
                <I name="search" className="h-4 w-4 text-[#8a6a2b]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search templates, vendors…' : isHi ? 'टेम्पलेट, वेंडर खोजें…' : 'टेम्पलेट्स, व्हेंडर्स शोधा…'}
                  className="w-full bg-transparent text-sm text-[#1e1917] outline-none placeholder:text-[#7a6e68]/70"
                />
              </div>
            </div>

            {/* Drawer Nav Accordion */}
            <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label={isEn ? 'Mobile navigation' : 'मोबाइल नेव्हिगेशन'}>
              {NAV_SECTIONS.map((sec, i) => {
                const isExpanded = expandedAccordion === sec.id;
                const active = isSectionActive(sec.href);

                return (
                  <div
                    key={sec.id}
                    className="mb-2 overflow-hidden rounded-2xl border border-[#dfb150]/25 bg-white/70 shadow-xs"
                    style={{ animation: `hdr-fade-up 0.35s ${50 + i * 40}ms both` }}
                  >
                    {/* Section Accordion Header */}
                    <div className="flex items-center justify-between p-1">
                      <Link
                        href={sec.href}
                        onClick={handleCloseAll}
                        className={`flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] font-bold transition ${
                          active ? 'text-[#4a0914]' : 'text-[#1e1917] hover:text-[#4a0914]'
                        }`}
                      >
                        <span>{getLabel(sec)}</span>
                        {sec.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-wider ${
                              sec.badgeVariant === 'leaf'
                                ? 'bg-[#10b981]/15 text-[#047857]'
                                : 'bg-[#dfb150]/20 text-[#8a6a2b]'
                            }`}
                          >
                            {sec.badge}
                          </span>
                        )}
                      </Link>

                      {((sec.columns && sec.columns.length > 0) || (sec.items && sec.items.length > 0)) && (
                        <button
                          type="button"
                          onClick={() => setExpandedAccordion(isExpanded ? null : sec.id)}
                          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                          className={`grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-violet-100 ${
                            isExpanded ? 'rotate-180 text-violet-700 bg-violet-100' : ''
                          }`}
                        >
                          <I name="chevron" className="h-4 w-4 transition-transform duration-200" />
                        </button>
                      )}
                    </div>

                    {/* Accordion Sub-levels */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-[#fffdfa] p-2 space-y-2">
                        {sec.columns && sec.columns.length > 0 ? (
                          sec.columns.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-1">
                              <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {getColumnTitle(col)}
                              </p>
                              {col.items.map((sub) => (
                                <Link
                                  key={sub.href + sub.en}
                                  href={sub.href}
                                  target={sub.target}
                                  rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                                  onClick={handleCloseAll}
                                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-violet-50"
                                >
                                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg shadow-2xs ${ICON_COLOR_STYLES[sub.color || 'violet']}`}>
                                    <I name={sub.icon} className="h-3.5 w-3.5" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-900 truncate">{getItemLabel(sub)}</span>
                                      {sub.badge && (
                                        <span className="rounded-full bg-violet-50 px-1 py-0.2 text-[8px] font-bold text-violet-700 border border-violet-200/60">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10.5px] text-slate-500 truncate">{getItemDesc(sub)}</p>
                                  </div>
                                  <I name="arrow" className="h-3 w-3 text-slate-400" />
                                </Link>
                              ))}
                            </div>
                          ))
                        ) : (
                          sec.items?.map((sub) => (
                            <Link
                              key={sub.href + sub.en}
                              href={sub.href}
                              target={sub.target}
                              rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                              onClick={handleCloseAll}
                              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-violet-50"
                            >
                              <span className={`grid size-8 shrink-0 place-items-center rounded-lg shadow-2xs ${ICON_COLOR_STYLES[sub.color || 'violet']}`}>
                                <I name={sub.icon} className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">{getItemLabel(sub)}</span>
                                  {sub.badge && (
                                    <span className="rounded-full bg-violet-50 px-1 py-0.2 text-[8px] font-bold text-violet-700 border border-violet-200/60">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-slate-500 truncate">{getItemDesc(sub)}</p>
                              </div>
                              <I name="arrow" className="h-3 w-3 text-slate-400" />
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Link to Events and Admin */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/events"
                  onClick={handleCloseAll}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dfb150]/30 bg-white/80 p-2.5 text-xs font-bold text-[#4a403c] transition hover:bg-[#dfb150]/15"
                >
                  <I name="calendar" className="h-3.5 w-3.5 text-[#8a6a2b]" />
                  <span>{isEn ? 'Public Events' : 'सार्वजनिक सोहळे'}</span>
                </Link>
                <Link
                  href="/console"
                  onClick={handleCloseAll}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dfb150]/30 bg-white/80 p-2.5 text-xs font-bold text-[#4a403c] transition hover:bg-[#dfb150]/15"
                >
                  <I name="grid" className="h-3.5 w-3.5 text-[#8a6a2b]" />
                  <span>{isEn ? 'Admin Console' : 'कन्सोल'}</span>
                </Link>
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="shrink-0 space-y-3 border-t border-[#dfb150]/30 bg-white/80 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-bold text-[#7a6e68]">
                  <I name="globe" className="h-4 w-4 text-[#8a6a2b]" />
                  <span>{isEn ? 'Language' : isHi ? 'भाषा' : 'भाषा'}</span>
                </span>
                <LangToggle compact />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/vendor"
                  onClick={handleCloseAll}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dfb150]/45 bg-[#fffdfa] text-xs font-bold text-[#1e1917] transition hover:bg-[#f8f2e6]"
                >
                  {t.vendorLogin}
                </Link>
                <Link
                  href="/create"
                  onClick={handleCloseAll}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-[#4a0914] via-[#6b1d2a] to-[#4a0914] text-xs font-bold text-[#fffdfa] shadow-md ring-1 ring-[#dfb150]/40"
                >
                  <I name="sparkle" className="h-3.5 w-3.5 text-[#ffd700]" />
                  <span>{t.createCard}</span>
                </Link>
              </div>

              <p className="hdr-shimmer-text text-center text-[11px] font-semibold tracking-wide">
                {t.mantra}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}