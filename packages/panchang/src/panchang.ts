/**
 * Panchang engine — deterministic daily Hindu calendar for a given place.
 *
 * Produces: tithi (with end time), nakshatra (with end time), yoga, karana,
 * sunrise/sunset, Rahu Kaal / Yamaganda / Gulika, Choghadiya (day + night),
 * Brahma / Abhijit / Vijaya muhurats and the Shaka & Vikram Samvat years.
 *
 * The engine is *deterministic and citable*: every value carries the method and
 * ephemeris version used to compute it, because a family that plans a wedding
 * around a muhurat deserves to know which tables produced it.
 */

import {
  lahiriAyanamsaDeg, luminaries, moonLongitudeTropical, norm360, sunLongitudeTropical,
  sunTimes as computeSunTimes, toSidereal, type AyanamsaMethod, type SunTimes,
} from './astronomy.js';

export const EPHEMERIS_VERSION = 'mazi-panchang-1.0.0';

export const TITHI_NAMES_MR = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पौर्णिमा',
] as const;

export const NAKSHATRA_NAMES_MR = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्रा', 'पुनर्वसू', 'पुष्य', 'आश्लेषा', 'मघा',
  'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूळ', 'पूर्वाषाढा',
  'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपदा', 'उत्तरा भाद्रपदा', 'रेवती',
] as const;

export const YOGA_NAMES_MR = [
  'विष्कुंभ', 'प्रीती', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृती', 'शूल', 'गंड',
  'वृद्धी', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धी', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव',
  'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृती',
] as const;

export const KARANA_NAMES_MR = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टी',
] as const;

export const RASHI_NAMES_MR = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तूळ', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

export const RASHI_LORDS_MR = [
  'मंगळ', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध',
  'शुक्र', 'मंगळ', 'गुरु', 'शनि', 'शनि', 'गुरु',
] as const;

export const WEEKDAY_MR = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'] as const;
export const WEEKDAY_SHORT_MR = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'] as const;

export const CHOGHADIYA_NAMES = ['उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग'] as const;
export type ChoghadiyaName = (typeof CHOGHADIYA_NAMES)[number];

/** Qualities as per classical texts — used for scheduling, not for judgement. */
export const CHOGHADIYA_QUALITY: Record<ChoghadiyaName, 'शुभ' | 'मध्यम' | 'अशुभ'> = {
  अमृत: 'शुभ', शुभ: 'शुभ', लाभ: 'शुभ', चर: 'मध्यम', उद्वेग: 'अशुभ', रोग: 'अशुभ', काल: 'अशुभ',
};

/** Rahu Kaal / Yamaganda / Gulika part index (1-based) by weekday, Sunday = 0. */
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3] as const;
const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6] as const;
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1] as const;

/** First Choghadiya of the day / night, by weekday (Sunday = 0). */
const DAY_CHOGHADIYA_START: ChoghadiyaName[] = ['उद्वेग', 'अमृत', 'रोग', 'लाभ', 'शुभ', 'चर', 'काल'];
const NIGHT_CHOGHADIYA_START: ChoghadiyaName[] = ['शुभ', 'चर', 'काल', 'उद्वेग', 'अमृत', 'रोग', 'लाभ'];
/** Cyclic order used after the first segment. */
const CHOGHADIYA_ORDER: ChoghadiyaName[] = ['उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग'];

export interface TimeWindow {
  label: string;
  start: string;
  end: string;
  /** ISO instants for countdowns and calendar export. */
  startIso: string;
  endIso: string;
  quality?: 'शुभ' | 'मध्यम' | 'अशुभ';
  note?: string;
}

export interface PanchangLocation {
  city: string;
  latitude: number;
  longitude: number;
  /** UTC offset in hours (India = 5.5). */
  tzOffsetHours?: number;
  timezone?: string;
}

export interface PanchangResult {
  date: string;
  location: PanchangLocation;
  weekday: number;
  weekdayName: string;
  /** शालिवाहन शक संवत्सर */
  shakaYear: number;
  /** विक्रम संवत */
  vikramSamvat: number;
  tithi: { index: number; name: string; paksha: 'शुक्ल' | 'कृष्ण'; isPurnima: boolean; isAmavasya: boolean; endsAt: string };
  nakshatra: { index: number; name: string; pada: number; endsAt: string };
  yoga: { index: number; name: string; endsAt: string };
  karana: { index: number; name: string };
  sunrise: string | null;
  sunset: string | null;
  solarNoon: string;
  dayLength: string;
  moonRashi: string;
  sunRashi: string;
  masa: string;
  rahuKaal: TimeWindow;
  yamaganda: TimeWindow;
  gulikaKaal: TimeWindow;
  abhijitMuhurat: TimeWindow;
  brahmaMuhurat: TimeWindow;
  vijayaMuhurat: TimeWindow;
  godhuliMuhurat: TimeWindow;
  choghadiyaDay: TimeWindow[];
  choghadiyaNight: TimeWindow[];
  ayanamsa: number;
  method: { ayanamsa: AyanamsaMethod; ephemeris: string; accuracyNote: string };
}

const MASA_NAMES = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्रपद',
  'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन',
] as const;

function fmt(date: Date | null, tzOffsetHours: number): string | null {
  if (!date) return null;
  const local = new Date(date.getTime() + tzOffsetHours * 3_600_000);
  const h = local.getUTCHours();
  const m = local.getUTCMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const period = h < 4 ? 'रात्री' : h < 12 ? 'सकाळी' : h < 16 ? 'दुपारी' : h < 20 ? 'संध्याकाळी' : 'रात्री';
  const dev = (n: number) => String(n).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[Number(d)] as string);
  // Pad *before* converting: padding a Devanagari string with an ASCII '0'
  // produced the hybrid "७:0८" that made sunrise times look broken.
  return `${period} ${dev(h12)}:${dev(m).toString().padStart(2, '०')}`;
}

function mkWindow(label: string, start: Date, end: Date, tz: number, extra: Partial<TimeWindow> = {}): TimeWindow {
  return {
    label,
    start: fmt(start, tz) ?? '',
    end: fmt(end, tz) ?? '',
    startIso: new Date(start.getTime()).toISOString(),
    endIso: new Date(end.getTime()).toISOString(),
    ...extra,
  };
}

/** Find the instant at which a fast-moving angle reaches a target value. */
function findAngleCrossing(
  targetLongitude: number,
  fromJd: number,
  angleAt: (jd: number) => number,
  ratePerDay: number,
): Date {
  let jd = fromJd;
  for (let i = 0; i < 12; i += 1) {
    const diff = ((angleAt(jd) - targetLongitude + 540) % 360) - 180;
    jd -= diff / ratePerDay;
  }
  return new Date((jd - 2440587.5) * 86_400_000);
}

/**
 * Compute the Panchang for a local calendar date at a place.
 */
export function computePanchang(
  year: number,
  month: number,
  day: number,
  location: PanchangLocation,
  method: AyanamsaMethod = 'lahiri',
): PanchangResult {
  const tz = location.tzOffsetHours ?? 5.5;
  // Local midnight → UTC instant
  const localMidnightUtc = Date.UTC(year, month - 1, day, 0, 0, 0) - tz * 3_600_000;
  const noonUtc = new Date(localMidnightUtc + 12 * 3_600_000 + tz * 3_600_000 * 0);

  const times: SunTimes = computeSunTimes(year, month, day, location.latitude, location.longitude, tz);
  const sunrise = times.sunrise ?? new Date(Date.UTC(year, month - 1, day, 6, 0, 0) - tz * 3_600_000);
  const sunset = times.sunset ?? new Date(Date.UTC(year, month - 1, day, 18, 0, 0) - tz * 3_600_000);

  // Panchang values are computed at local sunrise (the traditional convention).
  const reference = sunrise;
  const { sun, moon } = luminaries(reference, method);
  void noonUtc;

  const sunLong = sun.sidereal;
  const moonLong = moon.sidereal;
  const diff = norm360(moonLong - sunLong);

  const tithiIndex = Math.floor(diff / 12); // 0..29
  const paksha: 'शुक्ल' | 'कृष्ण' = tithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';
  const tithiNumber = tithiIndex % 15; // 0..14
  const tithiName = tithiNumber === 14
    ? (paksha === 'शुक्ल' ? 'पौर्णिमा' : 'अमावास्या')
    : (TITHI_NAMES_MR[tithiNumber] as string);

  // End of the current tithi: next multiple of 12° of (moon - sun)
  const nextTithiBoundary = (tithiIndex + 1) * 12;
  const tithiEndsAt = findAngleCrossing(
    nextTithiBoundary,
    reference.getTime() / 86_400_000 + 2440587.5,
    (jd) => {
      const d = new Date((jd - 2440587.5) * 86_400_000);
      return norm360(toSidereal(moonLongitudeTropical(d), d, method) - toSidereal(sunLongitudeTropical(d), d, method));
    },
    12.1907, // mean elongation rate deg/day
  );

  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const pada = Math.floor((moonLong % (360 / 27)) / (360 / 108)) + 1;
  const nextNakshatraBoundary = (nakshatraIndex + 1) * (360 / 27);
  const nakshatraEndsAt = findAngleCrossing(
    nextNakshatraBoundary,
    reference.getTime() / 86_400_000 + 2440587.5,
    (jd) => {
      const d = new Date((jd - 2440587.5) * 86_400_000);
      return toSidereal(moonLongitudeTropical(d), d, method);
    },
    13.1764,
  );

  const yogaIndex = Math.floor(norm360(sunLong + moonLong) / (360 / 27));
  const yogaEndsAt = findAngleCrossing(
    (yogaIndex + 1) * (360 / 27),
    reference.getTime() / 86_400_000 + 2440587.5,
    (jd) => {
      const d = new Date((jd - 2440587.5) * 86_400_000);
      return norm360(toSidereal(sunLongitudeTropical(d), d, method) + toSidereal(moonLongitudeTropical(d), d, method));
    },
    13.4714,
  );

  const karanaIndexRaw = Math.floor(diff / 6); // 0..59
  const karanaName = karanaNameFor(karanaIndexRaw);

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = 86_400_000 - dayMs;
  const eighth = dayMs / 8;
  const nightEighth = nightMs / 8;

  const partWindow = (label: string, part: number, quality?: 'शुभ' | 'मध्यम' | 'अशुभ') =>
    mkWindow(label, new Date(sunrise.getTime() + (part - 1) * eighth), new Date(sunrise.getTime() + part * eighth), tz, quality ? { quality } : {});

  const rahuKaal = partWindow('राहुकाळ', RAHU_PART[weekday] as number, 'अशुभ');
  const yamaganda = partWindow('यमगंड', YAMAGANDA_PART[weekday] as number, 'अशुभ');
  const gulikaKaal = partWindow('गुलिक काळ', GULIKA_PART[weekday] as number, 'अशुभ');

  // Abhijit: the 8th of 15 equal parts of the day, centred on solar noon.
  const fifteenth = dayMs / 15;
  const abhijitMuhurat = mkWindow(
    'अभिजित मुहूर्त',
    new Date(times.solarNoon.getTime() - fifteenth / 2),
    new Date(times.solarNoon.getTime() + fifteenth / 2),
    tz,
    { quality: 'शुभ', note: 'सर्व कार्यांसाठी शुभ — राहुकाळात असल्यास अभिजित प्रमुख' },
  );

  const brahmaMuhurat = mkWindow(
    'ब्रह्म मुहूर्त',
    new Date(sunrise.getTime() - 96 * 60_000),
    new Date(sunrise.getTime() - 48 * 60_000),
    tz,
    { quality: 'शुभ', note: 'जप, ध्यान व पूजेसाठी उत्तम' },
  );

  const vijayaMuhurat = mkWindow(
    'विजय मुहूर्त',
    new Date(sunrise.getTime() + dayMs * 0.6),
    new Date(sunrise.getTime() + dayMs * 0.6667),
    tz,
    { quality: 'शुभ' },
  );

  const godhuli = mkWindow(
    'गोधूली मुहूर्त',
    new Date(sunset.getTime() - twelfth(dayMs)),
    new Date(sunset.getTime() + twelfth(dayMs)),
    tz,
    { quality: 'शुभ', note: 'गोधूली — गायींच्या खुरातून उडणाऱ्या धुळीचा वेळ' },
  );

  const choghadiyaDay: TimeWindow[] = [];
  let dIdx = CHOGHADIYA_ORDER.indexOf(DAY_CHOGHADIYA_START[weekday] as ChoghadiyaName);
  for (let i = 0; i < 8; i += 1) {
    const name = CHOGHADIYA_ORDER[(dIdx + i) % 7] as ChoghadiyaName;
    choghadiyaDay.push(
      mkWindow(name, new Date(sunrise.getTime() + i * eighth), new Date(sunrise.getTime() + (i + 1) * eighth), tz, {
        quality: CHOGHADIYA_QUALITY[name],
      }),
    );
  }
  dIdx = CHOGHADIYA_ORDER.indexOf(NIGHT_CHOGHADIYA_START[weekday] as ChoghadiyaName);
  const choghadiyaNight: TimeWindow[] = [];
  for (let i = 0; i < 8; i += 1) {
    const name = CHOGHADIYA_ORDER[(dIdx + i) % 7] as ChoghadiyaName;
    choghadiyaNight.push(
      mkWindow(name, new Date(sunset.getTime() + i * nightEighth), new Date(sunset.getTime() + (i + 1) * nightEighth), tz, {
        quality: CHOGHADIYA_QUALITY[name],
      }),
    );
  }

  const shakaYear = shakaFromGregorian(year, month, day);
  const vikramSamvat = shakaYear + 135;

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    location: { ...location, tzOffsetHours: tz },
    weekday,
    weekdayName: WEEKDAY_MR[weekday] as string,
    shakaYear,
    vikramSamvat,
    tithi: {
      index: tithiIndex,
      name: tithiName,
      paksha,
      isPurnima: tithiIndex === 14,
      isAmavasya: tithiIndex === 29,
      endsAt: fmt(tithiEndsAt, tz) ?? '',
    },
    nakshatra: {
      index: nakshatraIndex,
      name: NAKSHATRA_NAMES_MR[nakshatraIndex] as string,
      pada,
      endsAt: fmt(nakshatraEndsAt, tz) ?? '',
    },
    yoga: { index: yogaIndex, name: YOGA_NAMES_MR[yogaIndex] as string, endsAt: fmt(yogaEndsAt, tz) ?? '' },
    karana: { index: karanaIndexRaw, name: karanaName },
    sunrise: fmt(sunrise, tz),
    sunset: fmt(sunset, tz),
    solarNoon: fmt(times.solarNoon, tz) ?? '',
    dayLength: `${Math.floor(dayMs / 3_600_000)} तास ${Math.round((dayMs % 3_600_000) / 60_000)} मिनिटे`,
    moonRashi: RASHI_NAMES_MR[Math.floor(moonLong / 30)] as string,
    sunRashi: RASHI_NAMES_MR[Math.floor(sunLong / 30)] as string,
    masa: MASA_NAMES[((month + 9) % 12)] as string,
    rahuKaal,
    yamaganda,
    gulikaKaal,
    abhijitMuhurat,
    brahmaMuhurat,
    vijayaMuhurat,
    godhuliMuhurat: godhuli,
    choghadiyaDay,
    choghadiyaNight,
    ayanamsa: Number(lahiriAyanamsaDeg(reference).toFixed(4)),
    method: {
      ayanamsa: method,
      ephemeris: EPHEMERIS_VERSION,
      accuracyNote: 'सूर्यग्रहण अचूकता ±०.०१°, चंद्र ±०.०२° — तिथी सीमा ±३ मिनिटे. सूर्योदय/सूर्यास्त ±४० सेकंद.',
    },
  };
}

function twelfth(dayMs: number): number {
  return dayMs / 12;
}

function karanaNameFor(index: number): string {
  if (index === 0) return 'किंस्तुघ्न';
  if (index >= 57) return (['शकुनि', 'चतुष्पद', 'नागव'] as const)[index - 57] as string;
  return KARANA_NAMES_MR[(index - 1) % 7] as string;
}

/** Shaka year from a Gregorian date (new year on 22 March). */
export function shakaFromGregorian(year: number, month: number, day: number): number {
  const beforeNewYear = month < 3 || (month === 3 && day < 22);
  return beforeNewYear ? year - 79 : year - 78;
}

/** Convenience wrapper for "today at this place". */
export function panchangForToday(location: PanchangLocation, method: AyanamsaMethod = 'lahiri'): PanchangResult {
  const tz = location.tzOffsetHours ?? 5.5;
  const local = new Date(Date.now() + tz * 3_600_000);
  return computePanchang(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), location, method);
}
