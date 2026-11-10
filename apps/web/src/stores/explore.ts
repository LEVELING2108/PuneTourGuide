import { create } from 'zustand';

export type Distance = '1 km' | '5 km' | '10 km' | 'Any';

type ExploreState = {
  cat: string;
  q: string;
  dist: Distance;
  open: boolean;
  free: boolean;
  access: boolean;
  help: boolean;
  set: (patch: Partial<Omit<ExploreState, 'set' | 'reset'>>) => void;
  reset: () => void;
};

const FILTERS_OFF = { dist: 'Any' as Distance, open: false, free: false, access: false, help: false };

/** Explore search + chip + Filters sheet state (shared by Explore, Filters and Home shortcuts). */
export const useExploreStore = create<ExploreState>()((set) => ({
  cat: 'All',
  q: '',
  ...FILTERS_OFF,
  set: (patch) => set(patch),
  reset: () => set(FILTERS_OFF),
}));

export const RADIUS: Record<Distance, number | undefined> = { '1 km': 1, '5 km': 5, '10 km': 10, Any: undefined };
