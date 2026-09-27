'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react';
import {
  type CardLang,
  DEFAULT_LANG,
  PREF_LANG_COOKIE,
  PREF_LANG_STORAGE_KEY,
} from '@/lib/i18n';

interface LanguageContextValue {
  lang: CardLang;
  setLang: (lang: CardLang) => void;
  isEn: boolean;
  isHi: boolean;
  isMr: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  isEn: false,
  isHi: false,
  isMr: true,
});

export function LanguageProvider({
  children,
  initialLang = DEFAULT_LANG,
}: {
  children: React.ReactNode;
  initialLang?: CardLang;
}) {
  const [lang, setLangState] = useState<CardLang>(initialLang);
  const [, startTransition] = useTransition();

  // On client hydration, resolve language preference: URL query > localStorage > cookie > default (mr)
  useEffect(() => {
    const syncFromEnvironment = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryLang = params.get('lang');
        if (queryLang === 'en' || queryLang === 'mr' || queryLang === 'hi') {
          setLangState(queryLang as CardLang);
          return;
        }
        const stored = localStorage.getItem(PREF_LANG_STORAGE_KEY);
        if (stored === 'en' || stored === 'mr' || stored === 'hi') {
          setLangState(stored as CardLang);
          return;
        }
        const match = document.cookie.match(new RegExp(`(?:^|; )${PREF_LANG_COOKIE}=([^;]*)`));
        if (match && (match[1] === 'en' || match[1] === 'mr' || match[1] === 'hi')) {
          setLangState(match[1] as CardLang);
          return;
        }
      } catch {
        // restricted access or SSR
      }
    };

    syncFromEnvironment();

    window.addEventListener('popstate', syncFromEnvironment);
    window.addEventListener('storage', syncFromEnvironment);
    return () => {
      window.removeEventListener('popstate', syncFromEnvironment);
      window.removeEventListener('storage', syncFromEnvironment);
    };
  }, []);

  const setLang = useCallback((nextLang: CardLang) => {
    startTransition(() => {
      setLangState(nextLang);
    });

    try {
      document.cookie = `${PREF_LANG_COOKIE}=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    try {
      localStorage.setItem(PREF_LANG_STORAGE_KEY, nextLang);
    } catch {}

    try {
      document.documentElement.lang = nextLang === 'en' ? 'en-IN' : nextLang === 'hi' ? 'hi-IN' : 'mr-IN';
    } catch {}

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        isEn: lang === 'en',
        isHi: lang === 'hi',
        isMr: lang === 'mr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
