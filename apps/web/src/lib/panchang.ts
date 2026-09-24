import 'server-only';

import { computePanchang, type PanchangResult } from '@mazi/panchang';
import { formatMarathiDate, MARATHI_WEEKDAYS } from '@mazi/marathi';

/**
 * City → coordinates for the panchang engine.
 *
 * Sunrise differs by up to 20 minutes across Maharashtra, and tithi boundaries
 * are city-specific in traditional practice, so we never compute "for India" —
 * every page passes the city the family actually lives in.
 */
export interface CityLocation {
  city: string;
  latitude: number;
  longitude: number;
  tzOffsetHours: number;
  label: string;
}

export const MAHARASHTRA_CITIES: Record<string, CityLocation> = {
  'पुणे': { city: 'पुणे', latitude: 18.5204, longitude: 73.8567, tzOffsetHours: 5.5, label: 'पुणे, महाराष्ट्र' },
  'पिंपरी-चिंचवड': { city: 'पिंपरी-चिंचवड', latitude: 18.6279, longitude: 73.8009, tzOffsetHours: 5.5, label: 'पिंपरी-चिंचवड, महाराष्ट्र' },
  'मुंबई': { city: 'मुंबई', latitude: 19.076, longitude: 72.8777, tzOffsetHours: 5.5, label: 'मुंबई, महाराष्ट्र' },
  'नाशिक': { city: 'नाशिक', latitude: 19.9975, longitude: 73.7898, tzOffsetHours: 5.5, label: 'नाशिक, महाराष्ट्र' },
  'नागपूर': { city: 'नागपूर', latitude: 21.1458, longitude: 79.0882, tzOffsetHours: 5.5, label: 'नागपूर, महाराष्ट्र' },
  'कोल्हापूर': { city: 'कोल्हापूर', latitude: 16.705, longitude: 74.2433, tzOffsetHours: 5.5, label: 'कोल्हापूर, महाराष्ट्र' },
  'सातारा': { city: 'सातारा', latitude: 17.6805, longitude: 74.0183, tzOffsetHours: 5.5, label: 'सातारा, महाराष्ट्र' },
  'सांगली': { city: 'सांगली', latitude: 16.8524, longitude: 74.5815, tzOffsetHours: 5.5, label: 'सांगली, महाराष्ट्र' },
  'ठाणे': { city: 'ठाणे', latitude: 19.2183, longitude: 72.9781, tzOffsetHours: 5.5, label: 'ठाणे, महाराष्ट्र' },
  'औरंगाबाद': { city: 'छत्रपती संभाजीनगर', latitude: 19.8762, longitude: 75.3433, tzOffsetHours: 5.5, label: 'छत्रपती संभाजीनगर, महाराष्ट्र' },
  'सोलापूर': { city: 'सोलापूर', latitude: 17.6599, longitude: 75.9064, tzOffsetHours: 5.5, label: 'सोलापूर, महाराष्ट्र' },
  'अमरावती': { city: 'अमरावती', latitude: 20.9374, longitude: 77.7796, tzOffsetHours: 5.5, label: 'अमरावती, महाराष्ट्र' },
};

export const CITY_OPTIONS = Object.keys(MAHARASHTRA_CITIES);

/**
 * Shown wherever panchang values are displayed to a guest or a family: the
 * platform does not want to look like an authority on ritual decisions.
 */
export const DPO_NOTE =
  'गणना पारंपारिक पंचांग पद्धतीने (लाहिरी अयनांश); अंतिम निर्णय कुटुंब व गुरुजींचा.';

export function locationFor(city: string): CityLocation {
  return MAHARASHTRA_CITIES[city] ?? MAHARASHTRA_CITIES['पुणे']!;
}

const panchangCache = new Map<string, PanchangResult>();

/**
 * Panchang values are computed once per city+date and cached in-process for the
 * life of the server (the engine is deterministic, so a cached value is not
 * stale — it is the same value). In production this map is replaced by Redis
 * with a 24-hour TTL keyed on the ephemeris version.
 */
export function panchangFor(city: string, date: Date): PanchangResult {
  const key = `${city}:${date.toISOString().slice(0, 10)}`;
  const cached = panchangCache.get(key);
  if (cached) return cached;

  const location = locationFor(city);
  const result = computePanchang(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    { city, latitude: location.latitude, longitude: location.longitude, tzOffsetHours: location.tzOffsetHours },
    'lahiri',
  );
  panchangCache.set(key, result);
  if (panchangCache.size > 512) {
    const oldest = panchangCache.keys().next().value;
    if (oldest) panchangCache.delete(oldest);
  }
  return result;
}

/** "गुरुवार" — the weekday Marathi families actually name. */
export function marathiWeekday(date: Date): string {
  return MARATHI_WEEKDAYS[date.getUTCDay()] ?? formatMarathiDate(date, 'long');
}

export { formatMarathiDate };
