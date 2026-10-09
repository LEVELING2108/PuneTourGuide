import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import FiltersView from '../../views/classic/Filters.view';
import DeccanFiltersView from '../../views/deccan/DeccanFilters.view';
import ExploreScreen from './ExploreScreen';

const DISTANCES = ['1 km', '5 km', '10 km', 'Any'] as const;
const DEFS = [
  { key: 'open', title: 'Open now', sub: 'Hide places that are closed right now' },
  { key: 'free', title: 'Free entry', sub: 'No ticket needed' },
  { key: 'access', title: 'Wheelchair friendly', sub: 'Step-free entry reported' },
  { key: 'help', title: 'Hospital within 2 km', sub: 'Only places close to medical help' },
] as const;

type FilterState = { dist: string; open: boolean; free: boolean; access: boolean; help: boolean };

export default function FiltersScreen() {
  const p = usePalette();
  const [s, setS] = useState<FilterState>({ dist: '5 km', open: true, free: false, access: false, help: true });

  const base = ({ '1 km': 6, '5 km': 18, '10 km': 24, Any: 31 } as Record<string, number>)[s.dist];
  let count = base;
  if (s.open) count -= 3;
  if (s.free) count -= 5;
  if (s.access) count -= 6;
  if (s.help) count -= 2;

  const v = {
    underlay: <ExploreScreen />,
    dists: DISTANCES.map((label) => ({ label, key: label, ...chipColors(p, label === s.dist), pick: () => setS({ ...s, dist: label }) })),
    toggles: DEFS.map((d) => {
      const on = s[d.key];
      const t = toggleColors(p, on);
      return { ...d, pressed: t.pressed, trackBg: t.track, knob: t.knob, flip: () => setS({ ...s, [d.key]: !on }) };
    }),
    count: Math.max(1, count),
    reset: () => setS({ dist: 'Any', open: false, free: false, access: false, help: false }),
  };
  return <Themed classic={FiltersView} deccan={DeccanFiltersView} v={v} />;
}
