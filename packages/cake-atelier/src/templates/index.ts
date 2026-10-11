/**
 * @mazi/cake-atelier/templates — the design library without the renderers.
 *
 * Importing this entry point keeps the export pipeline (and its native
 * dependencies) out of any bundle that only needs to browse templates.
 */

export * from './types.js';
export * from './registry.js';
export * from './build.js';
export * from './layout.js';
export * from './presets.js';
export * from './scaffold.js';

export { ROYAL_PRINCE_TEMPLATES } from './categories/royal-prince.js';
export { PRINCESS_TEMPLATES } from './categories/princess.js';
export { SAFARI_TEMPLATES } from './categories/safari.js';
export { DINO_TEMPLATES } from './categories/dino.js';
export { SPACE_TEMPLATES } from './categories/space.js';
export { HERO_TEMPLATES } from './categories/hero.js';
export { UNICORN_TEMPLATES } from './categories/unicorn.js';
export { TEDDY_TEMPLATES } from './categories/teddy.js';
export { VEHICLES_TEMPLATES } from './categories/vehicles.js';
export { FLORAL_TEMPLATES } from './categories/floral.js';
export { OCEAN_TEMPLATES } from './categories/ocean.js';
export { FARM_TEMPLATES } from './categories/farm.js';
