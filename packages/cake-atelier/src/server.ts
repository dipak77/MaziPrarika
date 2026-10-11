/**
 * @mazi/cake-atelier/server — Node-only entry point
 *
 * Importing this module pulls in `resvg` (native) and `fontkit`, so it is kept
 * strictly out of the browser bundle: the client imports `@mazi/cake-atelier`,
 * the exporter imports `@mazi/cake-atelier/server`.
 */

import 'server-only';

export * from './render/png.js';
export * from './render/pdf.js';
export * from './typography/outline.js';
export * from './export/assets.js';
export * from './export/zip.js';
export * from './export/flat.js';
export * from './export/manifest.js';
export * from './export/layers-helper.js';
export * from './print/layers.js';
export * from './print/materials.js';
export * from './print/preflight.js';
export * from './print/sizes.js';
export * from './validation/schemas.js';
export * from './projects/model.js';
export * from './templates/registry.js';
export * from './templates/build.js';
export * from './render/svg.js';
export * from './scene.js';
export * from './palettes.js';
export * from './geometry.js';
export * from './templates/types.js';
