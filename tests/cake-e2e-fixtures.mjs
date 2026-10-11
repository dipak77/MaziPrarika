/**
 * Cake Atelier Pro — E2E fixtures.
 *
 * Builds request bodies with the engine's own project model, so the end-to-end
 * test posts exactly what the studio posts. Importing the TypeScript package from
 * a plain `.mjs` harness works because the repo registers a TypeScript resolver
 * for `node --import ./scripts/register-ts.mjs` (see `npm run test:e2e:cake`).
 */

import { createProject } from '../packages/cake-atelier/src/projects/model.ts';

const now = new Date('2026-01-01T00:00:00.000Z').toISOString();

/**
 * The body `POST /api/cake/export` expects: the export request fields at the top
 * level, with the project nested under `project`.
 */
export function defaultProjectFor(templateId, name) {
  const project = createProject({
    templateId,
    id: 'prj_e2e0001',
    now,
    name: `${name || 'Untitled'} · e2e`,
    content: {
      name,
      title: 'Happy Birthday',
      subtitle: 'Feel the joy',
      age: '5',
      date: '',
    },
  });

  return {
    project,
    format: project.export.format,
    ppi: project.export.ppi,
    transparent: project.export.transparent,
    bleedMm: project.export.bleedMm,
    includeGuides: project.export.includeGuides,
    includeRegistration: project.export.includeRegistration,
    outlineText: project.export.outlineText,
    cutToleranceMm: project.export.cutToleranceMm,
  };
}

/** Overlay a patch on the nested project, keeping the export fields in step. */
export function projectWith(body, patch) {
  const project = {
    ...body.project,
    ...patch,
    updatedAt: now,
  };
  return {
    ...body,
    project,
    ...(patch.export
      ? {
          format: patch.export.format ?? body.format,
          ppi: patch.export.ppi ?? body.ppi,
          transparent: patch.export.transparent ?? body.transparent,
          bleedMm: patch.export.bleedMm ?? body.bleedMm,
          includeGuides: patch.export.includeGuides ?? body.includeGuides,
          includeRegistration: patch.export.includeRegistration ?? body.includeRegistration,
          outlineText: patch.export.outlineText ?? body.outlineText,
          cutToleranceMm: patch.export.cutToleranceMm ?? body.cutToleranceMm,
        }
      : {}),
  };
}
