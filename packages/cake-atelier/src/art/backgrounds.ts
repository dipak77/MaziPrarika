/**
 * @mazi/cake-atelier — background treatments
 *
 * A background is part of the design, not a UI choice: it is authored per
 * template and exported with the artwork. The `background` paint fills the trim
 * box, the decorations sit on top, and everything is skipped when the user asks
 * for a transparent export.
 */

import {
  arcPath,
  circlePath,
  ellipsePath,
  polar,
  polygonPath,
  rectPath,
  ringPath,
  roundedRectPath,
  smoothClosedPath,
  starPath,
  TAU,
  waveBandPath,
  type Point,
} from '../geometry.js';
import type { Paint } from '../scene.js';
import { group, type SceneNode } from '../scene.js';
import { ink, type ArtCtx } from './helpers.js';
import { confetti, dotGrid, rays } from './decor.js';
import { bubbles, waveLayers } from './motifs.js';
import { starrySky } from './world.js';

export type BackgroundKind =
  | 'plain'
  | 'gradient'
  | 'glow'
  | 'dots'
  | 'stars'
  | 'confetti'
  | 'stripes'
  | 'waves'
  | 'hills'
  | 'clouds'
  | 'bubbles'
  | 'sunburst'
  | 'arch'
  | 'grid'
  | 'scallop'
  | 'rays';

export interface BackgroundSpec {
  kind: BackgroundKind;
  /** Overrides the palette's background paint. */
  paint?: Paint;
  /** Colour of the decoration layer. */
  accent?: string;
  /** Decoration opacity. */
  opacity?: number;
  /** Keep the centre clear for artwork and text. */
  clearCenter?: number;
}

export interface BackgroundInput {
  w: number;
  h: number;
  ctx: ArtCtx;
  rand: () => number;
}

/** The full-bleed paint for a template, or `undefined` for transparent. */
export function backgroundPaint(kind: BackgroundKind, ctx: ArtCtx, w: number, h: number, override?: Paint): Paint {
  if (override) return override;
  const pal = ctx.pal;
  switch (kind) {
    case 'gradient':
    case 'glow':
      return {
        type: 'linear',
        from: [0, 0],
        to: [0, h],
        stops: [
          { offset: 0, color: pal.background },
          { offset: 1, color: pal.backgroundDeep },
        ],
      };
    case 'waves':
      return {
        type: 'linear',
        from: [0, 0],
        to: [0, h],
        stops: [
          { offset: 0, color: pal.background },
          { offset: 0.62, color: pal.secondarySoft },
          { offset: 1, color: pal.secondary },
        ],
      };
    case 'rays':
    case 'sunburst':
      return {
        type: 'radial',
        center: [w / 2, h * 0.42],
        radius: h * 0.82,
        stops: [
          { offset: 0, color: pal.surface },
          { offset: 1, color: pal.backgroundDeep },
        ],
      };
    case 'hills':
    case 'clouds':
      return {
        type: 'linear',
        from: [0, 0],
        to: [0, h],
        stops: [
          { offset: 0, color: pal.background },
          { offset: 0.7, color: pal.backgroundDeep },
        ],
      };
    default:
      return pal.background;
  }
}

/** Decoration drawn above the background paint and below the artwork. */
export function backgroundDecor(spec: BackgroundSpec, input: BackgroundInput): SceneNode[] {
  const { ctx, w, h, rand } = input;
  const box = { x: 0, y: 0, w, h };
  const accent = spec.accent ?? ctx.pal.accentSoft;
  const opacity = spec.opacity ?? 0.9;

  switch (spec.kind) {
    case 'dots':
      return dotGrid(ctx, { box, step: w / 11, r: w / 150, color: accent, opacity: opacity * 0.6 });
    case 'grid': {
      const nodes: SceneNode[] = [];
      const step = w / 12;
      for (let x = step; x < w; x += step) {
        nodes.push(ink(ctx, 'grid-line', polygonPath([[x, 0], [x, h]], false), 'none', { stroke: { color: accent, width: 0.3 }, role: 'background', opacity: opacity * 0.5 }));
      }
      for (let y = step; y < h; y += step) {
        nodes.push(ink(ctx, 'grid-line', polygonPath([[0, y], [w, y]], false), 'none', { stroke: { color: accent, width: 0.3 }, role: 'background', opacity: opacity * 0.5 }));
      }
      return nodes;
    }
    case 'stars':
      return starrySky(ctx, { box, rand, count: 34, color: accent, sizes: [1.6, 4] });
    case 'confetti':
      return confetti(ctx, { box, rand, count: 40, colors: [ctx.pal.primary, ctx.pal.secondary, ctx.pal.accent, ctx.pal.primarySoft], size: w / 44, layer: 'accents' });
    case 'stripes': {
      const nodes: SceneNode[] = [];
      const step = w / 9;
      for (let x = -h; x < w + h; x += step) {
        nodes.push(
          ink(
            ctx,
            'stripe',
            polygonPath([[x, 0], [x + step * 0.42, 0], [x + step * 0.42 + h * 0.5, h], [x + h * 0.5, h]]),
            accent,
            { role: 'background', opacity: opacity * 0.35 },
          ),
        );
      }
      return nodes;
    }
    case 'waves':
      return [
        ...waveLayers(ctx, { x: 0, y: h * 0.6, w, h: h * 0.4, colors: [ctx.pal.secondarySoft, ctx.pal.secondary, ctx.pal.primarySoft] }),
        ...bubbles(ctx, { cx: w * 0.22, cy: h * 0.3, count: 6, spread: w * 0.24, rand, color: ctx.pal.highlight }),
      ];
    case 'hills': {
      const nodes: SceneNode[] = [];
      for (let i = 0; i < 3; i += 1) {
        const baseY = h * (0.72 + i * 0.1);
        const peaks: Point[] = [[-w * 0.05, h]];
        for (let x = 0; x <= 6; x += 1) {
          peaks.push([(w / 6) * x, baseY - Math.sin((x + i) * 1.1) * h * 0.08]);
        }
        peaks.push([w * 1.05, h]);
        nodes.push(
          ink(ctx, 'hill', smoothClosedPath(peaks, 0.5), i === 0 ? ctx.pal.foliage : i === 1 ? ctx.pal.secondarySoft : ctx.pal.primarySoft, {
            role: 'background',
            cut: true,
            label: `Hill band ${i + 1}`,
            opacity: 0.95,
          }),
        );
      }
      return nodes;
    }
    case 'clouds': {
      const nodes: SceneNode[] = [];
      for (let i = 0; i < 5; i += 1) {
        const cx = rand() * w;
        const cy = h * (0.55 + rand() * 0.4);
        const cw = w * (0.22 + rand() * 0.2);
        nodes.push(
          ink(
            ctx,
            'cloud-band',
            `${ellipsePath(cx - cw * 0.3, cy, cw * 0.3, cw * 0.16)} ${ellipsePath(cx, cy - cw * 0.06, cw * 0.34, cw * 0.2)} ${ellipsePath(cx + cw * 0.3, cy, cw * 0.26, cw * 0.15)}`,
            ctx.pal.surface,
            { role: 'background', cut: true, label: 'Cloud bank', opacity: 0.9 },
          ),
        );
      }
      return nodes;
    }
    case 'bubbles':
      return bubbles(ctx, { cx: w / 2, cy: h / 2, count: 12, spread: w * 0.8, rand, color: ctx.pal.highlight });
    case 'sunburst':
      return rays(ctx, { cx: w / 2, cy: h * 0.4, rInner: w * 0.1, rOuter: w * 0.78, count: 22, fill: accent, opacity: opacity * 0.4 });
    case 'rays':
      return rays(ctx, { cx: w / 2, cy: h / 2, rInner: w * 0.22, rOuter: w * 0.85, count: 18, fill: accent, opacity: opacity * 0.3 });
    case 'arch':
      return [
        ink(ctx, 'arch-fill', smoothClosedPath(
          [
            [w * 0.16, h * 0.92],
            [w * 0.16, h * 0.46],
            [w * 0.5, h * 0.12],
            [w * 0.84, h * 0.46],
            [w * 0.84, h * 0.92],
          ],
          0.3,
        ), spec.accent ?? ctx.pal.surfaceAlt, { role: 'background', cut: true, label: 'Arch', opacity: opacity }),
      ];
    case 'scallop': {
      const nodes: SceneNode[] = [];
      const bands = 3;
      for (let i = 0; i < bands; i += 1) {
        const y = h * (0.06 + i * 0.045);
        const count = 9;
        for (let j = 0; j < count; j += 1) {
          const x = (w / count) * (j + 0.5);
          nodes.push(
            ink(ctx, 'scallop', arcPath(x, y, w / count / 2, w / count / 2, Math.PI, TAU), 'none', {
              stroke: { color: accent, width: w / 200 },
              role: 'background',
              opacity: opacity * 0.8,
            }),
          );
        }
      }
      return nodes;
    }
    case 'glow':
      return [
        ink(
          ctx,
          'glow',
          ellipsePath(w / 2, h * 0.42, w * 0.42, h * 0.34),
          {
            type: 'radial',
            center: [w / 2, h * 0.42],
            radius: w * 0.44,
            stops: [
              { offset: 0, color: ctx.pal.highlight, opacity: 0.85 },
              { offset: 1, color: ctx.pal.highlight, opacity: 0 },
            ],
          },
          { role: 'background' },
        ),
      ];
    case 'plain':
    case 'gradient':
    default:
      return [];
  }
}

/** A wide horizontal band behind the title area (editorial device). */
export function titleBand(
  ctx: ArtCtx,
  options: { x: number; y: number; w: number; h: number; fill?: Paint; rule?: string; dashes?: boolean },
): SceneNode[] {
  const nodes: SceneNode[] = [
    ink(ctx, 'title-band', rectPath(options.x, options.y, options.w, options.h), options.fill ?? ctx.pal.surfaceAlt, {
      role: 'background',
      cut: true,
      label: 'Title band',
      opacity: 0.9,
    }),
  ];
  if (options.rule !== undefined) {
    nodes.push(
      ink(ctx, 'title-band-rule', polygonPath([[options.x, options.y + options.h], [options.x + options.w, options.y + options.h]], false), 'none', {
        stroke: { color: options.rule, width: 0.6, ...(options.dashes ? { dash: [3, 2] } : {}) },
        role: 'accents',
      }),
    );
  }
  return nodes;
}

/** Corner ribbon (diagonal band with a fold) used on badge templates. */
export function cornerRibbon(
  ctx: ArtCtx,
  options: { w: number; h: number; size: number; corner: 'tl' | 'tr' | 'bl' | 'br'; fill: string; fold?: string; text?: string },
): SceneNode[] {
  const size = options.size;
  const points: Point[] =
    options.corner === 'tl'
      ? [[0, 0], [size, 0], [0, size]]
      : options.corner === 'tr'
        ? [[options.w - size, 0], [options.w, 0], [options.w, size]]
        : options.corner === 'bl'
          ? [[0, options.h], [0, options.h - size], [size, options.h]]
          : [[options.w, options.h], [options.w, options.h - size], [options.w - size, options.h]];
  return [
    ink(ctx, 'corner-ribbon', polygonPath(points), options.fill, { role: 'accents', cut: true, label: 'Corner ribbon' }),
    ink(ctx, 'corner-fold', polygonPath([points[1]!, points[2]!, [points[1]![0], points[2]![1]]]), options.fold ?? ctx.pal.shadow, {
      role: 'accents',
      opacity: 0.25,
    }),
  ];
}

/** Repeating scalloped edge along one side of the canvas (paper doily). */
export function doilyEdge(
  ctx: ArtCtx,
  options: { w: number; y: number; count?: number; fill?: Paint; flip?: boolean },
): SceneNode[] {
  const count = options.count ?? 13;
  const r = options.w / count / 2;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = (options.w / count) * (i + 0.5);
    nodes.push(
      ink(ctx, 'doily', circlePath(x, options.y, r * 0.98), options.fill ?? ctx.pal.surface, {
        role: 'background',
        cut: true,
        label: 'Doily edge',
        opacity: 0.95,
      }),
    );
  }
  nodes.push(
    ink(ctx, 'doily-base', rectPath(0, options.flip ? options.y : options.y - r * 2, options.w, r * 2), options.fill ?? ctx.pal.surface, {
      role: 'background',
      cut: true,
      opacity: 0.95,
    }),
  );
  return [group(nodes, { id: ctx.id('doily'), role: 'background', material: ctx.material, label: 'Doily' })];
}

/** Circular halo plate — an extra paper backing for a circular topper. */
export function haloPlate(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; ringColor?: string; ringWidth?: number },
): SceneNode[] {
  const nodes: SceneNode[] = [
    ink(ctx, 'halo', circlePath(options.cx, options.cy, options.r), options.fill ?? ctx.pal.surface, {
      role: 'backing',
      cut: true,
      label: 'Halo plate',
    }),
  ];
  if (options.ringColor) {
    nodes.push(
      ink(ctx, 'halo-ring', ringPath(options.cx, options.cy, options.r, options.r - (options.ringWidth ?? 2.4)), options.ringColor, {
        role: 'accents',
        fillRule: 'evenodd',
      }),
    );
  }
  return nodes;
}

/** Star medallion scatter for the corners of square compositions. */
export function cornerStars(
  ctx: ArtCtx,
  options: { w: number; h: number; inset?: number; r?: number; color?: string },
): SceneNode[] {
  const inset = options.inset ?? options.w * 0.13;
  const r = options.r ?? options.w * 0.03;
  const color = options.color ?? ctx.pal.secondarySoft;
  const points: [number, number][] = [
    [inset, inset],
    [options.w - inset, inset],
    [inset, options.h - inset],
    [options.w - inset, options.h - inset],
  ];
  const nodes: SceneNode[] = points.map(([x, y], i) =>
    ink(ctx, 'corner-star', starPath(x, y, i % 2 === 0 ? r : r * 0.72, r * 0.4, 5), color, { role: 'accents', opacity: 0.95 }),
  );
  nodes.push(ink(ctx, 'corner-dot', circlePath(options.w * 0.5, options.h * 0.06, r * 0.28), color, { role: 'accents', opacity: 0.8 }));
  return nodes;
}

export { starrySky, bubbles, waveBandPath, polar, TAU, roundedRectPath, type Point };
