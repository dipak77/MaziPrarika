/**
 * Cake Atelier Pro — local project storage (IndexedDB)
 *
 * Projects live in the browser: no account, no upload, no server round trip to
 * reopen yesterday's work. Three object stores:
 *
 *   projects — one record per design (the versioned DesignProject, wrapped with
 *              the local bookkeeping: created/updated/opened timestamps)
 *   exports  — export history, so "what did I send the printer?" has an answer
 *   meta     — small key/value state (last opened project, recents, favourites)
 *
 * A tiny hand-written wrapper keeps this dependency-free. All of it is
 * best-effort: if storage is unavailable (private mode, disabled cookies), the
 * functions resolve to empty results and the studio keeps working in memory.
 */

import type { DesignProject } from '@mazi/cake-atelier';

const DB_NAME = 'mazi-cake-atelier';
const DB_VERSION = 1;
export const PROJECT_STORE = 'projects';
export const EXPORT_STORE = 'exports';
export const META_STORE = 'meta';

export interface StoredProject {
  id: string;
  project: DesignProject;
  name: string;
  templateId: string;
  paletteId: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  /** Last time the studio opened it — drives "Recent". */
  openedAt: string;
}

export interface StoredExport {
  id: string;
  projectId: string;
  projectName: string;
  format: 'png' | 'svg' | 'pdf' | 'layers';
  fileName: string;
  byteSize: number;
  ppi: number;
  widthMm: number;
  heightMm: number;
  createdAt: string;
  /** Warnings the user acknowledged before exporting. */
  acknowledged: string[];
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

let handle: Promise<IDBDatabase | undefined> | undefined;

export function openCakeDb(): Promise<IDBDatabase | undefined> {
  if (!hasIndexedDb()) return Promise.resolve(undefined);
  handle ??= new Promise<IDBDatabase | undefined>((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        const store = db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('templateId', 'templateId');
      }
      if (!db.objectStoreNames.contains(EXPORT_STORE)) {
        const store = db.createObjectStore(EXPORT_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('projectId', 'projectId');
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(undefined);
    request.onblocked = () => resolve(undefined);
  });
  return handle;
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return openCakeDb().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const transaction = db.transaction(store, mode);
          const request = run(transaction.objectStore(store));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(undefined);
          transaction.onabort = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

export async function listProjects(): Promise<StoredProject[]> {
  const all = await tx<StoredProject[]>(PROJECT_STORE, 'readonly', (store) => store.getAll());
  return (all ?? []).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getProject(id: string): Promise<StoredProject | undefined> {
  return tx<StoredProject | undefined>(PROJECT_STORE, 'readonly', (store) => store.get(id));
}

export async function putProject(record: StoredProject): Promise<boolean> {
  const result = await tx(PROJECT_STORE, 'readwrite', (store) => store.put(record));
  return result !== undefined;
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await tx(PROJECT_STORE, 'readwrite', (store) => store.delete(id));
  return result !== undefined;
}

export async function listExports(limit = 50): Promise<StoredExport[]> {
  const all = await tx<StoredExport[]>(EXPORT_STORE, 'readonly', (store) => store.getAll());
  return (all ?? []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit);
}

export async function recordExport(record: StoredExport): Promise<void> {
  await tx(EXPORT_STORE, 'readwrite', (store) => store.put(record));
}

export async function readMeta<T = unknown>(key: string): Promise<T | undefined> {
  const row = await tx<{ key: string; value: T } | undefined>(META_STORE, 'readonly', (store) => store.get(key));
  return row?.value;
}

export async function writeMeta(key: string, value: unknown): Promise<void> {
  await tx(META_STORE, 'readwrite', (store) => store.put({ key, value }));
}

/** How much space the studio is using locally (best effort — may be undefined). */
export async function storageEstimate(): Promise<{ usage?: number; quota?: number }> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return {};
  try {
    return await navigator.storage.estimate();
  } catch {
    return {};
  }
}

export function storedProjectId(): string {
  return `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
