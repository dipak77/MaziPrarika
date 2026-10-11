/**
 * @mazi/cake-atelier — public API
 *
 * Cake Atelier Pro is split into one package with clear seams:
 *
 *   geometry   — path construction shared by every backend
 *   scene      — the render model (what a design *is*)
 *   palettes   — semantic colour tokens and 12 curated palettes
 *   typography — font registry, measurement, auto-fit, shaping, text-to-path
 *   art        — the reusable vector primitive library
 *   templates  — 60 composed designs plus the registry
 *   render     — SVG / PDF / PNG / ZIP emitters
 *   print      — physical sizes, materials, layers, preflight
 *   projects   — the versioned DesignProject model
 *
 * The package runs in the browser (pure modules) and on the server (the same
 * modules plus the node-only exporters under `./server`).
 */

export * from './geometry.js';
export * from './path.js';
export * from './scene.js';
export * from './palettes.js';

export * from './typography/fonts.js';
export * from './typography/measure.js';

export * from './templates/types.js';
export * from './templates/registry.js';
export * from './templates/build.js';
export * from './templates/layout.js';
export * from './templates/presets.js';
export * from './templates/scaffold.js';

export * from './art/helpers.js';
export * from './art/backgrounds.js';
export * from './art/decor.js';
export * from './art/royal.js';
export * from './art/animals.js';
export * from './art/world.js';
export * from './art/motifs.js';

/**
 * Explicit re-exports win over `export *`, so the intended meaning of the two
 * names that exist in more than one module is pinned here.
 */
export { deg } from './art/helpers.js';
export type { TextLine, TextFitResult } from './typography/measure.js';

export * from './render/svg.js';
export * from './render/scale.js';

export * from './print/sizes.js';
export * from './print/materials.js';
export * from './print/layers.js';
export * from './print/preflight.js';

export * from './validation/schemas.js';
export * from './projects/model.js';
export * from './export/manifest.js';
