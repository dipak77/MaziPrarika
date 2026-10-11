/**
 * Category E — Space & Galaxy
 *
 * 21 Rocket Blast Off · 22 Little Astronaut · 23 Planet Parade
 * 24 Moon Landing · 25 Galaxy Name
 */

import { circlePath, scatter } from '../../geometry.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { astronaut, cometTrail, crescentMoon, galaxySwirl, moon, orbitArc, planet, rocket, satellite } from '../../art/world.js';
import { burst, cloud, pearlChain, sparkle, starCluster } from '../../art/decor.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const SPORT = { display: 'bebas-neue', title: 'bebas-neue', body: 'poppins' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/** Deterministic star field clipped to the upper two thirds. */
function starField(input: Parameters<CakeTemplate['compose']>[0], count = 26): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (const [x, y] of scatter(count, { x: 8, y: 8, w: input.width - 16, h: 74 }, 5150, 7)) {
    const r = 0.9 + input.rand() * 1.5;
    out.push(ink(ctx, 'star-dot', circlePath(x, y, r), input.rand() > 0.72 ? t.accent : t.secondarySoft, { role: 'accents' }));
  }
  return out;
}

/* 21 — Rocket Blast Off */
const rocketBlastOff: CakeTemplate = {
  id: 'rocket-blast-off',
  version: 1,
  name: 'Rocket Blast Off',
  description: 'A tilted rocket climbing past a ringed planet, with a comet and a full star field.',
  category: 'space',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'adventurous'], occasions: ['birthday'], ages: [2, 9] },
  aspect: 'square',
  defaultPalette: 'royal-blue-gold',
  paletteOverrides: { 'midnight-gold': { primary: '#f4ecd8', primarySoft: '#3a4157' } },
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('classic', SPORT, {
    title: { x: 14, y: 88, width: 124.4, height: 12, maxSizePt: 22, minSizePt: 10, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.22 } },
    name: { x: 13, y: 100, width: 126.4, height: 24, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'], letterSpacing: { min: 0, max: 0.16, default: 0.06 } },
  }),
  defaults: { name: 'Arjun', title: 'Happy Birthday', subtitle: 'Three, two, one…', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.9 },
  safeInset: 6,
  notes: 'The flame is a separate cut piece in accent paper so it can be swapped for orange or left off entirely.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...starField(input));
    nodes.push(...planet(ctx, { cx: 122, cy: 34, r: 17, fill: t.primarySoft, band: t.secondary, ring: true, ringFill: t.accent }));
    nodes.push(...cometTrail(ctx, { cx: 30, cy: 26, length: 54, angle: Math.PI * 0.15, color: t.secondarySoft }));
    nodes.push(...rocket(ctx, { cx: 66, cy: 66, scale: 1.15, body: t.surface, nose: t.accent, window: t.primary, flame: t.secondary, tilt: -0.28 }));
    nodes.push(...crescentMoon(ctx, { cx: 26, cy: 78, r: 11, fill: t.secondarySoft }));
    nodes.push(...starCluster(ctx, { points: [[46, 40], [96, 22], [140, 78]], r: 3.2, fill: t.secondary }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

/* 22 — Little Astronaut */
const littleAstronaut: CakeTemplate = {
  id: 'little-astronaut',
  version: 1,
  name: 'Little Astronaut',
  description: 'A small astronaut standing on a cratered moon, flag planted and stars overhead.',
  category: 'space',
  tags: { gender: ['unisex'], styles: ['playful', 'adventurous'], occasions: ['birthday', 'first-birthday'], ages: [1, 7] },
  aspect: 'square',
  defaultPalette: 'midnight-gold',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
    name: { x: 13, y: 97, width: 126.4, height: 26, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
  }),
  defaults: { name: 'Vihaan', title: 'Happy Birthday', subtitle: 'One small step for a little one', age: '3', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.85 },
  safeInset: 6,
  notes: 'Dark paper needs the pale inner suit printed on white card — the preset card colours in the report say which sheet each layer uses.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...orbitArc(ctx, { cx: 76, cy: 40, rx: 62, ry: 22, rotate: -0.24, color: t.secondarySoft, dashes: true }));
    nodes.push(...starField(input, 20));
    nodes.push(...moon(ctx, { cx: 70, cy: 82, r: 34, fill: t.secondary, ink: t.primarySoft }));
    nodes.push(...astronaut(ctx, { cx: 62, cy: 58, scale: 1.0, suit: t.surface, visor: t.accent, trim: t.primarySoft }));
    nodes.push(ink(ctx, 'flag-pole', `M 104 40 L 104 84`, 'none', { stroke: { color: t.secondarySoft, width: 1.4 }, role: 'secondary' }));
    nodes.push(ink(ctx, 'flag', `M 104 42 L 128 47 L 104 53 Z`, t.accent, { role: 'secondary', cut: true, label: 'Flag' }));
    nodes.push(...sparkle(ctx, { cx: 30, cy: 30, r: 3.6, fill: t.secondary }));
    nodes.push(...satellite(ctx, { cx: 124, cy: 66, scale: 0.62, body: t.secondarySoft, panel: t.primary }));
    nodes.push(nameplateFor(input, { style: 'hexagon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
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

/* 23 — Planet Parade */
const planetParade: CakeTemplate = {
  id: 'planet-parade',
  version: 1,
  name: 'Planet Parade',
  description: 'Four paper planets on orbit lines, each a different size — a quiet, graphic sky.',
  category: 'space',
  tags: { gender: ['unisex'], styles: ['editorial', 'playful'], occasions: ['birthday', 'naming', 'baby-shower'], ages: [1, 12] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', { display: 'playfair-display', title: 'poppins', body: 'poppins' }),
  defaults: { name: 'Anika', title: 'Happy Birthday', subtitle: 'Four planets, one wish', age: '4', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.7 },
  safeInset: 9,
  notes: 'Orbit lines print at 0.5 mm; if your printer is faint, switch the guides off in Print & Export.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...orbitArc(ctx, { cx, cy: 64, rx: 52, ry: 34, rotate: 0, color: t.secondarySoft }));
    nodes.push(...orbitArc(ctx, { cx, cy: 64, rx: 34, ry: 22, rotate: 0.2, color: t.primarySoft }));
    nodes.push(...planet(ctx, { cx, cy: 64, r: 15, fill: t.accent, band: t.secondary, ring: false }));
    nodes.push(...planet(ctx, { cx: 30, cy: 34, r: 8, fill: t.primary, band: t.primarySoft }));
    nodes.push(...planet(ctx, { cx: 124, cy: 40, r: 10.5, fill: t.secondarySoft, band: t.accent }));
    nodes.push(...planet(ctx, { cx: 118, cy: 96, r: 6.5, fill: t.primarySoft, band: t.accentSoft }));
    nodes.push(...pearlChain(ctx, { cx, cy: 64, r: 52, from: Math.PI * 1.02, to: Math.PI * 1.98, count: 15, pearlR: 1.2, fill: t.highlight }));
    if (on(input, 'sparkles')) {
      nodes.push(...sparkle(ctx, { cx: 44, cy: 106, r: 3.2, fill: t.secondary }), ...sparkle(ctx, { cx: 102, cy: 22, r: 2.8, fill: t.secondarySoft }));
    }
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

/* 24 — Moon Landing */
const moonLanding: CakeTemplate = {
  id: 'moon-landing',
  version: 1,
  name: 'Moon Landing',
  description: 'A crescent moon with a sleeping face, ringed by stars and a rising rocket silhouette.',
  category: 'space',
  tags: { gender: ['unisex'], styles: ['cute', 'pastel'], occasions: ['first-birthday', 'baby-shower'], ages: [0, 4] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('medallion', { display: 'quicksand', title: 'quicksand', body: 'quicksand' }, {
    name: { x: 34, y: 60, width: 84.4, height: 30, maxSizePt: 36, minSizePt: 11, maxLines: 2, breakWords: true, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Meera', title: 'Happy Birthday', subtitle: 'Sweet dreams, little star', age: '2', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'gradient', accent: 'primarySoft' },
  safeInset: 6,
  notes: 'The sleeping face is printed at 0.6 mm; disable it in optionals for a minimal version.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...starField(input, 22));
    nodes.push(...crescentMoon(ctx, { cx: 76, cy: 52, r: 34, fill: t.secondary }));
    nodes.push(...moon(ctx, { cx: 118, cy: 34, r: 10, fill: t.accentSoft, face: true, ink: t.ink }));
    nodes.push(...cloud(ctx, { cx: 36, cy: 96, w: 46, h: 18, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...cloud(ctx, { cx: 118, cy: 92, w: 38, h: 15, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [44, 62], [128, 66], [104, 16]], r: 2.8, fill: t.accentSoft }));
    nodes.push(...sparkle(ctx, { cx: 96, cy: 26, r: 3.4, fill: t.secondary }));
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accentSoft }));
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

/* 25 — Galaxy Name */
const galaxyName: CakeTemplate = {
  id: 'galaxy-name',
  version: 1,
  name: 'Galaxy Name',
  description: 'A swirling galaxy disc with the name set inside it — typography-led and modern.',
  category: 'space',
  tags: { gender: ['unisex'], styles: ['editorial', 'bold'], occasions: ['birthday', 'milestone', 'naming'], ages: [3, 14] },
  aspect: 'square',
  defaultPalette: 'midnight-gold',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('medallion', SPORT, {
    title: { x: 30, y: 54, width: 92.4, height: 12, maxSizePt: 19, minSizePt: 9, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.36, default: 0.24 } },
    name: { x: 28, y: 72, width: 96.4, height: 30, maxSizePt: 40, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'], letterSpacing: { min: 0, max: 0.18, default: 0.07 } },
    subtitle: { x: 32, y: 104, width: 88.4, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
  }),
  defaults: { name: 'Ayaan', title: 'Happy Birthday', subtitle: 'Written in the stars', age: '8', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.8 },
  safeInset: 7,
  notes: 'Highest-contrast template in the collection; pair it with Midnight & Gold for the sharpest print.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...galaxySwirl(ctx, { cx, cy: 66, r: 54, color: t.primary, arm: t.primarySoft }));
    nodes.push(...burst(ctx, { cx, cy: 66, r: 40, spikes: 18, fill: t.surface, inner: t.primarySoft }));
    nodes.push(...starField(input, 18));
    nodes.push(...planet(ctx, { cx: 24, cy: 34, r: 7, fill: t.accent, band: t.secondary }));
    nodes.push(...crescentMoon(ctx, { cx: 132, cy: 40, r: 8, fill: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[40, 30], [112, 26], [136, 104], [20, 100]], r: 3.4, fill: t.secondary }));
    nodes.push(nameplateFor(input, { style: 'plaque', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
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

export const SPACE_TEMPLATES: CakeTemplate[] = [
  rocketBlastOff,
  littleAstronaut,
  planetParade,
  moonLanding,
  galaxyName,
];
