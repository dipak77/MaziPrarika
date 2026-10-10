"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

type ActiveTab =
  | "dashboard"
  | "profile"
  | "analysis"
  | "accounting"
  | "messages"
  | "projects"
  | "settings"
  | "info";

interface MonthlyBar {
  id: string;
  label: string;
  heightPct: number;
  value: number;
  accent: boolean;
}

const MONTHLY_DATA: MonthlyBar[] = [
  { id: "Jan", label: "जाने", heightPct: 45, value: 1120, accent: true },
  { id: "Feb", label: "फेब्रु", heightPct: 88, value: 2240, accent: false },
  { id: "Mar", label: "मार्च", heightPct: 65, value: 1650, accent: true },
  { id: "Apr", label: "एप्रि", heightPct: 30, value: 750, accent: false },
  { id: "May", label: "मे", heightPct: 82, value: 2075, accent: true },
  { id: "Jun", label: "जून", heightPct: 58, value: 1450, accent: false },
  { id: "Jul", label: "जुलै", heightPct: 22, value: 560, accent: true },
  { id: "Aug", label: "ऑग", heightPct: 68, value: 1720, accent: false },
  { id: "Sep", label: "सप्टें", heightPct: 48, value: 1210, accent: true },
  { id: "Oct", label: "ऑक्टो", heightPct: 95, value: 2480, accent: false },
  { id: "Nov", label: "नोव्हे", heightPct: 60, value: 1530, accent: true },
  { id: "Dec", label: "डिसें", heightPct: 72, value: 1860, accent: false },
];

type SortKey = "month" | "asc" | "desc";

const SORT_OPTIONS: Array<{ id: SortKey; label: string }> = [
  { id: "month", label: "महिन्यानुसार" },
  { id: "asc", label: "रक्कम लहान → मोठा" },
  { id: "desc", label: "रक्कम मोठा → लहान" },
];

const SCHEDULE_DAYS = [
  { date: "03", day: "सोम", dots: ["var(--color-maroon)", "var(--color-gold-bright)"] },
  { date: "04", day: "मंगळ", dots: [] as string[] },
  { date: "05", day: "बुध", dots: ["var(--color-maroon)", "var(--color-paithani)", "var(--color-gold-bright)"] },
  { date: "06", day: "गुरु", dots: ["var(--color-haldi)"] },
  { date: "07", day: "शुक्र", dots: ["var(--color-maroon-soft)", "var(--color-paithani-light)"] },
];

interface ProjectRow {
  id: string;
  title: string;
  lead: string;
  role: string;
  date: string;
  status: "पूर्ण" | "चालू";
}

const INITIAL_PROJECTS: ProjectRow[] = [
  {
    id: "p1",
    title: "Dance studio- Webpage",
    lead: "Sriram Sarvade",
    role: "मुख्य कार्यकारी",
    date: "05 मार्च 2020",
    status: "पूर्ण",
  },
  {
    id: "p2",
    title: "Real Estate Homepage",
    lead: "Geeta Ingle",
    role: "व्यवस्थापक",
    date: "25 डिसें 2020",
    status: "चालू",
  },
  {
    id: "p3",
    title: "Royal Marathi Patrika UI",
    lead: "Dhaval Radadiya",
    role: "यूआय/यूएक्स डिझाइनर",
    date: "27 सप्टें 2026",
    status: "पूर्ण",
  },
  {
    id: "p4",
    title: "Heritage Vivah Biodata",
    lead: "Pooja Kulkarni",
    role: "प्रमुख कलाकार",
    date: "14 ऑक्टो 2026",
    status: "चालू",
  },
];

const TAB_LABELS: Record<ActiveTab, string> = {
  dashboard: "डॅशबोर्ड",
  profile: "प्रोफाइल",
  analysis: "विश्लेषण",
  accounting: "हिशेब",
  messages: "संदेश",
  projects: "प्रकल्प",
  settings: "सेटिंग्ज",
  info: "माहिती",
};

interface DaromaDashboardProps {
  eventCount: number;
  bookingCount: number;
  currentYear: number;
}

export function DaromaDashboard({ eventCount, bookingCount, currentYear }: DaromaDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyMode, setCurrencyMode] = useState<"USD" | "INR">("USD");
  const [selectedMonth, setSelectedMonth] = useState<string>("May");
  const [selectedDay, setSelectedDay] = useState<string>("05");
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [projects] = useState<ProjectRow[]>(INITIAL_PROJECTS);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const isINR = currencyMode === "INR";
  const currencyMult = isINR ? 88 : 1;

  useEffect(() => {
    if (!showSortDropdown) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSortDropdown]);

  const money = (value: number): string =>
    isINR
      ? `₹${Math.round(value * currencyMult).toLocaleString("en-IN")}`
      : `$${value.toLocaleString("en-US")}`;

  const sortedBars = [...MONTHLY_DATA];
  if (sortKey === "asc") sortedBars.sort((a, b) => a.value - b.value);
  if (sortKey === "desc") sortedBars.sort((a, b) => b.value - a.value);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.lead.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const kpis = [
    {
      id: "kpi-events",
      label: "एकूण कार्यक्रम",
      val: String(eventCount),
      note: "थेट डेटाबेसमधून",
      demo: false,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "kpi-bookings",
      label: "एकूण बुकिंग",
      val: String(bookingCount),
      note: "थेट डेटाबेसमधून",
      demo: false,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: "kpi-earning",
      label: "एकूण कमाई",
      val: isINR ? "₹18.2L" : "$22k",
      note: "डेमो डेटा",
      demo: true,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: "kpi-withdraw",
      label: "पैसे काढणे",
      val: isINR ? "₹8.3L" : "$10k",
      note: "डेमो डेटा",
      demo: true,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-ivory text-charcoal flex font-sans antialiased selection:bg-maroon selection:text-gold-shimmer">
      <aside className="w-56 sm:w-64 bg-maroon-deep text-ivory flex flex-col justify-between shrink-0 shadow-2xl z-30 select-none border-r border-maroon-950">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gold/15">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-maroon via-maroon-rich to-gold flex items-center justify-center shadow-lg shadow-maroon-950/60 p-1">
              <svg viewBox="0 0 24 24" className="size-6 text-gold-shimmer" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M9 3v18" />
                <path d="M14 8a4 4 0 0 1 0 8" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-ivory flex items-center gap-1.5">
                <span>Daroma</span>
                <span className="text-xs font-black uppercase tracking-widest text-gold-300 bg-maroon-900 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-xs text-ivory-500 font-medium tracking-wide">
                Mazi Studio OS
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              {
                id: "dashboard" as const,
                label: TAB_LABELS.dashboard,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="16" width="7" height="5" rx="1.5" />
                  </svg>
                ),
              },
              {
                id: "profile" as const,
                label: TAB_LABELS.profile,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
              {
                id: "analysis" as const,
                label: TAB_LABELS.analysis,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                ),
              },
              {
                id: "accounting" as const,
                label: TAB_LABELS.accounting,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="8" x2="10" y2="8" />
                    <line x1="6" y1="16" x2="14" y2="16" />
                  </svg>
                ),
              },
              {
                id: "messages" as const,
                label: TAB_LABELS.messages,
                badge: true,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                id: "projects" as const,
                label: TAB_LABELS.projects,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
              },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-11 flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-maroon to-maroon-rich text-ivory shadow-lg shadow-maroon-950/60"
                      : "text-ivory-500 hover:text-gold-shimmer hover:bg-ivory/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-gold-300" : "text-ivory-500 group-hover:text-gold-shimmer transition"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="size-2 rounded-full bg-gold-bright ring-4 ring-gold-bright/20 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gold/15 space-y-1">
          <button
            type="button"
            aria-current={activeTab === "settings" ? "page" : undefined}
            onClick={() => setActiveTab("settings")}
            className={`w-full min-h-11 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-ivory/10 text-gold-shimmer"
                : "text-ivory-500 hover:text-gold-shimmer hover:bg-ivory/5"
            }`}
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{TAB_LABELS.settings}</span>
          </button>

          <button
            type="button"
            aria-current={activeTab === "info" ? "page" : undefined}
            onClick={() => setActiveTab("info")}
            className={`w-full min-h-11 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "info"
                ? "bg-ivory/10 text-gold-shimmer"
                : "text-ivory-500 hover:text-gold-shimmer hover:bg-ivory/5"
            }`}
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{TAB_LABELS.info}</span>
          </button>

          <div className="pt-2 space-y-1.5">
            <Link
              href="/templates"
              className="min-h-11 w-full flex items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-gold-200 hover:bg-gold/20 transition"
            >
              <span>👑 ५०+ टेम्पलेट्स</span>
            </Link>
            <Link
              href="/"
              className="min-h-11 w-full flex items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-maroon/15 px-3 py-2 text-xs font-bold text-gold-300 hover:bg-maroon/25 transition"
            >
              <span>← मुख्य पोर्टल</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 px-6 sm:px-8 flex items-center justify-between gap-4 border-b border-ivory-300/70 bg-ivory-surface/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black text-charcoal tracking-tight">
              {TAB_LABELS[activeTab]}
            </h1>
          </div>

          <div className="relative w-72 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="प्रकल्प शोधा"
              aria-label="प्रकल्प शोधा"
              className="w-full h-11 pl-5 pr-10 rounded-full bg-ivory-surface text-xs font-semibold text-charcoal placeholder:text-charcoal-muted shadow-soft border border-ivory-300/80 outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15 transition"
            />
            <svg
              className="size-4 text-charcoal-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-ivory-deep rounded-full p-1 border border-ivory-300">
              <button
                type="button"
                aria-pressed={currencyMode === "USD"}
                onClick={() => setCurrencyMode("USD")}
                className={`min-h-11 px-4 rounded-full text-xs font-bold transition ${
                  currencyMode === "USD" ? "bg-ivory-surface text-charcoal shadow-xs" : "text-charcoal-soft"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                aria-pressed={currencyMode === "INR"}
                onClick={() => setCurrencyMode("INR")}
                className={`min-h-11 px-4 rounded-full text-xs font-bold transition ${
                  currencyMode === "INR" ? "bg-ivory-surface text-charcoal shadow-xs" : "text-charcoal-soft"
                }`}
              >
                INR (₹)
              </button>
            </div>

            <div className="flex items-center gap-3 pl-2">
              <div className="relative">
                <div className="size-11 rounded-full bg-gradient-to-br from-maroon to-gold grid place-items-center ring-4 ring-gold p-0.5 shadow-md">
                  <span className="text-xs font-black text-ivory">ध</span>
                </div>
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-leaf-500 ring-2 ring-ivory-surface" />
              </div>

              <div className="hidden md:block leading-tight">
                <div className="font-extrabold text-sm text-charcoal">
                  धवल राधादिया
                </div>
                <div className="text-xs text-charcoal-muted font-medium">
                  यूआय/यूएक्स डिझाइनर
                </div>
              </div>

              <div className="relative ml-2">
                <button
                  type="button"
                  aria-label="सूचना"
                  className="size-11 rounded-2xl bg-ivory-surface border border-ivory-300/80 shadow-soft flex items-center justify-center text-charcoal-soft hover:text-maroon transition"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-gradient-to-r from-maroon to-maroon-rich text-ivory text-xs font-black flex items-center justify-center ring-2 ring-ivory-surface shadow-sm">
                  2
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {activeTab === "dashboard" ? (
            <>
              <div className="flex items-center gap-4 bg-ivory-surface/70 p-4 rounded-3xl border border-ivory-300/70 shadow-soft">
                <div className="size-14 rounded-full bg-gradient-to-br from-maroon to-gold grid shrink-0 place-items-center ring-4 ring-gold p-0.5">
                  <span className="text-sm font-black text-ivory">ध</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
                    नमस्कार, धवल राधादिया
                  </h2>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    या डॅशबोर्डमधील तुमच्या क्रियाकलापांची नजराणा पहा.
                  </p>
                </div>

                <div className="ml-auto hidden sm:flex items-center gap-2">
                  <Link
                    href="/studio/editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-maroon px-5 text-xs font-bold text-gold-shimmer shadow hover:bg-maroon-rich transition"
                  >
                    <span>🎨 स्टुडिओ सुरू करा</span>
                  </Link>
                  <Link
                    href="/console"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold/40 bg-ivory-surface px-5 text-xs font-bold text-charcoal hover:border-maroon hover:text-maroon transition"
                  >
                    <span>⚙️ मार्केटप्लेस</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] gap-6 items-start">
                <div className="space-y-6 min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="bg-ivory-surface rounded-3xl p-5 border border-ivory-300/70 shadow-soft flex flex-col justify-between hover:shadow-lift transition-all duration-300"
                      >
                        <div className="size-11 rounded-2xl bg-charcoal flex items-center justify-center shadow-md text-gold-300">
                          {kpi.icon}
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-semibold text-charcoal-muted">
                            {kpi.label}
                          </div>
                          <div className="text-2xl font-black text-charcoal mt-1 tracking-tight">
                            {kpi.val}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {kpi.demo ? (
                              <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold-700">
                                डेमो डेटा
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-leaf-600">{kpi.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-ivory-surface rounded-3xl p-6 sm:p-7 border border-ivory-300/70 shadow-soft">
                    <div className="flex items-center justify-between mb-8 gap-3">
                      <div>
                        <h3 className="text-lg font-black text-charcoal tracking-tight">
                          हिशेब
                        </h3>
                        <p className="text-xs text-charcoal-muted mt-0.5 font-medium">
                          एकूण कमाई
                        </p>
                      </div>

                      <div className="relative" ref={sortRef}>
                        <button
                          type="button"
                          onClick={() => setShowSortDropdown((v) => !v)}
                          aria-haspopup="menu"
                          aria-expanded={showSortDropdown}
                          className="min-h-11 text-xs font-bold text-charcoal-soft hover:text-charcoal flex items-center gap-1.5 bg-ivory-warm hover:bg-ivory-200 px-4 rounded-xl border border-ivory-300 transition"
                        >
                          <span>
                            क्रम: <span className="text-charcoal">{SORT_OPTIONS.find((option) => option.id === sortKey)?.label}</span>
                          </span>
                          <span aria-hidden="true">▾</span>
                        </button>

                        {showSortDropdown && (
                          <div
                            role="menu"
                            aria-label="क्रम निवडा"
                            className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-ivory-surface border border-ivory-300 shadow-soft p-1 z-30"
                          >
                            {SORT_OPTIONS.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={sortKey === option.id}
                                onClick={() => {
                                  setSortKey(option.id);
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full min-h-11 text-left px-3 rounded-lg text-xs font-bold transition ${
                                  sortKey === option.id
                                    ? "bg-maroon text-gold-shimmer"
                                    : "text-charcoal-soft hover:bg-ivory-warm"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative h-64 pt-10">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs font-bold text-ivory-400">
                        {["2500", "2000", "1500", "1000", "500", "00"].map((lvl) => (
                          <div key={lvl} className="flex items-center w-full">
                            <span className="w-10 text-right pr-3">{lvl}</span>
                            <div className="flex-1 h-px border-b border-ivory-300/80" />
                          </div>
                        ))}
                      </div>

                      <div className="relative h-full flex items-end justify-between pl-12 pr-4 z-10">
                        {sortedBars.map((bar) => {
                          const isSelected = selectedMonth === bar.id;
                          return (
                            <div
                              key={bar.id}
                              className="flex flex-col items-center group relative cursor-pointer"
                              onClick={() => setSelectedMonth(bar.id)}
                            >
                              {isSelected && (
                                <div className="absolute -top-16 z-20 flex flex-col items-center pointer-events-none animate-fade-in">
                                  <div className="bg-charcoal text-ivory px-3 py-2 rounded-2xl shadow-lift text-center whitespace-nowrap min-w-[120px] ring-1 ring-gold/20">
                                    <div className="text-xs text-ivory-400 font-medium">डिझाइन स्टुडिओ</div>
                                    <div className="text-sm font-black text-ivory">{money(bar.value)}</div>
                                    <div className="text-xs text-gold-300 font-medium">
                                      {bar.label} {currentYear}
                                    </div>
                                  </div>
                                  <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-charcoal" />
                                </div>
                              )}

                              <div
                                style={{ height: `${bar.heightPct * 2}px` }}
                                className={`w-4 sm:w-5 rounded-full transition-all duration-300 ${
                                  bar.accent
                                    ? "bg-maroon hover:bg-maroon-rich shadow-sm"
                                    : "bg-ink-900 hover:bg-ink-800"
                                } ${isSelected ? "ring-4 ring-gold-300 scale-105" : ""}`}
                              />

                              <span
                                className={`mt-3 text-xs font-bold transition ${
                                  isSelected ? "text-charcoal font-black" : "text-charcoal-muted group-hover:text-charcoal"
                                }`}
                              >
                                {bar.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-ivory-surface rounded-3xl p-6 sm:p-7 border border-ivory-300/70 shadow-soft">
                    <div className="mb-5">
                      <h3 className="text-lg font-black text-charcoal tracking-tight">
                        प्रकल्प
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-0.5 font-medium">
                        एकूण प्रकल्प
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-ivory-300/60">
                          {filteredProjects.map((row) => (
                            <tr key={row.id} className="hover:bg-ivory-warm/70 transition-colors group">
                              <td className="py-4 pr-4 font-bold text-xs text-charcoal">
                                <div className="flex items-center gap-2">
                                  <span className="size-2 rounded-full bg-maroon" />
                                  <span>{row.title}</span>
                                </div>
                              </td>

                              <td className="py-4 px-4 font-semibold text-xs text-charcoal-soft">
                                {row.lead}
                              </td>

                              <td className="py-4 px-4 text-xs text-charcoal-muted font-medium">
                                {row.role}
                              </td>

                              <td className="py-4 px-4 text-xs text-charcoal-muted font-medium whitespace-nowrap">
                                {row.date}
                              </td>

                              <td className="py-4 px-4 text-center">
                                {row.status === "पूर्ण" ? (
                                  <span className="inline-block rounded-full bg-maroon-deep text-ivory text-xs font-bold px-3 py-1 shadow-xs">
                                    पूर्ण
                                  </span>
                                ) : (
                                  <span className="inline-block rounded-full border border-gold/50 text-charcoal-soft text-xs font-bold px-3 py-1">
                                    चालू
                                  </span>
                                )}
                              </td>

                              <td className="py-4 pl-4 text-right text-charcoal-muted group-hover:text-charcoal text-sm font-bold">
                                ···
                              </td>
                            </tr>
                          ))}
                          {filteredProjects.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-xs font-semibold text-charcoal-muted">
                                कोणताही प्रकल्प सापडला नाही
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-ivory-surface rounded-3xl p-6 border border-ivory-300/70 shadow-soft">
                    <h3 className="text-base font-black text-charcoal mb-5 tracking-tight">
                      चार्ट
                    </h3>

                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal-soft">
                          <span className="size-2.5 rounded-full bg-maroon" />
                          <span>काढलेली रक्कम</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal-soft">
                          <span className="size-2.5 rounded-full bg-gold" />
                          <span>शिल्लक रक्कम</span>
                        </div>
                      </div>

                      <div className="relative size-32 shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="var(--color-gold)"
                            strokeWidth="12"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="var(--color-maroon)"
                            strokeWidth="12"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - 0.823)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-base font-black text-charcoal tracking-tight">
                            82.3%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-ivory-surface rounded-3xl p-6 border border-ivory-300/70 shadow-soft space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-charcoal tracking-tight">
                        आज, 05 मार्च
                      </h3>
                      <span className="text-xs text-charcoal-muted font-bold">2026</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      {SCHEDULE_DAYS.map((d) => {
                        const isCurrent = selectedDay === d.date;
                        return (
                          <button
                            key={d.date}
                            type="button"
                            aria-pressed={isCurrent}
                            onClick={() => setSelectedDay(d.date)}
                            className={`min-h-11 flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 flex-1 transition-all duration-200 ${
                              isCurrent
                                ? "bg-maroon text-gold-shimmer shadow-md scale-105"
                                : "bg-ivory-warm text-charcoal-soft hover:bg-ivory-200"
                            }`}
                          >
                            <span className="text-xs font-black">{d.date}</span>
                            <span className="text-xs font-semibold mt-0.5 opacity-80">{d.day}</span>
                            <div className="flex items-center gap-0.5 mt-1.5 h-1">
                              {d.dots.map((dotColor, idx) => (
                                <span
                                  key={idx}
                                  className="size-1 rounded-full"
                                  style={{ background: isCurrent ? dotColor : "var(--color-ivory-400)" }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative pl-14 space-y-4 pt-1">
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-charcoal-muted select-none">
                        <span>08 सकाळी</span>
                        <span>09 सकाळी</span>
                        <span>10 सकाळी</span>
                        <span>11 सकाळी</span>
                        <span>12 दुपारी</span>
                      </div>

                      <div className="absolute left-11 top-2 bottom-2 w-px bg-ivory-300" />

                      <div className="bg-gradient-to-r from-paithani to-leaf-500 text-ivory p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-xl bg-ivory/20 flex items-center justify-center shrink-0">
                            <svg className="size-4 text-ivory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">क्लाइंट बैठक</div>
                            <div className="text-xs text-ivory/85 leading-snug mt-1">
                              अंतिम डिझाइन पाहण्यासाठी डिझाइन क्लबची क्लाइंट बैठक
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-ink-900 text-ivory p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-xl bg-ivory/10 flex items-center justify-center shrink-0">
                            <svg className="size-4 text-ivory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="8" y1="6" x2="21" y2="6" />
                              <line x1="8" y1="12" x2="21" y2="12" />
                              <line x1="8" y1="18" x2="21" y2="18" />
                              <line x1="3" y1="6" x2="3.01" y2="6" />
                              <line x1="3" y1="12" x2="3.01" y2="12" />
                              <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">चेकलिस्ट</div>
                            <div className="text-xs text-ivory-300 leading-snug mt-1">
                              चेकलिस्टमधील कार्ये पूर्ण करा
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-haldi to-maroon-rich text-ivory p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-xl bg-ivory/20 flex items-center justify-center shrink-0">
                            <svg className="size-4 text-ivory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <line x1="8" y1="21" x2="16" y2="21" />
                              <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">कोर्स</div>
                            <div className="text-xs text-ivory/85 leading-snug mt-1">
                              चालू डिझाइन कोर्स पूर्ण करा
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="w-full max-w-lg rounded-3xl border border-gold/30 bg-ivory-surface p-8 sm:p-10 text-center shadow-lift">
                <div className="mx-auto mb-5 size-14 rounded-2xl bg-maroon grid place-items-center text-gold-300 shadow-glow">
                  <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-charcoal tracking-tight">
                  लवकरच येत आहे
                </h2>
                <p className="mt-2 text-sm text-charcoal-soft mx-auto">
                  “{TAB_LABELS[activeTab]}” हा विभाग आता तयार होत आहे. तोपर्यंत डॅशबोर्डमधील
                  आकडेपाहा किंवा मुख्य पोर्टलवर जा.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="btn-base btn-maroon px-6 text-sm"
                  >
                    डॅशबोर्डकडे परत जा
                  </button>
                  <Link href="/" className="btn-base btn-outline px-6 text-sm">
                    मुख्य पोर्टल
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
