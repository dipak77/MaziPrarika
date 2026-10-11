/**
 * Category I — Vehicles & Construction
 *
 * 41 Race Car Checkered · 42 Monster Truck Crush · 43 Digger Site
 * 44 Formula Number · 45 Airplane Sky Trail
 */

import { circlePath, polygonPath, rectPath } from '../../geometry.js';
import type { SceneNode } from '../../scene.js';
import { ink, line } from '../../art/helpers.js';
import { airplane, digger, formulaCar, hotAirBalloon, monsterTruck, raceCar } from '../../art/world.js';
import { burst, cloud, confetti, sparkle, starCluster } from '../../art/decor.js';
import { mountainRange, sun } from '../../art/world.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const SPORT = { display: 'bebas-neue', title: 'bebas-neue', body: 'poppins' };
const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

const SPORT_REGIONS = (f: { display: string; title: string; body: string }) =>
  layout('classic', f, {
    title: { x: 14, y: 88, width: 124.4, height: 12, maxSizePt: 22, minSizePt: 10, families: [f.title, f.display], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.22 } },
    name: { x: 13, y: 100, width: 126.4, height: 24, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: [f.display, f.title], letterSpacing: { min: 0, max: 0.16, default: 0.05 } },
  });

/* 41 — Race Car Checkered */
const raceCarCheckered: CakeTemplate = {
  id: 'race-car-checkered',
  version: 1,
  name: 'Race Car Checkered',
  description: 'A racing car crossing the finish line, with a printed chequered flag and tyre marks.',
  category: 'vehicles',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'playful'], occasions: ['birthday'], ages: [2, 10] },
  aspect: 'square',
  defaultPalette: 'rainbow-pop',
  typography: TYPOGRAPHY.boldSport!,
  regions: SPORT_REGIONS(SPORT),
  defaults: { name: 'Veer', title: 'Happy Birthday', subtitle: 'Fastest four-year-old on the grid', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'grid', accent: 'accentSoft', opacity: 0.3 },
  safeInset: 6,
  notes: 'The chequered flag is the only dense pattern; print at 300 PPI or above so the squares stay sharp.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...mountainRange(ctx, { x: -6, y: 44, w: 132, h: 34, back: t.secondarySoft, front: t.primarySoft, snow: t.secondary, peaks: 3 }));
    nodes.push(...sun(ctx, { cx: 124, cy: 30, r: 13, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...raceCar(ctx, { cx: 74, cy: 72, scale: 1.15, body: t.primary, trim: t.accent, wheel: t.outline, number: true }));
    nodes.push(...chequeredFlag(ctx, 24, 62));
    nodes.push(...speedMarks(input));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

/** Small chequered flag: 3×4 squares, alternating paper and ink. */
function chequeredFlag(ctx: ReturnType<typeof composeCtx>, x: number, y: number): SceneNode[] {
  const t = ctx.pal;
  const size = 5.4;
  const out: SceneNode[] = [
    ink(ctx, 'flag-pole', `M ${x} ${y} L ${x} ${y + 38}`, 'none', { stroke: { color: t.outline, width: 1.3 }, role: 'secondary' }),
  ];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const dark = (row + col) % 2 === 0;
      out.push(ink(ctx, 'flag-square', rectPath(x + col * size, y + row * size, size, size), dark ? t.outline : t.surface, { role: 'secondary', cut: false }));
    }
  }
  return out;
}

function speedMarks(input: Parameters<CakeTemplate['compose']>[0]): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (let i = 0; i < 5; i += 1) {
    const y = 62 + i * 6;
    out.push(line(ctx, 'speed', polygonPath([[128, y], [142, y - 3]], false), t.primary, 1.2, { opacity: 0.5, role: 'accents' }));
  }
  return out;
}

/* 42 — Monster Truck Crush */
const monsterTruckCrush: CakeTemplate = {
  id: 'monster-truck-crush',
  version: 1,
  name: 'Monster Truck Crush',
  description: 'A monster truck mid-jump over crushed cars, with mud splatter and a dust cloud.',
  category: 'vehicles',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'adventurous'], occasions: ['birthday'], ages: [3, 11] },
  aspect: 'square',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('band', SPORT, {
    title: { x: 20, y: 58, width: 112.4, height: 14, maxSizePt: 24, minSizePt: 10, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.2 } },
    name: { x: 16, y: 74, width: 120.4, height: 28, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'] },
    age: { x: 110, y: 12, width: 32, height: 32, maxSizePt: 26, minSizePt: 12, families: ['bebas-neue', 'poppins'] },
  }),
  defaults: { name: 'Kabir', title: 'Happy Birthday', subtitle: 'Crushing year six', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'Splat shapes are drawn as one blob each so the mud reads as paper, not as noise.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...burst(ctx, { cx: 76, cy: 44, r: 46, spikes: 18, fill: t.accentSoft, inner: t.secondary }));
    nodes.push(...monsterTruck(ctx, { cx: 76, cy: 50, scale: 1.1, body: t.primary, trim: t.accent, wheel: t.outline }));
    nodes.push(...crushedCar(ctx, 36, 92, 0.9, t.primaryDeep, t.secondarySoft));
    nodes.push(...crushedCar(ctx, 108, 94, 0.8, t.accentDeep, t.secondarySoft));
    nodes.push(...mudSplat(ctx, 24, 70, 1));
    nodes.push(...mudSplat(ctx, 128, 76, 0.8));
    nodes.push(...confetti(ctx, { box: { x: 14, y: 16, w: 124, h: 30 }, count: 22, colors: [t.accent, t.secondary, t.primarySoft], rand: input.rand, size: 3.4 }));
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.primary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.primaryDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function crushedCar(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, scale: number, body: string, roof: string): SceneNode[] {
  const w = 44 * scale;
  return [
    ink(ctx, 'crushed-car', polygonPath([[cx - w / 2, cy], [cx - w * 0.34, cy - 12 * scale], [cx + w * 0.3, cy - 13 * scale], [cx + w / 2, cy]]), body, { role: 'illustration', cut: true, label: 'Crushed car' }),
    ink(ctx, 'crushed-roof', polygonPath([[cx - w * 0.26, cy - 11 * scale], [cx + w * 0.2, cy - 12 * scale], [cx + w * 0.16, cy - 15 * scale], [cx - w * 0.2, cy - 14 * scale]]), roof, { role: 'secondary' }),
    ink(ctx, 'crushed-wheel', circlePath(cx - w * 0.28, cy + 1, 5 * scale), '#2b2b2b', { role: 'secondary' }),
    ink(ctx, 'crushed-wheel', circlePath(cx + w * 0.28, cy + 1, 5 * scale), '#2b2b2b', { role: 'secondary' }),
  ];
}

function mudSplat(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, scale: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'mud', `M ${cx - 10 * scale} ${cy} C ${cx - 14 * scale} ${cy - 8 * scale} ${cx - 4 * scale} ${cy - 12 * scale} ${cx} ${cy - 7 * scale} C ${cx + 5 * scale} ${cy - 13 * scale} ${cx + 13 * scale} ${cy - 6 * scale} ${cx + 9 * scale} ${cy + 1 * scale} C ${cx + 12 * scale} ${cy + 8 * scale} ${cx - 8 * scale} ${cy + 9 * scale} ${cx - 10 * scale} ${cy} Z`, t.primaryDeep, { role: 'accents', opacity: 0.9 }),
    ink(ctx, 'mud-dot', circlePath(cx + 13 * scale, cy - 7 * scale, 2.2 * scale), t.primaryDeep, { role: 'accents' }),
  ];
}

/* 43 — Digger Site */
const diggerSite: CakeTemplate = {
  id: 'digger-site',
  version: 1,
  name: 'Digger Site',
  description: 'A digger scooping sand on a construction site with traffic cones and a striped barrier.',
  category: 'vehicles',
  tags: { gender: ['boy', 'unisex'], styles: ['playful', 'bold'], occasions: ['birthday', 'first-birthday'], ages: [1, 7] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: SPORT_REGIONS({ display: 'baloo2', title: 'poppins', body: 'quicksand' }),
  defaults: { name: 'Advik', title: 'Happy Birthday', subtitle: 'Digging into year three', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'hills', accent: 'accentSoft', opacity: 0.4 },
  safeInset: 6,
  notes: 'Barrier stripes are printed; the barrier posts are the cut pieces so the shape stays rigid.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 30, cy: 30, r: 14, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...cloud(ctx, { cx: 108, cy: 26, w: 42, h: 17, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...digger(ctx, { cx: 70, cy: 62, scale: 1.1, body: t.accent, metal: t.primarySoft, wheel: t.outline }));
    nodes.push(...sandPile(ctx, 118, 96));
    nodes.push(...trafficCone(ctx, 34, 92, 1));
    nodes.push(...trafficCone(ctx, 50, 96, 0.8));
    nodes.push(line(ctx, 'ground', polygonPath([[8, 96], [144, 94]], false), t.primaryDeep, 1.1, { opacity: 0.45, role: 'accents' }));
    nodes.push(nameplateFor(input, { style: 'ticket', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

function sandPile(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'sand-pile', `M ${cx - 26} ${cy} C ${cx - 16} ${cy - 16} ${cx + 16} ${cy - 16} ${cx + 26} ${cy} Z`, t.secondarySoft, { role: 'illustration', cut: true, label: 'Sand pile' }),
    ink(ctx, 'sand-line', `M ${cx - 16} ${cy - 6} C ${cx - 6} ${cy - 11} ${cx + 6} ${cy - 11} ${cx + 15} ${cy - 5}`, 'none', { stroke: { color: t.accentDeep, width: 0.7, opacity: 0.5 }, role: 'accents' }),
  ];
}

function trafficCone(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, scale: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'cone', polygonPath([[cx - 7 * scale, cy], [cx - 2.2 * scale, cy - 18 * scale], [cx + 2.2 * scale, cy - 18 * scale], [cx + 7 * scale, cy]]), t.accent, { role: 'illustration', cut: true, label: 'Traffic cone' }),
    ink(ctx, 'cone-band', polygonPath([[cx - 5.2 * scale, cy - 6 * scale], [cx - 4 * scale, cy - 9 * scale], [cx + 4 * scale, cy - 9 * scale], [cx + 5.2 * scale, cy - 6 * scale]]), t.surface, { role: 'secondary' }),
    ink(ctx, 'cone-base', rectPath(cx - 8 * scale, cy, 16 * scale, 2.6 * scale), t.accentDeep, { role: 'secondary', cut: true }),
  ];
}

/* 44 — Formula Number */
const formulaNumber: CakeTemplate = {
  id: 'formula-number',
  version: 1,
  name: 'Formula Number',
  description: 'A low formula car with a big race number disc — the number is part of the composition.',
  category: 'vehicles',
  tags: { gender: ['boy', 'unisex'], styles: ['bold'], occasions: ['birthday', 'milestone'], ages: [4, 14] },
  aspect: 'square',
  defaultPalette: 'monochrome-ink',
  paletteOverrides: { 'rainbow-pop': { primary: '#ef4b4b', accent: '#2f6fd0' } },
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('band', SPORT, {
    title: { x: 20, y: 54, width: 112.4, height: 12, maxSizePt: 20, minSizePt: 9, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.24 } },
    name: { x: 12, y: 70, width: 128.4, height: 26, maxSizePt: 40, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'], letterSpacing: { min: 0, max: 0.18, default: 0.06 } },
    age: { x: 58, y: 14, width: 38, height: 38, maxSizePt: 34, minSizePt: 16, families: ['bebas-neue', 'poppins'] },
  }),
  defaults: { name: 'Arjun', title: 'Happy Birthday', subtitle: 'Pole position', age: '7', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'stripes', accent: 'accentSoft', opacity: 0.28 },
  safeInset: 6,
  notes: 'The age is deliberately large and central here — it is the racing number on the nose cone.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...linePattern(ctx, input.width));
    nodes.push(...formulaCar(ctx, { cx: 76, cy: 88, scale: 1.25, body: t.primary, trim: t.accent, wheel: t.outline }));
    nodes.push(ink(ctx, 'number-disc', circlePath(cx, 34, 22), t.surface, { role: 'age', cut: true, label: 'Number disc', material: 'accent' }));
    nodes.push(ink(ctx, 'number-ring', circlePath(cx, 34, 22), 'none', { stroke: { color: t.accent, width: 2.2 }, role: 'age' }));
    nodes.push(...starCluster(ctx, { points: [[26, 26], [126, 30], [22, 92], [132, 96]], r: 3, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { shape: 'disc' }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function linePattern(ctx: ReturnType<typeof composeCtx>, width: number): SceneNode[] {
  const t = ctx.pal;
  const out: SceneNode[] = [];
  for (let i = 0; i < 7; i += 1) {
    const y = 118 + i * 4.4;
    out.push(line(ctx, 'track-line', polygonPath([[8, y], [width - 8, y]], false), i % 2 === 0 ? t.outline : t.accent, 1, { opacity: 0.35, role: 'accents' }));
  }
  return out;
}

/* 45 — Airplane Sky Trail */
const airplaneSkyTrail: CakeTemplate = {
  id: 'airplane-sky-trail',
  version: 1,
  name: 'Airplane Sky Trail',
  description: 'A prop plane looping through clouds, leaving a dashed trail that spells the age.',
  category: 'vehicles',
  tags: { gender: ['unisex'], styles: ['playful', 'adventurous'], occasions: ['birthday', 'baby-shower'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: SPORT_REGIONS({ display: 'baloo2', title: 'poppins', body: 'quicksand' }),
  defaults: { name: 'Anaya', title: 'Happy Birthday', subtitle: 'Flying into year three', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.9 },
  safeInset: 6,
  notes: 'The trail is a dashed print line, so it disappears when you export a cut file — deliberately.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(ink(ctx, 'trail', `M 14 96 C 40 60 74 52 96 66 C 118 80 132 56 126 34`, 'none', { stroke: { color: t.accent, width: 1.6, dash: [4, 3], cap: 'round' }, role: 'accents', opacity: 0.85 }));
    nodes.push(...cloud(ctx, { cx: 34, cy: 34, w: 44, h: 18, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...cloud(ctx, { cx: 118, cy: 84, w: 40, h: 16, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...airplane(ctx, { cx: 78, cy: 52, scale: 1.2, body: t.primary, trim: t.accent, window: t.highlight, propeller: true }));
    nodes.push(...hotAirBalloon(ctx, { cx: 128, cy: 40, scale: 0.5, stripes: [t.accent, t.primary, t.secondarySoft], basket: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[24, 66], [52, 22], [96, 20]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(...sparkle(ctx, { cx: 44, cy: 88, r: 3, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'arch', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

export const VEHICLES_TEMPLATES: CakeTemplate[] = [
  raceCarCheckered,
  monsterTruckCrush,
  diggerSite,
  formulaNumber,
  airplaneSkyTrail,
];
