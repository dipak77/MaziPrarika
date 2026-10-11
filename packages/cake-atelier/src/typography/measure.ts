/**
 * @mazi/cake-atelier — text measurement, wrapping and auto-fit
 *
 * The personalisation engine from the brief: measure with the *actual* font,
 * shrink only within the template's allowed range, adjust letter spacing inside
 * sane bounds, never truncate, never let a name collide with the artwork.
 *
 * Two measurement backends feed the same algorithm:
 *
 *   • `metricsMeasure`  — per-codepoint advances from the bundled TTFs. Pure,
 *                         deterministic, runs on the server and in tests.
 *   • `canvasMeasure`   — `CanvasRenderingContext2D.measureText`, i.e. the
 *                         browser's own (HarfBuzz) shaper; used in the studio so
 *                         the preview measures Devanagari exactly.
 *
 * Both are wrapped in `withSlack()`: complex scripts form ligatures and
 * reordered clusters, so a conservative over-estimate is the safe direction to
 * be wrong in — text shrinks slightly rather than clipping.
 */

import { ptToMm, round } from '../geometry.js';
import { advanceWidthEm, analyseScript, resolveFace, resolveFamilyForText } from './fonts.js';

export type TextAnchor = 'start' | 'middle' | 'end';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface TextRegionSpec {
  /** Anchor box in scene millimetres — the *safe area* for this text. */
  x: number;
  y: number;
  width: number;
  height: number;
  anchor: TextAnchor;
  verticalAlign: VerticalAlign;
  /** Sizes in points (1 pt = 0.3528 mm); the fit engine converts to mm. */
  maxSizePt: number;
  minSizePt: number;
  maxLines: number;
  /** Multiple of the font size. */
  lineHeight: number;
  /** Letter-spacing bounds in em units. */
  letterSpacing?: { min: number; max: number; default: number };
  /** Allow breaking inside a long single word (hyphen-free, cluster-safe). */
  breakWords?: boolean;
  /** Approved families; the first is the default. */
  families: string[];
  /** Approved weights (resolved to the nearest shipped face). */
  weights: number[];
  /** Visual transform applied before measuring. */
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface TextStyleRequest {
  familyId: string;
  weight: number;
  /** Requested size in points, before fitting. */
  sizePt: number;
  letterSpacingEm?: number;
  lineHeight?: number;
  anchor?: TextAnchor;
  verticalAlign?: VerticalAlign;
}

export interface MeasureRequest {
  text: string;
  /** Face id, e.g. `baloo2-600`. */
  faceId: string;
  /** Font size in millimetres. */
  sizeMm: number;
  /** Letter spacing in millimetres. */
  letterSpacingMm?: number;
}

export type MeasureText = (request: MeasureRequest) => number;

export interface TextLine {
  text: string;
  /** Width in millimetres including trailing letter-spacing. */
  width: number;
  x: number;
  y: number;
}

export type FitStatus =
  | 'fits'
  | 'shrunk'
  | 'clamped-min-size'
  | 'needs-extra-line'
  | 'unsupported-characters'
  | 'substituted-font'
  | 'empty';

export interface TextFitResult {
  /** The (possibly substituted) family actually used. */
  familyId: string;
  requestedFamilyId: string;
  faceId: string;
  weight: number;
  /** Final size in millimetres and points. */
  sizeMm: number;
  sizePt: number;
  requestedSizePt: number;
  letterSpacingMm: number;
  letterSpacingEm: number;
  lineHeight: number;
  lines: TextLine[];
  /** Anchor the lines were positioned against (for outline generation). */
  anchor: TextAnchor;
  /** Bounding box of the laid-out block, millimetres. */
  blockWidth: number;
  blockHeight: number;
  status: FitStatus;
  warnings: string[];
  /** True when the text could not be made to fit inside the region. */
  overflow: boolean;
}

/* ------------------------------------------------------------------ */
/* Measuring                                                           */
/* ------------------------------------------------------------------ */

/** Pure metrics-based measurement — deterministic, no DOM. */
export const metricsMeasure: MeasureText = ({ text, faceId, sizeMm, letterSpacingMm = 0 }) => {
  let em = 0;
  let glyphs = 0;
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    const advance = advanceWidthEm(faceId, cp);
    // Missing glyph ⇒ fall back to a neutral 0.55em so the estimate stays wide.
    em += advance ?? 0.55;
    glyphs += 1;
  }
  return em * sizeMm + glyphs * letterSpacingMm;
};

/**
 * Wrap an arbitrary measure function with a script-aware safety factor.
 * Devanagari clusters reorder and ligate: sums of per-codepoint advances run
 * slightly narrow for matra-heavy syllables, so they get extra slack.
 */
export function withSlack(measure: MeasureText, slack = 1.02): MeasureText {
  return (request) => measure(request) * slack;
}

/** Adds a conservative bias on complex scripts only. */
export const conservativeMeasure: MeasureText = (request) => {
  const base = metricsMeasure(request);
  const devanagari = /[\u0900-\u097f\u1cd0-\u1cff]/.test(request.text);
  return base * (devanagari ? 1.06 : 1.02);
};

export interface CanvasMeasureOptions {
  /** Resolves a CSS font-family string for a face id. */
  cssFor: (faceId: string) => string;
  /** Canvas factory — the studio window in the browser. */
  context?: CanvasRenderingContext2D | null;
}

/**
 * Browser measurement via canvas. `ctx.font` uses the same OpenType tables and
 * the same shaper as the `<text>` elements the preview draws, so what the user
 * sees is what the fit engine assumed.
 */
export function createCanvasMeasure(options: CanvasMeasureOptions): MeasureText {
  const cache = new Map<string, number>();
  return ({ text, faceId, sizeMm, letterSpacingMm = 0 }) => {
    const ctx = options.context;
    if (!ctx) return conservativeMeasure({ text, faceId, sizeMm, letterSpacingMm });
    const key = `${faceId}|${round(sizeMm, 3)}|${round(letterSpacingMm, 3)}|${text}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    ctx.font = `100px ${options.cssFor(faceId)}`;
    const perChar = ctx.measureText(text).width / 100;
    const glyphs = [...text].length;
    const value = perChar * sizeMm + glyphs * letterSpacingMm;
    if (cache.size > 4000) cache.clear();
    cache.set(key, value);
    return value;
  };
}

/* ------------------------------------------------------------------ */
/* Script-aware segmentation                                           */
/* ------------------------------------------------------------------ */

const DEVANAGARI = /[\u0900-\u097f]/;
const DEVANAGARI_MARK = /[\u0900-\u0903\u093a-\u094f\u0951-\u0957\u0962\u0963\u1cd0-\u1cff\u200c\u200d]/;
const DEVANAGARI_VIRAMA = '\u094d';

/**
 * Split into clusters that must never be broken by a line wrap: a base
 * character plus its marks, and consonant + virama + consonant sequences.
 */
export function segmentClusters(text: string): string[] {
  const clusters: string[] = [];
  let current = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i]!;
    const isMark = DEVANAGARI_MARK.test(char);
    const prev = chars[i - 1];
    const joinsPrevious = isMark && !(prev === undefined);
    const viramaChain = prev === DEVANAGARI_VIRAMA && DEVANAGARI.test(char);
    if (current === '' || (!joinsPrevious && !viramaChain)) {
      if (current) clusters.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current) clusters.push(current);
  return clusters;
}

/** Break a long single word into cluster-safe chunks that fit `maxWidth`. */
function breakWord(clusters: string[], measure: (s: string) => number, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const cluster of clusters) {
    const candidate = current + cluster;
    if (current && measure(candidate) > maxWidth) {
      parts.push(current);
      current = cluster;
    } else {
      current = candidate;
    }
  }
  if (current) parts.push(current);
  return parts.length ? parts : [''];
}

interface WrapOptions {
  measure: (s: string) => number;
  maxWidth: number;
  maxLines: number;
  breakWords: boolean;
}

export interface WrapResult {
  lines: string[];
  /** True when wrapping alone could not honour `maxLines`. */
  overflow: boolean;
  /** True when a single cluster is wider than the region. */
  unbreakable: boolean;
}

/** Greedy, cluster-aware wrap. Words first, then cluster-safe breaking. */
export function wrapClusters(text: string, options: WrapOptions): WrapResult {
  const words = text.split(/(\s+)/).filter((part) => part.length > 0);
  const lines: string[] = [];
  let current = '';
  let unbreakable = false;

  const flush = () => {
    if (current.trim().length) lines.push(current.trim());
    current = '';
  };

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      if (current) current += ' ';
      continue;
    }
    const candidate = current ? `${current}${word}` : word;
    if (options.measure(candidate.trim()) <= options.maxWidth || !current) {
      if (options.measure(word) > options.maxWidth) {
        if (options.breakWords) {
          const chunks = breakWord(segmentClusters(word), (s) => options.measure(s), options.maxWidth);
          if (chunks.some((chunk) => options.measure(chunk) > options.maxWidth)) unbreakable = true;
          for (let i = 0; i < chunks.length; i += 1) {
            if (i === chunks.length - 1) {
              current = chunks[i]!;
            } else {
              lines.push(chunks[i]!);
            }
          }
        } else {
          unbreakable = true;
          current = candidate;
        }
      } else {
        current = candidate;
      }
    } else {
      flush();
      current = word;
    }
  }
  flush();
  if (!lines.length) lines.push('');

  // A dangling last line caused by an early flush is merged back when it fits.
  const overflow = lines.length > options.maxLines;
  return { lines: overflow ? lines.slice(0, options.maxLines) : lines, overflow, unbreakable };
}

/* ------------------------------------------------------------------ */
/* Fitting                                                             */
/* ------------------------------------------------------------------ */

export interface FitOptions {
  measure?: MeasureText;
  /** Extra safety factor on measured widths. */
  slack?: number;
  /** Requested size in pt; clamped into the region's range. */
  requestedSizePt?: number;
  requestedWeight?: number;
  requestedFamily?: string;
  requestedLetterSpacingEm?: number;
  /** Overrides the region's line height (advanced users). */
  lineHeight?: number;
}

const EPSILON_MM = 0.05;

function applyTransform(text: string, transform: TextRegionSpec['textTransform']): string {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  return text;
}

/**
 * Fit text into a region.
 *
 * 1. normalise without destroying spelling (NFC, no case folding unless asked)
 * 2. resolve a family that can actually draw the string (Devanagari fallback)
 * 3. binary-search the largest size in [min, max] that fits width *and* height
 * 4. relax letter-spacing inside the template's bounds before going smaller
 * 5. report `clamped-min-size` + a warning rather than truncating
 */
export function fitTextToRegion(
  rawText: string,
  region: TextRegionSpec,
  options: FitOptions = {},
): TextFitResult {
  const measure = options.measure ?? conservativeMeasure;
  const slack = options.slack ?? 1;
  const warnings: string[] = [];

  const normalized = rawText.normalize('NFC').replace(/\s+/g, ' ').trim();
  const requestedFamilyId = options.requestedFamily ?? region.families[0] ?? 'poppins';
  const resolution = resolveFamilyForText(requestedFamilyId, normalized);
  const familyId = resolution.familyId;
  if (resolution.substituted && resolution.reason) warnings.push(resolution.reason);

  // A region may legitimately omit `weights` (the template scaffold fills it in,
  // but callers and stored region specs need not) — never index into it blindly.
  const weight = options.requestedWeight ?? region.weights?.[0] ?? 400;
  const face = resolveFace(familyId, weight);
  if (face.weight !== weight) {
    warnings.push(`Weight ${weight} is not shipped for ${familyId}; ${face.weight} used instead.`);
  }

  const spacingSpec = region.letterSpacing ?? { min: -0.02, max: 0.12, default: 0 };
  const requestedSpacing = options.requestedLetterSpacingEm ?? spacingSpec.default;
  const spacingEm = Math.min(spacingSpec.max, Math.max(spacingSpec.min, requestedSpacing));

  const text = applyTransform(normalized, region.textTransform);
  const analysis = analyseScript(text, face.id);
  if (analysis.unsupported.length) {
    const list = analysis.unsupported.slice(0, 4).map((u) => `“${u.char}”`).join(', ');
    warnings.push(`${analysis.unsupported.length} character(s) missing from ${familyId}: ${list}. They will be substituted at export.`);
  }

  // Regions authored by templates always carry a line height; a region supplied
  // by a caller may not, and a missing multiplier used to produce NaN geometry
  // (which then propagated into vertical centring). 1.2 is the typographic norm.
  const lineHeightBase = options.lineHeight ?? region.lineHeight ?? 1.2;
  const maxSizeMm = ptToMm(region.maxSizePt);
  const minSizeMm = ptToMm(region.minSizePt);
  const requestedSizeMm = Math.min(maxSizeMm, Math.max(minSizeMm, ptToMm(options.requestedSizePt ?? region.maxSizePt)));

  if (!text) {
    const emptySize = Math.min(requestedSizeMm, maxSizeMm);
    return {
      familyId,
      requestedFamilyId,
      faceId: face.id,
      weight: face.weight,
      sizeMm: emptySize,
      sizePt: round(emptySize / (25.4 / 72), 2),
      requestedSizePt: options.requestedSizePt ?? region.maxSizePt,
      letterSpacingMm: 0,
      letterSpacingEm: 0,
      lineHeight: lineHeightBase,
      anchor: region.anchor,
      lines: [],
      blockWidth: 0,
      blockHeight: 0,
      status: 'empty',
      warnings,
      overflow: false,
    };
  }

  const measureAt = (candidate: string, sizeMm: number, spacing: number) =>
    measure({ text: candidate, faceId: face.id, sizeMm, letterSpacingMm: sizeMm * spacing }) * slack;

  const layoutAt = (sizeMm: number, spacingEmValue: number) => {
    const spacingMm = sizeMm * spacingEmValue;
    const wrapped = wrapClusters(text, {
      measure: (s) => measureAt(s, sizeMm, spacingEmValue),
      maxWidth: region.width - EPSILON_MM,
      maxLines: region.maxLines,
      breakWords: region.breakWords ?? false,
    });
    const lineGap = sizeMm * lineHeightBase;
    const ascentMm = (face.ascent / 1000) * sizeMm;
    const descentMm = (face.descent / 1000) * sizeMm;
    const blockHeight = (wrapped.lines.length - 1) * lineGap + (ascentMm - descentMm);
    const widths = wrapped.lines.map((line) => measureAt(line, sizeMm, spacingEmValue));
    const blockWidth = widths.length ? Math.max(...widths) : 0;
    return { wrapped, blockHeight, blockWidth, widths, lineGap, ascentMm };
  };

  let spacing = spacingEm;
  let size = requestedSizeMm;
  let layout = layoutAt(size, spacing);

  // Step 1: widen letter-spacing (never shrink first — tracking is free space).
  if (layout.blockWidth < region.width * 0.98 && layout.wrapped.lines.length < region.maxLines) {
    while (spacing + 0.04 <= spacingSpec.max) {
      const next = layoutAt(size, round(spacing + 0.04, 3));
      if (next.blockWidth > region.width || next.wrapped.lines.length > region.maxLines) break;
      spacing = round(spacing + 0.04, 3);
      layout = next;
    }
  }

  let status: FitStatus = 'fits';

  // Step 2: binary search the largest fitting size (25 iterations ≈ 0.02 pt).
  const fits = (candidate: number, spacingEmValue: number) => {
    const probe = layoutAt(candidate, spacingEmValue);
    return probe.blockWidth <= region.width && probe.blockHeight <= region.height && probe.wrapped.lines.length <= region.maxLines;
  };

  if (!fits(size, spacing)) {
    let lo = minSizeMm;
    let hi = size;
    if (fits(lo, spacingEm)) {
      for (let i = 0; i < 25; i += 1) {
        const mid = (lo + hi) / 2;
        if (fits(mid, spacing)) lo = mid;
        else hi = mid;
      }
      size = lo;
      layout = layoutAt(size, spacing);
      status = 'shrunk';
    } else {
      // Step 3: negative tracking before anything else.
      let tightened = spacingSpec.min;
      let ok = false;
      for (let s = spacingEm; s >= spacingSpec.min; s = round(s - 0.01, 3)) {
        if (fits(lo, s)) {
          tightened = s;
          ok = true;
          break;
        }
      }
      if (!ok && fits(lo, spacingSpec.min)) {
        tightened = spacingSpec.min;
        ok = true;
      }
      if (ok) {
        let a = lo;
        let b = size;
        for (let i = 0; i < 25; i += 1) {
          const mid = (a + b) / 2;
          if (fits(mid, tightened)) a = mid;
          else b = mid;
        }
        size = a;
        spacing = tightened;
        layout = layoutAt(size, spacing);
        status = 'shrunk';
      } else {
        size = minSizeMm;
        spacing = spacingSpec.min;
        layout = layoutAt(size, spacing);
        status = 'clamped-min-size';
      }
    }
  } else {
    // Requested size fits — see whether the region's width could use a larger
    // size than requested, but never exceed the template's maximum.
    if (!fits(maxSizeMm, spacing) || layout.blockWidth > region.width) {
      status = 'fits';
    } else {
      let lo = size;
      let hi = maxSizeMm;
      for (let i = 0; i < 20; i += 1) {
        const mid = (lo + hi) / 2;
        if (fits(mid, spacing)) lo = mid;
        else hi = mid;
      }
      if (lo > size + 0.15) {
        size = lo;
        layout = layoutAt(size, spacing);
        status = 'shrunk';
      }
    }
  }

  const finalLayout = layoutAt(size, spacing);
  layout = finalLayout;

  const overflow = layout.blockWidth > region.width + 0.2 || layout.blockHeight > region.height + 0.2;
  if (overflow && status !== 'clamped-min-size') status = 'clamped-min-size';
  if (overflow) {
    warnings.push(
      `“${text}” does not fit ${region.maxLines} line(s) at the minimum readable size (${region.minSizePt} pt). Shorten it, or allow more lines for this template.`,
    );
  }
  if (layout.wrapped.overflow) {
    warnings.push(`Text needed more than ${region.maxLines} line(s); split the name or increase the line allowance.`);
    status = 'needs-extra-line';
  }
  if (layout.wrapped.unbreakable) {
    warnings.push('A single word is wider than the text area and could not be broken.');
  }

  const lines: TextLine[] = layout.wrapped.lines.map((line, index) => {
    const width = layout.widths[index] ?? 0;
    const x = anchorX(region, width);
    const y = baselineY(region, layout, index);
    return { text: line, width: round(width, 3), x: round(x, 3), y: round(y, 3) };
  });

  return {
    familyId,
    requestedFamilyId,
    faceId: face.id,
    weight: face.weight,
    sizeMm: round(size, 4),
    sizePt: round(size / (25.4 / 72), 3),
    requestedSizePt: options.requestedSizePt ?? region.maxSizePt,
    letterSpacingMm: round(size * spacing, 4),
    letterSpacingEm: round(spacing, 4),
    lineHeight: lineHeightBase,
    anchor: region.anchor,
    lines,
    blockWidth: round(layout.blockWidth, 3),
    blockHeight: round(layout.blockHeight, 3),
    status,
    warnings,
    overflow,
  };
}

function anchorX(region: TextRegionSpec, width: number): number {
  if (region.anchor === 'middle') return region.x + region.width / 2;
  if (region.anchor === 'end') return region.x + region.width;
  return region.x;
}

function baselineY(
  region: TextRegionSpec,
  layout: { blockHeight: number; lineGap: number; ascentMm: number },
  index: number,
): number {
  const top =
    region.verticalAlign === 'top'
      ? region.y
      : region.verticalAlign === 'bottom'
        ? region.y + region.height - layout.blockHeight
        : region.y + (region.height - layout.blockHeight) / 2;
  return top + layout.ascentMm + index * layout.lineGap;
}

/** Convenience: the text style a template advertises for a role. */
export function defaultTextStyle(region: TextRegionSpec, familyId?: string, weight?: number, sizePt?: number): TextStyleRequest {
  return {
    familyId: familyId ?? region.families[0] ?? 'poppins',
    weight: weight ?? region.weights?.[0] ?? 400,
    sizePt: sizePt ?? region.maxSizePt,
    letterSpacingEm: region.letterSpacing?.default ?? 0,
    anchor: region.anchor,
    verticalAlign: region.verticalAlign,
  };
}

/** Is every codepoint in the string drawable by the resolved face? */
export function textIsFullySupported(familyId: string, text: string): { ok: boolean; missing: string[] } {
  const resolution = resolveFamilyForText(familyId, text);
  const face = resolveFace(resolution.familyId, 400);
  const analysis = analyseScript(text, face.id);
  return { ok: analysis.unsupported.length === 0, missing: analysis.unsupported.map((u) => u.char) };
}
