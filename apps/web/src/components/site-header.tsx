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
export interface SubItem {
  icon: string;
  badge?: string;
  href: string;
  en: string;
  mr: string;
  hi: string;
  enD: string;
  mrD: string;
  hiD: string;
}

export interface NavSection {
  id: string;
  href: string;
  labelEn: string;
  labelMr: string;
  labelHi: string;
  badge?: string;
  badgeVariant?: 'gold' | 'maroon' | 'leaf';
  items?: SubItem[];
  footer?: {
    bannerEn: string;
    bannerMr: string;
    bannerHi: string;
    ctaEn: string;
    ctaMr: string;
    ctaHi: string;
    ctaHref: string;
  };
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'studio',
    href: '/studio',
    labelEn: 'Studio',
    labelMr: 'स्टुडिओ',
    labelHi: 'स्टूडियो',
    badge: '६० FPS',
    badgeVariant: 'gold',
    items: [
      {
        icon: 'crown',
        badge: '५०+',
        href: '/studio',
        en: 'All Event Studio',
        mr: 'सर्व सोहळा स्टुडिओ',
        hi: 'सभी इवेंट स्टूडियो',
        enD: '60 FPS live animated templates',
        mrD: '६० FPS लाइव्ह ॲनिमेटेड टेम्पलेट्स',
        hiD: '60 FPS लाइव एनिमेटेड टेम्पलेट्स',
      },
      {
        icon: 'wand',
        badge: 'PRO',
        href: '/studio?mode=pro-editor',
        en: 'Baroque Pro Editor',
        mr: 'बारोक प्रो एडिटर',
        hi: 'बारोक प्रो एडिटर',
        enD: 'Pixel-perfect custom canvas design',
        mrD: 'पिक्सेल-परफेक्ट कस्टम कॅनव्हास डिझाइन',
        hiD: 'पिक्सेल-परफेक्ट कस्टम कैनवास डिज़ाइन',
      },
      {
        icon: 'video',
        badge: 'NEW',
        href: '/studio?mode=video-studio',
        en: 'Video Studio',
        mr: 'व्हिडिओ स्टुडिओ',
        hi: 'वीडियो स्टूडियो',
        enD: 'Full HD MP4 export · Reels & Status ready',
        mrD: 'फुल HD MP4 एक्सपोर्ट · रील्स व स्टेटस रेडी',
        hiD: 'फुल HD MP4 एक्सपोर्ट · रील्स व स्टेटस रेडी',
      },
      {
        icon: 'doc',
        badge: 'POPULAR',
        href: '/biodata',
        en: 'Marriage Biodata',
        mr: 'विवाह बायोडाटा',
        hi: 'विवाह बायोडाटा',
        enD: '8 Royal styles · 1-click WhatsApp PDF',
        mrD: '८ राजेशाही शैली · १-क्लिक व्हॉट्सअॅप PDF',
        hiD: '८ शाही शैलियाँ · १-क्लिक व्हाट्सएप PDF',
      },
      {
        icon: 'sparkle',
        badge: 'BETA',
        href: '/studio?mode=effects-lab',
        en: 'Effects Lab',
        mr: 'इफेक्ट्स लॅब',
        hi: 'इफेक्ट्स लैब',
        enD: 'Particles · Gold dust · Glow shader',
        mrD: 'पार्टिकल · सुवर्णकण · ग्लो शेडर',
        hiD: 'पार्टिकल · स्वर्णकण · ग्लो शेडर',
      },
      {
        icon: 'grid',
        badge: 'WYSIWYP',
        href: '/studio?mode=invitation',
        en: 'Classic Invitation Card',
        mr: 'पारंपरिक लग्नपत्रिका',
        hi: 'पारंपरिक विवाह पत्रिका',
        enD: 'Zero print error · Full bleed export',
        mrD: 'छपाईत शून्य चूक · फुल ब्लीड एक्सपोर्ट',
        hiD: 'छपाई में शून्य त्रुटि · फुल ब्लीड एक्सपोर्ट',
      },
    ],
    footer: {
      bannerEn: '✨ 50+ Artisan templates · Trilingual phonetic typing · Print & Video ready',
      bannerMr: '✨ ५०+ हस्तकला टेम्पलेट्स · त्रिभाषिक फोनेटिक टायपिंग · प्रिंट व व्हिडिओ रेडी',
      bannerHi: '✨ ५०+ हस्तकला टेम्पलेट्स · त्रिभाषी फोनेटिक टाइपिंग · प्रिंट व वीडियो रेडी',
      ctaEn: 'Open Studio',
      ctaMr: 'स्टुडिओ उघडा',
      ctaHi: 'स्टूडियो खोलें',
      ctaHref: '/studio',
    },
  },
  {
    id: 'biodata',
    href: '/biodata',
    labelEn: 'Biodata',
    labelMr: 'विवाह बायोडाटा',
    labelHi: 'विवाह बायोडाटा',
    badge: 'NEW',
    badgeVariant: 'gold',
    items: [
      {
        icon: 'crown',
        badge: '८ TEMPLATES',
        href: '/biodata#biodata-live',
        en: 'All 8 Royal Templates',
        mr: 'सर्व ८ राजेशाही टेम्पलेट्स',
        hi: 'सभी ८ शाही टेम्पलेट्स',
        enD: 'Shahi, Rajmahal, Damask, Heritage styles',
        mrD: 'शाही, राजमहाल, दमास्क, हेरिटेज शैली',
        hiD: 'शाही, राजमहल, दमास्क, हेरिटेज शैली',
      },
      {
        icon: 'users',
        badge: 'वर',
        href: '/biodata?profile=groom',
        en: 'Groom Biodata Maker',
        mr: 'वर बायोडाटा मेकर',
        hi: 'वर बायोडाटा मेकर',
        enD: 'Education, profession, kul & family details',
        mrD: 'शिक्षण, नोकरी/व्यवसाय, कुल व कौटुंबिक माहिती',
        hiD: 'शिक्षा, व्यवसाय, कुल व पारिवारिक विवरण',
      },
      {
        icon: 'heart',
        badge: 'वधू',
        href: '/biodata?profile=bride',
        en: 'Bride Biodata Maker',
        mr: 'वधू बायोडाटा मेकर',
        hi: 'वधू बायोडाटा मेकर',
        enD: 'Graceful fonts, horoscope & photo placement',
        mrD: 'सुबक अक्षर, पत्रिका/कुंडली व सुंदर फोटो रचना',
        hiD: 'सुरुचिपूर्ण अक्षर, कुंडली व फोटो संयोजन',
      },
      {
        icon: 'sparkle',
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
    footer: {
      bannerEn: '👑 Specially designed for Maharashtrian families with authentic Marathi typography',
      bannerMr: '👑 अस्सल मराठी फॉन्ट व रुबाबदार मांडणीसह महाराष्ट्रातील कुटुंबांसाठी विशेष निर्मिती',
      bannerHi: '👑 प्रामाणिक मराठी फॉन्ट व सुरुचिपूर्ण प्रारूप के साथ विशेष रूप से निर्मित',
      ctaEn: 'Create Biodata',
      ctaMr: 'बायोडाटा बनवा',
      ctaHi: 'बायोडाटा बनाएं',
      ctaHref: '/biodata',
    },
  },
  {
    id: 'vendors',
    href: '/vendors',
    labelEn: 'Vendors',
    labelMr: 'विक्रेते',
    labelHi: 'विक्रेता बाज़ार',
    badge: '१२०+',
    badgeVariant: 'maroon',
    items: [
      {
        icon: 'shield',
        badge: 'VERIFIED',
        href: '/vendors',
        en: 'All Verified Vendors',
        mr: 'सर्व पडताळलेले विक्रेते',
        hi: 'सभी सत्यापित विक्रेता',
        enD: 'Pune, Mumbai, Nashik & Kolhapur networks',
        mrD: 'पुणे, मुंबई, नाशिक व कोल्हापूर नेटवर्क',
        hiD: 'पुणे, मुंबई, नासिक व कोल्हापुर नेटवर्क',
      },
      {
        icon: 'home',
        badge: 'LAWNS',
        href: '/vendors?category=venue',
        en: 'Venues & Royal Lawns',
        mr: 'मंगल कार्यालये व लॉन्स',
        hi: 'वेन्यू व मैरिज लॉन',
        enD: 'AC halls, capacity, parking & real photos',
        mrD: 'वातानुकूलित हॉल, क्षमता, पार्किंग व छायाचित्रे',
        hiD: 'एसी हॉल, क्षमता, पार्किंग व वास्तविक तस्वीरें',
      },
      {
        icon: 'camera',
        badge: '4K',
        href: '/vendors?category=photographer',
        en: 'Photographers & Cinema',
        mr: 'फोटोग्राफी व सिनेमॅटोग्राफी',
        hi: 'फोटोग्राफी व सिनेमा',
        enD: 'Pre-wedding, candid, drone & reels shoots',
        mrD: 'प्री-वेडिंग, कॅन्डिड, ड्रोन व रील्स शूट्स',
        hiD: 'प्री-वेडिंग, कैंडिड, ड्रोन व रील्स शूट',
      },
      {
        icon: 'flower',
        badge: 'MANDAP',
        href: '/vendors?category=decorator',
        en: 'Mandap & Decorators',
        mr: 'मंडप व फुलांची सजावट',
        hi: 'मंडप व फूलों की सजावट',
        enD: 'Traditional Rajwada, floral arch & stage lighting',
        mrD: 'पारंपरिक राजवाडा, फुलांची कमान व स्टेज रोषणाई',
        hiD: 'पारंपरिक राजवाड़ा, पुष्प कमान व स्टेज लाइटिंग',
      },
      {
        icon: 'utensils',
        badge: 'FEAST',
        href: '/vendors?category=caterer',
        en: 'Caterers & Traditional Feast',
        mr: 'कॅटरर्स व अस्सल मेजवानी',
        hi: 'कैटरर्स व पारंपरिक दावत',
        enD: 'Puran Poli, Ukadiche Modak & live counters',
        mrD: 'पुरणपोळी, उकडीचे मोदक व थेट लाइव्ह काऊंटर्स',
        hiD: 'पूरनपोली, मोदक व लाइव फूड काउंटर्स',
      },
      {
        icon: 'sparkle',
        badge: 'MEHENDI',
        href: '/vendors?category=makeup',
        en: 'Bridal Makeup & Mehendi',
        mr: 'ब्राइडल मेकअप व मेहंदी',
        hi: 'दुल्हन मेकअप व मेहंदी',
        enD: 'HD airbrush, Nauvari draping & bridal art',
        mrD: 'HD एअरब्रश, नऊवारी नेसवणे व नक्षीदार मेहंदी',
        hiD: 'HD एयरब्रश, नौवारी ड्रेपिंग व सुंदर मेहंदी',
      },
    ],
    footer: {
      bannerEn: '🛡️ 7-Layer verification guarantee · Direct quotes with zero middlemen margin',
      bannerMr: '🛡️ ७-पदरी पडताळणी खात्री · मध्यस्थांशिवाय थेट दर आणि खात्रीशीर उपलब्धता',
      bannerHi: '🛡️ ७-स्तरीय सत्यापन गारंटी · बिना बिचौलियों के सीधे कोट और निश्चित उपलब्धता',
      ctaEn: 'Browse Vendors',
      ctaMr: 'विक्रेते शोधा',
      ctaHi: 'विक्रेता देखें',
      ctaHref: '/vendors',
    },
  },
  {
    id: 'panchang',
    href: '/panchang',
    labelEn: 'Panchang',
    labelMr: 'पंचांग व मुहूर्त',
    labelHi: 'पंचांग व मुहूर्त',
    badge: 'LIVE',
    badgeVariant: 'leaf',
    items: [
      {
        icon: 'sun',
        badge: 'TODAY',
        href: '/panchang',
        en: 'Live Daily Panchang',
        mr: 'दैनिक थेट पंचांग',
        hi: 'दैनिक लाइव पंचांग',
        enD: 'Tithi, Nakshatra, Choghadiya & Rahu Kaal',
        mrD: 'तिथी, नक्षत्र, चौघडिया, राहुकाळ व शुभ योग',
        hiD: 'तिथि, नक्षत्र, चौघड़िया, राहुकाल व शुभ योग',
      },
      {
        icon: 'heart',
        badge: '२०२६-२७',
        href: '/panchang?event=wedding',
        en: 'Shubh Vivah Muhurat',
        mr: 'शुभ विवाह मुहूर्त २०२६-२७',
        hi: 'शुभ विवाह मुहूर्त २०२६-२७',
        enD: 'Astronomical Surya Siddhanta calculations',
        mrD: 'सूर्यसिद्धांत पद्धतीवर आधारित बिनचूक मुहूर्त',
        hiD: 'सूर्यसिद्धांत पद्धति पर आधारित सटीक मुहूर्त',
      },
      {
        icon: 'home',
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
        icon: 'calendar',
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
    footer: {
      bannerEn: '☀️ Traditional Surya Siddhanta astronomical calculation fine-tuned for Maharashtra cities',
      bannerMr: '☀️ महाराष्ट्रातील शहरांनुसार सूक्ष्म अक्षांश-रेखांश व सूर्यसिद्धांत खगोलीय गणित',
      bannerHi: '☀️ महाराष्ट्र के शहरों हेतु सूर्यसिद्धांत खगोलीय गणना पर आधारित प्रामाणिक पंचांग',
      ctaEn: 'View Full Calendar',
      ctaMr: 'संपूर्ण पंचांग पाहा',
      ctaHi: 'पूरा पंचांग देखें',
      ctaHref: '/panchang',
    },
  },
  {
    id: 'business',
    href: '/vendor-os',
    labelEn: 'Business OS',
    labelMr: 'बिझनेस OS',
    labelHi: 'बिजनेस OS',
    badge: 'CRM',
    badgeVariant: 'maroon',
    items: [
      {
        icon: 'briefcase',
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
        badge: 'ADMIN',
        href: '/console',
        en: 'Admin & Metrics Console',
        mr: 'कन्सोल व प्लॅटफॉर्म मेट्रिक्स',
        hi: 'कंसोल व प्लेटफ़ॉर्म मेट्रिक्स',
        enD: 'GMV, take-rate, SLA tracker & double-entry ledger',
        mrD: 'GMV, व्हेंडर SLA ट्रॅकर व सुरक्षित खातेवही',
        hiD: 'GMV, वेंडर SLA ट्रैकर व सुरक्षित बहीखाता',
      },
      {
        icon: 'store',
        badge: 'LOGIN',
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
        badge: 'AI MAGIC',
        href: '/create',
        en: 'AI Celebration Planner',
        mr: 'AI सोहळा नियोजक',
        hi: 'AI उत्सव नियोजक',
        enD: 'Plan full wedding in 1 sentence with budget & guests',
        mrD: 'एका वाक्यात बजेट, पाहुणे व विक्रेत्यांसह संपूर्ण नियोजन',
        hiD: 'एक वाक्य में बजट, अतिथि व विक्रेताओं सहित संपूर्ण योजना',
      },
    ],
    footer: {
      bannerEn: '💼 Double-entry commerce ledger with automated WhatsApp lead reminders & CRM',
      bannerMr: '💼 दुहेरी-नोंदणी खातेवही, स्वयंचलित व्हॉट्सअॅप अपडेट्स व संपूर्ण बिझनेस व्यवस्थापन',
      bannerHi: '💼 डबल-एंट्री बहीखाता, स्वचालित व्हाट्सएप अपडेट्स व संपूर्ण व्यापार प्रबंधन',
      ctaEn: 'Open Vendor Desk',
      ctaMr: 'व्हेंडर डेस्क उघडा',
      ctaHi: 'विक्रेता डेस्क खोलें',
      ctaHref: '/vendor-os',
    },
  },
];

/* Flattened search items for the ⌘K command palette */
const ALL_SEARCH_ITEMS: SubItem[] = NAV_SECTIONS.flatMap((sec) => sec.items ?? []);

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
            ? 'bg-[#fffdf9]/98 shadow-[0_16px_45px_-12px_rgba(74,9,20,0.18)] backdrop-blur-2xl'
            : 'bg-[#fffdf9]/95 shadow-[0_10px_35px_-12px_rgba(74,9,20,0.10)] backdrop-blur-xl'
        } border-b border-[#dfb150]/35`}
      >
        {/* ═══════════ 1 · AUSPICIOUS ROYAL MICRO-BAR ═══════════ */}
        <div className="relative overflow-hidden bg-linear-to-r from-[#240307] via-[#430812] to-[#240307] px-3 py-1 sm:px-5">
          {/* Subtle Golden Starlight Micro-Pattern */}
          <div
            aria-hidden="true"
            className="hdr-anim pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage: 'radial-gradient(circle, #dfb150 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              animation: 'hdr-shimmer 18s linear infinite',
            }}
          />

          <div className="shell relative flex items-center justify-between text-xs">
            {/* Mantra with Glowing Auspicious Pip */}
            <span className="hidden items-center gap-2 font-serif text-[12px] font-medium tracking-wider text-[#fffdfa] sm:inline-flex">
              <span className="relative flex size-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#dfb150]"
                  style={{ animation: 'hdr-ping 2.4s cubic-bezier(0,0,0.2,1) infinite' }}
                />
                <span className="relative inline-flex size-2 rounded-full bg-[#dfb150]" />
              </span>
              {t.mantra}
            </span>

            {/* Shimmering Center Tagline */}
            <span className="hdr-shimmer-text mx-auto max-w-[340px] truncate text-[11px] font-bold tracking-wide sm:mx-0 sm:text-xs">
              {t.tagline}
            </span>

            {/* Live Panchang Status Pill */}
            <Link
              href="/panchang"
              onClick={handleCloseAll}
              className="group hidden items-center gap-2 rounded-full bg-white/5 px-2.5 py-0.5 text-[11.5px] font-medium text-[#ffd700] transition hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <span
                className="size-1.5 rounded-full bg-[#10b981]"
                style={{ animation: 'hdr-pulse-dot 2s ease-in-out infinite' }}
              />
              <span>{t.livePanchang}</span>
              <I name="arrow" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ═══════════ 2 · MAIN NAVIGATION BAR ═══════════ */}
        <div
          className={`shell flex items-center justify-between gap-2 transition-all duration-300 sm:gap-4 ${
            scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-[4.5rem]'
          }`}
        >
          {/* ── Brand Logo & Royal Identity ── */}
          <Link
            href="/"
            onClick={handleCloseAll}
            aria-label={isEn ? 'Mazi Patrika home' : 'माझी पत्रिका — मुख्यपृष्ठ'}
            className="group relative flex shrink-0 items-center gap-3 rounded-2xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfb150]"
          >
            <div className="relative">
              {/* Rotating 12-point Devanagari Mandala Ring */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="hdr-anim absolute -inset-2 text-[#dfb150]/60 transition-colors duration-500 group-hover:text-[#dfb150]"
                style={{ animation: 'hdr-spin 28s linear infinite' }}
              >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 7" />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return (
                    <circle
                      key={i}
                      cx={50 + Math.cos(a) * 46}
                      cy={50 + Math.sin(a) * 46}
                      r="1.8"
                      fill="currentColor"
                    />
                  );
                })}
              </svg>

              {/* Medallion with "मा" Script */}
              <span className="relative grid size-11 place-items-center rounded-2xl bg-linear-to-br from-[#4a0914] via-[#6b1d2a] to-[#2d050a] text-[#fffdfa] shadow-md ring-1 ring-[#dfb150]/45 transition-all duration-300 group-hover:scale-105 group-hover:ring-[#dfb150] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <span className="font-script text-2xl font-bold leading-none drop-shadow-sm text-[#ffe599]">
                  मा
                </span>
              </span>
              <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#fffdf9] bg-[#dfb150] shadow-sm" />
            </div>

            <div className="hidden leading-tight xs:block">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-[#4a0914] transition group-hover:text-[#8a1f32]">
                  माझी पत्रिका
                </span>
                <span className="hdr-shimmer-text rounded-md border border-[#dfb150]/50 bg-[#2d050a] px-2 py-0.5 text-[10px] font-black tracking-widest">
                  PRO
                </span>
              </div>
              <span className="font-ui block text-[10.5px] uppercase tracking-[0.22em] text-[#7a6e68]">
                Mazi Patrika • Maha OS
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Bar ── */}
          <nav aria-label={isEn ? 'Main navigation' : 'मुख्य नेव्हिगेशन'} className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
            {NAV_SECTIONS.map((sec) => {
              const active = isSectionActive(sec.href);
              const isOpen = (activeDropdown === sec.id) || (pinnedDropdown === sec.id);

              return (
                <div
                  key={sec.id}
                  className="relative"
                  onMouseEnter={() => handleTriggerEnter(sec.id)}
                  onMouseLeave={handleTriggerLeave}
                >
                  <div className="flex items-center">
                    {/* Primary Navigation Link */}
                    <Link
                      href={sec.href}
                      onClick={() => {
                        // If it's a section, toggle pin or let user navigate directly
                        setActiveDropdown(null);
                        setPinnedDropdown(null);
                      }}
                      className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfb150] ${
                        active
                          ? 'text-[#4a0914] font-bold'
                          : 'text-[#241915] hover:bg-[#dfb150]/14 hover:text-[#4a0914]'
                      }`}
                    >
                      <span>{getLabel(sec)}</span>
                      {sec.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-wider ${
                            sec.badgeVariant === 'leaf'
                              ? 'bg-[#10b981]/15 text-[#047857] border border-[#10b981]/30'
                              : sec.badgeVariant === 'maroon'
                              ? 'bg-[#6b1d2a]/10 text-[#6b1d2a] border border-[#6b1d2a]/20'
                              : 'bg-[#dfb150]/20 text-[#8a6a2b] border border-[#dfb150]/40'
                          }`}
                        >
                          {sec.badge}
                        </span>
                      )}

                      {/* Active / Hover Underline Bar */}
                      <span
                        className={`absolute inset-x-2.5 -bottom-0.5 h-[2.5px] rounded-full bg-linear-to-r from-[#dfb150] via-[#ffd700] to-[#dfb150] transition-transform duration-300 ${
                          active || isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </Link>

                    {/* Chevron Toggle Button for Quick Sub-level Pinning */}
                    {sec.items && sec.items.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTogglePin(sec.id);
                        }}
                        aria-expanded={isOpen}
                        aria-label={isEn ? `Toggle ${sec.labelEn} menu` : `${getLabel(sec)} मेनू टॉगल करा`}
                        className={`grid size-7 place-items-center rounded-lg text-[#7a6e68] transition hover:bg-[#dfb150]/20 hover:text-[#4a0914] ${
                          isOpen ? 'rotate-180 text-[#4a0914] bg-[#dfb150]/20' : ''
                        }`}
                      >
                        <I name="chevron" className="h-3.5 w-3.5 transition-transform duration-300" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* ── Right Cluster: Search, Notifications, Lang, Vendor, CTA, Mobile ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* ⌘K Quick Search Button */}
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setActiveDropdown(null);
                  setPinnedDropdown(null);
                }}
                aria-label={isEn ? 'Quick search (Ctrl+K)' : 'जलद शोध (Ctrl+K)'}
                aria-expanded={searchOpen}
                className="grid size-10 place-items-center rounded-xl border border-[#dfb150]/35 bg-[#fffdfa] text-[#4a403c] transition hover:border-[#dfb150] hover:bg-[#dfb150]/15 hover:text-[#4a0914] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfb150] sm:size-11"
              >
                <I name="search" className="h-[18px] w-[18px]" />
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

            {/* Notifications / Console Direct Link */}
            <Link
              href="/console"
              onClick={handleCloseAll}
              aria-label={isEn ? 'Notifications & Console' : 'सूचना व कन्सोल'}
              className="relative hidden size-10 place-items-center rounded-xl border border-[#dfb150]/35 bg-[#fffdfa] text-[#4a403c] transition hover:border-[#dfb150] hover:bg-[#dfb150]/15 hover:text-[#4a0914] sm:grid sm:size-11"
            >
              <I name="bell" className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 flex size-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#6b1d2a]"
                  style={{ animation: 'hdr-ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
                />
                <span className="relative inline-flex size-2 rounded-full bg-[#8a1f32] ring-2 ring-[#fffdfa]" />
              </span>
            </Link>

            {/* Language Toggle */}
            <LangToggle compact />

            {/* Vendor Portal Direct Link */}
            <Link
              href="/vendor"
              onClick={handleCloseAll}
              className="hidden min-h-11 items-center rounded-full border border-[#dfb150]/45 bg-[#fffdfa] px-3.5 text-xs font-bold text-[#4a403c] transition hover:border-[#dfb150] hover:bg-[#f8f2e6] hover:text-[#4a0914] xl:inline-flex"
            >
              {t.vendorLogin}
            </Link>

            {/* Primary Action Button: Create Card */}
            <Link
              href="/create"
              onClick={handleCloseAll}
              className="group relative inline-flex min-h-10 sm:min-h-11 items-center overflow-hidden rounded-full bg-linear-to-r from-[#4a0914] via-[#6b1d2a] to-[#4a0914] px-3 sm:px-5 text-xs font-bold text-[#fffdfa] shadow-md ring-1 ring-[#dfb150]/40 transition-all duration-300 hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] hover:ring-[#dfb150] sm:text-sm shrink-0"
              style={{ animation: 'hdr-glow 4s ease-in-out infinite' }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/25 to-transparent"
                style={{ animation: 'hdr-shine 3.2s ease-in-out infinite' }}
              />
              <span className="relative flex items-center gap-1 sm:gap-1.5">
                <I name="sparkle" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffd700]" />
                <span className="hidden xs:inline">{t.createCard}</span>
                <I name="arrow" className="hidden md:inline h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={isEn ? 'Open menu' : isHi ? 'मेनू खोलें' : 'मेनू उघडा'}
              className="grid size-10 place-items-center rounded-xl border border-[#dfb150]/35 bg-[#fffdfa] text-[#4a0914] transition hover:bg-[#dfb150]/15 shrink-0 lg:hidden"
            >
              <I name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══════════ 3 · DESKTOP MEGA-MENU / SUB-LEVEL DROPDOWN ═══════════ */}
        {activeSection && activeSection.items && activeSection.items.length > 0 && (
          <div
            className="absolute inset-x-0 top-full pt-1.5 before:absolute before:-top-5 before:inset-x-0 before:h-6 before:content-[''] hidden lg:block"
            onMouseEnter={() => handleTriggerEnter(activeSection.id)}
            onMouseLeave={handleTriggerLeave}
          >
            <div
              className="relative mx-auto w-full max-w-5xl px-6"
              style={{ animation: 'hdr-pop 0.24s cubic-bezier(0.2,0.9,0.3,1.15) both' }}
            >
              <div className="overflow-hidden rounded-3xl border border-[#dfb150]/45 bg-[#fffdfa]/98 shadow-[0_32px_90px_-20px_rgba(45,5,10,0.38)] backdrop-blur-3xl">
                {/* 24K Gold Shimmer Top Ribbon */}
                <div
                  aria-hidden="true"
                  className="h-1 bg-linear-to-r from-transparent via-[#ffd700] to-transparent"
                />

                {/* Sub-item Grid with Micro-Cards */}
                <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {activeSection.items.map((m, i) => (
                    <Link
                      key={m.href + m.en + i}
                      href={m.href}
                      onClick={handleCloseAll}
                      className="group flex items-start gap-3.5 rounded-2xl border border-[#dfb150]/20 bg-white/70 p-3.5 transition-all duration-300 hover:border-[#dfb150]/70 hover:bg-linear-to-br hover:from-[#dfb150]/15 hover:via-white hover:to-transparent hover:shadow-md"
                      style={{ animation: `hdr-fade-up 0.3s ${i * 35}ms both` }}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-[#4a0914] via-[#6b1d2a] to-[#2d050a] text-[#fffdfa] shadow-md ring-1 ring-[#dfb150]/35 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 group-hover:ring-[#dfb150]">
                        <I name={m.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-[#1e1917] group-hover:text-[#6b1d2a]">
                          <span>{getItemLabel(m)}</span>
                          {m.badge && (
                            <span className="rounded-full bg-[#dfb150]/20 px-1.5 py-0.5 text-[8.5px] font-black tracking-wider text-[#8a6a2b] border border-[#dfb150]/40">
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

                {/* Bottom Auspicious Banner with Quick CTA */}
                {activeSection.footer && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfb150]/30 bg-linear-to-r from-[#240307] via-[#430812] to-[#240307] px-6 py-3">
                    <p className="hdr-shimmer-text text-xs font-bold tracking-wide">
                      {isEn
                        ? activeSection.footer.bannerEn
                        : isHi
                        ? activeSection.footer.bannerHi
                        : activeSection.footer.bannerMr}
                    </p>
                    <Link
                      href={activeSection.footer.ctaHref}
                      onClick={handleCloseAll}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#dfb150] px-4 py-1.5 text-xs font-black text-[#2d050a] transition hover:scale-105 hover:bg-[#ffd700]"
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ 4 · PAISLEY GOLD FILIGREE EDGE ═══════════ */}
        <div
          aria-hidden="true"
          className="h-[3px] bg-[repeating-linear-gradient(90deg,#dfb150_0px,#dfb150_8px,transparent_8px,transparent_14px,#8a6a2b_14px,#8a6a2b_16px,transparent_16px,transparent_22px)] opacity-70"
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

                      {sec.items && sec.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedAccordion(isExpanded ? null : sec.id)}
                          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                          className={`grid size-9 place-items-center rounded-xl text-[#7a6e68] transition hover:bg-[#dfb150]/20 ${
                            isExpanded ? 'rotate-180 text-[#4a0914] bg-[#dfb150]/15' : ''
                          }`}
                        >
                          <I name="chevron" className="h-4 w-4 transition-transform duration-200" />
                        </button>
                      )}
                    </div>

                    {/* Accordion Sub-levels */}
                    {isExpanded && sec.items && (
                      <div className="border-t border-[#dfb150]/20 bg-[#fffdfa] p-2 space-y-1">
                        {sec.items.map((sub) => (
                          <Link
                            key={sub.href + sub.en}
                            href={sub.href}
                            onClick={handleCloseAll}
                            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#dfb150]/15"
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-linear-to-br from-[#4a0914] to-[#2d050a] text-[#fffdfa] shadow-xs ring-1 ring-[#dfb150]/30">
                              <I name={sub.icon} className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#1e1917] truncate">{getItemLabel(sub)}</span>
                                {sub.badge && (
                                  <span className="rounded-full bg-[#dfb150]/20 px-1 py-0.2 text-[8px] font-bold text-[#8a6a2b]">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-[#7a6e68] truncate">{getItemDesc(sub)}</p>
                            </div>
                            <I name="arrow" className="h-3 w-3 text-[#7a6e68]" />
                          </Link>
                        ))}
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