/**
 * Category C — Jungle & Safari
 *
 * 11 Safari Elephant Parade · 12 Little Lion Mane · 13 Giraffe Sunshine
 * 14 Monkey Jungle Vine · 15 Safari Sunset Arch
 */

import { circlePath, polygonPath, roundedRectPath, scatter } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { elephant, giraffe, lionFace, monkeyFace, safariBird } from '../../art/animals.js';
import { leafBranch, vine, starCluster, sparkle, flower, cloud, shadowPlate, burst } from '../../art/decor.js';
import { mountainRange, sun } from '../../art/world.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/** Sun-disc plus a leaf crown: the recurring "safari badge" of this category. */
function safariBadge(input: Parameters<CakeTemplate['compose']>[0], cy: number) {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  const cx = input.width / 2;
  return [
    ...sun(ctx, { cx, cy, r: 30, fill: t.accentSoft, ray: t.accent }),
    ...leafBranch(ctx, { cx: cx - 34, cy: cy + 20, length: 40, angle: -0.5, leaves: 5, fill: t.foliage }),
    ...leafBranch(ctx, { cx: cx + 34, cy: cy + 20, length: 40, angle: Math.PI + 0.5, leaves: 5, fill: t.foliageDeep }),
  ];
}

/* 11 — Safari Elephant Parade */
const safariElephantParade: CakeTemplate = {
  id: 'safari-elephant-parade',
  version: 1,
  name: 'Safari Elephant Parade',
  description: 'A cheerful elephant under a big sun, with a leaf border and a printed peanut trail.',
  category: 'safari',
  tags: { gender: ['boy', 'unisex'], styles: ['playful', 'adventurous'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'jungle-leaf',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Advik', title: 'Happy Birthday', subtitle: 'Big ears, bigger wishes', age: '2', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'hills', accent: 'foliage', opacity: 0.4 },
  safeInset: 6,
  notes: 'The elephant is one cut piece with a separate ear; the sun disc sits behind at 0.3 mm offset.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...safariBadge(input, 48));
    nodes.push(...elephant(ctx, { cx: input.width / 2, cy: 62, scale: 1.05, body: t.primary, detail: t.primarySoft, facing: 1 }));
    nodes.push(...cloud(ctx, { cx: 30, cy: 24, w: 30, h: 14, fill: t.surface, shade: t.primarySoft, material: 'accent' }));
    nodes.push(...vine(ctx, { x: 10, y: 20, width: 132, amplitude: 5, leaves: true, color: t.foliage }));
    for (const [x, y] of scatter(6, { x: 22, y: 26, w: 108, h: 44 }, 2211)) {
      nodes.push(...sparkle(ctx, { cx: x, cy: y, r: 2.2, fill: t.accentSoft }));
    }
    nodes.push(nameplateFor(input, { style: 'plaque', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 12 — Little Lion Mane */
const littleLionMane: CakeTemplate = {
  id: 'little-lion-mane',
  version: 1,
  name: 'Little Lion Mane',
  description: 'A lion whose mane is a ring of paper leaves — our bravest little one.',
  category: 'safari',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'playful'], occasions: ['birthday', 'milestone'], ages: [1, 10] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('medallion', PLAY, {
    title: { x: 30, y: 24, width: 92.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['baloo2', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
    age: { x: 106, y: 104, width: 34, height: 34, maxSizePt: 28, minSizePt: 14, families: ['baloo2', 'poppins'] },
  }),
  defaults: { name: 'Ishaan', title: 'Happy Birthday', subtitle: 'Hear me roar', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'sunburst', accent: 'accentSoft', opacity: 0.45 },
  safeInset: 6,
  notes: 'Sixteen mane leaves are printed as one layered ring; on a 4 in topper the studio drops to the 10-leaf variant automatically.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...burst(ctx, { cx, cy: 66, r: 62, spikes: 14, fill: t.accentSoft, inner: t.accentSoft }));
    nodes.push(...lionFace(ctx, { cx, cy: 66, r: 34, fur: t.primary, mane: t.accent, maneLeaves: 16 }));
    nodes.push(...starCluster(ctx, { points: [[24, 34], [128, 38], [24, 106], [130, 102]], r: 3, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 116, cy: 30, r: 3.6, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { petals: 22, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 13 — Giraffe Sunshine */
const giraffeSunshine: CakeTemplate = {
  id: 'giraffe-sunshine',
  version: 1,
  name: 'Giraffe Sunshine',
  description: 'A tall giraffe reaching past three stacked clouds toward the sun.',
  category: 'safari',
  tags: { gender: ['girl', 'unisex'], styles: ['cute', 'playful'], occasions: ['birthday', 'first-birthday'], ages: [1, 6] },
  aspect: 'portrait',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('poster', PLAY, {
    name: { x: 16, y: 118, width: 95, height: 28, maxSizePt: 36, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
    title: { x: 16, y: 106, width: 95, height: 11, maxSizePt: 17, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
    subtitle: { x: 18, y: 147, width: 91, height: 9, maxSizePt: 12, minSizePt: 8, families: ['quicksand'] },
    age: { x: 18, y: 14, width: 30, height: 30, maxSizePt: 26, minSizePt: 12, families: ['baloo2'] },
    date: { x: 16, y: 168, width: 95, height: 8, maxSizePt: 10, minSizePt: 7, families: ['quicksand'] },
  }),
  defaults: { name: 'Kiara', title: 'Happy Birthday', subtitle: 'Standing tall', age: '2', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.9 },
  safeInset: 6,
  notes: 'Tall topper: keep the stick tab enabled so the giraffe neck cannot fold forward under its own weight.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 34, cy: 30, r: 17, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...cloud(ctx, { cx: 96, cy: 26, w: 46, h: 18, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...cloud(ctx, { cx: 62, cy: 48, w: 38, h: 15, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...giraffe(ctx, { cx: 74, cy: 96, scale: 1.6, body: t.accent, spots: mix(t.accent, t.primaryDeep, 0.5), facing: -1 }));
    nodes.push(...leafBranch(ctx, { cx: 26, cy: 96, length: 44, angle: -1.35, leaves: 5, fill: t.foliage }));
    nodes.push(...starCluster(ctx, { points: [[20, 62], [108, 66], [98, 12]], r: 3, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'ticket', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 14 — Monkey Jungle Vine */
const monkeyJungleVine: CakeTemplate = {
  id: 'monkey-jungle-vine',
  version: 1,
  name: 'Monkey Jungle Vine',
  description: 'A monkey swinging on a leaf vine, with bananas hidden in the border.',
  category: 'safari',
  tags: { gender: ['boy', 'unisex'], styles: ['playful', 'adventurous'], occasions: ['birthday'], ages: [2, 9] },
  aspect: 'square',
  defaultPalette: 'jungle-leaf',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('band', PLAY, {
    title: { x: 22, y: 58, width: 108.4, height: 13, maxSizePt: 21, minSizePt: 9, families: ['baloo2', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
    name: { x: 16, y: 74, width: 120.4, height: 28, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
  }),
  defaults: { name: 'Neel', title: 'Happy Birthday', subtitle: 'Swinging into a new year', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'grid', accent: 'foliage', opacity: 0.25 },
  safeInset: 6,
  notes: 'The vine is a single 1.4 mm stem — safe on 220 gsm and above; below that, disable the vine in optionals.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...vine(ctx, { x: 8, y: 26, width: 136, amplitude: 9, leaves: true, color: t.foliage }));
    nodes.push(...monkeyFace(ctx, { cx: 76, cy: 44, r: 22, fur: t.accentDeep, muzzle: t.accentSoft, blush: t.accentSoft }));
    nodes.push(ink(ctx, 'monkey-arm', roundedRectPath(52, 40, 26, 5, 2.5), t.accentDeep, { role: 'secondary', cut: true, label: 'Monkey arm' }));
    nodes.push(...leafBranch(ctx, { cx: 24, cy: 92, length: 40, angle: -0.35, leaves: 4, fill: t.primary }));
    nodes.push(...leafBranch(ctx, { cx: 130, cy: 92, length: 40, angle: Math.PI + 0.35, leaves: 4, fill: t.primary }));
    nodes.push(...starCluster(ctx, { points: [[34, 22], [122, 22], [46, 100], [110, 100]], r: 3, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'hexagon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 15 — Safari Sunset Arch */
const safariSunsetArch: CakeTemplate = {
  id: 'safari-sunset-arch',
  version: 1,
  name: 'Safari Sunset Arch',
  description: 'An arch frame over layered dunes, acacia trees and a setting sun — quiet and grown-up.',
  category: 'safari',
  tags: { gender: ['unisex'], styles: ['editorial', 'adventurous'], occasions: ['birthday', 'baby-shower', 'naming'], ages: [1, 12] },
  aspect: 'portrait',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('poster', { display: 'playfair-display', title: 'poppins', body: 'poppins' }, {
    name: { x: 16, y: 112, width: 95, height: 30, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['playfair-display', 'poppins'] },
    title: { x: 16, y: 99, width: 95, height: 12, maxSizePt: 17, minSizePt: 9, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.2 } },
    subtitle: { x: 18, y: 144, width: 91, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
    age: { x: 91, y: 14, width: 30, height: 30, maxSizePt: 24, minSizePt: 12, families: ['playfair-display', 'poppins'] },
    date: { x: 16, y: 168, width: 95, height: 8, maxSizePt: 10, minSizePt: 7, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Anaya', title: 'Happy Birthday', subtitle: 'Golden hour, golden year', age: '5', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'gradient', accent: 'accentSoft' },
  safeInset: 8,
  notes: 'Dune bands overlap by 2 mm so no white gaps appear between layers when they are glued by hand.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 64, cy: 62, r: 24, fill: t.accent, ray: t.accentSoft }));
    nodes.push(...mountainRange(ctx, { x: -4, y: 76, w: 136, h: 40, back: t.primarySoft, front: t.primary, snow: t.secondarySoft, peaks: 3 }));
    // Acacia silhouettes: a flat canopy over a slim trunk.
    nodes.push(ink(ctx, 'acacia-canopy', polygonPath([[20, 82], [26, 74], [34, 76], [40, 82], [34, 80], [26, 80]]), t.primaryDeep, { role: 'secondary', cut: true, label: 'Acacia canopy' }));
    nodes.push(ink(ctx, 'acacia-trunk', roundedRectPath(29, 82, 2.4, 10, 1.2), t.primaryDeep, { role: 'secondary', cut: true, label: 'Acacia trunk' }));
    nodes.push(ink(ctx, 'acacia-canopy-2', polygonPath([[86, 80], [92, 71], [100, 74], [106, 80], [100, 78], [92, 78]]), t.primaryDeep, { role: 'secondary', cut: true, label: 'Acacia canopy' }));
    nodes.push(ink(ctx, 'acacia-trunk-2', roundedRectPath(94.6, 80, 2, 9, 1), t.primaryDeep, { role: 'secondary', cut: true, label: 'Acacia trunk' }));
    nodes.push(ink(ctx, 'dune-front', polygonPath([[-4, 138], [24, 118], [60, 130], [92, 116], [131, 132], [131, 186], [-4, 186]]), t.accentSoft, { role: 'illustration', cut: true, label: 'Front dune' }));
    nodes.push(ink(ctx, 'arch-frame', `M 12 182 L 12 44 C 12 20 40 10 63.5 10 C 87 10 115 20 115 44 L 115 182`, 'none', { stroke: { color: t.accent, width: 1.6 }, role: 'secondary', label: 'Arch frame' }));
    nodes.push(...safariBird(ctx, { cx: 46, cy: 34, scale: 0.5, body: t.outline, beak: t.accent, facing: -1 }));
    nodes.push(...flower(ctx, { cx: 26, cy: 150, r: 9, petals: 6, petalFill: t.secondary, centerFill: t.accent, style: 'daisy' }));
    nodes.push(shadowPlate(ctx, { d: circlePath(104, 150, 12), dx: 1.4, dy: 1.8, opacity: 0.14 }));
    nodes.push(nameplateFor(input, { style: 'minimal', material: 'accent', fill: 'none', edge: t.accent, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { shape: 'banner', fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

export const SAFARI_TEMPLATES: CakeTemplate[] = [
  safariElephantParade,
  littleLionMane,
  giraffeSunshine,
  monkeyJungleVine,
  safariSunsetArch,
];
