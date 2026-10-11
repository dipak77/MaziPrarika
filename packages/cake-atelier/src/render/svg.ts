/**
 * @mazi/cake-atelier — SVG renderer
 *
 * Scene → SVG string. Used for the live preview (through the React component,
 * which renders the same nodes as JSX), the SVG export, the raster pipeline's
 * input, and the thumbnail files.
 *
 * Design rules the renderer honours:
 *   • `viewBox` plus explicit `width`/`height` in millimetres, so the file opens
 *     at the correct physical size in Illustrator, Affinity and Inkscape;
 *   • no `foreignObject`, no scripts, no external references — a print file must
 *     be self-contained and inert;
 *   • text is emitted as real `<text>` with explicit per-line coordinates, or as
 *     outlines when the caller asked for it;
 *   • production overlays (bleed, trim, safe area, registration marks, cutlines)
 *     are only emitted when explicitly requested, and are tagged so a printer
 *     can tell technical marks from artwork.
 */

import { num, round } from '../geometry.js';
import { LAYER_ROLES, walk, type GradientStop, type Paint, type Scene, type SceneNode, type ShapeNode, type Stroke, type TextNode } from '../scene.js';

export interface SvgRenderOptions {
  /** Include a background rect (false ⇒ transparent file). */
  includeBackground?: boolean;
  /** Emit live text where possible instead of outlines (already-outlined scenes have none). */
  editableText?: boolean;
  /** Production overlay: bleed box. */
  bleedMm?: number;
  /** Production overlay: trim + safe-area guides. */
  showGuides?: boolean;
  /** Production overlay: cutline from nodes flagged `cut`. */
  showCutline?: boolean;
  /** Production overlay: registration marks in the bleed. */
  showRegistration?: boolean;
  /** Accessible title/description injected as `<title>`/`<desc>`. */
  title?: string;
  description?: string;
  /** Add `shape-rendering` hints for cutting software that honours them. */
  forCutting?: boolean;
  /** Precision for path coordinates. */
  decimals?: number;
  /** Extra definitions (clip paths) to merge in. */
  extraDefs?: string;
}

interface Defs {
  gradients: string[];
  clips: string[];
}

function stopsToSvg(stops: GradientStop[]): string {
  return stops
    .map((stop) => {
      const opacity = stop.opacity === undefined || stop.opacity >= 1 ? '' : ` stop-opacity="${num(stop.opacity, 3)}"`;
      return `<stop offset="${num(stop.offset, 4)}" stop-color="${stop.color}"${opacity}/>`;
    })
    .join('');
}

function paintToSvg(paint: Paint | undefined, idPrefix: string, defs: Defs, io: (n: number) => number): { fill: string; extra: string } {
  if (!paint) return { fill: 'none', extra: '' };
  if (typeof paint === 'string') return { fill: paint, extra: '' };
  const id = `${idPrefix}-grad`;
  if (paint.type === 'linear') {
    defs.gradients.push(
      `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${num(io(paint.from[0]))}" y1="${num(io(paint.from[1]))}" x2="${num(io(paint.to[0]))}" y2="${num(io(paint.to[1]))}">${stopsToSvg(paint.stops)}</linearGradient>`,
    );
  } else {
    defs.gradients.push(
      `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${num(io(paint.center[0]))}" cy="${num(io(paint.center[1]))}" r="${num(io(paint.radius))}">${stopsToSvg(paint.stops)}</radialGradient>`,
    );
  }
  return { fill: `url(#${id})`, extra: '' };
}

function strokeAttrs(stroke: Stroke | undefined, io: (n: number) => number): string {
  if (!stroke) return '';
  const parts = [
    `stroke="${stroke.color}"`,
    `stroke-width="${num(io(stroke.width), 3)}"`,
  ];
  if (stroke.cap) parts.push(`stroke-linecap="${stroke.cap}"`);
  if (stroke.join) parts.push(`stroke-linejoin="${stroke.join}"`);
  if (stroke.opacity !== undefined && stroke.opacity < 1) parts.push(`stroke-opacity="${num(stroke.opacity, 3)}"`);
  if (stroke.dash?.length) parts.push(`stroke-dasharray="${stroke.dash.map((value: number) => num(io(value), 3)).join(' ')}"`);
  return ` ${parts.join(' ')}`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface RenderContext {
  defs: Defs;
  io: (n: number) => number;
  options: SvgRenderOptions;
  counter: number;
  hiddenRoles: string[];
}

export function renderSceneToSvg(scene: Scene, options: SvgRenderOptions = {}): string {
  const io = (n: number): number => n;
  const defs: Defs = { gradients: [], clips: [] };
  const ctx: RenderContext = { defs, io, options, counter: 0, hiddenRoles: [] };
  const body: string[] = [];

  if (options.includeBackground !== false && scene.background !== undefined) {
    const paint = paintToSvg(scene.background, 'bg', defs, io);
    body.push(
      `<rect x="0" y="0" width="${num(scene.widthMm)}" height="${num(scene.heightMm)}" fill="${paint.fill}" data-role="background"/>`,
    );
  }

  for (const node of scene.nodes) body.push(renderNode(node, ctx, 1, undefined, undefined));

  const bleed = options.bleedMm ?? 0;
  const overlay: string[] = [];
  if (bleed > 0 || options.showGuides || options.showRegistration) {
    const guides: string[] = [];
    if (bleed > 0) {
      guides.push(
        `<rect x="${num(-bleed)}" y="${num(-bleed)}" width="${num(scene.widthMm + bleed * 2)}" height="${num(scene.heightMm + bleed * 2)}" fill="none" stroke="#ff2d95" stroke-width="0.25" stroke-dasharray="2 1.6" data-role="production" data-mark="bleed"/>`,
      );
      guides.push(
        `<rect x="0" y="0" width="${num(scene.widthMm)}" height="${num(scene.heightMm)}" fill="none" stroke="#00b3ff" stroke-width="0.25" data-role="production" data-mark="trim"/>`,
      );
      if (options.showRegistration) {
        guides.push(...registrationMarks(scene.widthMm, scene.heightMm, bleed));
      }
    }
    if (options.showGuides) {
      const inset = Math.min(scene.widthMm, scene.heightMm) * 0.05;
      guides.push(
        `<rect x="${num(inset)}" y="${num(inset)}" width="${num(scene.widthMm - inset * 2)}" height="${num(scene.heightMm - inset * 2)}" fill="none" stroke="#8b8b8b" stroke-width="0.2" stroke-dasharray="1.4 1.4" data-role="production" data-mark="safe-area"/>`,
      );
    }
    overlay.push(`<g data-layer="production">${guides.join('')}</g>`);
  }

  const clipDefs = Object.entries(scene.clips)
    .map(([id, d]) => `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"/></clipPath>`)
    .join('');

  const title = options.title ?? scene.meta.projectName;
  const size = bleed > 0 ? { w: scene.widthMm + bleed * 2, h: scene.heightMm + bleed * 2 } : { w: scene.widthMm, h: scene.heightMm };
  const offset = bleed > 0 ? ` viewBox="${num(-bleed)} ${num(-bleed)} ${num(size.w)} ${num(size.h)}"` : ` viewBox="0 0 ${num(size.w)} ${num(size.h)}"`;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${num(scene.widthMm)}mm" height="${num(scene.heightMm)}mm"${offset} data-template="${esc(scene.meta.templateId)}" data-revision="${esc(scene.meta.revision)}">`,
    `<title>${esc(title)}</title>`,
    `<desc>${esc(options.description ?? `Cake Atelier Pro design · ${scene.meta.paletteId} · generated ${scene.meta.generatedAt}`)}</desc>`,
    `<defs>${defs.gradients.join('')}${clipDefs}${options.extraDefs ?? ''}</defs>`,
    `<g data-layer="artwork">${body.join('')}</g>`,
    overlay.join(''),
    '</svg>',
  ].join('\n');
}

function registrationMarks(w: number, h: number, bleed: number): string[] {
  const r = Math.max(2.4, bleed * 0.5);
  const off = bleed * 0.55;
  const corners: [number, number][] = [
    [-off, -off],
    [w + off, -off],
    [-off, h + off],
    [w + off, h + off],
  ];
  return corners.map(
    ([x, y]) =>
      `<g data-role="production" data-mark="registration"><circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="none" stroke="#111" stroke-width="0.22"/><path d="M ${num(x - r)} ${num(y)} L ${num(x + r)} ${num(y)} M ${num(x)} ${num(y - r)} L ${num(x)} ${num(y + r)}" stroke="#111" stroke-width="0.22" fill="none"/></g>`,
  );
}

function transformAttr(node: SceneNode): string {
  if (!node.transform) return '';
  const m = node.transform;
  return ` transform="matrix(${m.map((value) => num(value, 5)).join(' ')})"`;
}

function commonAttrs(node: SceneNode): string {
  const parts: string[] = [`id="${esc(node.id)}"`, `data-role="${node.role}"`];
  if (node.material) parts.push(`data-material="${esc(node.material)}"`);
  if (node.cut) parts.push('data-cut="true"');
  if (node.score) parts.push('data-score="true"');
  if (node.opacity !== undefined && node.opacity < 1) parts.push(`opacity="${num(node.opacity, 3)}"`);
  if (node.clip) parts.push(`clip-path="url(#${node.clip})"`);
  const transform = transformAttr(node);
  if (transform) parts.push(transform.trim());
  return ` ${parts.join(' ')}`;
}

function renderNode(node: SceneNode, ctx: RenderContext, depth: number, parentMaterial?: string, parentHidden?: boolean): string {
  const hidden = parentHidden || node.hidden === true;
  if (hidden) return '';
  const material = node.material ?? parentMaterial;
  switch (node.kind) {
    case 'shape':
      return renderShape(node, ctx, material);
    case 'text':
      return renderText(node, ctx, material);
    case 'group': {
      ctx.counter += 1;
      const children = node.children.map((child) => renderNode(child, ctx, depth + 1, material, hidden));
      const inner = children.filter(Boolean).join('');
      if (!inner) return '';
      return `<g${commonAttrs(node)}>${inner}</g>`;
    }
    default:
      return '';
  }
}

function renderShape(node: ShapeNode, ctx: RenderContext, material?: string): string {
  const fill = paintToSvg(node.fill, `f-${sanitizeId(node.id)}-${ctx.defs.gradients.length}`, ctx.defs, ctx.io);
  let attrs = commonAttrs(node);
  if (material && !node.material) attrs += ` data-material="${esc(material)}"`;
  const rule = node.fillRule === 'evenodd' ? ' fill-rule="evenodd"' : '';
  return `<path d="${node.d}"${attrs} fill="${fill.fill}"${rule}${strokeAttrs(node.stroke, ctx.io)}/>`;
}

function renderText(node: TextNode, ctx: RenderContext, material?: string): string {
  let attrs = commonAttrs(node);
  if (material && !node.material) attrs += ` data-material="${esc(material)}"`;
  const anchor = node.anchor;
  const fill = node.fill || '#111111';
  const fontSize = num(node.size, 3);
  const spacing = node.letterSpacing ? ` letter-spacing="${num(node.letterSpacing, 4)}"` : '';
  const stroke = node.stroke ? strokeAttrs(node.stroke, ctx.io) : '';
  const lines = node.lines
    .map(
      (line, index) =>
        `<text x="${num(line.x, 3)}" y="${num(line.y, 3)}" font-family="${esc(node.family)}" font-size="${fontSize}" font-weight="${node.weight}" text-anchor="${anchor}"${spacing}${stroke} data-line="${index + 1}">${esc(line.text)}</text>`,
    )
    .join('');
  return `<g${attrs} fill="${fill}" data-face="${esc(node.faceId ?? `${node.family}-${node.weight}`)}">${lines}</g>`;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-]/g, '-');
}

/** Rendered roles in paint order — used by the production report. */
export function sceneRoles(scene: Scene): string[] {
  const found = new Set<string>();
  walk(scene.nodes, (node) => found.add(node.role));
  return LAYER_ROLES.filter((role) => found.has(role));
}

/** Approximate SVG size, used to enforce response limits before sending. */
export function estimateSvgBytes(scene: Scene): number {
  let total = 0;
  walk(scene.nodes, (node) => {
    if (node.kind === 'shape') total += node.d.length;
    else if (node.kind === 'text') total += node.lines.reduce((sum, line) => sum + line.text.length, 0) + 80;
    else total += 60;
  });
  return round(total * 1.15, 0);
}
