/**
 * @mazi/cake-atelier — template registry
 *
 * The single source of truth for the 60 designs. Validation runs at import time
 * and again in the test suite: duplicate ids, a category with the wrong count, a
 * region that falls outside the canvas or a missing material all fail loudly
 * instead of producing a broken topper at 11 p.m. the night before a party.
 */

import { CATEGORIES, NOMINAL_SIZE, type CakeTemplate, type CategoryId, type GenderTag, type OccasionTag, type StyleTag } from './types.js';
import { ROYAL_PRINCE_TEMPLATES } from './categories/royal-prince.js';
import { PRINCESS_TEMPLATES } from './categories/princess.js';
import { SAFARI_TEMPLATES } from './categories/safari.js';
import { DINO_TEMPLATES } from './categories/dino.js';
import { SPACE_TEMPLATES } from './categories/space.js';
import { HERO_TEMPLATES } from './categories/hero.js';
import { UNICORN_TEMPLATES } from './categories/unicorn.js';
import { TEDDY_TEMPLATES } from './categories/teddy.js';
import { VEHICLES_TEMPLATES } from './categories/vehicles.js';
import { FLORAL_TEMPLATES } from './categories/floral.js';
import { OCEAN_TEMPLATES } from './categories/ocean.js';
import { FARM_TEMPLATES } from './categories/farm.js';

export const TEMPLATES_PER_CATEGORY = 5;
export const EXPECTED_TEMPLATE_COUNT = 60;

/** The 60 designs, grouped by the twelve collections A–L. */
const CATEGORY_TEMPLATES: Record<CategoryId, CakeTemplate[]> = {
  'royal-prince': ROYAL_PRINCE_TEMPLATES,
  princess: PRINCESS_TEMPLATES,
  safari: SAFARI_TEMPLATES,
  dino: DINO_TEMPLATES,
  space: SPACE_TEMPLATES,
  hero: HERO_TEMPLATES,
  unicorn: UNICORN_TEMPLATES,
  teddy: TEDDY_TEMPLATES,
  vehicles: VEHICLES_TEMPLATES,
  floral: FLORAL_TEMPLATES,
  ocean: OCEAN_TEMPLATES,
  farm: FARM_TEMPLATES,
};

export function registerCategoryTemplates(category: CategoryId, templates: CakeTemplate[]): void {
  CATEGORY_TEMPLATES[category] = templates;
}

export function allTemplates(): CakeTemplate[] {
  return CATEGORIES.flatMap((category) => CATEGORY_TEMPLATES[category.id] ?? []);
}

const INDEX = new Map<string, CakeTemplate>();

export function rebuildIndex(): void {
  INDEX.clear();
  for (const template of allTemplates()) INDEX.set(template.id, template);
}

export function getTemplate(id: string): CakeTemplate | undefined {
  return INDEX.get(id);
}

export function requireTemplate(id: string): CakeTemplate {
  const template = getTemplate(id);
  if (!template) throw new Error(`cake-atelier: unknown template "${id}"`);
  return template;
}

export function templateIds(): string[] {
  return [...INDEX.keys()];
}

export function templatesByCategory(category: CategoryId): CakeTemplate[] {
  return CATEGORY_TEMPLATES[category] ?? [];
}

export function categoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of CATEGORIES) counts[category.id] = (CATEGORY_TEMPLATES[category.id] ?? []).length;
  return counts;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export interface TemplateIssue {
  templateId: string;
  severity: 'error' | 'warning';
  message: string;
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Structural validation of one template. Returns every problem it finds rather
 * than throwing on the first, so the report is useful.
 */
export function validateTemplate(template: CakeTemplate): TemplateIssue[] {
  const issues: TemplateIssue[] = [];
  const push = (severity: 'error' | 'warning', message: string) => issues.push({ templateId: template.id, severity, message });

  if (!ID_PATTERN.test(template.id)) push('error', `id "${template.id}" is not kebab-case`);
  if (template.version < 1) push('error', 'version must be >= 1');
  if (!template.name.trim()) push('error', 'name is empty');
  if (template.description.trim().length < 20) push('warning', 'description is very short');
  if (!template.materials.length) push('error', 'no materials declared');
  if (!template.materials.some((material) => material.id === 'base')) push('error', 'materials must include a "base" layer');
  if (!template.optionals.length) push('warning', 'no optional components declared');
  if (template.tags.ages[0] > template.tags.ages[1]) push('error', 'age range is inverted');
  if (!template.typography.weights.length) push('error', 'no allowed font weights');

  const nominal = NOMINAL_SIZE[template.aspect];
  for (const [regionId, spec] of Object.entries(template.regions)) {
    if (!spec) continue;
    if (spec.width <= 0 || spec.height <= 0) push('error', `region "${regionId}" has no area`);
    if (spec.minSizePt > spec.maxSizePt) push('error', `region "${regionId}" min size exceeds max size`);
    if (spec.maxLines < 1) push('error', `region "${regionId}" allows no lines`);
    if (!spec.families.length) push('error', `region "${regionId}" has no approved fonts`);
    const overflowsRight = spec.x + spec.width > nominal.w + 0.01;
    const overflowsBottom = spec.y + spec.height > nominal.h + 0.01;
    if (spec.x < -0.01 || spec.y < -0.01 || overflowsRight || overflowsBottom) {
      push('error', `region "${regionId}" falls outside the ${nominal.w}×${nominal.h} mm canvas`);
    }
    // A region that extends past the safe inset cannot honour the fixed-composition rule.
    const inset = template.safeInset;
    if (regionId !== 'date' && (spec.x < inset || spec.y < inset || spec.x + spec.width > nominal.w - inset || spec.y + spec.height > nominal.h - inset)) {
      push('warning', `region "${regionId}" crosses the ${inset} mm safe inset`);
    }
  }

  for (const regionId of ['name', 'title'] as const) {
    if (!template.regions[regionId]) push('error', `missing required region "${regionId}"`);
  }

  if (template.defaults.title.trim().length === 0) push('warning', 'default title is empty');
  if (template.defaults.name.trim().length === 0) push('warning', 'default name is empty');
  return issues;
}

export interface RegistryValidation {
  ok: boolean;
  templateCount: number;
  issues: TemplateIssue[];
  duplicateIds: string[];
  missingCategories: CategoryId[];
  categoryCounts: Record<string, number>;
}

/** Validate the whole registry — used by tests, the API and the build check. */
export function validateRegistry(options: { requireFullSet?: boolean } = {}): RegistryValidation {
  rebuildIndex();
  const templates = allTemplates();
  const seen = new Map<string, number>();
  const duplicateIds: string[] = [];
  for (const template of templates) {
    const count = (seen.get(template.id) ?? 0) + 1;
    seen.set(template.id, count);
    if (count === 2) duplicateIds.push(template.id);
  }

  const issues: TemplateIssue[] = [];
  if (duplicateIds.length) {
    for (const id of duplicateIds) issues.push({ templateId: id, severity: 'error', message: 'duplicate template id' });
  }
  for (const template of templates) issues.push(...validateTemplate(template));

  const missingCategories: CategoryId[] = [];
  const counts = categoryCounts();
  for (const category of CATEGORIES) {
    if ((counts[category.id] ?? 0) === 0) {
      missingCategories.push(category.id);
      continue;
    }
    if (options.requireFullSet && counts[category.id] !== TEMPLATES_PER_CATEGORY) {
      issues.push({
        templateId: category.id,
        severity: 'error',
        message: `category "${category.id}" has ${counts[category.id]} templates, expected ${TEMPLATES_PER_CATEGORY}`,
      });
    }
  }

  return {
    ok: issues.every((issue) => issue.severity !== 'error') && missingCategories.length === 0,
    templateCount: templates.length,
    issues,
    duplicateIds,
    missingCategories,
    categoryCounts: counts,
  };
}

/* ------------------------------------------------------------------ */
/* Discovery                                                           */
/* ------------------------------------------------------------------ */

export interface TemplateFilter {
  search?: string;
  category?: CategoryId | 'all';
  gender?: GenderTag | 'all';
  occasion?: OccasionTag | 'all';
  style?: StyleTag | 'all';
  age?: number | null;
  favorites?: string[];
  favoritesOnly?: boolean;
  recentIds?: string[];
  sort?: 'name' | 'category' | 'recent' | 'popular';
  ids?: string[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  categoryName: string;
  version: number;
  aspect: CakeTemplate['aspect'];
  tags: CakeTemplate['tags'];
  defaultPalette: string;
  fonts: string[];
  optionals: { id: string; label: string; default: boolean }[];
  materials: { id: string; label: string; color: string; simulatedFoil?: boolean }[];
  safeInset: number;
  notes: string;
}

export function summarise(template: CakeTemplate): TemplateSummary {
  const category = CATEGORIES.find((entry) => entry.id === template.category);
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    categoryName: category?.name ?? template.category,
    version: template.version,
    aspect: template.aspect,
    tags: template.tags,
    defaultPalette: template.defaultPalette,
    fonts: template.typography.name,
    optionals: template.optionals.map((option) => ({ id: option.id, label: option.label, default: option.default })),
    materials: template.materials.map((material) => ({
      id: material.id,
      label: material.label,
      color: material.color,
      ...(material.simulatedFoil ? { simulatedFoil: true } : {}),
    })),
    safeInset: template.safeInset,
    notes: template.notes,
  };
}

export function allSummaries(): TemplateSummary[] {
  return allTemplates().map(summarise);
}

const CATEGORY_ORDER = new Map(CATEGORIES.map((category) => [category.id, category.index]));

export function filterTemplates(filter: TemplateFilter = {}): CakeTemplate[] {
  const search = filter.search?.trim().toLowerCase() ?? '';
  const recent = new Map((filter.recentIds ?? []).map((id, index) => [id, index]));
  let list = allTemplates().filter((template) => {
    if (filter.ids && !filter.ids.includes(template.id)) return false;
    if (filter.category && filter.category !== 'all' && template.category !== filter.category) return false;
    if (filter.gender && filter.gender !== 'all' && !template.tags.gender.includes(filter.gender)) return false;
    if (filter.occasion && filter.occasion !== 'all' && !template.tags.occasions.includes(filter.occasion)) return false;
    if (filter.style && filter.style !== 'all' && !template.tags.styles.includes(filter.style)) return false;
    if (typeof filter.age === 'number') {
      const [min, max] = template.tags.ages;
      if (filter.age < min || filter.age > max) return false;
    }
    if (filter.favoritesOnly && filter.favorites && !filter.favorites.includes(template.id)) return false;
    if (search) {
      const haystack = `${template.name} ${template.description} ${template.id} ${template.tags.styles.join(' ')} ${template.tags.occasions.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  switch (filter.sort ?? 'category') {
    case 'name':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'recent':
      list = [...list].sort((a, b) => (recent.get(a.id) ?? 999) - (recent.get(b.id) ?? 999));
      break;
    case 'popular':
      list = [...list].sort((a, b) => b.tags.styles.length - a.tags.styles.length || a.name.localeCompare(b.name));
      break;
    default:
      list = [...list].sort(
        (a, b) =>
          (CATEGORY_ORDER.get(a.category) ?? 0) - (CATEGORY_ORDER.get(b.category) ?? 0) || a.name.localeCompare(b.name),
      );
  }
  return list;
}

rebuildIndex();
