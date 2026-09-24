#!/usr/bin/env node
/**
 * Mazi Patrika — app icon generator.
 *
 *   node scripts/generate-icons.mjs
 *
 * One source of truth for the PWA / favicon artwork. The mark is drawn as vector
 * geometry (a zari-bordered field with a lotus rosette) rather than typeset text,
 * so it rasterises identically on every machine and needs no Marathi font at build
 * time. Output: maskable + standard PNGs at the sizes Chrome, iOS and Android ask
 * for, plus the SVG favicon Next picks up from `app/icon.svg`.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicIcons = resolve(root, 'apps/web/public/icons');
const appDir = resolve(root, 'apps/web/src/app');

const MAROON = '#6B1D2A';
const MAROON_DEEP = '#4E1420';
const GOLD = '#C9A227';
const IVORY = '#FBF7EF';
const HALDI = '#E8A33D';

/**
 * One lotus petal as a bezier leaf, tip pointing "up" (-Y), base at the centre.
 * Real petals — not rotated ellipses, which read as a propeller.
 */
function petal(cx, cy, tip, width, rotation) {
  const w = width;
  const c1 = `${cx - w},${cy - tip * 0.42}`;
  const c2 = `${cx - w * 0.62},${cy - tip * 0.86}`;
  const c3 = `${cx + w * 0.62},${cy - tip * 0.86}`;
  const c4 = `${cx + w},${cy - tip * 0.42}`;
  const path = `M ${cx},${cy} C ${c1} ${c2} ${cx},${cy - tip} C ${c3} ${c4} ${cx},${cy} Z`;
  return `<path d="${path}" transform="rotate(${rotation} ${cx} ${cy})" />`;
}

/** The mark: a zari-bordered maroon field with a gold lotus rosette. */
function markSvg({ size = 512, bleed = 0 } = {}) {
  const s = size;
  const inset = bleed + s * 0.075;
  const inner = s - inset * 2;
  const cx = s / 2;
  const cy = s / 2;
  const outerPetals = Array.from({ length: 8 }, (_, i) => petal(cx, cy, inner * 0.4, inner * 0.1, i * 45)).join('');
  const innerPetals = Array.from({ length: 8 }, (_, i) => petal(cx, cy, inner * 0.24, inner * 0.062, i * 45 + 22.5)).join('');
  const zari = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = inner / 2 - s * 0.008;
    return `<circle cx="${(cx + Math.cos(a) * r).toFixed(2)}" cy="${(cy + Math.sin(a) * r).toFixed(2)}"
      r="${(s * 0.0085).toFixed(2)}" fill="${i % 2 ? GOLD : HALDI}" opacity="0.9" />`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <defs>
    <linearGradient id="field" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${MAROON}"/>
      <stop offset="1" stop-color="${MAROON_DEEP}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.45" stop-color="${GOLD}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${bleed ? 0 : s * 0.22}" fill="url(#field)"/>
  <rect width="${s}" height="${s}" rx="${bleed ? 0 : s * 0.22}" fill="url(#glow)"/>
  <rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${inner * 0.19}"
        fill="none" stroke="${GOLD}" stroke-width="${s * 0.013}" opacity="0.85"/>
  <rect x="${inset + s * 0.038}" y="${inset + s * 0.038}" width="${inner - s * 0.076}" height="${inner - s * 0.076}"
        rx="${inner * 0.15}" fill="none" stroke="${GOLD}" stroke-width="${s * 0.005}" opacity="0.45"/>
  <g>${zari}</g>
  <g fill="${GOLD}" opacity="0.95">${outerPetals}</g>
  <g fill="${HALDI}" opacity="0.85">${innerPetals}</g>
  <circle cx="${cx}" cy="${cy}" r="${inner * 0.1}" fill="${IVORY}"/>
  <circle cx="${cx}" cy="${cy}" r="${inner * 0.062}" fill="${MAROON_DEEP}"/>
  <circle cx="${cx}" cy="${cy}" r="${inner * 0.026}" fill="${GOLD}"/>
</svg>`;
}

const sizeable = [
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 0.14],
  ['apple-touch-icon.png', 180, 0],
];

mkdirSync(publicIcons, { recursive: true });
mkdirSync(appDir, { recursive: true });

const sharp = (await import('sharp')).default;
for (const [name, size, bleed] of sizeable) {
  const svg = Buffer.from(markSvg({ size, bleed: bleed * size }));
  await sharp(svg).png({ compressionLevel: 9 }).toFile(resolve(publicIcons, name));
  console.log(`  ✓ icons/${name}`);
}

const favicon = markSvg({ size: 64 });
writeFileSync(resolve(appDir, 'icon.svg'), favicon);
writeFileSync(resolve(publicIcons, 'icon.svg'), markSvg({ size: 512 }));
console.log('  ✓ app/icon.svg + icons/icon.svg');
