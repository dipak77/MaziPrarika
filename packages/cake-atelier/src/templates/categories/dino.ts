/**
 * Category D — Dinosaurs
 *
 * 16 T-Rex Roar · 17 Baby Dino Egg · 18 Stegosaurus Valley
 * 19 Dino Fossil Dig · 20 Volcano Island
 */

import { circlePath, polygonPath, scatter } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink, line, type ArtCtx } from '../../art/helpers.js';
import { dino, dinoEgg, fossil, volcano } from '../../art/animals.js';
import { cloud, leafBranch, starCluster, sparkle, burst } from '../../art/decor.js';
import { mountainRange, pineTree, sun } from '../../art/world.js';
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

/** Ancient-ground band: the dunes every dinosaur template stands on. */
function groundBand(input: Parameters<CakeTemplate['compose']>[0], y: number, height: number): SceneNode {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  return ink(
    ctx,
    'ground',
    polygonPath([[-4, input.height], [-4, y], [input.width * 0.28, y - height * 0.4], [input.width * 0.6, y], [input.width * 0.82, y - height * 0.3], [input.width + 4, y + height * 0.1], [input.width + 4, input.height]]),
    input.tokens.primarySoft,
    { role: 'illustration', cut: true, label: 'Ground band', material: 'accent' },
  ) as SceneNode;
}

/* 16 — T-Rex Roar */
const trexRoar: CakeTemplate = {
  id: 't-rex-roar',
  version: 1,
  name: 'T-Rex Roar',
  description: 'A paper T-Rex mid-roar in front of a palm grove and a low prehistoric sun.',
  category: 'dino',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'adventurous'], occasions: ['birthday'], ages: [2, 9] },
  aspect: 'square',
  defaultPalette: 'jungle-leaf',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Rudra', title: 'Happy Birthday', subtitle: 'Roaring into year four', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.4 },
  safeInset: 6,
  notes: 'Teeth are part of the jaw silhouette, not separate slivers — nothing smaller than 2 mm is ever cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 118, cy: 30, r: 17, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...mountainRange(ctx, { x: -6, y: 58, w: 132, h: 34, back: t.primarySoft, front: t.foliage, snow: t.secondarySoft, peaks: 3 }));
    nodes.push(groundBand(input, 88, 16));
    nodes.push(...dino(ctx, { kind: 'trex', cx: 74, cy: 62, scale: 1.15, body: t.primary, belly: t.accent, plate: t.foliage, ink: t.ink }));
    nodes.push(...pineTree(ctx, { cx: 24, cy: 68, h: 40, fill: t.foliageDeep, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(...leafBranch(ctx, { cx: 134, cy: 76, length: 34, angle: Math.PI * 0.82, leaves: 4, fill: t.foliage }));
    nodes.push(...starCluster(ctx, { points: [[30, 26], [52, 18], [140, 88]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'shield', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

/* 17 — Baby Dino Egg */
const babyDinoEgg: CakeTemplate = {
  id: 'baby-dino-egg',
  version: 1,
  name: 'Baby Dino Egg',
  description: 'A speckled egg with a hatched crown and a very small dinosaur peeking out.',
  category: 'dino',
  tags: { gender: ['unisex'], styles: ['cute', 'pastel'], occasions: ['first-birthday', 'baby-shower', 'naming'], ages: [0, 3] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', { display: 'quicksand', title: 'poppins', body: 'quicksand' }, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
    age: { x: 106, y: 8, width: 32, height: 32, maxSizePt: 26, minSizePt: 12, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Aarohi', title: 'Happy Birthday', subtitle: 'Hatched a whole year ago', age: '1', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.8 },
  safeInset: 6,
  notes: 'The crack line is printed, so a scissors cut around the whole egg is enough for hand cutting.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...cloud(ctx, { cx: 34, cy: 26, w: 34, h: 15, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...cloud(ctx, { cx: 118, cy: 34, w: 30, h: 13, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...dino(ctx, { kind: 'baby', cx, cy: 44, scale: 0.72, body: t.primary, belly: t.accentSoft, plate: t.accent, ink: t.ink }));
    nodes.push(...dinoEgg(ctx, { cx, cy: 78, rx: 30, ry: 36, fill: t.surface, spots: t.accentSoft, crack: true }));
    nodes.push(...starCluster(ctx, { points: [[26, 96], [126, 92], [22, 60]], r: 2.6, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 124, cy: 62, r: 3.2, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
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

/* 18 — Stegosaurus Valley */
const stegosaurusValley: CakeTemplate = {
  id: 'stegosaurus-valley',
  version: 1,
  name: 'Stegosaurus Valley',
  description: 'A stegosaurus crossing a valley of layered hills and pine trees.',
  category: 'dino',
  tags: { gender: ['unisex'], styles: ['adventurous', 'playful'], occasions: ['birthday', 'milestone'], ages: [2, 10] },
  aspect: 'square',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('band', PLAY, {
    title: { x: 22, y: 56, width: 108.4, height: 13, maxSizePt: 21, minSizePt: 9, families: ['baloo2', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
    name: { x: 16, y: 72, width: 120.4, height: 28, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
    age: { x: 108, y: 10, width: 34, height: 34, maxSizePt: 28, minSizePt: 14, families: ['baloo2', 'poppins'] },
  }),
  defaults: { name: 'Vivaan', title: 'Happy Birthday', subtitle: 'Stomping through the valley', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'hills', accent: 'primarySoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'Three hill bands overlap by 3 mm. Print the middle band on a slightly darker card for instant depth.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...mountainRange(ctx, { x: -6, y: 34, w: 132, h: 40, back: t.secondarySoft, front: t.primarySoft, snow: t.secondary, peaks: 2 }));
    nodes.push(...pineTree(ctx, { cx: 30, cy: 62, h: 34, fill: t.foliage, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(...pineTree(ctx, { cx: 126, cy: 60, h: 30, fill: t.foliageDeep, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(...dino(ctx, { kind: 'stego', cx: 76, cy: 52, scale: 1.0, body: t.primary, belly: t.accentSoft, plate: t.accent, ink: t.ink }));
    nodes.push(groundBand(input, 84, 18));
    nodes.push(...cactusScrub(input));
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

/** Scrubby ground plants for the valley compositions. */
function cactusScrub(input: Parameters<CakeTemplate['compose']>[0]): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (const [x, h] of [[22, 22], [52, 15], [104, 18], [132, 24]] as [number, number][]) {
    out.push(ink(ctx, 'scrub', `M ${x} 96 L ${x} ${96 - h}`, 'none', { stroke: { color: t.foliageDeep, width: 1.6, cap: 'round' }, role: 'secondary' }));
    out.push(...starCluster(ctx, { points: [[x - 4, 96 - h * 0.6], [x + 4, 96 - h * 0.85]], r: 2.2, fill: t.foliage }));
  }
  return out;
}

/* 19 — Dino Fossil Dig */
const dinoFossilDig: CakeTemplate = {
  id: 'dino-fossil-dig',
  version: 1,
  name: 'Dino Fossil Dig',
  description: 'A swirling ammonite fossil and a bone, dug out of sand — for the serious palaeontologist.',
  category: 'dino',
  tags: { gender: ['unisex'], styles: ['editorial', 'adventurous'], occasions: ['birthday', 'graduation'], ages: [4, 12] },
  aspect: 'square',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', { display: 'playfair-display', title: 'poppins', body: 'poppins' }),
  defaults: { name: 'Dhruv', title: 'Happy Birthday', subtitle: 'Junior palaeontologist', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.35 },
  safeInset: 9,
  notes: 'The sand field is a printed texture; the fossil and bone are the only cut pieces besides the plate.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(ink(ctx, 'sand', polygonPath([[10, 58], [40, 48], [76, 54], [110, 46], [142, 56], [142, 106], [10, 106]]), t.accentSoft, { role: 'illustration', cut: true, label: 'Sand field' }));
    nodes.push(...fossil(ctx, { cx, cy: 74, r: 26, fill: t.surface, spiral: t.outline }));
    nodes.push(...bone(ctx, 116, 80, 1));
    nodes.push(...bone(ctx, 34, 86, 0.7));
    nodes.push(...starCluster(ctx, { points: [[26, 30], [124, 26], [96, 20]], r: 2.6, fill: t.secondarySoft }));
    nodes.push(line(ctx, 'horizon', polygonPath([[10, 58], [142, 56]], false), t.primaryDeep, 0.7, { opacity: 0.5, role: 'accents' }));
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

/** A flat bone shape with two knuckle ends. */
function bone(ctx: ArtCtx, cx: number, cy: number, scale: number): SceneNode[] {
  const len = 30 * scale;
  const r = 5.4 * scale;
  return [
    ink(ctx, 'bone', `M ${cx - len / 2} ${cy} L ${cx + len / 2} ${cy}`, 'none', { stroke: { color: '#fdfaf2', width: r * 1.5, cap: 'round' }, role: 'secondary' }),
    ink(ctx, 'bone-left', circlePath(cx - len / 2, cy, r), '#fdfaf2', { role: 'secondary', cut: true, label: 'Bone' }),
    ink(ctx, 'bone-right', circlePath(cx + len / 2, cy, r), '#fdfaf2', { role: 'secondary', cut: true, label: 'Bone' }),
  ];
}

/* 20 — Volcano Island */
const volcanoIsland: CakeTemplate = {
  id: 'volcano-island',
  version: 1,
  name: 'Volcano Island',
  description: 'A smoking volcano with lava streams, a palm island and a sky of ash sparks.',
  category: 'dino',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'adventurous'], occasions: ['birthday'], ages: [4, 12] },
  aspect: 'square',
  defaultPalette: 'rainbow-pop',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('classic', { display: 'bebas-neue', title: 'bebas-neue', body: 'poppins' }, {
    title: { x: 14, y: 88, width: 124.4, height: 12, maxSizePt: 22, minSizePt: 10, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.2 } },
    name: { x: 13, y: 100, width: 126.4, height: 24, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'], letterSpacing: { min: 0, max: 0.14, default: 0.05 } },
  }),
  defaults: { name: 'Aryan', title: 'Happy Birthday', subtitle: 'Lava-sized wishes', age: '7', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.55 },
  safeInset: 6,
  notes: 'The ash plume is a light scatter of 2 mm dots — visible on any colour card and quick to cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...burst(ctx, { cx: 76, cy: 56, r: 58, spikes: 16, fill: t.accentSoft, inner: t.secondary }));
    nodes.push(...volcano(ctx, { cx: 74, cy: 66, w: 108, h: 62, rock: t.primaryDeep, lava: t.accent, smoke: t.secondarySoft }));
    nodes.push(...ashScatter(input));
    nodes.push(ink(ctx, 'sea', polygonPath([[-4, 106], [40, 100], [80, 106], [120, 99], [146, 106], [146, 126], [-4, 126]]), t.primary, { role: 'illustration', cut: true, label: 'Island shelf' }));
    nodes.push(...pineTree(ctx, { cx: 124, cy: 98, h: 26, fill: t.foliage, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
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

function ashScatter(input: Parameters<CakeTemplate['compose']>[0]): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (const [x, y] of scatter(12, { x: 22, y: 14, w: 108, h: 26 }, 9917, 6)) {
    out.push(ink(ctx, 'ash', circlePath(x, y, 1.4 + input.rand() * 1.2), mix(t.secondarySoft, t.primary, 0.3), { role: 'accents' }));
  }
  return out;
}

export const DINO_TEMPLATES: CakeTemplate[] = [
  trexRoar,
  babyDinoEgg,
  stegosaurusValley,
  dinoFossilDig,
  volcanoIsland,
];
