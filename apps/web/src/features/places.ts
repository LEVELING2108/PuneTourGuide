import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import { itineraryApi } from '../api/itinerary';
import { placesApi, type PlaceQuery, type PlaceSummary } from '../api/places';
import { useIsLoggedIn } from '../stores/auth';
import type { ThemeName } from '../stores/theme';

/** Chip label → API filter, per theme (Deccan chips use Wadas / Food lanes / Hills). */
export const CHIP_FILTERS: Record<string, Pick<PlaceQuery, 'category' | 'kind'>> = {
  All: {},
  Forts: { category: 'Fort' },
  Temples: { category: 'Temple' },
  Heritage: { category: 'Heritage' },
  Food: { category: 'Food' },
  Nature: { category: 'Nature' },
  Museums: { category: 'Museum' },
  Wadas: { kind: 'Wada' },
  'Food lanes': { category: 'Food' },
  Hills: { kind: 'Hill' },
};

const CATEGORY_LABEL: Record<string, string> = {
  Heritage: 'Heritage',
  Temple: 'Temple',
  Fort: 'Fort',
  Museum: 'Museum',
  Nature: 'Nature',
  Food: 'Food',
};

const MARATHI_KIND: Record<string, string> = {
  Wada: 'वाडा',
  Hill: 'टेकडी',
  'Food lane': 'खाऊ',
  'Cave temple': 'लेणी',
  Lake: 'तलाव',
  Garden: 'बाग',
  Heritage: 'वारसा',
  Temple: 'मंदिर',
  Fort: 'गड',
  Museum: 'संग्रहालय',
  Nature: 'निसर्ग',
  Food: 'खाऊ',
};

const CLASSIC_TONE: Record<string, string> = {
  Heritage: '#1B2220',
  Temple: '#26303B',
  Fort: '#4A3426',
  Museum: '#0F4C42',
  Nature: '#0F4C42',
  Food: '#4A3426',
};
const DECCAN_TONE: Record<string, string> = {
  Heritage: '#7A1F4E',
  Temple: '#A4462B',
  Fort: '#0E5B5E',
  Museum: '#0E5B5E',
  Nature: '#0E5B5E',
  Food: '#C59A3A',
};

export const kmText = (km: number | null | undefined) => (km === null || km === undefined ? null : km < 10 ? `${km} km` : `${Math.round(km)} km`);

/** List-row text and colours for a place, matching the Explore mockups. */
export function placeRow(p: PlaceSummary, theme: ThemeName) {
  const dist = kmText(p.km);
  const label = p.kind && p.category !== 'Heritage' ? p.kind : CATEGORY_LABEL[p.category] ?? p.category;
  const classicMeta = [label, p.area, dist].filter(Boolean).join(' · ');
  const deccanMeta = [p.area, dist].filter(Boolean).join(' · ');
  const help = p.weakSignal
    ? 'Weak signal · save offline first'
    : p.hospital?.km !== null && p.hospital?.km !== undefined
      ? `Hospital ${kmText(p.hospital.km)}`
      : 'Help nearby on the map';
  return {
    meta: theme === 'deccan' ? deccanMeta : classicMeta,
    help,
    warn: p.weakSignal,
    mr: MARATHI_KIND[p.kind ?? ''] ?? MARATHI_KIND[p.category] ?? '',
    tone: (theme === 'deccan' ? DECCAN_TONE : CLASSIC_TONE)[p.category] ?? '#26303B',
    href: `/place/${p.id}`,
  };
}

export const usePlaces = (query: PlaceQuery, enabled = true) =>
  useQuery({
    queryKey: ['places', query],
    queryFn: () => placesApi.list(query),
    placeholderData: keepPreviousData,
    enabled,
  });

export const usePlaceCount = (query: PlaceQuery) =>
  useQuery({ queryKey: ['placeCount', query], queryFn: () => placesApi.count(query), placeholderData: keepPreviousData });

export const useCategoryCounts = () =>
  useQuery({ queryKey: ['categoryCounts'], queryFn: placesApi.categories, staleTime: 10 * 60_000 });

export const usePlace = (id: number | null, near?: string) =>
  useQuery({ queryKey: ['place', id, near], queryFn: () => placesApi.get(id!, near), enabled: !!id });

/** Guests get the log-in screen (with a way back) instead of an error. */
export function useRequireLogin() {
  const loggedIn = useIsLoggedIn();
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (loggedIn) return true;
    navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return false;
  };
}

/** Patch a place's flags in every cached list/detail (optimistic UI). */
function patchPlaceCaches(qc: ReturnType<typeof useQueryClient>, placeId: number, patch: Partial<PlaceSummary>) {
  qc.setQueriesData<{ data: PlaceSummary[]; meta: unknown }>({ queryKey: ['places'] }, (old) =>
    old ? { ...old, data: old.data.map((p) => (p.id === placeId ? { ...p, ...patch } : p)) } : old
  );
  qc.setQueriesData<PlaceSummary>({ queryKey: ['place', placeId] }, (old) => (old ? { ...old, ...patch } : old));
}

/** + / ✓ add-to-plan toggle. Resolves with the weekday it was added to (for the toast). */
export function useTogglePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: number; planStopId: number | null }) => {
      if (p.planStopId) {
        await itineraryApi.removeStop(p.planStopId);
        return { added: false as const, stopId: null, weekday: null };
      }
      const r = await itineraryApi.addStop(p.id);
      return { added: true as const, stopId: r.stop.id, weekday: r.day.weekday };
    },
    onMutate: (p) => patchPlaceCaches(qc, p.id, { planStopId: p.planStopId ? null : -1 }),
    onSuccess: (r, p) => patchPlaceCaches(qc, p.id, { planStopId: r.stopId }),
    onError: (_e, p) => patchPlaceCaches(qc, p.id, { planStopId: p.planStopId }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['itinerary'] }),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: number; isSaved: boolean }) => (p.isSaved ? placesApi.unsave(p.id) : placesApi.save(p.id)),
    onMutate: (p) => patchPlaceCaches(qc, p.id, { isSaved: !p.isSaved }),
    onError: (_e, p) => patchPlaceCaches(qc, p.id, { isSaved: p.isSaved }),
  });
}

export const useRoutes = () => useQuery({ queryKey: ['routes'], queryFn: itineraryApi.routes, staleTime: 10 * 60_000 });

export const usePlan = (enabled = true) => useQuery({ queryKey: ['itinerary'], queryFn: itineraryApi.plan, enabled });
