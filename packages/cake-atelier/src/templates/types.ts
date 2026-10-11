/**
 * @mazi/cake-atelier — template model
 *
 * A template is data, not a picture: identifiers, physical proportions, declared
 * text regions, allowed typography, its palette mapping, its paper materials and
 * a `compose` function that turns resolved content into scene nodes.
 *
 * The **fixed-composition rule** is enforced by this shape: `compose` receives
 * already-fitted text and never re-flows the illustration, so renaming a child
 * can only change the glyphs inside the declared name region (and, where a
 * template explicitly asks for it, the age badge).
 */

import type { PaletteId, PaletteTokens, TokenOverrides } from '../palettes.js';
import type { SceneNode } from '../scene.js';
import type { TextFitResult, TextRegionSpec } from '../typography/measure.js';
import type { BackgroundSpec } from '../art/backgrounds.js';

export type CategoryId =
  | 'royal-prince'
  | 'princess'
  | 'safari'
  | 'dino'
  | 'space'
  | 'hero'
  | 'unicorn'
  | 'teddy'
  | 'vehicles'
  | 'floral'
  | 'ocean'
  | 'farm';

export interface CakeCategory {
  id: CategoryId;
  index: number;
  name: string;
  blurb: string;
}

export type GenderTag = 'boy' | 'girl' | 'unisex';
export type StyleTag = 'royal' | 'playful' | 'pastel' | 'bold' | 'editorial' | 'cute' | 'adventurous' | 'luxury';
export type OccasionTag = 'birthday' | 'first-birthday' | 'milestone' | 'baby-shower' | 'naming' | 'anniversary' | 'graduation';

export interface TemplateTags {
  gender: GenderTag[];
  styles: StyleTag[];
  occasions: OccasionTag[];
  /** Recommended age range in years, inclusive. */
  ages: [number, number];
}

/** A physical paper the design is cut from — one output file per material. */
export interface MaterialSpec {
  id: string;
  label: string;
  /** Suggested cardstock colour (hex) for the cutting file and report. */
  color: string;
  /** Thin papers cannot carry tall unsupported shapes; surfaced by preflight. */
  weightGsm: number;
  note?: string;
  /** True when the layer stands in for a foil / spot-colour pass. */
  simulatedFoil?: boolean;
}

export interface OptionalComponentSpec {
  id: string;
  label: string;
  default: boolean;
  description: string;
}

export type RegionId = 'name' | 'title' | 'subtitle' | 'age' | 'date';

export interface TemplateTypography {
  /** Approved families for the child's name, first entry is the default. */
  name: string[];
  title: string[];
  subtitle: string[];
  age: string[];
  /** Weights the template allows across all of its text. */
  weights: number[];
  /** Templates that forbid script faces can say so explicitly. */
  allowScript: boolean;
  /** Default letter-spacing (em) for the name. */
  nameTracking?: number;
}

export interface ResolvedContent {
  name: string;
  title: string;
  subtitle: string;
  age: string;
  date: string;
  /** Optional line two for explicitly two-line name regions. */
  nameLine2?: string;
}

export interface ContentToggles {
  showSubtitle: boolean;
  showAge: boolean;
  showDate: boolean;
}

export type TextLayouts = Partial<Record<RegionId, TextFitResult>>;

export interface ComposeInput {
  template: CakeTemplate;
  tokens: PaletteTokens;
  paletteId: PaletteId;
  content: ResolvedContent;
  toggles: ContentToggles;
  flags: Record<string, boolean>;
  layouts: TextLayouts;
  /** Deterministic random source, seeded per template + content. */
  rand: () => number;
  /** Nominal design size in millimetres (before physical scaling). */
  width: number;
  height: number;
  /** Style overrides coming from the project (typography panel). */
  textFill?: { name?: string; title?: string; subtitle?: string };
  /** Clip paths a composition needs (id → path data in scene units). */
  clips: Record<string, string>;
}

export interface CakeTemplate {
  /** Stable, unique, kebab-case. Never reused. */
  id: string;
  /** Bumped whenever the composition changes in a way projects should notice. */
  version: number;
  name: string;
  description: string;
  category: CategoryId;
  tags: TemplateTags;
  /** Nominal proportions — `square` designs are drawn at 152.4 mm. */
  aspect: 'square' | 'portrait' | 'landscape';
  defaultPalette: PaletteId;
  /** Per-palette token remapping so recolouring keeps the composition coherent. */
  paletteOverrides?: Partial<Record<PaletteId, TokenOverrides>>;
  typography: TemplateTypography;
  regions: Record<RegionId, TextRegionSpec> & { name: TextRegionSpec; title: TextRegionSpec };
  /** Defaults shown when the template is first opened. */
  defaults: ResolvedContent;
  optionals: OptionalComponentSpec[];
  materials: MaterialSpec[];
  background: BackgroundSpec;
  /** Distance from the trim edge that must stay free of critical artwork. */
  safeInset: number;
  /** Design intent notes shown in the Help / production guide. */
  notes: string;
  compose: (input: ComposeInput) => SceneNode[];
}

export const NOMINAL_SIZE: Record<CakeTemplate['aspect'], { w: number; h: number }> = {
  square: { w: 152.4, h: 152.4 },
  portrait: { w: 127, h: 177.8 },
  landscape: { w: 177.8, h: 127 },
};

export const CATEGORIES: CakeCategory[] = [
  { id: 'royal-prince', index: 1, name: 'Royal Prince', blurb: 'Crowns, crests and castles in navy, emerald and gold.' },
  { id: 'princess', index: 2, name: 'Princess & Royal Celebration', blurb: 'Tiaras, pearl chains and rose-gold frames.' },
  { id: 'safari', index: 3, name: 'Jungle & Safari', blurb: 'Leaves, elephants and a very brave little lion.' },
  { id: 'dino', index: 4, name: 'Dinosaurs', blurb: 'Friendly giants, eggs, fossils and one smoking volcano.' },
  { id: 'space', index: 5, name: 'Space & Galaxy', blurb: 'Orbits, rockets and a moon to dream on.' },
  { id: 'hero', index: 6, name: 'Original Superhero Designs', blurb: 'Emblems, bolts and capes — all original artwork.' },
  { id: 'unicorn', index: 7, name: 'Unicorn & Fantasy', blurb: 'Pastel manes, fairy wings and celestial moons.' },
  { id: 'teddy', index: 8, name: 'Teddy Bear & Woodland', blurb: 'Soft bears, bunnies and a woodland fox.' },
  { id: 'vehicles', index: 9, name: 'Vehicles & Construction', blurb: 'Race cars, diggers and one very loud truck.' },
  { id: 'floral', index: 10, name: 'Floral & Butterfly', blurb: 'Wreaths, arches and editorial minimalism.' },
  { id: 'ocean', index: 11, name: 'Ocean & Underwater', blurb: 'Coral gardens, sailors and mermaid-inspired seas.' },
  { id: 'farm', index: 12, name: 'Farm, Aviation & Adventure', blurb: 'Barns, balloons, mountains and sunflowers.' },
];

export const CATEGORY_INDEX: Record<string, CakeCategory> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
);

/** Shared default: a square 6 in topper. */
export function nominalSize(template: CakeTemplate): { w: number; h: number } {
  return NOMINAL_SIZE[template.aspect];
}
