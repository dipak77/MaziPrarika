/**
 * Convenience wrapper: derive a layer manifest straight from a built scene.
 * The studio uses this to show the cardstock breakdown before any file exists.
 */

import { buildLayerManifest, planLayers, type LayerManifest, type LayerPlan } from '../print/layers.js';
import type { Scene } from '../scene.js';
import type { CakeTemplate } from '../templates/types.js';

export function layerManifestFromScene(
  scene: Scene,
  template: CakeTemplate,
  options: { cutToleranceMm?: number; registration?: boolean } = {},
): LayerManifest {
  const plan: LayerPlan[] = planLayers(scene, template.materials);
  return buildLayerManifest(plan, scene, options);
}
