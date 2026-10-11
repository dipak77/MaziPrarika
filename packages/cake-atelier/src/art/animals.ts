/**
 * @mazi/cake-atelier — creatures
 *
 * Original flat-paper animals. Every face is built the same way so a safari
 * badge, a teddy nameplate and a fox medallion read as one family: a head
 * silhouette, a muzzle plate, two eyes, a nose, and one identifying feature
 * (mane, trunk, antlers, horn, snout, stripes).
 *
 * No emoji, no traced artwork, no third-party illustration assets.
 */

import {
  arcPath,
  circlePath,
  ellipsePath,
  petalPath,
  polygonPath,
  polar,
  ringPath,
  round,
  roundedRectPath,
  smoothClosedPath,
  smoothPath,
  starPath,
  TAU,
  type Point,
} from '../geometry.js';
import { mix, shade } from '../palettes.js';
import type { GroupNode, Paint, SceneNode, ShapeNode } from '../scene.js';
import { group } from '../scene.js';
import { ink, line, type ArtCtx } from './helpers.js';
import { shadowPlate } from './decor.js';

/* ------------------------------------------------------------------ */
/* Shared face parts                                                   */
/* ------------------------------------------------------------------ */

function eyes(ctx: ArtCtx, cx: number, cy: number, r: number, ink_: string): ShapeNode[] {
  return [
    ink(ctx, 'eye', circlePath(cx - r * 1.5, cy, r), ink_),
    ink(ctx, 'eye', circlePath(cx + r * 1.5, cy, r), ink_),
    ink(ctx, 'eye-glint', circlePath(cx - r * 1.5 + r * 0.32, cy - r * 0.34, r * 0.32), ctx.pal.highlight),
    ink(ctx, 'eye-glint', circlePath(cx + r * 1.5 + r * 0.32, cy - r * 0.34, r * 0.32), ctx.pal.highlight),
  ];
}

function cheeks(ctx: ArtCtx, cx: number, cy: number, r: number, color: string): ShapeNode[] {
  return [
    ink(ctx, 'cheek', circlePath(cx - r * 2.3, cy + r * 1.5, r * 0.7), color, { opacity: 0.65 }),
    ink(ctx, 'cheek', circlePath(cx + r * 2.3, cy + r * 1.5, r * 0.7), color, { opacity: 0.65 }),
  ];
}

function smile(ctx: ArtCtx, cx: number, cy: number, r: number, color: string): ShapeNode {
  return ink(
    ctx,
    'smile',
    arcPath(cx, cy, r * 0.9, r * 0.7, Math.PI * 0.16, Math.PI * 0.84),
    'none',
    { stroke: { color, width: Math.max(0.35, r * 0.12), cap: 'round' }, role: 'illustration' },
  );
}

export interface HeadOptions {
  cx: number;
  cy: number;
  r: number;
  fur: string;
  muzzle?: string;
  ink?: string;
  blush?: string;
  material?: string;
}

/* ------------------------------------------------------------------ */
/* Bear, bunny, koala, fox, deer, lion, monkey, tiger, cow              */
/* ------------------------------------------------------------------ */

export function bearFace(ctx: ArtCtx, options: HeadOptions & { ears?: 'round' | 'tufty' }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const muzzle = options.muzzle ?? mix(fur, ctx.pal.surface, 0.55);
  const inkColor = options.ink ?? ctx.pal.ink;
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d: circlePath(cx, cy + r * 0.1, r), dx: 1.2, dy: 1.5, opacity: 0.12 }),
    ink(ctx, 'bear-ear', circlePath(cx - r * 0.78, cy - r * 0.72, r * 0.34), fur, { material: options.material, cut: true }),
    ink(ctx, 'bear-ear', circlePath(cx + r * 0.78, cy - r * 0.72, r * 0.34), fur, { material: options.material, cut: true }),
    ink(ctx, 'bear-ear-inner', circlePath(cx - r * 0.78, cy - r * 0.72, r * 0.19), muzzle, { material: options.material }),
    ink(ctx, 'bear-ear-inner', circlePath(cx + r * 0.78, cy - r * 0.72, r * 0.19), muzzle, { material: options.material }),
    ink(ctx, 'bear-head', circlePath(cx, cy, r), fur, { material: options.material, cut: true, label: 'Bear head' }),
    ink(ctx, 'bear-muzzle', ellipsePath(cx, cy + r * 0.36, r * 0.52, r * 0.42), muzzle, { material: options.material, cut: true }),
    ink(ctx, 'bear-nose', ellipsePath(cx, cy + r * 0.16, r * 0.16, r * 0.12), inkColor, { material: options.material }),
    ...eyes(ctx, cx, cy - r * 0.16, r * 0.11, inkColor),
    ...cheeks(ctx, cx, cy, r, options.blush ?? ctx.pal.accentSoft),
    smile(ctx, cx, cy + r * 0.42, r * 0.36, inkColor),
  ];
  if (options.ears === 'tufty') {
    nodes.push(ink(ctx, 'bear-tuft', petalPath(cx - r * 0.78, cy - r * 1.0, r * 0.3, r * 0.12, -1.1), fur, { material: options.material }));
    nodes.push(ink(ctx, 'bear-tuft', petalPath(cx + r * 0.78, cy - r * 1.0, r * 0.3, r * 0.12, -2.0), fur, { material: options.material }));
  }
  return [group(nodes, { id: ctx.id('bear-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Bear' })];
}

export function bunnyFace(ctx: ArtCtx, options: HeadOptions & { earTilt?: number; innerEar?: string }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const inner = options.innerEar ?? ctx.pal.accentSoft;
  const inkColor = options.ink ?? ctx.pal.ink;
  const tilt = options.earTilt ?? 0.35;
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d: circlePath(cx, cy + r * 0.1, r), dx: 1.2, dy: 1.5, opacity: 0.12 }),
    ink(ctx, 'bunny-ear', petalPath(cx - r * 0.42, cy - r * 0.72, r * 1.5, r * 0.3, -Math.PI / 2 - tilt), fur, {
      material: options.material,
      cut: true,
      label: 'Bunny ear',
    }),
    ink(ctx, 'bunny-ear', petalPath(cx + r * 0.42, cy - r * 0.72, r * 1.5, r * 0.3, -Math.PI / 2 + tilt), fur, {
      material: options.material,
      cut: true,
    }),
    ink(ctx, 'bunny-ear-inner', petalPath(cx - r * 0.42, cy - r * 0.74, r * 1.16, r * 0.15, -Math.PI / 2 - tilt), inner, {
      material: options.material,
    }),
    ink(ctx, 'bunny-ear-inner', petalPath(cx + r * 0.42, cy - r * 0.74, r * 1.16, r * 0.15, -Math.PI / 2 + tilt), inner, {
      material: options.material,
    }),
    ink(ctx, 'bunny-head', ellipsePath(cx, cy, r, r * 0.92), fur, { material: options.material, cut: true, label: 'Bunny head' }),
    ink(ctx, 'bunny-muzzle', ellipsePath(cx, cy + r * 0.34, r * 0.42, r * 0.3), options.muzzle ?? mix(fur, ctx.pal.surface, 0.6), {
      material: options.material,
    }),
    ink(ctx, 'bunny-nose', petalPath(cx, cy + r * 0.2, r * 0.16, r * 0.12, Math.PI / 2), ctx.pal.accent, { material: options.material }),
    ...eyes(ctx, cx, cy - r * 0.12, r * 0.1, inkColor),
    ...cheeks(ctx, cx, cy, r, options.blush ?? ctx.pal.accentSoft),
    ink(ctx, 'bunny-whisker', polygonPath([[cx - r * 0.28, cy + r * 0.32], [cx - r * 0.76, cy + r * 0.28]], false), 'none', {
      stroke: { color: inkColor, width: 0.3, cap: 'round' },
      opacity: 0.5,
    }),
    ink(ctx, 'bunny-whisker', polygonPath([[cx + r * 0.28, cy + r * 0.32], [cx + r * 0.76, cy + r * 0.28]], false), 'none', {
      stroke: { color: inkColor, width: 0.3, cap: 'round' },
      opacity: 0.5,
    }),
  ];
  return [group(nodes, { id: ctx.id('bunny-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Bunny' })];
}

export function koalaFace(ctx: ArtCtx, options: HeadOptions): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const inkColor = options.ink ?? ctx.pal.ink;
  return [
    group(
      [
        shadowPlate(ctx, { d: circlePath(cx, cy + r * 0.1, r), dx: 1.2, dy: 1.5, opacity: 0.12 }),
        ink(ctx, 'koala-ear', circlePath(cx - r * 0.92, cy - r * 0.5, r * 0.44), fur, { material: options.material, cut: true }),
        ink(ctx, 'koala-ear', circlePath(cx + r * 0.92, cy - r * 0.5, r * 0.44), fur, { material: options.material, cut: true }),
        ink(ctx, 'koala-ear-inner', circlePath(cx - r * 0.92, cy - r * 0.5, r * 0.28), mix(fur, ctx.pal.surface, 0.5), { material: options.material }),
        ink(ctx, 'koala-ear-inner', circlePath(cx + r * 0.92, cy - r * 0.5, r * 0.28), mix(fur, ctx.pal.surface, 0.5), { material: options.material }),
        ink(ctx, 'koala-head', ellipsePath(cx, cy, r * 0.94, r), fur, { material: options.material, cut: true, label: 'Koala head' }),
        ink(ctx, 'koala-nose', ellipsePath(cx, cy + r * 0.28, r * 0.24, r * 0.32), inkColor, { material: options.material }),
        ...eyes(ctx, cx, cy - r * 0.2, r * 0.1, inkColor),
        ...cheeks(ctx, cx, cy, r, options.blush ?? ctx.pal.accentSoft),
      ],
      { id: ctx.id('koala-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Koala' },
    ),
  ];
}

export function foxFace(ctx: ArtCtx, options: HeadOptions & { cream?: string }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const cream = options.cream ?? mix(fur, ctx.pal.surface, 0.68);
  const inkColor = options.ink ?? ctx.pal.ink;
  const head = smoothClosedPath(
    [
      [cx - r, cy - r * 0.42],
      [cx - r * 0.42, cy - r * 0.75],
      [cx, cy + r * 0.16],
      [cx + r * 0.42, cy - r * 0.75],
      [cx + r, cy - r * 0.42],
      [cx + r * 0.52, cy + r * 0.5],
      [cx, cy + r],
      [cx - r * 0.52, cy + r * 0.5],
    ],
    0.35,
  );
  return [
    group(
      [
        shadowPlate(ctx, { d: head, dx: 1.2, dy: 1.6, opacity: 0.12 }),
        ink(ctx, 'fox-head', head, fur, { material: options.material, cut: true, label: 'Fox' }),
        ink(ctx, 'fox-ear', polygonPath([[cx - r * 0.86, cy - r * 0.5], [cx - r * 0.98, cy - r * 1.24], [cx - r * 0.28, cy - r * 0.78]]), fur, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'fox-ear', polygonPath([[cx + r * 0.86, cy - r * 0.5], [cx + r * 0.98, cy - r * 1.24], [cx + r * 0.28, cy - r * 0.78]]), fur, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'fox-ear-inner', polygonPath([[cx - r * 0.82, cy - r * 0.56], [cx - r * 0.9, cy - r * 1.06], [cx - r * 0.42, cy - r * 0.76]]), cream, {
          material: options.material,
        }),
        ink(ctx, 'fox-ear-inner', polygonPath([[cx + r * 0.82, cy - r * 0.56], [cx + r * 0.9, cy - r * 1.06], [cx + r * 0.42, cy - r * 0.76]]), cream, {
          material: options.material,
        }),
        ink(
          ctx,
          'fox-muzzle',
          smoothClosedPath(
            [
              [cx - r * 0.6, cy + r * 0.1],
              [cx, cy + r * 0.02],
              [cx + r * 0.6, cy + r * 0.1],
              [cx + r * 0.24, cy + r * 0.95],
              [cx - r * 0.24, cy + r * 0.95],
            ],
            0.4,
          ),
          cream,
          { material: options.material, cut: true },
        ),
        ink(ctx, 'fox-nose', ellipsePath(cx, cy + r * 0.24, r * 0.13, r * 0.1), inkColor, { material: options.material }),
        ...eyes(ctx, cx, cy - r * 0.18, r * 0.1, inkColor),
        ...cheeks(ctx, cx, cy, r, options.blush ?? ctx.pal.accentSoft),
      ],
      { id: ctx.id('fox-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Fox' },
    ),
  ];
}

export function deerHead(ctx: ArtCtx, options: HeadOptions & { antler?: string; ears?: boolean }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const antler = options.antler ?? ctx.pal.accentDeep;
  const inkColor = options.ink ?? ctx.pal.ink;
  const nodes: SceneNode[] = [];
  // Antlers: two branches with tines.
  for (const dir of [-1, 1] as const) {
    nodes.push(
      ink(
        ctx,
        'antler',
        smoothPath(
          [
            [cx + dir * r * 0.34, cy - r * 0.6],
            [cx + dir * r * 0.5, cy - r * 1.1],
            [cx + dir * r * 0.9, cy - r * 1.4],
            [cx + dir * r * 0.98, cy - r * 1.86],
          ],
          0.5,
        ),
        'none',
        { stroke: { color: antler, width: Math.max(0.8, r * 0.12), cap: 'round' }, material: options.material },
      ),
    );
    nodes.push(
      ink(ctx, 'antler-tine', petalPath(cx + dir * r * 0.62, cy - r * 1.2, r * 0.5, r * 0.1, -Math.PI / 2 + dir * 0.5), antler, {
        material: options.material,
      }),
    );
    nodes.push(
      ink(ctx, 'antler-tine', petalPath(cx + dir * r * 0.92, cy - r * 1.5, r * 0.44, r * 0.1, -Math.PI / 2 + dir * 0.2), antler, {
        material: options.material,
      }),
    );
    if (options.ears !== false) {
      nodes.push(
        ink(ctx, 'deer-ear', petalPath(cx + dir * r * 0.62, cy - r * 0.42, r * 0.62, r * 0.24, -Math.PI / 2 + dir * 0.85), fur, {
          material: options.material,
          cut: true,
        }),
      );
    }
  }
  nodes.push(
    ink(ctx, 'deer-head', ellipsePath(cx, cy, r * 0.72, r * 0.86), fur, { material: options.material, cut: true, label: 'Deer head' }),
    ink(ctx, 'deer-muzzle', ellipsePath(cx, cy + r * 0.52, r * 0.34, r * 0.26), options.muzzle ?? mix(fur, ctx.pal.surface, 0.6), {
      material: options.material,
    }),
    ink(ctx, 'deer-nose', ellipsePath(cx, cy + r * 0.4, r * 0.13, r * 0.1), inkColor, { material: options.material }),
    ...eyes(ctx, cx, cy - r * 0.1, r * 0.09, inkColor),
    ...cheeks(ctx, cx, cy, r * 0.8, options.blush ?? ctx.pal.accentSoft),
  );
  nodes.push(ink(ctx, 'deer-forehead', starPath(cx, cy - r * 0.42, r * 0.14, r * 0.06, 4), mix(fur, ctx.pal.surface, 0.7), { material: options.material }));
  return [group(nodes, { id: ctx.id('deer-head'), role: 'illustration', material: options.material ?? ctx.material, label: 'Deer' })];
}

export function lionFace(
  ctx: ArtCtx,
  options: HeadOptions & { mane?: string; maneLeaves?: number },
): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const mane = options.mane ?? ctx.pal.accentDeep;
  const inkColor = options.ink ?? ctx.pal.ink;
  const leaves = options.maneLeaves ?? 14;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < leaves; i += 1) {
    const a = (i / leaves) * TAU - Math.PI / 2;
    nodes.push(
      ink(ctx, 'lion-mane', petalPath(cx, cy, r * 1.3, r * 0.42, a), i % 2 === 0 ? mane : mix(mane, ctx.pal.secondary, 0.35), {
        material: options.material,
        cut: true,
        label: 'Mane',
      }),
    );
  }
  nodes.push(
    ink(ctx, 'lion-head', circlePath(cx, cy, r * 0.86), fur, { material: options.material, cut: true, label: 'Lion head' }),
    ink(ctx, 'lion-muzzle', ellipsePath(cx, cy + r * 0.36, r * 0.42, r * 0.3), mix(fur, ctx.pal.surface, 0.55), { material: options.material }),
    ink(ctx, 'lion-nose', polygonPath([[cx - r * 0.14, cy + r * 0.24], [cx + r * 0.14, cy + r * 0.24], [cx, cy + r * 0.42]]), inkColor, {
      material: options.material,
    }),
    ...eyes(ctx, cx, cy - r * 0.14, r * 0.1, inkColor),
    smile(ctx, cx, cy + r * 0.42, r * 0.34, inkColor),
  );
  return [group(nodes, { id: ctx.id('lion-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Lion' })];
}

export function monkeyFace(ctx: ArtCtx, options: HeadOptions): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const face = options.muzzle ?? mix(fur, ctx.pal.surface, 0.6);
  const inkColor = options.ink ?? ctx.pal.ink;
  return [
    group(
      [
        shadowPlate(ctx, { d: circlePath(cx, cy, r), dx: 1.2, dy: 1.5, opacity: 0.12 }),
        ink(ctx, 'monkey-ear', circlePath(cx - r * 0.98, cy, r * 0.34), fur, { material: options.material, cut: true }),
        ink(ctx, 'monkey-ear', circlePath(cx + r * 0.98, cy, r * 0.34), fur, { material: options.material, cut: true }),
        ink(ctx, 'monkey-ear-inner', circlePath(cx - r * 0.98, cy, r * 0.19), face, { material: options.material }),
        ink(ctx, 'monkey-ear-inner', circlePath(cx + r * 0.98, cy, r * 0.19), face, { material: options.material }),
        ink(ctx, 'monkey-head', ellipsePath(cx, cy, r * 0.9, r), fur, { material: options.material, cut: true, label: 'Monkey' }),
        ink(
          ctx,
          'monkey-face',
          smoothClosedPath(
            [
              [cx - r * 0.58, cy - r * 0.5],
              [cx, cy - r * 0.62],
              [cx + r * 0.58, cy - r * 0.5],
              [cx + r * 0.66, cy + r * 0.2],
              [cx, cy + r * 0.86],
              [cx - r * 0.66, cy + r * 0.2],
            ],
            0.45,
          ),
          face,
          { material: options.material, cut: true },
        ),
        ink(ctx, 'monkey-nostril', ellipsePath(cx - r * 0.12, cy + r * 0.3, r * 0.07, r * 0.05), inkColor, { material: options.material }),
        ink(ctx, 'monkey-nostril', ellipsePath(cx + r * 0.12, cy + r * 0.3, r * 0.07, r * 0.05), inkColor, { material: options.material }),
        ...eyes(ctx, cx, cy - r * 0.16, r * 0.1, inkColor),
        ...cheeks(ctx, cx, cy, r, options.blush ?? ctx.pal.accentSoft),
        smile(ctx, cx, cy + r * 0.5, r * 0.3, inkColor),
      ],
      { id: ctx.id('monkey-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Monkey' },
    ),
  ];
}

export function tigerFace(ctx: ArtCtx, options: HeadOptions & { stripe?: string }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const stripe = options.stripe ?? ctx.pal.ink;
  const inkColor = options.ink ?? ctx.pal.ink;
  const nodes: SceneNode[] = [
    ink(ctx, 'tiger-ear', circlePath(cx - r * 0.76, cy - r * 0.68, r * 0.32), fur, { material: options.material, cut: true }),
    ink(ctx, 'tiger-ear', circlePath(cx + r * 0.76, cy - r * 0.68, r * 0.32), fur, { material: options.material, cut: true }),
    ink(ctx, 'tiger-head', circlePath(cx, cy, r * 0.94), fur, { material: options.material, cut: true, label: 'Tiger' }),
    ink(ctx, 'tiger-muzzle', ellipsePath(cx, cy + r * 0.4, r * 0.6, r * 0.38), mix(fur, ctx.pal.surface, 0.7), { material: options.material, cut: true }),
    ink(ctx, 'tiger-nose', polygonPath([[cx - r * 0.16, cy + r * 0.24], [cx + r * 0.16, cy + r * 0.24], [cx, cy + r * 0.44]]), ctx.pal.accent, {
      material: options.material,
    }),
    ...eyes(ctx, cx, cy - r * 0.12, r * 0.1, inkColor),
  ];
  for (const dir of [-1, 1] as const) {
    for (let i = 0; i < 3; i += 1) {
      const y = cy - r * 0.66 + i * r * 0.3;
      nodes.push(
        ink(
          ctx,
          'tiger-stripe',
          polygonPath([
            [cx + dir * r * 0.42, y - r * 0.07],
            [cx + dir * r * 0.86, y - r * 0.12],
            [cx + dir * r * 0.84, y + r * 0.12],
            [cx + dir * r * 0.44, y + r * 0.08],
          ]),
          stripe,
          { material: options.material },
        ),
      );
    }
  }
  nodes.push(...cheeks(ctx, cx, cy + r * 0.1, r * 0.8, options.blush ?? ctx.pal.accentSoft));
  return [group(nodes, { id: ctx.id('tiger-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Tiger' })];
}

export function cowFace(ctx: ArtCtx, options: HeadOptions & { spot?: string }): SceneNode[] {
  const { cx, cy, r } = options;
  const fur = options.fur;
  const spot = options.spot ?? ctx.pal.ink;
  const inkColor = options.ink ?? ctx.pal.ink;
  return [
    group(
      [
        ink(ctx, 'cow-horn', petalPath(cx - r * 0.62, cy - r * 0.56, r * 0.5, r * 0.16, -Math.PI / 2 - 0.6), ctx.pal.secondarySoft, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'cow-horn', petalPath(cx + r * 0.62, cy - r * 0.56, r * 0.5, r * 0.16, -Math.PI / 2 + 0.6), ctx.pal.secondarySoft, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'cow-ear', petalPath(cx - r * 0.8, cy - r * 0.28, r * 0.6, r * 0.22, Math.PI - 0.35), fur, { material: options.material, cut: true }),
        ink(ctx, 'cow-ear', petalPath(cx + r * 0.8, cy - r * 0.28, r * 0.6, r * 0.22, 0.35), fur, { material: options.material, cut: true }),
        ink(ctx, 'cow-head', ellipsePath(cx, cy + r * 0.06, r * 0.78, r * 0.88), fur, { material: options.material, cut: true, label: 'Cow' }),
        ink(ctx, 'cow-spot', ellipsePath(cx - r * 0.42, cy - r * 0.34, r * 0.24, r * 0.2), spot, { material: options.material, opacity: 0.9 }),
        ink(ctx, 'cow-muzzle', ellipsePath(cx, cy + r * 0.5, r * 0.44, r * 0.3), ctx.pal.accentSoft, { material: options.material, cut: true }),
        ink(ctx, 'cow-nostril', ellipsePath(cx - r * 0.15, cy + r * 0.5, r * 0.07, r * 0.05), inkColor, { material: options.material }),
        ink(ctx, 'cow-nostril', ellipsePath(cx + r * 0.15, cy + r * 0.5, r * 0.07, r * 0.05), inkColor, { material: options.material }),
        ...eyes(ctx, cx, cy - r * 0.1, r * 0.1, inkColor),
      ],
      { id: ctx.id('cow-face'), role: 'illustration', material: options.material ?? ctx.material, label: 'Cow' },
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Safari bodies                                                       */
/* ------------------------------------------------------------------ */

export interface AnimalBodyOptions {
  cx: number;
  cy: number;
  scale: number;
  body: string;
  detail?: string;
  ink?: string;
  material?: string;
  facing?: 1 | -1;
}

export function elephant(ctx: ArtCtx, options: AnimalBodyOptions & { trunkCurl?: number }): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const dir = options.facing ?? 1;
  const body = options.body;
  const detail = options.detail ?? mix(body, ctx.pal.surface, 0.5);
  const inkColor = options.ink ?? ctx.pal.ink;
  const nodes: SceneNode[] = [
    ink(ctx, 'elephant-body', ellipsePath(cx, cy, s * 1.5, s * 1.05), body, { material: options.material, cut: true, label: 'Elephant' }),
    ink(ctx, 'elephant-leg', roundedRectPath(cx - s * 1.1, cy + s * 0.6, s * 0.44, s * 0.72, s * 0.16), body, { material: options.material, cut: true }),
    ink(ctx, 'elephant-leg', roundedRectPath(cx - s * 0.3, cy + s * 0.66, s * 0.44, s * 0.7, s * 0.16), body, { material: options.material, cut: true }),
    ink(ctx, 'elephant-leg', roundedRectPath(cx + s * 0.55, cy + s * 0.6, s * 0.44, s * 0.72, s * 0.16), body, { material: options.material, cut: true }),
    ink(ctx, 'elephant-tail', petalPath(cx - s * 1.5, cy - s * 0.1, s * 0.6, s * 0.1, Math.PI * 0.85), body, { material: options.material }),
  ];
  // Trunk: an S-curve stroked shape with a rounded end.
  const trunk: Point[] = [
    [cx + dir * s * 1.2, cy - s * 0.2],
    [cx + dir * s * 1.7, cy + s * 0.3],
    [cx + dir * s * 1.5, cy + s * (0.9 + (options.trunkCurl ?? 0) * 0.2)],
    [cx + dir * s * 1.05, cy + s * 1.15],
  ];
  nodes.push(
    ink(ctx, 'elephant-trunk', smoothPath(trunk, 0.6), 'none', {
      stroke: { color: body, width: s * 0.5, cap: 'round' },
      material: options.material,
      cut: true,
      label: 'Trunk',
    }),
  );
  nodes.push(
    ink(ctx, 'elephant-ear', ellipsePath(cx + dir * s * 0.55, cy - s * 0.3, s * 0.62, s * 0.75), detail, {
      material: options.material,
      cut: true,
      label: 'Ear',
    }),
  );
  nodes.push(
    ink(ctx, 'elephant-eye', circlePath(cx + dir * s * 1.02, cy - s * 0.5, s * 0.09), inkColor, { material: options.material }),
  );
  nodes.push(
    ink(ctx, 'elephant-eye-glint', circlePath(cx + dir * s * 1.05, cy - s * 0.53, s * 0.032), ctx.pal.highlight, { material: options.material }),
  );
  nodes.push(
    ink(ctx, 'elephant-blush', circlePath(cx + dir * s * 1.16, cy - s * 0.2, s * 0.14), ctx.pal.accentSoft, {
      material: options.material,
      opacity: 0.7,
    }),
  );
  return [group(nodes, { id: ctx.id('elephant'), role: 'illustration', material: options.material ?? ctx.material, label: 'Elephant' })];
}

export function giraffe(ctx: ArtCtx, options: AnimalBodyOptions & { spots?: string; height?: number }): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const dir = options.facing ?? 1;
  const body = options.body;
  const spots = options.spots ?? mix(body, ctx.pal.accentDeep, 0.5);
  const inkColor = options.ink ?? ctx.pal.ink;
  const height = options.height ?? 2.4;
  const neckTop = cy - s * height;
  const nodes: SceneNode[] = [
    ink(ctx, 'giraffe-body', ellipsePath(cx, cy, s * 1.25, s * 0.86), body, { material: options.material, cut: true, label: 'Giraffe' }),
    ink(ctx, 'giraffe-neck', polygonPath([
      [cx + dir * s * 0.4, cy - s * 0.4],
      [cx + dir * s * 1.05, neckTop + s * 0.34],
      [cx + dir * s * 1.45, neckTop + s * 0.5],
      [cx + dir * s * 0.86, cy - s * 0.2],
    ]), body, { material: options.material, cut: true, label: 'Neck' }),
    ink(ctx, 'giraffe-head', ellipsePath(cx + dir * s * 1.24, neckTop + s * 0.36, s * 0.62, s * 0.44), body, { material: options.material, cut: true }),
    ink(ctx, 'giraffe-leg', roundedRectPath(cx - s * 1.0, cy + s * 0.5, s * 0.34, s * 0.9, s * 0.14), body, { material: options.material, cut: true }),
    ink(ctx, 'giraffe-leg', roundedRectPath(cx - s * 0.2, cy + s * 0.55, s * 0.34, s * 0.85, s * 0.14), body, { material: options.material, cut: true }),
    ink(ctx, 'giraffe-leg', roundedRectPath(cx + s * 0.6, cy + s * 0.5, s * 0.34, s * 0.9, s * 0.14), body, { material: options.material, cut: true }),
    ink(ctx, 'giraffe-ossicone', petalPath(cx + dir * s * 1.35, neckTop + s * 0.1, s * 0.36, s * 0.1, -Math.PI / 2 - dir * 0.12), mix(body, ctx.pal.ink, 0.4), {
      material: options.material,
    }),
    ink(ctx, 'giraffe-ossicone', petalPath(cx + dir * s * 1.0, neckTop + s * 0.16, s * 0.34, s * 0.1, -Math.PI / 2 - dir * 0.2), mix(body, ctx.pal.ink, 0.4), {
      material: options.material,
    }),
    ink(ctx, 'giraffe-muzzle', ellipsePath(cx + dir * s * 1.72, neckTop + s * 0.42, s * 0.24, s * 0.2), mix(body, ctx.pal.surface, 0.6), {
      material: options.material,
    }),
    ink(ctx, 'giraffe-nostril', circlePath(cx + dir * s * 1.8, neckTop + s * 0.44, s * 0.05), inkColor, { material: options.material }),
    ink(ctx, 'giraffe-eye', circlePath(cx + dir * s * 1.4, neckTop + s * 0.28, s * 0.075), inkColor, { material: options.material }),
    ink(ctx, 'giraffe-tail', smoothPath(
      [
        [cx - s * 1.2, cy - s * 0.5],
        [cx - s * 1.5, cy - s * 0.2],
        [cx - s * 1.4, cy + s * 0.2],
      ],
      0.6,
    ), 'none', { stroke: { color: body, width: s * 0.16, cap: 'round' }, material: options.material }),
  ];
  const spotList: [number, number, number][] = [
    [-0.6, -0.2, 0.22],
    [0.1, -0.36, 0.18],
    [0.7, -0.12, 0.2],
    [-0.2, 0.32, 0.16],
    [0.55, 0.32, 0.15],
    [0.75, -0.9, 0.15],
    [1.05, -1.5, 0.13],
  ];
  for (const [dx, dy, r] of spotList) {
    nodes.push(
      ink(ctx, 'giraffe-spot', ellipsePath(cx + dx * s, cy + dy * s, r * s, r * s * 0.86), spots, {
        material: options.material,
        opacity: 0.85,
      }),
    );
  }
  return [group(nodes, { id: ctx.id('giraffe'), role: 'illustration', material: options.material ?? ctx.material, label: 'Giraffe' })];
}

export function safariBird(ctx: ArtCtx, options: AnimalBodyOptions & { beak?: string; wing?: string }): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const dir = options.facing ?? 1;
  const body = options.body;
  const beak = options.beak ?? ctx.pal.accent;
  const wing = options.wing ?? mix(body, ctx.pal.primaryDeep, 0.4);
  return [
    group(
      [
        ink(ctx, 'bird-tail', petalPath(cx - dir * s * 0.9, cy + s * 0.2, s * 1.2, s * 0.3, Math.PI * 0.86 * dir), wing, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'bird-body', ellipsePath(cx, cy, s * 1.05, s * 0.86), body, { material: options.material, cut: true, label: 'Bird' }),
        ink(ctx, 'bird-belly', ellipsePath(cx + dir * s * 0.14, cy + s * 0.26, s * 0.6, s * 0.42), mix(body, ctx.pal.surface, 0.55), {
          material: options.material,
        }),
        ink(ctx, 'bird-wing', petalPath(cx - dir * s * 0.1, cy - s * 0.1, s * 0.86, s * 0.34, Math.PI * 0.62 * dir), wing, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'bird-head', circlePath(cx + dir * s * 0.86, cy - s * 0.6, s * 0.5), body, { material: options.material, cut: true }),
        ink(ctx, 'bird-beak', polygonPath([
          [cx + dir * s * 1.3, cy - s * 0.66],
          [cx + dir * s * 1.86, cy - s * 0.5],
          [cx + dir * s * 1.3, cy - s * 0.4],
        ]), beak, { material: options.material, cut: true }),
        ink(ctx, 'bird-eye', circlePath(cx + dir * s * 0.98, cy - s * 0.7, s * 0.1), ctx.pal.ink, { material: options.material }),
        ink(ctx, 'bird-eye-glint', circlePath(cx + dir * s * 1.01, cy - s * 0.73, s * 0.035), ctx.pal.highlight, { material: options.material }),
        ink(ctx, 'bird-leg', polygonPath([[cx, cy + s * 0.8], [cx, cy + s * 1.16]], false), 'none', {
          stroke: { color: ctx.pal.accentDeep, width: s * 0.1, cap: 'round' },
          material: options.material,
        }),
        ink(ctx, 'bird-leg', polygonPath([[cx + dir * s * 0.3, cy + s * 0.78], [cx + dir * s * 0.34, cy + s * 1.14]], false), 'none', {
          stroke: { color: ctx.pal.accentDeep, width: s * 0.1, cap: 'round' },
          material: options.material,
        }),
      ],
      { id: ctx.id('bird'), role: 'illustration', material: options.material ?? ctx.material, label: 'Bird' },
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Dinosaurs                                                           */
/* ------------------------------------------------------------------ */

export type DinoKind = 'trex' | 'stego' | 'brachio' | 'trike' | 'baby';

export function dino(
  ctx: ArtCtx,
  options: {
    kind: DinoKind;
    cx: number;
    cy: number;
    scale: number;
    body: string;
    belly?: string;
    plate?: string;
    ink?: string;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, scale: s, kind } = options;
  const body = options.body;
  const belly = options.belly ?? mix(body, ctx.pal.surface, 0.55);
  const plate = options.plate ?? ctx.pal.secondary;
  const inkColor = options.ink ?? ctx.pal.ink;
  const nodes: SceneNode[] = [];

  if (kind === 'stego') {
    const silhouette = smoothClosedPath(
      [
        [cx - s * 1.5, cy + s * 0.2],
        [cx - s * 1.1, cy - s * 0.5],
        [cx - s * 0.2, cy - s * 0.62],
        [cx + s * 0.7, cy - s * 0.55],
        [cx + s * 1.35, cy - s * 0.24],
        [cx + s * 1.7, cy + s * 0.06],
        [cx + s * 1.5, cy + s * 0.34],
        [cx + s * 0.7, cy + s * 0.4],
        [cx - s * 0.3, cy + s * 0.42],
        [cx - s * 1.2, cy + s * 0.5],
      ],
      0.35,
    );
    nodes.push(ink(ctx, 'dino-body', silhouette, body, { material: options.material, cut: true, label: 'Stegosaurus' }));
    nodes.push(ink(ctx, 'dino-belly', ellipsePath(cx - s * 0.1, cy + s * 0.2, s * 0.9, s * 0.22), belly, { material: options.material }));
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      const x = cx - s * (0.9 - t * 1.7);
      const y = cy - s * (0.56 + Math.sin(Math.PI * t) * 0.16);
      nodes.push(
        ink(ctx, 'dino-plate', polygonPath([[x - s * 0.24, y + s * 0.06], [x, y - s * 0.42], [x + s * 0.24, y + s * 0.06]]), plate, {
          material: options.material,
          cut: true,
          label: 'Back plate',
        }),
      );
    }
    nodes.push(ink(ctx, 'dino-spike', polygonPath([[cx - s * 1.5, cy + s * 0.2], [cx - s * 2.0, cy - s * 0.16], [cx - s * 1.62, cy + s * 0.02]]), plate, { material: options.material }));
    nodes.push(ink(ctx, 'dino-spike', polygonPath([[cx - s * 1.42, cy + s * 0.4], [cx - s * 1.96, cy + s * 0.24], [cx - s * 1.5, cy + s * 0.2]]), plate, { material: options.material }));
  } else if (kind === 'brachio') {
    nodes.push(ink(ctx, 'dino-body', ellipsePath(cx, cy, s * 1.3, s * 0.8), body, { material: options.material, cut: true, label: 'Brachiosaurus' }));
    nodes.push(
      ink(
        ctx,
        'dino-neck',
        smoothPath(
          [
            [cx + s * 0.7, cy - s * 0.4],
            [cx + s * 1.2, cy - s * 1.3],
            [cx + s * 1.5, cy - s * 2.0],
          ],
          0.55,
        ),
        'none',
        { stroke: { color: body, width: s * 0.5, cap: 'round' }, material: options.material, cut: true, label: 'Neck' },
      ),
    );
    nodes.push(ink(ctx, 'dino-head', ellipsePath(cx + s * 1.62, cy - s * 2.14, s * 0.42, s * 0.3), body, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-nostril', circlePath(cx + s * 1.9, cy - s * 2.1, s * 0.05), inkColor, { material: options.material }));
    nodes.push(ink(ctx, 'dino-eye', circlePath(cx + s * 1.62, cy - s * 2.26, s * 0.06), inkColor, { material: options.material }));
    nodes.push(ink(ctx, 'dino-tail', smoothPath(
      [
        [cx - s * 1.2, cy - s * 0.1],
        [cx - s * 1.9, cy - s * 0.2],
        [cx - s * 2.4, cy - s * 0.7],
      ],
      0.55,
    ), 'none', { stroke: { color: body, width: s * 0.34, cap: 'round' }, material: options.material }));
    nodes.push(ink(ctx, 'dino-belly', ellipsePath(cx - s * 0.2, cy + s * 0.24, s * 0.86, s * 0.24), belly, { material: options.material }));
  } else if (kind === 'trike') {
    nodes.push(ink(ctx, 'dino-body', ellipsePath(cx, cy, s * 1.35, s * 0.86), body, { material: options.material, cut: true, label: 'Triceratops' }));
    nodes.push(ink(ctx, 'dino-belly', ellipsePath(cx - s * 0.3, cy + s * 0.3, s * 0.8, s * 0.24), belly, { material: options.material }));
    nodes.push(
      ink(
        ctx,
        'dino-frill',
        smoothClosedPath(
          [
            [cx + s * 0.9, cy - s * 0.7],
            [cx + s * 1.7, cy - s * 0.9],
            [cx + s * 2.0, cy - s * 0.2],
            [cx + s * 1.5, cy + s * 0.3],
            [cx + s * 0.86, cy + s * 0.2],
          ],
          0.4,
        ),
        mix(body, plate, 0.35),
        { material: options.material, cut: true, label: 'Frill' },
      ),
    );
    nodes.push(ink(ctx, 'dino-horn', petalPath(cx + s * 1.6, cy - s * 0.5, s * 0.7, s * 0.13, -Math.PI / 2 + 0.4), plate, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-horn', petalPath(cx + s * 1.46, cy - s * 0.16, s * 0.5, s * 0.11, -Math.PI / 2 - 0.3), plate, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-beak', polygonPath([[cx + s * 1.9, cy - s * 0.1], [cx + s * 2.4, cy + s * 0.06], [cx + s * 1.9, cy + s * 0.16]]), plate, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-eye', circlePath(cx + s * 1.62, cy - s * 0.36, s * 0.08), inkColor, { material: options.material }));
    nodes.push(ink(ctx, 'dino-tail', petalPath(cx - s * 1.3, cy - s * 0.1, s * 1.3, s * 0.26, Math.PI * 0.94), body, { material: options.material }));
  } else {
    // T-Rex and baby share a body plan: big head, small arms, thick tail.
    const small = kind === 'baby';
    nodes.push(ink(ctx, 'dino-tail', petalPath(cx - s * 1.4, cy + s * 0.06, s * 1.5, s * 0.34, Math.PI * 0.96), body, {
      material: options.material,
      cut: true,
      label: 'Tail',
    }));
    nodes.push(ink(ctx, 'dino-body', ellipsePath(cx, cy, s * 1.1, s * 0.92), body, { material: options.material, cut: true, label: 'Dinosaur' }));
    nodes.push(ink(ctx, 'dino-belly', ellipsePath(cx + s * 0.06, cy + s * 0.34, s * 0.66, s * 0.3), belly, { material: options.material }));
    nodes.push(ink(ctx, 'dino-leg', roundedRectPath(cx - s * 0.42, cy + s * 0.5, s * 0.44, s * 0.72, s * 0.18), body, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-leg', roundedRectPath(cx + s * 0.3, cy + s * 0.52, s * 0.44, s * 0.7, s * 0.18), body, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'dino-foot', ellipsePath(cx - s * 0.2, cy + s * 1.24, s * 0.3, s * 0.14), mix(body, ctx.pal.ink, 0.25), { material: options.material }));
    nodes.push(ink(ctx, 'dino-foot', ellipsePath(cx + s * 0.52, cy + s * 1.24, s * 0.3, s * 0.14), mix(body, ctx.pal.ink, 0.25), { material: options.material }));
    nodes.push(ink(ctx, 'dino-arm', petalPath(cx + s * 0.7, cy + s * 0.1, s * 0.5, s * 0.14, 0.5), body, { material: options.material }));
    nodes.push(ink(ctx, 'dino-head', smoothClosedPath(
      [
        [cx + s * 0.4, cy - s * 0.9],
        [cx + s * 1.3, cy - s * 1.1],
        [cx + s * 1.7, cy - s * 0.7],
        [cx + s * 1.5, cy - s * 0.24],
        [cx + s * 0.7, cy - s * 0.2],
      ],
      0.35,
    ), body, { material: options.material, cut: true, label: 'Head' }));
    nodes.push(ink(ctx, 'dino-jaw', polygonPath([
      [cx + s * 0.8, cy - s * 0.26],
      [cx + s * 1.6, cy - s * 0.34],
      [cx + s * 1.5, cy - s * 0.1],
      [cx + s * 0.9, cy - s * 0.12],
    ]), plate, { material: options.material }));
    for (let i = 0; i < (small ? 2 : 3); i += 1) {
      const x = cx + s * (1.0 + i * 0.24);
      nodes.push(ink(ctx, 'dino-tooth', polygonPath([[x, cy - s * 0.3], [x + s * 0.1, cy - s * 0.3], [x + s * 0.05, cy - s * 0.16]]), ctx.pal.highlight, { material: options.material }));
    }
    nodes.push(ink(ctx, 'dino-eye', circlePath(cx + s * 1.16, cy - s * 0.78, s * 0.1), inkColor, { material: options.material }));
    nodes.push(ink(ctx, 'dino-eye-glint', circlePath(cx + s * 1.19, cy - s * 0.81, s * 0.035), ctx.pal.highlight, { material: options.material }));
    for (let i = 0; i < 4; i += 1) {
      const y = cy - s * 0.5 + i * s * 0.26;
      nodes.push(ink(ctx, 'dino-stripe', roundedRectPath(cx - s * 0.7 - i * s * 0.06, y, s * 0.42, s * 0.12, s * 0.06), mix(body, ctx.pal.ink, 0.2), { material: options.material }));
    }
  }
  return [group(nodes, { id: ctx.id('dino'), role: 'illustration', material: options.material ?? ctx.material, label: `Dinosaur (${kind})` })];
}

export function dinoEgg(
  ctx: ArtCtx,
  options: { cx: number; cy: number; rx: number; ry: number; fill?: Paint; spots?: string; crack?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, rx, ry } = options;
  const fill = options.fill ?? ctx.pal.surfaceAlt;
  const spots = options.spots ?? ctx.pal.primarySoft;
  const eggOutline = smoothClosedPath(
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * TAU - Math.PI / 2;
      const narrow = 1 - 0.2 * Math.max(0, Math.cos(a + Math.PI / 2));
      return [cx + Math.cos(a) * rx * (0.92 + 0.08 * narrow), cy + Math.sin(a) * ry] as Point;
    }),
    0.5,
  );
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d: eggOutline, dx: 1.4, dy: 1.8, opacity: 0.14 }),
    ink(ctx, 'egg', eggOutline, fill, { material: options.material, cut: true, label: 'Egg' }),
  ];
  const spotPositions: [number, number, number][] = [
    [-0.4, -0.2, 0.22],
    [0.28, -0.42, 0.18],
    [0.42, 0.1, 0.2],
    [-0.18, 0.34, 0.16],
    [-0.55, 0.12, 0.14],
  ];
  for (const [dx, dy, r] of spotPositions) {
    nodes.push(ink(ctx, 'egg-spot', ellipsePath(cx + dx * rx, cy + dy * ry, r * rx, r * rx * 0.86), spots, { material: options.material, opacity: 0.9 }));
  }
  if (options.crack) {
    nodes.push(
      ink(
        ctx,
        'egg-crack',
        smoothPath(
          [
            [cx - rx * 0.6, cy - ry * 0.2],
            [cx - rx * 0.2, cy - ry * 0.34],
            [cx, cy - ry * 0.1],
            [cx + rx * 0.3, cy - ry * 0.3],
            [cx + rx * 0.62, cy - ry * 0.14],
          ],
          0.4,
        ),
        'none',
        { stroke: { color: ctx.pal.outline, width: Math.max(0.5, rx * 0.05), cap: 'round' }, material: options.material },
      ),
    );
  }
  return [group(nodes, { id: ctx.id('dino-egg'), role: 'illustration', material: options.material ?? ctx.material, label: 'Egg' })];
}

export function fossil(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; spiral?: string; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const nodes: SceneNode[] = [
    ink(ctx, 'fossil-plate', ringPath(cx, cy, r, r * 0.9), mix(ctx.pal.surfaceAlt, ctx.pal.accentSoft, 0.4), {
      material: options.material,
      fillRule: 'evenodd',
      cut: true,
      label: 'Fossil',
    }),
  ];
  const turns = 2.6;
  const pts: Point[] = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = i / 60;
    const a = t * TAU * turns;
    const rad = r * 0.78 * (1 - t * 0.92);
    pts.push(polar(cx, cy, rad, a));
  }
  nodes.push(
    ink(ctx, 'fossil-spiral', smoothPath(pts, 0.5), 'none', {
      stroke: { color: options.spiral ?? ctx.pal.accentDeep, width: Math.max(0.5, r * 0.09), cap: 'round' },
      material: options.material,
    }),
  );
  return [group(nodes, { id: ctx.id('fossil'), role: 'illustration', material: options.material ?? ctx.material, label: 'Fossil' })];
}

export function volcano(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; rock: string; lava?: string; smoke?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const left = cx - w / 2;
  const top = cy - h / 2;
  const nodes: SceneNode[] = [
    ink(
      ctx,
      'volcano',
      polygonPath([
        [left, top + h],
        [left + w * 0.3, top + h * 0.28],
        [cx - w * 0.1, top],
        [cx + w * 0.1, top],
        [left + w * 0.7, top + h * 0.28],
        [left + w, top + h],
      ]),
      options.rock,
      { material: options.material, cut: true, label: 'Volcano' },
    ),
    ink(
      ctx,
      'volcano-crater',
      polygonPath([
        [cx - w * 0.12, top + h * 0.04],
        [cx + w * 0.12, top + h * 0.04],
        [cx + w * 0.16, top + h * 0.14],
        [cx - w * 0.16, top + h * 0.14],
      ]),
      options.lava ?? ctx.pal.accent,
      { material: options.material },
    ),
  ];
  // Lava streams down the flanks.
  for (const dir of [-1, 1] as const) {
    nodes.push(
      ink(
        ctx,
        'volcano-lava',
        smoothPath(
          [
            [cx + dir * w * 0.1, top + h * 0.12],
            [cx + dir * w * 0.2, top + h * 0.38],
            [cx + dir * w * 0.13, top + h * 0.6],
            [cx + dir * w * 0.24, top + h * 0.86],
          ],
          0.5,
        ),
        'none',
        { stroke: { color: options.lava ?? ctx.pal.accent, width: w * 0.05, cap: 'round' }, material: options.material },
      ),
    );
  }
  const smokeColor = options.smoke ?? ctx.pal.surface;
  for (let i = 0; i < 3; i += 1) {
    nodes.push(
      ink(ctx, 'volcano-smoke', circlePath(cx + (i - 1) * w * 0.13, top - h * 0.1 - i * h * 0.06, w * 0.1 + i * w * 0.02), smokeColor, {
        material: options.material,
        opacity: 0.85,
        role: 'accents',
      }),
    );
  }
  return [group(nodes, { id: ctx.id('volcano'), role: 'illustration', material: options.material ?? ctx.material, label: 'Volcano' })];
}

/* ------------------------------------------------------------------ */
/* Fantasy: unicorn, fairy wings, butterfly                            */
/* ------------------------------------------------------------------ */

export function unicornHead(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    scale: number;
    body: string;
    mane?: string;
    horn?: Paint;
    muzzle?: string;
    ink?: string;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body;
  const mane = options.mane ?? ctx.pal.primary;
  const horn = options.horn ?? ctx.pal.secondary;
  const muzzle = options.muzzle ?? mix(body, ctx.pal.surface, 0.5);
  const inkColor = options.ink ?? ctx.pal.ink;
  const head = smoothClosedPath(
    [
      [cx - s * 0.9, cy + s * 0.5],
      [cx - s * 0.95, cy - s * 0.6],
      [cx - s * 0.35, cy - s * 1.05],
      [cx + s * 0.45, cy - s * 0.95],
      [cx + s * 1.0, cy - s * 0.3],
      [cx + s * 0.95, cy + s * 0.35],
      [cx + s * 0.2, cy + s * 0.85],
      [cx - s * 0.5, cy + s * 0.8],
    ],
    0.4,
  );
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d: head, dx: 1.6, dy: 2, opacity: 0.14 }),
    ink(ctx, 'unicorn-head', head, body, { material: options.material, cut: true, label: 'Unicorn head' }),
    ink(ctx, 'unicorn-muzzle', ellipsePath(cx + s * 0.92, cy + s * 0.12, s * 0.36, s * 0.42), muzzle, { material: options.material, cut: true }),
    ink(ctx, 'unicorn-nostril', ellipsePath(cx + s * 1.06, cy + s * 0.06, s * 0.07, s * 0.05), inkColor, { material: options.material }),
  ];
  // Horn: a tapered spiral.
  nodes.push(
    ink(
      ctx,
      'unicorn-horn',
      polygonPath([
        [cx - s * 0.12, cy - s * 0.98],
        [cx + s * 0.2, cy - s * 0.9],
        [cx + s * 0.24, cy - s * 1.7],
      ]),
      horn,
      { material: options.material, cut: true, label: 'Horn' },
    ),
  );
  for (let i = 1; i <= 3; i += 1) {
    const t = i / 4;
    nodes.push(
      ink(
        ctx,
        'unicorn-horn-line',
        polygonPath([
          [cx - s * 0.12 + s * 0.3 * t, cy - s * (0.98 + 0.7 * t)],
          [cx + s * 0.2 - s * 0.02 * t, cy - s * (0.9 + 0.68 * t)],
        ], false),
        'none',
        { stroke: { color: mix(String(horn).slice(0, 7), ctx.pal.surface, 0.5), width: s * 0.05 }, material: options.material },
      ),
    );
  }
  // Mane: overlapping petals from the forehead down the neck.
  const maneColors = [mane, mix(mane, ctx.pal.secondary, 0.4), mix(mane, ctx.pal.accentSoft, 0.5)];
  for (let i = 0; i < 6; i += 1) {
    const a = -Math.PI * 0.86 + i * 0.42;
    const p = polar(cx - s * 0.2, cy - s * 0.35, s * (1.05 + (i % 2) * 0.08), a);
    nodes.push(
      ink(ctx, 'unicorn-mane', petalPath(p[0], p[1], s * 0.75, s * 0.28, a + Math.PI * 0.84), maneColors[i % maneColors.length]!, {
        material: options.material,
        cut: true,
        label: 'Mane',
      }),
    );
  }
  nodes.push(ink(ctx, 'unicorn-ear', petalPath(cx - s * 0.18, cy - s * 0.86, s * 0.5, s * 0.2, -Math.PI / 2 - 0.4), body, { material: options.material, cut: true }));
  nodes.push(ink(ctx, 'unicorn-ear-inner', petalPath(cx - s * 0.2, cy - s * 0.88, s * 0.34, s * 0.1, -Math.PI / 2 - 0.4), ctx.pal.accentSoft, { material: options.material }));
  nodes.push(ink(ctx, 'unicorn-eye', circlePath(cx + s * 0.44, cy - s * 0.28, s * 0.11), inkColor, { material: options.material }));
  nodes.push(ink(ctx, 'unicorn-eye-glint', circlePath(cx + s * 0.47, cy - s * 0.32, s * 0.04), ctx.pal.highlight, { material: options.material }));
  nodes.push(ink(ctx, 'unicorn-lash', polygonPath([[cx + s * 0.5, cy - s * 0.4], [cx + s * 0.62, cy - s * 0.5]], false), 'none', {
    stroke: { color: inkColor, width: s * 0.05, cap: 'round' },
    material: options.material,
  }));
  nodes.push(ink(ctx, 'unicorn-blush', circlePath(cx + s * 0.7, cy + s * 0.3, s * 0.16), ctx.pal.accentSoft, { material: options.material, opacity: 0.75 }));
  return [group(nodes, { id: ctx.id('unicorn'), role: 'illustration', material: options.material ?? ctx.material, label: 'Unicorn' })];
}

export function fairyWings(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; fill?: Paint; vein?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const fill = options.fill ?? ctx.pal.secondarySoft;
  const vein = options.vein ?? mix(String(fill).slice(0, 7) || ctx.pal.secondary, ctx.pal.highlight, 0.6);
  const nodes: SceneNode[] = [];
  for (const dir of [-1, 1] as const) {
    const upper = smoothClosedPath(
      [
        [cx + dir * s * 0.1, cy],
        [cx + dir * s * 1.1, cy - s * 0.9],
        [cx + dir * s * 1.9, cy - s * 0.5],
        [cx + dir * s * 1.6, cy + s * 0.2],
        [cx + dir * s * 0.5, cy + s * 0.28],
      ],
      0.5,
    );
    const lower = smoothClosedPath(
      [
        [cx + dir * s * 0.2, cy + s * 0.2],
        [cx + dir * s * 1.2, cy + s * 0.35],
        [cx + dir * s * 1.5, cy + s * 1.05],
        [cx + dir * s * 0.7, cy + s * 1.15],
        [cx + dir * s * 0.16, cy + s * 0.6],
      ],
      0.5,
    );
    nodes.push(ink(ctx, 'fairy-wing', upper, fill, { material: options.material, cut: true, label: 'Wing', opacity: 0.95 }));
    nodes.push(ink(ctx, 'fairy-wing', lower, mix(String(fill).slice(0, 7) || ctx.pal.secondarySoft, ctx.pal.accentSoft, 0.5), {
      material: options.material,
      cut: true,
      opacity: 0.95,
    }));
    for (let i = 0; i < 3; i += 1) {
      const t = 0.3 + i * 0.22;
      nodes.push(
        ink(ctx, 'fairy-vein', polygonPath([
          [cx + dir * s * 0.2, cy + s * 0.05],
          [cx + dir * s * (0.6 + t * 1.1), cy - s * (0.7 * t)],
        ], false), 'none', { stroke: { color: vein, width: s * 0.05, cap: 'round' }, material: options.material, opacity: 0.8 }),
      );
    }
  }
  return [group(nodes, { id: ctx.id('fairy-wings'), role: 'illustration', material: options.material ?? ctx.material, label: 'Wings' })];
}

export function butterfly(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    scale: number;
    colors: [string, string, string];
    spots?: string;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const [upper, lower, body] = options.colors;
  const spots = options.spots ?? ctx.pal.highlight;
  const nodes: SceneNode[] = [];
  for (const dir of [-1, 1] as const) {
    nodes.push(
      ink(
        ctx,
        'butterfly-wing',
        smoothClosedPath(
          [
            [cx + dir * s * 0.08, cy - s * 0.12],
            [cx + dir * s * 0.9, cy - s * 1.15],
            [cx + dir * s * 1.6, cy - s * 0.6],
            [cx + dir * s * 1.1, cy + s * 0.05],
          ],
          0.5,
        ),
        upper,
        { material: options.material, cut: true, label: 'Upper wing' },
      ),
    );
    nodes.push(
      ink(
        ctx,
        'butterfly-wing',
        smoothClosedPath(
          [
            [cx + dir * s * 0.1, cy + s * 0.02],
            [cx + dir * s * 1.0, cy + s * 0.24],
            [cx + dir * s * 1.25, cy + s * 1.0],
            [cx + dir * s * 0.6, cy + s * 0.86],
            [cx + dir * s * 0.16, cy + s * 0.4],
          ],
          0.5,
        ),
        lower,
        { material: options.material, cut: true, label: 'Lower wing' },
      ),
    );
    nodes.push(ink(ctx, 'butterfly-spot', circlePath(cx + dir * s * 0.92, cy - s * 0.62, s * 0.16), spots, { material: options.material, opacity: 0.9 }));
    nodes.push(ink(ctx, 'butterfly-spot', circlePath(cx + dir * s * 0.62, cy + s * 0.6, s * 0.11), spots, { material: options.material, opacity: 0.9 }));
  }
  nodes.push(ink(ctx, 'butterfly-body', ellipsePath(cx, cy, s * 0.13, s * 0.72), body, { material: options.material, cut: true, label: 'Body' }));
  nodes.push(ink(ctx, 'butterfly-head', circlePath(cx, cy - s * 0.78, s * 0.15), body, { material: options.material }));
  nodes.push(
    ink(
      ctx,
      'butterfly-antenna',
      smoothPath([[cx, cy - s * 0.9], [cx - s * 0.34, cy - s * 1.36], [cx - s * 0.5, cy - s * 1.28]], 0.5),
      'none',
      { stroke: { color: body, width: s * 0.06, cap: 'round' }, material: options.material },
    ),
  );
  nodes.push(
    ink(
      ctx,
      'butterfly-antenna',
      smoothPath([[cx, cy - s * 0.9], [cx + s * 0.34, cy - s * 1.36], [cx + s * 0.5, cy - s * 1.28]], 0.5),
      'none',
      { stroke: { color: body, width: s * 0.06, cap: 'round' }, material: options.material },
    ),
  );
  return [group(nodes, { id: ctx.id('butterfly'), role: 'illustration', material: options.material ?? ctx.material, label: 'Butterfly' })];
}

export function bee(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; stripe?: string; wing?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.secondary;
  const stripe = options.stripe ?? ctx.pal.ink;
  const wing = options.wing ?? ctx.pal.highlight;
  return [
    group(
      [
        ink(ctx, 'bee-wing', ellipsePath(cx - s * 0.3, cy - s * 0.75, s * 0.42, s * 0.28), wing, { material: options.material, opacity: 0.85, cut: true }),
        ink(ctx, 'bee-wing', ellipsePath(cx + s * 0.42, cy - s * 0.8, s * 0.38, s * 0.25), wing, { material: options.material, opacity: 0.85, cut: true }),
        ink(ctx, 'bee-body', ellipsePath(cx, cy, s * 0.9, s * 0.66), body, { material: options.material, cut: true, label: 'Bee' }),
        ink(ctx, 'bee-stripe', roundedRectPath(cx - s * 0.3, cy - s * 0.55, s * 0.22, s * 1.1, s * 0.08), stripe, { material: options.material }),
        ink(ctx, 'bee-stripe', roundedRectPath(cx + s * 0.24, cy - s * 0.5, s * 0.22, s * 1.0, s * 0.08), stripe, { material: options.material }),
        ink(ctx, 'bee-head', circlePath(cx - s * 0.82, cy - s * 0.1, s * 0.34), stripColor(ctx, body), { material: options.material, cut: true }),
        ink(ctx, 'bee-eye', circlePath(cx - s * 0.94, cy - s * 0.2, s * 0.09), ctx.pal.ink, { material: options.material }),
        ink(ctx, 'bee-antenna', smoothPath([[cx - s * 0.9, cy - s * 0.44], [cx - s * 1.1, cy - s * 0.86]], 0.4), 'none', {
          stroke: { color: ctx.pal.ink, width: s * 0.06, cap: 'round' },
          material: options.material,
        }),
        ink(ctx, 'bee-stinger', polygonPath([[cx + s * 0.86, cy], [cx + s * 1.2, cy + s * 0.06], [cx + s * 0.86, cy + s * 0.2]]), ctx.pal.ink, {
          material: options.material,
        }),
      ],
      { id: ctx.id('bee'), role: 'illustration', material: options.material ?? ctx.material, label: 'Bee' },
    ),
  ];
}

function stripColor(ctx: ArtCtx, color: string): string {
  return mix(color, ctx.pal.ink, 0.15);
}

/** Hen / chick — farm templates. */
export function chicken(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; comb?: string; beak?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.surface;
  const comb = options.comb ?? ctx.pal.accent;
  const beak = options.beak ?? ctx.pal.secondary;
  return [
    group(
      [
        ink(ctx, 'chicken-body', ellipsePath(cx, cy + s * 0.1, s * 0.95, s * 0.82), body, { material: options.material, cut: true, label: 'Chicken' }),
        ink(ctx, 'chicken-tail', petalPath(cx - s * 0.7, cy - s * 0.2, s * 0.9, s * 0.34, Math.PI * 0.9), mix(body, ctx.pal.secondary, 0.35), {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'chicken-wing', petalPath(cx - s * 0.1, cy, s * 0.7, s * 0.3, Math.PI * 0.34), mix(body, ctx.pal.secondarySoft, 0.5), {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'chicken-head', circlePath(cx + s * 0.62, cy - s * 0.62, s * 0.44), body, { material: options.material, cut: true }),
        ink(ctx, 'chicken-comb', petalPath(cx + s * 0.62, cy - s * 1.0, s * 0.3, s * 0.16, -Math.PI / 2 - 0.5), comb, { material: options.material }),
        ink(ctx, 'chicken-comb', petalPath(cx + s * 0.78, cy - s * 0.98, s * 0.24, s * 0.14, -Math.PI / 2 + 0.4), comb, { material: options.material }),
        ink(ctx, 'chicken-beak', polygonPath([
          [cx + s * 1.0, cy - s * 0.66],
          [cx + s * 1.4, cy - s * 0.56],
          [cx + s * 1.0, cy - s * 0.44],
        ]), beak, { material: options.material, cut: true }),
        ink(ctx, 'chicken-wattle', ellipsePath(cx + s * 0.94, cy - s * 0.26, s * 0.1, s * 0.14), comb, { material: options.material }),
        ink(ctx, 'chicken-eye', circlePath(cx + s * 0.7, cy - s * 0.7, s * 0.08), ctx.pal.ink, { material: options.material }),
        ink(ctx, 'chicken-leg', polygonPath([[cx - s * 0.1, cy + s * 0.86], [cx - s * 0.1, cy + s * 1.16]], false), 'none', {
          stroke: { color: beak, width: s * 0.09, cap: 'round' },
          material: options.material,
        }),
        ink(ctx, 'chicken-leg', polygonPath([[cx + s * 0.34, cy + s * 0.86], [cx + s * 0.34, cy + s * 1.16]], false), 'none', {
          stroke: { color: beak, width: s * 0.09, cap: 'round' },
          material: options.material,
        }),
      ],
      { id: ctx.id('chicken'), role: 'illustration', material: options.material ?? ctx.material, label: 'Chicken' },
    ),
  ];
}

/** Sitting teddy with a balloon string — the classic first-birthday motif. */
export function teddySitting(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; fur: string; muzzle?: string; bow?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const fur = options.fur;
  const muzzle = options.muzzle ?? mix(fur, ctx.pal.surface, 0.55);
  const bow = options.bow ?? ctx.pal.accent;
  return [
    group(
      [
        shadowPlate(ctx, { d: ellipsePath(cx, cy + s * 1.5, s * 1.6, s * 0.28), dx: 0, dy: 0, opacity: 0.1 }),
        ink(ctx, 'teddy-foot', ellipsePath(cx - s * 0.72, cy + s * 1.28, s * 0.5, s * 0.34), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-foot', ellipsePath(cx + s * 0.72, cy + s * 1.28, s * 0.5, s * 0.34), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-foot-pad', ellipsePath(cx - s * 0.72, cy + s * 1.28, s * 0.26, s * 0.18), muzzle, { material: options.material }),
        ink(ctx, 'teddy-foot-pad', ellipsePath(cx + s * 0.72, cy + s * 1.28, s * 0.26, s * 0.18), muzzle, { material: options.material }),
        ink(ctx, 'teddy-arm', ellipsePath(cx - s * 1.05, cy + s * 0.3, s * 0.34, s * 0.56), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-arm', ellipsePath(cx + s * 1.05, cy + s * 0.3, s * 0.34, s * 0.56), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-body', ellipsePath(cx, cy + s * 0.55, s * 1.05, s * 0.95), fur, { material: options.material, cut: true, label: 'Teddy body' }),
        ink(ctx, 'teddy-belly', ellipsePath(cx, cy + s * 0.7, s * 0.6, s * 0.55), muzzle, { material: options.material }),
        ink(ctx, 'teddy-ear', circlePath(cx - s * 0.62, cy - s * 0.88, s * 0.32), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-ear', circlePath(cx + s * 0.62, cy - s * 0.88, s * 0.32), fur, { material: options.material, cut: true }),
        ink(ctx, 'teddy-ear-inner', circlePath(cx - s * 0.62, cy - s * 0.88, s * 0.17), muzzle, { material: options.material }),
        ink(ctx, 'teddy-ear-inner', circlePath(cx + s * 0.62, cy - s * 0.88, s * 0.17), muzzle, { material: options.material }),
        ink(ctx, 'teddy-head', circlePath(cx, cy - s * 0.28, s * 0.82), fur, { material: options.material, cut: true, label: 'Teddy head' }),
        ink(ctx, 'teddy-muzzle', ellipsePath(cx, cy + s * 0.02, s * 0.42, s * 0.32), muzzle, { material: options.material }),
        ink(ctx, 'teddy-nose', ellipsePath(cx, cy - s * 0.14, s * 0.13, s * 0.1), ctx.pal.ink, { material: options.material }),
        smile(ctx, cx, cy + s * 0.06, s * 0.28, ctx.pal.ink),
        ...eyes(ctx, cx, cy - s * 0.44, s * 0.09, ctx.pal.ink),
        ...cheeks(ctx, cx, cy - s * 0.4, s * 0.8, ctx.pal.accentSoft),
        ink(ctx, 'teddy-bow', petalPath(cx - s * 0.12, cy + s * 0.2, s * 0.42, s * 0.16, Math.PI * 0.84), bow, { material: options.material }),
        ink(ctx, 'teddy-bow', petalPath(cx + s * 0.12, cy + s * 0.2, s * 0.42, s * 0.16, Math.PI * 0.16), bow, { material: options.material }),
        ink(ctx, 'teddy-bow-knot', circlePath(cx, cy + s * 0.22, s * 0.12), bow, { material: options.material }),
      ],
      { id: ctx.id('teddy'), role: 'illustration', material: options.material ?? ctx.material, label: 'Teddy bear' },
    ),
  ];
}

/** Woodland fox sitting, for the fox-and-deer template. */
export function foxSitting(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; fur: string; cream?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const fur = options.fur;
  const cream = options.cream ?? mix(fur, ctx.pal.surface, 0.7);
  return [
    group(
      [
        ink(ctx, 'fox-tail', smoothClosedPath(
          [
            [cx - s * 0.8, cy + s * 0.7],
            [cx - s * 1.7, cy + s * 0.2],
            [cx - s * 1.4, cy - s * 0.5],
            [cx - s * 0.9, cy - s * 0.1],
          ],
          0.5,
        ), fur, { material: options.material, cut: true, label: 'Tail' }),
        ink(ctx, 'fox-tail-tip', smoothClosedPath(
          [
            [cx - s * 1.7, cy + s * 0.2],
            [cx - s * 1.4, cy - s * 0.5],
            [cx - s * 1.15, cy - s * 0.34],
            [cx - s * 1.4, cy + s * 0.1],
          ],
          0.5,
        ), cream, { material: options.material }),
        ink(ctx, 'fox-body', ellipsePath(cx, cy + s * 0.72, s * 0.9, s * 0.66), fur, { material: options.material, cut: true, label: 'Fox body' }),
        ink(ctx, 'fox-chest', ellipsePath(cx + s * 0.1, cy + s * 0.74, s * 0.44, s * 0.5), cream, { material: options.material }),
        ink(ctx, 'fox-leg', ellipsePath(cx - s * 0.42, cy + s * 1.3, s * 0.26, s * 0.16), cream, { material: options.material }),
        ink(ctx, 'fox-leg', ellipsePath(cx + s * 0.42, cy + s * 1.3, s * 0.26, s * 0.16), cream, { material: options.material }),
        ink(ctx, 'fox-head', smoothClosedPath(
          [
            [cx - s * 0.6, cy - s * 0.15],
            [cx - s * 0.24, cy - s * 0.44],
            [cx, cy + s * 0.06],
            [cx + s * 0.24, cy - s * 0.44],
            [cx + s * 0.6, cy - s * 0.15],
            [cx + s * 0.3, cy + s * 0.34],
            [cx, cy + s * 0.62],
            [cx - s * 0.3, cy + s * 0.34],
          ],
          0.35,
        ), fur, { material: options.material, cut: true, label: 'Fox head' }),
        ink(ctx, 'fox-ear', polygonPath([[cx - s * 0.5, cy - s * 0.24], [cx - s * 0.6, cy - s * 0.82], [cx - s * 0.16, cy - s * 0.46]]), fur, { material: options.material, cut: true }),
        ink(ctx, 'fox-ear', polygonPath([[cx + s * 0.5, cy - s * 0.24], [cx + s * 0.6, cy - s * 0.82], [cx + s * 0.16, cy - s * 0.46]]), fur, { material: options.material, cut: true }),
        ink(ctx, 'fox-muzzle', smoothClosedPath(
          [
            [cx - s * 0.34, cy - s * 0.1],
            [cx, cy - s * 0.16],
            [cx + s * 0.34, cy - s * 0.1],
            [cx + s * 0.16, cy + s * 0.54],
            [cx - s * 0.16, cy + s * 0.54],
          ],
          0.4,
        ), cream, { material: options.material }),
        ink(ctx, 'fox-nose', ellipsePath(cx, cy + s * 0.1, s * 0.09, s * 0.07), ctx.pal.ink, { material: options.material }),
        ...eyes(ctx, cx, cy - s * 0.14, s * 0.07, ctx.pal.ink),
        ...cheeks(ctx, cx, cy - s * 0.08, s * 0.6, ctx.pal.accentSoft),
      ],
      { id: ctx.id('fox-sitting'), role: 'illustration', material: options.material ?? ctx.material, label: 'Fox' },
    ),
  ];
}

export { eyes, cheeks, shade };
