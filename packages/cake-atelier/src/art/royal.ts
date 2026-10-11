/**
 * @mazi/cake-atelier — royal collection
 *
 * Crowns, tiaras, crests, castles and the throne. Every shape is original
 * geometry drawn from arcs and cubics — no traced or borrowed artwork.
 */

import {
  arcPath,
  circlePath,
  ellipsePath,
  polygonPath,
  polar,
  rectPath,
  ringPath,
  round,
  roundedRectPath,
  smoothClosedPath,
  starPath,
  TAU,
  type Point,
} from '../geometry.js';
import { foilGradient, mix, shade } from '../palettes.js';
import type { GroupNode, Paint, SceneNode } from '../scene.js';
import { group } from '../scene.js';
import { ink, line, stack, deg, type ArtCtx } from './helpers.js';
import { medallion, shadowPlate, starCluster } from './decor.js';

export interface CrownOptions {
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** `classic` five points, `tall` cathedral spikes, `queen` scalloped band. */
  style?: 'classic' | 'tall' | 'queen' | 'child';
  metal?: Paint;
  base: string;
  jewel: string;
  pearl?: string;
  material?: string;
  tilt?: number;
}

/** Layered paper crown: band, spikes, jewels, pearls. */
export function crown(ctx: ArtCtx, options: CrownOptions): SceneNode[] {
  const { cx, cy, width, height } = options;
  const metal = options.metal ?? foilGradient(ctx.pal, [cx - width / 2, cy - height], [cx + width / 2, cy + height * 0.2]);
  const base = options.base;
  const jewel = options.jewel;
  const pearl = options.pearl ?? ctx.pal.highlight;
  const style = options.style ?? 'classic';
  const tilt = options.tilt ?? 0;
  const left = cx - width / 2;
  const right = cx + width / 2;
  const bandH = height * 0.3;
  const bandY = cy + height * 0.5 - bandH;

  const spikes: Point[] =
    style === 'tall'
      ? [
          [left, bandY],
          [left + width * 0.1, bandY - height * 0.42],
          [left + width * 0.2, bandY - height * 0.06],
          [cx, bandY - height * 0.78],
          [right - width * 0.2, bandY - height * 0.06],
          [right - width * 0.1, bandY - height * 0.42],
          [right, bandY],
        ]
      : style === 'queen'
        ? [
            [left, bandY],
            [left, bandY - height * 0.34],
            [left + width * 0.25, bandY - height * 0.62],
            [cx, bandY - height * 0.86],
            [right - width * 0.25, bandY - height * 0.62],
            [right, bandY - height * 0.34],
            [right, bandY],
          ]
        : style === 'child'
          ? [
              [left, bandY],
              [left + width * 0.18, bandY - height * 0.4],
              [left + width * 0.34, bandY - height * 0.16],
              [cx, bandY - height * 0.62],
              [right - width * 0.34, bandY - height * 0.16],
              [right - width * 0.18, bandY - height * 0.4],
              [right, bandY],
            ]
          : [
              [left, bandY],
              [left + width * 0.2, bandY - height * 0.58],
              [left + width * 0.36, bandY - height * 0.22],
              [cx, bandY - height * 0.74],
              [right - width * 0.36, bandY - height * 0.22],
              [right - width * 0.2, bandY - height * 0.58],
              [right, bandY],
            ];

  const body = smoothClosedPath(spikes, 0.35);
  const nodes: SceneNode[] = [];
  nodes.push(shadowPlate(ctx, { d: body, dx: 1.6, dy: 2 }));
  nodes.push(ink(ctx, 'crown-body', body, metal, { material: options.material, cut: true, label: 'Crown' }));
  nodes.push(
    ink(ctx, 'crown-band', roundedRectPath(left, bandY, width, bandH, bandH * 0.24), base, {
      material: options.material,
      cut: true,
      label: 'Crown band',
    }),
  );
  nodes.push(
    ink(ctx, 'crown-band-rule', roundedRectPath(left + width * 0.02, bandY + bandH * 0.62, width * 0.96, bandH * 0.16, bandH * 0.08), pearl, {
      material: options.material,
      opacity: 0.85,
    }),
  );
  // Jewels: one per spike valley.
  const jewelCount = style === 'tall' ? 5 : 4;
  for (let i = 0; i < jewelCount; i += 1) {
    const t = (i + 0.5) / jewelCount;
    const jx = left + width * (0.14 + t * 0.72);
    nodes.push(ink(ctx, 'crown-jewel', circlePath(jx, bandY + bandH * 0.42, bandH * 0.22), i % 2 === 0 ? jewel : pearl, { material: options.material }));
  }
  if (style === 'tall' || style === 'queen') {
    nodes.push(ink(ctx, 'crown-cross', polygonPath([[cx - width * 0.03, bandY - height * 0.78], [cx + width * 0.03, bandY - height * 0.78], [cx + width * 0.03, bandY - height * 0.6], [cx - width * 0.03, bandY - height * 0.6]]), jewel, { material: options.material }));
    nodes.push(ink(ctx, 'crown-cross', polygonPath([[cx - width * 0.06, bandY - height * 0.71], [cx + width * 0.06, bandY - height * 0.71], [cx + width * 0.06, bandY - height * 0.67], [cx - width * 0.06, bandY - height * 0.67]]), jewel, { material: options.material }));
  }
  const groupNode = group(
    tilt ? nodes.map((n) => (n.transform ? n : { ...n, transform: [Math.cos(tilt), Math.sin(tilt), -Math.sin(tilt), Math.cos(tilt), cx - cx * Math.cos(tilt) + cy * Math.sin(tilt), cy - cx * Math.sin(tilt) - cy * Math.cos(tilt)] as const })) : nodes,
    { id: ctx.id('crown'), role: 'illustration', material: ctx.material, label: 'Crown' },
  );
  return [groupNode];
}

/** Slim tiara for princess templates — a low arc with a rising centre stone. */
export function tiara(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    width: number;
    height: number;
    metal?: Paint;
    stone: string;
    pearl?: string;
    style?: 'arc' | 'pearl' | 'v' | 'halo';
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, width, height } = options;
  const style = options.style ?? 'arc';
  const metal = options.metal ?? foilGradient(ctx.pal, [cx - width / 2, cy], [cx + width / 2, cy + height * 0.4]);
  const pearl = options.pearl ?? ctx.pal.highlight;
  const nodes: SceneNode[] = [];

  if (style === 'halo') {
    const d = ringPath(cx, cy + height * 0.2, width / 2, width / 2 - height * 0.2);
    nodes.push(ink(ctx, 'tiara-halo', d, metal, { material: options.material, fillRule: 'evenodd', cut: true, label: 'Halo' }));
  } else {
    const bandTop = polygonPath([
      [cx - width / 2, cy],
      [cx - width * 0.28, cy - height * 0.34],
      [cx, cy - height * (style === 'v' ? 0.62 : 0.5)],
      [cx + width * 0.28, cy - height * 0.34],
      [cx + width / 2, cy],
      [cx + width * 0.44, cy + height * 0.2],
      [cx - width * 0.44, cy + height * 0.2],
    ]);
    nodes.push(shadowPlate(ctx, { d: bandTop, dx: 1.2, dy: 1.6 }));
    nodes.push(ink(ctx, 'tiara-band', bandTop, metal, { material: options.material, cut: true, label: 'Tiara' }));
  }

  nodes.push(
    ink(ctx, 'tiara-stone', starPath(cx, cy - height * (style === 'v' ? 0.62 : 0.5), height * 0.16, height * 0.08, 4), options.stone, {
      material: options.material,
    }),
  );
  nodes.push(
    ink(
      ctx,
      'tiara-stone',
      polygonPath([
        [cx, cy - height * 0.52],
        [cx + height * 0.11, cy - height * 0.4],
        [cx, cy - height * 0.28],
        [cx - height * 0.11, cy - height * 0.4],
      ]),
      options.stone,
      { material: options.material },
    ),
  );
  if (style === 'pearl' || style === 'arc') {
    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const px = cx - width * 0.4 + width * 0.8 * t;
      const py = cy + height * 0.02 + Math.sin(Math.PI * t) * height * 0.1;
      nodes.push(ink(ctx, 'tiara-pearl', circlePath(px, py, height * 0.045), pearl, { material: options.material }));
    }
  }
  return [group(nodes, { id: ctx.id('tiara'), role: 'illustration', material: ctx.material, label: 'Tiara' })];
}

export interface CrestOptions {
  cx: number;
  cy: number;
  w: number;
  h: number;
  fill?: Paint;
  border?: string;
  /** Inner charge: `star`, `heart`, `bolt` or `initial`. */
  charge?: 'star' | 'heart' | 'bolt' | 'cross' | 'none';
  chargeColor?: string;
  bandColor?: string;
  material?: string;
}

/** Heraldic shield with a division line and a charge. */
export function crest(ctx: ArtCtx, options: CrestOptions): SceneNode[] {
  const { cx, cy, w, h } = options;
  const top = cy - h / 2;
  const left = cx - w / 2;
  const border = options.border ?? ctx.pal.accentDeep;
  const fill = options.fill ?? ctx.pal.primary;
  const outline: Point[] = [
    [left, top],
    [left + w, top],
    [left + w, top + h * 0.52],
    [left + w * 0.86, top + h * 0.78],
    [cx, top + h],
    [left + w * 0.14, top + h * 0.78],
    [left, top + h * 0.52],
  ];
  const d = smoothClosedPath(outline, 0.2);
  const inner: Point[] = [
    [left + w * 0.09, top + h * 0.1],
    [left + w * 0.91, top + h * 0.1],
    [left + w * 0.91, top + h * 0.5],
    [left + w * 0.79, top + h * 0.72],
    [cx, top + h * 0.9],
    [left + w * 0.21, top + h * 0.72],
    [left + w * 0.09, top + h * 0.5],
  ];
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d, dx: 1.6, dy: 2 }),
    ink(ctx, 'crest', d, border, { material: options.material, cut: true, label: 'Shield' }),
    ink(ctx, 'crest-inner', smoothClosedPath(inner, 0.2), fill, { material: options.material, cut: true }),
  ];
  if (options.bandColor) {
    nodes.push(
      ink(
        ctx,
        'crest-band',
        polygonPath([
          [left + w * 0.09, top + h * 0.56],
          [left + w * 0.91, top + h * 0.56],
          [left + w * 0.91, top + h * 0.68],
          [left + w * 0.09, top + h * 0.68],
        ]),
        options.bandColor,
        { material: options.material },
      ),
    );
  }
  const chargeColor = options.chargeColor ?? ctx.pal.accent;
  if (options.charge === 'star') {
    nodes.push(ink(ctx, 'crest-charge', starPath(cx, top + h * 0.36, h * 0.22, h * 0.09, 5), chargeColor));
  } else if (options.charge === 'heart') {
    nodes.push(
      ink(
        ctx,
        'crest-charge',
        smoothClosedPath(
          [
            [cx, top + h * 0.52],
            [cx - w * 0.24, top + h * 0.28],
            [cx - w * 0.08, top + h * 0.16],
            [cx, top + h * 0.28],
            [cx + w * 0.08, top + h * 0.16],
            [cx + w * 0.24, top + h * 0.28],
          ],
          0.4,
        ),
        chargeColor,
      ),
    );
  } else if (options.charge === 'bolt') {
    nodes.push(
      ink(
        ctx,
        'crest-charge',
        polygonPath([
          [cx - w * 0.1, top + h * 0.16],
          [cx + w * 0.14, top + h * 0.16],
          [cx + w * 0.02, top + h * 0.36],
          [cx + w * 0.16, top + h * 0.36],
          [cx - w * 0.12, top + h * 0.62],
          [cx - w * 0.02, top + h * 0.4],
          [cx - w * 0.16, top + h * 0.4],
        ]),
        chargeColor,
      ),
    );
  } else if (options.charge === 'cross') {
    nodes.push(
      ink(
        ctx,
        'crest-charge',
        polygonPath([
          [cx - w * 0.05, top + h * 0.14],
          [cx + w * 0.05, top + h * 0.14],
          [cx + w * 0.05, top + h * 0.3],
          [cx + w * 0.16, top + h * 0.3],
          [cx + w * 0.16, top + h * 0.4],
          [cx + w * 0.05, top + h * 0.4],
          [cx + w * 0.05, top + h * 0.58],
          [cx - w * 0.05, top + h * 0.58],
          [cx - w * 0.05, top + h * 0.4],
          [cx - w * 0.16, top + h * 0.4],
          [cx - w * 0.16, top + h * 0.3],
          [cx - w * 0.05, top + h * 0.3],
        ]),
        chargeColor,
      ),
    );
  }
  return [group(nodes, { id: ctx.id('crest'), role: 'illustration', material: ctx.material, label: 'Crest' })];
}

/** Castle with three towers, pennants, gate and stone courses. */
export function castle(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    w: number;
    h: number;
    fill?: string;
    roof?: string;
    flag?: string;
    gate?: string;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const fill = options.fill ?? ctx.pal.surfaceAlt;
  const roof = options.roof ?? ctx.pal.primary;
  const flag = options.flag ?? ctx.pal.accent;
  const baseY = cy + h / 2;
  const towerW = w * 0.2;
  const bodyTop = cy - h * 0.04;
  const nodes: SceneNode[] = [];

  const merlons = (x: number, topY: number, width: number, height: number, teeth = 4) => {
    const parts: string[] = [rectPath(x, topY + height * 0.3, width, height * 0.7)];
    const step = width / (teeth * 2 - 1);
    for (let i = 0; i < teeth; i += 1) {
      parts.push(rectPath(x + i * step * 2, topY, step, height * 0.4));
    }
    return parts.join(' ');
  };

  nodes.push(shadowPlate(ctx, { d: rectPath(cx - w / 2, bodyTop, w, baseY - bodyTop), dx: 1.6, dy: 2 }));
  nodes.push(
    ink(ctx, 'castle-tower', merlons(cx - w / 2, bodyTop - h * 0.12, towerW, h * 0.16), fill, {
      material: options.material,
      cut: true,
      label: 'Castle turret',
    }),
  );
  nodes.push(
    ink(ctx, 'castle-tower-body', rectPath(cx - w / 2, bodyTop, towerW, baseY - bodyTop), fill, {
      material: options.material,
      cut: true,
    }),
  );
  nodes.push(
    ink(ctx, 'castle-tower', merlons(cx + w / 2 - towerW, bodyTop - h * 0.12, towerW, h * 0.16), fill, {
      material: options.material,
      cut: true,
    }),
  );
  nodes.push(
    ink(ctx, 'castle-tower-body', rectPath(cx + w / 2 - towerW, bodyTop, towerW, baseY - bodyTop), fill, {
      material: options.material,
      cut: true,
    }),
  );
  nodes.push(
    ink(ctx, 'castle-wall', merlons(cx - w * 0.24, bodyTop + h * 0.16, w * 0.48, h * 0.2, 5), fill, {
      material: options.material,
      cut: true,
    }),
  );
  nodes.push(
    ink(ctx, 'castle-wall-body', rectPath(cx - w * 0.24, bodyTop + h * 0.24, w * 0.48, baseY - bodyTop - h * 0.24), fill, {
      material: options.material,
      cut: true,
    }),
  );
  // Roofs on the towers.
  for (const x of [cx - w / 2 + towerW / 2, cx + w / 2 - towerW / 2]) {
    nodes.push(
      ink(
        ctx,
        'castle-roof',
        polygonPath([
          [x - towerW * 0.62, bodyTop - h * 0.12],
          [x, bodyTop - h * 0.34],
          [x + towerW * 0.62, bodyTop - h * 0.12],
        ]),
        roof,
        { material: options.material, cut: true, label: 'Turret roof' },
      ),
    );
    nodes.push(
      ink(ctx, 'castle-flag', polygonPath([[x, bodyTop - h * 0.34], [x + w * 0.07, bodyTop - h * 0.3], [x, bodyTop - h * 0.26]]), flag, {
        material: options.material,
      }),
    );
    nodes.push(
      ink(ctx, 'castle-mast', polygonPath([[x, bodyTop - h * 0.4], [x, bodyTop - h * 0.34]], false), 'none', {
        stroke: { color: ctx.pal.outline, width: 0.5 },
        material: options.material,
      }),
    );
  }
  // Gate: half-round arch.
  const gateW = w * 0.2;
  const gateH = h * 0.3;
  nodes.push(
    ink(
      ctx,
      'castle-gate',
      [
        `M ${round(cx - gateW / 2)} ${round(baseY)}`,
        `L ${round(cx - gateW / 2)} ${round(baseY - gateH * 0.6)}`,
        ...(() => {
          const segs: string[] = [];
          const steps = 5;
          for (let i = 0; i < steps; i += 1) {
            const a0 = Math.PI + (i / steps) * Math.PI;
            const a1 = Math.PI + ((i + 1) / steps) * Math.PI;
            const k = (4 / 3) * Math.tan((a1 - a0) / 4);
            const p0 = polar(cx, baseY - gateH * 0.6, gateW / 2, a0);
            const p1 = polar(cx, baseY - gateH * 0.6, gateW / 2, a1);
            segs.push(
              `C ${round(p0[0] - k * (gateW / 2) * Math.sin(a0))} ${round(p0[1] + k * (gateW / 2) * Math.cos(a0))} ` +
                `${round(p1[0] + k * (gateW / 2) * Math.sin(a1))} ${round(p1[1] - k * (gateW / 2) * Math.cos(a1))} ${round(p1[0])} ${round(p1[1])}`,
            );
          }
          return segs;
        })().join(' '),
        `L ${round(cx + gateW / 2)} ${round(baseY)} Z`,
      ].join(' '),
      options.gate ?? ctx.pal.primaryDeep,
      { material: options.material, cut: true, label: 'Gate' },
    ),
  );
  // Stone seams.
  for (let i = 1; i < 4; i += 1) {
    const y = bodyTop + ((baseY - bodyTop) * i) / 4;
    nodes.push(
      ink(ctx, 'castle-seam', polygonPath([[cx - w / 2 + 1, y], [cx + w / 2 - 1, y]], false), 'none', {
        stroke: { color: mix(fill, ctx.pal.outline, 0.35), width: 0.35 },
        opacity: 0.5,
      }),
    );
  }
  return [group(nodes, { id: ctx.id('castle'), role: 'illustration', material: ctx.material, label: 'Castle' })];
}

/** Throne with a tall back and finials — "Little King". */
export function throne(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill: Paint; cushion: string; metal?: Paint; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const left = cx - w / 2;
  const top = cy - h / 2;
  const seatY = cy + h * 0.16;
  const metal = options.metal ?? ctx.pal.secondary;
  const nodes: SceneNode[] = [
    shadowPlate(ctx, { d: roundedRectPath(left, top, w, h, h * 0.12), dx: 1.4, dy: 1.8 }),
    ink(ctx, 'throne-back', roundedRectPath(left, top, w, h * 0.72, h * 0.14), options.fill, {
      material: options.material,
      cut: true,
      label: 'Throne back',
    }),
    ink(ctx, 'throne-back-inner', roundedRectPath(left + w * 0.09, top + h * 0.07, w * 0.82, h * 0.5, h * 0.1), mix(ctx.pal.primarySoft, ctx.pal.highlight, 0.3), {
      material: options.material,
    }),
    ink(ctx, 'throne-seat', roundedRectPath(left - w * 0.08, seatY, w * 1.16, h * 0.26, h * 0.08), options.cushion, {
      material: options.material,
      cut: true,
      label: 'Cushion',
    }),
    ink(ctx, 'throne-leg', rectPath(left + w * 0.06, seatY + h * 0.24, w * 0.1, h * 0.2), metal, { material: options.material }),
    ink(ctx, 'throne-leg', rectPath(left + w * 0.84, seatY + h * 0.24, w * 0.1, h * 0.2), metal, { material: options.material }),
  ];
  for (const x of [left + w * 0.12, left + w * 0.88]) {
    nodes.push(ink(ctx, 'throne-finial', circlePath(x, top + h * 0.02, w * 0.06), metal, { material: options.material }));
    nodes.push(
      ink(
        ctx,
        'throne-post',
        roundedRectPath(x - w * 0.02, top, w * 0.04, h * 0.72, w * 0.02),
        metal,
        { material: options.material },
      ),
    );
  }
  nodes.push(ink(ctx, 'throne-tuft', starPath(cx, top + h * 0.32, h * 0.09, h * 0.04, 4), metal));
  return [group(nodes, { id: ctx.id('throne'), role: 'illustration', material: ctx.material, label: 'Throne' })];
}

/** Ornamental key / sceptre, a supporting motif for royal templates. */
export function sceptre(
  ctx: ArtCtx,
  options: { cx: number; cy: number; size: number; metal?: Paint; gem: string; material?: string },
): SceneNode[] {
  const { cx, cy, size } = options;
  const metal = options.metal ?? ctx.pal.secondary;
  return [
    ink(ctx, 'sceptre-rod', roundedRectPath(cx - size * 0.03, cy - size * 0.5, size * 0.06, size, size * 0.03), metal, {
      material: options.material,
      cut: true,
    }),
    ink(ctx, 'sceptre-head', starPath(cx, cy - size * 0.58, size * 0.16, size * 0.07, 6), metal, {
      material: options.material,
      cut: true,
    }),
    ink(ctx, 'sceptre-gem', circlePath(cx, cy - size * 0.58, size * 0.06), options.gem, { material: options.material }),
  ];
}

/** Circular royal medallion with a laurel collar and a crown finial. */
export function royalMedallion(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; rings?: number[]; crownSize?: number; material?: string },
): GroupNode {
  const { cx, cy, r } = options;
  const med = medallion(ctx, {
    cx,
    cy,
    r,
    petals: 22,
    rings: options.rings ?? [0.12, 0.07],
    center: ctx.pal.surface,
    pearls: true,
  });
  const node = group([...med.children], {
    id: ctx.id('royal-medallion'),
    role: 'illustration',
    material: options.material ?? ctx.material,
    label: 'Royal medallion',
  });
  return node;
}

/** Stack of gilt picture-frame rules, for the rose-gold frame template. */
export function giltFrame(
  ctx: ArtCtx,
  options: { box: { x: number; y: number; w: number; h: number }; rules?: number[]; gap?: number; metal?: Paint; inner?: string },
): SceneNode[] {
  const rings = options.rules ?? [6, 1.4, 1.4];
  const metal = options.metal ?? ctx.pal.secondary;
  const nodes: SceneNode[] = [];
  let inset = 0;
  nodes.push(
    ink(ctx, 'gilt-plate', rectPath(options.box.x, options.box.y, options.box.w, options.box.h), options.inner ?? ctx.pal.surface, {
      role: 'backing',
      cut: true,
      label: 'Frame plate',
    }),
  );
  for (let i = 0; i < rings.length; i += 1) {
    const t = rings[i]!;
    nodes.push(
      ink(
        ctx,
        'gilt-rule',
        rectPath(options.box.x + inset, options.box.y + inset, options.box.w - inset * 2, options.box.h - inset * 2),
        'none',
        { stroke: { color: i === 0 ? String(metal).slice(0, 7) : ctx.pal.secondarySoft, width: t * 0.35 }, role: 'accents' },
      ),
    );
    inset += t + (options.gap ?? 1.4);
  }
  // Corner mitres.
  for (const [x, y] of [
    [options.box.x, options.box.y],
    [options.box.x + options.box.w, options.box.y],
    [options.box.x, options.box.y + options.box.h],
    [options.box.x + options.box.w, options.box.y + options.box.h],
  ] as [number, number][]) {
    nodes.push(ink(ctx, 'gilt-corner', circlePath(x, y, 1.7), ctx.pal.secondary, { role: 'accents' }));
  }
  return nodes;
}

/** Small crown-arch that sits above a medallion or plaque. */
export function crownArch(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; metal?: Paint; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const metal = options.metal ?? ctx.pal.secondary;
  return [
    ink(ctx, 'arch-band', ringPath(cx, cy, r, r * 0.86), metal, {
      material: options.material,
      fillRule: 'evenodd',
      cut: true,
      label: 'Crown arch',
    }),
    ink(ctx, 'arch-orb', circlePath(cx, cy - r * 1.02, r * 0.1), ctx.pal.accent, { material: options.material }),
    ink(ctx, 'arch-finial', polygonPath([[cx - r * 0.04, cy - r * 1.16], [cx + r * 0.04, cy - r * 1.16], [cx + r * 0.04, cy - r * 1.42], [cx - r * 0.04, cy - r * 1.42]]), metal, {
      material: options.material,
    }),
    ink(ctx, 'arch-finial', polygonPath([[cx - r * 0.11, cy - r * 1.32], [cx + r * 0.11, cy - r * 1.32], [cx + r * 0.11, cy - r * 1.24], [cx - r * 0.11, cy - r * 1.24]]), metal, {
      material: options.material,
    }),
  ];
}

/** Ornamental flourish for editorial corners (curls + dots). */
export function flourish(
  ctx: ArtCtx,
  options: { cx: number; cy: number; width: number; color?: string; flip?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, width } = options;
  const color = options.color ?? ctx.pal.secondary;
  const dir = options.flip ? -1 : 1;
  const nodes: SceneNode[] = [
    ink(
      ctx,
      'flourish',
      [
        `M ${round(cx - (width / 2) * dir)} ${round(cy)}`,
        `C ${round(cx - (width / 4) * dir)} ${round(cy - width * 0.16)} ${round(cx + (width / 4) * dir)} ${round(cy + width * 0.16)} ${round(cx + (width / 2) * dir)} ${round(cy)}`,
      ].join(' '),
      'none',
      { stroke: { color, width: 0.7, cap: 'round' }, role: 'accents', material: options.material },
    ),
  ];
  for (let i = 0; i < 5; i += 1) {
    const t = (i + 0.5) / 5;
    const x = cx - (width / 2) * dir + width * t * dir;
    const y = cy - Math.sin(Math.PI * t) * width * 0.09 * dir;
    nodes.push(ink(ctx, 'flourish-dot', circlePath(x, y, width * 0.018), color, { role: 'accents', material: options.material }));
  }
  nodes.push(ink(ctx, 'flourish-tip', starPath(cx + (width / 2 + width * 0.05) * dir, cy, width * 0.05, width * 0.02, 4), color, { role: 'accents' }));
  return nodes;
}

/** Pearl-and-gold corner rosette used on the luxury royal booklet designs. */
export function rosette(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; petals?: number; fill?: Paint; center?: Paint; material?: string },
): SceneNode[] {
  const petals = options.petals ?? 8;
  const nodes: SceneNode[] = [];
  for (let i = 0; i < petals; i += 1) {
    const a = (i / petals) * TAU;
    const p = polar(options.cx, options.cy, options.r * 0.62, a);
    nodes.push(
      ink(ctx, 'rosette-petal', ellipsePath(p[0], p[1], options.r * 0.26, options.r * 0.16), options.fill ?? ctx.pal.secondarySoft, {
        role: 'accents',
        material: options.material,
        transform: [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), p[0] - p[0] * Math.cos(a) + p[1] * Math.sin(a), p[1] - p[0] * Math.sin(a) - p[1] * Math.cos(a)],
      }),
    );
  }
  nodes.push(
    ink(ctx, 'rosette-center', circlePath(options.cx, options.cy, options.r * 0.3), options.center ?? ctx.pal.secondary, {
      material: options.material,
    }),
  );
  return nodes;
}

/** Balloon-and-star sky used above royal badges. */
export function skyAccents(
  ctx: ArtCtx,
  options: { box: { x: number; y: number; w: number; h: number }; rand: () => number; count?: number; color?: Paint },
): SceneNode[] {
  const count = options.count ?? 10;
  const points: [number, number][] = [];
  for (let i = 0; i < count; i += 1) {
    points.push([options.box.x + options.rand() * options.box.w, options.box.y + options.rand() * options.box.h]);
  }
  return starCluster(ctx, { points, r: 2.4, fill: options.color ?? ctx.pal.secondarySoft });
}

/** Decorative rule with a centre diamond — a "kicker" divider. */
export function diamondRule(
  ctx: ArtCtx,
  options: { x: number; y: number; width: number; color?: string; material?: string },
): SceneNode[] {
  const color = options.color ?? ctx.pal.secondary;
  const mid = options.x + options.width / 2;
  return [
    ink(ctx, 'rule-left', polygonPath([[options.x, options.y], [mid - 4, options.y]], false), 'none', {
      stroke: { color, width: 0.5, cap: 'round' },
      role: 'accents',
      material: options.material,
    }),
    ink(ctx, 'rule-right', polygonPath([[mid + 4, options.y], [options.x + options.width, options.y]], false), 'none', {
      stroke: { color, width: 0.5, cap: 'round' },
      role: 'accents',
      material: options.material,
    }),
    ink(ctx, 'rule-diamond', starPath(mid, options.y, 2.6, 1.1, 4), color, { role: 'accents', material: options.material }),
  ];
}

/** Wrapped gift with a ribbon — celebration motif. */
export function giftBox(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: Paint; ribbon?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const ribbon = options.ribbon ?? ctx.pal.accent;
  const left = cx - w / 2;
  const top = cy - h / 2;
  return [
    ink(ctx, 'gift', roundedRectPath(left, top + h * 0.22, w, h * 0.78, w * 0.05), options.fill ?? ctx.pal.primary, {
      material: options.material,
      cut: true,
      label: 'Gift',
    }),
    ink(ctx, 'gift-lid', roundedRectPath(left - w * 0.04, top + h * 0.06, w * 1.08, h * 0.2, w * 0.04), mix(String(options.fill ?? ctx.pal.primary), '#ffffff', 0.2), {
      material: options.material,
      cut: true,
    }),
    ink(ctx, 'gift-ribbon-v', rectPath(cx - w * 0.06, top + h * 0.06, w * 0.12, h * 0.94), ribbon, { material: options.material }),
    ink(ctx, 'gift-ribbon-h', rectPath(left, cy - h * 0.02, w, h * 0.08), ribbon, { material: options.material }),
    ink(ctx, 'gift-bow', circlePath(cx - w * 0.12, top + h * 0.02, w * 0.09), ribbon, { material: options.material }),
    ink(ctx, 'gift-bow', circlePath(cx + w * 0.12, top + h * 0.02, w * 0.09), ribbon, { material: options.material }),
  ];
}

/** Small paper lantern string (festive line). */
export function lanternString(
  ctx: ArtCtx,
  options: { x: number; y: number; width: number; count?: number; colors?: string[]; color?: string },
): SceneNode[] {
  const count = options.count ?? 5;
  const color = options.color ?? ctx.pal.outline;
  const colors = options.colors ?? [ctx.pal.accent, ctx.pal.secondary, ctx.pal.primary];
  const nodes: SceneNode[] = [
    ink(ctx, 'lantern-wire', arcPath(options.x + options.width / 2, options.y + options.width * 0.06, options.width / 2, options.width * 0.1, Math.PI, TAU), 'none', {
      stroke: { color, width: 0.4 },
      role: 'accents',
    }),
  ];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const x = options.x + options.width * t;
    const y = options.y + Math.sin(Math.PI * t) * options.width * 0.06;
    nodes.push(ink(ctx, 'lantern', ellipsePath(x, y + 3, 2.6, 3.4), colors[i % colors.length]!, { role: 'accents', cut: true, label: 'Lantern' }));
    nodes.push(ink(ctx, 'lantern-top', rectPath(x - 1, y - 0.6, 2, 0.8), ctx.pal.secondary, { role: 'accents' }));
  }
  return nodes;
}

/** Crown-jewel "gem" used inside medallions and badges. */
export function gem(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; sparkle?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const d = polygonPath([
    [cx, cy - r],
    [cx + r * 0.86, cy - r * 0.24],
    [cx, cy + r],
    [cx - r * 0.86, cy - r * 0.24],
  ]);
  const nodes: SceneNode[] = [
    ink(ctx, 'gem', d, options.fill ?? ctx.pal.accent, { material: options.material, cut: true, label: 'Gem' }),
    ink(
      ctx,
      'gem-facet',
      polygonPath([
        [cx, cy - r * 0.72],
        [cx + r * 0.4, cy - r * 0.1],
        [cx, cy + r * 0.6],
      ]),
      ctx.pal.highlight,
      { opacity: 0.35, material: options.material },
    ),
  ];
  if (options.sparkle !== false) nodes.push(...starCluster(ctx, { points: [[cx + r * 1.3, cy - r * 0.9]], r: r * 0.4, fill: ctx.pal.highlight }));
  return nodes;
}

/** Uses the current palette to build a subtle vignette behind a subject. */
export function vignette(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; color?: string },
): SceneNode[] {
  const color = options.color ?? ctx.pal.primarySoft;
  return [
    ink(
      ctx,
      'vignette',
      circlePath(options.cx, options.cy, options.r),
      {
        type: 'radial',
        center: [options.cx, options.cy],
        radius: options.r,
        stops: [
          { offset: 0, color, opacity: 0.42 },
          { offset: 1, color, opacity: 0 },
        ],
      },
      { role: 'background' },
    ),
  ];
}

export { arcPath, deg, line, rectPath, stack };
