/**
 * Category K — Ocean & Underwater
 *
 * 51 Under the Sea Friends · 52 Whale Wave Splash · 53 Turtle Bubbles
 * 54 Mermaid Lagoon · 55 Sailboat Seaside
 */

import { circlePath, polygonPath, waveBandPath } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { bubbleFrame, coral, fish, jellyfish, mermaidTail, octopus, sailorHat, seaShell, seaTurtle, seahorse, whale } from '../../art/motifs.js';
import { burst, cloud, pearlChain, starCluster } from '../../art/decor.js';
import { lighthouse, sun } from '../../art/world.js';
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

/** Three stacked wave bands — the floor every ocean template stands on. */
function seaFloor(input: Parameters<CakeTemplate['compose']>[0], top: number): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  return [
    ink(ctx, 'sea-deep', polygonPath([[-4, top], [input.width + 4, top], [input.width + 4, input.height + 4], [-4, input.height + 4]]), t.primary, { role: 'illustration', cut: true, label: 'Sea band' }),
    ink(ctx, 'sea-shell-wave', waveBandPath(-4, top - 6, input.width + 8, 12, 4, 0.7), t.primarySoft, { role: 'illustration' }),
    ink(ctx, 'sea-mid', waveBandPath(-4, top + 12, input.width + 8, 14, 3, 0.6), mix(t.primary, t.primaryDeep, 0.4), { role: 'illustration' }),
  ];
}

/* 51 — Under the Sea Friends */
const underTheSeaFriends: CakeTemplate = {
  id: 'under-the-sea-friends',
  version: 1,
  name: 'Under the Sea Friends',
  description: 'A cheerful octopus at the centre of a coral garden with three fish swimming past.',
  category: 'ocean',
  tags: { gender: ['unisex'], styles: ['playful', 'cute'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Aarohi', title: 'Happy Birthday', subtitle: 'Lost in the deep blue', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'bubbles', accent: 'accentSoft', opacity: 0.6 },
  safeInset: 6,
  notes: 'Bubbles are printed circles of 2.5 mm and up — no cut dots smaller than a hole punch.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 76, cy: 24, r: 20, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...seaFloor(input, 82));
    nodes.push(...octopus(ctx, { cx: 72, cy: 62, scale: 1.1, body: t.accent, spot: t.secondarySoft }));
    nodes.push(...fish(ctx, { cx: 32, cy: 44, scale: 0.7, body: t.primary, fin: t.accent, belly: t.secondary, facing: 1, pattern: 'stripes' }));
    nodes.push(...fish(ctx, { cx: 124, cy: 56, scale: 0.62, body: t.secondary, fin: t.primary, belly: t.accentSoft, facing: -1, pattern: 'spots' }));
    nodes.push(...coral(ctx, { cx: 26, cy: 92, h: 26, fill: t.accent, branches: 3 }));
    nodes.push(...coral(ctx, { cx: 128, cy: 94, h: 22, fill: t.primarySoft, branches: 3 }));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [126, 30], [40, 74]], r: 2.6, fill: t.secondarySoft }));
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

/* 52 — Whale Wave Splash */
const whaleWaveSplash: CakeTemplate = {
  id: 'whale-wave-splash',
  version: 1,
  name: 'Whale Wave Splash',
  description: 'A whale breaching through a wave arch with a spray of printed bubbles.',
  category: 'ocean',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'adventurous'], occasions: ['birthday'], ages: [2, 10] },
  aspect: 'square',
  defaultPalette: 'royal-blue-gold',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('band', PLAY, {
    title: { x: 20, y: 56, width: 112.4, height: 14, maxSizePt: 23, minSizePt: 10, families: ['baloo2', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
    name: { x: 16, y: 72, width: 120.4, height: 28, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['baloo2', 'quicksand'] },
    age: { x: 110, y: 12, width: 32, height: 32, maxSizePt: 26, minSizePt: 12, families: ['baloo2', 'poppins'] },
  }),
  defaults: { name: 'Rudra', title: 'Happy Birthday', subtitle: 'Making a splash', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'waves', accent: 'primarySoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'The spray is a printed pattern, so the whole topper is only five cut pieces.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...waveArch(input, 52));
    nodes.push(...whale(ctx, { cx: 72, cy: 52, scale: 1.15, body: t.primaryDeep, belly: t.surface }));
    nodes.push(...spray(input, 74, 34));
    nodes.push(...seaFloor(input, 88));
    nodes.push(...fish(ctx, { cx: 28, cy: 96, scale: 0.5, body: t.accent, fin: t.secondary, facing: 1 }));
    nodes.push(...starCluster(ctx, { points: [[26, 22], [128, 26], [140, 74]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

function waveArch(input: Parameters<CakeTemplate['compose']>[0], top: number): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const nodes: SceneNode[] = [
    ink(ctx, 'wave-back', waveBandPath(-4, top - 14, input.width + 8, 22, 3, 0.9), t.primarySoft, { role: 'illustration', cut: true, label: 'Wave' }),
    ink(ctx, 'wave-front', waveBandPath(-4, top - 2, input.width + 8, 18, 4, 0.8), t.primary, { role: 'illustration' }),
  ];
  return nodes;
}

function spray(input: Parameters<CakeTemplate['compose']>[0], cx: number, cy: number): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = Math.PI * (1.1 + (i / 14) * 0.8);
    const radius = 12 + input.rand() * 26;
    out.push(ink(ctx, 'spray-bubble', circlePath(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.6, 1.4 + input.rand() * 2.2), t.secondarySoft, { role: 'accents', opacity: 0.8 }));
  }
  return out;
}

/* 53 — Turtle Bubbles */
const turtleBubbles: CakeTemplate = {
  id: 'turtle-bubbles',
  version: 1,
  name: 'Turtle Bubbles',
  description: 'A patterned sea turtle inside a bubble frame, surrounded by jellyfish and shells.',
  category: 'ocean',
  tags: { gender: ['unisex'], styles: ['cute', 'pastel'], occasions: ['first-birthday', 'baby-shower', 'naming'], ages: [0, 5] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.2 } },
  }),
  defaults: { name: 'Kiara', title: 'Happy Birthday', subtitle: 'Slow and steady wins the year', age: '2', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'bubbles', accent: 'accentSoft', opacity: 0.55 },
  safeInset: 6,
  notes: 'The shell pattern is printed in a slightly deeper ink so it reads even on pastel card.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(bubbleFrame(ctx, { cx: 76, cy: 56, r: 40, fill: t.surface, rim: t.primarySoft }));
    nodes.push(...seaTurtle(ctx, { cx: 74, cy: 56, scale: 1.0, shell: t.primary, shellRim: t.accent, skin: t.accentSoft, pattern: 'scales' }));
    nodes.push(...jellyfish(ctx, { cx: 28, cy: 30, scale: 0.8, bell: t.accent, tentacle: t.accentSoft }));
    nodes.push(...jellyfish(ctx, { cx: 128, cy: 40, scale: 0.62, bell: t.primary, tentacle: t.primarySoft }));
    nodes.push(...seaShell(ctx, { cx: 28, cy: 100, r: 11, fill: t.secondary, ridge: t.accent, pearl: true }));
    nodes.push(...seaShell(ctx, { cx: 132, cy: 98, r: 8, fill: t.accentSoft, ridge: t.primary, pearl: false }));
    nodes.push(...starCluster(ctx, { points: [[56, 20], [102, 22], [140, 74]], r: 2.4, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
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

/* 54 — Mermaid Lagoon */
const mermaidLagoon: CakeTemplate = {
  id: 'mermaid-lagoon',
  version: 1,
  name: 'Mermaid Lagoon',
  description: 'A scaled mermaid tail rising from the waves, with shells, seahorses and pearls.',
  category: 'ocean',
  tags: { gender: ['girl'], styles: ['pastel', 'luxury'], occasions: ['birthday', 'first-birthday'], ages: [1, 10] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  paletteOverrides: { 'mint-candy': { primary: '#9fd8d0', accent: '#f2b8c6' } },
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('classic', { display: 'playfair-display', title: 'poppins', body: 'quicksand' }, {
    name: { x: 13, y: 97, width: 126.4, height: 26, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['playfair-display', 'quicksand'] },
  }),
  defaults: { name: 'Anvi', title: 'Happy Birthday', subtitle: 'Part of your world', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'gradient', accent: 'primarySoft' },
  safeInset: 6,
  notes: 'The tail scales are drawn as a printed pattern; only the tail silhouette is cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...burst(ctx, { cx, cy: 54, r: 46, spikes: 20, fill: t.surface, inner: t.accentSoft }));
    nodes.push(...mermaidTail(ctx, { cx, cy: 54, h: 68, fill: t.primary, scaleFill: t.accent }));
    nodes.push(...pearlChain(ctx, { cx, cy: 74, r: 40, from: Math.PI * 1.05, to: Math.PI * 1.95, count: 15, pearlR: 1.6, fill: t.highlight }));
    nodes.push(...seahorse(ctx, { cx: 30, cy: 66, h: 34, fill: t.accent }));
    nodes.push(...seahorse(ctx, { cx: 122, cy: 70, h: 28, fill: t.accentSoft }));
    nodes.push(...seaShell(ctx, { cx: 40, cy: 98, r: 10, fill: t.secondary, ridge: t.primary, pearl: true }));
    nodes.push(...starCluster(ctx, { points: [[26, 24], [128, 28], [110, 16]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
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

/* 55 — Sailboat Seaside */
const sailboatSeaside: CakeTemplate = {
  id: 'sailboat-seaside',
  version: 1,
  name: 'Sailboat Seaside',
  description: 'A little sailboat on flat waves with a lighthouse, gulls and a sailor hat.',
  category: 'ocean',
  tags: { gender: ['boy', 'unisex'], styles: ['playful', 'editorial'], occasions: ['birthday', 'naming'], ages: [1, 9] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 88, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
  }),
  defaults: { name: 'Aryan', title: 'Happy Birthday', subtitle: 'Sailing into year five', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.85 },
  safeInset: 6,
  notes: 'The sail is one tall shape with a printed seam; the hull is a separate cut piece for clean layering.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...sun(ctx, { cx: 30, cy: 28, r: 15, fill: t.accentSoft, ray: t.accent }));
    nodes.push(...cloud(ctx, { cx: 112, cy: 28, w: 44, h: 17, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...lighthouse(ctx, { cx: 128, cy: 74, h: 46, body: t.surface, stripe: t.accent, light: t.accentSoft }));
    nodes.push(...sailboat(ctx, cx - 8, 74));
    nodes.push(...gulls(ctx));
    nodes.push(...seaFloor(input, 92));
    nodes.push(...sailorHat(ctx, { cx: 60, cy: 110, w: 30, fill: t.surface, band: t.primary }));
    nodes.push(...starCluster(ctx, { points: [[26, 60], [140, 40]], r: 2.6, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.primary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function sailboat(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'hull', polygonPath([[cx - 26, cy], [cx + 26, cy], [cx + 18, cy + 12], [cx - 18, cy + 12]]), t.primaryDeep, { role: 'illustration', cut: true, label: 'Hull' }),
    ink(ctx, 'mast', polygonPath([[cx, cy], [cx, cy - 40]], false), 'none', { stroke: { color: t.outline, width: 1.4 }, role: 'secondary' }),
    ink(ctx, 'sail-main', polygonPath([[cx + 1, cy - 38], [cx + 24, cy - 4], [cx + 1, cy - 4]]), t.surface, { role: 'illustration', cut: true, label: 'Main sail' }),
    ink(ctx, 'sail-jib', polygonPath([[cx - 1, cy - 34], [cx - 16, cy - 4], [cx - 1, cy - 4]]), t.accent, { role: 'illustration', cut: true, label: 'Jib sail' }),
    ink(ctx, 'sail-seam', polygonPath([[cx + 1, cy - 30], [cx + 16, cy - 6]], false), 'none', { stroke: { color: t.primarySoft, width: 0.6 }, role: 'accents' }),
  ];
}

function gulls(ctx: ReturnType<typeof composeCtx>): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'gull', `M 40 40 C 44 36 46 36 50 39 C 54 36 56 36 60 40`, 'none', { stroke: { color: t.outline, width: 1.1, cap: 'round' }, role: 'accents' }),
    ink(ctx, 'gull', `M 84 30 C 87 27 88 27 91 29 C 94 27 95 27 98 30`, 'none', { stroke: { color: t.outline, width: 1, cap: 'round' }, role: 'accents' }),
  ];
}

export const OCEAN_TEMPLATES: CakeTemplate[] = [
  underTheSeaFriends,
  whaleWaveSplash,
  turtleBubbles,
  mermaidLagoon,
  sailboatSeaside,
];
