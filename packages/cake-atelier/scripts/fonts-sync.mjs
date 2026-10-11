#!/usr/bin/env node
/**
 * Copies the bundled Cake Atelier fonts into the web app's `public/cake-fonts`
 * directory so the browser can (a) render live <text> previews with the exact
 * faces the print engine shapes with, and (b) preload them without a network
 * request. Also writes `public/cake-fonts/fonts.css`.
 *
 * Usage:  npm run fonts:sync --workspace @mazi/cake-atelier
 */

import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const source = path.join(packageRoot, 'fonts');
const repoRoot = path.resolve(packageRoot, '..', '..');
const target = path.join(repoRoot, 'apps', 'web', 'public', 'cake-fonts');

function familyDirs(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const families = familyDirs(source);
if (!families.length) {
  console.error(`[fonts:sync] no font families found in ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

let files = 0;
let bytes = 0;
for (const family of families) {
  const from = path.join(source, family);
  const to = path.join(target, family);
  mkdirSync(to, { recursive: true });
  for (const file of readdirSync(from)) {
    cpSync(path.join(from, file), path.join(to, file));
    files += 1;
    bytes += statSync(path.join(to, file)).size;
  }
}

// A stylesheet the app can import once; weights match fonts.ts exactly.
const css = families
  .flatMap((family) =>
    readdirSync(path.join(source, family))
      .filter((file) => file.endsWith('.ttf'))
      .map((file) => {
        const weight = Number.parseInt(file.match(/-(\d{3})\.ttf$/)?.[1] ?? '400', 10);
        return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('/cake-fonts/${family}/${file}') format('truetype');}`;
      }),
  )
  .join('\n');

writeFileSync(path.join(target, 'fonts.css'), `${css}\n`, 'utf8');

console.log(
  `[fonts:sync] ${families.length} families, ${files} files (${(bytes / 1024 / 1024).toFixed(1)} MB) → ${path.relative(repoRoot, target)}`,
);
