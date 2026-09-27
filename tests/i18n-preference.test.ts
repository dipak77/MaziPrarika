import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  PREF_LANG_COOKIE,
  PREF_LANG_STORAGE_KEY,
  parseCardLang,
  resolvePreferredLang,
  getCardCopy,
  onboardingCopy,
} from '../apps/web/src/lib/i18n';

describe('i18n language preference and fallback architecture', () => {
  describe('Constants and Defaults', () => {
    it('strictly maintains Marathi ("mr") as the platform default language', () => {
      expect(DEFAULT_LANG).toBe('mr');
    });

    it('supports Marathi ("mr"), Hindi ("hi"), and English ("en")', () => {
      expect(SUPPORTED_LANGS).toEqual(['mr', 'hi', 'en']);
    });

    it('defines consistent cookie and storage keys for persistence', () => {
      expect(PREF_LANG_COOKIE).toBe('mazi_lang');
      expect(PREF_LANG_STORAGE_KEY).toBe('mazi_preferred_lang');
    });
  });

  describe('parseCardLang fallback guarantees', () => {
    it('returns "en" only when value is explicitly "en"', () => {
      expect(parseCardLang('en')).toBe('en');
    });

    it('returns "hi" when value is explicitly "hi"', () => {
      expect(parseCardLang('hi')).toBe('hi');
    });

    it('returns "mr" when value is explicitly "mr"', () => {
      expect(parseCardLang('mr')).toBe('mr');
    });

    it('falls back to default "mr" when user provides undefined, null, or empty string', () => {
      expect(parseCardLang(undefined)).toBe('mr');
      expect(parseCardLang(null)).toBe('mr');
      expect(parseCardLang('')).toBe('mr');
    });

    it('falls back to default "mr" when user provides any unsupported language or garbage input', () => {
      expect(parseCardLang('fr')).toBe('mr');
      expect(parseCardLang('english')).toBe('mr');
      expect(parseCardLang(123)).toBe('mr');
      expect(parseCardLang({})).toBe('mr');
      expect(parseCardLang([])).toBe('mr');
      expect(parseCardLang(true)).toBe('mr');
    });
  });

  describe('resolvePreferredLang precedence and fallback', () => {
    it('returns default "mr" when no options or empty options are passed', () => {
      expect(resolvePreferredLang()).toBe('mr');
      expect(resolvePreferredLang({})).toBe('mr');
      expect(
        resolvePreferredLang({
          query: undefined,
          cookie: undefined,
          storage: undefined,
        }),
      ).toBe('mr');
    });

    it('resolves explicit query parameter when present', () => {
      expect(resolvePreferredLang({ query: 'en' })).toBe('en');
      expect(resolvePreferredLang({ query: 'hi' })).toBe('hi');
      expect(resolvePreferredLang({ query: 'mr' })).toBe('mr');
    });

    it('resolves cookie preference when query param is absent', () => {
      expect(resolvePreferredLang({ cookie: 'en' })).toBe('en');
      expect(resolvePreferredLang({ cookie: 'hi' })).toBe('hi');
      expect(resolvePreferredLang({ cookie: 'mr' })).toBe('mr');
    });

    it('resolves localStorage preference when query and cookie are absent', () => {
      expect(resolvePreferredLang({ storage: 'en' })).toBe('en');
      expect(resolvePreferredLang({ storage: 'hi' })).toBe('hi');
      expect(resolvePreferredLang({ storage: 'mr' })).toBe('mr');
    });

    it('prioritizes query param over cookie and storage', () => {
      expect(resolvePreferredLang({ query: 'en', cookie: 'mr', storage: 'mr' })).toBe('en');
      expect(resolvePreferredLang({ query: 'hi', cookie: 'en', storage: 'mr' })).toBe('hi');
      expect(resolvePreferredLang({ query: 'mr', cookie: 'en', storage: 'en' })).toBe('mr');
    });

    it('prioritizes cookie over storage when query is missing or invalid', () => {
      expect(resolvePreferredLang({ query: 'invalid', cookie: 'en', storage: 'mr' })).toBe('en');
      expect(resolvePreferredLang({ query: 'invalid', cookie: 'hi', storage: 'mr' })).toBe('hi');
      expect(resolvePreferredLang({ cookie: 'mr', storage: 'en' })).toBe('mr');
    });

    it('falls back gracefully to storage if query and cookie are invalid', () => {
      expect(
        resolvePreferredLang({
          query: 'es',
          cookie: 'de',
          storage: 'hi',
        }),
      ).toBe('hi');
      expect(
        resolvePreferredLang({
          query: 'es',
          cookie: 'de',
          storage: 'en',
        }),
      ).toBe('en');
    });

    it('falls back to default Marathi ("mr") when all provided values are invalid', () => {
      expect(
        resolvePreferredLang({
          query: 'es',
          cookie: 'de',
          storage: 'it',
        }),
      ).toBe('mr');
    });
  });

  describe('Language Copy and Onboarding dictionaries', () => {
    it('provides complete card copy for Marathi with authentic auspicious blessings', () => {
      const copy = getCardCopy('mr');
      expect(copy.blessing).toBe('॥ श्री गणेशाय नमः ॥');
      expect(copy.muhuratTitle).toBe('मुहूर्त व पंचांग');
      expect(copy.agendaTitle).toBe('कार्यक्रमाची मांडणी');
      expect(copy.rsvpThanks).toContain('सहर्ष स्वागतम्');
      expect(copy.printHubs.length).toBeGreaterThan(0);
    });

    it('provides complete card copy for Hindi', () => {
      const copy = getCardCopy('hi');
      expect(copy.blessing).toBe('॥ श्री गणेशाय नमः ॥');
      expect(copy.muhuratTitle).toBe('मुहूर्त व पंचांग');
      expect(copy.agendaTitle).toBe('कार्यक्रम की रूपरेखा');
      expect(copy.rsvpThanks).toContain('सहर्ष स्वागतम्');
      expect(copy.printHubs.length).toBeGreaterThan(0);
    });

    it('provides complete card copy for English', () => {
      const copy = getCardCopy('en');
      expect(copy.blessing).toBe('॥ Shri Ganeshaya Namah ॥');
      expect(copy.muhuratTitle).toBe('Muhurat & Panchang');
      expect(copy.agendaTitle).toBe('Event schedule');
      expect(copy.rsvpThanks).toContain('Thank you');
      expect(copy.printHubs.length).toBeGreaterThan(0);
    });

    it('provides trilingual onboarding labels with Marathi default indicator', () => {
      expect(onboardingCopy.mr.langLabel).toBe('भाषा प्राधान्य');
      expect(onboardingCopy.mr.defaultBadge).toBe('डिफॉल्ट');
      expect(onboardingCopy.mr.generatePlan).toBe('नियोजन तयार करा');

      expect(onboardingCopy.hi.langLabel).toBe('भाषा प्राथमिकता');
      expect(onboardingCopy.hi.defaultBadge).toBe('डिफ़ॉल्ट');
      expect(onboardingCopy.hi.generatePlan).toBe('योजना तैयार करें');

      expect(onboardingCopy.en.langLabel).toBe('Preferred Language');
      expect(onboardingCopy.en.defaultBadge).toBe('Default');
      expect(onboardingCopy.en.generatePlan).toBe('Create Plan');
    });
  });
});
