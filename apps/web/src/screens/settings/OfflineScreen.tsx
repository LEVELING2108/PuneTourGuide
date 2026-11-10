import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Themed } from '../../components/Themed';
import { mb, offlineApi, tilesAllowed, useOffline, type PackSummary, type SavedPack } from '../../features/offline';
import { toggleColors, usePalette } from '../../lib/palette';
import { useIsLoggedIn } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import { useTheme } from '../../stores/theme';
import OfflineView from '../../views/classic/Offline.view';
import DeccanOfflineView from '../../views/deccan/DeccanOffline.view';

const UNDO_MS = 5000;
const TONES = {
  classic: { city: '#1B2220', area: '#26303B', fort: '#4A3426' },
  deccan: { city: '#7A1F4E', area: '#0E5B5E', fort: '#A4462B' },
};
const kindOf = (id: string) => (id === 'old-pune' ? 'city' : id === 'shivajinagar' ? 'area' : 'fort');

const ago = (t: number) => {
  const days = Math.floor((Date.now() - t) / 86_400_000);
  return days <= 0 ? 'saved today' : days === 1 ? 'saved yesterday' : `saved ${days} days ago`;
};

/** Offline packs (TECH_DESIGN §9.9): area data in IndexedDB, map tiles in a named cache. */
export default function OfflineScreen() {
  const p = usePalette();
  const theme = useTheme();
  const loggedIn = useIsLoggedIn();
  const { autoDownloadPacks, set } = useSettingsStore();
  const { saved, loaded, progress, load, download, remove, restore } = useOffline();
  const packsQ = useQuery({ queryKey: ['offline-packs', loggedIn], queryFn: offlineApi.list, staleTime: 10 * 60_000 });
  const [pending, setPending] = useState<Record<string, SavedPack>>({});
  const timers = useRef<Record<string, number>>({});
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setStorage({ usage: e.usage ?? 0, quota: e.quota ?? 0 }), () => undefined);
  }, [saved]);

  // Leaving the screen commits any removal still waiting for Undo
  useEffect(
    () => () => {
      Object.values(timers.current).forEach((t) => window.clearTimeout(t));
      Object.keys(timers.current).forEach((id) => void remove(id));
    },
    [remove]
  );

  const tones = TONES[theme];
  const summaries = new Map((packsQ.data ?? []).map((s) => [s.id, s]));
  const withTiles = tilesAllowed();
  const sizeOf = (s: PackSummary) => (withTiles ? s.tileBytes : 0) + s.dataBytes;

  const shown = [...saved.filter((x) => !pending[x.id]), ...Object.values(pending)].sort((a, b) => b.savedAt - a.savedAt);
  const savedRows = shown.map((x) => {
    const gone = !!pending[x.id];
    const s = summaries.get(x.id);
    const warn = !!(s && s.inPlan.length && s.weakSignal);
    return {
      key: x.id,
      kept: !gone,
      gone,
      warn,
      name: x.name,
      tone: tones[kindOf(x.id)],
      meta: [mb(x.bytes), `${x.hospitals} hospitals`, x.tilesSaved ? null : 'no map tiles', ago(x.savedAt)].filter(Boolean).join(' · '),
      removeLabel: `Delete ${x.name} pack`,
      remove: () => {
        setPending((m) => ({ ...m, [x.id]: x }));
        timers.current[x.id] = window.setTimeout(() => {
          delete timers.current[x.id];
          void remove(x.id).then(() =>
            setPending((m) => {
              const n = { ...m };
              delete n[x.id];
              return n;
            })
          );
        }, UNDO_MS);
      },
      undo: () => {
        window.clearTimeout(timers.current[x.id]);
        delete timers.current[x.id];
        setPending((m) => {
          const n = { ...m };
          delete n[x.id];
          return n;
        });
        void restore(x);
      },
      goneText: warn ? `${x.name} removed · it's in your plan and has weak signal` : `${x.name} removed · ${mb(x.bytes)} freed`,
    };
  });

  const savedIds = new Set(saved.map((x) => x.id));
  const card = (s: PackSummary) => {
    const prog = progress[s.id];
    const busy = prog !== undefined;
    return {
      key: s.id,
      name: s.name,
      tone: tones[kindOf(s.id)],
      status: busy
        ? withTiles
          ? 'Downloading… map, hospitals, numbers'
          : 'Downloading… hospitals, numbers'
        : [mb(sizeOf(s)), s.inPlan.length ? `in your Day ${s.planDays.join(' & ')} plan` : `${s.hospitals} hospitals`].join(' · '),
      busy,
      btnLabel: busy ? 'Saving' : 'Download',
      btnBg: p.ink,
      btnFg: p.onInk,
      showBar: busy,
      prog: `${Math.round((prog ?? 0) * 100)}%`,
      downloadLabel: `Download ${s.name}`,
      download: () => {
        setError('');
        download(s).catch((err) => setError(err instanceof Error ? err.message : 'Download failed'));
      },
    };
  };
  const notSaved = (packsQ.data ?? []).filter((s) => !savedIds.has(s.id));
  const suggested = notSaved.filter((s) => s.inPlan.length);
  const others = notSaved.filter((s) => !s.inPlan.length);
  const auto = toggleColors(p, autoDownloadPacks);
  const used = storage?.usage ?? saved.reduce((n, x) => n + x.bytes, 0);
  const quota = storage?.quota ?? 0;

  const v = {
    usedText: `${mb(used)} used`,
    quotaText: quota ? `of ${quota >= 1024 ** 3 ? `${Math.round(quota / 1024 ** 3)} GB` : mb(quota)}` : '',
    usedPct: quota ? `${Math.min(100, Math.max(0.5, (used / quota) * 100)).toFixed(1)}%` : '0.5%',
    saved: savedRows,
    noneSaved: loaded && savedRows.length === 0,
    groups: [
      ...(suggested.length ? [{ key: 'suggested', title: 'SUGGESTED FOR YOUR TRIPS', items: suggested.map(card) }] : []),
      ...(others.length ? [{ key: 'others', title: suggested.length ? 'MORE AREAS' : 'AREAS AROUND PUNE', items: others.map(card) }] : []),
      ...(packsQ.isError && !error ? [{ key: 'offline', title: "YOU'RE OFFLINE · SAVED PACKS STILL WORK", items: [] }] : []),
      ...(error ? [{ key: 'err', title: error.toUpperCase(), items: [] }] : []),
    ],
    autoPressed: auto.pressed,
    autoTrack: auto.track,
    autoKnob: auto.knob,
    autoText: 'On Wi-Fi only',
    toggleAuto: () => set({ autoDownloadPacks: !autoDownloadPacks }),
  };
  return <Themed classic={OfflineView} deccan={DeccanOfflineView} v={v} />;
}
