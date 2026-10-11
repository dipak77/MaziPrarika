/**
 * @mazi/cake-atelier — font registry
 *
 * Seven OFL families, fifteen faces, all self-hosted. Nothing here fetches from
 * a CDN at runtime: a printable file must not depend on a network round-trip,
 * and a preview must not silently fall back to a different face.
 *
 * Licences: every family ships under the SIL Open Font License 1.1 — see
 * `fonts/<family>/OFL.txt` and `FONTS.md` for attribution.
 */

import metricsRaw from './font-metrics.json';

export type FontFamilyId =
  | 'baloo2'
  | 'playfair-display'
  | 'poppins'
  | 'quicksand'
  | 'great-vibes'
  | 'bebas-neue'
  | 'noto-sans-devanagari';

export type FontCategory = 'display' | 'serif' | 'sans' | 'script' | 'condensed';
export type ScriptSupport = 'latin' | 'devanagari';

export interface FontFace {
  /** Stable face id, e.g. `baloo2-600` — matches the metrics table key. */
  id: string;
  family: FontFamilyId;
  weight: number;
  /** Path relative to the package root. */
  file: string;
  /** Path served by the web app (synced into `public/cake-fonts`). */
  publicPath: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  lineGap: number;
  capHeight: number;
  xHeight: number;
}

export interface FontFamily {
  id: FontFamilyId;
  label: string;
  /** CSS family name used in the studio preview. */
  cssFamily: string;
  category: FontCategory;
  /** One-line character description for the font library. */
  note: string;
  moods: string[];
  scripts: ScriptSupport[];
  designer: string;
  licence: 'OFL-1.1';
  faces: FontFace[];
}

interface MetricsFace {
  family: string;
  file: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  lineGap: number;
  capHeight: number;
  xHeight: number;
  hasDevanagari: boolean;
  advances: [number, number][];
}

interface MetricsPayload {
  version: number;
  faces: Record<string, MetricsFace>;
}

const METRICS = metricsRaw as unknown as MetricsPayload;

const DEFINITIONS: Omit<FontFamily, 'faces'>[] = [
  {
    id: 'baloo2',
    label: 'Baloo 2',
    cssFamily: 'Baloo 2',
    category: 'display',
    note: 'Rounded, friendly headline face with Devanagari coverage in the same design.',
    moods: ['playful', 'warm', 'childlike', 'bilingual'],
    scripts: ['latin', 'devanagari'],
    designer: 'Ek Type',
    licence: 'OFL-1.1',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    cssFamily: 'Playfair Display',
    category: 'serif',
    note: 'High-contrast editorial serif — the royal, formal voice of the studio.',
    moods: ['royal', 'editorial', 'elegant', 'formal'],
    scripts: ['latin'],
    designer: 'Claus Eggers Sørensen',
    licence: 'OFL-1.1',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    cssFamily: 'Poppins',
    category: 'sans',
    note: 'Geometric sans with an even rhythm — clean for ages and subtitles.',
    moods: ['modern', 'geometric', 'unisex', 'clean'],
    scripts: ['latin'],
    designer: 'Indian Type Foundry',
    licence: 'OFL-1.1',
  },
  {
    id: 'quicksand',
    label: 'Quicksand',
    cssFamily: 'Quicksand',
    category: 'sans',
    note: 'Soft rounded terminals; reads as nursery-soft without being childish.',
    moods: ['soft', 'pastel', 'gentle', 'baby'],
    scripts: ['latin'],
    designer: 'Andrew Paglinawan',
    licence: 'OFL-1.1',
  },
  {
    id: 'great-vibes',
    label: 'Great Vibes',
    cssFamily: 'Great Vibes',
    category: 'script',
    note: 'Formal script with long swashes — use for short names only, never body text.',
    moods: ['romantic', 'luxury', 'swash', 'formal'],
    scripts: ['latin'],
    designer: 'TypeSETit',
    licence: 'OFL-1.1',
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    cssFamily: 'Bebas Neue',
    category: 'condensed',
    note: 'Tall condensed capitals — racing, sport and hero templates.',
    moods: ['sport', 'bold', 'impact', 'condensed'],
    scripts: ['latin'],
    designer: 'Ryoichi Tsunekawa',
    licence: 'OFL-1.1',
  },
  {
    id: 'noto-sans-devanagari',
    label: 'Noto Sans Devanagari',
    cssFamily: 'Noto Sans Devanagari',
    category: 'sans',
    note: 'Neutral Devanagari workhorse; the automatic fallback for Marathi and Hindi names.',
    moods: ['neutral', 'readable', 'devanagari', 'body'],
    scripts: ['devanagari', 'latin'],
    designer: 'Google Noto Project',
    licence: 'OFL-1.1',
  },
];

const FACE_FILES: Record<string, number[]> = {
  baloo2: [400, 600, 800],
  'playfair-display': [400, 700, 900],
  poppins: [300, 500, 700],
  quicksand: [400, 600],
  'great-vibes': [400],
  'bebas-neue': [400],
  'noto-sans-devanagari': [400, 700],
};

function buildFamilies(): FontFamily[] {
  return DEFINITIONS.map((def) => {
    const faces: FontFace[] = (FACE_FILES[def.id] ?? []).map((weight) => {
      const metricsFace = METRICS.faces[`${def.id}-${weight}`];
      if (!metricsFace) {
        throw new Error(
          `cake-atelier: metrics missing for ${def.id}-${weight}. Run \`npm run fonts:metrics\` in packages/cake-atelier.`,
        );
      }
      return {
        id: `${def.id}-${weight}`,
        family: def.id,
        weight,
        file: metricsFace.file,
        publicPath: `/cake-fonts/${metricsFace.file.replace(/^fonts\//, '')}`,
        unitsPerEm: metricsFace.unitsPerEm,
        ascent: metricsFace.ascent,
        descent: metricsFace.descent,
        lineGap: metricsFace.lineGap,
        capHeight: metricsFace.capHeight,
        xHeight: metricsFace.xHeight,
      };
    });
    return { ...def, faces };
  });
}

export const FONT_FAMILIES: FontFamily[] = buildFamilies();

export const FONT_FAMILY_IDS = FONT_FAMILIES.map((f) => f.id);

const FAMILY_INDEX = new Map(FONT_FAMILIES.map((f) => [f.id, f]));
const FACE_INDEX = new Map<string, FontFace>();
const ADVANCE_INDEX = new Map<string, Map<number, number>>();
for (const family of FONT_FAMILIES) {
  for (const face of family.faces) {
    FACE_INDEX.set(face.id, face);
    const metricsFace = METRICS.faces[face.id];
    if (metricsFace) {
      ADVANCE_INDEX.set(face.id, new Map(metricsFace.advances));
    }
  }
}

export function isFontFamilyId(value: unknown): value is FontFamilyId {
  return typeof value === 'string' && FAMILY_INDEX.has(value as FontFamilyId);
}

export function getFontFamily(id: string): FontFamily {
  const family = FAMILY_INDEX.get(id as FontFamilyId);
  if (!family) {
    throw new Error(`cake-atelier: unknown font family "${id}"`);
  }
  return family;
}

export function findFontFamily(id: string): FontFamily | undefined {
  return FAMILY_INDEX.get(id as FontFamilyId);
}

export function getFontFace(id: string): FontFace | undefined {
  return FACE_INDEX.get(id);
}

/**
 * The family a face belongs to, by longest-prefix match. Face ids are
 * `<family>-<weight>`, and family ids themselves contain hyphens
 * (`playfair-display-700`), so splitting on the first hyphen is wrong.
 */
export function familyForFace(faceId: string): FontFamily | undefined {
  const direct = FACE_INDEX.get(faceId);
  if (direct) return FAMILY_INDEX.get(direct.family as FontFamilyId);
  let best: FontFamily | undefined;
  for (const family of FONT_FAMILIES) {
    if (faceId === family.id || faceId.startsWith(`${family.id}-`)) {
      if (!best || family.id.length > best.id.length) best = family;
    }
  }
  return best;
}

/**
 * Nearest available weight for a family. A template that allows weight 500 on a
 * family that ships 400/600 resolves to 600 — never to a synthetic bold.
 */
export function resolveFace(familyId: string, weight: number): FontFace {
  const family = getFontFamily(familyId);
  let best = family.faces[0]!;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const face of family.faces) {
    const delta = Math.abs(face.weight - weight);
    if (delta < bestDelta || (delta === bestDelta && face.weight > best.weight)) {
      best = face;
      bestDelta = delta;
    }
  }
  return best;
}

/** Glyph coverage check — used before promising a character will render. */
export function hasGlyph(faceId: string, codePoint: number): boolean {
  const table = ADVANCE_INDEX.get(faceId);
  if (!table) return false;
  return table.has(codePoint);
}

export function advanceWidthEm(faceId: string, codePoint: number): number | undefined {
  const table = ADVANCE_INDEX.get(faceId);
  const value = table?.get(codePoint);
  return value === undefined ? undefined : value / 1000;
}

export function faceSupportsScript(faceId: string, script: ScriptSupport): boolean {
  const face = FACE_INDEX.get(faceId);
  if (!face) return false;
  return getFontFamily(face.family).scripts.includes(script);
}

export interface ScriptAnalysis {
  hasDevanagari: boolean;
  hasLatin: boolean;
  unsupported: { char: string; codePoint: number }[];
}

const DEVANAGARI_RANGE = /[\u0900-\u097f\u1cd0-\u1cff\u200c\u200d]/;
const LATIN_RANGE = /[A-Za-z\u00c0-\u024f]/;

/**
 * Which scripts a string uses, and which characters the face cannot draw.
 * ZWJ/ZWNJ are treated as harmless controls, not missing glyphs.
 */
export function analyseScript(text: string, faceId: string): ScriptAnalysis {
  const unsupported: { char: string; codePoint: number }[] = [];
  let hasDevanagari = false;
  let hasLatin = false;
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    if (DEVANAGARI_RANGE.test(char)) hasDevanagari = true;
    else if (LATIN_RANGE.test(char)) hasLatin = true;
    if (cp === 0x200c || cp === 0x200d) continue;
    if (char === ' ') continue;
    if (!hasGlyph(faceId, cp)) unsupported.push({ char, codePoint: cp });
  }
  return { hasDevanagari, hasLatin, unsupported };
}

/**
 * Pick the family that can actually draw the text. A Latin-only display face
 * asked to set a Marathi name silently degrades into tofu, so we substitute a
 * Devanagari face and report the substitution to the caller.
 */
export function resolveFamilyForText(
  familyId: string,
  text: string,
): { familyId: FontFamilyId; substituted: boolean; reason?: string } {
  const family = findFontFamily(familyId);
  if (!family) {
    return { familyId: 'poppins', substituted: true, reason: `Unknown font "${familyId}"` };
  }
  const probe = family.faces[family.faces.length - 1] ?? family.faces[0]!;
  const analysis = analyseScript(text, probe.id);
  if (analysis.hasDevanagari && !family.scripts.includes('devanagari')) {
    const fallback: FontFamilyId =
      family.category === 'script' || family.category === 'serif' ? 'baloo2' : 'noto-sans-devanagari';
    return {
      familyId: fallback,
      substituted: true,
      reason: `${family.label} has no Devanagari coverage; ${getFontFamily(fallback).label} used for this text.`,
    };
  }
  return { familyId: family.id, substituted: false };
}

export function fontMetricsVersion(): number {
  return METRICS.version;
}

export function fontFaceCount(): number {
  return FACE_INDEX.size;
}
