/**
 * Builds `src/typography/font-metrics.ts` from the bundled OFL fonts.
 *
 * The metrics table is what makes name-fitting work in the browser without
 * shipping a shaping engine: real per-codepoint advance widths from the actual
 * TTFs, so the client measures with the same numbers the server uses when it
 * outlines text for print.
 *
 *   node scripts/build-font-metrics.mjs
 *
 * Run from the package root. Regenerate whenever a font file changes; the file
 * is committed so no build step is needed at runtime.
 */

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openSync } from 'fontkit';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const fontsDir = path.join(root, 'fonts');
const outFile = path.join(root, 'src', 'typography', 'font-metrics.ts');

/** Codepoint ranges worth shipping (Latin, punctuation, currency, Devanagari). */
const RANGES = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x00ff], // Latin-1 Supplement
  [0x0100, 0x017f], // Latin Extended-A
  [0x0180, 0x024f], // Latin Extended-B
  [0x02b0, 0x02ff], // Spacing modifiers (incl. ZWJ/ZWNJ neighbours)
  [0x2000, 0x206f], // General punctuation
  [0x20a0, 0x20bf], // Currency symbols
  [0x2190, 0x21ff], // Arrows
  [0x2200, 0x22ff], // Math operators (common fraction/decorative use)
  [0x25a0, 0x25ff], // Geometric shapes (bullets, stars used by some names)
  [0x0900, 0x097f], // Devanagari
  [0x09e6, 0x09ef], // Bengali digits (rare but harmless)
  [0xa830, 0xa83f], // Common Indic number forms
  [0x1cd0, 0x1cff], // Vedic extensions (used by Marathi liturgical text)
  [0x200c, 0x200d], // ZWNJ / ZWJ (inside the punctuation range, repeated for clarity)
];

const CODEPOINTS = new Set();
for (const [start, end] of RANGES) {
  for (let cp = start; cp <= end; cp += 1) CODEPOINTS.add(cp);
}

function listFontFiles() {
  const out = [];
  for (const family of readdirSync(fontsDir)) {
    const familyDir = path.join(fontsDir, family);
    if (!statSync(familyDir).isDirectory()) continue;
    for (const file of readdirSync(familyDir)) {
      if (file.toLowerCase().endsWith('.ttf')) out.push(path.join(familyDir, file));
    }
  }
  return out.sort();
}

function advanceOf(font, codePoint) {
  try {
    if (typeof font.glyphForCodePoint === 'function') {
      const glyph = font.glyphForCodePoint(codePoint);
      if (glyph && glyph.id > 0 && typeof glyph.advanceWidth === 'number') return glyph.advanceWidth;
    }
    if (font.characterSet && Array.isArray(font.characterSet) && !font.characterSet.includes(codePoint)) {
      return null;
    }
    const glyphs = font.layout(String.fromCodePoint(codePoint));
    const first = glyphs?.glyphs?.[0];
    if (first && first.id > 0 && typeof first.advanceWidth === 'number') return first.advanceWidth;
  } catch {
    return null;
  }
  return null;
}

function familyOf(fontPath) {
  return path.basename(path.dirname(fontPath));
}

function faceIdOf(fontPath) {
  return `${familyOf(fontPath)}-${path.basename(fontPath, '.ttf').split('-').pop()}`;
}

const faces = {};
for (const file of listFontFiles()) {
  const font = openSync(file);
  const unitsPerEm = font.unitsPerEm ?? 1000;
  const advances = [];
  for (const cp of [...CODEPOINTS].sort((a, b) => a - b)) {
    const adv = advanceOf(font, cp);
    if (adv === null || adv === undefined) continue;
    advances.push([cp, Math.round((adv / unitsPerEm) * 1000)]);
  }
  faces[faceIdOf(file)] = {
    family: familyOf(file),
    file: path.relative(root, file).split(path.sep).join('/'),
    unitsPerEm,
    ascent: Math.round(((font.ascent ?? unitsPerEm * 0.8) / unitsPerEm) * 1000),
    descent: Math.round(((font.descent ?? -unitsPerEm * 0.2) / unitsPerEm) * 1000),
    lineGap: Math.round(((font.lineGap ?? 0) / unitsPerEm) * 1000),
    capHeight: Math.round((((font.capHeight ?? 0) || unitsPerEm * 0.7) / unitsPerEm) * 1000),
    xHeight: Math.round((((font.xHeight ?? 0) || unitsPerEm * 0.5) / unitsPerEm) * 1000),
    hasDevanagari: advances.some(([cp]) => cp >= 0x0900 && cp <= 0x097f),
    advances,
  };
  const glyphCount = faces[faceIdOf(file)].advances.length;
  console.log(`${faceIdOf(file).padEnd(34)} ${String(glyphCount).padStart(5)} mapped codepoints`);
  if (font.close) font.close();
}

const payload = {
  version: 1,
  generatedFrom: 'packages/cake-atelier/fonts',
  note: 'Advance widths are 1/1000 em. Regenerate with `npm run fonts:metrics` in packages/cake-atelier.',
  faces,
};

const source = `/**
 * @mazi/cake-atelier — generated font metrics (do not edit by hand)
 *
 * Produced by \`npm run fonts:metrics\` in packages/cake-atelier from the OFL fonts
 * committed in \`fonts/\`. It is a TypeScript module rather than JSON on purpose:
 * a JSON import needs \`with { type: 'json' }\` under Node's ESM loader and breaks
 * the tooling chain (Vite, webpack, vitest, tsc) that hosts the same source.
 *
 * Advance widths are 1/1000 em.
 */

export interface FontFaceMetrics {
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

export interface FontMetricsData {
  version: number;
  generatedFrom: string;
  note: string;
  faces: Record<string, FontFaceMetrics>;
}

export const FONT_METRICS: FontMetricsData = ${JSON.stringify(payload)};
`;

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, source, 'utf8');
const bytes = readFileSync(outFile).length;
console.log(`\nwrote ${path.relative(root, outFile)} (${(bytes / 1024).toFixed(1)} kB, ${Object.keys(faces).length} faces)`);
