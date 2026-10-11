/**
 * @mazi/cake-atelier — decorative system
 *
 * The house style: layered cardstock. Every decoration is a small stack of flat
 * shapes with one accent detail, drawn inside a single bounding box so templates
 * can place it without measuring.
 *
 * These are the pieces that make 60 templates feel like one studio: scalloped
 * discs, pearls, bunting, garlands, foliage, arches and the nameplate family.
 */

import {
  arcPath,
  rotationMatrix,
  burstPath,
  circlePath,
  cloudPath,
  distributeOnArc,
  ellipsePath,
  heartPath,
  leafPath,
  petalPath,
  polar,
  polygonPath,
  rectPath,
  ringPath,
  round,
  roundedRectPath,
  scallopCirclePath,
  smoothClosedPath,
  starPath,
  TAU,
  type Point,
} from '../geometry.js';
import { foilGradient, mix, shade, type PaletteTokens } from '../palettes.js';
import { group, type GroupNode, type Paint, type SceneNode, type ShapeNode } from '../scene.js';
import { ink, line, stack, type ArtCtx } from './helpers.js';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const boxCenter = (b: Box): Point => [b.x + b.w / 2, b.y + b.h / 2];

/* ------------------------------------------------------------------ */
/* Backing plates & frames                                             */
/* ------------------------------------------------------------------ */

/** Concentric paper backings — the physical "stack" under a topper. */
export function paperStack(
  ctx: ArtCtx,
  b: Box,
  options: { inset?: number; layers?: number; radius?: number; tones?: [string, string, string] } = {},
): SceneNode[] {
  const layers = options.layers ?? 2;
  const tones: [string, string, string] = options.tones ?? [
    shade(ctx.pal.backgroundDeep, -0.06),
    ctx.pal.surfaceAlt,
    ctx.pal.surface,
  ];
  const nodes: SceneNode[] = [];
  for (let i = layers; i >= 1; i -= 1) {
    const inset = (options.inset ?? 2.4) * i;
    const tone = tones[Math.min(i - 1, tones.length - 1)]!;
    nodes.push(
      ink(
        ctx,
        'paper',
        roundedRectPath(b.x - inset, b.y - inset, b.w + inset * 2, b.h + inset * 2, (options.radius ?? 4) + i),
        tone,
        { material: `${ctx.material}-back`, role: 'backing', cut: true, label: 'Backing plate' },
      ),
    );
  }
  return nodes;
}

/** Double rule + corner ornaments — the "editorial" frame. */
export function frameCorners(
  ctx: ArtCtx,
  b: Box,
  options: { gap?: number; color?: string; thickness?: number; corner?: 'leaf' | 'dot' | 'bracket' } = {},
): SceneNode[] {
  const gap = options.gap ?? 3;
  const color = options.color ?? ctx.pal.outline;
  const t = options.thickness ?? 0.7;
  const x0 = b.x;
  const y0 = b.y;
  const x1 = b.x + b.w;
  const y1 = b.y + b.h;
  const nodes: SceneNode[] = [
    ink(ctx, 'frame-outer', rectPath(x0, y0, b.w, b.h), 'none', {
      stroke: { color, width: t },
      role: 'accents',
    }),
    ink(ctx, 'frame-inner', rectPath(x0 + gap, y0 + gap, b.w - gap * 2, b.h - gap * 2), 'none', {
      stroke: { color, width: t * 0.5 },
      role: 'accents',
    }),
  ];
  const corner = options.corner ?? 'leaf';
  const corners: [number, number, number][] = [
    [x0 + gap, y0 + gap, 0],
    [x1 - gap, y0 + gap, Math.PI / 2],
    [x1 - gap, y1 - gap, Math.PI],
    [x0 + gap, y1 - gap, -Math.PI / 2],
  ];
  for (const [cx, cy, angle] of corners) {
    if (corner === 'dot') {
      nodes.push(ink(ctx, 'corner-dot', circlePath(cx, cy, t * 2.4), color, { role: 'accents' }));
    } else if (corner === 'bracket') {
      const p: Point[] = [
        [cx, cy + 5.5],
        [cx, cy],
        [cx + 5.5, cy],
      ];
      nodes.push(
        ink(ctx, 'corner-bracket', polygonPath(p, false), 'none', {
          stroke: { color, width: t * 1.1, join: 'miter' },
          role: 'accents',
        }),
      );
    } else {
      nodes.push(
        ink(ctx, 'corner-leaf', leafPath(cx + 2.2, cy + 2.2, 7, 2.1, angle + Math.PI * 0.75), color, {
          role: 'accents',
          opacity: 0.9,
        }),
      );
    }
  }
  return nodes;
}

/** Minimal arch — the modern "boho" frame used by luxury minimalist designs. */
export function archFrame(
  ctx: ArtCtx,
  b: Box,
  options: { stroke: string; width?: number; fill?: Paint; cap?: boolean } = { stroke: '#000' },
): SceneNode[] {
  const r = b.w / 2;
  const straight = Math.max(0, b.h - r);
  const d = [
    `M ${round(b.x)} ${round(b.y + b.h)}`,
    `L ${round(b.x)} ${round(b.y + r)}`,
    ...(() => {
      const segs: string[] = [];
      const steps = 8;
      for (let i = 0; i < steps; i += 1) {
        const a0 = Math.PI + (i / steps) * Math.PI;
        const a1 = Math.PI + ((i + 1) / steps) * Math.PI;
        const k = (4 / 3) * Math.tan((a1 - a0) / 4);
        const p0 = polar(b.x + r, b.y + r, r, a0);
        const p1 = polar(b.x + r, b.y + r, r, a1);
        segs.push(
          `C ${round(p0[0] - k * r * Math.sin(a0))} ${round(p0[1] + k * r * Math.cos(a0))} ` +
            `${round(p1[0] + k * r * Math.sin(a1))} ${round(p1[1] - k * r * Math.cos(a1))} ${round(p1[0])} ${round(p1[1])}`,
        );
      }
      return segs;
    })().join(' '),
    `L ${round(b.x + b.w)} ${round(b.y + b.h)}`,
  ].join(' ');
  void straight;
  return [
    ink(ctx, 'arch', d, options.fill ?? 'none', {
      stroke: { color: options.stroke, width: options.width ?? 1.2, cap: options.cap === false ? 'butt' : 'round' },
      role: 'accents',
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Medallions, badges and discs                                        */
/* ------------------------------------------------------------------ */

export interface MedallionOptions {
  cx: number;
  cy: number;
  r: number;
  petals?: number;
  /** Ring thicknesses, outer first. */
  rings?: number[];
  center?: Paint;
  /** Optional icon drawn inside the centre. */
  icon?: SceneNode[];
  pearls?: boolean;
}

/** Scalloped paper medallion — the single most reusable premium element. */
export function medallion(ctx: ArtCtx, options: MedallionOptions): GroupNode {
  const { cx, cy, r } = options;
  const rings = options.rings ?? [0.14, 0.1];
  const nodes: SceneNode[] = [];
  nodes.push(
    ink(ctx, 'medallion-scallop', scallopCirclePath(cx, cy, r, options.petals ?? 18, 0.055), ctx.pal.surfaceAlt, {
      label: 'Scalloped backing',
      cut: true,
    }),
  );
  nodes.push(
    ink(ctx, 'medallion-disc', circlePath(cx, cy, r * 0.93), ctx.pal.surface, { label: 'Medallion disc', cut: true }),
  );
  let cursor = 0.93;
  for (let i = 0; i < rings.length; i += 1) {
    const width = rings[i]!;
    const color = i % 2 === 0 ? ctx.pal.primary : ctx.pal.accent;
    nodes.push(ink(ctx, 'medallion-ring', ringPath(cx, cy, r * cursor, r * (cursor - width)), color, { fillRule: 'evenodd' }));
    cursor -= width;
  }
  nodes.push(
    ink(ctx, 'medallion-center', circlePath(cx, cy, r * Math.max(0.08, cursor)), options.center ?? ctx.pal.accentSoft),
  );
  if (options.pearls) {
    const pearls: SceneNode[] = [];
    for (let i = 0; i < 24; i += 1) {
      const p = polar(cx, cy, r * 0.965, (i / 24) * TAU);
      pearls.push(ink(ctx, 'pearl', circlePath(p[0], p[1], r * 0.022), ctx.pal.highlight));
    }
    nodes.push(group(pearls, { id: ctx.id('pearl-ring'), role: 'accents', material: ctx.material }));
  }
  if (options.icon) nodes.push(...options.icon);
  return group(nodes, { id: ctx.id('medallion'), role: 'illustration', material: ctx.material, label: 'Medallion' });
}

/** Circular age badge with a ring and a scallop — text is added by the template. */
export function ageBadge(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; ring?: string; petals?: number },
): SceneNode[] {
  const { cx, cy, r } = options;
  return [
    ink(ctx, 'age-scallop', scallopCirclePath(cx, cy, r * 1.12, options.petals ?? 20, 0.07), ctx.pal.accentSoft, {
      role: 'age',
      cut: true,
      label: 'Age badge backing',
    }),
    ink(ctx, 'age-disc', circlePath(cx, cy, r), options.fill ?? ctx.pal.surface, {
      role: 'age',
      cut: true,
      label: 'Age badge',
    }),
    ink(ctx, 'age-ring', ringPath(cx, cy, r, r * 0.86), options.ring ?? ctx.pal.secondary, {
      role: 'age',
      fillRule: 'evenodd',
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Nameplates                                                          */
/* ------------------------------------------------------------------ */

export type NameplateStyle =
  | 'ribbon'
  | 'oval'
  | 'arch'
  | 'shield'
  | 'pennant'
  | 'plaque'
  | 'minimal'
  | 'hexagon'
  | 'scallop'
  | 'ticket';

export interface NameplateOptions {
  style: NameplateStyle;
  box: Box;
  fill?: Paint;
  edge?: string;
  accent?: Paint;
  /** Extra tail/fold decorations for ribbon styles. */
  tails?: boolean;
}

/**
 * Drawn around a declared text region, so the plate always matches the space the
 * auto-fit engine measured. Padding is added *outside* the region.
 */
export function nameplate(ctx: ArtCtx, options: NameplateOptions): SceneNode[] {
  const pad = 4.6;
  const b: Box = { x: options.box.x - pad, y: options.box.y - pad, w: options.box.w + pad * 2, h: options.box.h + pad * 2 };
  const fill = options.fill ?? ctx.pal.nameplate;
  const edge = options.edge ?? ctx.pal.nameplateEdge;
  const accent = options.accent ?? ctx.pal.secondary;
  const nodes: SceneNode[] = [];

  switch (options.style) {
    case 'ribbon': {
      nodes.push(
        ink(ctx, 'plate-body', rectPath(b.x, b.y, b.w, b.h), fill, { role: 'nameplate', cut: true, label: 'Name ribbon' }),
        ink(ctx, 'plate-top', rectPath(b.x, b.y, b.w, b.h * 0.26), accent, { role: 'nameplate' }),
      );
      if (options.tails !== false) {
        const t = b.h * 0.5;
        const left: Point[] = [
          [b.x, b.y + b.h * 0.5],
          [b.x - 8, b.y + b.h * 0.5 - t * 0.6],
          [b.x - 3, b.y + b.h * 0.5],
          [b.x - 8, b.y + b.h * 0.5 + t * 0.6],
        ];
        const right: Point[] = [
          [b.x + b.w, b.y + b.h * 0.5],
          [b.x + b.w + 8, b.y + b.h * 0.5 - t * 0.6],
          [b.x + b.w + 3, b.y + b.h * 0.5],
          [b.x + b.w + 8, b.y + b.h * 0.5 + t * 0.6],
        ];
        nodes.push(
          ink(ctx, 'plate-tail', polygonPath(left), shade(fill === 'none' ? ctx.pal.surface : String(fill), -0.08), {
            role: 'nameplate',
            cut: true,
          }),
          ink(ctx, 'plate-tail', polygonPath(right), shade(fill === 'none' ? ctx.pal.surface : String(fill), -0.08), {
            role: 'nameplate',
            cut: true,
          }),
        );
      }
      break;
    }
    case 'oval': {
      nodes.push(
        ink(ctx, 'plate-outer', ellipsePath(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2), edge, {
          role: 'nameplate',
          cut: true,
          label: 'Oval nameplate',
        }),
        ink(ctx, 'plate-inner', ellipsePath(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 - 1.8, b.h / 2 - 1.8), fill, {
          role: 'nameplate',
        }),
      );
      break;
    }
    case 'arch': {
      const r = b.w / 2;
      const d = [
        `M ${round(b.x)} ${round(b.y + b.h)}`,
        `L ${round(b.x)} ${round(b.y + r)}`,
        `A ${round(r)} ${round(r)} 0 0 1 ${round(b.x + b.w)} ${round(b.y + r)}`,
        `L ${round(b.x + b.w)} ${round(b.y + b.h)} Z`,
      ].join(' ');
      nodes.push(
        ink(ctx, 'plate-outer', d, edge, { role: 'nameplate', cut: true, label: 'Arch nameplate' }),
        ink(
          ctx,
          'plate-inner',
          [
            `M ${round(b.x + 2.2)} ${round(b.y + b.h - 1.4)}`,
            `L ${round(b.x + 2.2)} ${round(b.y + r)}`,
            `A ${round(r - 2.2)} ${round(r - 2.2)} 0 0 1 ${round(b.x + b.w - 2.2)} ${round(b.y + r)}`,
            `L ${round(b.x + b.w - 2.2)} ${round(b.y + b.h - 1.4)} Z`,
          ].join(' '),
          fill,
          { role: 'nameplate' },
        ),
      );
      break;
    }
    case 'shield': {
      const notch = b.w * 0.16;
      const d = [
        `M ${round(b.x)} ${round(b.y)}`,
        `L ${round(b.x + b.w)} ${round(b.y)}`,
        `L ${round(b.x + b.w)} ${round(b.y + b.h * 0.55)}`,
        `Q ${round(b.x + b.w)} ${round(b.y + b.h)} ${round(b.x + b.w / 2)} ${round(b.y + b.h)}`,
        `Q ${round(b.x)} ${round(b.y + b.h)} ${round(b.x)} ${round(b.y + b.h * 0.55)} Z`,
      ].join(' ');
      nodes.push(
        ink(ctx, 'plate-outer', d, edge, { role: 'nameplate', cut: true, label: 'Shield nameplate' }),
        ink(
          ctx,
          'plate-inner',
          [
            `M ${round(b.x + 2.4)} ${round(b.y + 2.4)}`,
            `L ${round(b.x + b.w - 2.4)} ${round(b.y + 2.4)}`,
            `L ${round(b.x + b.w - 2.4)} ${round(b.y + b.h * 0.55)}`,
            `Q ${round(b.x + b.w - 2.4)} ${round(b.y + b.h - 2.4)} ${round(b.x + b.w / 2)} ${round(b.y + b.h - 2.4)}`,
            `Q ${round(b.x + 2.4)} ${round(b.y + b.h - 2.4)} ${round(b.x + 2.4)} ${round(b.y + b.h * 0.55)} Z`,
          ].join(' '),
          fill,
          { role: 'nameplate' },
        ),
      );
      void notch;
      break;
    }
    case 'pennant': {
      const d = polygonPath([
        [b.x, b.y],
        [b.x + b.w, b.y],
        [b.x + b.w - b.h * 0.35, b.y + b.h / 2],
        [b.x + b.w, b.y + b.h],
        [b.x, b.y + b.h],
      ]);
      nodes.push(
        ink(ctx, 'plate-outer', d, edge, { role: 'nameplate', cut: true, label: 'Pennant nameplate' }),
        ink(
          ctx,
          'plate-inner',
          polygonPath([
            [b.x + 2, b.y + 2],
            [b.x + b.w - 3, b.y + 2],
            [b.x + b.w - 3 - b.h * 0.3, b.y + b.h / 2],
            [b.x + b.w - 3, b.y + b.h - 2],
            [b.x + 2, b.y + b.h - 2],
          ]),
          fill,
          { role: 'nameplate' },
        ),
      );
      break;
    }
    case 'plaque': {
      nodes.push(
        ink(ctx, 'plate-outer', roundedRectPath(b.x, b.y, b.w, b.h, Math.min(b.h / 2, 8)), edge, {
          role: 'nameplate',
          cut: true,
          label: 'Name plaque',
        }),
        ink(ctx, 'plate-inner', roundedRectPath(b.x + 2.2, b.y + 2.2, b.w - 4.4, b.h - 4.4, Math.min(b.h / 2, 6.4)), fill, {
          role: 'nameplate',
        }),
      );
      break;
    }
    case 'minimal': {
      nodes.push(
        ink(ctx, 'plate-rule-top', polygonPath([[b.x, b.y], [b.x + b.w, b.y]], false), 'none', {
          stroke: { color: edge, width: 0.7 },
          role: 'nameplate',
        }),
        ink(ctx, 'plate-rule-bottom', polygonPath([[b.x, b.y + b.h], [b.x + b.w, b.y + b.h]], false), 'none', {
          stroke: { color: edge, width: 0.7 },
          role: 'nameplate',
        }),
      );
      nodes.push(ink(ctx, 'plate-diamond', starPath(b.x, b.y, 1.5, 0.7, 4), accent, { role: 'nameplate' }));
      nodes.push(ink(ctx, 'plate-diamond', starPath(b.x + b.w, b.y, 1.5, 0.7, 4), accent, { role: 'nameplate' }));
      break;
    }
    case 'hexagon': {
      const c = 8;
      const d = polygonPath([
        [b.x + c, b.y],
        [b.x + b.w - c, b.y],
        [b.x + b.w, b.y + b.h / 2],
        [b.x + b.w - c, b.y + b.h],
        [b.x + c, b.y + b.h],
        [b.x, b.y + b.h / 2],
      ]);
      nodes.push(
        ink(ctx, 'plate-outer', d, edge, { role: 'nameplate', cut: true, label: 'Hexagon nameplate' }),
        ink(
          ctx,
          'plate-inner',
          polygonPath([
            [b.x + c - 1, b.y + 2],
            [b.x + b.w - c + 1, b.y + 2],
            [b.x + b.w - 2, b.y + b.h / 2],
            [b.x + b.w - c + 1, b.y + b.h - 2],
            [b.x + c - 1, b.y + b.h - 2],
            [b.x + 2, b.y + b.h / 2],
          ]),
          fill,
          { role: 'nameplate' },
        ),
      );
      break;
    }
    case 'scallop': {
      nodes.push(
        ink(ctx, 'plate-outer', roundedRectPath(b.x, b.y, b.w, b.h, Math.min(b.h / 2, 9)), edge, {
          role: 'nameplate',
          cut: true,
          label: 'Scalloped plaque',
        }),
        ink(ctx, 'plate-inner', roundedRectPath(b.x + 2, b.y + 2, b.w - 4, b.h - 4, Math.min(b.h / 2, 7)), fill, {
          role: 'nameplate',
        }),
      );
      const dots = 9;
      for (let i = 0; i < dots; i += 1) {
        const t = 0.5 + i / (dots - 1);
        nodes.push(
          ink(ctx, 'plate-stud', circlePath(b.x + b.w * (0.5 + (t - 0.5) * 0.94), b.y + 1.1, 0.62), accent, {
            role: 'accents',
          }),
        );
        nodes.push(
          ink(ctx, 'plate-stud', circlePath(b.x + b.w * (0.5 + (t - 0.5) * 0.94), b.y + b.h - 1.1, 0.62), accent, {
            role: 'accents',
          }),
        );
      }
      break;
    }
    case 'ticket':
    default: {
      const fold = 6;
      nodes.push(
        ink(ctx, 'plate-outer', rectPath(b.x, b.y, b.w, b.h), edge, { role: 'nameplate', cut: true, label: 'Ticket nameplate' }),
        ink(ctx, 'plate-inner', rectPath(b.x + 1.6, b.y + 1.6, b.w - 3.2, b.h - 3.2), fill, { role: 'nameplate' }),
        ink(ctx, 'plate-fold', polygonPath([[b.x, b.y], [b.x + fold, b.y], [b.x, b.y + fold]]), shade(edge, -0.15), {
          role: 'accents',
        }),
        ink(ctx, 'plate-fold', polygonPath([[b.x + b.w, b.y + b.h], [b.x + b.w - fold, b.y + b.h], [b.x + b.w, b.y + b.h - fold]]), shade(edge, -0.15), {
          role: 'accents',
        }),
      );
      break;
    }
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Garlands, bunting, bows                                             */
/* ------------------------------------------------------------------ */

export function bunting(
  ctx: ArtCtx,
  options: { cx: number; y: number; width: number; sag?: number; flags?: number; colors?: string[]; alternate?: boolean },
): SceneNode[] {
  const flags = options.flags ?? 7;
  const sag = options.sag ?? 9;
  const colors = options.colors ?? [ctx.pal.primary, ctx.pal.secondary, ctx.pal.accent, ctx.pal.primarySoft];
  const nodes: SceneNode[] = [];
  const left = options.cx - options.width / 2;
  nodes.push(
    ink(
      ctx,
      'bunting-string',
      `M ${round(left)} ${round(options.y)} Q ${round(options.cx)} ${round(options.y + sag * 2)} ${round(left + options.width)} ${round(options.y)}`,
      'none',
      { stroke: { color: ctx.pal.outline, width: 0.5 }, role: 'accents' },
    ),
  );
  for (let i = 0; i < flags; i += 1) {
    const t = (i + 0.5) / flags;
    const px = left + options.width * t;
    const py = options.y + 2 * sag * t * (1 - t) * 1.6;
    const color = colors[i % colors.length]!;
    nodes.push(
      ink(
        ctx,
        'bunting-flag',
        polygonPath([
          [px - 4.2, py],
          [px + 4.2, py],
          [px, py + 9.5],
        ]),
        color,
        { role: 'accents', cut: true, label: 'Bunting flag' },
      ),
    );
  }
  return nodes;
}

/** Symmetrical ribbon bow. */
export function ribbonBow(
  ctx: ArtCtx,
  options: { cx: number; cy: number; size: number; fill?: Paint; edge?: string; tails?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, size } = options;
  const fill = options.fill ?? ctx.pal.accent;
  const edge = options.edge ?? ctx.pal.accentDeep;
  const nodes: SceneNode[] = [];
  const loop = (dir: 1 | -1) =>
    smoothClosedPath([
      [cx, cy],
      [cx + dir * size * 0.75, cy - size * 0.6],
      [cx + dir * size * 1.15, cy - size * 0.05],
      [cx + dir * size * 0.8, cy + size * 0.55],
      [cx, cy + size * 0.2],
    ]);
  nodes.push(
    ink(ctx, 'bow-loop', loop(-1), fill, { role: 'accents', cut: true, label: 'Bow loop', material: options.material }),
    ink(ctx, 'bow-loop', loop(1), fill, { role: 'accents', cut: true, material: options.material }),
  );
  if (options.tails !== false) {
    nodes.push(
      ink(
        ctx,
        'bow-tail',
        smoothClosedPath([
          [cx - size * 0.06, cy + size * 0.12],
          [cx - size * 0.5, cy + size * 1.15],
          [cx - size * 0.15, cy + size * 1.05],
          [cx - size * 0.02, cy + size * 1.5],
          [cx + size * 0.12, cy + size * 0.9],
        ]),
        edge,
        { role: 'accents', cut: true, material: options.material },
      ),
      ink(
        ctx,
        'bow-tail',
        smoothClosedPath([
          [cx + size * 0.06, cy + size * 0.12],
          [cx + size * 0.55, cy + size * 1.05],
          [cx + size * 0.2, cy + size * 1.0],
          [cx + size * 0.06, cy + size * 1.45],
          [cx - size * 0.08, cy + size * 0.9],
        ]),
        edge,
        { role: 'accents', cut: true, material: options.material },
      ),
    );
  }
  nodes.push(ink(ctx, 'bow-knot', ellipsePath(cx, cy + size * 0.05, size * 0.22, size * 0.3), edge, { role: 'accents' }));
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Foliage, flowers, wreaths                                           */
/* ------------------------------------------------------------------ */

export function leafBranch(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    length: number;
    angle?: number;
    leaves?: number;
    fill?: string;
    stroke?: string;
    stems?: boolean;
    material?: string;
  },
): SceneNode[] {
  const angle = options.angle ?? -Math.PI / 2;
  const count = options.leaves ?? 5;
  const fill = options.fill ?? ctx.pal.foliage;
  const nodes: SceneNode[] = [];
  const stemColor = options.stroke ?? ctx.pal.foliageDeep;
  const tip = polar(options.cx, options.cy, options.length, angle);
  nodes.push(
    ink(
      ctx,
      'branch-stem',
      `M ${round(options.cx)} ${round(options.cy)} Q ${round((options.cx + tip[0]) / 2 + 3)} ${round((options.cy + tip[1]) / 2)} ${round(tip[0])} ${round(tip[1])}`,
      'none',
      { stroke: { color: stemColor, width: 0.7, cap: 'round' }, role: 'accents', material: options.material },
    ),
  );
  for (let i = 0; i < count; i += 1) {
    const t = (i + 1) / (count + 1);
    const p = polar(options.cx, options.cy, options.length * t, angle);
    const side = i % 2 === 0 ? 1 : -1;
    nodes.push(
      ink(
        ctx,
        'branch-leaf',
        leafPath(p[0], p[1], options.length * 0.34, options.length * 0.11, angle + side * (Math.PI / 2.6)),
        fill,
        { role: 'accents', material: options.material, label: 'Leaf' },
      ),
    );
  }
  return nodes;
}

export function flower(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    r: number;
    petals?: number;
    petalFill?: Paint;
    centerFill?: Paint;
    centerR?: number;
    style?: 'round' | 'pointed' | 'daisy';
    material?: string;
  },
): SceneNode[] {
  const petals = options.petals ?? 6;
  const style = options.style ?? 'round';
  const nodes: SceneNode[] = [];
  for (let i = 0; i < petals; i += 1) {
    const a = (i / petals) * TAU;
    const d =
      style === 'pointed'
        ? petalPath(options.cx, options.cy, options.r, options.r * 0.3, a)
        : style === 'daisy'
          ? ellipsePath(...(polar(options.cx, options.cy, options.r * 0.55, a) as [number, number]), options.r * 0.3, options.r * 0.5)
          : petalPath(options.cx, options.cy, options.r * 1.02, options.r * 0.46, a);
    // Rotate flat petal shapes for the daisy variant.
    nodes.push(
      ink(ctx, 'flower-petal', d, options.petalFill ?? ctx.pal.primarySoft, {
        role: 'accents',
        material: options.material,
        ...(style === 'daisy' ? { transform: rotationMatrix(a + Math.PI / 2, ...(polar(options.cx, options.cy, options.r * 0.55, a) as [number, number])) } : {}),
      }),
    );
  }
  nodes.push(
    ink(ctx, 'flower-center', circlePath(options.cx, options.cy, options.centerR ?? options.r * 0.34), options.centerFill ?? ctx.pal.accent, {
      role: 'accents',
      material: options.material,
    }),
  );
  return nodes;
}

/** Laurel wreath — leaves around an arc, used for prestige and luxury plates. */
export function wreath(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    r: number;
    from?: number;
    to?: number;
    leaves?: number;
    fill?: string;
    leafLength?: number;
    open?: boolean;
  },
): SceneNode[] {
  const from = options.from ?? Math.PI * 0.78;
  const to = options.to ?? Math.PI * 2.22;
  const leaves = options.leaves ?? 18;
  const fill = options.fill ?? ctx.pal.foliage;
  const nodes: SceneNode[] = [];
  nodes.push(
    ink(ctx, 'wreath-stem', arcPath(options.cx, options.cy, options.r, options.r, from, to), 'none', {
      stroke: { color: ctx.pal.foliageDeep, width: 0.6, cap: 'round' },
      role: 'accents',
    }),
  );
  for (let i = 0; i < leaves; i += 1) {
    const t = leaves === 1 ? 0.5 : i / (leaves - 1);
    const a = from + (to - from) * t;
    const p = polar(options.cx, options.cy, options.r, a);
    const len = options.leafLength ?? options.r * 0.42;
    nodes.push(
      ink(ctx, 'wreath-leaf', leafPath(p[0], p[1], len, len * 0.42, a + Math.PI / 2 - 0.35), i % 3 === 0 ? ctx.pal.foliageDeep : fill, {
        role: 'accents',
        material: ctx.material,
      }),
    );
    const inner = polar(options.cx, options.cy, options.r, a - 0.16);
    nodes.push(
      ink(ctx, 'wreath-leaf', leafPath(inner[0], inner[1], len * 0.82, len * 0.36, a - Math.PI / 2 + 0.4), i % 4 === 0 ? ctx.pal.foliageDeep : fill, {
        role: 'accents',
        material: ctx.material,
      }),
    );
  }
  void options.open;
  return nodes;
}

/** Twisting vine with small leaves — soft baby/nursery decoration. */
export function vine(
  ctx: ArtCtx,
  options: { x: number; y: number; width: number; amplitude?: number; waves?: number; leaves?: boolean; color?: string },
): SceneNode[] {
  const waves = options.waves ?? 3;
  const amp = options.amplitude ?? 3.4;
  const seg = options.width / waves;
  const parts: string[] = [`M ${round(options.x)} ${round(options.y)}`];
  for (let i = 0; i < waves; i += 1) {
    const x0 = options.x + i * seg;
    parts.push(`C ${round(x0 + seg * 0.3)} ${round(options.y - amp)} ${round(x0 + seg * 0.7)} ${round(options.y + amp)} ${round(x0 + seg)} ${round(options.y)}`);
  }
  const nodes: SceneNode[] = [
    ink(ctx, 'vine', parts.join(' '), 'none', { stroke: { color: options.color ?? ctx.pal.foliageDeep, width: 0.55, cap: 'round' }, role: 'accents' }),
  ];
  if (options.leaves !== false) {
    for (let i = 0; i < waves * 2 + 1; i += 1) {
      const t = i / (waves * 2);
      const x = options.x + options.width * t;
      const y = options.y + Math.sin(t * Math.PI * waves) * amp * -0.6;
      const dir = i % 2 === 0 ? 1 : -1;
      nodes.push(
        ink(ctx, 'vine-leaf', leafPath(x, y, 3.4, 1.5, dir > 0 ? -0.9 : -2.2), ctx.pal.foliage, {
          role: 'accents',
          material: ctx.material,
        }),
      );
    }
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Sky, stars, confetti                                                */
/* ------------------------------------------------------------------ */

export function starCluster(
  ctx: ArtCtx,
  options: { points: [number, number][]; r?: number; fill?: Paint; material?: string; spike?: number },
): SceneNode[] {
  const r = options.r ?? 3;
  return options.points.map(([x, y]) =>
    ink(ctx, 'star', starPath(x, y, r, r * (options.spike ?? 0.42), 5), options.fill ?? ctx.pal.highlight, {
      role: 'accents',
      material: options.material,
      label: 'Star',
    }),
  );
}

export function sparkle(ctx: ArtCtx, options: { cx: number; cy: number; r: number; fill?: Paint }): SceneNode[] {
  const { cx, cy, r } = options;
  const d = polygonPath([
    [cx, cy - r],
    [cx + r * 0.26, cy - r * 0.26],
    [cx + r, cy],
    [cx + r * 0.26, cy + r * 0.26],
    [cx, cy + r],
    [cx - r * 0.26, cy + r * 0.26],
    [cx - r, cy],
    [cx - r * 0.26, cy - r * 0.26],
  ]);
  return [ink(ctx, 'sparkle', d, options.fill ?? ctx.pal.highlight, { role: 'accents' })];
}

/** Deterministic confetti field inside a box. */
export function confetti(
  ctx: ArtCtx,
  options: { box: Box; count?: number; colors?: string[]; rand: () => number; size?: number; layer?: 'accents' | 'secondary' },
): SceneNode[] {
  const count = options.count ?? 26;
  const colors = options.colors ?? [ctx.pal.primary, ctx.pal.secondary, ctx.pal.accent, ctx.pal.primarySoft, ctx.pal.accentSoft];
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = options.box.x + options.rand() * options.box.w;
    const y = options.box.y + options.rand() * options.box.h;
    const size = (options.size ?? 3.4) * (0.6 + options.rand() * 0.8);
    const kind = options.rand();
    const color = colors[Math.floor(options.rand() * colors.length) % colors.length]!;
    if (kind < 0.34) {
      nodes.push(ink(ctx, 'confetti-dot', circlePath(x, y, size * 0.3), color, { role: options.layer ?? 'accents', opacity: 0.9 }));
    } else if (kind < 0.68) {
      nodes.push(
        ink(
          ctx,
          'confetti-star',
          starPath(x, y, size * 0.55, size * 0.24, 5),
          color,
          { role: options.layer ?? 'accents' },
        ),
      );
    } else {
      nodes.push(
        ink(ctx, 'confetti-ribbon', roundedRectPath(x - size * 0.6, y - size * 0.16, size * 1.2, size * 0.32, size * 0.16), color, {
          role: options.layer ?? 'accents',
          transform: rotationMatrix(kind * 3, x, y),
        }),
      );
    }
  }
  return nodes;
}

/** Polka dot grid — quiet nursery texture. */
export function dotGrid(
  ctx: ArtCtx,
  options: { box: Box; step?: number; r?: number; color?: string; opacity?: number },
): SceneNode[] {
  const step = options.step ?? 11;
  const r = options.r ?? 1.5;
  const nodes: SceneNode[] = [];
  for (let y = options.box.y; y <= options.box.y + options.box.h; y += step) {
    for (let x = options.box.x; x <= options.box.x + options.box.w; x += step) {
      const offset = Math.round((y - options.box.y) / step) % 2 === 0 ? 0 : step / 2;
      nodes.push(
        ink(ctx, 'dot', circlePath(x + offset, y, r), options.color ?? ctx.pal.primarySoft, {
          role: 'background',
          opacity: options.opacity ?? 0.5,
        }),
      );
    }
  }
  return nodes;
}

/** Cloud bank of overlapping circles, with an optional flat rain base. */
export function cloud(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: Paint; shade?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const fill = options.fill ?? ctx.pal.surface;
  return [
    ink(ctx, 'cloud', cloudPath(cx, cy, w, h), fill, {
      role: options.material ? 'illustration' : 'accents',
      material: options.material,
      cut: true,
      label: 'Cloud',
    }),
    ...(options.shade
      ? [
          ink(
            ctx,
            'cloud-shade',
            cloudPath(cx + w * 0.06, cy + h * 0.16, w * 0.86, h * 0.6),
            options.shade,
            { role: 'accents', opacity: 0.5 },
          ),
        ]
      : []),
  ];
}

export function balloonCluster(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; colors: [string, string, string]; stringColor?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const nodes: SceneNode[] = [];
  const specs: [number, number, number, string][] = [
    [cx - r * 2.1, cy + r * 0.4, r, options.colors[0]],
    [cx + r * 2.1, cy + r * 0.25, r * 0.92, options.colors[1]],
    [cx, cy - r * 0.5, r * 1.12, options.colors[2]],
  ];
  for (const [bx, by, br, color] of specs) {
    const body = [
      ellipsePath(bx, by, br * 0.86, br),
      polygonPath([
        [bx - br * 0.14, by + br * 0.98],
        [bx + br * 0.14, by + br * 0.98],
        [bx, by + br * 1.18],
      ]),
    ].join(' ');
    nodes.push(ink(ctx, 'balloon', body, color, { role: 'accents', cut: true, label: 'Balloon' }));
    nodes.push(
      ink(ctx, 'balloon-string', `M ${round(bx)} ${round(by + br * 1.16)} Q ${round(bx + 2)} ${round(by + br * 2)} ${round(cx)} ${round(cy + r * 3.2)}`, 'none', {
        stroke: { color: options.stringColor ?? ctx.pal.outline, width: 0.4 },
        role: 'accents',
      }),
    );
  }
  return nodes;
}

export function heart(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: Paint; material?: string },
): SceneNode[] {
  return [
    ink(ctx, 'heart', heartPath(options.cx, options.cy, Math.min(options.w, options.h)), options.fill ?? ctx.pal.accent, {
      role: 'accents',
      material: options.material,
      cut: true,
      label: 'Heart',
    }),
  ];
}

/** Pearl chain — used on royal and princess designs. */
export function pearlChain(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; from: number; to: number; count?: number; pearlR?: number; fill?: string },
): SceneNode[] {
  const count = options.count ?? 14;
  const pearlR = options.pearlR ?? 1.5;
  const nodes: SceneNode[] = [];
  for (const p of distributeOnArc(options.cx, options.cy, options.r, options.from, options.to, count)) {
    nodes.push(
      ink(ctx, 'pearl', circlePath(p[0], p[1], pearlR), options.fill ?? ctx.pal.highlight, {
        role: 'accents',
        material: ctx.material,
      }),
    );
  }
  return nodes;
}

/** Sample a cubic curve — used to build filled foil ribbons. */
function cubicAt(p0: Point, c1: Point, c2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * p3[1],
  ];
}

/**
 * Metallic name flourish.
 *
 * Built as a filled ribbon rather than a stroked line, because the simulated
 * foil is a gradient and our render model keeps gradients on fills only — which
 * is also what makes the same shape survive the PDF and cut-layer exports.
 */
export function foilSwash(
  ctx: ArtCtx,
  options: { x: number; y: number; width: number; thickness?: number; curve?: number; material?: string; fill?: Paint },
): SceneNode[] {
  const t = options.thickness ?? 1.5;
  const curve = options.curve ?? 3;
  const p0: Point = [options.x, options.y];
  const c1: Point = [options.x + options.width * 0.3, options.y - curve * 2];
  const c2: Point = [options.x + options.width * 0.68, options.y + curve * 1.3];
  const p3: Point = [options.x + options.width, options.y - curve * 0.4];
  const steps = 14;
  const top: Point[] = [];
  const bottom: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const s = i / steps;
    const [px, py] = cubicAt(p0, c1, c2, p3, s);
    const [nx1, ny1] = cubicAt(p0, c1, c2, p3, Math.min(1, s + 0.01));
    const [nx0, ny0] = cubicAt(p0, c1, c2, p3, Math.max(0, s - 0.01));
    const dx = nx1 - nx0;
    const dy = ny1 - ny0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const taper = 0.45 + 0.55 * Math.sin(Math.PI * s);
    const w = (t * taper) / 2;
    top.push([px + nx * w, py + ny * w]);
    bottom.push([px - nx * w, py - ny * w]);
  }
  const d = smoothClosedPath([...top, ...bottom.reverse()], 0.4);
  return [
    ink(ctx, 'swash', d, options.fill ?? foilGradient(ctx.pal, [options.x, options.y], [options.x + options.width, options.y]), {
      role: 'accents',
      material: options.material,
      cut: true,
      label: 'Foil flourish',
    }),
  ];
}

/** A soft oval highlight, used sparingly as a sheen on dark plates. */
export function sheen(
  ctx: ArtCtx,
  options: { cx: number; cy: number; rx: number; ry: number; color?: string; angle?: number },
): SceneNode[] {
  const color = options.color ?? mix(ctx.pal.highlight, ctx.pal.surface, 0.4);
  return [
    ink(
      ctx,
      'sheen',
      ellipsePath(options.cx, options.cy, options.rx, options.ry),
      {
        type: 'linear',
        from: [options.cx - options.rx, options.cy - options.ry],
        to: [options.cx + options.rx, options.cy + options.ry],
        stops: [
          { offset: 0, color, opacity: 0.55 },
          { offset: 1, color, opacity: 0 },
        ],
      },
      { role: 'accents' },
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

/** Straight banner with pointed ends, for title strips and dates. */
export function banner(
  ctx: ArtCtx,
  options: { box: Box; fill?: Paint; edge?: string; notch?: number; topBand?: Paint },
): SceneNode[] {
  const { box: b } = options;
  const notch = options.notch ?? b.h * 0.42;
  const fill = options.fill ?? ctx.pal.primary;
  const d = polygonPath([
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x + b.w, b.y + b.h / 2],
    [b.x + b.w - notch, b.y + b.h],
    [b.x + notch, b.y + b.h],
    [b.x, b.y + b.h / 2],
  ]);
  const nodes: SceneNode[] = [
    ink(ctx, 'banner', d, fill, { role: 'nameplate', cut: true, label: 'Banner' }),
  ];
  if (options.topBand) {
    nodes.push(
      ink(
        ctx,
        'banner-band',
        polygonPath([
          [b.x + 0.9, b.y + 0.9],
          [b.x + b.w - 0.9, b.y + 0.9],
          [b.x + b.w - 0.9, b.y + b.h * 0.24],
          [b.x + 0.9, b.y + b.h * 0.24],
        ]),
        options.topBand,
        { role: 'nameplate' },
      ),
    );
  }
  if (options.edge) {
    nodes.push(
      ink(ctx, 'banner-edge', d, 'none', { stroke: { color: options.edge, width: 0.7 }, role: 'nameplate' }),
    );
  }
  return nodes;
}

/** Confetti burst behind a plate (celebration motion). */
export function burst(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; spikes?: number; fill?: Paint; inner?: Paint },
): SceneNode[] {
  const nodes: SceneNode[] = [];
  if (options.inner) {
    nodes.push(ink(ctx, 'burst-inner', burstPath(options.cx, options.cy, options.r * 0.72, options.r * 0.52, (options.spikes ?? 16) * 1.0), options.inner, { role: 'accents' }));
  }
  nodes.push(
    ink(ctx, 'burst', burstPath(options.cx, options.cy, options.r, options.r * 0.68, options.spikes ?? 16), options.fill ?? ctx.pal.accentSoft, {
      role: 'accents',
      cut: true,
      label: 'Burst',
    }),
  );
  return nodes;
}

/** Evenly spaced rays (sun glow / spotlight). */
export function rays(
  ctx: ArtCtx,
  options: { cx: number; cy: number; rInner: number; rOuter: number; count?: number; fill?: string; opacity?: number },
): SceneNode[] {
  const count = options.count ?? 16;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU;
    const p0 = polar(options.cx, options.cy, options.rInner, a);
    const p1 = polar(options.cx, options.cy, options.rOuter, a);
    const half = (TAU / count) * 0.22;
    const p2 = polar(options.cx, options.cy, options.rInner, a + half);
    const p3 = polar(options.cx, options.cy, options.rOuter, a + half * 0.4);
    nodes.push(
      ink(
        ctx,
        'ray',
        polygonPath([p0, p1, p3, p2]),
        options.fill ?? ctx.pal.accentSoft,
        { role: 'accents', opacity: options.opacity ?? 0.75 },
      ),
    );
  }
  return nodes;
}

/** Reusable helper so callers can keep types honest when spreading arrays. */
export function flatten(nodes: (SceneNode | SceneNode[])[]): SceneNode[] {
  return nodes.flat() as SceneNode[];
}

/** Soft drop shadow plate, layered behind a shape for the paper depth effect. */
export function shadowPlate(
  ctx: ArtCtx,
  options: { d: string; dx?: number; dy?: number; opacity?: number },
): ShapeNode {
  return ink(ctx, 'shadow', options.d, ctx.pal.shadow, {
    role: 'backing',
    opacity: options.opacity ?? 0.16,
    transform: [1, 0, 0, 1, options.dx ?? 1.4, options.dy ?? 1.8],
  });
}
