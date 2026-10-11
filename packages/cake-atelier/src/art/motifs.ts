/**
 * @mazi/cake-atelier — hero emblems and underwater motifs
 *
 * Original superhero iconography (shield, bolt, mask, skyline, cape) and the
 * ocean set (fish, turtle, octopus, shell, coral, mermaid tail, sailor hat).
 * No character is derived from any trademarked property — only broad genre
 * devices: stars, bolts, masks, bubbles and waves.
 */

import {
  arcPath,
  burstPath,
  circlePath,
  ellipsePath,
  polygonPath,
  polar,
  ringPath,
  round,
  roundedRectPath,
  smoothClosedPath,
  petalPath,
  rectPath,
  smoothPath,
  starPath,
  TAU,
  waveBandPath,
  type Point,
} from '../geometry.js';
import { mix } from '../palettes.js';
import type { Paint, SceneNode, ShapeNode } from '../scene.js';
import { group } from '../scene.js';
import { ink, type ArtCtx } from './helpers.js';
import { shadowPlate } from './decor.js';
import { eyes } from './animals.js';

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

export type EmblemShape = 'shield' | 'burst' | 'circle' | 'hex';

export function heroEmblem(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    r: number;
    shape?: EmblemShape;
    fill?: Paint;
    border?: string;
    charge?: Paint;
    chargeKind?: 'star' | 'bolt' | 'letter' | 'none';
    spikes?: number;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, r } = options;
  const shape = options.shape ?? 'shield';
  const fill = options.fill ?? ctx.pal.primary;
  const border = options.border ?? ctx.pal.accent;
  const nodes: SceneNode[] = [];
  const outerD =
    shape === 'burst'
      ? burstPath(cx, cy, r, r * 0.82, options.spikes ?? 14)
      : shape === 'circle'
        ? circlePath(cx, cy, r)
        : shape === 'hex'
          ? polygonPath(Array.from({ length: 6 }, (_, i) => polar(cx, cy, r, (i / 6) * TAU - Math.PI / 2)))
          : smoothClosedPath(
              [
                [cx - r, cy - r * 0.92],
                [cx + r, cy - r * 0.92],
                [cx + r, cy + r * 0.18],
                [cx + r * 0.82, cy + r * 0.56],
                [cx, cy + r],
                [cx - r * 0.82, cy + r * 0.56],
                [cx - r, cy + r * 0.18],
              ],
              0.18,
            );
  const innerD =
    shape === 'burst'
      ? burstPath(cx, cy, r * 0.82, r * 0.68, options.spikes ?? 14)
      : shape === 'circle'
        ? circlePath(cx, cy, r * 0.86)
        : shape === 'hex'
          ? polygonPath(Array.from({ length: 6 }, (_, i) => polar(cx, cy, r * 0.87, (i / 6) * TAU - Math.PI / 2)))
          : smoothClosedPath(
              [
                [cx - r * 0.86, cy - r * 0.78],
                [cx + r * 0.86, cy - r * 0.78],
                [cx + r * 0.86, cy + r * 0.14],
                [cx + r * 0.7, cy + r * 0.48],
                [cx, cy + r * 0.86],
                [cx - r * 0.7, cy + r * 0.48],
                [cx - r * 0.86, cy + r * 0.14],
              ],
              0.18,
            );
  nodes.push(shadowPlate(ctx, { d: outerD, dx: 1.5, dy: 1.9 }));
  nodes.push(ink(ctx, 'emblem-border', outerD, border, { material: options.material, cut: true, label: 'Emblem' }));
  nodes.push(ink(ctx, 'emblem-field', innerD, fill, { material: options.material, cut: true }));
  const charge = options.charge ?? ctx.pal.secondarySoft;
  const kind = options.chargeKind ?? 'star';
  if (kind === 'star') {
    nodes.push(ink(ctx, 'emblem-charge', starPath(cx, cy - r * 0.06, r * 0.44, r * 0.19, 5), charge, { material: options.material, cut: true }));
  } else if (kind === 'bolt') {
    nodes.push(ink(ctx, 'emblem-charge', lightningBoltPath(cx, cy, r * 0.9), charge, { material: options.material, cut: true }));
  }
  return [group(nodes, { id: ctx.id('hero-emblem'), role: 'illustration', material: options.material ?? ctx.material, label: 'Emblem' })];
}

export function lightningBoltPath(cx: number, cy: number, h: number): string {
  const w = h * 0.52;
  const top = cy - h / 2;
  return polygonPath([
    [cx - w * 0.22, top],
    [cx + w * 0.5, top],
    [cx + w * 0.06, top + h * 0.42],
    [cx + w * 0.52, top + h * 0.42],
    [cx - w * 0.42, top + h],
    [cx - w * 0.06, top + h * 0.54],
    [cx - w * 0.5, top + h * 0.54],
  ]);
}

export function lightningBolt(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: Paint; glow?: string; material?: string; cut?: boolean },
): SceneNode[] {
  const nodes: SceneNode[] = [];
  if (options.glow) {
    nodes.push(
      ink(ctx, 'bolt-glow', lightningBoltPath(options.cx, options.cy, options.h * 1.16), options.glow, {
        material: options.material,
        role: 'accents',
        opacity: 0.45,
      }),
    );
  }
  nodes.push(
    ink(ctx, 'bolt', lightningBoltPath(options.cx, options.cy, options.h), options.fill ?? ctx.pal.secondary, {
      material: options.material,
      cut: options.cut ?? true,
      label: 'Lightning bolt',
    }),
  );
  return [group(nodes, { id: ctx.id('bolt'), role: 'illustration', material: options.material ?? ctx.material, label: 'Lightning' })];
}

export function heroMask(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: Paint; lens?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const d = smoothClosedPath(
    [
      [cx - w / 2, cy - h * 0.1],
      [cx - w * 0.2, cy - h * 0.5],
      [cx, cy - h * 0.36],
      [cx + w * 0.2, cy - h * 0.5],
      [cx + w / 2, cy - h * 0.1],
      [cx + w * 0.36, cy + h * 0.34],
      [cx, cy + h * 0.1],
      [cx - w * 0.36, cy + h * 0.34],
    ],
    0.5,
  );
  const lens = options.lens ?? ctx.pal.highlight;
  return [
    group(
      [
        shadowPlate(ctx, { d, dx: 1.2, dy: 1.6, opacity: 0.12 }),
        ink(ctx, 'mask', d, options.fill ?? ctx.pal.primaryDeep, { material: options.material, cut: true, label: 'Hero mask' }),
        ink(ctx, 'mask-lens', ellipsePath(cx - w * 0.24, cy + h * 0.02, w * 0.13, h * 0.16), lens, { material: options.material, cut: true }),
        ink(ctx, 'mask-lens', ellipsePath(cx + w * 0.24, cy + h * 0.02, w * 0.13, h * 0.16), lens, { material: options.material, cut: true }),
        ink(ctx, 'mask-lens-glint', ellipsePath(cx - w * 0.27, cy - h * 0.02, w * 0.04, h * 0.05), mix(lens, ctx.pal.primarySoft, 0.4), { material: options.material }),
        ink(ctx, 'mask-lens-glint', ellipsePath(cx + w * 0.21, cy - h * 0.02, w * 0.04, h * 0.05), mix(lens, ctx.pal.primarySoft, 0.4), { material: options.material }),
      ],
      { id: ctx.id('hero-mask'), role: 'illustration', material: options.material ?? ctx.material, label: 'Mask' },
    ),
  ];
}

export function citySkyline(
  ctx: ArtCtx,
  options: {
    x: number;
    y: number;
    w: number;
    h: number;
    rand: () => number;
    fill?: string;
    windowColor?: string;
    buildings?: number;
    material?: string;
  },
): SceneNode[] {
  const count = options.buildings ?? 7;
  const fill = options.fill ?? ctx.pal.primaryDeep;
  const windowColor = options.windowColor ?? ctx.pal.secondarySoft;
  const nodes: SceneNode[] = [];
  let cursor = options.x;
  for (let i = 0; i < count; i += 1) {
    const width = (options.w / count) * (0.7 + options.rand() * 0.5);
    const height = options.h * (0.45 + options.rand() * 0.55);
    const top = options.y + options.h - height;
    nodes.push(
      ink(ctx, 'city-building', rectPath(cursor, top, width, height), i % 3 === 0 ? mix(fill, ctx.pal.primary, 0.35) : fill, {
        material: options.material,
        cut: true,
        label: 'Building',
      }),
    );
    const cols = Math.max(2, Math.floor(width / 5));
    const rows = Math.max(2, Math.floor(height / 7));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if ((r + c + i) % 3 === 0) continue;
        nodes.push(
          ink(ctx, 'city-window', rectPath(cursor + 1.5 + c * (width / cols), top + 2 + r * (height / rows), width / cols * 0.45, 1.6), windowColor, {
            material: options.material,
            opacity: 0.85,
            role: 'accents',
          }),
        );
      }
    }
    cursor += width + 1.2;
  }
  return [
    group(nodes, { id: ctx.id('city'), role: 'illustration', material: options.material ?? ctx.material, label: 'City skyline' }),
  ];
}

export function capeWings(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: Paint; trim?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const fill = options.fill ?? ctx.pal.accent;
  const d = smoothClosedPath(
    [
      [cx - w / 2, cy - h * 0.4],
      [cx - w * 0.52, cy + h * 0.36],
      [cx - w * 0.24, cy + h * 0.5],
      [cx - w * 0.1, cy + h * 0.2],
      [cx, cy + h * 0.52],
      [cx + w * 0.1, cy + h * 0.2],
      [cx + w * 0.24, cy + h * 0.5],
      [cx + w * 0.52, cy + h * 0.36],
      [cx + w / 2, cy - h * 0.4],
    ],
    0.4,
  );
  return [
    group(
      [
        ink(ctx, 'cape', d, fill, { material: options.material, cut: true, label: 'Cape' }),
        ink(ctx, 'cape-fold', smoothPath([[cx - w * 0.26, cy - h * 0.3], [cx - w * 0.3, cy + h * 0.4]], 0.5), 'none', {
          stroke: { color: options.trim ?? mix(String(fill).slice(0, 7) || ctx.pal.accentDeep, '#000000', 0.25), width: w * 0.012 },
          material: options.material,
          opacity: 0.7,
        }),
        ink(ctx, 'cape-fold', smoothPath([[cx + w * 0.26, cy - h * 0.3], [cx + w * 0.3, cy + h * 0.4]], 0.5), 'none', {
          stroke: { color: options.trim ?? mix(String(fill).slice(0, 7) || ctx.pal.accentDeep, '#000000', 0.25), width: w * 0.012 },
          material: options.material,
          opacity: 0.7,
        }),
      ],
      { id: ctx.id('cape'), role: 'illustration', material: options.material ?? ctx.material, label: 'Cape' },
    ),
  ];
}

export function explosionBurst(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; inner?: Paint; spikes?: number; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const spikes = options.spikes ?? 22;
  return [
    group(
      [
        ink(ctx, 'explosion', burstPath(cx, cy, r, r * 0.7, spikes), options.fill ?? ctx.pal.accent, {
          material: options.material,
          cut: true,
          label: 'Burst',
        }),
        ink(ctx, 'explosion-inner', burstPath(cx, cy, r * 0.72, r * 0.55, spikes), options.inner ?? ctx.pal.secondarySoft, {
          material: options.material,
          cut: true,
        }),
      ],
      { id: ctx.id('explosion'), role: 'illustration', material: options.material ?? ctx.material, label: 'Explosion' },
    ),
  ];
}

/** Halftone comic dots radiating behind a subject. */
export function halftoneRays(
  ctx: ArtCtx,
  options: { cx: number; cy: number; rInner: number; rOuter: number; count?: number; color?: string; opacity?: number },
): SceneNode[] {
  const count = options.count ?? 20;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU;
    const p0 = polar(options.cx, options.cy, options.rInner, a);
    const p1 = polar(options.cx, options.cy, options.rOuter, a);
    const half = (TAU / count) * 0.34;
    const p2 = polar(options.cx, options.cy, options.rOuter, a + half);
    nodes.push(
      ink(ctx, 'halftone-ray', polygonPath([p0, p1, p2]), options.color ?? ctx.pal.accentSoft, {
        role: 'accents',
        opacity: options.opacity ?? 0.5,
      }),
    );
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Ocean                                                               */
/* ------------------------------------------------------------------ */

export function fish(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    scale: number;
    body: string;
    fin?: string;
    belly?: string;
    facing?: 1 | -1;
    pattern?: 'none' | 'stripes' | 'spots';
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const dir = options.facing ?? 1;
  const fin = options.fin ?? mix(options.body, ctx.pal.ink, 0.2);
  const belly = options.belly ?? mix(options.body, ctx.pal.highlight, 0.45);
  const nodes: SceneNode[] = [
    ink(ctx, 'fish-tail', polygonPath([
      [cx - dir * s * 1.0, cy],
      [cx - dir * s * 1.7, cy - s * 0.62],
      [cx - dir * s * 1.5, cy],
      [cx - dir * s * 1.7, cy + s * 0.62],
    ]), fin, { material: options.material, cut: true, label: 'Tail' }),
    ink(ctx, 'fish-top', polygonPath([
      [cx - dir * s * 0.2, cy - s * 0.5],
      [cx + dir * s * 0.35, cy - s * 0.96],
      [cx + dir * s * 0.5, cy - s * 0.44],
    ]), fin, { material: options.material, cut: true }),
    ink(ctx, 'fish-body', ellipsePath(cx, cy, s * 1.2, s * 0.72), options.body, { material: options.material, cut: true, label: 'Fish' }),
    ink(ctx, 'fish-belly', ellipsePath(cx + dir * s * 0.1, cy + s * 0.3, s * 0.86, s * 0.3), belly, { material: options.material }),
    ink(ctx, 'fish-fin', polygonPath([
      [cx + dir * s * 0.1, cy + s * 0.16],
      [cx + dir * s * 0.6, cy + s * 0.9],
      [cx - dir * s * 0.24, cy + s * 0.5],
    ]), fin, { material: options.material, cut: true }),
    ink(ctx, 'fish-eye', circlePath(cx + dir * s * 0.72, cy - s * 0.16, s * 0.12), ctx.pal.highlight, { material: options.material }),
    ink(ctx, 'fish-pupil', circlePath(cx + dir * s * 0.75, cy - s * 0.16, s * 0.06), ctx.pal.ink, { material: options.material }),
    ink(ctx, 'fish-mouth', arcPath(cx + dir * s * 1.06, cy + s * 0.14, s * 0.18, s * 0.14, Math.PI * 0.1, Math.PI * 0.9), 'none', {
      stroke: { color: mix(options.body, ctx.pal.ink, 0.4), width: s * 0.05, cap: 'round' },
      material: options.material,
    }),
  ];
  if (options.pattern === 'stripes') {
    for (let i = 0; i < 3; i += 1) {
      nodes.push(
        ink(ctx, 'fish-stripe', roundedRectPath(cx - dir * s * 0.4 + i * dir * s * 0.42, cy - s * 0.5, s * 0.14, s * 0.76, s * 0.07), mix(options.body, ctx.pal.ink, 0.25), {
          material: options.material,
          opacity: 0.8,
        }),
      );
    }
  } else if (options.pattern === 'spots') {
    for (let i = 0; i < 4; i += 1) {
      nodes.push(
        ink(ctx, 'fish-spot', circlePath(cx - dir * s * 0.5 + i * dir * s * 0.42, cy - s * 0.1 + (i % 2) * s * 0.24, s * 0.11), mix(options.body, ctx.pal.highlight, 0.5), {
          material: options.material,
          opacity: 0.9,
        }),
      );
    }
  }
  return [group(nodes, { id: ctx.id('fish'), role: 'illustration', material: options.material ?? ctx.material, label: 'Fish' })];
}

export function seaTurtle(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; shell: string; shellRim?: string; skin?: string; pattern?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const skin = options.skin ?? ctx.pal.foliage;
  const rim = options.shellRim ?? mix(options.shell, ctx.pal.secondary, 0.45);
  const pattern = options.pattern ?? mix(options.shell, ctx.pal.ink, 0.2);
  const nodes: SceneNode[] = [];
  for (const [dx, dy, rx, ry] of [
    [-0.9, -0.5, 0.5, 0.24],
    [0.9, -0.5, 0.5, 0.24],
    [-0.9, 0.5, 0.5, 0.24],
    [0.9, 0.5, 0.5, 0.24],
  ] as [number, number, number, number][]) {
    nodes.push(
      ink(ctx, 'turtle-flipper', ellipsePath(cx + dx * s, cy + dy * s, rx * s, ry * s), skin, { material: options.material, cut: true }),
    );
  }
  nodes.push(ink(ctx, 'turtle-head', ellipsePath(cx + s * 1.25, cy, s * 0.4, s * 0.34), skin, { material: options.material, cut: true, label: 'Head' }));
  nodes.push(ink(ctx, 'turtle-eye', circlePath(cx + s * 1.4, cy - s * 0.08, s * 0.08), ctx.pal.ink, { material: options.material }));
  nodes.push(ink(ctx, 'turtle-shell', ellipsePath(cx, cy, s * 1.1, s * 0.9), rim, { material: options.material, cut: true, label: 'Shell' }));
  nodes.push(ink(ctx, 'turtle-shell-inner', ellipsePath(cx, cy, s * 0.9, s * 0.72), options.shell, { material: options.material, cut: true }));
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * TAU + 0.4;
    nodes.push(
      ink(ctx, 'turtle-scute', polygonPath([
        polar(cx, cy, s * 0.24, a - 0.42),
        polar(cx, cy, s * 0.7, a - 0.3),
        polar(cx, cy, s * 0.7, a + 0.3),
        polar(cx, cy, s * 0.24, a + 0.42),
      ]), pattern, { material: options.material, opacity: 0.9 }),
    );
  }
  nodes.push(ink(ctx, 'turtle-center', polygonPath(Array.from({ length: 6 }, (_, i) => polar(cx, cy, s * 0.26, (i / 6) * TAU))), pattern, { material: options.material }));
  return [group(nodes, { id: ctx.id('turtle'), role: 'illustration', material: options.material ?? ctx.material, label: 'Sea turtle' })];
}

export function octopus(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body: string; spot?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < 5; i += 1) {
    const dir = i - 2;
    nodes.push(
      ink(ctx, 'octopus-tentacle', smoothPath(
        [
          [cx + dir * s * 0.34, cy + s * 0.5],
          [cx + dir * s * 0.8, cy + s * 1.15],
          [cx + dir * s * 0.5, cy + s * 1.6],
        ],
        0.6,
      ), 'none', { stroke: { color: i % 2 === 0 ? body : mix(body, ctx.pal.ink, 0.15), width: s * 0.24, cap: 'round' }, material: options.material, cut: true, label: 'Tentacle' }),
    );
  }
  nodes.push(ink(ctx, 'octopus-head', smoothClosedPath(
    [
      [cx - s * 0.95, cy + s * 0.4],
      [cx - s * 0.8, cy - s * 0.6],
      [cx, cy - s * 1.1],
      [cx + s * 0.8, cy - s * 0.6],
      [cx + s * 0.95, cy + s * 0.4],
    ],
    0.5,
  ), body, { material: options.material, cut: true, label: 'Octopus' }));
  nodes.push(...eyes(ctx, cx, cy - s * 0.15, s * 0.11, ctx.pal.ink));
  nodes.push(ink(ctx, 'octopus-smile', arcPath(cx, cy + s * 0.12, s * 0.3, s * 0.24, Math.PI * 0.16, Math.PI * 0.84), 'none', {
    stroke: { color: ctx.pal.ink, width: s * 0.06, cap: 'round' },
    material: options.material,
  }));
  for (let i = 0; i < 4; i += 1) {
    nodes.push(
      ink(ctx, 'octopus-spot', circlePath(cx - s * 0.5 + i * s * 0.34, cy - s * 0.62 - (i % 2) * s * 0.14, s * 0.09), options.spot ?? mix(body, ctx.pal.highlight, 0.5), {
        material: options.material,
        opacity: 0.85,
      }),
    );
  }
  return [group(nodes, { id: ctx.id('octopus'), role: 'illustration', material: options.material ?? ctx.material, label: 'Octopus' })];
}

export function jellyfish(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; bell: string; tentacle?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const tentacle = options.tentacle ?? mix(options.bell, ctx.pal.highlight, 0.4);
  const nodes: SceneNode[] = [];
  for (let i = 0; i < 5; i += 1) {
    const dir = i - 2;
    nodes.push(
      ink(ctx, 'jelly-tentacle', smoothPath(
        [
          [cx + dir * s * 0.28, cy + s * 0.3],
          [cx + dir * s * 0.5, cy + s * 0.9],
          [cx + dir * s * 0.3, cy + s * 1.4],
        ],
        0.6,
      ), 'none', { stroke: { color: tentacle, width: s * 0.1, cap: 'round' }, material: options.material }),
    );
  }
  nodes.push(
    ink(ctx, 'jelly-bell', smoothClosedPath(
      [
        [cx - s * 0.9, cy + s * 0.34],
        [cx - s * 0.86, cy - s * 0.4],
        [cx, cy - s * 0.88],
        [cx + s * 0.86, cy - s * 0.4],
        [cx + s * 0.9, cy + s * 0.34],
      ],
      0.5,
    ), options.bell, { material: options.material, cut: true, label: 'Jellyfish' }),
  );
  nodes.push(ink(ctx, 'jelly-shine', ellipsePath(cx - s * 0.3, cy - s * 0.4, s * 0.2, s * 0.12), ctx.pal.highlight, { material: options.material, opacity: 0.55 }));
  nodes.push(...eyes(ctx, cx, cy - s * 0.1, s * 0.09, ctx.pal.ink));
  return [group(nodes, { id: ctx.id('jellyfish'), role: 'illustration', material: options.material ?? ctx.material, label: 'Jellyfish' })];
}

export function seaShell(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; ridge?: string; pearl?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const fill = options.fill ?? ctx.pal.accentSoft;
  const ridge = options.ridge ?? mix(String(fill).slice(0, 7) || ctx.pal.accentSoft, ctx.pal.accentDeep, 0.4);
  const nodes: SceneNode[] = [
    ink(ctx, 'shell', smoothClosedPath(
      [
        [cx - r, cy + r * 0.5],
        [cx - r * 0.9, cy - r * 0.3],
        [cx - r * 0.3, cy - r * 0.95],
        [cx + r * 0.5, cy - r * 0.7],
        [cx + r, cy + r * 0.2],
        [cx + r * 0.4, cy + r * 0.6],
        [cx - r * 0.4, cy + r * 0.66],
      ],
      0.45,
    ), fill, { material: options.material, cut: true, label: 'Shell' }),
  ];
  for (let i = 0; i < 5; i += 1) {
    const t = i / 4;
    nodes.push(
      ink(ctx, 'shell-ridge', smoothPath(
        [
          [cx - r * 0.7 + t * r * 1.3, cy + r * 0.5],
          [cx - r * 0.55 + t * r * 1.1, cy - r * 0.1],
          [cx - r * 0.3 + t * r * 0.9, cy - r * 0.6],
        ],
        0.5,
      ), 'none', { stroke: { color: ridge, width: r * 0.06, cap: 'round' }, material: options.material, opacity: 0.8 }),
    );
  }
  nodes.push(ink(ctx, 'shell-lip', smoothClosedPath(
    [
      [cx - r * 0.9, cy + r * 0.44],
      [cx + r * 0.9, cy + r * 0.36],
      [cx + r * 0.4, cy + r * 0.62],
      [cx - r * 0.4, cy + r * 0.64],
    ],
    0.5,
  ), mix(String(fill).slice(0, 7) || ctx.pal.accentSoft, ctx.pal.highlight, 0.5), { material: options.material }));
  if (options.pearl !== false) {
    nodes.push(ink(ctx, 'pearl', circlePath(cx, cy + r * 0.36, r * 0.24), ctx.pal.highlight, { material: options.material, cut: true, label: 'Pearl' }));
    nodes.push(ink(ctx, 'pearl-shine', circlePath(cx - r * 0.07, cy + r * 0.29, r * 0.07), mix(ctx.pal.highlight, ctx.pal.secondarySoft, 0.6), { material: options.material }));
  }
  return [group(nodes, { id: ctx.id('shell'), role: 'illustration', material: options.material ?? ctx.material, label: 'Shell' })];
}

export function coral(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: string; branches?: number; material?: string },
): SceneNode[] {
  const branches = options.branches ?? 5;
  const fill = options.fill ?? ctx.pal.accent;
  const nodes: SceneNode[] = [
    ink(ctx, 'coral-base', ellipsePath(options.cx, options.cy, options.h * 0.34, options.h * 0.1), mix(fill, ctx.pal.ink, 0.15), { material: options.material, cut: true, label: 'Coral' }),
  ];
  for (let i = 0; i < branches; i += 1) {
    const t = branches === 1 ? 0.5 : i / (branches - 1);
    const lean = (t - 0.5) * 2;
    nodes.push(
      ink(ctx, 'coral-branch', smoothPath(
        [
          [options.cx + lean * options.h * 0.12, options.cy],
          [options.cx + lean * options.h * 0.3, options.cy - options.h * 0.5],
          [options.cx + lean * options.h * 0.5, options.cy - options.h * (0.7 + 0.28 * (1 - Math.abs(lean)))],
        ],
        0.6,
      ), 'none', {
        stroke: { color: i % 2 === 0 ? fill : mix(fill, ctx.pal.highlight, 0.28), width: options.h * 0.11, cap: 'round' },
        material: options.material,
        cut: true,
      }),
    );
    nodes.push(
      ink(ctx, 'coral-tip', circlePath(options.cx + lean * options.h * 0.5, options.cy - options.h * (0.72 + 0.28 * (1 - Math.abs(lean))), options.h * 0.06), mix(fill, ctx.pal.highlight, 0.4), {
        material: options.material,
      }),
    );
  }
  return [group(nodes, { id: ctx.id('coral'), role: 'illustration', material: options.material ?? ctx.material, label: 'Coral' })];
}

export function seahorse(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: string; material?: string },
): SceneNode[] {
  const { cx, cy, h } = options;
  const fill = options.fill ?? ctx.pal.accentSoft;
  const nodes: SceneNode[] = [
    ink(ctx, 'seahorse-body', smoothClosedPath(
      [
        [cx - h * 0.1, cy + h * 0.5],
        [cx - h * 0.18, cy - h * 0.05],
        [cx - h * 0.06, cy - h * 0.32],
        [cx + h * 0.16, cy - h * 0.4],
        [cx + h * 0.22, cy - h * 0.18],
        [cx + h * 0.06, cy - h * 0.02],
        [cx + h * 0.16, cy + h * 0.34],
        [cx + h * 0.02, cy + h * 0.5],
      ],
      0.45,
    ), fill, { material: options.material, cut: true, label: 'Seahorse' }),
    ink(ctx, 'seahorse-snout', roundedRectPath(cx + h * 0.14, cy - h * 0.48, h * 0.22, h * 0.1, h * 0.05), fill, { material: options.material, cut: true }),
    ink(ctx, 'seahorse-fin', polygonPath([
      [cx - h * 0.14, cy - h * 0.16],
      [cx - h * 0.42, cy - h * 0.3],
      [cx - h * 0.14, cy + h * 0.02],
    ]), mix(fill, ctx.pal.highlight, 0.35), { material: options.material, cut: true }),
  ];
  for (let i = 0; i < 4; i += 1) {
    nodes.push(
      ink(ctx, 'seahorse-spike', petalPath(cx - h * 0.04, cy - h * (0.28 - i * 0.14), h * 0.1, h * 0.03, Math.PI), mix(fill, ctx.pal.ink, 0.2), {
        material: options.material,
      }),
    );
  }
  nodes.push(ink(ctx, 'seahorse-eye', circlePath(cx + h * 0.06, cy - h * 0.3, h * 0.045), ctx.pal.ink, { material: options.material }));
  return [group(nodes, { id: ctx.id('seahorse'), role: 'illustration', material: options.material ?? ctx.material, label: 'Seahorse' })];
}

export function whale(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body: string; belly?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body;
  const belly = options.belly ?? mix(body, ctx.pal.highlight, 0.55);
  return [
    group(
      [
        ink(ctx, 'whale-body', smoothClosedPath(
          [
            [cx - s * 1.5, cy + s * 0.3],
            [cx - s * 0.6, cy - s * 0.5],
            [cx + s * 0.6, cy - s * 0.5],
            [cx + s * 1.4, cy + s * 0.05],
            [cx + s * 0.5, cy + s * 0.5],
            [cx - s * 0.7, cy + s * 0.55],
          ],
          0.45,
        ), body, { material: options.material, cut: true, label: 'Whale' }),
        ink(ctx, 'whale-tail', polygonPath([
          [cx - s * 1.42, cy + s * 0.2],
          [cx - s * 2.05, cy - s * 0.42],
          [cx - s * 1.66, cy + s * 0.16],
          [cx - s * 2.1, cy + s * 0.6],
        ]), body, { material: options.material, cut: true }),
        ink(ctx, 'whale-belly', smoothClosedPath(
          [
            [cx - s * 0.9, cy + s * 0.4],
            [cx + s * 0.5, cy + s * 0.5],
            [cx + s * 1.2, cy + s * 0.14],
            [cx + s * 0.2, cy + s * 0.3],
          ],
          0.5,
        ), belly, { material: options.material }),
        ink(ctx, 'whale-fin', polygonPath([
          [cx + s * 0.2, cy + s * 0.3],
          [cx + s * 0.6, cy + s * 1.05],
          [cx - s * 0.2, cy + s * 0.5],
        ]), body, { material: options.material, cut: true }),
        ink(ctx, 'whale-eye', circlePath(cx + s * 0.72, cy - s * 0.12, s * 0.1), ctx.pal.highlight, { material: options.material }),
        ink(ctx, 'whale-pupil', circlePath(cx + s * 0.75, cy - s * 0.12, s * 0.05), ctx.pal.ink, { material: options.material }),
        ink(ctx, 'whale-blow', arcPath(cx + s * 0.5, cy - s * 0.6, s * 0.24, s * 0.4, Math.PI, TAU), 'none', {
          stroke: { color: mix(body, ctx.pal.highlight, 0.6), width: s * 0.1, cap: 'round' },
          material: options.material,
        }),
      ],
      { id: ctx.id('whale'), role: 'illustration', material: options.material ?? ctx.material, label: 'Whale' },
    ),
  ];
}

export function crab(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.accent;
  const nodes: SceneNode[] = [];
  for (const dir of [-1, 1] as const) {
    for (let i = 0; i < 3; i += 1) {
      nodes.push(
        ink(ctx, 'crab-leg', smoothPath(
          [
            [cx + dir * s * 0.6, cy + s * 0.2],
            [cx + dir * s * (0.95 + i * 0.1), cy + s * (0.5 + i * 0.2)],
            [cx + dir * s * (1.15 + i * 0.12), cy + s * (0.42 + i * 0.24)],
          ],
          0.5,
        ), 'none', { stroke: { color: body, width: s * 0.12, cap: 'round' }, material: options.material, cut: true }),
      );
    }
    nodes.push(
      ink(ctx, 'crab-claw', smoothClosedPath(
        [
          [cx + dir * s * 0.7, cy - s * 0.3],
          [cx + dir * s * 1.35, cy - s * 0.85],
          [cx + dir * s * 1.6, cy - s * 0.55],
          [cx + dir * s * 1.1, cy - s * 0.2],
        ],
        0.45,
      ), body, { material: options.material, cut: true, label: 'Claw' }),
    );
    nodes.push(
      ink(ctx, 'crab-claw-notch', polygonPath([
        [cx + dir * s * 1.22, cy - s * 0.72],
        [cx + dir * s * 1.5, cy - s * 0.5],
        [cx + dir * s * 1.18, cy - s * 0.36],
      ]), mix(body, ctx.pal.ink, 0.3), { material: options.material }),
    );
  }
  nodes.push(ink(ctx, 'crab-body', ellipsePath(cx, cy, s * 0.9, s * 0.7), body, { material: options.material, cut: true, label: 'Crab' }));
  nodes.push(...eyes(ctx, cx, cy - s * 0.28, s * 0.11, ctx.pal.ink));
  nodes.push(ink(ctx, 'crab-smile', arcPath(cx, cy - s * 0.02, s * 0.28, s * 0.2, Math.PI * 0.16, Math.PI * 0.84), 'none', {
    stroke: { color: ctx.pal.ink, width: s * 0.05, cap: 'round' },
    material: options.material,
  }));
  return [group(nodes, { id: ctx.id('crab'), role: 'illustration', material: options.material ?? ctx.material, label: 'Crab' })];
}

/** Layered wave bands for the bottom of an ocean scene. */
export function waveLayers(
  ctx: ArtCtx,
  options: { x: number; y: number; w: number; h: number; colors: string[]; rand?: () => number },
): SceneNode[] {
  const nodes: SceneNode[] = [];
  const colors = options.colors;
  colors.forEach((color, i) => {
    const y = options.y + (options.h * i) / colors.length;
    nodes.push(
      ink(ctx, 'wave', waveBandPath(options.x, y, options.w, options.h / colors.length + 2, options.h * 0.045, 5 + i), color, {
        role: 'background',
        cut: true,
        label: `Wave band ${i + 1}`,
      }),
    );
  });
  return nodes;
}

export function bubbles(
  ctx: ArtCtx,
  options: { cx: number; cy: number; count?: number; spread?: number; color?: string; rand: () => number },
): SceneNode[] {
  const count = options.count ?? 7;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const r = 1.2 + options.rand() * 3.4;
    const x = options.cx + (options.rand() - 0.5) * (options.spread ?? 30);
    const y = options.cy + (options.rand() - 0.5) * (options.spread ?? 30);
    nodes.push(
      ink(ctx, 'bubble', ringPath(x, y, r, r * 0.78), options.color ?? ctx.pal.highlight, {
        fillRule: 'evenodd',
        role: 'accents',
        opacity: 0.7,
      }),
    );
  }
  return nodes;
}

export function anchor(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: string; material?: string },
): SceneNode[] {
  const { cx, cy, h } = options;
  const fill = options.fill ?? ctx.pal.primary;
  const nodes: SceneNode[] = [
    ink(ctx, 'anchor-ring', ringPath(cx, cy - h * 0.5, h * 0.1, h * 0.055), fill, { material: options.material, fillRule: 'evenodd', cut: true, label: 'Anchor' }),
    ink(ctx, 'anchor-stock', rectPath(cx - h * 0.2, cy - h * 0.34, h * 0.4, h * 0.06), fill, { material: options.material, cut: true }),
    ink(ctx, 'anchor-shank', roundedRectPath(cx - h * 0.035, cy - h * 0.42, h * 0.07, h * 0.78, h * 0.02), fill, { material: options.material, cut: true }),
  ];
  nodes.push(
    ink(ctx, 'anchor-arm', arcPath(cx, cy + h * 0.12, h * 0.28, h * 0.34, Math.PI * 0.02, Math.PI * 0.98), 'none', {
      stroke: { color: fill, width: h * 0.09, cap: 'round' },
      material: options.material,
    }),
  );
  for (const dir of [-1, 1] as const) {
    nodes.push(
      ink(ctx, 'anchor-fluke', polygonPath([
        [cx + dir * h * 0.28, cy + h * 0.34],
        [cx + dir * h * 0.44, cy + h * 0.22],
        [cx + dir * h * 0.32, cy + h * 0.46],
      ]), fill, { material: options.material, cut: true }),
    );
  }
  return [group(nodes, { id: ctx.id('anchor'), role: 'illustration', material: options.material ?? ctx.material, label: 'Anchor' })];
}

export function sailorHat(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; fill?: string; band?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w } = options;
  const fill = options.fill ?? ctx.pal.surface;
  return [
    group(
      [
        ink(ctx, 'sailor-brim', ellipsePath(cx, cy + w * 0.16, w * 0.52, w * 0.14), mix(fill, ctx.pal.ink, 0.12), { material: options.material, cut: true }),
        ink(ctx, 'sailor-crown', smoothClosedPath(
          [
            [cx - w * 0.42, cy + w * 0.12],
            [cx - w * 0.34, cy - w * 0.24],
            [cx, cy - w * 0.32],
            [cx + w * 0.34, cy - w * 0.24],
            [cx + w * 0.42, cy + w * 0.12],
          ],
          0.4,
        ), fill, { material: options.material, cut: true, label: 'Sailor hat' }),
        ink(ctx, 'sailor-band', smoothClosedPath(
          [
            [cx - w * 0.42, cy + w * 0.08],
            [cx + w * 0.42, cy + w * 0.08],
            [cx + w * 0.4, cy + w * 0.18],
            [cx - w * 0.4, cy + w * 0.18],
          ],
          0.4,
        ), options.band ?? ctx.pal.primary, { material: options.material }),
        ink(ctx, 'sailor-badge', starPath(cx, cy - w * 0.04, w * 0.1, w * 0.045, 5), ctx.pal.secondary, { material: options.material }),
      ],
      { id: ctx.id('sailor-hat'), role: 'illustration', material: options.material ?? ctx.material, label: 'Sailor hat' },
    ),
  ];
}

export function mermaidTail(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: Paint; scaleFill?: string; material?: string },
): SceneNode[] {
  const { cx, cy, h } = options;
  const fill = options.fill ?? ctx.pal.primary;
  const scaleFill = options.scaleFill ?? mix(String(fill).slice(0, 7) || ctx.pal.primary, ctx.pal.highlight, 0.4);
  const nodes: SceneNode[] = [
    ink(ctx, 'tail-body', smoothClosedPath(
      [
        [cx - h * 0.16, cy - h * 0.5],
        [cx + h * 0.16, cy - h * 0.5],
        [cx + h * 0.24, cy + h * 0.1],
        [cx + h * 0.06, cy + h * 0.34],
        [cx - h * 0.2, cy + h * 0.12],
      ],
      0.45,
    ), fill, { material: options.material, cut: true, label: 'Mermaid tail' }),
    ink(ctx, 'tail-fin', smoothClosedPath(
      [
        [cx, cy + h * 0.32],
        [cx - h * 0.55, cy + h * 0.72],
        [cx - h * 0.12, cy + h * 0.6],
        [cx, cy + h * 0.9],
        [cx + h * 0.14, cy + h * 0.6],
        [cx + h * 0.55, cy + h * 0.72],
      ],
      0.45,
    ), mix(String(fill).slice(0, 7) || ctx.pal.primary, ctx.pal.secondary, 0.35), { material: options.material, cut: true, label: 'Tail fin' }),
  ];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = cx - h * 0.12 + col * h * 0.12 + (row % 2) * h * 0.06;
      const y = cy - h * 0.4 + row * h * 0.18;
      nodes.push(
        ink(ctx, 'tail-scale', arcPath(x, y, h * 0.06, h * 0.05, Math.PI, TAU), 'none', {
          stroke: { color: scaleFill, width: h * 0.014, cap: 'round' },
          material: options.material,
          opacity: 0.85,
        }),
      );
    }
  }
  return [group(nodes, { id: ctx.id('mermaid-tail'), role: 'illustration', material: options.material ?? ctx.material, label: 'Mermaid tail' })];
}

export function bubbleFrame(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; rim?: string; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const nodes: SceneNode[] = [
    ink(ctx, 'bubble-frame', circlePath(cx, cy, r), options.fill ?? ctx.pal.surface, {
      material: options.material,
      cut: true,
      label: 'Bubble frame',
      opacity: 0.92,
    }),
    ink(ctx, 'bubble-frame-rim', circlePath(cx, cy, r), 'none', {
      stroke: { color: options.rim ?? ctx.pal.primarySoft, width: r * 0.06 },
      material: options.material,
    }),
  ];
  for (let i = 0; i < 3; i += 1) {
    const a = -1.9 + i * 0.6;
    nodes.push(
      ink(ctx, 'bubble-glint', circlePath(...(polar(cx, cy, r * 0.72, a) as [number, number]), r * 0.06), ctx.pal.highlight, {
        material: options.material,
        opacity: 0.8,
      }),
    );
  }
  return nodes;
}

export { shadowPlate, round, type Point, type ShapeNode };
