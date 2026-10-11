'use client';

/**
 * Cake Atelier Pro — the live design canvas.
 *
 * Renders the project's SVG (built by the same engine the exporter uses), with
 * zoom controls, an optional cut-contour overlay, a warning strip when the fit
 * engine cannot satisfy a request, and a caption showing the physical size and
 * pixel count for the chosen PPI.
 *
 * Accessibility: the SVG is exposed as a single labelled image — a screen reader
 * gets the design's name and size rather than 400 path elements.
 */

import { useMemo, useState } from 'react';

import type { DesignProject, PreflightResult, TextLayouts } from '@mazi/cake-atelier';

import { buildProjectScene } from '@/lib/cake/preview';
import { StatusPill } from './field';

export interface CakeCanvasProps {
  project: DesignProject;
  layouts?: TextLayouts;
  preflight?: PreflightResult;
  showCutline: boolean;
  onToggleCutline: (value: boolean) => void;
  showGuides: boolean;
  onToggleGuides: (value: boolean) => void;
  zoom: number;
  onZoom: (value: number) => void;
  /** Rendered next to the toolbar — usually the project name field. */
  toolbar?: React.ReactNode;
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function CakeCanvas({
  project,
  preflight,
  showCutline,
  onToggleCutline,
  showGuides,
  onToggleGuides,
  zoom,
  onZoom,
  toolbar,
}: CakeCanvasProps) {
  const [failed, setFailed] = useState(false);

  const preview = useMemo(
    () => buildProjectScene(project, { showCutline, showGuides, transparent: false }),
    [project, showCutline, showGuides],
  );

  if ('error' in preview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p className="font-semibold">This design could not be drawn.</p>
        <p className="mt-1 text-red-700">{preview.error}</p>
        <p className="mt-2 text-[11px] text-red-600">
          Reset the design to the template default, or pick a size that matches the artwork.
        </p>
      </div>
    );
  }

  const { svg } = preview;
  const nameLayout = preview.layouts.name;
  const floatWarnings = nameLayout?.warnings ?? [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ivory-300/80 bg-white/80 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-ivory-300 bg-white p-0.5">
            <button
              type="button"
              onClick={() => onZoom(Math.max(0.25, zoom - 0.25))}
              className="btn-icon h-7 w-7 text-sm"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-ink-600">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => onZoom(Math.min(3, zoom + 0.25))}
              className="btn-icon h-7 w-7 text-sm"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <button type="button" onClick={() => onZoom(1)} className="btn-ghost px-2 py-1 text-[11px]">
            Fit
          </button>
          <div className="hidden gap-1 sm:flex">
            {ZOOM_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => onZoom(step)}
                aria-pressed={Math.abs(zoom - step) < 0.01}
                className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums transition ${
                  Math.abs(zoom - step) < 0.01 ? 'bg-maroon-700 text-ivory-100' : 'text-ink-500 hover:text-maroon-700'
                }`}
              >
                {Math.round(step * 100)}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleCutline(!showCutline)}
            aria-pressed={showCutline}
            className={`btn-base px-3 py-1.5 text-[11px] ${showCutline ? 'btn-maroon' : 'btn-outline'}`}
          >
            Cut contour
          </button>
          <button
            type="button"
            onClick={() => onToggleGuides(!showGuides)}
            aria-pressed={showGuides}
            className={`btn-base px-3 py-1.5 text-[11px] ${showGuides ? 'btn-maroon' : 'btn-outline'}`}
          >
            Guides
          </button>
          {toolbar}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-ivory-300/80 bg-[repeating-conic-gradient(#f6efe0_0%_25%,#fdfaf3_0%_50%)] bg-[length:18px_18px] p-3 shadow-inner">
        <div className="mx-auto flex max-h-[62vh] items-center justify-center overflow-auto">
          <div
            style={{ width: `${Math.round(zoom * 100)}%`, maxWidth: zoom <= 1 ? '100%' : 'none' }}
            className="transition-[width] duration-200"
          >
            {failed ? (
              <p className="rounded-xl bg-white/80 p-6 text-center text-sm text-ink-500">The preview could not be displayed.</p>
            ) : (
              <div
                role="img"
                aria-label={`${project.name}: ${project.size.widthMm} × ${project.size.heightMm} mm paper-art topper preview`}
                className="[&>svg]:h-auto [&>svg]:w-full [&>svg]:rounded-xl [&>svg]:shadow-lg"
                // The markup is generated by our own builder from a typed scene
                // graph — no user string is ever interpolated into it. Text is
                // escaped by the renderer, and the sanitisation test asserts the
                // absence of script/foreignObject/remote references.
                dangerouslySetInnerHTML={{ __html: svg }}
                onError={() => setFailed(true)}
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
          <StatusPill tone="info">
            {project.size.widthMm} × {project.size.heightMm} mm
          </StatusPill>
          <StatusPill tone="info">{(project.size.widthMm / 25.4).toFixed(1)} in</StatusPill>
          <StatusPill tone="info">{project.paletteId}</StatusPill>
          {preflight?.summary.pixels ? (
            <StatusPill tone="info">
              {preflight.summary.pixels.widthPx} × {preflight.summary.pixels.heightPx} px @ {preflight.summary.pixels.ppi} PPI
            </StatusPill>
          ) : null}
          {floatWarnings.length ? <StatusPill tone="warn">{floatWarnings.length} text warning(s)</StatusPill> : null}
        </div>

        {floatWarnings.length ? (
          <ul className="mt-2 space-y-1 rounded-xl border border-haldi/40 bg-haldi-soft/60 p-2 text-[11px] text-gold-900">
            {floatWarnings.slice(0, 3).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
