/**
 * @mazi/cake-atelier — palettes
 *
 * Twelve curated palettes, each defined with the *same semantic token names*.
 * A template paints with tokens (`primary`, `accent`, `nameFill`, `cutline`…),
 * never with literal colours, which is why switching palette can never re-lay
 * out a design: only the ink changes.
 *
 * Tokens a printer cares about (`cutline`) are part of the palette, because the
 * cut line must stay visible against that palette's paper when a layperson
 * prints a proof.
 */

import type { Point } from './geometry.js';
import type { GradientStop } from './scene.js';

export interface PaletteTokens {
  /** Main paper colour of the piece. */
  primary: string;
  /** Secondary paper — banners, plates, trims. */
  secondary: string;
  /** Highlight paper — small accents, flowers, stars. */
  accent: string;
  /** Deep shade of primary for folds, outlines and shadowed layers. */
  primaryDeep: string;
  /** Deep shade of secondary. */
  secondaryDeep: string;

  /** Printed background wash (behind the layered pieces). */
  background: string;
  backgroundAlt: string;

  /** Ink used for the child's name. */
  nameFill: string;
  /** Ink for the headline / greeting. */
  titleFill: string;
  /** Ink for smaller supporting lines. */
  subtitleFill: string;
  /** Ink used inside badges, ribbons and plaques. */
  plaqueInk: string;
  /** Paper used for the nameplate / plaque behind the name. */
  plaquePaper: string;
  /** Edge colour of the plaque. */
  plaqueEdge: string;

  /** Hairline outline that separates layers of the same paper colour. */
  outline: string;
  /** Simulated drop shadow — printed, never a real shadow. */
  shadow: string;
  /** Cut-line colour for cut previews and layered cut files. */
  cutline: string;

  /** Metallics. `foil` is a two-stop simulated gradient — see FOIL_NOTICE. */
  foil: string;
  foilShade: string;
  /** True when `foil`/`foilShade` are meant to read as metal. */
  metallic: boolean;
  /** Optional override for which simulated metal a palette implies. */
  foilKind?: 'gold' | 'rose-gold' | 'silver' | 'bronze';

  /** Illustration helpers (fur, skin, foliage, sky, water…). */
  ink: string;
  soft: string;
  accentSoft: string;
  highlight: string;

  /** Paper surfaces — lifted plates, banners, badges. */
  surface: string;
  surfaceAlt: string;
  /** Tints of the main paper used for layered depth (light → deep). */
  primarySoft: string;
  secondarySoft: string;
  accentDeep: string;
  backgroundDeep: string;
  /** Botanical ink for leaves, vines and meadow scenes. */
  foliage: string;
  foliageDeep: string;
  /** Muted ink for secondary supporting lines. */
  inkSoft: string;
  /** The plate that carries the name, and its edge. */
  nameplate: string;
  nameplateEdge: string;
  nameplateInk: string;
}

export const PALETTE_TOKEN_KEYS: (keyof PaletteTokens)[] = [
  'primary',
  'secondary',
  'accent',
  'primaryDeep',
  'secondaryDeep',
  'background',
  'backgroundAlt',
  'nameFill',
  'titleFill',
  'subtitleFill',
  'plaqueInk',
  'plaquePaper',
  'plaqueEdge',
  'outline',
  'shadow',
  'cutline',
  'foil',
  'foilShade',
  'ink',
  'soft',
  'accentSoft',
  'highlight',
];

export interface Palette {
  id: string;
  name: string;
  /** Short description shown in the library. */
  blurb: string;
  /** Free-text grouping for filtering. */
  mood: 'classic' | 'pastel' | 'bright' | 'earthy' | 'editorial' | 'festive';
  tokens: PaletteTokens;
}

export const SIMULATED_FOIL_NOTICE =
  'Metallic tokens are a simulated gold/silver gradient rendered in RGB — they look like foil on screen and on an inkjet print, but they are not physical metal. Real foil needs a foil stamp or a metallic spot colour at your printer. The layered export includes a separate foil layer for exactly that hand-off.';

function tokens(partial: Partial<PaletteTokens> & Pick<PaletteTokens, 'primary' | 'secondary' | 'accent' | 'background' | 'nameFill' | 'titleFill' | 'outline' | 'shadow' | 'cutline'>): PaletteTokens {
  const base: PaletteTokens = {
    primary: partial.primary,
    secondary: partial.secondary,
    accent: partial.accent,
    primaryDeep: shade(partial.primary, -0.28),
    secondaryDeep: shade(partial.secondary, -0.24),
    background: partial.background,
    backgroundAlt: tint(partial.background, 0.5),
    nameFill: partial.nameFill,
    titleFill: partial.titleFill,
    subtitleFill: partial.subtitleFill ?? partial.titleFill,
    plaqueInk: partial.plaqueInk ?? partial.nameFill,
    plaquePaper: partial.plaquePaper ?? partial.secondary,
    plaqueEdge: partial.plaqueEdge ?? partial.accent,
    outline: partial.outline,
    shadow: partial.shadow,
    cutline: partial.cutline,
    foil: partial.foil ?? '#c9a227',
    foilShade: partial.foilShade ?? '#8a6a1f',
    metallic: partial.metallic ?? Boolean(partial.foil),
    ink: partial.ink ?? '#241c18',
    soft: partial.soft ?? tint(partial.primary, 0.55),
    accentSoft: partial.accentSoft ?? tint(partial.accent, 0.45),
    highlight: partial.highlight ?? '#ffffff',
    surface: partial.surface ?? partial.secondary ?? '#ffffff',
    surfaceAlt: partial.surfaceAlt ?? tint(partial.secondary ?? '#ffffff', 0.4),
    primarySoft: partial.primarySoft ?? tint(partial.primary, 0.5),
    secondarySoft: partial.secondarySoft ?? tint(partial.secondary, 0.35),
    accentDeep: partial.accentDeep ?? shade(partial.accent, -0.3),
    backgroundDeep: partial.backgroundDeep ?? shade(partial.background, -0.18),
    foliage: partial.foliage ?? partial.accent ?? '#6f8f6a',
    inkSoft: partial.inkSoft ?? shade(partial.ink ?? '#241c18', 0.35),
    foliageDeep: partial.foliageDeep ?? shade(partial.foliage ?? partial.accent ?? '#6f8f6a', -0.28),
    nameplate: partial.nameplate ?? partial.plaquePaper ?? partial.secondary,
    nameplateEdge: partial.nameplateEdge ?? partial.plaqueEdge ?? partial.accent,
    nameplateInk: partial.nameplateInk ?? partial.plaqueInk ?? partial.nameFill,
    foilKind: partial.foilKind,
  };
  return base;
}

export const PALETTES: Palette[] = [
  {
    id: 'royal-blue-gold',
    name: 'Royal Blue & Gold',
    blurb: 'Regal navy with gilded accents — the classic prince palette.',
    mood: 'classic',
    tokens: tokens({
      primary: '#1c3a72',
      secondary: '#f6efe1',
      accent: '#d4af37',
      background: '#f4f7fd',
      nameFill: '#12274e',
      titleFill: '#8a6a1f',
      subtitleFill: '#3d5a8f',
      cutline: '#d92b6b',
      outline: '#12274e',
      shadow: 'rgba(18, 39, 78, 0.18)',
      foil: '#e3c469',
      foilShade: '#8a6a1f',
      soft: '#b9c9e6',
      accentSoft: '#f0dfa8',
      highlight: '#fffdf5',
    }),
  },
  {
    id: 'blush-rose-gold',
    name: 'Blush & Rose Gold',
    blurb: 'Warm blush paper with simulated rose-gold metal — soft and modern.',
    mood: 'pastel',
    tokens: tokens({
      primary: '#f0c9c4',
      secondary: '#fff6f1',
      accent: '#c98a72',
      background: '#fdf6f2',
      nameFill: '#8d5b4c',
      titleFill: '#b07a63',
      subtitleFill: '#a6807a',
      cutline: '#c2185b',
      outline: '#8d5b4c',
      shadow: 'rgba(141, 91, 76, 0.16)',
      foil: '#e6b6a0',
      foilShade: '#a9714f',
      soft: '#f8e3de',
      accentSoft: '#e7cdbd',
      highlight: '#fffdfb',
    }),
  },
  {
    id: 'sage-eucalyptus',
    name: 'Sage & Eucalyptus',
    blurb: 'Calm green-grey botanicals — refined and gender-neutral.',
    mood: 'earthy',
    tokens: tokens({
      primary: '#8aa88f',
      secondary: '#f2f5ee',
      accent: '#5f7d63',
      background: '#f8faf5',
      nameFill: '#3f5a45',
      titleFill: '#5f7d63',
      subtitleFill: '#6d8071',
      cutline: '#d81b60',
      outline: '#3f5a45',
      shadow: 'rgba(63, 90, 69, 0.16)',
      soft: '#dfe9dd',
      accentSoft: '#cfe0cd',
      highlight: '#ffffff',
    }),
  },
  {
    id: 'peach-cream',
    name: 'Peach & Cream',
    blurb: 'Soft peach and vanilla — first birthdays and naming days.',
    mood: 'pastel',
    tokens: tokens({
      primary: '#f6c7a6',
      secondary: '#fffaf3',
      accent: '#e58f6a',
      background: '#fffaf4',
      nameFill: '#a5583a',
      titleFill: '#c9764f',
      subtitleFill: '#b98a72',
      cutline: '#c2185b',
      outline: '#a5583a',
      shadow: 'rgba(165, 88, 58, 0.16)',
      soft: '#fbe4d2',
      accentSoft: '#f7d7c0',
      highlight: '#fffefb',
    }),
  },
  {
    id: 'mint-candy',
    name: 'Mint Candy',
    blurb: 'Cool mint with candy pink — playful but tidy.',
    mood: 'bright',
    tokens: tokens({
      primary: '#9fe0d0',
      secondary: '#f4fffb',
      accent: '#f59ab5',
      background: '#f4fffb',
      nameFill: '#1f6f63',
      titleFill: '#d5517c',
      subtitleFill: '#4c8d84',
      cutline: '#c2185b',
      outline: '#1f6f63',
      shadow: 'rgba(31, 111, 99, 0.16)',
      soft: '#d8f5ef',
      accentSoft: '#fbcfdd',
      highlight: '#ffffff',
    }),
  },
  {
    id: 'lavender-silver',
    name: 'Lavender & Silver',
    blurb: 'Dusty lavender with simulated silver — gentle and dreamy.',
    mood: 'pastel',
    tokens: tokens({
      primary: '#c8b6e2',
      secondary: '#fbf9ff',
      accent: '#9a86bb',
      background: '#f9f7ff',
      nameFill: '#5b4a7a',
      titleFill: '#7a68a0',
      subtitleFill: '#8a7da6',
      cutline: '#c2185b',
      outline: '#5b4a7a',
      shadow: 'rgba(91, 74, 122, 0.16)',
      foil: '#d7d7e2',
      foilShade: '#8e8ea4',
      soft: '#eee7f8',
      accentSoft: '#e2d9f2',
      highlight: '#ffffff',
    }),
  },
  {
    id: 'sunshine-sky',
    name: 'Sunshine & Sky',
    blurb: 'Warm yellow over sky blue — outdoorsy and cheerful.',
    mood: 'bright',
    tokens: tokens({
      primary: '#7ec4e8',
      secondary: '#fff8e3',
      accent: '#f3b830',
      background: '#f2faff',
      nameFill: '#1d5a80',
      titleFill: '#b57c0c',
      subtitleFill: '#3d7ea6',
      cutline: '#e5007d',
      outline: '#1d5a80',
      shadow: 'rgba(29, 90, 128, 0.16)',
      soft: '#cfe9f7',
      accentSoft: '#fbe3a8',
      highlight: '#ffffff',
    }),
  },
  {
    id: 'sunset-terracotta',
    name: 'Terracotta Sunset',
    blurb: 'Burnt orange and clay — a warm, grown-up festive palette.',
    mood: 'earthy',
    tokens: tokens({
      primary: '#d0704a',
      secondary: '#fbeee2',
      accent: '#6f8f6a',
      background: '#fdf5ee',
      nameFill: '#7c3a20',
      titleFill: '#a9542f',
      subtitleFill: '#8c6551',
      cutline: '#e5007d',
      outline: '#7c3a20',
      shadow: 'rgba(124, 58, 32, 0.18)',
      soft: '#f5d9c6',
      accentSoft: '#d8e3cf',
      highlight: '#fffbf6',
    }),
  },
  {
    id: 'midnight-gold',
    name: 'Midnight & Gold',
    blurb: 'Near-black paper with gold ink — the most premium setting.',
    mood: 'classic',
    tokens: tokens({
      primary: '#1e2233',
      secondary: '#f4ecd8',
      accent: '#d9b45b',
      background: '#232838',
      nameFill: '#f6eed9',
      titleFill: '#d9b45b',
      subtitleFill: '#cbbf9f',
      cutline: '#ff5d9e',
      outline: '#0d0f18',
      shadow: 'rgba(0, 0, 0, 0.4)',
      foil: '#e8cd7f',
      foilShade: '#8f6f22',
      soft: '#3a4157',
      accentSoft: '#4a4536',
      highlight: '#fff8e6',
      ink: '#0d0f18',
    }),
  },
  {
    id: 'monochrome-ink',
    name: 'Monochrome Ink',
    blurb: 'Black, white and paper texture — editorial and timeless.',
    mood: 'editorial',
    tokens: tokens({
      primary: '#2b2b2b',
      secondary: '#ffffff',
      accent: '#8c8c8c',
      background: '#fafafa',
      nameFill: '#111111',
      titleFill: '#444444',
      subtitleFill: '#6b6b6b',
      cutline: '#d50000',
      outline: '#111111',
      shadow: 'rgba(17, 17, 17, 0.14)',
      soft: '#e6e6e6',
      accentSoft: '#dcdcdc',
      highlight: '#ffffff',
    }),
  },
  {
    id: 'jungle-leaf',
    name: 'Jungle Leaf',
    blurb: 'Deep greens with warm sand — safari, farm and adventure designs.',
    mood: 'earthy',
    tokens: tokens({
      primary: '#3f7d5a',
      secondary: '#f6efdc',
      accent: '#d98d3a',
      background: '#f4f7ec',
      nameFill: '#24462f',
      titleFill: '#b4722a',
      subtitleFill: '#4f6a52',
      cutline: '#e5007d',
      outline: '#24462f',
      shadow: 'rgba(36, 70, 47, 0.18)',
      soft: '#cfe0c4',
      accentSoft: '#f0d9b0',
      highlight: '#fffdf6',
    }),
  },
  {
    id: 'rainbow-pop',
    name: 'Rainbow Pop',
    blurb: 'High-energy primaries for superhero and party toppers.',
    mood: 'festive',
    tokens: tokens({
      primary: '#2f6fd0',
      secondary: '#fff6da',
      accent: '#ef4b4b',
      background: '#fffdf5',
      nameFill: '#1b2a4a',
      titleFill: '#d93b3b',
      subtitleFill: '#3d5f9e',
      cutline: '#e5007d',
      outline: '#1b2a4a',
      shadow: 'rgba(27, 42, 74, 0.2)',
      soft: '#bcd7f7',
      accentSoft: '#ffcf8a',
      highlight: '#ffffff',
    }),
  },
];

export const PALETTE_IDS = PALETTES.map((palette) => palette.id);

/** Palette ids are just strings, but the alias documents intent at call sites. */
export type PaletteId = string;
export const DEFAULT_PALETTE_ID = 'royal-blue-gold';

const PALETTE_INDEX = new Map(PALETTES.map((palette) => [palette.id, palette]));

export function getPalette(id: string): Palette | undefined {
  return PALETTE_INDEX.get(id);
}

export function isPaletteId(id: string): boolean {
  return PALETTE_INDEX.has(id);
}

export function requirePalette(id: string): Palette {
  const palette = PALETTE_INDEX.get(id);
  if (!palette) throw new Error(`cake-atelier: unknown palette "${id}"`);
  return palette;
}

/** Tokens a user may override from the studio without breaking the fixed composition. */
export const OVERRIDABLE_TOKENS: (keyof PaletteTokens)[] = [
  'primary',
  'secondary',
  'accent',
  'background',
  'backgroundAlt',
  'nameFill',
  'titleFill',
  'subtitleFill',
  'plaquePaper',
  'plaqueInk',
  'plaqueEdge',
  'outline',
  'shadow',
  'cutline',
  'foil',
  'foilShade',
  'soft',
  'accentSoft',
  'highlight',
  'ink',
  'inkSoft',
];

export type TokenOverrides = Partial<Record<keyof PaletteTokens, string>>;

/**
 * Palettes that are genuinely metallic and palettes that would *look* wrong if
 * a template insisted on its own metal. Templates publish a compatibility list;
 * this is the default allow-list used by the studio.
 */
export function resolveTokens(
  paletteId: string,
  templateOverrides: Partial<Record<string, TokenOverrides>> = {},
  userOverrides: TokenOverrides = {},
): PaletteTokens {
  const palette = getPalette(paletteId) ?? PALETTES[0]!;
  const overrideTokens: TokenOverrides = { ...(templateOverrides[paletteId] ?? {}), ...userOverrides };
  const resolved: PaletteTokens = { ...palette.tokens };
  const mutable = resolved as unknown as Record<string, string>;
  for (const key of OVERRIDABLE_TOKENS) {
    const value = overrideTokens[key];
    if (value && isHexColor(value)) mutable[key] = value;
  }
  return resolved;
}

/** Compatibility report for the studio: does this palette suit this template? */
export interface PaletteCompatibility {
  paletteId: string;
  ok: boolean;
  reason?: string;
}

export function checkPaletteForTemplate(
  paletteId: string,
  preferred: string[],
  options: { allowAny?: boolean } = {},
): PaletteCompatibility {
  if (!isPaletteId(paletteId)) return { paletteId, ok: false, reason: 'Unknown palette id.' };
  if (options.allowAny || preferred.length === 0 || preferred.includes(paletteId)) return { paletteId, ok: true };
  const palette = requirePalette(paletteId);
  return {
    paletteId,
    ok: true,
    reason: `Not in the ${preferred.length} curated combinations for this template. It will still render correctly — the palette is compatible, just not hand-tuned.`,
  };
}

/* ------------------------------------------------------------------ */
/* Colour maths                                                        */
/* ------------------------------------------------------------------ */

export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.trim().replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clampByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[r, g, b].map((value) => clampByte(value).toString(16).padStart(2, '0')).join('')}`;
}

function parseColor(value: string): { r: number; g: number; b: number } | undefined {
  if (isHexColor(value)) return hexToRgb(value);
  const match = /rgba?\(([^)]+)\)/i.exec(value);
  if (match?.[1]) {
    const [r, g, b] = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
    if (r !== undefined && g !== undefined && b !== undefined) return { r, g, b };
  }
  return undefined;
}

/** Darken (negative) or lighten (positive) by a fraction of the remaining range. */
export function shade(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const mixTo = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return rgbToHex(rgb.r + (mixTo - rgb.r) * t, rgb.g + (mixTo - rgb.g) * t, rgb.b + (mixTo - rgb.b) * t);
}

export function tint(color: string, amount: number): string {
  return shade(color, amount);
}

export function mixColors(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  return rgbToHex(ca.r + (cb.r - ca.r) * t, ca.g + (cb.g - ca.g) * t, ca.b + (cb.b - ca.b) * t);
}

/** Shorter alias used by the art library. */
export const mix = mixColors;

/** Simulated-foil gradient bound to a palette (old signature, kept for art modules). */
export function foilGradient(palette: PaletteTokens, from: Point, to: Point): FoilGradient {
  return goldGradient(from, to, palette);
}

export function luminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0.5;
  const channel = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Readable ink for a given paper — used when a user picks an odd combination. */
export function readableInk(background: string): string {
  return luminance(background) > 0.55 ? '#1b1a19' : '#fdfcf8';
}

/* ------------------------------------------------------------------ */
/* Simulated metallics                                                 */
/* ------------------------------------------------------------------ */

export interface FoilGradient {
  type: 'linear';
  from: Point;
  to: Point;
  stops: GradientStop[];
}

/** Simulated gold gradient used on crowns, crests and foil swashes. */
export function goldGradient(from: Point, to: Point, palette: PaletteTokens): FoilGradient {
  const base = palette.foil;
  const deep = palette.foilShade;
  return {
    type: 'linear',
    from,
    to,
    stops: [
      { offset: 0, color: deep },
      { offset: 0.28, color: base },
      { offset: 0.48, color: shade(base, 0.42) },
      { offset: 0.62, color: base },
      { offset: 1, color: deep },
    ],
  };
}

/** Simulated silver gradient (used by Lavender & Silver and Midnight & Gold). */
export function silverGradient(from: Point, to: Point): FoilGradient {
  return {
    type: 'linear',
    from,
    to,
    stops: [
      { offset: 0, color: '#8f9299' },
      { offset: 0.3, color: '#d8dbe0' },
      { offset: 0.5, color: '#ffffff' },
      { offset: 0.72, color: '#c9ccd2' },
      { offset: 1, color: '#7f8289' },
    ],
  };
}

/**
 * Flat-ink approximation of a metallic token. Used by the "flat ink" preview,
 * the cut-line layer and any press that cannot print a gradient — it is the
 * honest fallback rather than pretending a gradient printed as metal.
 */
export function foilFlat(palette: PaletteTokens): string {
  return palette.foil;
}

export function metallicLabel(palette: PaletteTokens): string {
  return palette.metallic ? 'Simulated metal gradient (RGB print approximation — not real foil)' : 'Flat ink';
}

/** Is the given token a metallic one in this palette? */
export function isMetallicToken(palette: PaletteTokens, token: keyof PaletteTokens): boolean {
  return palette.metallic && (token === 'foil' || token === 'foilShade');
}
