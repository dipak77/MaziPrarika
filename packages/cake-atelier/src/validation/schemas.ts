/**
 * @mazi/cake-atelier — runtime validation
 *
 * Every project that arrives from IndexedDB, a JSON import or an export request
 * is parsed with these schemas. Zod runs in the browser and on the server, so a
 * hand-edited backup file cannot smuggle a 9000-character name or an SVG payload
 * into the renderer.
 */

import { z } from 'zod';

import { OVERRIDABLE_TOKENS, PALETTE_IDS, isHexColor } from '../palettes.js';
import { DOCUMENT_SIZES, MAX_MM, MIN_MM } from '../print/sizes.js';

export const SCHEMA_VERSION = 1 as const;

const hexColor = z
  .string()
  .trim()
  .refine((value) => isHexColor(value), { message: 'Expected a hex colour such as #1a2b3c' });

const safeText = (max: number) =>
  z
    .string()
    .max(max, `Text must be ${max} characters or fewer`)
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), { message: 'Control characters are not allowed' })
    .refine((value) => !/<\/?\s*(script|svg|iframe|foreignObject)/i.test(value), { message: 'Markup is not allowed in text fields' });

export const ContentSchema = z.object({
  name: safeText(60),
  title: safeText(48),
  subtitle: safeText(80),
  age: safeText(12),
  date: safeText(28),
});

export type ProjectContent = z.infer<typeof ContentSchema>;

const familyId = z.string().min(1).max(40);

export const TypographySchema = z.object({
  /** Face family per region. */
  family: z
    .object({
      name: familyId.optional(),
      title: familyId.optional(),
      subtitle: familyId.optional(),
      age: familyId.optional(),
    })
    .default({}),
  weight: z.number().int().min(100).max(900).optional(),
  /** Requested name size in points; the auto-fit engine may still shrink it. */
  nameSizePt: z.number().min(6).max(200).optional(),
  titleSizePt: z.number().min(6).max(120).optional(),
  /** Letter spacing in em. */
  nameTracking: z.number().min(-0.05).max(0.4).optional(),
  lineHeight: z.number().min(0.8).max(2).optional(),
});

export type ProjectTypography = z.infer<typeof TypographySchema>;

export const TokenOverridesSchema = z
  .object(
    Object.fromEntries(OVERRIDABLE_TOKENS.map((token) => [token, hexColor.optional()])) as Record<
      (typeof OVERRIDABLE_TOKENS)[number],
      z.ZodOptional<typeof hexColor>
    >,
  )
  .partial();

export const SizeSchema = z.object({
  presetId: z
    .string()
    .refine((value) => value === 'custom' || DOCUMENT_SIZES.some((entry) => entry.id === value), {
      message: 'Unknown document size preset',
    }),
  widthMm: z.number().min(MIN_MM).max(MAX_MM),
  heightMm: z.number().min(MIN_MM).max(MAX_MM),
});

export type ProjectSize = z.infer<typeof SizeSchema>;

export const ExportSettingsSchema = z.object({
  format: z.enum(['png', 'svg', 'pdf', 'layers']).default('png'),
  ppi: z.number().int().min(72).max(600).default(300),
  transparent: z.boolean().default(true),
  /** Bleed in millimetres; 0 disables it. */
  bleedMm: z.number().min(0).max(10).default(0),
  includeCutline: z.boolean().default(false),
  includeRegistration: z.boolean().default(true),
  includeGuides: z.boolean().default(false),
  outlineText: z.boolean().default(true),
  cutToleranceMm: z.number().min(0).max(2).default(0.3),
  layers: z.enum(['all', 'cut-only']).default('all'),
});

export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

export const DesignProjectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string().min(6).max(64),
  templateId: z.string().min(2).max(64),
  templateVersion: z.number().int().min(1),
  name: safeText(80),
  content: ContentSchema,
  typography: TypographySchema,
  paletteId: z.enum(PALETTE_IDS as [string, ...string[]]),
  tokenOverrides: TokenOverridesSchema.default({}),
  optionals: z.record(z.boolean()).default({}),
  size: SizeSchema,
  export: ExportSettingsSchema,
  starred: z.boolean().default(false),
  hiddenIds: z.array(z.string().max(120)).max(80).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  notes: safeText(280).optional(),
});

export type DesignProject = z.infer<typeof DesignProjectSchema>;

export const ProjectFileSchema = z.object({
  kind: z.literal('cake-atelier-project'),
  schemaVersion: z.number().int().min(1),
  exportedAt: z.string().datetime(),
  appVersion: z.string().max(32),
  project: DesignProjectSchema,
});

export type ProjectFile = z.infer<typeof ProjectFileSchema>;

/** Export API request — validated on the server before any rendering. */
export const ExportRequestSchema = z.object({
  project: DesignProjectSchema,
  format: z.enum(['png', 'svg', 'pdf', 'layers']),
  ppi: z.number().int().min(72).max(600).optional(),
  transparent: z.boolean().optional(),
  bleedMm: z.number().min(0).max(10).optional(),
  includeCutline: z.boolean().optional(),
  includeRegistration: z.boolean().optional(),
  includeGuides: z.boolean().optional(),
  outlineText: z.boolean().optional(),
  cutToleranceMm: z.number().min(0).max(2).optional(),
  /** Warn-level issues the user has seen and accepted. */
  acknowledgement: z
    .object({
      acceptedWarnings: z.array(z.string().max(120)).max(40).default([]),
      at: z.string().datetime(),
    })
    .optional(),
  /** Preview-only flag: returns measurements instead of a file. */
  dryRun: z.boolean().optional(),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

export const TemplateFilterSchema = z.object({
  search: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  gender: z.string().max(20).optional(),
  occasion: z.string().max(30).optional(),
  style: z.string().max(30).optional(),
  age: z.number().int().min(0).max(30).nullable().optional(),
  sort: z.enum(['name', 'category', 'recent', 'popular']).optional(),
  favoritesOnly: z.boolean().optional(),
});

export type ProjectParseResult =
  | { ok: true; project: DesignProject; migrated: boolean }
  | { ok: false; errors: string[] };

/** Parse + migrate a stored or imported project. Never throws. */
export function parseProject(input: unknown): ProjectParseResult {
  const migration = migrateProject(input);
  if (!migration.ok) return { ok: false, errors: migration.errors };
  const parsed = DesignProjectSchema.safeParse(migration.value);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'project'}: ${issue.message}`),
    };
  }
  return { ok: true, project: parsed.data, migrated: migration.migrated };
}

interface MigrationResult {
  ok: boolean;
  value: unknown;
  migrated: boolean;
  errors: string[];
}

/**
 * Version migrations. Each step is a real transformation; unknown future
 * versions are rejected rather than guessed at.
 */
export function migrateProject(input: unknown): MigrationResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, value: input, migrated: false, errors: ['Project data must be an object.'] };
  }
  let value = input as Record<string, unknown>;
  // Accept a wrapped project file.
  if (value.kind === 'cake-atelier-project' && value.project && typeof value.project === 'object') {
    value = value.project as Record<string, unknown>;
  }
  let migrated = false;
  const version = typeof value.schemaVersion === 'number' ? value.schemaVersion : 0;

  if (version === 0) {
    // v0 (pre-release drafts) stored content at the top level.
    const content = (value.content as Record<string, unknown> | undefined) ?? {};
    value = {
      ...value,
      schemaVersion: SCHEMA_VERSION,
      content: {
        name: content.name ?? value.childName ?? '',
        title: content.title ?? value.title ?? 'Happy Birthday',
        subtitle: content.subtitle ?? value.subtitle ?? '',
        age: content.age ?? value.age ?? '',
        date: content.date ?? value.date ?? '',
      },
      typography: value.typography ?? {},
      tokenOverrides: value.tokenOverrides ?? {},
      optionals: value.optionals ?? {},
      size: value.size ?? { presetId: 'topper-6-round', widthMm: 152.4, heightMm: 152.4 },
      export: value.export ?? {},
      starred: value.starred ?? false,
      hiddenIds: value.hiddenIds ?? [],
    };
    migrated = true;
  } else if (version > SCHEMA_VERSION) {
    return {
      ok: false,
      value,
      migrated: false,
      errors: [`This project was saved by a newer version of Cake Atelier Pro (schema ${version}). Update the app to open it.`],
    };
  }

  return { ok: true, value, migrated, errors: [] };
}

/** Build a portable project file payload. */
export function toProjectFile(project: DesignProject, appVersion: string, exportedAt = new Date().toISOString()): ProjectFile {
  return {
    kind: 'cake-atelier-project',
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    appVersion,
    project,
  };
}

export function parseProjectFile(input: unknown): ProjectParseResult {
  const parsed = ProjectFileSchema.safeParse(input);
  if (parsed.success) {
    return parseProject(parsed.data.project);
  }
  return parseProject(input);
}
