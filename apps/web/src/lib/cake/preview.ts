/**
 * Cake Atelier Pro — client-side preview builder
 *
 * The editor preview must be *the artwork*, not an approximation: it is built by
 * the same `buildScene` the exporter calls, so what the customer arranges on
 * screen is what comes out of the printer. Text stays live (`<text>`) so it is
 * selectable and crisp at any zoom, and the browser renders it with the bundled
 * fonts that `fonts:sync` copies into `public/cake-fonts`.
 *
 * Two deliberate differences from the export path, both documented in the UI:
 *   • the browser shapes the text with its own engine (the server uses fontkit
 *     and can outline the glyphs), so hyphenation of a very long name can differ
 *     by a hair — the preflight panel reports the server's verdict;
 *   • rasterisation and PDF/PDF-layer work happens on the server, where resvg
 *     and the font files live.
 */

import {
  buildScene,
  renderSceneToSvg,
  requireTemplate,
  sceneFingerprint,
  DOCUMENT_SIZES,
  type BuildOptions,
  type DesignProject,
  type Scene,
  type TextLayouts,
} from '@mazi/cake-atelier';

export interface PreviewOptions {
  /** Show the cut contour so the user can see what the blade follows. */
  showCutline?: boolean;
  /** Show bleed / safe-area guides over the artwork. */
  showGuides?: boolean;
  /** Render without the background wash (transparent PNG preview). */
  transparent?: boolean;
  /** Hide the nameplate and other optional pieces the user switched off. */
  content?: BuildOptions['content'];
  zoom?: number;
}

export interface PreviewResult {
  svg: string;
  scene: Scene;
  fingerprint: string;
  /** Per-region fit results — the same numbers the preflight panel reports. */
  layouts: TextLayouts;
  /** Present only when the artwork could not be built at all. */
  error?: string;
}

export type BuildOutcome = PreviewResult | { error: string };

/**
 * Build a project's scene. Never throws: a broken project shows a message in the
 * studio instead of taking the page down, and the caller can offer a reset.
 */
export function buildProjectScene(project: DesignProject, options: PreviewOptions = {}): BuildOutcome {
  try {
    const template = requireTemplate(project.templateId);
    const built = buildScene(template, {
      paletteId: project.paletteId,
      tokenOverrides: project.tokenOverrides,
      content: { ...project.content, ...(options.content ?? {}) },
      flags: project.optionals,
      typography: {
        ...(project.typography.family ? { family: project.typography.family } : {}),
        ...(project.typography.nameSizePt !== undefined ? { nameSizePt: project.typography.nameSizePt } : {}),
        ...(project.typography.titleSizePt !== undefined ? { titleSizePt: project.typography.titleSizePt } : {}),
        ...(project.typography.nameTracking !== undefined ? { nameTracking: project.typography.nameTracking } : {}),
        ...(project.typography.weight !== undefined ? { weight: project.typography.weight } : {}),
        ...(project.typography.lineHeight !== undefined ? { lineHeight: project.typography.lineHeight } : {}),
      },
      hiddenIds: project.hiddenIds,
      projectName: project.name,
      sizeMm: { w: project.size.widthMm, h: project.size.heightMm },
      ...(options.transparent ? { transparent: true } : {}),
    });
    const svg = renderSceneToSvg(built.scene, {
      includeBackground: !options.transparent,
      showCutline: options.showCutline,
      showGuides: options.showGuides,
      bleedMm: options.showGuides ? project.export.bleedMm : 0,
      title: `${template.name} — ${project.content.name || 'topper'}`,
      description: `${project.size.widthMm} × ${project.size.heightMm} mm · palette ${project.paletteId}`,
    });
    return { svg, scene: built.scene, fingerprint: sceneFingerprint(built.scene), layouts: built.layouts };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The design could not be built.' };
  }
}

/** The preview shown next to a size preset, so the picker is visual. */
export function sizeSilhouette(sizeId: string): { widthMm: number; heightMm: number; shape: string; label: string } | undefined {
  const size = DOCUMENT_SIZES.find((entry) => entry.id === sizeId);
  if (!size) return undefined;
  return { widthMm: size.widthMm, heightMm: size.heightMm, shape: size.shape, label: size.label };
}

/** A data-URI the browser can show in an <img>, for thumbnails and downloads. */
export function isPreviewFailure(outcome: BuildOutcome): outcome is { error: string } {
  return 'error' in outcome;
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Trigger a client-side download for a SVG string or a Blob from the server. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next frame: Safari needs the URL to survive the click.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
