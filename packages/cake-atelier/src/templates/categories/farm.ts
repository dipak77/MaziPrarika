/**
 * Category L — Farm, Aviation & Adventure
 *
 * 56 Barnyard Sunrise · 57 Garden Bee & Sunflower · 58 Little Tractor Field
 * 59 Chicken Coop Cute · 60 Windmill Wheat Field
 */

import { circlePath, petalPath, polygonPath, rectPath, scatter } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink, line } from '../../art/helpers.js';
import { bee, chicken, cowFace } from '../../art/animals.js';
import { barn, campfire, hotAirBalloon, mountainRange, sun, tent, tractor, windmill } from '../../art/world.js';
import { bunting, cloud, leafBranch, starCluster } from '../../art/decor.js';
import { lanternString } from '../../art/royal.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const SOFT = { display: 'quicksand', title: 'quicksand', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/** Rolling field bands with a printed furrow pattern. */
function fieldBands(input: Parameters<CakeTemplate['compose']>[0], top: number): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const furrows: SceneNode[] = [];
  for (let i = 0; i < 7; i += 1) {
    const y = top + 8 + i * 4.6;
    furrows.push(line(ctx, 'furrow', polygonPath([[8, y], [input.width - 8, y - 1.6]], false), t.foliageDeep, 0.8, { opacity: 0.35, role: 'accents' }));
  }
  return [
    ink(ctx, 'field-far', polygonPath([[-4, top], [input.width + 4, top - 4], [input.width + 4, top + 14], [-4, top + 14]]), t.foliage, { role: 'illustration', cut: true, label: 'Field band' }),
    ink(ctx, 'field-near', polygonPath([[-4, top + 12], [input.width + 4, top + 8], [input.width + 4, input.height + 4], [-4, input.height + 4]]), mix(t.foliage, t.accent, 0.35), { role: 'illustration', cut: true, label: 'Field band' }),
    ...furrows,
  ];
}

/* 56 — Barnyard Sunrise */
const barnyardSunrise: CakeTemplate = {
  id: 'barnyard-sunrise',
  version: 1,
  name: 'Barnyard Sunrise',
  description: 'A red barn at dawn with a fence line, a cow and the sun rising behind the roof.',
  category: 'farm',
  tags: { gender: ['unisex'], styles: ['playful', 'editorial'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Vivaan', title: 'Happy Birthday', subtitle: 'Up with the sun', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.45 },
  safeInset: 6,
  notes: 'The fence is one cut piece with printed rails so the posts stay aligned when you glue.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 76, cy: 62, r: 34, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...barn(ctx, { cx: 72, cy: 62, w: 76, h: 52, body: t.accent, roof: t.primaryDeep, door: t.secondarySoft }));
    nodes.push(...cowFace(ctx, { cx: 30, cy: 84, r: 15, fur: t.surface, spot: t.outline, blush: t.accentSoft }));
    nodes.push(...fence(input, 96));
    nodes.push(...cloud(ctx, { cx: 28, cy: 26, w: 40, h: 16, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...starCluster(ctx, { points: [[126, 26], [136, 60], [22, 56]], r: 2.6, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'plaque', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.primary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function fence(input: Parameters<CakeTemplate['compose']>[0], y: number): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (let x = 12; x < input.width - 6; x += 18) {
    out.push(ink(ctx, 'fence-post', rectPath(x, y - 12, 3.4, 22), t.secondarySoft, { role: 'secondary', cut: true, label: 'Fence post' }));
  }
  for (const railY of [y - 8, y - 1]) {
    out.push(ink(ctx, 'fence-rail', rectPath(10, railY, input.width - 20, 2.4), t.secondarySoft, { role: 'secondary', cut: true, label: 'Fence rail' }));
  }
  return out;
}

/* 57 — Garden Bee & Sunflower */
const gardenBeeSunflower: CakeTemplate = {
  id: 'garden-bee-and-sunflower',
  version: 1,
  name: 'Garden Bee & Sunflower',
  description: 'A sunflower head with a bee landing on it — the friendliest thing in the garden.',
  category: 'farm',
  tags: { gender: ['unisex'], styles: ['playful', 'pastel'], occasions: ['birthday', 'first-birthday', 'baby-shower'], ages: [0, 7] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('medallion', PLAY, {
    name: { x: 34, y: 64, width: 84.4, height: 26, maxSizePt: 34, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
  }),
  defaults: { name: 'Myra', title: 'Happy Birthday', subtitle: 'Busy being one', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.4 },
  safeInset: 6,
  notes: 'The sunflower has twelve petals by design — enough to read as a flower at 100 mm without clogging a cutting blade.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...sunflower(ctx, cx, 58, 42, t.accent, t.accentDeep, t.primaryDeep));
    nodes.push(...bee(ctx, { cx: cx + 34, cy: 32, scale: 0.82, body: t.accentSoft, stripe: t.outline, wing: t.surface }));
    nodes.push(ink(ctx, 'bee-trail', `M ${cx + 12} 18 C ${cx + 24} 10 ${cx + 34} 12 ${cx + 44} 22`, 'none', { stroke: { color: t.outline, width: 0.8, dash: [2.2, 2], cap: 'round' }, role: 'accents', opacity: 0.7 }));
    nodes.push(...leafBranch(ctx, { cx: cx - 46, cy: 96, length: 40, angle: -0.4, leaves: 4, fill: t.foliage }));
    nodes.push(...leafBranch(ctx, { cx: cx + 46, cy: 96, length: 40, angle: Math.PI + 0.4, leaves: 4, fill: t.foliageDeep }));
    nodes.push(...starCluster(ctx, { points: [[28, 30], [128, 34], [24, 92], [132, 96]], r: 2.6, fill: t.secondarySoft }));
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

/** A sunflower: twelve pointed petals, a seeded disc and a ring of dots. */
function sunflower(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, r: number, petal: string, petalDeep: string, seed: string): SceneNode[] {
  const out: SceneNode[] = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    out.push(ink(ctx, 'sunflower-petal', petalPath(cx, cy, r, r * 0.44, angle), i % 2 === 0 ? petal : petalDeep, { role: 'illustration', cut: true, label: 'Sunflower petal' }));
  }
  out.push(ink(ctx, 'sunflower-disc', circlePath(cx, cy, r * 0.42), seed, { role: 'illustration', cut: true, label: 'Sunflower centre' }));
  for (const [x, y] of scatter(11, { x: cx - r * 0.28, y: cy - r * 0.28, w: r * 0.56, h: r * 0.56 }, 5701, 4)) {
    out.push(ink(ctx, 'sunflower-seed', circlePath(x, y, 1.1), mix(seed, '#ffffff', 0.25), { role: 'accents' }));
  }
  return out;
}

/* 58 — Little Tractor Field */
const littleTractorField: CakeTemplate = {
  id: 'little-tractor-field',
  version: 1,
  name: 'Little Tractor Field',
  description: 'A green tractor ploughing a field, with a scarecrow, hay bales and a rising sun.',
  category: 'farm',
  tags: { gender: ['boy', 'unisex'], styles: ['playful', 'adventurous'], occasions: ['birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'jungle-leaf',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Ishaan', title: 'Happy Birthday', subtitle: 'Ploughing into year four', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'hills', accent: 'foliage', opacity: 0.35 },
  safeInset: 6,
  notes: 'Wheat stalks are printed hairlines above the field band so the cut stays simple.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...mountainRange(ctx, { x: -6, y: 34, w: 132, h: 32, back: t.secondarySoft, front: t.foliage, snow: t.secondary, peaks: 3 }));
    nodes.push(...sun(ctx, { cx: 124, cy: 30, r: 14, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...tractor(ctx, { cx: 62, cy: 68, scale: 1.1, body: t.primary, trim: t.accent, wheel: t.outline }));
    nodes.push(...hayBale(ctx, 116, 92));
    nodes.push(...scarecrow(ctx, 30, 78));
    nodes.push(...fieldBands(input, 88));
    nodes.push(nameplateFor(input, { style: 'ticket', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

function hayBale(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'bale', `M ${cx - 14} ${cy} L ${cx - 14} ${cy - 18} C ${cx - 14} ${cy - 26} ${cx + 14} ${cy - 26} ${cx + 14} ${cy - 18} L ${cx + 14} ${cy} Z`, t.secondarySoft, { role: 'illustration', cut: true, label: 'Hay bale' }),
    ink(ctx, 'bale-band', rectPath(cx - 14, cy - 14, 28, 2.2), t.accentDeep, { role: 'secondary', opacity: 0.8 }),
    ink(ctx, 'bale-band', rectPath(cx - 14, cy - 6, 28, 2.2), t.accentDeep, { role: 'secondary', opacity: 0.8 }),
  ];
}

function scarecrow(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'scarecrow-cross', polygonPath([[cx, cy], [cx, cy - 32]], false), 'none', { stroke: { color: t.accentDeep, width: 2 }, role: 'secondary' }),
    ink(ctx, 'scarecrow-arms', polygonPath([[cx - 14, cy - 22], [cx + 14, cy - 22]], false), 'none', { stroke: { color: t.accentDeep, width: 2, cap: 'round' }, role: 'secondary' }),
    ink(ctx, 'scarecrow-body', polygonPath([[cx - 12, cy - 20], [cx + 12, cy - 20], [cx + 8, cy - 2], [cx - 8, cy - 2]]), t.accent, { role: 'secondary', cut: true, label: 'Scarecrow shirt' }),
    ink(ctx, 'scarecrow-hat', polygonPath([[cx - 12, cy - 34], [cx + 12, cy - 34], [cx + 6, cy - 42], [cx - 6, cy - 42]]), t.primaryDeep, { role: 'secondary', cut: true, label: 'Scarecrow hat' }),
  ];
}

/* 59 — Chicken Coop Cute */
const chickenCoopCute: CakeTemplate = {
  id: 'chicken-coop-cute',
  version: 1,
  name: 'Chicken Coop Cute',
  description: 'Three hens and a chick below a lantern string, with a coop door and a feather border.',
  category: 'farm',
  tags: { gender: ['unisex'], styles: ['cute', 'playful'], occasions: ['birthday', 'first-birthday', 'baby-shower'], ages: [0, 6] },
  aspect: 'square',
  defaultPalette: 'peach-cream',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
  }),
  defaults: { name: 'Aadya', title: 'Happy Birthday', subtitle: 'One fluffy year', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.8 },
  safeInset: 6,
  notes: 'Hens are three cut pieces each — body, wing and comb — which is why they read as paper art rather than stickers.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...lanternString(ctx, { x: 10, y: 18, width: 132, count: 7, colors: [t.accent, t.secondary, t.accentSoft] }));
    nodes.push(...coopDoor(ctx, 76, 58, t.primaryDeep, t.secondarySoft));
    nodes.push(...chicken(ctx, { cx: 34, cy: 72, scale: 0.9, body: t.surface, comb: t.accent, beak: t.accentSoft }));
    nodes.push(...chicken(ctx, { cx: 116, cy: 74, scale: 0.8, body: t.accentSoft, comb: t.accent, beak: t.accentSoft }));
    nodes.push(...chicken(ctx, { cx: 76, cy: 82, scale: 0.62, body: t.secondary, comb: t.accent, beak: t.accentSoft }));
    nodes.push(...chick(input, 100, 92));
    nodes.push(...fieldBands(input, 92));
    nodes.push(...starCluster(ctx, { points: [[26, 30], [128, 32], [22, 100]], r: 2.6, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
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

function coopDoor(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, frame: string, fill: string): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'coop', polygonPath([[cx - 30, cy], [cx + 30, cy], [cx + 30, cy - 30], [cx - 30, cy - 30]]), fill, { role: 'illustration', cut: true, label: 'Coop boards' }),
    ink(ctx, 'coop-roof', polygonPath([[cx - 34, cy - 28], [cx + 34, cy - 28], [cx, cy - 44]]), frame, { role: 'illustration', cut: true, label: 'Coop roof' }),
    ink(ctx, 'coop-door', polygonPath([[cx - 11, cy], [cx + 11, cy], [cx + 11, cy - 22], [cx, cy - 30], [cx - 11, cy - 22]]), t.outline, { role: 'secondary', cut: true, label: 'Coop door' }),
    ink(ctx, 'coop-perch', rectPath(cx - 26, cy - 2, 52, 3), frame, { role: 'secondary', cut: true, label: 'Perch' }),
  ];
}

/** A chick: small circle body with a beak and feet. */
function chick(input: Parameters<CakeTemplate['compose']>[0], cx: number, cy: number): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  return [
    ink(ctx, 'chick', circlePath(cx, cy, 8), t.accentSoft, { role: 'secondary', cut: true, label: 'Chick' }),
    ink(ctx, 'chick-wing', petalPath(cx + 1, cy, 7, 5, Math.PI * 0.1), t.accent, { role: 'secondary' }),
    ink(ctx, 'chick-eye', circlePath(cx + 3, cy - 2.4, 1.1), t.outline, { role: 'accents' }),
    ink(ctx, 'chick-beak', polygonPath([[cx + 7.4, cy - 0.6], [cx + 11, cy + 0.6], [cx + 7.4, cy + 2]]), t.accent, { role: 'secondary' }),
  ];
}

/* 60 — Windmill Wheat Field */
const windmillWheatField: CakeTemplate = {
  id: 'windmill-wheat-field',
  version: 1,
  name: 'Windmill Wheat Field',
  description: 'A Dutch-style windmill over golden wheat, with a hot-air balloon and a camping tent.',
  category: 'farm',
  tags: { gender: ['unisex'], styles: ['editorial', 'adventurous'], occasions: ['birthday', 'naming', 'graduation'], ages: [1, 12] },
  aspect: 'landscape',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('poster', { display: 'playfair-display', title: 'poppins', body: 'poppins' }, {
    title: { x: 16, y: 112, width: 146, height: 12, maxSizePt: 18, minSizePt: 9, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.22 } },
    name: { x: 16, y: 88, width: 146, height: 24, maxSizePt: 36, minSizePt: 11, maxLines: 2, breakWords: true, families: ['playfair-display', 'poppins'] },
    subtitle: { x: 20, y: 116, width: 138, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
    age: { x: 138, y: 14, width: 30, height: 30, maxSizePt: 24, minSizePt: 12, families: ['playfair-display', 'poppins'] },
    date: { x: 16, y: 112, width: 146, height: 8, maxSizePt: 10, minSizePt: 7, families: ['poppins'] },
  }, { w: 177.8, h: 127 }),
  defaults: { name: 'Dhruv', title: 'Happy Birthday', subtitle: 'Fields, wind and a big sky', age: '7', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'gradient', accent: 'accentSoft' },
  safeInset: 8,
  notes: 'The only landscape design in the collection — check the document size list for 4 × 6 in landscape or A5.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 40, cy: 30, r: 15, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...hotAirBalloon(ctx, { cx: 132, cy: 34, scale: 0.66, stripes: [t.accent, t.primary, t.secondarySoft], basket: t.secondary }));
    nodes.push(...mountainRange(ctx, { x: -6, y: 44, w: 190, h: 34, back: t.primarySoft, front: t.foliage, snow: t.secondary, peaks: 4 }));
    nodes.push(...windmill(ctx, { cx: 62, cy: 66, scale: 1.0, body: t.surface, blade: t.accentDeep }));
    nodes.push(...tent(ctx, { cx: 146, cy: 74, w: 34, h: 22, fill: t.accent, trim: t.secondarySoft }));
    nodes.push(...campfire(ctx, { cx: 108, cy: 78, scale: 0.5, flame: t.accent, log: t.accentDeep }));
    nodes.push(...wheatField(input, 74));
    nodes.push(...bunting(ctx, { cx: input.width / 2, y: 8, width: 148, sag: 7, flags: 12, colors: [t.accent, t.primary, t.secondary], alternate: true }));
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

function wheatField(input: Parameters<CakeTemplate['compose']>[0], top: number): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const stalks: SceneNode[] = [];
  for (const [x, y] of scatter(26, { x: 6, y: top - 6, w: input.width - 12, h: 20 }, 6013, 5)) {
    stalks.push(line(ctx, 'wheat', `M ${x} ${y + 12} C ${x + 1} ${y + 4} ${x - 1} ${y - 2} ${x + 0.6} ${y - 8}`, t.accentDeep, 0.7, { opacity: 0.6, role: 'accents' }));
  }
  return [
    ink(ctx, 'wheat-field', polygonPath([[-4, top + 6], [input.width + 4, top + 2], [input.width + 4, input.height + 4], [-4, input.height + 4]]), t.accentSoft, { role: 'illustration', cut: true, label: 'Wheat field' }),
    ...stalks,
  ];
}

export const FARM_TEMPLATES: CakeTemplate[] = [
  barnyardSunrise,
  gardenBeeSunflower,
  littleTractorField,
  chickenCoopCute,
  windmillWheatField,
];
