'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EPHEMERIS_VERSION } from '@mazi/panchang';
import { useLanguage } from '@/context/language-context';

/* ═══════════════════════════════════════════════════════════════
   Scroll-reveal hook
═══════════════════════════════════════════════════════════════ */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

/* ═══════════════════════════════════════════════════════════════
   Inline icons
═══════════════════════════════════════════════════════════════ */
function I({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    up: <path d="M12 19V5M6 11l6-6 6 6" />,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    sparkle: <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2z" />,
    crown: <path d="M3 17l-1-9 5.5 4L12 5l4.5 7L22 8l-1 9H3zM3 20h18" />,
    video: <><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="M15.5 10.5l6-3.5v10l-6-3.5" /></>,
    whatsapp: <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></>,
    youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" /></>,
    x: <path d="M4 4l16 16M20 4L4 20" />,
    shield: <path d="M12 2l8 3.5v5.2c0 5-3.4 9.4-8 11.3-4.6-1.9-8-6.3-8-11.3V5.5L12 2zM8.8 12l2.2 2.2 4.2-4.4" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
export function SiteFooter() {
  const { isEn, isHi } = useLanguage();

  const cta = useReveal<HTMLDivElement>();
  const trust = useReveal<HTMLDivElement>();
  const main = useReveal<HTMLDivElement>();
  const ticker = useReveal<HTMLDivElement>();

  /* ── Content (trilingual) ── */
  const trustSeals = isEn
    ? [
      { icon: '⚖️', title: 'Double-Entry Ledger', desc: 'Zero-balance financial tracking for every transaction' },
      { icon: '🌙', title: 'Surya Siddhanta Panchang', desc: 'Accurate tithi & muhurat calculated to local sunrise' },
      { icon: '🖨️', title: '3mm Bleed Guarantee', desc: 'CMYK-safe precision, exact match to screen' },
      { icon: '🛡️', title: 'Secure Escrow', desc: 'Vendor payout released upon verified milestone delivery' },
    ]
    : isHi
      ? [
        { icon: '⚖️', title: 'दोहरी प्रविष्टि बहीखाता', desc: 'हर लेन-देन के लिए शून्य-संतुलन वित्तीय ट्रैकिंग' },
        { icon: '🌙', title: 'सूर्यसिद्धांत पंचांग', desc: 'स्थानीय सूर्योदय के अनुसार सटीक तिथि व शुभ मुहूर्त' },
        { icon: '🖨️', title: '३ मिमी ब्लीड गारंटी', desc: 'CMYK-सुरक्षित, स्क्रीन के समान सटीक छपाई' },
        { icon: '🛡️', title: 'सुरक्षित एस्क्रो', desc: 'सत्यापित सेवा वितरण पर विक्रेता को सीधा भुगतान' },
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
    : isHi
      ? [
        {
          title: 'रचना व डिज़ाइन',
          links: [
            { href: '/create', label: 'AI स्मार्ट सेटअप' },
            { href: '/studio/patil-patil-vivah-2027/invitation', label: 'निमंत्रण स्टूडियो (WYSIWYP)' },
            { href: '/studio/patil-patil-vivah-2027', label: 'कार्यक्रम कार्यक्षेत्र' },
            { href: '/events', label: 'सार्वजनिक नमूना पत्रिका' },
          ],
        },
        {
          title: 'खोजें व बुक करें',
          links: [
            { href: '/vendors', label: 'विश्वसनीय विक्रेता' },
            { href: '/vendors?category=venue&city=पुणे', label: 'मंगल कार्यालय व हॉल' },
            { href: '/vendors?category=photographer&city=पुणे', label: 'फोटोग्राफर व सिनेमा' },
            { href: '/panchang', label: 'पंचांग, तिथि व चौघड़िया' },
          ],
        },
        {
          title: 'प्रबंधन व नियंत्रण',
          links: [
            { href: '/vendor', label: 'विक्रेता ऑपरेटिंग डेस्क' },
            { href: '/vendor/leads/lead_2', label: 'कोट व बुकिंग प्रबंधक' },
            { href: '/admin', label: 'मार्केटप्लेस व लेजर स्थिति' },
            { href: '/api/health', label: 'सिस्टम स्थिति व वर्शन' },
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

  const tickerItems = isEn
    ? ['50+ Premium Templates', '60 FPS Live Editor', 'MP4 Video Export', 'Trilingual Cards', 'Surya Siddhanta Engine', 'Secure Escrow', 'WYSIWYP Print Guarantee']
    : isHi
      ? ['५०+ प्रीमियम टेम्पलेट्स', '६० FPS लाइव एडिटर', 'MP4 वीडियो एक्सपोर्ट', 'त्रिभाषी पत्रिकाएँ', 'सूर्यसिद्धांत इंजन', 'सुरक्षित एस्क्रो', 'WYSIWYP प्रिंट गारंटी']
      : ['५०+ प्रीमियम टेम्पलेट्स', '६० FPS लाइव्ह एडिटर', 'MP4 व्हिडिओ एक्सपोर्ट', 'त्रिभाषिक पत्रिका', 'सूर्यसिद्धांत इंजिन', 'सुरक्षित एस्क्रो', 'WYSIWYP प्रिंट हमी'];

  const social = [
    { name: 'whatsapp', label: 'WhatsApp', href: '#' },
    { name: 'instagram', label: 'Instagram', href: '#' },
    { name: 'youtube', label: 'YouTube', href: '#' },
    { name: 'x', label: 'X (Twitter)', href: '#' },
  ];

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-gold/40 bg-linear-to-b from-ivory-deep via-ivory to-ivory-deep text-charcoal">
      <style jsx global>{`
        @keyframes ftr-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes ftr-spin    { to { transform: rotate(360deg); } }
        @keyframes ftr-shine   { 0% { transform: translateX(-130%) skewX(-16deg); } 100% { transform: translateX(260%) skewX(-16deg); } }
        @keyframes ftr-ping    { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes ftr-marquee { to { transform: translateX(-50%); } }
        @keyframes ftr-float   { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .ftr-shimmer-text {
          background: linear-gradient(100deg, #f5d67b 30%, #fff6d8 50%, #f5d67b 70%);
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: ftr-shimmer 4.5s linear infinite;
        }
        .ftr-marquee:hover .ftr-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ftr-shimmer-text, .ftr-anim, .ftr-track { animation: none !important; }
        }
      `}</style>

      {/* ═══════ Ornamental top edge (mirrors header) ═══════ */}
      <div aria-hidden className="paithani-edge absolute inset-x-0 top-0 h-2 opacity-80" />
      <div aria-hidden className="mt-2 h-[3px] bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_8px,transparent_8px,transparent_14px,#8a5a12_14px,#8a5a12_16px,transparent_16px,transparent_22px)] opacity-60" />

      {/* ═══════ Giant Devanagari watermark ═══════ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <span className="font-script absolute -right-10 top-8 text-[22rem] leading-none text-maroon/[0.035]">मा</span>
        <span className="font-script absolute -left-16 bottom-0 text-[16rem] leading-none text-gold-deep/[0.04]">शुभ</span>
      </div>

      {/* ═══════ 1 · ROYAL CTA BANNER ═══════ */}
      <div className="shell relative pt-10 sm:pt-14">
        <div ref={cta.ref}
          className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-maroon-deep via-maroon to-maroon-rich shadow-[0_30px_80px_-24px_rgba(80,10,30,0.55)] ring-1 ring-gold/40 transition-all duration-700 ${cta.shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* dot texture */}
          <div aria-hidden className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle,#f0c048 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* rotating mandala ornament */}
          <svg aria-hidden viewBox="0 0 200 200" className="ftr-anim absolute -right-14 -top-14 h-64 w-64 text-gold/25 sm:h-80 sm:w-80"
            style={{ animation: 'ftr-spin 40s linear infinite' }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 10" />
            <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="1" />
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return <circle key={i} cx={100 + Math.cos(a) * 88} cy={100 + Math.sin(a) * 88} r="2.5" fill="currentColor" />;
            })}
          </svg>
          {/* shine sweep */}
          <span aria-hidden className="absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-white/10 to-transparent"
            style={{ animation: 'ftr-shine 5s ease-in-out infinite' }} />

          <div className="relative flex flex-col items-start gap-6 px-6 py-9 sm:px-10 sm:py-11 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.22em] text-gold-shimmer">
                <I name="sparkle" className="h-3.5 w-3.5 text-gold-bright" />
                {isEn ? 'Begin Your Celebration' : isHi ? 'अपना शुभारंभ करें' : 'तुमच्या शुभारंभाला सुरुवात करा'}
              </p>
              <h2 className="font-display text-2xl font-bold leading-snug text-ivory sm:text-3xl">
                {isEn ? (
                  <>Your event deserves a <span className="ftr-shimmer-text">royal invitation</span>.</>
                ) : isHi ? (
                  <>आपके उत्सव को मिले <span className="ftr-shimmer-text">शाही निमंत्रण</span> का सम्मान।</>
                ) : (
                  <>तुमच्या सोहळ्याला मिळू द्या <span className="ftr-shimmer-text">शाही पत्रिकेची</span> शोभा.</>
                )}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ivory/70">
                {isEn
                  ? 'Design in minutes · preview at 60 FPS · export MP4 reels · print with 3mm bleed guarantee.'
                  : isHi
                    ? 'मिनटों में डिज़ाइन · 60 FPS प्रिव्यू · MP4 रील्स एक्सपोर्ट · 3 मिमी ब्लीड गारंटी के साथ प्रिंट.'
                    : 'मिनिटांत डिझाइन · ६० FPS प्रिव्ह्यू · MP4 रील्स एक्सपोर्ट · ३ मिमी ब्लीड हमीसह प्रिंट.'}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link href="/create"
                className="group relative inline-flex min-h-12 items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-gold-bright via-gold to-gold-bright px-6 text-sm font-black text-maroon-deep shadow-lg transition-all duration-300 hover:scale-[1.04] hover:shadow-gold/50">
                <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/40 blur-sm" style={{ animation: 'ftr-shine 3s ease-in-out infinite' }} />
                <I name="sparkle" className="h-4 w-4" />
                <span className="relative">{isEn ? 'Create Card' : isHi ? 'पत्रिका बनाएँ' : 'पत्रिका तयार करा'}</span>
                <I name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/studio"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ivory/40 px-6 text-sm font-bold text-ivory transition-all duration-300 hover:border-gold-bright hover:bg-ivory/10 hover:text-gold-shimmer">
                <I name="video" className="h-4 w-4" />
                {isEn ? 'Open Studio' : isHi ? 'स्टूडियो खोलें' : 'स्टुडिओ उघडा'}
              </Link>
            </div>
          </div>
          {/* gold hairline base */}
          <div aria-hidden className="h-1 bg-linear-to-r from-transparent via-gold-bright to-transparent" />
        </div>
      </div>

      {/* ═══════ 2 · TRUST GUARANTEE BAND ═══════ */}
      <div ref={trust.ref} className="shell relative py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {trustSeals.map((seal, i) => (
            <div key={seal.title}
              className={`group relative overflow-hidden rounded-2xl border border-gold/30 bg-white/65 p-4 shadow-xs backdrop-blur-xs transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/70 hover:bg-white/85 hover:shadow-[0_18px_44px_-14px_rgba(212,175,55,0.4)] ${trust.shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
              style={{ transitionDelay: trust.shown ? `${i * 90}ms` : '0ms' }}>
              {/* corner glint */}
              <span aria-hidden className="absolute -right-6 -top-6 size-14 rounded-full bg-gold/10 blur-xl transition-all duration-500 group-hover:bg-gold/25" />
              <div className="flex items-start gap-3">
                <span aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-maroon via-maroon-rich to-maroon-deep text-lg shadow-md ring-1 ring-gold/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {seal.icon}
                </span>
                <div>
                  <h4 className="text-[13px] font-bold leading-snug text-maroon">{seal.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal-muted">{seal.desc}</p>
                </div>
              </div>
              <span aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 scale-x-0 bg-linear-to-r from-transparent via-gold-bright to-transparent transition-transform duration-500 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ 3 · MAIN FOOTER GRID ═══════ */}
      <div ref={main.ref} className="shell relative grid grid-cols-1 gap-10 border-t border-gold/25 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand column */}
        <div className={`transition-all duration-700 ${main.shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <Link href="/" className="group inline-flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <div className="relative">
              <svg aria-hidden viewBox="0 0 100 100" className="ftr-anim absolute -inset-2 text-gold/40 transition-colors group-hover:text-gold"
                style={{ animation: 'ftr-spin 30s linear infinite' }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 7" />
              </svg>
              <span className="relative grid size-12 place-items-center rounded-2xl bg-linear-to-br from-maroon via-maroon-rich to-maroon-deep text-gold-shimmer shadow-lg ring-1 ring-gold/40 transition group-hover:scale-105">
                <span className="font-script text-2xl font-bold leading-none">मा</span>
              </span>
            </div>
            <div className="leading-tight">
              <span className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-maroon">माझी पत्रिका</span>
                <span className="ftr-shimmer-text rounded-md border border-gold/40 bg-maroon-deep px-2 py-0.5 text-[10px] font-black tracking-widest">PRO</span>
              </span>
              <span className="font-ui block text-[10.5px] uppercase tracking-[0.24em] text-charcoal-muted">Mazi Patrika • Maha OS</span>
            </div>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-charcoal-soft">
            {isEn
              ? 'Where Marathi culture meets cutting-edge technology — create invitations, find muhurats, allocate budgets, and manage vendors all in one unified workspace.'
              : isHi
                ? 'मराठी संस्कृति और आधुनिक तकनीक का सुंदर संगम — निमंत्रण बनाएं, शुभ मुहूर्त खोजें, बजट संभालें और सभी विक्रेताओं को एक एकीकृत कार्यक्षेत्र में प्रबंधित करें.'
                : 'मराठी संस्कृती आणि आधुनिक तंत्रज्ञानाचा संगम — पत्रिका तयार करा, मुहूर्त शोधा, बजेट सांभाळा, पाहुणे व विक्रेते एकाच जोडलेल्या वर्कस्पेसमध्ये नियंत्रित करा.'}
          </p>

          {/* Engine + origin badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-ivory px-3.5 py-1.5 text-[11px] font-semibold text-gold-deep shadow-2xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-leaf-500" style={{ animation: 'ftr-ping 2.2s cubic-bezier(0,0,.2,1) infinite' }} />
                <span className="relative inline-flex size-2 rounded-full bg-leaf-500" />
              </span>
              {isEn ? `Panchang Engine ${EPHEMERIS_VERSION}` : isHi ? `पंचांग इंजन ${EPHEMERIS_VERSION}` : `पंचांग इंजिन ${EPHEMERIS_VERSION}`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-ivory px-3.5 py-1.5 text-[11px] font-semibold text-gold-deep shadow-2xs">
              {isEn ? 'Built for Maharashtra' : isHi ? 'महाराष्ट्र निर्मित' : 'महाराष्ट्र निर्मित'}
              <span aria-hidden="true">🇮🇳</span>
            </span>
          </div>

          {/* Social suite */}
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-muted">
              {isEn ? 'Follow the festivities' : isHi ? 'उत्सव से जुड़ें' : 'सोहळ्याशी जोडले जा'}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {social.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.label}
                  className="grid size-10 place-items-center rounded-xl border border-gold/35 bg-white/70 text-charcoal-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-linear-to-br hover:from-maroon hover:to-maroon-deep hover:text-gold-shimmer hover:shadow-lg">
                  <I name={s.name} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Link columns */}
        {columns.map((column, ci) => (
          <nav key={column.title} aria-label={column.title}
            className={`transition-all duration-700 ${main.shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            style={{ transitionDelay: main.shown ? `${120 + ci * 100}ms` : '0ms' }}>
            <p className="font-display relative inline-block text-xs font-bold uppercase tracking-[0.18em] text-maroon">
              {column.title}
              <span aria-hidden className="absolute -bottom-1.5 left-0 h-0.5 w-8 rounded-full bg-linear-to-r from-gold-bright to-transparent" />
            </p>
            <ul className="mt-5 space-y-1">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}
                    className="group inline-flex min-h-9 items-center gap-1.5 rounded-lg text-[13px] text-charcoal-soft transition-all duration-200 hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-gold/60 transition-all duration-300 group-hover:w-3 group-hover:bg-gold-bright" />
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* ═══════ 4 · PARTNER STRIP ═══════ */}
      <div className="relative border-y border-gold/25 bg-linear-to-r from-maroon-deep via-maroon to-maroon-deep">
        <div aria-hidden className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle,#f0c048 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="shell relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 py-4 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-black tracking-wide text-gold-shimmer">
            <I name="shield" className="h-4 w-4 text-gold-bright" />
            {isEn ? 'For Partners & Vendors' : isHi ? 'साझेदारों व विक्रेताओं के लिए' : 'भागीदार व व्हेंडरांसाठी'}
          </p>
          <span aria-hidden className="hidden h-4 w-px bg-gold/30 sm:block" />
          <p className="text-xs text-ivory/75">
            {isEn
              ? 'WYSIWYP Proofing · 60 FPS Editor · Double-Entry Ledger · Escrow Payouts'
              : isHi
                ? 'WYSIWYP प्रूफिंग · ६० FPS एडिटर · दोहरी प्रविष्टि बहीखाता · एस्क्रो भुगतान'
                : 'WYSIWYP प्रूफिंग · ६० FPS एडिटर · दुहेरी-नोंदणी लेजर · एस्क्रो सेटलमेंट'}
          </p>
          <span aria-hidden className="hidden h-4 w-px bg-gold/30 sm:block" />
          <Link href="/api/health"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 text-xs font-bold text-gold-shimmer transition hover:border-gold-bright hover:bg-gold/20">
            {isEn ? 'System Status' : isHi ? 'सिस्टम स्थिति' : 'सिस्टम स्थिती'}
            <I name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ═══════ 5 · FEATURE MARQUEE TICKER ═══════ */}
      <div ref={ticker.ref} className={`ftr-marquee overflow-hidden bg-ivory-deep/70 py-3 transition-opacity duration-700 ${ticker.shown ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true">
        <div className="ftr-track flex w-max items-center gap-10 whitespace-nowrap" style={{ animation: 'ftr-marquee 36s linear infinite' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.22em] text-charcoal-muted">
              {item}
              <span className="text-gold-deep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════ 6 · BOTTOM BAR ═══════ */}
      <div className="border-t border-gold/25 bg-ivory-deep/60 py-6">
        <div className="shell flex flex-col items-center justify-between gap-5 lg:flex-row">
          {/* Copyright */}
          <p className="order-2 text-center text-xs leading-relaxed text-charcoal-muted lg:order-1 lg:text-left">
            {isEn
              ? '© 2026 Mazi Patrika. All rights reserved. Precision astronomical calculations per Surya Siddhanta.'
              : '© २०२६ माझी पत्रिका. सर्व हक्क राखीव. सूर्यसिद्धांत पंचांग गणितावर आधारित.'}
          </p>

          {/* Center mantra */}
          <p className="ftr-shimmer-text order-1 text-sm font-semibold tracking-wide lg:order-2">
            {isEn ? '॥ Shubham Bhavatu ॥' : '॥ शुभं भवतु ॥'}
          </p>

          {/* Legal + back to top */}
          <div className="order-3 flex items-center gap-1.5 text-xs text-charcoal-muted">
            <Link href="/robots.txt" className="rounded-lg px-2.5 py-2 transition hover:bg-gold/10 hover:text-maroon">Robots</Link>
            <Link href="/sitemap.xml" className="rounded-lg px-2.5 py-2 transition hover:bg-gold/10 hover:text-maroon">Sitemap</Link>
            <Link href="/api/health" className="rounded-lg px-2.5 py-2 transition hover:bg-gold/10 hover:text-maroon">Health</Link>
            <button type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={isEn ? 'Back to top' : isHi ? 'ऊपर जाएँ' : 'वर जा'}
              className="ml-2 grid size-11 place-items-center rounded-full bg-linear-to-br from-maroon via-maroon-rich to-maroon-deep text-gold-shimmer shadow-lg ring-1 ring-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold/40 hover:ring-gold">
              <I name="up" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}