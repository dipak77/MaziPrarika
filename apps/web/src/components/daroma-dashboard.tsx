"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════════════
   TYPES & MOCK DATA
   ══════════════════════════════════════════════════════════════════════ */
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
  month: string;
  heightPct: number;
  val: string;
  isViolet: boolean;
  active?: boolean;
}

const MONTHLY_DATA: MonthlyBar[] = [
  { month: "Jan", heightPct: 45, val: "$1,120", isViolet: true },
  { month: "Feb", heightPct: 88, val: "$2,240", isViolet: false },
  { month: "Mar", heightPct: 65, val: "$1,650", isViolet: true },
  { month: "Apr", heightPct: 30, val: "$750", isViolet: false },
  { month: "May", heightPct: 82, val: "$2,075", isViolet: true, active: true },
  { month: "Jun", heightPct: 58, val: "$1,450", isViolet: false },
  { month: "Jul", heightPct: 22, val: "$560", isViolet: true },
  { month: "Aug", heightPct: 68, val: "$1,720", isViolet: false },
  { month: "Sep", heightPct: 48, val: "$1,210", isViolet: true },
  { month: "Oct", heightPct: 95, val: "$2,480", isViolet: false },
  { month: "Nov", heightPct: 60, val: "$1,530", isViolet: true },
];

const SCHEDULE_DAYS = [
  { date: "03", day: "Mon", active: false, dots: ["#8247e5"] },
  { date: "04", day: "Tue", active: false, dots: [] },
  { date: "05", day: "Wed", active: true, dots: ["#8247e5", "#10b981", "#38bdf8"] },
  { date: "06", day: "Thu", active: false, dots: ["#f59e0b"] },
  { date: "07", day: "Fri", active: false, dots: ["#8247e5", "#ec4899"] },
];

interface ProjectRow {
  id: string;
  title: string;
  lead: string;
  role: string;
  date: string;
  status: "Completed" | "Ongoing";
}

const INITIAL_PROJECTS: ProjectRow[] = [
  {
    id: "p1",
    title: "Dance studio- Webpage",
    lead: "Sriram Sarvade",
    role: "CEO",
    date: "March 05, 2020",
    status: "Completed",
  },
  {
    id: "p2",
    title: "Real Estate Homepage",
    lead: "Geeta Ingle",
    role: "Manager",
    date: "Dec 25, 2020",
    status: "Ongoing",
  },
  {
    id: "p3",
    title: "Royal Marathi Patrika UI",
    lead: "Dhaval Radadiya",
    role: "UX/UI Designer",
    date: "Sept 27, 2026",
    status: "Completed",
  },
  {
    id: "p4",
    title: "Heritage Vivah Biodata",
    lead: "Pooja Kulkarni",
    role: "Lead Artist",
    date: "Oct 14, 2026",
    status: "Ongoing",
  },
];

/* ══════════════════════════════════════════════════════════════════════
   DAROMA-STYLE MODERN SAAS DASHBOARD COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function DaromaDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyMode, setCurrencyMode] = useState<"USD" | "INR">("USD");
  const [selectedMonth, setSelectedMonth] = useState<string>("May");
  const [selectedDay, setSelectedDay] = useState<string>("05");
  const [activeSort, setActiveSort] = useState<"Monthly" | "Weekly" | "Yearly">("Monthly");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [projects] = useState<ProjectRow[]>(INITIAL_PROJECTS);
  const [filterActive, setFilterActive] = useState(false);

  const isINR = currencyMode === "INR";
  const currencyMult = isINR ? 83 : 1;

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

  return (
    <div className="min-h-screen w-full bg-[#f4f5fa] text-[#111026] flex font-sans antialiased selection:bg-[#7c3aed] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════════
          1. LEFT DARK SIDEBAR
          Deep Navy/Charcoal with Vivid Electric Violet Pill
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-56 sm:w-64 bg-[#0e0d26] text-white flex flex-col justify-between shrink-0 shadow-2xl z-30 select-none border-r border-[#1a1838]">
        <div>
          {/* Brand Logo & Title */}
          <div className="p-6 flex items-center gap-3 border-b border-[#1f1d42]/60">
            {/* Custom Modern Squircle Logo */}
            <div className="size-10 rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-900/40 p-1">
              <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M9 3v18" />
                <path d="M14 8a4 4 0 0 1 0 8" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>Daroma</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] bg-[#221f4f] px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                Mazi Studio OS
              </p>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1.5">
            {[
              {
                id: "dashboard" as const,
                label: "Dashboard",
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
                label: "Profile",
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
              {
                id: "analysis" as const,
                label: "Analysis",
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
                label: "Accounting",
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
                label: "Messages",
                badge: true,
                icon: (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                id: "projects" as const,
                label: "Projects",
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-lg shadow-purple-900/40"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-white" : "text-gray-400 group-hover:text-white transition"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="size-2 rounded-full bg-[#8247e5] ring-4 ring-[#8247e5]/20 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Settings & Info Section */}
        <div className="p-4 border-t border-[#1f1d42]/60 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "info"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Info</span>
          </button>

          {/* Quick Return to Main MaziPatrika Portal */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-[11px] font-bold text-purple-300 hover:bg-purple-500/20 transition"
            >
              <span>← मुख्य पोर्टल</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN WORKSPACE CONTAINER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-20 px-8 flex items-center justify-between gap-4 border-b border-gray-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black text-[#111026] tracking-tight">
              Dashboard
            </h1>
          </div>

          {/* Search Pill Input */}
          <div className="relative w-72 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-11 pl-5 pr-10 rounded-full bg-white text-xs font-semibold text-[#111026] placeholder:text-gray-400 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-200/80 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition"
            />
            <svg
              className="size-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
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

          {/* Profile Badge & Notifications */}
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setCurrencyMode("USD")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  currencyMode === "USD" ? "bg-white text-[#111026] shadow-xs" : "text-gray-500"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode("INR")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  currencyMode === "INR" ? "bg-white text-[#111026] shadow-xs" : "text-gray-500"
                }`}
              >
                INR (₹)
              </button>
            </div>

            {/* Profile Pill Card */}
            <div className="flex items-center gap-3 pl-2">
              {/* User Avatar with Glowing Yellow Ring */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="Dhaval Radadiya"
                  className="size-11 rounded-full object-cover ring-4 ring-amber-400 p-0.5 shadow-md"
                />
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="hidden md:block leading-tight">
                <div className="font-extrabold text-sm text-[#111026]">
                  Dhaval Radadiya
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  UX/UI Designer
                </div>
              </div>

              {/* Notification Bell with Count Pill */}
              <div className="relative ml-2">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="size-10 rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-gray-600 hover:text-[#7c3aed] transition"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-sm">
                  2
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════════
            3. DASHBOARD MAIN CANVAS (Grid Layout with Right Sidebar)
        ══════════════════════════════════════════════════════════════════════ */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Top Greeting Card */}
          <div className="flex items-center gap-4 bg-white/60 p-4 rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
              alt="Dhaval"
              className="size-14 rounded-full object-cover ring-4 ring-amber-400 p-0.5"
            />
            <div>
              <h2 className="text-xl font-extrabold text-[#111026] tracking-tight">
                Hello, Dhaval Radadiya
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Check your activities in this dashboard.
              </p>
            </div>

            <div className="ml-auto hidden sm:flex items-center gap-2">
              <Link
                href="/studio/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#111026] px-4 py-2 text-xs font-bold text-white shadow hover:bg-black transition"
              >
                <span>🎨 Launch Studio</span>
              </Link>
              <Link
                href="/console"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:border-[#7c3aed] hover:text-[#7c3aed] transition"
              >
                <span>⚙️ Marketplace</span>
              </Link>
            </div>
          </div>

          {/* Master 2-Column Layout (Main Left 70% | Right Panel 30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] gap-6 items-start">
            {/* ═══════════════════════════════════════════════════════════════
                LEFT MAIN AREA: KPI CARDS + ACCOUNTING + PROJECTS
            ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-6 min-w-0">
              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    id: "kpi-earning",
                    label: "Total Earning",
                    val: isINR ? "₹18.2L" : "$22k",
                    growth: "+10.80%",
                    icon: (
                      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    ),
                  },
                  {
                    id: "kpi-withdraw",
                    label: "Withdraw",
                    val: isINR ? "₹8.3L" : "$10k",
                    growth: "+05.80%",
                    icon: (
                      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    ),
                  },
                  {
                    id: "kpi-projects",
                    label: "Total Projects",
                    val: "15",
                    growth: "+10.80%",
                    icon: (
                      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    ),
                  },
                  {
                    id: "kpi-ongoing",
                    label: "Ongoing",
                    val: "03",
                    growth: "+10.80%",
                    icon: (
                      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    ),
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
                  >
                    {/* Dark Squircle Icon Badge */}
                    <div className="size-11 rounded-2xl bg-[#1e1c38] flex items-center justify-center shadow-md">
                      {kpi.icon}
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-400">
                        {kpi.label}
                      </div>
                      <div className="text-2xl font-black text-[#111026] mt-1 tracking-tight">
                        {kpi.val}
                      </div>
                      <div className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                        <span className="text-emerald-500 font-extrabold">{kpi.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accounting Bar Chart Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                {/* Header with Dropdown */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black text-[#111026] tracking-tight">
                      Accounting
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Overall Earning
                    </p>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSortDropdown((v) => !v)}
                      className="text-xs font-bold text-gray-600 hover:text-[#111026] flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 transition"
                    >
                      <span>Sort by: <span className="text-[#111026]">{activeSort}</span></span>
                      <span>▾</span>
                    </button>

                    {showSortDropdown && (
                      <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white border border-gray-200 shadow-xl p-1 z-30">
                        {(["Monthly", "Weekly", "Yearly"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setActiveSort(s);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              activeSort === s ? "bg-[#7c3aed] text-white" : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Bar Chart Container */}
                <div className="relative h-64 pt-10">
                  {/* Background Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-bold text-gray-300">
                    {["2500", "2000", "1500", "1000", "500", "00"].map((lvl) => (
                      <div key={lvl} className="flex items-center w-full">
                        <span className="w-10 text-right pr-3">{lvl}</span>
                        <div className="flex-1 h-px border-b border-gray-100/90" />
                      </div>
                    ))}
                  </div>

                  {/* Bars Flex Row */}
                  <div className="relative h-full flex items-end justify-between pl-12 pr-4 z-10">
                    {MONTHLY_DATA.map((bar) => {
                      const isSelected = selectedMonth === bar.month;
                      return (
                        <div
                          key={bar.month}
                          className="flex flex-col items-center group relative cursor-pointer"
                          onClick={() => setSelectedMonth(bar.month)}
                        >
                          {/* Floating Active Tooltip for the selected month (matches reference image on May) */}
                          {isSelected && (
                            <div className="absolute -top-16 z-20 flex flex-col items-center pointer-events-none animate-fade-in">
                              <div className="bg-[#111026] text-white px-3 py-2 rounded-2xl shadow-2xl text-center whitespace-nowrap min-w-[120px] ring-1 ring-white/10">
                                <div className="text-[10px] text-gray-400 font-medium">Design Studio</div>
                                <div className="text-sm font-black text-white">{isINR ? `₹${Math.round(2075 * currencyMult).toLocaleString("en-IN")}` : bar.val}</div>
                                <div className="text-[9px] text-gray-400 font-medium">March 05, 2020</div>
                              </div>
                              {/* Triangle Tip */}
                              <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#111026]" />
                            </div>
                          )}

                          {/* The Rounded Vertical Bar */}
                          <div
                            style={{ height: `${bar.heightPct * 2}px` }}
                            className={`w-4 sm:w-5 rounded-full transition-all duration-300 ${
                              bar.isViolet
                                ? "bg-[#8247e5] hover:brightness-110 shadow-sm"
                                : "bg-[#2b2848] hover:bg-[#1f1d38]"
                            } ${isSelected ? "ring-4 ring-purple-300 scale-105" : ""}`}
                          />

                          {/* Month Label */}
                          <span
                            className={`mt-3 text-xs font-bold transition ${
                              isSelected ? "text-[#111026] font-black" : "text-gray-400 group-hover:text-gray-700"
                            }`}
                          >
                            {bar.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Projects Table Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                {/* Header with Filter Button */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-black text-[#111026] tracking-tight">
                      Projects
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Overall Projects
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFilterActive((v) => !v)}
                    title="Filter Projects"
                    className={`size-9 rounded-xl border flex items-center justify-center transition ${
                      filterActive
                        ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </button>
                </div>

                {/* Table Rows */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      {filteredProjects.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/70 transition-colors group">
                          {/* Project Name */}
                          <td className="py-4 pr-4 font-bold text-xs text-[#111026]">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-[#8247e5]" />
                              <span>{row.title}</span>
                            </div>
                          </td>

                          {/* Lead Person */}
                          <td className="py-4 px-4 font-semibold text-xs text-gray-700">
                            {row.lead}
                          </td>

                          {/* Role */}
                          <td className="py-4 px-4 text-xs text-gray-400 font-medium">
                            {row.role}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-xs text-gray-400 font-medium whitespace-nowrap">
                            {row.date}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center">
                            {row.status === "Completed" ? (
                              <span className="inline-block rounded-full bg-[#14122d] text-white text-[11px] font-bold px-3 py-1 shadow-xs">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-block rounded-full border border-gray-300 text-gray-600 text-[11px] font-bold px-3 py-0.5">
                                Ongoing
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-4 text-right text-gray-400 group-hover:text-gray-700 text-sm font-bold">
                            ···
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                RIGHT SIDEBAR COLUMN: DONUT CHART + SCHEDULE TIMELINE
            ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-6">
              {/* Donut Chart Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <h3 className="text-base font-black text-[#111026] mb-5 tracking-tight">
                  Chart
                </h3>

                <div className="flex items-center justify-between gap-4">
                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <span className="size-2.5 rounded-full bg-[#8247e5]" />
                      <span>Withdraw Amount</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <span className="size-2.5 rounded-full bg-[#1e1c38]" />
                      <span>Balance Amount</span>
                    </div>
                  </div>

                  {/* Circular Donut with Percentage in Center */}
                  <div className="relative size-32 shrink-0">
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      {/* Dark Navy Track Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#1e1c38"
                        strokeWidth="12"
                      />
                      {/* Vibrant Purple Progress Arc (82.3%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#8247e5"
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - 0.823)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    {/* Centered Percentage */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base font-black text-[#111026] tracking-tight">
                        82.3%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today Schedule & Calendar Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-[#111026] tracking-tight">
                    Today, 05 March
                  </h3>
                  <span className="text-xs text-gray-400 font-bold">2026</span>
                </div>

                {/* Day Pills Bar */}
                <div className="flex items-center justify-between gap-1.5">
                  {SCHEDULE_DAYS.map((d) => {
                    const isCurrent = selectedDay === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDay(d.date)}
                        className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 flex-1 transition-all duration-200 ${
                          isCurrent
                            ? "bg-[#111026] text-white shadow-md scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs font-black">{d.date}</span>
                        <span className="text-[10px] font-semibold mt-0.5 opacity-80">{d.day}</span>
                        {/* Status Dots */}
                        <div className="flex items-center gap-0.5 mt-1.5 h-1">
                          {d.dots.map((dotColor, idx) => (
                            <span
                              key={idx}
                              className="size-1 rounded-full"
                              style={{ background: isCurrent ? dotColor : "#9ca3af" }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Timeline with Event Cards */}
                <div className="relative pl-14 space-y-4 pt-1">
                  {/* Vertical Hour Markings */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[11px] font-bold text-gray-400 select-none">
                    <span>08 am</span>
                    <span>09 am</span>
                    <span>10 am</span>
                    <span>11 am</span>
                    <span>12 pm</span>
                  </div>

                  {/* Vertical Guideline */}
                  <div className="absolute left-11 top-2 bottom-2 w-px bg-gray-200" />

                  {/* Event Card 1: Client Meeting (Coral Pink) */}
                  <div className="bg-gradient-to-r from-[#ff6b6b] to-[#f87171] text-white p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Client Meeting</div>
                        <div className="text-[10.5px] text-white/85 leading-snug mt-1">
                          Design club client meeting to review the final design
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Card 2: Check List (Deep Navy) */}
                  <div className="bg-[#111026] text-white p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="21" y2="6" />
                          <line x1="8" y1="12" x2="21" y2="12" />
                          <line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" />
                          <line x1="3" y1="12" x2="3.01" y2="12" />
                          <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Check List</div>
                        <div className="text-[10.5px] text-gray-300 leading-snug mt-1">
                          Complete the tasks in the check list
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Card 3: Course (Warm Amber / Orange) */}
                  <div className="bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white p-3.5 rounded-2xl shadow-sm relative group hover:scale-[1.02] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Course</div>
                        <div className="text-[10.5px] text-white/85 leading-snug mt-1">
                          Complete the ongoing design course
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
