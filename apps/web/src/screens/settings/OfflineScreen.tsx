import { useEffect, useRef, useState } from 'react';
import { Themed } from '../../components/Themed';
import { toggleColors, usePalette } from '../../lib/palette';
import { useSettingsStore } from '../../stores/settings';
import OfflineView from '../../views/classic/Offline.view';
import DeccanOfflineView from '../../views/deccan/DeccanOffline.view';

export default function OfflineScreen() {
  const p = usePalette();
  const { autoDownloadPacks, set } = useSettingsStore();
  const [dl, setDl] = useState<'idle' | 'loading' | 'done'>('idle');
  const [prog, setProg] = useState(0);
  const [oldGone, setOldGone] = useState(false);
  const [sinGone, setSinGone] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const done = dl === 'done';
  const used = 48 - (oldGone ? 18 : 0) - (sinGone ? 30 : 0) + (done ? 26 : 0);
  const auto = toggleColors(p, autoDownloadPacks);

  const v = {
    usedText: used + ' MB used',
    usedPct: Math.max(0.5, (used / 2048) * 100 * 1.6).toFixed(1) + '%',
    keepOld: !oldGone,
    oldGone,
    keepSin: !sinGone,
    sinGone,
    removeOld: () => setOldGone(true),
    undoOld: () => setOldGone(false),
    removeSin: () => setSinGone(true),
    undoSin: () => setSinGone(false),
    rajStatus: dl === 'idle' ? '26 MB · in your Day 2 ideas' : dl === 'loading' ? 'Downloading… map, hospitals, numbers' : 'Saved · ready offline',
    btnLabel: dl === 'idle' ? 'Download' : dl === 'loading' ? 'Saving' : 'Saved',
    btnBg: done ? p.softBg : p.ink,
    btnFg: done ? p.primary : p.onInk,
    showBar: dl === 'loading',
    prog: prog + '%',
    download: () => {
      if (dl !== 'idle') return;
      setDl('loading');
      setProg(0);
      timers.current.push(
        window.setTimeout(() => setProg(100), 60),
        window.setTimeout(() => setDl('done'), 2600)
      );
    },
    autoPressed: auto.pressed,
    autoTrack: auto.track,
    autoKnob: auto.knob,
    toggleAuto: () => set({ autoDownloadPacks: !autoDownloadPacks }),
  };
  return <Themed classic={OfflineView} deccan={DeccanOfflineView} v={v} />;
}
