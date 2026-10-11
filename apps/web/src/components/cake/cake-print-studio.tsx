'use client';

/**
 * Cake Atelier Pro — print studio.
 *
 * This is where the design becomes a print job. It shows the physical size, the
 * raster it will produce, the paper layers, the cut contours, the production
 * report and the preflight checklist — and it will not export while a blocking
 * problem stands. Warnings can be acknowledged, and the acknowledgement travels
 * with the file so the production report says who accepted what and when.
 *
 * Every check here comes from the server (`POST /api/cake/export` with
 * `dryRun: true`), so the numbers on screen are the numbers the file will have.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { CATEGORIES, PALETTES, type DesignProject, type ExportFormat } from '@mazi/cake-atelier';

import { useCakeStudio } from '@/lib/cake/store';
import { downloadBlob } from '@/lib/cake/preview';
import type { CakeCatalog } from '@/lib/cake/catalog';
import { Field, NumberInput, PanelSection, RangeInput, Segmented, SelectInput, StatusPill, TextInput, Toggle } from './field';

interface DryRunReport {
  fileName: string;
  format: ExportFormat;
  mime: string;
  files: string[];
  elapsedMs: number;
  preflight: {
    ok: boolean;
    canExportWithAcknowledgement: boolean;
    checks: { id: string; label: string; status: 'pass' | 'warn' | 'fail'; detail: string }[];
    errors: { id: string; title: string; detail: string; remedy?: string }[];
    warnings: { id: string; title: string; detail: string; remedy?: string }[];
    info: { id: string; title: string; detail: string }[];
    summary: {
      widthMm: number;
      heightMm: number;
      pixels?: { widthPx: number; heightPx: number; ppi: number };
      smallestTextMm: number;
      numberOfLayers: number;
      fonts: string[];
      usesFoil: boolean;
    };
  };
  report: {
    dimensions: { widthMm: number; heightMm: number; widthIn: number; heightIn: number };
    raster?: { widthPx: number; heightPx: number; ppi: number; megapixels: number };
    cardstock?: { material: string; label: string; color: string; nodeCount: number; cutAreaMm2: number }[];
    layers?: { count: number; items: { material: string; label: string; file: string; cutContours: number; scoreContours: number }[] };
    typography: { textMode: string; faces: string[]; outlined: boolean };
    notes: string[];
    generatedAt: string;
    acknowledged?: { acceptedWarnings: string[]; at: string };
    fileSize?: number;
  };
  reportText: string;
}

const FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: 'png', label: 'PNG', hint: 'Raster at the chosen PPI, ready for a home printer or a print shop.' },
  { value: 'svg', label: 'SVG', hint: 'Vector, physical millimetres — editable text or outlined, your choice.' },
  { value: 'pdf', label: 'PDF', hint: 'Vector document at the exact page size, with optional bleed and marks.' },
  { value: 'layers', label: 'Layered', hint: 'One file per paper layer + manifest + registration marks, in a ZIP.' },
];

export function CakePrintStudio({ catalog }: { catalog: CakeCatalog }) {
  const state = useCakeStudio();
  const project = state.project;
  const [report, setReport] = useState<DryRunReport | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [downloaded, setDownloaded] = useState<string | undefined>();
  const [ackTick, setAckTick] = useState(false);
  const [customW, setCustomW] = useState<string>('');
  const [customH, setCustomH] = useState<string>('');

  const template = useMemo(
    () => catalog.templates.find((entry) => entry.id === project.templateId) ?? catalog.templates[0]!,
    [catalog.templates, project.templateId],
  );
  const palette = PALETTES.find((entry) => entry.id === project.paletteId);

  useEffect(() => {
    void state.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Ask the server for the full preflight + production report. */
  const check = useCallback(
    async (options: { acknowledged?: string[] } = {}) => {
      setBusy(true);
      setError(undefined);
      try {
        const payload = {
          project,
          format: project.export.format,
          ppi: project.export.ppi,
          transparent: project.export.transparent,
          bleedMm: project.export.bleedMm,
          includeCutline: project.export.includeCutline,
          includeGuides: project.export.includeGuides,
          includeRegistration: project.export.includeRegistration,
          outlineText: project.export.outlineText,
          cutToleranceMm: project.export.cutToleranceMm,
          dryRun: true,
          ...(options.acknowledged
            ? { acknowledgement: { acceptedWarnings: options.acknowledged, at: new Date().toISOString() } }
            : {}),
        };
        const response = await fetch('/api/cake/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as DryRunReport | { error: string; issues?: string[] };
        if (!response.ok) {
          setReport(undefined);
          const detail = 'issues' in data && data.issues ? data.issues.join(' ') : '';
          setError(`${'error' in data ? data.error : 'The check failed.'} ${detail}`.trim());
          return;
        }
        setReport(data as DryRunReport);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'The check could not reach the server.');
      } finally {
        setBusy(false);
      }
    },
    [project],
  );

  useEffect(() => {
    // Debounced: the report follows the sliders without hammering the server.
    const timer = setTimeout(() => void check(), 400);
    return () => clearTimeout(timer);
  }, [check]);

  const exportNow = useCallback(async () => {
    if (!report) return;
    if (!report.preflight.ok && !report.preflight.canExportWithAcknowledgement) {
      setError('Fix the blocking problems below before exporting.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const acceptedWarnings = report.preflight.warnings.map((issue) => issue.id);
      const response = await fetch('/api/cake/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          format: project.export.format,
          ppi: project.export.ppi,
          transparent: project.export.transparent,
          bleedMm: project.export.bleedMm,
          includeCutline: project.export.includeCutline,
          includeGuides: project.export.includeGuides,
          includeRegistration: project.export.includeRegistration,
          outlineText: project.export.outlineText,
          cutToleranceMm: project.export.cutToleranceMm,
          ...(report.preflight.warnings.length
            ? { acknowledgement: { acceptedWarnings, at: new Date().toISOString() } }
            : {}),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string; issues?: { title: string; detail: string }[] };
        setError(
          [data.error ?? 'The export failed.', ...(data.issues ?? []).map((issue) => `${issue.title}: ${issue.detail}`)].join(' '),
        );
        return;
      }

      const blob = await response.blob();
      const fileName = response.headers.get('X-Cake-File-Name') ?? report.fileName;
      downloadBlob(blob, fileName);
      setDownloaded(fileName);
      const format = (response.headers.get('X-Cake-Format') ?? project.export.format) as ExportFormat;
      await state.noteExport({
        id: `exp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        projectId: project.id,
        projectName: project.name,
        format,
        fileName,
        byteSize: blob.size,
        ppi: project.export.ppi,
        widthMm: project.size.widthMm,
        heightMm: project.size.heightMm,
        createdAt: new Date().toISOString(),
        acknowledged: report.preflight.warnings.map((issue) => issue.id),
      });
      setAckTick((tick) => !tick);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'The export could not be completed.');
    } finally {
      setBusy(false);
    }
  }, [project, report, state]);

  const matchingSizes = catalog.sizes.filter((entry) => entry.aspect === template.aspect || entry.id === project.size.presetId);
  const blocking = Boolean(report && !report.preflight.ok);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ivory-300/80 bg-white/85 px-3 py-2 shadow-sm">
          <span className="text-sm font-semibold text-maroon-900">Print job</span>
          <StatusPill tone={blocking ? 'fail' : report?.preflight.warnings.length ? 'warn' : 'pass'}>
            {busy ? 'Checking…' : blocking ? 'Blocked' : report?.preflight.warnings.length ? 'Ready with warnings' : 'Ready'}
          </StatusPill>
          <span className="text-[11px] text-ink-400">
            {project.size.widthMm} × {project.size.heightMm} mm
            {report?.report.raster ? ` · ${report.report.raster.widthPx} × ${report.report.raster.heightPx} px @ ${report.report.raster.ppi} PPI` : ''}
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <Link href="/cake/editor" className="btn-outline px-3 py-1.5 text-[11px] no-underline">
              ← Back to editor
            </Link>
            <button type="button" className="btn-ghost px-3 py-1.5 text-[11px]" onClick={() => void check()} disabled={busy}>
              Re-check
            </button>
            <button
              type="button"
              className="btn-gold px-3 py-1.5 text-[11px]"
              onClick={() => void exportNow()}
              disabled={busy || !report || blocking}
            >
              {busy ? 'Working…' : `Download ${project.export.format.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* preflight checklist */}
        <PanelSection
          title="Preflight"
          description="Checked on the server against the file that will actually be produced."
          action={report ? <span className="text-[11px] text-ink-400">{report.elapsedMs} ms</span> : null}
        >
          {!report ? (
            <p className="text-[12px] text-ink-400">{busy ? 'Running the checklist…' : 'No report yet.'}</p>
          ) : (
            <ul className="space-y-2">
              {report.preflight.checks.map((entry) => (
                <li key={entry.id} className="flex items-start gap-2">
                  <StatusPill tone={entry.status === 'pass' ? 'pass' : entry.status === 'warn' ? 'warn' : 'fail'}>
                    {entry.status === 'pass' ? 'OK' : entry.status === 'warn' ? 'Note' : 'Blocked'}
                  </StatusPill>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium text-ink-700">{entry.label}</span>
                    <span className="block text-[11px] text-ink-400">{entry.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {report?.preflight.errors.map((issue) => (
            <p key={issue.id} className="rounded-xl border border-red-200 bg-red-50 p-2 text-[12px] text-red-800">
              <span className="font-semibold">{issue.title}.</span> {issue.detail}
              {issue.remedy ? <span className="block text-[11px] text-red-600">Fix: {issue.remedy}</span> : null}
            </p>
          ))}

          {report?.preflight.warnings.length ? (
            <div className="rounded-xl border border-haldi/40 bg-haldi-soft/50 p-2">
              <p className="text-[12px] font-semibold text-gold-900">
                {report.preflight.warnings.length} warning(s) — these will be recorded against the export
              </p>
              <ul className="mt-1 space-y-1 text-[11px] text-gold-900">
                {report.preflight.warnings.map((issue) => (
                  <li key={issue.id}>
                    <span className="font-semibold">{issue.title}:</span> {issue.detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-2 text-[12px] text-red-800">
              {error}
            </p>
          ) : null}
          {downloaded ? (
            <p className="rounded-xl border border-leaf-600/30 bg-leaf-600/10 p-2 text-[12px] text-leaf-700">
              Saved <span className="font-semibold">{downloaded}</span> to your downloads.
            </p>
          ) : null}
        </PanelSection>

        {/* layers + cardstock */}
        {report?.report.layers?.items.length ? (
          <PanelSection title="Paper layers" description="Cut in this order; each file carries its own contours.">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  <tr>
                    <th className="py-1">Layer</th>
                    <th className="py-1">Paper</th>
                    <th className="py-1">File</th>
                    <th className="py-1 text-right">Cuts</th>
                    <th className="py-1 text-right">Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {report.report.layers.items.map((layer) => (
                    <tr key={layer.material} className="border-t border-ivory-200">
                      <td className="py-1 font-medium text-ink-700">{layer.label}</td>
                      <td className="py-1">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
                            style={{ background: report.report.cardstock?.find((entry) => entry.material === layer.material)?.color ?? '#ccc' }}
                          />
                          {report.report.cardstock?.find((entry) => entry.material === layer.material)?.label ?? layer.material}
                        </span>
                      </td>
                      <td className="py-1 font-mono text-[11px] text-ink-500">{layer.file}</td>
                      <td className="py-1 text-right tabular-nums">{layer.cutContours}</td>
                      <td className="py-1 text-right tabular-nums">{layer.scoreContours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-ink-400">
              Magenta lines are cuts; dashed blue lines are scores (fold, do not cut). The ZIP also contains
              <span className="font-mono"> manifest.json</span>, <span className="font-mono">production-report.txt</span> and
              <span className="font-mono"> ASSEMBLY.txt</span>.
            </p>
          </PanelSection>
        ) : null}

        {report ? (
          <PanelSection
            title="Production report"
            description="Everything the print shop needs to know, also written into the package."
            action={
              <button
                type="button"
                className="btn-ghost px-2 py-1 text-[11px]"
                onClick={() => downloadBlob(new Blob([report.reportText], { type: 'text/plain' }), `${project.id}-report.txt`)}
              >
                Download .txt
              </button>
            }
          >
            <dl className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-3">
              <ReportItem label="Trim size" value={`${report.report.dimensions.widthMm} × ${report.report.dimensions.heightMm} mm`} />
              <ReportItem label="In inches" value={`${report.report.dimensions.widthIn.toFixed(2)} × ${report.report.dimensions.heightIn.toFixed(2)} in`} />
              <ReportItem label="Bleed" value={`${project.export.bleedMm} mm`} />
              {report.report.raster ? <ReportItem label="Raster" value={`${report.report.raster.megapixels} MP`} /> : null}
              <ReportItem label="Text" value={report.report.typography.textMode} />
              <ReportItem label="Fonts" value={report.report.typography.faces.join(', ') || 'outlined'} />
              <ReportItem label="Smallest text" value={`${report.preflight.summary.smallestTextMm} mm`} />
              <ReportItem label="Cut tolerance" value={`±${project.export.cutToleranceMm} mm`} />
              <ReportItem label="Simulated foil" value={report.preflight.summary.usesFoil ? 'yes — see note' : 'no'} />
            </dl>
            {report.report.notes.length ? (
              <ul className="space-y-1 rounded-xl bg-ivory-100 p-2 text-[11px] leading-snug text-ink-600">
                {report.report.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </PanelSection>
        ) : null}

        {state.exports.length ? (
          <PanelSection title="Export history" description="Kept locally so you always know what was sent to print.">
            <ul className="space-y-1 text-[12px]">
              {state.exports.slice(0, 8).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 border-t border-ivory-200 py-1 first:border-0">
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-[11px] text-ink-500">{entry.format.toUpperCase()}</span>{' '}
                    <span className="text-ink-700">{entry.fileName}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-400">
                    {(entry.byteSize / 1024).toFixed(0)} kB · {entry.createdAt.slice(5, 16).replace('T', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          </PanelSection>
        ) : null}
      </div>

      {/* ---------------------------------------------------- settings */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
        <PanelSection title="Output" description={`${template.name} · ${palette?.name ?? project.paletteId}`}>
          <Field label="Format">
            <Segmented
              label="Export format"
              value={project.export.format}
              onChange={(value) => state.setExportSettings({ format: value as ExportFormat })}
              options={FORMATS.map((entry) => ({ value: entry.value, label: entry.label, title: entry.hint }))}
            />
          </Field>
          <p className="text-[11px] text-ink-400">{FORMATS.find((entry) => entry.value === project.export.format)?.hint}</p>
          <RangeInput
            label="Raster resolution"
            value={project.export.ppi}
            min={72}
            max={600}
            step={6}
            format={(value) => `${value} PPI`}
            onChange={(value) => state.setExportSettings({ ppi: value })}
          />
          {report?.report.raster ? (
            <p className="text-[11px] text-ink-400">
              {report.report.raster.widthPx} × {report.report.raster.heightPx} px ({report.report.raster.megapixels} MP) at{' '}
              {project.size.widthMm} mm wide.
            </p>
          ) : null}
          <Toggle
            checked={project.export.transparent}
            onChange={(value) => state.setExportSettings({ transparent: value })}
            label="Transparent background"
            hint="PNG/SVG only — useful for overlaying the topper on a photo."
          />
          <Toggle
            checked={project.export.outlineText}
            onChange={(value) => state.setExportSettings({ outlineText: value })}
            label="Convert text to outlines"
            hint="Removes any font dependency in the file. Leave off for an SVG you plan to edit elsewhere."
          />
        </PanelSection>

        <PanelSection title="Print setup" description="Bleed, guides and cutting tolerances.">
          <RangeInput
            label="Bleed"
            value={project.export.bleedMm}
            min={0}
            max={10}
            step={0.5}
            format={(value) => `${value} mm`}
            onChange={(value) => state.setExportSettings({ bleedMm: value })}
          />
          <RangeInput
            label="Cut tolerance"
            value={project.export.cutToleranceMm}
            min={0}
            max={2}
            step={0.1}
            format={(value) => `±${value.toFixed(1)} mm`}
            onChange={(value) => state.setExportSettings({ cutToleranceMm: value })}
          />
          <Toggle checked={project.export.includeGuides} onChange={(value) => state.setExportSettings({ includeGuides: value })} label="Safe-area guide" />
          <Toggle checked={project.export.includeRegistration} onChange={(value) => state.setExportSettings({ includeRegistration: value })} label="Registration marks" hint="Adds corner crosses printers use to align layers." />
          <Toggle
            checked={project.export.includeCutline}
            onChange={(value) => state.setExportSettings({ includeCutline: value })}
            label="Draw the cut contour on the artwork"
            hint="On for paper-cutting by hand; off when sending to a cutting machine."
          />
        </PanelSection>

        <PanelSection title="Physical size" description={`${project.size.widthMm} × ${project.size.heightMm} mm`}>
          <Field label="Preset" hint={`Design aspect ${template.nominalMm.w} × ${template.nominalMm.h} mm`}>
            <SelectInput
              value={project.size.presetId}
              onChange={(value) => {
                const preset = catalog.sizes.find((entry) => entry.id === value);
                if (!preset) return;
                state.setSize({ presetId: preset.id, widthMm: preset.widthMm, heightMm: preset.heightMm });
              }}
              options={matchingSizes.map((entry) => ({ value: entry.id, label: `${entry.label} — ${entry.widthMm} × ${entry.heightMm} mm` }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Custom width" hint="mm">
              <TextInput value={customW} onChange={setCustomW} placeholder={String(project.size.widthMm)} />
            </Field>
            <Field label="Custom height" hint="mm">
              <TextInput value={customH} onChange={setCustomH} placeholder={String(project.size.heightMm)} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className="btn-outline px-3 py-1.5 text-[11px]"
              onClick={() => {
                const width = Number(customW);
                const height = Number(customH);
                if (!Number.isFinite(width) || !Number.isFinite(height)) {
                  setError('Enter both a width and a height in millimetres.');
                  return;
                }
                if (width < 25 || height < 25 || width > 600 || height > 600) {
                  setError('Sizes must be between 25 mm and 600 mm on each side.');
                  return;
                }
                state.setSize({ presetId: 'custom', widthMm: width, heightMm: height });
                setError(undefined);
              }}
            >
              Apply custom size
            </button>
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-[11px]"
              onClick={() => {
                const inches = Number(customW);
                if (!Number.isFinite(inches) || inches <= 0) {
                  setError('Enter the width in inches first, then press “Set from inches”.');
                  return;
                }
                const width = inches * 25.4;
                const ratio = project.size.heightMm / project.size.widthMm;
                state.setSize({ presetId: 'custom', widthMm: Math.round(width * 10) / 10, heightMm: Math.round(width * ratio * 10) / 10 });
                setError(undefined);
              }}
            >
              Set from inches
            </button>
          </div>
          <p className="text-[11px] text-ink-400">
            Change the preset, and the artwork scales with it — the composition keeps its proportions rather than being
            stretched.
          </p>
        </PanelSection>

        <PanelSection title="Job details" description="Shown in the production report and the file name.">
          <Field label="Project name" hint="Used in the download name.">
            <TextInput
              value={project.name}
              onChange={(value) => state.edit((current) => ({ ...current, name: value, updatedAt: new Date().toISOString() }))}
            />
          </Field>
          <Field label="Child's name" counter={`${project.content.name.length}/60`}>
            <TextInput value={project.content.name} onChange={(value) => state.setContent({ name: value })} maxLength={60} />
          </Field>
          <Field label="Design">
            <SelectInput
              value={project.templateId}
              onChange={(value) => state.changeTemplate(value, { keepContent: true })}
              options={CATEGORIES.flatMap((collection) =>
                catalog.templates
                  .filter((entry) => entry.category === collection.id)
                  .map((entry) => ({ value: entry.id, label: `${collection.index}.${collection.name} — ${entry.name}` })),
              )}
            />
          </Field>
          <Field label="Palette">
            <SelectInput
              value={project.paletteId}
              onChange={(value) => state.setPalette(value)}
              options={PALETTES.map((entry) => ({ value: entry.id, label: entry.name }))}
            />
          </Field>
          <p className="text-[11px] text-ink-400">
            {ackTick ? 'The next export will record the warnings you saw as acknowledged.' : 'Warnings are recorded with the file when you export.'}
          </p>
        </PanelSection>
      </aside>
    </div>
  );
}

function ReportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ivory-200 bg-white/70 px-2 py-1.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-maroon-800/60">{label}</dt>
      <dd className="mt-0.5 text-[12px] font-medium text-ink-700">{value}</dd>
    </div>
  );
}

/** Re-exported so the page can type the props without importing the store. */
export type { DesignProject };

/** Exported for the unit tests: the exact body the studio sends to the API. */
export function exportRequestFor(project: DesignProject, acknowledgement?: string[]): Record<string, unknown> {
  return {
    project,
    format: project.export.format,
    ppi: project.export.ppi,
    transparent: project.export.transparent,
    bleedMm: project.export.bleedMm,
    includeCutline: project.export.includeCutline,
    includeGuides: project.export.includeGuides,
    includeRegistration: project.export.includeRegistration,
    outlineText: project.export.outlineText,
    cutToleranceMm: project.export.cutToleranceMm,
    ...(acknowledgement ? { acknowledgement: { acceptedWarnings: acknowledgement, at: new Date().toISOString() } } : {}),
  };
}
