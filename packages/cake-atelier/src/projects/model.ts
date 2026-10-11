/**
 * @mazi/cake-atelier — the DesignProject model
 *
 * A project stores *customisations*, never artwork: the template id and version,
 * the child's details, typography, palette, explicit token overrides, optional
 * component switches, physical size and export settings. Templates live in the
 * registry, so improving a template improves every project that used it — and a
 * project can always be reset to its template's original composition.
 */

import { hashSeed, round } from '../geometry.js';
import { isPaletteId, type TokenOverrides } from '../palettes.js';
import { DEFAULT_EXPORT_SETTINGS } from '../export/manifest.js';
import type { CakeTemplate, ResolvedContent, ContentToggles } from '../templates/types.js';
import { getTemplate } from '../templates/registry.js';
import { DEFAULT_TOGGLES } from '../templates/layout.js';
import { SCHEMA_VERSION, type DesignProject, type ExportSettings, type ProjectContent, type ProjectTypography } from '../validation/schemas.js';
import { defaultFlags } from '../templates/scaffold.js';

export interface CreateProjectOptions {
  templateId?: string;
  content?: Partial<ProjectContent>;
  paletteId?: string;
  size?: { presetId: string; widthMm: number; heightMm: number };
  name?: string;
  id?: string;
  now?: string;
}

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** Sortable, collision-resistant, and safe in a filename. */
export function newProjectId(now = Date.now(), entropy = Math.random): string {
  let suffix = '';
  for (let i = 0; i < 8; i += 1) suffix += ID_ALPHABET[Math.floor(entropy() * ID_ALPHABET.length)];
  const stamp = now.toString(36).slice(-6);
  return `prj_${stamp}${suffix}`;
}

export function defaultContentFor(template: CakeTemplate): ProjectContent {
  return {
    name: template.defaults.name,
    title: template.defaults.title,
    subtitle: template.defaults.subtitle,
    age: template.defaults.age,
    date: template.defaults.date,
  };
}

export function createProject(options: CreateProjectOptions = {}): DesignProject {
  const template = getTemplate(options.templateId ?? 'royal-prince-crown') ?? getTemplate('royal-prince-crown');
  if (!template) {
    throw new Error('cake-atelier: no templates are registered — cannot create a project.');
  }
  const now = options.now ?? new Date().toISOString();
  const content = { ...defaultContentFor(template), ...(options.content ?? {}) };
  return {
    schemaVersion: SCHEMA_VERSION,
    id: options.id ?? newProjectId(),
    templateId: template.id,
    templateVersion: template.version,
    name: options.name ?? `${content.name || 'Untitled'} · ${template.name}`,
    content,
    typography: { family: {} },
    paletteId: options.paletteId && isPaletteId(options.paletteId) ? options.paletteId : template.defaultPalette,
    tokenOverrides: {},
    optionals: defaultFlags(template),
    size: options.size ?? { presetId: 'topper-6-round', widthMm: 152.4, heightMm: 152.4 },
    export: { ...DEFAULT_EXPORT_SETTINGS },
    starred: false,
    hiddenIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function touch(project: DesignProject, now = new Date().toISOString()): DesignProject {
  return { ...project, updatedAt: now };
}

export function renameProject(project: DesignProject, name: string, now = new Date().toISOString()): DesignProject {
  return { ...project, name: name.slice(0, 80), updatedAt: now };
}

export function duplicateProject(project: DesignProject, now = new Date().toISOString()): DesignProject {
  return {
    ...project,
    id: newProjectId(Date.parse(now) || Date.now()),
    name: `${project.name} (copy)`.slice(0, 80),
    createdAt: now,
    updatedAt: now,
    starred: false,
  };
}

export function toggleStar(project: DesignProject, now = new Date().toISOString()): DesignProject {
  return { ...project, starred: !project.starred, updatedAt: now };
}

/** Reset every customisation back to the template's original composition. */
export function resetProject(project: DesignProject, template: CakeTemplate, now = new Date().toISOString()): DesignProject {
  return {
    ...project,
    content: defaultContentFor(template),
    typography: { family: {} },
    paletteId: template.defaultPalette,
    tokenOverrides: {},
    optionals: defaultFlags(template),
    hiddenIds: [],
    updatedAt: now,
  };
}

export function resetPalette(project: DesignProject, template: CakeTemplate, now = new Date().toISOString()): DesignProject {
  return { ...project, paletteId: template.defaultPalette, tokenOverrides: {}, updatedAt: now };
}

export function resetText(project: DesignProject, template: CakeTemplate, now = new Date().toISOString()): DesignProject {
  return { ...project, content: defaultContentFor(template), typography: { family: {} }, updatedAt: now };
}

/** Apply a new template while keeping what the user typed. */
export function switchTemplate(
  project: DesignProject,
  template: CakeTemplate,
  options: { keepContent?: boolean; keepPalette?: boolean; now?: string } = {},
): DesignProject {
  return {
    ...project,
    templateId: template.id,
    templateVersion: template.version,
    content: options.keepContent === false ? defaultContentFor(template) : project.content,
    paletteId: options.keepPalette === false || !isPaletteId(project.paletteId) ? template.defaultPalette : project.paletteId,
    typography: options.keepContent === false ? { family: {} } : project.typography,
    optionals: defaultFlags(template),
    hiddenIds: [],
    updatedAt: options.now ?? new Date().toISOString(),
  };
}

export function textToggles(project: DesignProject): ContentToggles {
  return {
    ...DEFAULT_TOGGLES,
    showSubtitle: Boolean(project.content.subtitle.trim()),
    showAge: Boolean(project.content.age.trim()),
    showDate: Boolean(project.content.date.trim()),
  };
}

export function resolvedContent(project: DesignProject): ResolvedContent {
  return { ...project.content };
}

/* ------------------------------------------------------------------ */
/* Change detection & indexing                                         */
/* ------------------------------------------------------------------ */

/** Content-relevant fingerprint of a project — drives autosave and undo. */
export function projectRevision(project: DesignProject): string {
  const significant = {
    templateId: project.templateId,
    templateVersion: project.templateVersion,
    content: project.content,
    typography: project.typography,
    paletteId: project.paletteId,
    tokenOverrides: project.tokenOverrides,
    optionals: project.optionals,
    size: project.size,
    hiddenIds: project.hiddenIds,
  };
  return round(hashSeed(JSON.stringify(significant)) / 0xffffffff, 8).toString(36);
}

export function isDirty(saved: DesignProject | undefined, current: DesignProject): boolean {
  if (!saved) return true;
  return projectRevision(saved) !== projectRevision(current) || saved.id !== current.id;
}

export function projectSummary(project: DesignProject): {
  id: string;
  name: string;
  templateId: string;
  childName: string;
  size: string;
  updatedAt: string;
  starred: boolean;
  paletteId: string;
  age: string;
} {
  return {
    id: project.id,
    name: project.name,
    templateId: project.templateId,
    childName: project.content.name,
    size: `${round(project.size.widthMm, 1)} × ${round(project.size.heightMm, 1)} mm`,
    updatedAt: project.updatedAt,
    starred: project.starred,
    paletteId: project.paletteId,
    age: project.content.age,
  };
}

/* ------------------------------------------------------------------ */
/* Typography helpers                                                  */
/* ------------------------------------------------------------------ */

export function withTypography(project: DesignProject, patch: ProjectTypography, now = new Date().toISOString()): DesignProject {
  return {
    ...project,
    typography: {
      ...project.typography,
      ...patch,
      family: { ...(project.typography.family ?? {}), ...(patch.family ?? {}) },
    },
    updatedAt: now,
  };
}

export function withPalette(
  project: DesignProject,
  paletteId: string,
  overrides: TokenOverrides | undefined,
  now = new Date().toISOString(),
): DesignProject {
  return {
    ...project,
    paletteId: isPaletteId(paletteId) ? paletteId : project.paletteId,
    tokenOverrides: overrides ?? project.tokenOverrides,
    updatedAt: now,
  };
}

export function withExportSettings(project: DesignProject, patch: Partial<ExportSettings>, now = new Date().toISOString()): DesignProject {
  return { ...project, export: { ...project.export, ...patch }, updatedAt: now };
}

export function withOptional(project: DesignProject, id: string, value: boolean, now = new Date().toISOString()): DesignProject {
  return { ...project, optionals: { ...project.optionals, [id]: value }, updatedAt: now };
}

export function withContent(project: DesignProject, patch: Partial<ProjectContent>, now = new Date().toISOString()): DesignProject {
  return { ...project, content: { ...project.content, ...patch }, updatedAt: now };
}

export function withSize(
  project: DesignProject,
  size: { presetId: string; widthMm: number; heightMm: number },
  now = new Date().toISOString(),
): DesignProject {
  return { ...project, size, updatedAt: now };
}

/** Old projects referencing a removed template must fail gracefully. */
export interface TemplateResolution {
  template?: CakeTemplate;
  missing: boolean;
  versionDrift: boolean;
  message?: string;
}

export function resolveProjectTemplate(project: DesignProject): TemplateResolution {
  const template = getTemplate(project.templateId);
  if (!template) {
    return {
      missing: true,
      versionDrift: false,
      message: `Template "${project.templateId}" is no longer in this version of Cake Atelier Pro. Pick a replacement from the library — your name, colours and size settings are kept.`,
    };
  }
  if (template.version !== project.templateVersion) {
    return {
      template,
      missing: false,
      versionDrift: true,
      message: `This template has been updated (v${project.templateVersion} → v${template.version}). The composition may differ slightly; your text and palette are untouched.`,
    };
  }
  return { template, missing: false, versionDrift: false };
}
