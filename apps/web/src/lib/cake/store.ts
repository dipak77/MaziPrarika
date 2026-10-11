/**
 * Cake Atelier Pro — studio state
 *
 * One store, one current project, one undo stack. The rules that keep it honest:
 *
 *   • every edit produces a *new* DesignProject (the model is immutable), so
 *     undo/redo is a pair of stacks rather than a diff engine;
 *   • a "transaction" is a burst of edits (dragging a slider, typing a name) —
 *     `commit()` pushes one undo entry for the whole burst;
 *   • saving writes to IndexedDB and clears the dirty flag; the dirty flag is
 *     derived from `updatedAt` so it can never disagree with the project itself;
 *   • nothing here ever reaches for the network. Export is an explicit action in
 *     the print studio, which posts to /api/cake/export.
 */

import { create } from 'zustand';

import {
  createProject,
  defaultContentFor,
  duplicateProject,
  isDirty,
  renameProject,
  requireTemplate,
  resetPalette,
  resetProject,
  resetText,
  switchTemplate,
  toggleStar,
  touch,
  withContent,
  withExportSettings,
  withOptional,
  withPalette,
  withSize,
  withTypography,
  type DesignProject,
  type PaletteId,
  type ProjectContent,
  type ProjectTypography,
  type ExportSettings,
} from '@mazi/cake-atelier';

import {
  deleteProject as dbDeleteProject,
  listExports,
  listProjects,
  putProject,
  readMeta,
  recordExport,
  writeMeta,
  type StoredExport,
  type StoredProject,
} from './db';

const HISTORY_LIMIT = 60;

export interface CakeStudioState {
  project: DesignProject;
  saved: DesignProject | undefined;
  past: DesignProject[];
  future: DesignProject[];
  projects: StoredProject[];
  exports: StoredExport[];
  unsavedBurst: boolean;
  lastSavedAt: string | undefined;
  storageWarning: string | undefined;
  status: string | undefined;

  /* lifecycle */
  hydrate: (project?: DesignProject) => Promise<void>;
  refreshLibrary: () => Promise<void>;
  newProject: (templateId: string, options?: { paletteId?: string; content?: Partial<ProjectContent> }) => void;
  openProject: (id: string) => Promise<void>;
  saveProject: (name?: string) => Promise<void>;
  saveAs: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateCurrent: () => Promise<void>;
  toggleStarCurrent: () => Promise<void>;
  importProject: (project: DesignProject) => void;
  exportProjectFile: () => void;

  /* edits */
  edit: (mutate: (project: DesignProject) => DesignProject) => void;
  commit: () => void;

  setContent: (patch: Partial<ProjectContent>) => void;
  setName: (name: string) => void;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setAge: (age: string) => void;
  setDate: (date: string) => void;
  setPalette: (paletteId: string) => void;
  setTokenOverride: (token: string, value: string | undefined) => void;
  clearTokenOverrides: () => void;
  setTypography: (patch: ProjectTypography) => void;
  toggleOptional: (id: string, value?: boolean) => void;
  setSize: (size: { presetId: string; widthMm: number; heightMm: number }) => void;
  setExportSettings: (patch: Partial<ExportSettings>) => void;
  changeTemplate: (templateId: string, options?: { keepContent?: boolean; keepPalette?: boolean }) => void;
  resetToTemplate: () => void;
  resetTextToTemplate: () => void;
  resetPaletteToTemplate: () => void;

  /* history */
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  /* export bookkeeping */
  noteExport: (record: StoredExport) => Promise<void>;
  setStatus: (status: string | undefined) => void;
}

function burstKey(project: DesignProject): string {
  return `${project.id}:${project.updatedAt}`;
}

const defaultProject = (): DesignProject => createProject({ now: new Date().toISOString() });

export const useCakeStudio = create<CakeStudioState>((set, get) => {
  /**
   * Apply an edit. Successive edits inside the same burst (same project id,
   * within `BURST_MS`) collapse into one undo entry.
   */
  let lastBurstAt = 0;
  let lastBurstKey = '';
  const BURST_MS = 700;

  const pushHistory = (previous: DesignProject, next: DesignProject): void => {
    const now = Date.now();
    const key = burstKey(next);
    const sameBurst = key === lastBurstKey && now - lastBurstAt < BURST_MS;
    lastBurstAt = now;
    lastBurstKey = key;
    set((state) => ({
      project: next,
      past: sameBurst ? state.past : [...state.past, previous].slice(-HISTORY_LIMIT),
      future: [],
      unsavedBurst: true,
    }));
  };

  const apply = (mutate: (project: DesignProject) => DesignProject): void => {
    const current = get().project;
    const next = mutate(current);
    if (next === current) return;
    pushHistory(current, next);
  };

  const persist = async (project: DesignProject, merged = true): Promise<boolean> => {
    const now = new Date().toISOString();
    const existing = get().projects.find((entry) => entry.id === project.id);
    const record: StoredProject = {
      id: project.id,
      project,
      name: project.name,
      templateId: project.templateId,
      paletteId: project.paletteId,
      starred: project.starred,
      createdAt: existing?.createdAt ?? project.createdAt,
      updatedAt: merged ? now : (existing?.updatedAt ?? now),
      openedAt: existing?.openedAt ?? now,
    };
    const ok = await putProject(record);
    if (!ok) {
      set({ storageWarning: 'Local storage is unavailable, so this design could not be saved on this device. Use “Download project file” to keep a copy.' });
      return false;
    }
    set((state) => ({
      saved: project,
      lastSavedAt: now,
      storageWarning: undefined,
      projects: [record, ...state.projects.filter((entry) => entry.id !== project.id)].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    }));
    return true;
  };

  return {
    project: defaultProject(),
    saved: undefined,
    past: [],
    future: [],
    projects: [],
    exports: [],
    unsavedBurst: false,
    lastSavedAt: undefined,
    storageWarning: undefined,
    status: undefined,

    async hydrate(project) {
      const [projects, exports, lastOpened] = await Promise.all([
        listProjects(),
        listExports(20),
        readMeta<string>('lastOpenedProjectId'),
      ]);
      const restored = project ?? projects.find((entry) => entry.id === lastOpened)?.project ?? projects[0]?.project;
      const active = restored ?? defaultProject();
      set((state) => ({
        ...state,
        project: active,
        projects,
        exports,
        saved: projects.some((entry) => entry.id === active.id) ? active : undefined,
        past: [],
        future: [],
      }));
    },

    async refreshLibrary() {
      const [projects, exports] = await Promise.all([listProjects(), listExports(20)]);
      set({ projects, exports });
    },

    newProject(templateId, options = {}) {
      const project = createProject({
        templateId,
        now: new Date().toISOString(),
        ...(options.paletteId ? { paletteId: options.paletteId } : {}),
        ...(options.content ? { content: options.content } : {}),
      });
      set({ project, saved: undefined, past: [], future: [], status: `New ${requireTemplate(templateId).name} design.` });
    },

    async openProject(id) {
      const record = get().projects.find((entry) => entry.id === id);
      if (!record) {
        set({ status: 'That design is not in this browser any more.' });
        return;
      }
      const opened: StoredProject = { ...record, openedAt: new Date().toISOString() };
      await putProject(opened);
      await writeMeta('lastOpenedProjectId', id);
      set((state) => ({
        project: record.project,
        saved: record.project,
        past: [],
        future: [],
        status: `Opened “${record.name}”.`,
        projects: [opened, ...state.projects.filter((entry) => entry.id !== id)],
      }));
    },

    async saveProject(name) {
      const project = name ? renameProject(get().project, name) : get().project;
      const ok = await persist(project);
      if (ok) {
        await writeMeta('lastOpenedProjectId', project.id);
        set({ project, status: `Saved “${project.name}”.` });
      }
    },

    async saveAs(name) {
      const copy = { ...duplicateProject(get().project), name: name || `${get().project.name} (copy)` };
      const ok = await persist(copy);
      if (ok) set({ project: copy, status: `Saved a copy as “${copy.name}”.` });
    },

    async deleteProject(id) {
      const record = get().projects.find((entry) => entry.id === id);
      const ok = await dbDeleteProject(id);
      if (!ok) return;
      set((state) => ({
        projects: state.projects.filter((entry) => entry.id !== id),
        status: record ? `Deleted “${record.name}”.` : 'Deleted.',
      }));
    },

    async duplicateCurrent() {
      const copy = duplicateProject(get().project);
      await persist(copy);
      set({ project: copy, status: `Duplicated as “${copy.name}”.` });
    },

    async toggleStarCurrent() {
      const next = toggleStar(get().project);
      await persist(next);
      set({ project: next, status: next.starred ? 'Added to favourites.' : 'Removed from favourites.' });
    },

    importProject(project) {
      set({ project, saved: undefined, past: [], future: [], status: `Imported “${project.name}”. Press Save to keep it here.` });
    },

    exportProjectFile() {
      const project = get().project;
      const payload = JSON.stringify({ kind: 'mazi-cake-project', version: 1, exportedAt: new Date().toISOString(), project }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${project.id}.cake.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      set({ status: 'Project file downloaded — keep it as a backup.' });
    },

    edit(mutate) {
      apply(mutate);
    },

    commit() {
      lastBurstKey = '';
      set({ unsavedBurst: false });
    },

    setContent(patch) {
      apply((project) => withContent(project, patch as Partial<ProjectContent>));
    },
    setName(name) {
      apply((project) => withContent(project, { name }));
    },
    setTitle(title) {
      apply((project) => withContent(project, { title }));
    },
    setSubtitle(subtitle) {
      apply((project) => withContent(project, { subtitle }));
    },
    setAge(age) {
      apply((project) => withContent(project, { age }));
    },
    setDate(date) {
      apply((project) => withContent(project, { date }));
    },

    setPalette(paletteId) {
      // Passing `undefined` for the overrides keeps any the user has already
      // dialled in; the model ignores an unknown palette id rather than
      // producing a half-coloured design.
      apply((project) => withPalette(project, paletteId as PaletteId, undefined));
    },

    setTokenOverride(token, value) {
      apply((project) => {
        const overrides = { ...project.tokenOverrides };
        if (value === undefined) delete (overrides as Record<string, string>)[token];
        else (overrides as Record<string, string>)[token] = value;
        return touch({ ...project, tokenOverrides: overrides });
      });
    },

    clearTokenOverrides() {
      apply((project) => touch({ ...project, tokenOverrides: {} }));
    },

    setTypography(patch) {
      apply((project) => withTypography(project, patch));
    },

    toggleOptional(id, value) {
      const current = get().project.optionals[id];
      apply((project) => withOptional(project, id, value ?? !current));
    },

    setSize(size) {
      apply((project) => withSize(project, size));
    },

    setExportSettings(patch) {
      apply((project) => withExportSettings(project, patch));
    },

    changeTemplate(templateId, options = {}) {
      // Switching template resets the optional-component flags to that
      // template's own defaults and keeps the words the user typed unless the
      // caller says otherwise — the same rule the project model documents.
      apply((project) => switchTemplate(project, requireTemplate(templateId), options));
    },

    resetToTemplate() {
      apply((project) => resetProject(project, requireTemplate(project.templateId)));
    },

    resetTextToTemplate() {
      apply((project) => resetText(project, requireTemplate(project.templateId)));
    },

    resetPaletteToTemplate() {
      apply((project) => resetPalette(project, requireTemplate(project.templateId)));
    },

    undo() {
      set((state) => {
        const previous = state.past[state.past.length - 1];
        if (!previous) return state;
        return { project: previous, past: state.past.slice(0, -1), future: [state.project, ...state.future].slice(0, HISTORY_LIMIT) };
      });
    },

    redo() {
      set((state) => {
        const next = state.future[0];
        if (!next) return state;
        return { project: next, past: [...state.past, state.project].slice(-HISTORY_LIMIT), future: state.future.slice(1) };
      });
    },

    canUndo() {
      return get().past.length > 0;
    },

    canRedo() {
      return get().future.length > 0;
    },

    async noteExport(record) {
      await recordExport(record);
      const exports = await listExports(20);
      set({ exports });
    },

    setStatus(status) {
      set({ status });
    },
  };
});

/** Selector helpers — kept out of components so the dirty rule lives in one place. */
export function selectDirty(state: CakeStudioState): boolean {
  return isDirty(state.saved, state.project);
}

export function selectDefaults(project: DesignProject): ProjectContent {
  return defaultContentFor(requireTemplate(project.templateId));
}
