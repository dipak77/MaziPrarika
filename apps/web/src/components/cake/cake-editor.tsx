'use client';

/**
 * Cake Atelier Pro — the editor.
 *
 * Left: the design library. Middle: the live canvas. Right: the panels that
 * change the design (words, palette, typography, pieces, size) plus the project
 * actions and a validation summary.
 *
 * Two ideas hold this together:
 *   • the canvas is the artwork — it is built by the same engine as the export;
 *   • nothing is silently corrected. When a name cannot fit, the fit engine says
 *     so in the panel and on the canvas instead of shrinking it into illegibility
 *     or cutting it off.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import {
  CATEGORIES,
  PALETTES,
  SIMULATED_FOIL_NOTICE,
  checkPaletteForTemplate,
  parseProject,
  preflight as runPreflight,
  requireTemplate,
  resolveSize,
  type DesignProject,
} from '@mazi/cake-atelier';

import { useCakeStudio, selectDirty } from '@/lib/cake/store';
import { buildProjectScene } from '@/lib/cake/preview';
import { useDebounced } from '@/hooks/use-debounced';
import type { CakeCatalog, CakeTemplateSummary } from '@/lib/cake/catalog';
import { CakeCanvas } from './cake-canvas';
import { Field, NumberInput, PanelSection, RangeInput, Segmented, SelectInput, StatusPill, TextInput, Toggle } from './field';

const PROBLEM_TONE = { pass: 'pass', warn: 'warn', fail: 'fail' } as const;

export function CakeEditor({ catalog, initialTemplateId }: { catalog: CakeCatalog; initialTemplateId?: string }) {
  const state = useCakeStudio();
  const project = state.project;
  const dirty = selectDirty(state);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [showCutline, setShowCutline] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [importError, setImportError] = useState<string | undefined>();
  const [newName, setNewName] = useState<string>('');
  const hydrated = useRef(false);

  /* ---------------------------------------------------------------- boot */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    void state.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialTemplateId) return;
    if (project.templateId === initialTemplateId && project.content.name) return;
    state.newProject(initialTemplateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  const template = useMemo(
    () => catalog.templates.find((entry) => entry.id === project.templateId) ?? catalog.templates[0]!,
    [catalog.templates, project.templateId],
  );

  const size = useMemo(
    () => resolveSize({ presetId: project.size.presetId, widthMm: project.size.widthMm, heightMm: project.size.heightMm }),
    [project.size.presetId, project.size.widthMm, project.size.heightMm],
  );

  const palette = useMemo(() => PALETTES.find((entry) => entry.id === project.paletteId) ?? PALETTES[0]!, [project.paletteId]);
  const paletteCheck = useMemo(
    () => checkPaletteForTemplate(project.paletteId, template.paletteIds),
    [project.paletteId, template.paletteIds],
  );

  /**
   * The project handed to the expensive derivations. Inputs are controlled by the
   * store (so typing never lags) while the scene rebuild waits a beat — the same
   * project, just not re-rendered on every keystroke.
   */
  const settledProject = useDebounced(project, 160);
  const preview = useMemo(() => buildProjectScene(settledProject, {}), [settledProject]);
  /* ------------------------------------------------------- local preflight */
  // Built from the same scene the canvas draws, so the numbers here and the
  // artwork on screen can never disagree. The print studio repeats every check
  // on the server, where the glyph geometry is authoritative.
  const localPreflight = useMemo(() => {
    if ('error' in preview) return undefined;
    const built = preview;
    if ('error' in preview) return undefined;
    return runPreflight({
      scene: built.scene,
      template: requireTemplate(project.templateId),
      size,
      layouts: built.layouts,
      format: 'png',
      ppi: project.export.ppi,
      bleedMm: project.export.bleedMm,
      includeBleed: project.export.bleedMm > 0,
      transparent: project.export.transparent,
      outlineText: project.export.outlineText,
      declaredMaterials: template.materials.map((material) => material.id),
    });
    // `template` is intentionally part of the dependency list: the materials and
    // optional components it declares feed the preflight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, size, template]);

  /* ------------------------------------------------------------- filters */
  const visibleTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.templates.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!term) return true;
      return `${entry.name} ${entry.description} ${entry.id} ${entry.categoryName}`.toLowerCase().includes(term);
    });
  }, [catalog.templates, category, search]);

  /* --------------------------------------------------------- shortcuts */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        state.undo();
        return;
      }
      if (meta && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
        event.preventDefault();
        state.redo();
        return;
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void state.saveProject();
        return;
      }
      if (meta && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        window.location.href = '/cake/print';
        return;
      }
      if (!typing && !meta && event.key === '?') setHelpOpen((open) => !open);
      if (event.key === 'Escape') setHelpOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state]);

  const matchingSizes = catalog.sizes.filter((entry) => entry.aspect === template.aspect || entry.id === project.size.presetId);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,22rem)]">
      {/* ------------------------------------------------------ library */}
      <aside className="space-y-3 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
        <PanelSection title="Design library" description={`${catalog.totals.templates} designs · ${catalog.totals.collections} collections`}>
          <TextInput value={search} onChange={setSearch} placeholder="Search crowns, whales, dinos…" />
          <SelectInput
            value={category}
            onChange={setCategory}
            options={[{ value: 'all', label: `All collections (${catalog.templates.length})` }, ...CATEGORIES.map((entry) => ({ value: entry.id as string, label: `${entry.index}. ${entry.name}` }))]}
          />
          <p className="text-[11px] text-ink-400">
            {visibleTemplates.length} design{visibleTemplates.length === 1 ? '' : 's'} shown
          </p>
          <ul className="space-y-1.5">
            {visibleTemplates.map((entry) => (
              <li key={entry.id}>
                <TemplateButton
                  template={entry}
                  active={entry.id === project.templateId}
                  onPick={() => {
                    state.changeTemplate(entry.id, { keepContent: true, keepPalette: false });
                    setCategory(entry.category);
                  }}
                />
              </li>
            ))}
          </ul>
        </PanelSection>
      </aside>

      {/* ------------------------------------------------------- canvas */}
      <main className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ivory-300/80 bg-white/80 px-3 py-2 shadow-sm">
          <TextInput
            id="cake-project-name"
            value={project.name}
            onChange={(value) => state.edit((current) => ({ ...current, name: value, updatedAt: new Date().toISOString() }))}
            className="max-w-xs"
          />
          {dirty ? <StatusPill tone="warn">Unsaved changes</StatusPill> : <StatusPill tone="pass">Saved</StatusPill>}
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button type="button" className="btn-outline px-3 py-1.5 text-[11px]" onClick={state.undo} disabled={!state.past.length}>
              Undo
            </button>
            <button type="button" className="btn-outline px-3 py-1.5 text-[11px]" onClick={state.redo} disabled={!state.future.length}>
              Redo
            </button>
            <button type="button" className="btn-maroon px-3 py-1.5 text-[11px]" onClick={() => void state.saveProject()}>
              Save
            </button>
            <button type="button" className="btn-outline px-3 py-1.5 text-[11px]" onClick={() => setHelpOpen(true)} aria-haspopup="dialog">
              Shortcuts
            </button>
          </div>
        </div>

        <CakeCanvas
          project={settledProject}
          preflight={localPreflight}
          showCutline={showCutline}
          onToggleCutline={setShowCutline}
          showGuides={showGuides}
          onToggleGuides={setShowGuides}
          zoom={zoom}
          onZoom={setZoom}
          toolbar={
            <Link href="/cake/print" className="btn-gold px-3 py-1.5 text-[11px] no-underline">
              Print &amp; export →
            </Link>
          }
        />

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Smallest text" value={localPreflight ? `${localPreflight.summary.smallestTextMm} mm` : '—'} tone={localPreflight && localPreflight.summary.smallestTextMm < 3.2 ? 'warn' : 'pass'} />
          <Metric label="Paper layers" value={`${template.materials.length}`} tone="info" />
          <Metric label="Colour blockers" value={`${localPreflight?.errors.length ?? 0}`} tone={localPreflight?.errors.length ? 'fail' : 'pass'} />
          <Metric label="Warnings" value={`${localPreflight?.warnings.length ?? 0}`} tone={localPreflight?.warnings.length ? 'warn' : 'pass'} />
        </div>

        {localPreflight?.errors.length ? (
          <ul className="space-y-2 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-800">
            {localPreflight.errors.map((issue) => (
              <li key={issue.id}>
                <p className="font-semibold">{issue.title}</p>
                <p className="text-[12px] text-red-700">{issue.detail}</p>
                {issue.remedy ? <p className="text-[11px] text-red-600">Fix: {issue.remedy}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {localPreflight?.warnings.length ? (
          <ul className="space-y-1 rounded-2xl border border-haldi/40 bg-haldi-soft/50 p-3 text-[12px] text-gold-900">
            {localPreflight.warnings.slice(0, 4).map((issue) => (
              <li key={issue.id}>
                <span className="font-semibold">{issue.title}:</span> {issue.detail}
              </li>
            ))}
          </ul>
        ) : null}
      </main>

      {/* ------------------------------------------------------- panels */}
      <aside className="space-y-3 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
        <PanelSection title="Words" description="The name, title and details printed on the topper.">
          <Field label="Child's name" counter={`${project.content.name.length}/60`} hint="Long names wrap onto a second line; the design never moves.">
            <TextInput id="cake-name" value={project.content.name} onChange={(value) => setField(state, 'name', value)} maxLength={60} />
          </Field>
          {localPreflight ? <FitNote project={settledProject} /> : null}
          <Field label="Title" counter={`${project.content.title.length}/48`}>
            <TextInput id="cake-title" value={project.content.title} onChange={(value) => setField(state, 'title', value)} maxLength={48} />
          </Field>
          <Field label="Subtitle" counter={`${project.content.subtitle.length}/80`}>
            <TextInput id="cake-subtitle" value={project.content.subtitle} onChange={(value) => setField(state, 'subtitle', value)} maxLength={80} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" counter={`${project.content.age.length}/12`}>
              <TextInput id="cake-age" value={project.content.age} onChange={(value) => setField(state, 'age', value)} maxLength={12} />
            </Field>
            <Field label="Date" counter={`${project.content.date.length}/28`}>
              <TextInput id="cake-date" value={project.content.date} onChange={(value) => setField(state, 'date', value)} maxLength={28} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="btn-ghost px-2 py-1 text-[11px]" onClick={state.resetTextToTemplate}>
              Reset words to template
            </button>
            {['Aarav', 'Saanvi', 'Meher', 'अथर्व', 'Vihaan', 'Anaya'].map((sample) => (
              <button
                key={sample}
                type="button"
                className="rounded-full border border-ivory-300 px-2 py-0.5 text-[11px] text-ink-500 transition hover:border-gold-500 hover:text-maroon-800"
                onClick={() => setField(state, 'name', sample)}
              >
                {sample}
              </button>
            ))}
          </div>
        </PanelSection>

        <PanelSection
          title="Palette"
          description={`${palette.name}${paletteCheck.ok ? '' : ' — not a documented pairing for this design'}`}
          action={
            <button type="button" className="btn-ghost px-2 py-1 text-[11px]" onClick={state.resetPaletteToTemplate}>
              Reset
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-1.5">
            {PALETTES.map((entry) => {
              const active = entry.id === project.paletteId;
              const compatible = checkPaletteForTemplate(entry.id, template.paletteIds).ok;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => state.setPalette(entry.id)}
                  aria-pressed={active}
                  title={entry.blurb}
                  className={`flex items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                    active ? 'border-maroon-700 bg-maroon-700/5 shadow-sm' : 'border-ivory-300 hover:border-gold-500'
                  }`}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-md ring-1 ring-black/5">
                    {[entry.tokens.primary, entry.tokens.secondary, entry.tokens.accent, entry.tokens.background].map((color, index) => (
                      <span key={`${entry.id}-${index}`} className="block h-5 w-2.5" style={{ background: color }} />
                    ))}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold text-ink-800">{entry.name}</span>
                    <span className="block truncate text-[10px] text-ink-400">
                      {entry.mood}
                      {compatible ? '' : ' · off-palette'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {paletteCheck.reason ? (
            <p className="rounded-xl bg-ivory-100 p-2 text-[11px] leading-snug text-ink-500">{paletteCheck.reason}</p>
          ) : null}
          <details className="rounded-xl border border-ivory-300 p-2">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.14em] text-maroon-800/70">
              Fine-tune colours
            </summary>
            <div className="mt-2 space-y-2">
              {(['primary', 'secondary', 'accent', 'background', 'nameFill', 'titleFill'] as const).map((token) => {
                const value = (project.tokenOverrides as Record<string, string | undefined>)[token];
                return (
                  <div key={token} className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={`${token} colour`}
                      value={value ?? (palette.tokens as unknown as Record<string, string>)[token] ?? '#000000'}
                      onChange={(event) => state.setTokenOverride(token, event.target.value)}
                      className="h-7 w-10 cursor-pointer rounded border border-ivory-300 bg-white"
                    />
                    <span className="flex-1 text-[11px] text-ink-600">{token}</span>
                    {value ? (
                      <button type="button" className="text-[11px] text-maroon-700 underline" onClick={() => state.setTokenOverride(token, undefined)}>
                        clear
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </details>
          <p className="text-[10px] leading-snug text-ink-400">{SIMULATED_FOIL_NOTICE}</p>
        </PanelSection>

        <PanelSection title="Typography" description="Fonts come from the bundled, licensed families only.">
          <Field label="Name font">
            <SelectInput
              value={project.typography.family?.name ?? template.fonts.name[0] ?? 'baloo2'}
              onChange={(value) => state.setTypography({ family: { ...project.typography.family, name: value } })}
              options={template.fonts.name.map((family) => ({ value: family, label: familyLabel(family) }))}
            />
          </Field>
          <Field label="Title font">
            <SelectInput
              value={project.typography.family?.title ?? template.fonts.title[0] ?? 'poppins'}
              onChange={(value) => state.setTypography({ family: { ...project.typography.family, title: value } })}
              options={template.fonts.title.map((family) => ({ value: family, label: familyLabel(family) }))}
            />
          </Field>
          <RangeInput
            label="Name size"
            value={project.typography.nameSizePt ?? 0}
            min={0}
            max={72}
            step={0.5}
            format={(value) => (value === 0 ? 'auto (fit engine)' : `${value} pt`)}
            onChange={(value) => state.setTypography({ ...project.typography, nameSizePt: value === 0 ? undefined : value })}
          />
          <RangeInput
            label="Title size"
            value={project.typography.titleSizePt ?? 0}
            min={0}
            max={36}
            step={0.5}
            format={(value) => (value === 0 ? 'auto' : `${value} pt`)}
            onChange={(value) => state.setTypography({ ...project.typography, titleSizePt: value === 0 ? undefined : value })}
          />
          <RangeInput
            label="Letter spacing"
            value={project.typography.nameTracking ?? 0}
            min={-0.05}
            max={0.2}
            step={0.005}
            format={(value) => (value === 0 ? 'template default' : value.toFixed(3))}
            onChange={(value) => state.setTypography({ ...project.typography, nameTracking: value === 0 ? undefined : value })}
          />
          <Field label="Weight">
            <Segmented
              label="Name weight"
              size="sm"
              value={String(project.typography.weight ?? 0)}
              onChange={(value) => state.setTypography({ ...project.typography, weight: value === '0' ? undefined : Number(value) })}
              options={[
                { value: '0', label: 'Auto' },
                { value: '400', label: 'Regular' },
                { value: '600', label: 'Semi' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Black' },
              ]}
            />
          </Field>
        </PanelSection>

        <PanelSection title="Pieces" description="Switch parts of the artwork on and off. The composition stays put.">
          {template.optionals.map((option) => (
            <Toggle
              key={option.id}
              label={option.label}
              hint={option.default ? 'On in this design by default' : 'Off in this design by default'}
              checked={project.optionals[option.id] ?? option.default}
              onChange={(value) => state.toggleOptional(option.id, value)}
            />
          ))}
        </PanelSection>

        <PanelSection title="Size" description="Physical size of the finished piece.">
          <Field label="Preset" hint={size.warnings.length ? size.warnings.join(' ') : `Aspect ${size.aspect}`}>
            <SelectInput
              value={project.size.presetId}
              onChange={(value) => {
                const preset = catalog.sizes.find((entry) => entry.id === value);
                if (!preset) return;
                state.setSize({ presetId: preset.id, widthMm: preset.widthMm, heightMm: preset.heightMm });
              }}
              options={matchingSizes.map((entry) => ({
                value: entry.id,
                label: `${entry.label} — ${entry.widthMm} × ${entry.heightMm} mm`,
              }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Width" hint="mm">
              <NumberInput
                value={round(project.size.widthMm)}
                min={25}
                max={600}
                step={0.5}
                onChange={(value) =>
                  state.setSize({ presetId: 'custom', widthMm: value, heightMm: round(project.size.heightMm) })
                }
              />
            </Field>
            <Field label="Height" hint="mm">
              <NumberInput
                value={round(project.size.heightMm)}
                min={25}
                max={600}
                step={0.5}
                onChange={(value) => state.setSize({ presetId: 'custom', widthMm: round(project.size.widthMm), heightMm: value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400">Scale to:</span>
            {[4, 5, 6, 8, 10, 12].map((inches) => (
              <button
                key={inches}
                type="button"
                className="rounded-full border border-ivory-300 px-2 py-0.5 text-[11px] text-ink-600 transition hover:border-gold-500 hover:text-maroon-800"
                onClick={() => {
                  const target = inches * 25.4;
                  const ratio = project.size.heightMm / project.size.widthMm;
                  state.setSize({ presetId: 'custom', widthMm: round(target), heightMm: round(target * ratio) });
                }}
              >
                {inches}&quot;
              </button>
            ))}
            <button type="button" className="btn-ghost px-2 py-1 text-[11px]" onClick={state.resetToTemplate}>
              Reset design
            </button>
          </div>
        </PanelSection>

        <PanelSection title="Project" description="Everything is stored in this browser. Nothing is uploaded.">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="btn-maroon px-3 py-1.5 text-[11px]" onClick={() => void state.saveProject()}>
              Save
            </button>
            <button
              type="button"
              className="btn-outline px-3 py-1.5 text-[11px]"
              onClick={() => {
                const name = newName.trim() || `${project.name} (copy)`;
                void state.saveAs(name);
              }}
            >
              Save a copy
            </button>
            <button type="button" className="btn-outline px-3 py-1.5 text-[11px]" onClick={() => void state.duplicateCurrent()}>
              Duplicate
            </button>
            <button type="button" className="btn-outline px-3 py-1.5 text-[11px]" onClick={() => void state.toggleStarCurrent()}>
              {project.starred ? '★ Favourite' : '☆ Favourite'}
            </button>
            <button
              type="button"
              className="btn-outline px-3 py-1.5 text-[11px]"
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm('Delete this saved design? The editor keeps the current copy until you reload.')) {
                  void state.deleteProject(project.id);
                }
              }}
            >
              Delete
            </button>
          </div>
          <TextInput value={newName} onChange={setNewName} placeholder="Name for the copy…" />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="btn-ghost px-2 py-1 text-[11px]" onClick={state.exportProjectFile}>
              Download project file
            </button>
            <label className="btn-ghost cursor-pointer px-2 py-1 text-[11px]">
              Import project file
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (!file) return;
                  if (file.size > 512 * 1024) {
                    setImportError('That file is larger than 512 kB — it is probably not a Cake Atelier project.');
                    return;
                  }
                  try {
                    const text = await file.text();
                    const parsed = JSON.parse(text) as { project?: unknown; kind?: string };
                    const result = parseProject(parsed.project ?? parsed);
                    if (!result.ok) {
                      setImportError(result.errors.join(' '));
                      return;
                    }
                    setImportError(undefined);
                    state.importProject(result.project);
                  } catch (error) {
                    setImportError(error instanceof Error ? error.message : 'That file could not be read.');
                  }
                }}
              />
            </label>
            {importError ? (
              <p role="alert" className="w-full text-[11px] text-red-700">
                {importError}
              </p>
            ) : null}
          </div>
          <ul className="space-y-1 text-[11px] text-ink-500">
            {state.projects.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2">
                <button type="button" className="truncate text-left hover:text-maroon-800" onClick={() => void state.openProject(entry.id)}>
                  {entry.starred ? '★ ' : ''}
                  {entry.name}
                </button>
                <span className="shrink-0 tabular-nums text-ink-400">{entry.updatedAt.slice(5, 16).replace('T', ' ')}</span>
              </li>
            ))}
          </ul>
          {state.storageWarning ? <p className="text-[11px] text-red-700">{state.storageWarning}</p> : null}
          {state.status ? <p className="text-[11px] text-leaf-700">{state.status}</p> : null}
        </PanelSection>

        {localPreflight ? (
          <PanelSection title="Validation" description="Same checks the print studio runs before it lets you export.">
            <ul className="space-y-1.5">
              {localPreflight.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2">
                  <StatusPill tone={PROBLEM_TONE[check.status === 'pass' ? 'pass' : check.status === 'warn' ? 'warn' : 'fail']}>
                    {check.status === 'pass' ? 'OK' : check.status === 'warn' ? 'Check' : 'Blocked'}
                  </StatusPill>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium text-ink-700">{check.label}</span>
                    <span className="block text-[11px] text-ink-400">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </PanelSection>
        ) : null}
      </aside>

      {helpOpen ? <ShortcutDialog onClose={() => setHelpOpen(false)} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function setField(state: ReturnType<typeof useCakeStudio.getState>, field: 'name' | 'title' | 'subtitle' | 'age' | 'date', value: string): void {
  state.setContent({ [field]: value });
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function familyLabel(id: string): string {
  const labels: Record<string, string> = {
    baloo2: 'Baloo 2 (rounded, playful)',
    'playfair-display': 'Playfair Display (royal serif)',
    poppins: 'Poppins (geometric sans)',
    quicksand: 'Quicksand (soft round)',
    'great-vibes': 'Great Vibes (script)',
    'bebas-neue': 'Bebas Neue (condensed caps)',
    'noto-sans-devanagari': 'Noto Sans Devanagari (Marathi/Hindi)',
  };
  return labels[id] ?? id;
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'pass' | 'warn' | 'fail' | 'info' }) {
  return (
    <div className="rounded-2xl border border-ivory-300/80 bg-white/85 px-3 py-2 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-maroon-800/60">{label}</p>
      <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
        {value}
        <StatusPill tone={tone}>{tone === 'fail' ? 'fix' : tone === 'warn' ? 'note' : tone === 'info' ? 'info' : 'ok'}</StatusPill>
      </p>
    </div>
  );
}

function TemplateButton({ template, active, onPick }: { template: CakeTemplateSummary; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`w-full rounded-xl border px-2.5 py-2 text-left transition ${
        active ? 'border-maroon-700 bg-maroon-700/5 shadow-sm' : 'border-ivory-300 bg-white hover:border-gold-500'
      }`}
    >
      <span className="block truncate text-[12px] font-semibold text-ink-800">{template.name}</span>
      <span className="block truncate text-[10px] text-ink-400">
        {template.categoryIndex}. {template.categoryName} · {template.materials.length} layer(s)
      </span>
    </button>
  );
}

function FitNote({ project }: { project: DesignProject }) {
  const preview = buildProjectScene(project, {});
  if ('error' in preview) return null;
  const layout = preview.layouts.name;
  if (!layout) return null;
  const tone = layout.overflow ? 'fail' : layout.status === 'fits' ? 'pass' : 'warn';
  return (
    <p className="flex items-center gap-2 text-[11px] text-ink-500">
      <StatusPill tone={tone}>{layout.status.replace(/-/g, ' ')}</StatusPill>
      {layout.lines.length} line(s) · {layout.sizeMm.toFixed(1)} mm cap height · face {layout.faceId}
    </p>
  );
}

function ShortcutDialog({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['Ctrl/⌘ + Z', 'Undo the last change'],
    ['Ctrl/⌘ + Shift + Z', 'Redo'],
    ['Ctrl/⌘ + S', 'Save this design'],
    ['Ctrl/⌘ + P', 'Open the print studio'],
    ['?', 'Show or hide this list'],
    ['Esc', 'Close this dialog'],
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-ivory-300 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold text-maroon-900">Keyboard shortcuts</h2>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-1 text-sm" aria-label="Close">
            ✕
          </button>
        </div>
        <dl className="mt-3 space-y-2">
          {rows.map(([keys, description]) => (
            <div key={keys} className="flex items-center justify-between gap-3">
              <dt className="rounded-lg border border-ivory-300 bg-ivory-100 px-2 py-0.5 font-mono text-[11px] text-ink-700">{keys}</dt>
              <dd className="text-[12px] text-ink-500">{description}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onClose} className="btn-maroon mt-4 w-full px-4 py-2 text-sm">
          Close
        </button>
      </div>
    </div>
  );
}

