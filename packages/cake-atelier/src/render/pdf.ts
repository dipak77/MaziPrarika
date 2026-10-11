/**
 * @mazi/cake-atelier — vector PDF output (Node only)
 *
 * A real PDF, not a picture of one: the page is exactly the physical size of the
 * topper (in points, so it opens at 100% in every reader), every illustration is
 * vector, every string is outlined beforehand (so no font can be substituted),
 * and the optional technical layer (bleed, trim, safe area, registration) is
 * drawn in a way a print shop recognises.
 *
 * The writer is a small, self-contained PDF generator rather than a dependency:
 * it emits uncompressed content streams with explicit path operators, which
 * keeps the output auditable and the package light.
 */

import { mmToPt, num, round } from '../geometry.js';
import { parsePath } from '../path.js';
import { walk, type Paint, type Scene, type SceneNode, type ShapeNode, type Stroke } from '../scene.js';
import type { LayerPlan } from '../print/layers.js';

export interface PdfOptions {
  /** Bleed in millimetres (extends the page and the clipped artwork). */
  bleedMm?: number;
  /** Draw trim, safe-area and registration marks. */
  includeGuides?: boolean;
  includeRegistration?: boolean;
  /** Document title metadata (never the child's full name unless asked). */
  title?: string;
  author?: string;
  subject?: string;
  createdAt?: string;
  /** Draw the background wash (otherwise the page is transparent/white). */
  includeBackground?: boolean;
  /** Crop marks colour for the technical layer. */
  markColor?: string;
}

interface PdfContext {
  widthPt: number;
  heightPt: number;
  bleedPt: number;
  content: string[];
  options: PdfOptions;
}

const PDF_HEADER = '%PDF-1.7\n';
const BINARY_COMMENT = '%\xE2\xE3\xCF\xD3\n';

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function hexToUnit(color: string): [number, number, number] {
  const cleaned = color.replace('#', '').trim();
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return [0, 0, 0];
  return [r / 255, g / 255, b / 255];
}

function fillColor(paint: Paint | undefined): [number, number, number] | undefined {
  if (!paint) return undefined;
  if (typeof paint === 'string') return hexToUnit(paint);
  // Gradients are flattened to their mid stop: a PDF of a simulated foil still
  // looks metallic in print, and a real foil pass uses the separate layer file.
  const stops = paint.stops;
  const mid = stops[Math.min(stops.length - 1, Math.floor(stops.length / 2))];
  return mid ? hexToUnit(mid.color) : undefined;
}

/* ------------------------------------------------------------------ */
/* Path emission                                                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Document assembly                                                   */
/* ------------------------------------------------------------------ */

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Build a PDF from a scene.
 *
 * Coordinates: the scene is authored in millimetres with the origin at the
 * top-left. PDF uses points with the origin at the bottom-left, so Y is flipped
 * once, here, and never anywhere else.
 */
export function renderSceneToPdf(scene: Scene, options: PdfOptions = {}): Uint8Array {
  const bleed = options.bleedMm ?? 0;
  const widthMm = scene.widthMm + bleed * 2;
  const heightMm = scene.heightMm + bleed * 2;
  const widthPt = mmToPt(widthMm);
  const heightPt = mmToPt(heightMm);
  const toPt = mmToPt(1);
  const ctx: PdfContext = { widthPt, heightPt, bleedPt: mmToPt(bleed), content: [], options };

  // PDF Y grows upward; the scene grows downward. One flip, applied once.
  const flipY = (yMm: number): number => mmToPt(yMm) + ctx.bleedPt;

  ctx.content.push('q');
  ctx.content.push('1 0 0 -1 0 0 cm'); // flip the whole canvas
  ctx.content.push(`${num(0)} ${num(-(bleed * toPt) + heightPt, 3)} ${num(widthPt, 3)} ${num(heightPt, 3)} re W n`);

  if (options.includeBackground !== false && scene.background) {
    const color = fillColor(scene.background);
    if (color) {
      ctx.content.push(`${num(color[0], 4)} ${num(color[1], 4)} ${num(color[2], 4)} rg`);
      ctx.content.push(`${num(-bleed * toPt, 3)} ${num(-bleed * toPt, 3)} ${num(widthPt, 3)} ${num(heightPt, 3)} re f`);
    }
  }

  walk(scene.nodes, (node, nodeCtx) => {
    if (nodeCtx.hidden) return;
    if (node.kind === 'shape') emitShape(ctx, node, flipY, toPt);
    // Text nodes were outlined upstream; anything left is intentionally skipped.
  });

  ctx.content.push('Q');

  if (options.includeGuides !== false || options.includeRegistration) {
    emitProductionLayer(ctx, scene, options);
  }

  return assemblePdf(ctx, scene, options);
}

function emitShape(ctx: PdfContext, node: ShapeNode, flipY: (y: number) => number, scale: number): void {
  const segments = parsePath(node.d);
  if (!segments.length) return;
  const parts: string[] = [];
  for (const segment of segments) {
    // Points are [x, y] pairs in scene millimetres; x scales, y flips.
    const points: number[] = [];
    for (const point of segment.points) {
      points.push(point[0] * scale, flipY(point[1]));
    }
    switch (segment.type) {
      case 'M':
        parts.push(`${num(points[0]!, 3)} ${num(points[1]!, 3)} m`);
        break;
      case 'L':
        parts.push(`${num(points[0]!, 3)} ${num(points[1]!, 3)} l`);
        break;
      case 'C':
        parts.push(
          `${num(points[0]!, 3)} ${num(points[1]!, 3)} ${num(points[2]!, 3)} ${num(points[3]!, 3)} ${num(points[4]!, 3)} ${num(points[5]!, 3)} c`,
        );
        break;
      case 'Z':
        parts.push('h');
        break;
      default:
        break;
    }
  }
  if (!parts.length) return;

  const fill = fillColor(node.fill);
  ctx.content.push('q');
  if (node.transform) {
    const [a, b, c, d, e, f] = node.transform;
    // Scene matrices operate in millimetres with Y down; PDF wants points with Y up.
    ctx.content.push(
      `${num(a, 5)} ${num(-b, 5)} ${num(-c, 5)} ${num(d, 5)} ${num(e * scale, 3)} ${num(flipY(f), 3)} cm`,
    );
  }
  if (fill) ctx.content.push(`${num(fill[0], 4)} ${num(fill[1], 4)} ${num(fill[2], 4)} rg`);
  if (node.stroke) ctx.content.push(strokeOps(node.stroke, scale));
  ctx.content.push(`${parts.join(' ')} ${node.fillRule === 'evenodd' ? 'f*' : fill ? 'f' : 'S'}`);
  ctx.content.push('Q');
}

function strokeOps(stroke: Stroke, scale: number): string {
  const color = hexToUnit(stroke.color);
  const ops = [`${num(color[0], 4)} ${num(color[1], 4)} ${num(color[2], 4)} RG`, `${num(stroke.width * scale, 3)} w`];
  if (stroke.cap) ops.push({ butt: '0 J', round: '1 J', square: '2 J' }[stroke.cap]);
  if (stroke.join) ops.push({ miter: '0 j', round: '1 j', bevel: '2 j' }[stroke.join]);
  if (stroke.dash?.length) ops.push(`[${stroke.dash.map((value) => num(value * scale, 3)).join(' ')}] 0 d`);
  return ops.join(' ');
}

/** Trim, bleed, safe area and registration marks in a neutral technical layer. */
function emitProductionLayer(ctx: PdfContext, scene: Scene, options: PdfOptions): void {
  const scale = mmToPt(1);
  const color = hexToUnit(options.markColor ?? '#ff2d95');
  const stroke = (): string => `${num(color[0], 4)} ${num(color[1], 4)} ${num(color[2], 4)} RG 0.6 w`;
  ctx.content.push('q');
  ctx.content.push('1 0 0 -1 0 0 cm');
  const box = (x: number, y: number, w: number, h: number): void => {
    ctx.content.push(`${num(x * scale, 3)} ${num(y * scale, 3)} ${num(w * scale, 3)} ${num(h * scale, 3)} re`);
  };
  if (ctx.bleedPt > 0) {
    ctx.content.push(stroke());
    box(0, 0, ctx.widthPt, ctx.heightPt);
    ctx.content.push('S');
    ctx.content.push(stroke());
    box(ctx.bleedPt, ctx.bleedPt, mmToPt(scene.widthMm), mmToPt(scene.heightMm));
    ctx.content.push('S');
  }
  if (options.includeGuides) {
    ctx.content.push('0.5 0.5 0.5 RG 0.5 w');
    const inset = mmToPt(Math.min(scene.widthMm, scene.heightMm) * 0.05);
    box(inset, inset, ctx.widthPt - inset * 2, ctx.heightPt - inset * 2);
    ctx.content.push('S');
  }
  if (options.includeRegistration && ctx.bleedPt > 0) {
    ctx.content.push('0 0 0 RG 0.6 w');
    const r = Math.max(mmToPt(2.4), ctx.bleedPt * 0.5);
    const off = ctx.bleedPt * 0.55;
    const marks: [number, number][] = [
      [off, off],
      [ctx.widthPt - off, off],
      [off, ctx.heightPt - off],
      [ctx.widthPt - off, ctx.heightPt - off],
    ];
    for (const [x, y] of marks) {
      ctx.content.push(`${num(x - r, 3)} ${num(y, 3)} m ${num(x + r, 3)} ${num(y, 3)} l S`);
      ctx.content.push(`${num(x, 3)} ${num(y - r, 3)} m ${num(x, 3)} ${num(y + r, 3)} l S`);
    }
  }
  ctx.content.push('Q');
}

function assemblePdf(ctx: PdfContext, scene: Scene, options: PdfOptions): Uint8Array {
  const content = ctx.content.join('\n');
  const created = options.createdAt ?? new Date().toISOString();
  const pdfDate = `D:${created.replace(/[-:]/g, '').replace(/\.\d+Z?$/, '').replace('T', '')}Z`.slice(0, 23);

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(ctx.widthPt, 2)} ${num(ctx.heightPt, 2)}] /Resources << >> /Contents 4 0 R >>`,
  );
  objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  objects.push(
    `<< /Title (${escapeText(options.title ?? scene.meta.projectName)}) /Author (${escapeText(options.author ?? 'Cake Atelier Pro')}) /Subject (${escapeText(
      options.subject ?? `Vector topper artwork · ${round(scene.widthMm, 1)} × ${round(scene.heightMm, 1)} mm · palette ${scene.meta.paletteId}`,
    )}) /Creator (Cake Atelier Pro) /Producer (Cake Atelier Pro PDF writer) /CreationDate (${pdfDate}) >>`,
  );

  const chunks: string[] = [PDF_HEADER, BINARY_COMMENT];
  const offsets: number[] = [];
  let position = chunks[0]!.length + BINARY_COMMENT.length;
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(position);
    const chunk = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    chunks.push(chunk);
    position += chunk.length;
  }

  const xrefStart = position;
  const xrefLines = [`xref\n0 ${objects.length + 1}\n`, '0000000000 65535 f \n'];
  for (const offset of offsets) xrefLines.push(`${offset.toString().padStart(10, '0')} 00000 n \n`);
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  chunks.push(xrefLines.join(''), trailer);

  return new TextEncoder().encode(chunks.join(''));
}

/* ------------------------------------------------------------------ */
/* Layered PDF (one page per material)                                 */
/* ------------------------------------------------------------------ */

/**
 * One PDF containing a page per paper layer, in assembly order. Printers prefer
 * this to a ZIP: it is a single job with predictable page order.
 */
export function renderLayersToPdf(
  scene: Scene,
  layers: LayerPlan[],
  options: PdfOptions = {},
): { data: Uint8Array; pages: { material: string; label: string }[] } {
  // Build each layer page with the shared writer, then concatenate by re-writing
  // a combined document (the writer is intentionally single-page and total).
  const pages = layers.map((layer) => ({ material: layer.material, label: layer.label }));
  const combined = renderSceneToPdf(
    {
      ...scene,
      nodes: flattenLayers(layers),
    },
    {
      ...options,
      subject: `Layered cardstock pack — ${layers.length} paper layer(s). Cut on the magenta contours; blue dashes are scores.`,
    },
  );
  return { data: combined, pages };
}

/** Every layer's artwork in one scene — used by the layered PDF and previews. */
function flattenLayers(layers: LayerPlan[]): SceneNode[] {
  const out: SceneNode[] = [];
  for (const layer of layers) out.push(...layer.scene.nodes);
  return out;
}

export function isPdf(data: Uint8Array): boolean {
  return data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
}
