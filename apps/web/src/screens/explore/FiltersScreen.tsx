import { Themed } from '../../components/Themed';
import { usePlaceCount } from '../../features/places';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import { useExploreStore, type Distance } from '../../stores/explore';
import FiltersView from '../../views/classic/Filters.view';
import DeccanFiltersView from '../../views/deccan/DeccanFilters.view';
import ExploreScreen, { useExploreQuery } from './ExploreScreen';

const DISTANCES: Distance[] = ['1 km', '5 km', '10 km', 'Any'];
const DEFS = [
  { key: 'open', title: 'Open now', sub: 'Hide places that are closed right now' },
  { key: 'free', title: 'Free entry', sub: 'No ticket needed' },
  { key: 'access', title: 'Wheelchair friendly', sub: 'Step-free entry reported' },
  { key: 'help', title: 'Hospital within 2 km', sub: 'Only places close to medical help' },
] as const;

/** Filters sheet over Explore; "Show N places" uses GET /places/count with the same filters. */
export default function FiltersScreen() {
  const p = usePalette();
  const s = useExploreStore();
  const query = useExploreQuery();
  const count = usePlaceCount({ ...query, limit: undefined });

  const v = {
    underlay: <ExploreScreen />,
    dists: DISTANCES.map((label) => ({ label, key: label, ...chipColors(p, label === s.dist), pick: () => s.set({ dist: label }) })),
    toggles: DEFS.map((d) => {
      const on = s[d.key];
      const t = toggleColors(p, on);
      return { ...d, pressed: t.pressed, trackBg: t.track, knob: t.knob, flip: () => s.set({ [d.key]: !on }) };
    }),
    count: count.data ?? '…',
    reset: () => s.reset(),
  };
  return <Themed classic={FiltersView} deccan={DeccanFiltersView} v={v} />;
}
