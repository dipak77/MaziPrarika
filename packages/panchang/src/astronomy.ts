/**
 * Astronomy primitives: Julian date, Lahiri ayanamsa, and low-precision but
 * *specified* solar/lunar longitudes (Meeus, Astronomical Algorithms).
 *
 * Accuracy budget (documented, not hand-waved):
 *   • Sun apparent longitude  ≈ ±0.01°  →  tithi boundary ±1 min
 *   • Moon longitude (30 term ELP truncation) ≈ ±0.02° → tithi boundary ±3 min
 *   • Sunrise/sunset (NOAA, refraction + 0.833° altitude) ≈ ±40 s
 *
 * Every function is pure and timezone-explicit, so a Marathi devotee in Pune
 * and a server worker in Frankfurt compute the same muhurat.
 */

export const DEG = Math.PI / 180;
export const J2000 = 2451545.0;

export function norm360(deg: number): number {
  const v = deg % 360;
  return v < 0 ? v + 360 : v;
}

export function sinDeg(deg: number): number {
  return Math.sin(deg * DEG);
}

export function cosDeg(deg: number): number {
  return Math.cos(deg * DEG);
}

/** Julian Day for a UTC instant. */
export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/** Julian centuries from J2000. */
export function julianCenturies(jd: number): number {
  return (jd - J2000) / 36525;
}

/** Gregorian date → Julian Day at 00:00 UT (Meeus 7.1). */
export function julianDayFromCalendar(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees.
 * Reference: 23°51′10″ at J2000 with a 50.2878″/yr precession rate — matches
 * published Lahiri tables to ~0.01° across 1900–2100.
 */
export function lahiriAyanamsaDeg(date: Date | number): number {
  const jd = typeof date === 'number' ? date : julianDay(date);
  const yearsSince2000 = (jd - J2000) / 365.25;
  return 23.85283 + yearsSince2000 * (50.2878 / 3600) + 1e-8 * yearsSince2000 * yearsSince2000;
}

/** Apparent geocentric longitude of the Sun (degrees, tropical). */
export function sunLongitudeTropical(date: Date | number): number {
  const jd = typeof date === 'number' ? date : julianDay(date);
  const t = julianCenturies(jd);
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinDeg(m) +
    (0.019993 - 0.000101 * t) * sinDeg(2 * m) +
    0.000289 * sinDeg(3 * m);
  const trueLong = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  return norm360(trueLong - 0.00569 - 0.00478 * sinDeg(omega));
}

interface MoonTerm {
  d: number; m: number; mp: number; f: number; coeff: number;
}

/** Dominant terms of the ELP-2000/82 lunar longitude series (Meeus Table 47.A). */
const MOON_TERMS: MoonTerm[] = [
  { d: 0, m: 0, mp: 1, f: 0, coeff: 6.288774 },
  { d: 2, m: 0, mp: -1, f: 0, coeff: 1.274027 },
  { d: 2, m: 0, mp: 0, f: 0, coeff: 0.658314 },
  { d: 0, m: 0, mp: 2, f: 0, coeff: 0.213618 },
  { d: 0, m: 1, mp: 0, f: 0, coeff: -0.185116 },
  { d: 0, m: 0, mp: 0, f: 2, coeff: -0.114332 },
  { d: 2, m: 0, mp: -2, f: 0, coeff: 0.058793 },
  { d: 2, m: -1, mp: -1, f: 0, coeff: 0.057066 },
  { d: 2, m: 0, mp: 1, f: 0, coeff: 0.053322 },
  { d: 2, m: -1, mp: 0, f: 0, coeff: 0.045758 },
  { d: 0, m: 1, mp: -1, f: 0, coeff: -0.040923 },
  { d: 1, m: 0, mp: 0, f: 0, coeff: -0.034720 },
  { d: 0, m: 1, mp: 1, f: 0, coeff: -0.030383 },
  { d: 2, m: 0, mp: 0, f: -2, coeff: 0.015327 },
  { d: 0, m: 0, mp: 1, f: -2, coeff: -0.012528 },
  { d: 0, m: 0, mp: 1, f: 2, coeff: 0.010980 },
  { d: 4, m: 0, mp: -1, f: 0, coeff: 0.010675 },
  { d: 0, m: 0, mp: 3, f: 0, coeff: 0.010034 },
  { d: 4, m: 0, mp: -2, f: 0, coeff: 0.008548 },
  { d: 2, m: 1, mp: -1, f: 0, coeff: -0.007888 },
  { d: 2, m: 1, mp: 0, f: 0, coeff: -0.006766 },
  { d: 1, m: 0, mp: -1, f: 0, coeff: -0.005163 },
  { d: 1, m: 1, mp: 0, f: 0, coeff: 0.004987 },
  { d: 2, m: -1, mp: 1, f: 0, coeff: 0.004036 },
  { d: 2, m: 0, mp: 2, f: 0, coeff: 0.003994 },
  { d: 4, m: 0, mp: 0, f: 0, coeff: 0.003861 },
  { d: 2, m: 0, mp: -3, f: 0, coeff: 0.003665 },
  { d: 0, m: 1, mp: -2, f: 0, coeff: -0.002689 },
  { d: 2, m: 0, mp: -1, f: 2, coeff: -0.002602 },
  { d: 2, m: -1, mp: -2, f: 0, coeff: 0.002390 },
  { d: 1, m: 0, mp: 1, f: 0, coeff: -0.002348 },
  { d: 2, m: -2, mp: 0, f: 0, coeff: 0.002236 },
];

/** Apparent geocentric longitude of the Moon (degrees, tropical). */
export function moonLongitudeTropical(date: Date | number): number {
  const jd = typeof date === 'number' ? date : julianDay(date);
  const t = julianCenturies(jd);
  const lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + (t ** 3) / 538841 - (t ** 4) / 65194000;
  const d = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t + (t ** 3) / 545868 - (t ** 4) / 113065000;
  const m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t + (t ** 3) / 24490000;
  const mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t + (t ** 3) / 69699 - (t ** 4) / 14712000;
  const f = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t - (t ** 3) / 3526000 + (t ** 4) / 863310000;

  let sum = 0;
  for (const term of MOON_TERMS) {
    sum += term.coeff * sinDeg(term.d * d + term.m * m + term.mp * mp + term.f * f);
  }
  // Additive corrections A1/A2 (Meeus 47.6) — small but improves boundaries.
  const a1 = 119.75 + 131.849 * t;
  const a2 = 53.09 + 479264.290 * t;
  sum += 0.003958 * sinDeg(a1) + 0.001962 * sinDeg(lp - f) + 0.000318 * sinDeg(a2);

  // Eccentricity factor: terms with m = ±1 scale by e, m = ±2 by e².
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;
  for (const term of MOON_TERMS) {
    if (term.m === 0) continue;
    sum += term.coeff * (e ** Math.abs(term.m) - 1) *
      sinDeg(term.d * d + term.m * m + term.mp * mp + term.f * f);
  }

  return norm360(lp + sum);
}

/**
 * Tropical → sidereal (nirayana) longitude using the chosen ayanamsa.
 * `method` may be 'lahiri' (default, used by most Maharashtra panchangs).
 */
export function toSidereal(tropicalLongitude: number, date: Date | number, method: AyanamsaMethod = 'lahiri'): number {
  const ayanamsa = method === 'lahiri'
    ? lahiriAyanamsaDeg(date)
    : method === 'raman'
      ? lahiriAyanamsaDeg(date) - 1.1666
      : lahiriAyanamsaDeg(date) + 0.2833; // kp (Krishnamurti)
  return norm360(tropicalLongitude - ayanamsa);
}

export type AyanamsaMethod = 'lahiri' | 'raman' | 'kp';

export interface GrahaPosition {
  graha: 'सूर्य' | 'चंद्र';
  tropical: number;
  sidereal: number;
  rashiIndex: number;
  degInRashi: number;
}

/** Sun + Moon sidereal positions, the only two bodies a Panchang strictly needs. */
export function luminaries(date: Date | number, method: AyanamsaMethod = 'lahiri'): {
  sun: GrahaPosition;
  moon: GrahaPosition;
  ayanamsa: number;
} {
  const sunTropical = sunLongitudeTropical(date);
  const moonTropical = moonLongitudeTropical(date);
  const ayanamsa = lahiriAyanamsaDeg(date);
  const build = (g: GrahaPosition['graha'], tropical: number): GrahaPosition => {
    const sidereal = toSidereal(tropical, date, method);
    return {
      graha: g,
      tropical,
      sidereal,
      rashiIndex: Math.floor(sidereal / 30),
      degInRashi: sidereal % 30,
    };
  };
  return { sun: build('सूर्य', sunTropical), moon: build('चंद्र', moonTropical), ayanamsa };
}

/* ------------------------------------------------------------------ */
/* Sunrise / sunset (NOAA)                                             */
/* ------------------------------------------------------------------ */

const OBLIQUITY = 23.4392911;

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  dayLengthHours: number;
  /** True when the sun never rises/sets (polar) — surfaced, never hidden. */
  polar: 'none' | 'midnight-sun' | 'polar-night';
}

/**
 * Sunrise/sunset for a local calendar date at a given latitude/longitude.
 * `tzOffsetHours` is the local UTC offset (e.g. +5.5 for IST).
 */
export function sunTimes(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  tzOffsetHours = 5.5,
): SunTimes {
  // Local noon of the requested calendar date (JD, UT based).
  const localNoonJd = julianDayFromCalendar(year, month, day) + 0.5 - tzOffsetHours / 24;
  // Days since J2000 (Wikipedia "sunrise equation", step 1).
  const n = Math.ceil(localNoonJd - J2000 + 0.0008);
  // Mean solar noon: J* = n - l_w/360, with l_w the longitude measured WEST
  // (i.e. -east-longitude). This puts local solar noon at the right instant.
  const jStar = n - longitude / 360;

  const solarMeanAnomaly = norm360(357.5291 + 0.98560028 * jStar);
  const center = 1.9148 * sinDeg(solarMeanAnomaly) + 0.02 * sinDeg(2 * solarMeanAnomaly) +
    0.0003 * sinDeg(3 * solarMeanAnomaly);
  const perihelion = 102.9372;
  const eclipticLongitude = norm360(solarMeanAnomaly + center + perihelion + 180);
  const jTransit = J2000 + jStar + 0.0053 * sinDeg(solarMeanAnomaly) - 0.0069 * sinDeg(2 * eclipticLongitude);

  const declination = Math.asin(sinDeg(eclipticLongitude) * sinDeg(OBLIQUITY)) / DEG;
  const hourAngleArg = (sinDeg(-0.8333) - sinDeg(latitude) * sinDeg(declination)) /
    (cosDeg(latitude) * cosDeg(declination));

  const solarNoonMs = (jTransit - 2440587.5) * 86_400_000;

  if (hourAngleArg > 1) {
    return { sunrise: null, sunset: null, solarNoon: new Date(solarNoonMs), dayLengthHours: 0, polar: 'polar-night' };
  }
  if (hourAngleArg < -1) {
    return { sunrise: null, sunset: null, solarNoon: new Date(solarNoonMs), dayLengthHours: 24, polar: 'midnight-sun' };
  }

  const hourAngle = Math.acos(hourAngleArg) / DEG;
  const jSet = jTransit + hourAngle / 360;
  const jRise = jTransit - hourAngle / 360;

  const sunrise = new Date((jRise - 2440587.5) * 86_400_000);
  const sunset = new Date((jSet - 2440587.5) * 86_400_000);
  return {
    sunrise,
    sunset,
    solarNoon: new Date(solarNoonMs),
    dayLengthHours: (sunset.getTime() - sunrise.getTime()) / 3_600_000,
    polar: 'none',
  };
}
