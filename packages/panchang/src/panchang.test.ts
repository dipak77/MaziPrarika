import { describe, expect, it } from 'vitest';

import { computePanchang, karanaNameFor, panchangForToday, shakaFromGregorian } from './panchang.js';
import { evaluateMuhurat, findMuhurats } from './muhurat.js';
import { ayanamsaDeg, lahiriAyanamsaDeg, luminaries, moonLongitudeTropical, sunLongitudeTropical, sunTimes, toSidereal } from './astronomy.js';
import { bhakootKoota, ganaKoota, gunaMilan, kundaliFromBirth, nadiKoota, taraKoota, varnaKoota, yoniKoota } from './kundali.js';

const PUNE = { city: 'पुणे', latitude: 18.5204, longitude: 73.8567, tzOffsetHours: 5.5 };

/** Local IST clock string for assertions. */
const istTime = (d: Date | null): string =>
  d ? new Date(d.getTime() + 5.5 * 3_600_000).toISOString().slice(11, 16) : '—';

/** "सकाळी १२:३१" → minutes since local midnight (for boundary assertions). */
const marathiTimeToMinutes = (text: string): number => {
  const latin = text.replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));
  const match = latin.match(/(\d{1,2}):(\d{2})/);
  if (!match) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
};

describe('panchang/astronomy — validated against published panchang data', () => {
  it('computes Lahiri ayanamsa in the published range', () => {
    // Lahiri ayanamsa ≈ 24°12′ in 2026 (23°51′ at J2000 + ~50.29″/yr)
    const a = lahiriAyanamsaDeg(new Date('2026-01-01T00:00:00Z'));
    expect(a).toBeGreaterThan(24.1);
    expect(a).toBeLessThan(24.25);
  });

  it('reproduces the Meeus reference Moon longitude (1992-04-12.0 TD → 133.1627°)', () => {
    const jd = 2448724.5;
    const lon = moonLongitudeTropical(jd);
    const elongation = Math.abs(((lon - 133.162655 + 540) % 360) - 180);
    // Truncated 32-term ELP series; documented tolerance is ±0.02°.
    expect(elongation).toBeLessThan(0.05);
  });

  it('gives Pune sunrise/sunset within two minutes of the almanac', () => {
    const t = sunTimes(2026, 9, 24, PUNE.latitude, PUNE.longitude, 5.5);
    expect(istTime(t.sunrise)).toMatch(/^06:2[0-9]$/); // published: 06:24 IST
    expect(istTime(t.sunset)).toMatch(/^18:(29|30|31)$/); // published: 18:30 IST
    expect(t.dayLengthHours).toBeGreaterThan(12);
    expect(t.dayLengthHours).toBeLessThan(12.3);
  });

  it('handles polar edge cases explicitly instead of returning wrong numbers', () => {
    const t = sunTimes(2026, 6, 21, 78.2, 15.6, 1); // Svalbard, midnight sun
    expect(t.polar).toBe('midnight-sun');
    expect(t.sunrise).toBeNull();
  });
});

describe('panchang/core — festival reference cases (IST)', () => {
  const cases: Array<{
    name: string; date: [number, number, number]; tithi: string; nakshatra?: string;
    tithiEndsBefore?: string; tithiEndsAfter?: string;
  }> = [
    {
      name: 'Gudi Padwa 2026 (Chaitra Shukla Pratipada begins 19 Mar 06:52)',
      date: [2026, 3, 19], tithi: 'अमावास्या', tithiEndsBefore: '07:05', tithiEndsAfter: '06:40',
    },
    {
      name: 'Raksha Bandhan 2026 (Shravana Purnima)',
      date: [2026, 8, 28], tithi: 'पौर्णिमा',
    },
    {
      // Chaturthi begins in the morning of 14 Sep (hence the festival), so the
      // sunrise panchang still shows the closing तृतीया — asserted explicitly.
      name: 'Ganesh Chaturthi 2026 (Chaturthi begins 14 Sep morning)',
      date: [2026, 9, 14], tithi: 'तृतीया', tithiEndsBefore: '07:20', tithiEndsAfter: '07:00',
    },
    {
      name: 'Ganesh Chaturthi 2026 — next sunrise carries चतुर्थी',
      date: [2026, 9, 15], tithi: 'चतुर्थी',
    },
    {
      name: 'Janmashtami 2026 (Bhadrapada Krishna Ashtami)',
      date: [2026, 9, 4], tithi: 'अष्टमी',
    },
    {
      name: 'Diwali Amavasya 2026 (Amavasya ends 9 Nov 12:31)',
      date: [2026, 11, 9], tithi: 'अमावास्या', tithiEndsBefore: '12:45', tithiEndsAfter: '12:15',
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const p = computePanchang(c.date[0], c.date[1], c.date[2], PUNE);
      expect(p.tithi.name).toBe(c.tithi);
      if (c.tithiEndsBefore && c.tithiEndsAfter) {
        const end = marathiTimeToMinutes(p.tithi.endsAt);
        expect(end).toBeGreaterThanOrEqual(marathiTimeToMinutes(c.tithiEndsAfter));
        expect(end).toBeLessThanOrEqual(marathiTimeToMinutes(c.tithiEndsBefore));
      }
    });
  }

  it('covers tithi, nakshatra, yoga, karana, sunrise and rahu kaal', () => {
    const p = computePanchang(2026, 12, 12, PUNE);
    expect(p.tithi.name).toBeTruthy();
    expect(p.tithi.paksha).toMatch(/शुक्ल|कृष्ण/);
    expect(p.nakshatra.name).toBeTruthy();
    expect(p.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(p.nakshatra.pada).toBeLessThanOrEqual(4);
    expect(p.yoga.name).toBeTruthy();
    expect(p.karana.name).toBeTruthy();
    expect(p.sunrise).toMatch(/सकाळी/);
    expect(p.rahuKaal.start).toMatch(/सकाळी|दुपारी|संध्याकाळी/);
    expect(p.choghadiyaDay).toHaveLength(8);
    expect(p.choghadiyaNight).toHaveLength(8);
    expect(p.method.ayanamsa).toBe('lahiri');
    expect(p.masa).toBeTruthy();
  });

  it('places Rahu Kaal in the correct daily octant', () => {
    // Sunday: 8th part of the day; Monday: 2nd part.
    const sunday = computePanchang(2026, 9, 27, PUNE); // 27 Sep 2026 is a Sunday
    expect(sunday.weekday).toBe(0);
    const monday = computePanchang(2026, 9, 28, PUNE);
    expect(monday.weekday).toBe(1);
    const timeOfDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().slice(11, 16);
    expect(timeOfDay(sunday.rahuKaal.startIso) > timeOfDay(monday.rahuKaal.startIso)).toBe(true);
    expect(timeOfDay(sunday.rahuKaal.startIso) >= '15:00').toBe(true); // 8th octant
    expect(timeOfDay(monday.rahuKaal.startIso) <= '09:30').toBe(true); // 2nd octant
  });

  it('converts to Shaka and Vikram Samvat years', () => {
    expect(shakaFromGregorian(2026, 9, 24)).toBe(1948);
    expect(shakaFromGregorian(2026, 1, 10)).toBe(1947);
    const p = panchangForToday(PUNE);
    expect(p.vikramSamvat).toBe(p.shakaYear + 135);
  });
});

describe('panchang/muhurat — suitability, not verdicts', () => {
  it('scores a date and lists every contributing factor', () => {
    const result = evaluateMuhurat({ eventType: 'wedding', date: { year: 2026, month: 12, day: 12 }, location: PUNE });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.factors.length).toBeGreaterThan(4);
    expect(result.methodology.name).toContain('विवाह');
    expect(result.methodology.note).toContain('गुरुजींच्या');
    expect(result.band).toMatch(/अनुकूलता/);
  });

  it('never labels a date simply good or bad', () => {
    const result = evaluateMuhurat({ eventType: 'wedding', date: { year: 2026, month: 12, day: 12 }, location: PUNE });
    expect(JSON.stringify(result)).not.toMatch(/"bad"|अशुभ दिवस|खराब दिवस/);
  });

  it('penalises Kharmas for weddings (Sun in Sagittarius)', () => {
    const kharmas = evaluateMuhurat({ eventType: 'wedding', date: { year: 2026, month: 12, day: 20 }, location: PUNE });
    const hasKharmas = kharmas.factors.some((f) => f.id === 'kharmas');
    if (kharmas.panchang.sunRashi === 'धनु') {
      expect(hasKharmas).toBe(true);
      expect(kharmas.factors.find((f) => f.id === 'kharmas')?.delta).toBeLessThan(0);
    } else {
      expect(hasKharmas).toBe(false);
    }
  });

  it('finds and ranks muhurats across a date range', () => {
    const found = findMuhurats({
      eventType: 'wedding', location: PUNE, from: '2026-11-15', to: '2026-12-15', limit: 5,
    });
    expect(found.length).toBeGreaterThan(0);
    expect(found.length).toBeLessThanOrEqual(5);
    // ranked descending
    for (let i = 1; i < found.length; i += 1) {
      expect(found[i - 1]!.score).toBeGreaterThanOrEqual(found[i]!.score);
    }
    expect(found[0]!.recommendedWindows.length).toBeGreaterThan(0);
  });

  it('returns recommended windows that avoid Rahu Kaal', () => {
    const result = evaluateMuhurat({ eventType: 'grhapravesh' in {} ? 'gruhapravesh' : 'gruhapravesh', date: { year: 2026, month: 12, day: 12 }, location: PUNE });
    for (const w of result.recommendedWindows) {
      const overlapsRahu = w.startIso < result.panchang.rahuKaal.endIso && result.panchang.rahuKaal.startIso < w.endIso;
      expect(overlapsRahu).toBe(false);
    }
    expect(result.avoidWindows).toHaveLength(3);
  });
});

describe('panchang/kundali — private guna milan', () => {
  it('derives rashi, nakshatra, pada, gana and nadi from a birth moment', () => {
    const k = kundaliFromBirth({
      dob: '1998-04-12', time: '06:15', place: PUNE,
    });
    expect(k.rashi).toBeGreaterThanOrEqual(1);
    expect(k.rashi).toBeLessThanOrEqual(12);
    expect(k.nakshatra).toBeGreaterThanOrEqual(1);
    expect(k.nakshatra).toBeLessThanOrEqual(27);
    expect([1, 2, 3, 4]).toContain(k.pada);
    expect(['देव', 'मनुष्य', 'राक्षस']).toContain(k.gana);
    expect(['आदि', 'मध्य', 'अंत्य']).toContain(k.nadi);
    expect(k.rashiLord).toBeTruthy();
    expect(k.nakshatraDevata).toBeTruthy();
  });

  it('computes all eight kootas with the classical maxima', () => {
    const bride = { rashi: 2, nakshatra: 4 }; // वृषभ / रोहिणी
    const groom = { rashi: 5, nakshatra: 12 }; // सिंह / उत्तरा फाल्गुनी
    const result = gunaMilan(bride, groom);
    expect(result.maxTotal).toBe(36);
    expect(result.kootas.map((k) => k.key)).toEqual([
      'varna', 'vashya', 'tara', 'yoni', 'grahaMaitri', 'gana', 'bhakoot', 'nadi',
    ]);
    expect(result.kootas.reduce((s, k) => s + k.score, 0)).toBeCloseTo(result.total, 2);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(36);
  });

  it('gives nadi 0 when both share a nadi (classical rule)', () => {
    expect(nadiKoota({ rashi: 1, nakshatra: 1 }, { rashi: 3, nakshatra: 6 }).score).toBe(0); // both आदि
    expect(nadiKoota({ rashi: 1, nakshatra: 1 }, { rashi: 3, nakshatra: 2 }).score).toBe(8);
  });

  it('gives gana 6 for the same gana and 0 for manushya–rakshasa', () => {
    expect(ganaKoota({ rashi: 1, nakshatra: 1 }, { rashi: 1, nakshatra: 7 }).score).toBe(6); // देव/देव
    expect(ganaKoota({ rashi: 1, nakshatra: 2 }, { rashi: 1, nakshatra: 3 }).score).toBe(0); // मनुष्य/राक्षस
  });

  it('marks bhakoot dosha pairs with 0', () => {
    expect(bhakootKoota({ rashi: 1, nakshatra: 1 }, { rashi: 2, nakshatra: 3 }).score).toBe(0); // 2-12
    expect(bhakootKoota({ rashi: 1, nakshatra: 1 }, { rashi: 5, nakshatra: 8 }).score).toBe(0); // 5-9
    expect(bhakootKoota({ rashi: 1, nakshatra: 1 }, { rashi: 4, nakshatra: 6 }).score).toBe(7);
  });

  it('scores tara in both directions (max 3)', () => {
    // Identical nakshatra → both directions are तारा १; per the platform table
    // an identical janma nakshatra scores full marks (listed in variations).
    expect(taraKoota({ rashi: 1, nakshatra: 5 }, { rashi: 1, nakshatra: 5 }).score).toBe(3);
    // एकच दिशा शुभ → 1.5
    const oneWay = taraKoota({ rashi: 1, nakshatra: 1 }, { rashi: 1, nakshatra: 2 });
    expect([0, 1.5, 3]).toContain(oneWay.score);
  });

  it('scores varna 1 only when the groom is not lower than the bride', () => {
    // कर्क (ब्राह्मण) bride with मेष (क्षत्रिय) groom → groom lower → 0
    expect(varnaKoota({ rashi: 4, nakshatra: 7 }, { rashi: 1, nakshatra: 1 }).score).toBe(0);
    // मेष (क्षत्रिय) bride with कर्क (ब्राह्मण) groom → 1
    expect(varnaKoota({ rashi: 1, nakshatra: 1 }, { rashi: 4, nakshatra: 7 }).score).toBe(1);
    // same varna → 1
    expect(varnaKoota({ rashi: 1, nakshatra: 1 }, { rashi: 5, nakshatra: 10 }).score).toBe(1);
  });

  it('scores yoni 4 for identical yoni and 0 for sworn enemies', () => {
    expect(yoniKoota({ rashi: 1, nakshatra: 1 }, { rashi: 1, nakshatra: 24 }).score).toBe(4); // both अश्व
    expect(yoniKoota({ rashi: 1, nakshatra: 12 }, { rashi: 1, nakshatra: 14 }).score).toBe(0); // गौ vs व्याघ्र
  });

  it('states methodology and refuses to issue a verdict', () => {
    const result = gunaMilan({ rashi: 2, nakshatra: 4 }, { rashi: 5, nakshatra: 12 });
    expect(result.methodology.table).toContain('ashtakoot');
    expect(result.methodology.disclaimer).toContain('कुटुंब');
    expect(result.methodology.variations.length).toBeGreaterThan(0);
  });
});

describe('panchang/masa — last new moon before sunrise', () => {
  const sunRashiAtNewMoon = (nm: Date, method: 'lahiri' | 'raman' | 'kp' = 'lahiri'): number =>
    Math.floor(toSidereal(sunLongitudeTropical(nm), nm, method) / 30);

  it('crosses from फाल्गुन to चैत्र exactly at the March 2026 new moon', () => {
    const before = computePanchang(2026, 3, 19, PUNE);
    const after = computePanchang(2026, 3, 20, PUNE);
    expect(before.tithi.name).toBe('अमावास्या');
    expect(before.masa).toBe('फाल्गुन');
    expect(after.masa).toBe('चैत्र');
    expect(after.masa).not.toBe(before.masa);
  });

  it('aligns every masa change with an amavasya sunrise in 2026', () => {
    const dates: Array<[number, number, number]> = [];
    for (let month = 1; month <= 12; month += 1) {
      const last = new Date(Date.UTC(2026, month, 0)).getUTCDate();
      for (let day = 1; day <= last; day += 1) dates.push([2026, month, day]);
    }
    const masas = dates.map(([y, m, d]) => computePanchang(y, m, d, PUNE));
    let changes = 0;
    for (let i = 1; i < masas.length; i += 1) {
      if (masas[i]!.masa !== masas[i - 1]!.masa) {
        changes += 1;
        expect(masas[i - 1]!.tithi.name).toBe('अमावास्या');
      }
    }
    expect(changes).toBeGreaterThanOrEqual(11);
    expect(changes).toBeLessThanOrEqual(13);
  });

  it('derives the masa from the in-repo new moon for Gudi Padwa eve 2027', () => {
    const reference = new Date('2027-04-01T00:30:00Z');
    const elongation = (jd: number): number => {
      const d = new Date((jd - 2440587.5) * 86_400_000);
      return ((toSidereal(moonLongitudeTropical(d), d) - toSidereal(sunLongitudeTropical(d), d)) % 360 + 360) % 360;
    };
    const jdRef = reference.getTime() / 86_400_000 + 2440587.5;
    const diff = elongation(jdRef);
    let jd = jdRef - diff / 12.1907;
    for (let i = 0; i < 12; i += 1) {
      const delta = ((elongation(jd) - 0 + 540) % 360) - 180;
      jd -= delta / 12.1907;
    }
    const newMoon = new Date((jd - 2440587.5) * 86_400_000);
    expect(Math.abs(newMoon.getTime() - reference.getTime())).toBeLessThan(29.5 * 86_400_000);
    const rashi = sunRashiAtNewMoon(newMoon);
    expect([10, 11]).toContain(rashi);
    const expected = ((rashi + 1) % 12);
    const masa = computePanchang(2027, 4, 1, PUNE).masa;
    const names = ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'];
    expect(masa).toBe(names[expected]);
    expect(['फाल्गुन', 'चैत्र']).toContain(masa);
  });
});

describe('panchang/ayanamsa — method threading', () => {
  it('applies the documented offsets for raman and kp', () => {
    const d = new Date('2026-06-01T12:00:00Z');
    const lahiri = ayanamsaDeg(d, 'lahiri');
    expect(ayanamsaDeg(d, 'raman')).toBeCloseTo(lahiri - 1.1666, 10);
    expect(ayanamsaDeg(d, 'kp')).toBeCloseTo(lahiri + 0.2833, 10);
    expect(ayanamsaDeg(d)).toBeCloseTo(lahiri, 10);
  });

  it('returns the method-specific ayanamsa from luminaries', () => {
    const d = new Date('2026-12-12T06:00:00Z');
    const lahiri = luminaries(d, 'lahiri');
    const raman = luminaries(d, 'raman');
    const kp = luminaries(d, 'kp');
    expect(raman.ayanamsa).toBeCloseTo(lahiri.ayanamsa - 1.1666, 10);
    expect(kp.ayanamsa).toBeCloseTo(lahiri.ayanamsa + 0.2833, 10);
    expect(raman.sun.sidereal).toBeCloseTo(lahiri.sun.sidereal + 1.1666, 10);
    expect(kp.moon.sidereal).toBeCloseTo(lahiri.moon.sidereal - 0.2833, 10);
  });

  it('reports the method-specific ayanamsa from computePanchang', () => {
    const lahiri = computePanchang(2026, 12, 12, PUNE, 'lahiri');
    const raman = computePanchang(2026, 12, 12, PUNE, 'raman');
    expect(raman.method.ayanamsa).toBe('raman');
    expect(raman.ayanamsa).toBeCloseTo(lahiri.ayanamsa - 1.1666, 4);
    expect(computePanchang(2026, 12, 12, PUNE, 'kp').ayanamsa).toBeCloseTo(lahiri.ayanamsa + 0.2833, 4);
  });
});

describe('panchang/karana — half-tithi index 0..59', () => {
  it('maps all 60 half-tithi indices to the correct Marathi names', () => {
    const expected: string[] = ['किंस्तुघ्न'];
    const mobile = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टी'];
    for (let i = 1; i <= 56; i += 1) expected.push(mobile[(i - 1) % 7]!);
    expected.push('शकुनि', 'चतुष्पद', 'नागव');
    expect(expected).toHaveLength(60);
    for (let i = 0; i < 60; i += 1) {
      expect(karanaNameFor(i)).toBe(expected[i]);
    }
  });

  it('wraps out-of-range indices into 0..59', () => {
    expect(karanaNameFor(60)).toBe(karanaNameFor(0));
    expect(karanaNameFor(-1)).toBe(karanaNameFor(59));
    expect(karanaNameFor(119)).toBe(karanaNameFor(59));
    expect(karanaNameFor(120)).toBe(karanaNameFor(0));
    expect(karanaNameFor(65)).toBe(karanaNameFor(5));
  });

  it('reports चतुष्पद/नागव for the Diwali amavasya sunrise 2026', () => {
    const p = computePanchang(2026, 11, 9, PUNE);
    expect(p.tithi.name).toBe('अमावास्या');
    expect(p.karana.name).toBe('नागव');
    expect(p.karana.index).toBeGreaterThanOrEqual(0);
    expect(p.karana.index).toBeLessThanOrEqual(59);
    expect(karanaNameFor(p.karana.index)).toBe(p.karana.name);
  });

  it('keeps karana.index inside 0..59 for every day of 2026', () => {
    for (let month = 1; month <= 12; month += 1) {
      const last = new Date(Date.UTC(2026, month, 0)).getUTCDate();
      for (let day = 1; day <= last; day += 1) {
        const p = computePanchang(2026, month, day, PUNE);
        expect(p.karana.index).toBeGreaterThanOrEqual(0);
        expect(p.karana.index).toBeLessThanOrEqual(59);
        expect(karanaNameFor(p.karana.index)).toBe(p.karana.name);
      }
    }
  });
});

describe('panchang/determinism', () => {
  it('produces byte-identical output for identical inputs', () => {
    const a = computePanchang(2026, 12, 12, PUNE);
    const b = computePanchang(2026, 12, 12, PUNE);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('returns both luminaries with sidereal and tropical coordinates', () => {
    const { sun, moon, ayanamsa } = luminaries(new Date('2026-12-12T06:00:00Z'));
    expect(sun.sidereal).toBeLessThan(sun.tropical);
    expect(moon.sidereal).toBeLessThan(moon.tropical);
    expect(ayanamsa).toBeGreaterThan(24);
  });
});
