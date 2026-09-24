import Link from "next/link";
import { InvitationCard } from "@/components/invitation-card";
import { Reveal } from "@/components/reveal";
import {
  Chip,
  Eyebrow,
  Icon,
  OrnamentDivider,
  Stat,
  VerifiedBadge,
  type IconName,
} from "@/components/ui";
import { DEFAULT_DESIGN, IMG, TEMPLATES } from "@/lib/arch-data";

export const metadata = {
  title: "माझी पत्रिका — Create. Plan. Discover. Book. Print. Manage. Celebrate.",
  description:
    "मराठी कुटुंबांसाठी संपूर्ण कार्यक्रम व्यवस्थापन — पत्रिका स्टुडिओ, मुहूर्त-सुसंगत पंचांग, पडताळलेले विक्रेते, बजेट व पाहुणे व्यवस्थापन एकाच वर्कस्पेसमध्ये.",
  openGraph: {
    title: "माझी पत्रिका — पहिल्या अक्षरापासून शेवटच्या आशीर्वादापर्यंत",
    description:
      "पत्रिका डिझाइन, पंचांग-मुहूर्त, विक्रेते, बजेट व RSVP — महाराष्ट्रीयन सोहळ्यांसाठी एकच जोडलेले वर्कस्पेस.",
    locale: "mr_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <Marquee />
      <Pillars />
      <StudioShowcase />
      <EventOsShowcase />
      <Marketplace />
      <Journey />
      <Pricing />
      <Testimonials />
      <CtaBand />
    </div>
  );
}

/* ══ HERO ═════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="bg-weave relative">
      <div className="pointer-events-none absolute -top-32 -right-40 h-[480px] w-[480px] rounded-full bg-gold-400/15 blur-3xl" />
      <div className="pointer-events-none absolute top-64 -left-52 h-[420px] w-[420px] rounded-full bg-maroon-700/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip tone="maroon">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-maroon-700" />
              पुणे · १२०+ सत्यापित व्हेंडर्ससह लाँच
            </Chip>
            <Link
              href="/panchang"
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-400/10 px-3 py-1 text-[12px] font-bold text-maroon-900 transition hover:bg-gold-400/20"
            >
              <Icon name="calendar" className="h-3.5 w-3.5 text-gold-600" />
              आजचे पंचांग व शुभ मुहूर्त →
            </Link>
          </div>

          <h1 className="font-marathi-display mr-tracking mt-6 text-[42px] leading-[1.15] font-bold text-maroon-900 text-balance sm:text-[56px]">
            उत्सव ठरवला?
            <br />
            <span className="text-maroon-700">उरलेलं सगळं</span>{" "}
            <span className="relative inline-block">
              <span className="relative z-10">आमच्यावर.</span>
              <svg viewBox="0 0 220 12" className="absolute -bottom-2 left-0 w-full text-gold-500" aria-hidden>
                <path d="M4 8c40-6 140-6 212-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-[16.5px] leading-relaxed text-ink-700">
            पत्रिका बनवा, इव्हेंट प्लॅन करा, व्हेंडर शोधा-बुक करा, छापून घ्या आणि साजरा करा —{" "}
            <strong className="font-bold text-maroon-800">एकाच जोडलेल्या वर्कस्पेसमधून.</strong>{" "}
            AI म्हणतो: <em>“१५० माणसं, पुणे, १ लाख बजेट”</em> — आणि संपूर्ण इव्हेंट तयार.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/studio"
              className="group inline-flex items-center gap-2.5 rounded-full bg-maroon-800 py-3.5 pr-5 pl-7 text-[15px] font-bold text-ivory-100 shadow-luxe transition hover:bg-maroon-700 hover:shadow-glow"
            >
              पत्रिका बनवा — मोफत
              <Icon name="arrowRight" className="h-4 w-4 text-gold-300 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
            </Link>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2.5 rounded-full border border-maroon-800/25 bg-white/60 px-6 py-3.5 text-[15px] font-bold text-maroon-800 transition hover:border-gold-500 hover:bg-white"
            >
              <Icon name="search" className="h-4.5 w-4.5" />
              व्हेंडर शोधा
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-white/40 px-5 py-3.5 text-[14px] font-bold text-ink-700 transition hover:border-gold-500 hover:bg-white"
            >
              <Icon name="layers" className="h-4 w-4 text-maroon-700" />
              इव्हेंट ओएस
            </Link>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-maroon-900/10 pt-8">
            <Stat value="४० से." label="पत्रिका तयार — सरासरी वेळ" />
            <Stat value="२५" label="इव्हेंट कॅटेगरीज" />
            <Stat value="₹०" label="सुरुवातीची किंमत" />
          </div>
        </div>

        {/* Right — living invitation */}
        <div className="animate-fade-up relative mx-auto w-full max-w-[420px]" style={{ animationDelay: "150ms" }}>
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-gold-400/20 via-transparent to-maroon-700/15 blur-2xl" />
          <div className="animate-float [--tilt:2.5deg]">
            <InvitationCard design={DEFAULT_DESIGN} className="shadow-card ring-1 ring-maroon-900/10" />
          </div>

          {/* floating chips */}
          <div className="animate-float-slow absolute -left-10 top-14 hidden rounded-xl border border-ivory-300 bg-white/95 p-3.5 shadow-card backdrop-blur sm:block [--tilt:-3deg]">
            <div className="flex items-center gap-3">
              <ReadyRingMini value={82} />
              <div>
                <p className="text-[11px] font-extrabold tracking-wider text-ink-500 uppercase">Readiness</p>
                <p className="text-[15px] font-bold text-leaf-700">इव्हेंट ८२% तयार</p>
              </div>
            </div>
          </div>

          <div className="animate-float-slow absolute -right-6 bottom-16 hidden rounded-xl border border-ivory-300 bg-white/95 p-3.5 shadow-card backdrop-blur sm:block [--tilt:2deg]" style={{ animationDelay: "1.2s" }}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-600/12 text-leaf-700">
                <Icon name="check" strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-ink-900">बुकिंग कन्फर्म ✓</p>
                <p className="text-[11.5px] text-ink-500">कॅटरर · ₹४५०/ताट</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -bottom-5 left-8 hidden items-center gap-2 rounded-full bg-maroon-900 py-2 pr-4 pl-2.5 text-[12px] font-bold text-gold-200 shadow-luxe sm:flex [--tilt:-1deg]" style={{ animationDelay: "0.6s" }}>
            <Icon name="whatsapp" className="h-4 w-4 text-gold-300" />
            RSVP आलं — ३४ पाहुणे ✓
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadyRingMini({ value }: { value: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-11 w-11">
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#ece1c6" strokeWidth="5" />
        <circle
          cx="22" cy="22" r={r} fill="none" stroke="#3e6b4f" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-extrabold text-leaf-700">
        {value}%
      </span>
    </div>
  );
}

/* ══ MARQUEE ══════════════════════════════════════════════════════════ */

const MARQUEE_ITEMS = [
  "शुभ विवाह", "साखरपुडा", "वाढदिवस", "नामकरण", "गृहप्रवेश", "सत्यनारायण पूजा",
  "बोडण", "हळद", "पागोटे", "स्नेहसंमेलन", "ग्रॅज्युएशन", "उद्योग पूजा",
];

function Marquee() {
  return (
    <div className="border-y border-gold-500/25 bg-maroon-900 py-4">
      <div className="flex overflow-hidden" aria-hidden>
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-marathi-display text-[15px] text-gold-200">{m}</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/70" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ PILLARS ══════════════════════════════════════════════════════════ */

const PILLARS: { icon: IconName; mr: string; en: string; desc: string; href: string }[] = [
  { icon: "brush", mr: "क्रिएट स्टुडिओ", en: "Create Studio", desc: "पैठणी, वारली, राजमुद्रा — २५+ प्रीमियम टेम्पलेट्स. बायोडेटा, पत्रिका, व्हिडिओ आमंत्रण, इव्हेंट वेबसाइट व QR — मिनिटांत.", href: "/studio" },
  { icon: "layers", mr: "इव्हेंट ओएस", en: "Event OS", desc: "पाहुणे यादी, बजेट ट्रॅकर, चेकलिस्ट, मुहूर्त आणि तयारी-स्कोर. काका, मामी, आत्या — नातेवाईकांसह संपूर्ण इव्हेंट एका पानावर.", href: "/events" },
  { icon: "search", mr: "डिस्कव्हरी", en: "Discovery", desc: "सत्यपडताळलेले व्हेन्यू, डेकोरेटर, फोटोग्राफर, कॅटरर — किंमत, उपलब्धता आणि खऱ्या रिव्ह्यूंसह तुलना करा.", href: "/vendors" },
  { icon: "wallet", mr: "कॉमर्स", en: "Commerce", desc: "चौकशी → कोट → बुकिंग → पेमेंट → रिफंड. स्वतंत्र लेजर, पारदर्शक कमिशन आणि ठेव-सुरक्षा धोरण.", href: "/vendor-os" },
  { icon: "building", mr: "व्हेंडर ओएस", en: "Vendor OS", desc: "लीड्स, कोट्स, कॅलेंडर, पेमेंट्स आणि रिव्ह्यू — व्हेंडरसाठी संपूर्ण बिझनेस डॅशबोर्ड. उत्पन्न वाढवा, वेळ वाचवा.", href: "/vendor-os" },
  { icon: "printer", mr: "प्रिंट व प्रसार", en: "Print & Share", desc: "WYSIWYP — प्रिंट-परफेक्ट पत्रिका. ब्लीड, क्रॉप मार्क्स, गोल्ड फॉइल प्रिव्ह्यू. २४–४८ तासांत घरपोच.", href: "/studio" },
];

function Pillars() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>एक प्लॅटफॉर्म · सहा स्तंभ</Eyebrow>
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 text-balance sm:text-[44px]">
          तयारीपासून तो <span className="text-gold-600">उत्सवापर्यंत</span> — सगळं एकाच छताखाली
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-maroon-900/10 ring-1 ring-maroon-900/10 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal key={p.en} delay={i * 60}>
            <Link href={p.href} className="group relative block h-full bg-ivory-50 p-8 transition-colors duration-300 hover:bg-white">
              <span className="font-display absolute top-6 right-7 text-[13px] font-semibold text-gold-600/80">
                ०{i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-maroon-800/8 text-maroon-800 ring-1 ring-maroon-800/15 transition-all duration-300 group-hover:bg-maroon-800 group-hover:text-gold-300 group-hover:shadow-luxe">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <h3 className="font-marathi-display mt-5 text-[21px] font-bold text-ink-900">{p.mr}</h3>
              <p className="mt-0.5 text-[10.5px] font-extrabold tracking-[0.24em] text-gold-600 uppercase">{p.en}</p>
              <p className="mt-3.5 text-[14px] leading-relaxed text-ink-500">{p.desc}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══ STUDIO SHOWCASE (dark) ═══════════════════════════════════════════ */

function StudioShowcase() {
  const mini = TEMPLATES;
  return (
    <section className="bg-paisley-dark py-24 text-ivory-100">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <Eyebrow dark>क्रिएट स्टुडिओ</Eyebrow>
          <h2 className="font-marathi-display text-4xl leading-tight font-bold text-balance sm:text-[42px]">
            पत्रिका नव्हे —{" "}
            <span className="gold-foil">हस्तकलेचा ठसा</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ivory-100/70">
            हरफबझ-ग्रेड मराठी टायपोग्राफी, स्मार्ट लेआउट इंजिन आणि प्रिंट-परफेक्ट एक्सपोर्ट.
            नावं बदला — कार्ड लगेच जुळवून घेतं. अक्षरं ओव्हरफ्लो होत नाहीत, कधीच.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: "sparkle" as IconName, t: "स्मार्ट लेआउट इंजिन", d: "मोठी नावं आली की फॉन्ट आपोआप जुळतो — ६० FPS एडिटर" },
              { icon: "shield" as IconName, t: "क्वालिटी गार्ड", d: "डाउनलोडपूर्वी ५ तपासण्या — ओव्हरफ्लो, तारीख-सुसंगती, हरवलेली फील्ड्स" },
              { icon: "printer" as IconName, t: "WYSIWYP प्रिंट", d: "ब्लीड, क्रॉप मार्क्स, गोल्ड फॉइल प्रिव्ह्यू — जे दिसतं तेच छापलं जातं" },
              { icon: "qr" as IconName, t: "QR + इव्हेंट वेबसाइट", d: "प्रत्येक पत्रिकेसोबत पाहुण्यांसाठी लाइव्ह डिजिटल पान" },
            ].map((f) => (
              <li key={f.t} className="flex gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
                  <Icon name={f.icon} className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[15px] font-bold">{f.t}</p>
                  <p className="text-[13.5px] text-ivory-100/60">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/studio" className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-gold-500 px-6 py-3.5 text-[15px] font-bold text-maroon-950 transition hover:bg-gold-400">
            स्टुडिओ उघडा
            <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </Reveal>

        <Reveal delay={120} className="relative">
          <div className="grid grid-cols-2 gap-5">
            {mini.map((t, i) => (
              <Link
                key={t.id}
                href="/studio"
                className={`group relative overflow-hidden rounded-xl ring-1 ring-gold-400/25 transition duration-500 hover:-translate-y-2 hover:shadow-glow ${i % 2 === 1 ? "translate-y-8" : ""}`}
              >
                <InvitationCard
                  design={{ ...DEFAULT_DESIGN, template: t.id, personA: "तेजस देशमुख", personB: "अनन्या कुलकर्णी" }}
                  className="aspect-[3/4.4]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/95 via-maroon-950/60 to-transparent p-3.5 pt-10">
                  <p className="font-marathi-display text-[14px] font-bold text-gold-200">{t.name}</p>
                  <p className="text-[11px] text-ivory-100/60">₹{t.price} · {t.en}</p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══ EVENT OS SHOWCASE ════════════════════════════════════════════════ */

function EventOsShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>इव्हेंट ओएस</Eyebrow>
          <h2 className="font-marathi-display text-4xl leading-tight font-bold text-maroon-900 text-balance sm:text-[42px]">
            तुमचा उत्सव, <span className="text-gold-600">एका कमांड सेंटरमधून</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-700">
            तयारी-स्कोर सांगतो काय उरलंय. बजेट दाखवतं कुठे जास्त खर्च होतोय. पाहुण्यांचे
            RSVP, जेवणाची पसंती, मुहूर्त — सगळं रिअल-टाइम.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: "guests" as IconName, t: "पाहुणे व्यवस्थापन — गट, बाजू, जेवण, निवास" },
              { icon: "wallet" as IconName, t: "बजेट — अंदाज विरुद्ध प्रत्यक्ष, श्रेणीनुसार" },
              { icon: "checklist" as IconName, t: "चेकलिस्ट — कार्य, मुदत, प्राधान्य" },
              { icon: "calendar" as IconName, t: "पंचांग-आधारित मुहूर्त सूचना" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3.5 rounded-xl border border-maroon-900/10 bg-white/70 px-4 py-3 transition hover:border-gold-500/50 hover:shadow-luxe">
                <Icon name={x.icon} className="h-5 w-5 shrink-0 text-maroon-700" />
                <span className="text-[14.5px] font-semibold text-ink-800">{x.t}</span>
              </div>
            ))}
          </div>
          <Link href="/events" className="group mt-8 inline-flex items-center gap-2 text-[15px] font-bold text-maroon-800 hover:text-maroon-600">
            डेमो इव्हेंट पाहा
            <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl border border-maroon-900/12 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-maroon-900/10 bg-ivory-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-maroon-600/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-leaf-600/60" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.18em] text-ink-400 uppercase">mazi-patrika · इव्हेंट वर्कस्पेस</span>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-[auto_1fr]">
              <div className="text-center">
                <ReadinessBig value={82} />
                <p className="mt-2 text-[12px] font-bold text-ink-500">तयारी-स्कोर</p>
              </div>
              <div className="space-y-3.5">
                {[
                  { t: "व्हेन्यू — शिवनेरी लॉन्स", s: "बुक झालं ✓", ok: true },
                  { t: "फोटोग्राफी — अथर्व मोमेंट्स", s: "बुक झालं ✓", ok: true },
                  { t: "डेकोरेशन — कोट येऊ घातलंय", s: "प्रतिक्षेत", ok: false },
                  { t: "३४ पाहुण्यांचे RSVP बाकी", s: "स्मरणपत्र पाठवा", ok: false },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between rounded-lg bg-ivory-100 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`grid h-5 w-5 place-items-center rounded-full ${r.ok ? "bg-leaf-600/15 text-leaf-700" : "bg-gold-500/20 text-gold-700"}`}>
                        {r.ok ? <Icon name="check" className="h-3 w-3" strokeWidth={2.6} /> : <Icon name="clock" className="h-3 w-3" strokeWidth={2.4} />}
                      </span>
                      <span className="text-[13px] font-semibold text-ink-800">{r.t}</span>
                    </div>
                    <span className={`text-[11px] font-bold ${r.ok ? "text-leaf-700" : "text-gold-700"}`}>{r.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReadinessBig({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f4eddc" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} className="ring-anim"
        />
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7a24f" />
            <stop offset="1" stopColor="#3e6b4f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div>
          <div className="font-display text-[34px] leading-none font-semibold text-maroon-800">{value}%</div>
        </div>
      </div>
    </div>
  );
}

/* ══ MARKETPLACE ══════════════════════════════════════════════════════ */

const MKT_CARDS = [
  { img: IMG.banquet, mr: "लॉन आणि हॉल", n: "३८ सत्यापित" },
  { img: IMG.mandapStage, mr: "डेकोरेशन", n: "२६ सत्यापित" },
  { img: IMG.coupleRitual, mr: "फोटोग्राफी", n: "३१ सत्यापित" },
  { img: IMG.thali, mr: "कॅटरिंग", n: "२४ सत्यापित" },
];

function Marketplace() {
  return (
    <section className="bg-ivory-200/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>मार्केटप्लेस</Eyebrow>
            <h2 className="font-marathi-display max-w-xl text-4xl leading-tight font-bold text-maroon-900 text-balance sm:text-[42px]">
              पडताळलेले व्हेंडर्स. <span className="text-gold-600">पारदर्शक व्यवहार.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-ink-500">
            “बेस्ट फोटोग्राफर” असे बिरुद नाही — पुरावे आहेत: पूर्ण झालेली बुकिंग्स,
            प्रतिसाद-दर, ताजे कॅलेंडर आणि फक्त सत्यापित बुकिंगनंतरचे रिव्ह्यू.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MKT_CARDS.map((c, i) => (
            <Reveal key={c.mr} delay={i * 70}>
              <Link href="/vendors" className="group relative block overflow-hidden rounded-2xl shadow-card">
                <img src={c.img} alt={c.mr} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/90 via-maroon-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2"><VerifiedBadge compact /></div>
                  <p className="font-marathi-display mt-2 text-[22px] font-bold text-ivory-100">{c.mr}</p>
                  <p className="text-[12px] font-semibold text-gold-300">{c.n} · पुणे →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100} className="mt-10 grid gap-4 rounded-2xl border border-gold-500/30 bg-white p-6 sm:grid-cols-3">
          {[
            { icon: "shield" as IconName, h: "७-पदरी सत्यापन", d: "ओळख, व्यवसाय, GST, फोन, ठिकाण, पोर्टफोलिओ, रिव्ह्यू" },
            { icon: "wallet" as IconName, h: "स्वतंत्र लेजर", d: "गेटवे म्हणजे सत्य नाही — दर व्यवहाराचा आमचा हिशोब" },
            { icon: "bell" as IconName, h: "बॅकअप व्हेंडर", d: "फोटोग्राफर माघारला? बजेट-जुळणारे ३ पर्याय लगेच" },
          ].map((x) => (
            <div key={x.h} className="flex gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon-800/8 text-maroon-800 ring-1 ring-maroon-800/15">
                <Icon name={x.icon} className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-ink-900">{x.h}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{x.d}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ══ JOURNEY ══════════════════════════════════════════════════════════ */

const STEPS = [
  { icon: "brush" as IconName, t: "तयार करा", d: "४० सेकंदात सुंदर पत्रिका — टेम्पलेट निवडा, तपशील भरा" },
  { icon: "checklist" as IconName, t: "आराखडा करा", d: "पाहुणे, बजेट, मुहूर्त आणि चेकलिस्ट एका वर्कस्पेसमध्ये" },
  { icon: "search" as IconName, t: "शोधा व बुक करा", d: "कोट्सची तुलना करा, ठेव भरा, बुकिंग निश्चित" },
  { icon: "diya" as IconName, t: "साजरा करा", d: "QR स्कॅन करून पाहुणे येतात — तुम्ही फक्त आनंद घ्या" },
];

function Journey() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <OrnamentDivider className="mb-8" />
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 text-balance sm:text-[42px]">
          चार पावलं — <span className="text-gold-600">आयुष्यभराची आठवण</span>
        </h2>
      </Reveal>
      <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="gold-hairline absolute top-7 right-[12%] left-[12%] hidden h-px lg:block" aria-hidden />
        {STEPS.map((s, i) => (
          <Reveal key={s.t} delay={i * 90} className="relative text-center">
            <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full bg-maroon-800 text-gold-300 shadow-luxe ring-4 ring-ivory-100">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <p className="mt-4 text-[11px] font-extrabold tracking-[0.24em] text-gold-600">पावल ०{i + 1}</p>
            <h3 className="font-marathi-display mt-1 text-[20px] font-bold text-ink-900">{s.t}</h3>
            <p className="mx-auto mt-2 max-w-[240px] text-[13.5px] leading-relaxed text-ink-500">{s.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══ PRICING ══════════════════════════════════════════════════════════ */

const TIERS = [
  {
    name: "फ्री", price: "₹०", per: "कायमचं मोफत", hot: false,
    feats: ["प्रोफाइल + पोर्टफोलिओ", "महिना ५ चौकशा", "बेसिक अ‍ॅनालिटिक्स"],
  },
  {
    name: "ग्रोथ", price: "₹१,४९९", per: "/महिना + ८% कमिशन", hot: true,
    feats: ["२५ पात्र लीड क्रेडिट्स", "कॅलेंडर, कोट्स व सीआरएम", "व्हॉट्सअ‍ॅप टूल्स", "पहिली २ बुकिंग्स ०% कमिशन"],
  },
  {
    name: "प्रो", price: "₹३,९९९", per: "/महिना + ३% कमिशन", hot: false,
    feats: ["जास्त लीड वाटप", "प्रगत सीआरएम व पॅकेजेस", "जाहिराती व प्राधान्य", "टीम सदस्य"],
  },
];

function Pricing() {
  return (
    <section className="bg-paisley-dark py-24 text-ivory-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>व्हेंडर ओएस — किंमत</Eyebrow>
          <h2 className="font-marathi-display text-4xl font-bold text-balance sm:text-[44px]">
            व्हेंडरची कमाई वाढली, <span className="gold-foil">तरच आमची कमाई</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className={`relative h-full rounded-2xl p-8 ${t.hot ? "bg-gradient-to-b from-gold-500/20 to-gold-500/5 ring-2 ring-gold-400/70 shadow-glow" : "bg-white/[0.05] ring-1 ring-white/12"}`}>
                {t.hot && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-[11px] font-extrabold tracking-wider text-maroon-950">
                    सर्वाधिक लोकप्रिय
                  </span>
                )}
                <p className="text-[12px] font-extrabold tracking-[0.22em] text-gold-400 uppercase">{t.name}</p>
                <p className="font-display mt-3 text-[42px] leading-none font-semibold">{t.price}</p>
                <p className="mt-2 text-[13px] text-ivory-100/55">{t.per}</p>
                <ul className="mt-7 space-y-3">
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-ivory-100/80">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={2.4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/vendor-os" className={`mt-8 block rounded-full py-3 text-center text-[14px] font-bold transition ${t.hot ? "bg-gold-500 text-maroon-950 hover:bg-gold-400" : "bg-white/10 text-ivory-100 ring-1 ring-white/20 hover:bg-white/20"}`}>
                  सुरुवात करा
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══ TESTIMONIALS ═════════════════════════════════════════════════════ */

function Testimonials() {
  const T = [
    { q: "बाईच्या नावानं पत्रिका १० मिनिटात बनली. काका-मामींची नावं अचूक बसली — आई थक्क झाली!", a: "स्नेहा कुलकर्णी", r: "विवाह यजमान · पुणे" },
    { q: "तीन कॅटररचे कोट एकाच स्क्रीनवर तुलनले. जो योग्य वाटला तोच बुक केला — फोनवर भटकायची गरजच नाही.", a: "प्रभुलकर देशमुख", r: "वडील · साखरपुडा" },
    { q: "आधी दर आठवड्याला फोन करून चौकशी यायची. आता लीड्स आपोआप येतात आणि कॅलेंडरवर दिसतात. व्यवसाय दुप्पट.", a: "संदीप जाधव", r: "जाधव डेकोरेटर्स · ग्रोथ प्लॅन" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <Eyebrow>यजमान आणि व्हेंडर्स बोलतात</Eyebrow>
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 sm:text-[42px]">
          विश्वास हाच <span className="text-gold-600">शृंगार</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {T.map((t, i) => (
          <Reveal key={t.a} delay={i * 80}>
            <figure className="relative h-full rounded-2xl border border-maroon-900/10 bg-white p-7 shadow-card">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-gold-500" fill="currentColor" aria-hidden>
                <path d="M10 7H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3v-1c0-3-1-4-3-5l1-3c2 .5 4 2 4 5zm11 0h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3v-1c0-3-1-4-3-5l1-3c2 .5 4 2 4 5z" opacity="0.8" />
              </svg>
              <blockquote className="font-marathi-display mt-4 text-[16.5px] leading-relaxed text-ink-800">
                {t.q}
              </blockquote>
              <figcaption className="mt-6 border-t border-ivory-300 pt-4">
                <p className="text-[14px] font-bold text-maroon-800">{t.a}</p>
                <p className="text-[12px] text-ink-400">{t.r}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══ CTA ══════════════════════════════════════════════════════════════ */

function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-maroon-900 px-8 py-16 text-center shadow-card sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl" />
          <Icon name="diya" className="mx-auto h-10 w-10 text-gold-400" strokeWidth={1.4} />
          <h2 className="font-marathi-display mx-auto mt-5 max-w-2xl text-4xl leading-tight font-bold text-ivory-100 text-balance sm:text-[46px]">
            पुढला शुभ मुहूर्त जवळ येतोय. <span className="gold-foil">तयारीला लागा!</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-ivory-100/65">
            मोफत पत्रिकेपासून सुरुवात करा — ४० सेकंदांत. क्रेडिट कार्डची गरज नाही.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/studio" className="rounded-full bg-gold-500 px-8 py-4 text-[15.5px] font-bold text-maroon-950 shadow-luxe transition hover:bg-gold-400 hover:shadow-glow">
              आत्ताच पत्रिका बनवा
            </Link>
            <Link href="/events" className="rounded-full border border-gold-400/40 px-8 py-4 text-[15.5px] font-bold text-gold-200 transition hover:bg-gold-400/10">
              डेमो इव्हेंट पाहा
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
