import { ImageResponse } from 'next/og';
import { createElement, type CSSProperties, type ReactElement } from 'react';
import { formatMarathiDate } from '@mazi/marathi';
import type { EventRecord } from '@mazi/store';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=86400';

export const OG_BRAND_NAME = 'माझी पत्रिका';
export const OG_BRAND_TAGLINE = 'मराठी डिजिटल पत्रिका • RSVP • शुभेच्छा • पंचांग';
export const OG_INVOCATION = '॥ श्री गणेशाय नमः ॥';
export const OG_EVENT_KICKER = 'सस्नेह निमंत्रण';
export const OG_BRAND_KICKER = 'मराठी शुभकार्य व्यासपीठ';
export const OG_FALLBACK_TITLE = 'माझी पत्रिका';
export const OG_FALLBACK_META = 'विवाह • साखरपुडा • नामकरण • गृहप्रवेश • सत्यनारायण पूजा';
export const OG_FALLBACK_VENUE = 'महाराष्ट्रातील प्रत्येक शुभकार्यासाठी';

export const OG_FONT_DISPLAY = 'OgDisplay';
export const OG_FONT_BODY = 'OgBody';

export const OG_COLORS = {
  ivory: '#fdfbf7',
  ivoryDeep: '#f6efe3',
  maroon: '#6b1d2a',
  maroonDeep: '#3b0912',
  gold: '#c6a15b',
  goldBright: '#d4af37',
  goldDeep: '#996f16',
  soft: '#524743',
  leaf: '#1b5e45',
} as const;

export interface OgCardData {
  kicker: string;
  title: string;
  meta: string;
  venue: string;
}

export type OgEventFields = Pick<EventRecord, 'city' | 'eventDate' | 'title' | 'venueName'>;

export interface OgFontFile {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

interface OgFontSource {
  name: string;
  weight: 400 | 700;
  css: string;
}

const OG_FONT_UA = 'node';

const OG_FONT_SOURCES: OgFontSource[] = [
  { name: OG_FONT_DISPLAY, weight: 400, css: 'https://fonts.googleapis.com/css?family=Tiro+Devanagari+Marathi' },
  { name: OG_FONT_BODY, weight: 400, css: 'https://fonts.googleapis.com/css?family=Noto+Sans+Devanagari' },
  { name: OG_FONT_BODY, weight: 700, css: 'https://fonts.googleapis.com/css?family=Noto+Sans+Devanagari:700' },
];

let ogFontsPromise: Promise<OgFontFile[]> | undefined;

function ogFontBytesOk(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  const magic = new DataView(data).getUint32(0, false);
  return (
    magic === 0x00010000 || magic === 0x4f54544f || magic === 0x774f4646 || magic === 0x74727565 || magic === 0x74797031
  );
}

async function ogFetchBytes(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': OG_FONT_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const data = await response.arrayBuffer();
    if (!ogFontBytesOk(data)) return null;
    return data;
  } catch {
    return null;
  }
}

async function ogFontsFromCss(source: OgFontSource): Promise<OgFontFile[]> {
  try {
    const response = await fetch(source.css, {
      headers: { 'User-Agent': OG_FONT_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const css = await response.text();
    const urls = Array.from(
      new Set(
        Array.from(css.matchAll(/url\((https:[^)]+)\)/g))
          .map((match) => match[1])
          .filter((value): value is string => typeof value === 'string'),
      ),
    );
    const files = await Promise.all(
      urls.slice(0, 6).map(async (url) => {
        const data = await ogFetchBytes(url);
        return data ? { name: source.name, data, weight: source.weight, style: 'normal' as const } : null;
      }),
    );
    return files.filter((file): file is OgFontFile => file !== null);
  } catch {
    return [];
  }
}

export function loadOgFonts(): Promise<OgFontFile[]> {
  if (!ogFontsPromise) {
    ogFontsPromise = Promise.all(OG_FONT_SOURCES.map((source) => ogFontsFromCss(source)))
      .then((groups) => groups.flat())
      .catch(() => []);
  }
  return ogFontsPromise;
}

export function truncateOgText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd().concat('…');
}

export function ogDateLabel(eventDate: string | undefined): string {
  if (!eventDate) return '';
  try {
    return formatMarathiDate(eventDate, 'long');
  } catch {
    return '';
  }
}

export function ogCardFromEvent(event: OgEventFields): OgCardData {
  const dateLabel = ogDateLabel(event.eventDate);
  const meta = [event.city, dateLabel].filter((part) => part.length > 0).join(' • ');
  return {
    kicker: OG_EVENT_KICKER,
    title: truncateOgText(event.title, 64),
    meta: truncateOgText(meta, 72),
    venue: event.venueName ? truncateOgText(event.venueName, 56) : '',
  };
}

export function ogFallbackCard(): OgCardData {
  return {
    kicker: OG_BRAND_KICKER,
    title: OG_FALLBACK_TITLE,
    meta: OG_FALLBACK_META,
    venue: OG_FALLBACK_VENUE,
  };
}

function ogDiamond(color: string, size: number): ReactElement {
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    transform: 'rotate(45deg)',
    flexShrink: 0,
  };
  return createElement('div', { style });
}

function ogDot(color: string, size: number): ReactElement {
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  };
  return createElement('div', { style });
}

function ogMotifRow(colors: string[], size: number, gap: number): ReactElement {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap,
  };
  return createElement('div', { style }, ...colors.map((color) => ogDiamond(color, size)));
}

export function ogCardElement(card: OgCardData): ReactElement {
  const c = OG_COLORS;
  const titleSize = card.title.length > 30 ? 58 : 76;
  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: OG_WIDTH,
    height: OG_HEIGHT,
    backgroundColor: c.ivory,
  };
  const edgeStyle = (backgroundColor: string, width: number): CSSProperties => ({
    width,
    height: OG_HEIGHT,
    backgroundColor,
    flexShrink: 0,
  });
  const mainStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  };
  const bandStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
    height: 104,
    backgroundColor: c.maroonDeep,
    flexShrink: 0,
    paddingLeft: 40,
    paddingRight: 40,
  };
  const invocationStyle: CSSProperties = {
    color: c.goldBright,
    fontFamily: OG_FONT_DISPLAY,
    fontSize: 30,
    fontWeight: 400,
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  };
  const bodyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    paddingLeft: 72,
    paddingRight: 72,
    paddingTop: 22,
    paddingBottom: 24,
  };
  const kickerStyle: CSSProperties = {
    color: c.goldDeep,
    fontFamily: OG_FONT_BODY,
    fontSize: 24,
    fontWeight: 700,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: c.gold,
    borderRadius: 999,
    paddingLeft: 26,
    paddingRight: 26,
    paddingTop: 7,
    paddingBottom: 7,
  };
  const titleStyle: CSSProperties = {
    color: c.maroonDeep,
    fontFamily: OG_FONT_DISPLAY,
    fontSize: titleSize,
    fontWeight: 400,
    textAlign: 'center',
    lineHeight: 1.18,
    marginTop: 18,
  };
  const ruleStyle: CSSProperties = {
    width: 210,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.goldBright,
    marginTop: 18,
    flexShrink: 0,
  };
  const metaStyle: CSSProperties = {
    color: c.soft,
    fontFamily: OG_FONT_BODY,
    fontSize: 34,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.3,
    marginTop: 14,
  };
  const venueRowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 12,
  };
  const venueStyle: CSSProperties = {
    color: c.goldDeep,
    fontFamily: OG_FONT_BODY,
    fontSize: 27,
    fontWeight: 400,
    textAlign: 'center',
  };
  const footerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    backgroundColor: c.maroon,
    flexShrink: 0,
    paddingLeft: 52,
    paddingRight: 52,
  };
  const brandStackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
  const brandStyle: CSSProperties = {
    color: c.goldBright,
    fontFamily: OG_FONT_DISPLAY,
    fontSize: 34,
    fontWeight: 400,
    lineHeight: 1.1,
  };
  const taglineStyle: CSSProperties = {
    color: c.ivoryDeep,
    fontFamily: OG_FONT_BODY,
    fontSize: 21,
    fontWeight: 400,
  };
  return createElement(
    'div',
    { style: rootStyle },
    createElement('div', { style: edgeStyle(c.maroon, 20) }),
    createElement('div', { style: edgeStyle(c.goldBright, 8) }),
    createElement(
      'div',
      { style: mainStyle },
      createElement(
        'div',
        { style: bandStyle },
        ogMotifRow([c.goldBright, c.gold, c.leaf, c.gold, c.goldBright], 13, 14),
        createElement('div', { style: invocationStyle }, OG_INVOCATION),
        ogMotifRow([c.goldBright, c.gold, c.leaf, c.gold, c.goldBright], 13, 14),
      ),
      createElement(
        'div',
        { style: bodyStyle },
        createElement('div', { style: kickerStyle }, card.kicker),
        createElement('div', { style: titleStyle }, card.title),
        createElement('div', { style: ruleStyle }),
        createElement('div', { style: metaStyle }, card.meta),
        card.venue
          ? createElement(
              'div',
              { style: venueRowStyle },
              ogDot(c.leaf, 10),
              createElement('div', { style: venueStyle }, card.venue),
              ogDot(c.leaf, 10),
            )
          : null,
      ),
      createElement(
        'div',
        { style: footerStyle },
        createElement(
          'div',
          { style: brandStackStyle },
          createElement('div', { style: brandStyle }, OG_BRAND_NAME),
          createElement('div', { style: taglineStyle }, OG_BRAND_TAGLINE),
        ),
        ogMotifRow([c.goldBright, c.gold, c.ivory, c.gold, c.goldBright], 12, 12),
      ),
    ),
    createElement('div', { style: edgeStyle(c.goldBright, 8) }),
    createElement('div', { style: edgeStyle(c.maroon, 20) }),
  );
}

export async function renderOgImage(card: OgCardData): Promise<ImageResponse> {
  const withCache = (response: ImageResponse): ImageResponse => {
    response.headers.set('cache-control', OG_CACHE_CONTROL);
    return response;
  };
  const fallback = (): ImageResponse =>
    withCache(new ImageResponse(ogCardElement(card), { width: OG_WIDTH, height: OG_HEIGHT }));
  try {
    const fonts = await loadOgFonts();
    if (fonts.length === 0) return fallback();
    try {
      return withCache(new ImageResponse(ogCardElement(card), { width: OG_WIDTH, height: OG_HEIGHT, fonts }));
    } catch {
      return fallback();
    }
  } catch {
    return fallback();
  }
}
