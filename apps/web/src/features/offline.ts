import { create } from 'zustand';
import { api } from '../api/client';
import { metres, type LatLng } from '../lib/geo';

export type PackSummary = {
  id: string;
  name: string;
  nameMr: string;
  bbox: { south: number; west: number; north: number; east: number };
  minZoom: number;
  maxZoom: number;
  version: string;
  tileCount: number;
  tileBytes: number;
  dataBytes: number;
  places: number;
  hospitals: number;
  police: number;
  weakSignal: boolean;
  inPlan: string[];
  planDays: number[];
};

export type PackHelp = { name: string; category: string; emergency: boolean; phone: string | null; address: string | null; lat: number; lng: number };

export type PackBundle = Omit<PackSummary, 'tileCount' | 'tileBytes' | 'dataBytes' | 'places' | 'hospitals' | 'police' | 'weakSignal' | 'inPlan' | 'planDays'> & {
  generatedAt: string;
  numbers: { number: string; label: string }[];
  places: { id: number; name: string; nameMr: string | null; category: string; lat: number; lng: number; weakSignal: boolean; hospital: { name: string; km: number | null } | null }[];
  help: PackHelp[];
  tiles: [number, number, number][];
};

/** A pack saved on this phone. */
export type SavedPack = {
  id: string;
  name: string;
  version: string;
  savedAt: number;
  bytes: number;
  hospitals: number;
  tilesSaved: number;
  bundle: PackBundle;
};

export const offlineApi = {
  list: () => api<PackSummary[]>('/offline-packs'),
  bundle: (id: string) => api<PackBundle>(`/offline-packs/${id}`),
};

// ── IndexedDB (tiny wrapper; one store, key = pack id) ─────────────
const DB = 'pe-offline';
const STORE = 'packs';

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = run(d.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const packStore = {
  all: () => tx<SavedPack[]>('readonly', (s) => s.getAll() as IDBRequest<SavedPack[]>).catch(() => [] as SavedPack[]),
  put: (p: SavedPack) => tx('readwrite', (s) => s.put(p)),
  remove: (id: string) => tx('readwrite', (s) => s.delete(id)),
};

// ── Map tiles ────────────────────────────────────────────────────
const TILE_URL = (import.meta.env.VITE_MAP_TILE_URL as string | undefined) || '';
/**
 * Only providers that allow offline caching may be bulk-downloaded. The OSM public tile
 * server forbids it, so with the development default no tiles are saved (data still is).
 */
export const tilesAllowed = () => !!TILE_URL && import.meta.env.VITE_MAP_TILES_OFFLINE === 'true' && 'caches' in window;

const tileUrl = ([z, x, y]: [number, number, number]) => TILE_URL.replace('{s}', 'a').replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y)).replace('{r}', '');

async function saveTiles(id: string, tiles: [number, number, number][], onProgress: (done: number) => void) {
  const cache = await caches.open(`pack-${id}`);
  let done = 0;
  let next = 0;
  const worker = async () => {
    while (next < tiles.length) {
      const url = tileUrl(tiles[next++]);
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { mode: 'cors' });
          if (res.ok) await cache.put(url, res);
        }
      } catch {
        /* skip a failed tile; the pack is still useful */
      }
      onProgress(++done);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker)); // polite concurrency
  return done;
}

// ── State ────────────────────────────────────────────────────────
type OfflineState = {
  saved: SavedPack[];
  loaded: boolean;
  /** pack id → 0..1 while downloading */
  progress: Record<string, number>;
  load: () => Promise<void>;
  download: (pack: PackSummary) => Promise<void>;
  remove: (id: string) => Promise<void>;
  restore: (p: SavedPack) => Promise<void>;
};

export const useOffline = create<OfflineState>()((set, get) => ({
  saved: [],
  loaded: false,
  progress: {},
  load: async () => {
    const saved = await packStore.all();
    set({ saved: saved.sort((a, b) => b.savedAt - a.savedAt), loaded: true });
  },
  download: async (pack) => {
    if (get().progress[pack.id] !== undefined) return;
    set((s) => ({ progress: { ...s.progress, [pack.id]: 0.02 } }));
    try {
      const bundle = await offlineApi.bundle(pack.id);
      const dataBytes = new Blob([JSON.stringify(bundle)]).size;
      let tilesSaved = 0;
      if (tilesAllowed()) {
        tilesSaved = await saveTiles(pack.id, bundle.tiles, (done) =>
          set((s) => ({ progress: { ...s.progress, [pack.id]: 0.05 + 0.95 * (done / bundle.tiles.length) } }))
        );
      }
      const saved: SavedPack = {
        id: pack.id,
        name: pack.name,
        version: bundle.version,
        savedAt: Date.now(),
        bytes: dataBytes + (tilesSaved ? tilesSaved * (pack.tileBytes / Math.max(1, pack.tileCount)) : 0),
        hospitals: bundle.help.filter((h) => h.category === 'hospital').length,
        tilesSaved,
        bundle,
      };
      await packStore.put(saved);
      set((s) => ({ saved: [saved, ...s.saved.filter((x) => x.id !== pack.id)] }));
    } finally {
      set((s) => {
        const progress = { ...s.progress };
        delete progress[pack.id];
        return { progress };
      });
    }
  },
  remove: async (id) => {
    await packStore.remove(id);
    if ('caches' in window) await caches.delete(`pack-${id}`).catch(() => false);
    set((s) => ({ saved: s.saved.filter((x) => x.id !== id) }));
  },
  restore: async (p) => {
    await packStore.put(p);
    set((s) => ({ saved: [p, ...s.saved.filter((x) => x.id !== p.id)] }));
  },
}));

/** Help points from saved packs near a point: hospitals and police with no network at all. */
export async function offlineHelpNear(at: LatLng, maxKm = 20) {
  const packs = await packStore.all();
  const seen = new Set<string>();
  return packs
    .flatMap((p) => p.bundle.help)
    .filter((h) => {
      const k = `${h.name}|${h.lat.toFixed(4)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((h) => ({ ...h, km: Math.round((metres(at, h) / 1000) * 10) / 10 }))
    .filter((h) => h.km <= maxKm)
    .sort((a, b) => a.km - b.km);
}

export const mb = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`);

type NetInfo = { type?: string; saveData?: boolean };
const onWifi = () => {
  const c = (navigator as unknown as { connection?: NetInfo }).connection;
  return !!c && c.type === 'wifi' && !c.saveData;
};

/**
 * Auto-download for planned trips (TECH_DESIGN §9.9): packs covering places in your plan,
 * on Wi-Fi only. Where the connection type is unknown (most desktop browsers, iOS) it assumes
 * mobile data and does nothing. Runs once per app start.
 */
let autoRan = false;
export async function autoDownloadPacks(enabled: boolean, loggedIn: boolean) {
  if (autoRan || !enabled || !loggedIn || !onWifi()) return;
  autoRan = true;
  const st = useOffline.getState();
  if (!st.loaded) await st.load();
  const have = new Set(useOffline.getState().saved.map((p) => p.id));
  const list = await offlineApi.list().catch(() => [] as PackSummary[]);
  for (const p of list) if (p.inPlan.length && !have.has(p.id)) await useOffline.getState().download(p).catch(() => undefined);
}
