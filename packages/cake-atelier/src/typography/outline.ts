/**
 * @mazi/cake-atelier — shaping and text-to-path (server side)
 *
 * Every print export is generated here, not asked of a browser: text is shaped
 * with fontkit's OpenType shaper (the same HarfBuzz-derived machinery that
 * browsers use, including the Indic reordering rules for Devanagari), converted
 * to outlines, and then drawn as ordinary vector paths. That removes fonts from
 * the export equation entirely — no missing-font substitution on a printer's
 * machine, no rasterised text, no `foreignObject`.
 *
 * Editable text is still available: the SVG export can keep live `<text>`.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { openSync, type Font, type Glyph } from 'fontkit';

import { matrix, num, type Matrix } from '../geometry.js';
import { parsePath, stringifySegments, type Segment } from '../path.js';
import type { Scene, SceneNode, ShapeNode, TextNode } from '../scene.js';
import { group, shape, walk } from '../scene.js';
import { getFontFace, type FontFace } from './fonts.js';

/* ------------------------------------------------------------------ */
/* Font file resolution                                                */
/* ------------------------------------------------------------------ */

const FONT_DIR_ENV = 'CAKE_ATELIER_FONT_DIR';
let cachedFontDir: string | null = null;

/**
 * Locate the bundled TTFs. Checked in order:
 *   1. `CAKE_ATELIER_FONT_DIR`
 *   2. `public/cake-fonts` (synced copy served to browsers, `next dev` from apps/web)
 *   3. `apps/web/public/cake-fonts` (same, running from the repo root)
 *   4. the package's own `fonts/` directory
 */
export function resolveFontDir(): string {
  if (cachedFontDir) return cachedFontDir;
  const candidates = [
    process.env[FONT_DIR_ENV],
    path.join(process.cwd(), 'public', 'cake-fonts'),
    path.join(process.cwd(), 'apps', 'web', 'public', 'cake-fonts'),
    path.join(process.cwd(), 'packages', 'cake-atelier', 'fonts'),
    path.join(process.cwd(), '..', 'packages', 'cake-atelier', 'fonts'),
    path.join(process.cwd(), '..', '..', 'packages', 'cake-atelier', 'fonts'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'baloo2', 'baloo2-400.ttf'))) {
      cachedFontDir = candidate;
      return candidate;
    }
  }
  throw new Error(
    `cake-atelier: bundled fonts not found. Looked in: ${candidates.join(', ')}. ` +
      'Run `npm run fonts:sync` (copies packages/cake-atelier/fonts into apps/web/public/cake-fonts) ' +
      `or set ${FONT_DIR_ENV}.`,
  );
}

export function fontFilePath(face: FontFace): string {
  return path.join(resolveFontDir(), face.file.replace(/^fonts\//, ''));
}

const fontCache = new Map<string, Font>();

export function loadFont(faceId: string): Font {
  const cached = fontCache.get(faceId);
  if (cached) return cached;
  const face = getFontFace(faceId);
  if (!face) throw new Error(`cake-atelier: unknown face "${faceId}"`);
  const file = fontFilePath(face);
  if (!existsSync(file)) {
    throw new Error(`cake-atelier: font file missing for ${faceId} at ${file}`);
  }
  const font = openSync(file) as Font;
  fontCache.set(faceId, font);
  return font;
}

export function clearFontCache(): void {
  for (const font of fontCache.values()) {
    try {
      (font as unknown as { close?: () => void }).close?.();
    } catch {
      /* fontkit closes lazily; a failure here must not break an export */
    }
  }
  fontCache.clear();
  cachedFontDir = null;
  glyphCache.clear();
}

/* ------------------------------------------------------------------ */
/* Shaping                                                             */
/* ------------------------------------------------------------------ */

export interface ShapedGlyph {
  glyphId: number;
  /** Index of the first source codepoint this glyph represents. */
  cluster: number;
  codePoints: number[];
  /** Font units. */
  xAdvance: number;
  xOffset: number;
  yOffset: number;
}

export interface ShapedLine {
  text: string;
  glyphs: ShapedGlyph[];
  /** Total advance width, font units (letter-spacing excluded). */
  advanceWidth: number;
  /** Codepoints that produced a `.notdef` glyph. */
  missing: string[];
}

/** Shape a single line of text with the real OpenType tables. */
export function shapeLine(faceId: string, text: string): ShapedLine {
  const font = loadFont(faceId);
  const run = font.layout(text);
  const glyphs: ShapedGlyph[] = [];
  const missing: string[] = [];
  let advanceWidth = 0;

  let codepointIndex = 0;
  for (let i = 0; i < run.glyphs.length; i += 1) {
    const glyph = run.glyphs[i]!;
    const position = run.positions[i]!;
    const codePoints: number[] = [];
    const source = glyph.codePoints ?? [];
    for (const cp of source) codePoints.push(cp);
    if (glyph.id === 0) {
      for (const cp of source) missing.push(String.fromCodePoint(cp));
    }
    const cluster = (position as unknown as { cluster?: number }).cluster ?? codepointIndex;
    codepointIndex += codePoints.length;
    glyphs.push({
      glyphId: glyph.id,
      cluster,
      codePoints,
      xAdvance: position.xAdvance ?? 0,
      xOffset: position.xOffset ?? 0,
      yOffset: position.yOffset ?? 0,
    });
    advanceWidth += position.xAdvance ?? 0;
  }

  return { text, glyphs, advanceWidth, missing };
}

/* ------------------------------------------------------------------ */
/* Glyph outlines                                                      */
/* ------------------------------------------------------------------ */

const glyphCache = new Map<string, Segment[]>();

interface PathCommand {
  command: string;
  args: number[];
}

/** Outline for a glyph, in font units, cached per face + glyph id. */
export function glyphSegments(faceId: string, glyphId: number): Segment[] {
  const key = `${faceId}#${glyphId}`;
  const cached = glyphCache.get(key);
  if (cached) return cached;
  const font = loadFont(faceId);
  const glyph: Glyph | undefined = font.getGlyph(glyphId);
  const commands = (glyph?.path?.commands ?? []) as PathCommand[];
  const parts: string[] = [];
  for (const command of commands) {
    const args = command.args.map((n) => num(n, 2));
    switch (command.command) {
      case 'moveTo':
        parts.push(`M ${args[0]} ${args[1]}`);
        break;
      case 'lineTo':
        parts.push(`L ${args[0]} ${args[1]}`);
        break;
      case 'quadraticCurveTo':
        parts.push(`Q ${args.join(' ')}`);
        break;
      case 'bezierCurveTo':
        parts.push(`C ${args.join(' ')}`);
        break;
      case 'closePath':
        parts.push('Z');
        break;
      default:
        break;
    }
  }
  const segments = parts.length ? parsePath(parts.join(' ')) : [];
  if (glyphCache.size > 8000) glyphCache.clear();
  glyphCache.set(key, segments);
  return segments;
}

export interface OutlineLineResult {
  d: string;
  /** Advance width in font units, including letter spacing. */
  advanceWidth: number;
  missing: string[];
}

/**
 * Outline one laid-out line.
 *
 * @param sizeMm   font size in millimetres (scene units)
 * @param spacingMm letter-spacing in millimetres, applied after every glyph
 *                  including the last, matching the CSS/SVG specification
 */
export function outlineLine(
  faceId: string,
  line: { text: string; x: number; y: number },
  anchor: 'start' | 'middle' | 'end',
  sizeMm: number,
  spacingMm: number,
): OutlineLineResult {
  const faced = getFontFace(faceId);
  if (!faced) throw new Error(`cake-atelier: unknown face "${faceId}"`);
  const shaped = shapeLine(faceId, line.text);
  const unitsToMm = sizeMm / faced.unitsPerEm;

  const spacingUnits = spacingMm / unitsToMm;
  const totalUnits = shaped.glyphs.length
    ? shaped.advanceWidth + spacingUnits * shaped.glyphs.length
    : 0;
  const totalMm = totalUnits * unitsToMm;

  let pen = line.x;
  if (anchor === 'middle') pen -= totalMm / 2;
  else if (anchor === 'end') pen -= totalMm;

  const parts: string[] = [];
  for (const glyph of shaped.glyphs) {
    const segments = glyphSegments(faceId, glyph.glyphId);
    if (segments.length) {
      // Font space is Y-up; flip into scene space and place on the baseline.
      const m: Matrix = matrix(
        unitsToMm,
        0,
        0,
        -unitsToMm,
        pen + glyph.xOffset * unitsToMm,
        line.y - glyph.yOffset * unitsToMm,
      );
      parts.push(stringifySegments(segments.map(translateSegmentsByMatrix(m)), 3));
    }
    pen += (glyph.xAdvance + spacingUnits) * unitsToMm;
  }

  return { d: parts.join(' '), advanceWidth: totalUnits, missing: shaped.missing };
}

function translateSegmentsByMatrix(m: Matrix): (segment: Segment) => Segment {
  return (segment) => ({
    type: segment.type,
    points: segment.points.map((p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]] as const),
  });
}

/* ------------------------------------------------------------------ */
/* Scene-level outlining                                               */
/* ------------------------------------------------------------------ */

export interface OutlineEntry {
  nodeId: string;
  text: string;
  faceId: string;
  family: string;
  lines: number;
  sizeMm: number;
  missing: string[];
}

export interface OutlineReport {
  entries: OutlineEntry[];
  /** Faces actually used in the outlined output. */
  faces: string[];
  missingGlyphs: { text: string; characters: string[] }[];
  /** True when at least one string needed a substituted family. */
  substituted: boolean;
}

export interface OutlineOptions {
  /** When true, text nodes marked `editable` stay as `<text>` in SVG output. */
  keepEditableText?: boolean;
}

/**
 * Replace every text node with outlined path groups. Deterministic: the same
 * scene always produces the same path data.
 */
export function outlineScene(scene: Scene, options: OutlineOptions = {}): { scene: Scene; report: OutlineReport } {
  const entries: OutlineEntry[] = [];
  const faces = new Set<string>();
  const missingGlyphs: { text: string; characters: string[] }[] = [];

  const visit = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      if (node.kind === 'group') {
        return { ...node, children: visit(node.children) };
      }
      if (node.kind !== 'text') return node;
      if (options.keepEditableText && node.editable) return node;

      const children: ShapeNode[] = [];
      const missing: string[] = [];
      for (let i = 0; i < node.lines.length; i += 1) {
        const line = node.lines[i]!;
        const outlined = outlineLine(node.faceId ?? faceIdFor(node), line, node.anchor, node.size, node.letterSpacing);
        missing.push(...outlined.missing);
        if (!outlined.d) continue;
        children.push(
          shape(outlined.d, {
            id: `${node.id}:line${i}`,
            role: node.role,
            fill: node.fill,
            material: node.material,
            cut: node.cut,
            fillRule: 'nonzero',
            label: node.label ? `${node.label} — line ${i + 1}` : undefined,
            ...(node.stroke ? { stroke: node.stroke } : {}),
          }),
        );
      }

      entries.push({
        nodeId: node.id,
        text: node.lines.map((l) => l.text).join(' '),
        faceId: node.faceId ?? faceIdFor(node),
        family: node.family,
        lines: node.lines.length,
        sizeMm: node.size,
        missing,
      });
      faces.add(node.faceId ?? faceIdFor(node));
      if (missing.length) {
        missingGlyphs.push({ text: node.lines.map((l) => l.text).join(' '), characters: [...new Set(missing)] });
      }

      return group(children, {
        id: node.id,
        role: node.role,
        material: node.material,
        cut: node.cut,
        label: node.label ?? `Text: ${node.lines.map((l) => l.text).join(' ')}`,
      });
    });

  const outlinedScene: Scene = { ...scene, nodes: visit(scene.nodes) };
  return {
    scene: outlinedScene,
    report: {
      entries,
      faces: [...faces].sort(),
      missingGlyphs,
      substituted: entries.some((e) => e.faceId.startsWith('noto-sans-devanagari')),
    },
  };
}

/**
 * Text nodes carry the resolved face id. Older projects (or hand-authored
 * scenes) may only carry a family + weight, so resolve it here.
 */
function faceIdFor(node: TextNode): string {
  if ('faceId' in node && typeof (node as { faceId?: string }).faceId === 'string') {
    return (node as { faceId: string }).faceId;
  }
  const resolution = getFontFace(`${node.family}-${node.weight}`);
  return resolution ? resolution.id : 'poppins-400';
}

/** Does the scene contain any live text? (Preflight: font availability check.) */
export function sceneHasText(scene: Scene): boolean {
  let found = false;
  walk(scene.nodes, (node) => {
    if (node.kind === 'text') found = true;
  });
  return found;
}

/** Read a bundled font file as bytes — used by the PDF font-embedding path. */
export function fontBytes(faceId: string): Uint8Array {
  const face = getFontFace(faceId);
  if (!face) throw new Error(`cake-atelier: unknown face "${faceId}"`);
  return new Uint8Array(readFileSync(fontFilePath(face)));
}
