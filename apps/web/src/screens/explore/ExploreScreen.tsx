import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { itineraryApi } from '../../api/itinerary';
import { miscApi, type PlaceQuery } from '../../api/places';
import { Themed } from '../../components/Themed';
import { nearParam, useCurrentPosition } from '../../features/location';
import { CHIP_FILTERS, placeRow, usePlaces, useRequireLogin, useRoutes, useTogglePlan } from '../../features/places';
import { chipColors, usePalette } from '../../lib/palette';
import { useDebounced } from '../../lib/useDebounced';
import { useFlash } from '../../lib/useFlash';
import { RADIUS, useExploreStore } from '../../stores/explore';
import { useTheme } from '../../stores/theme';
import ExploreView from '../../views/classic/Explore.view';
import DeccanExploreView from '../../views/deccan/DeccanExplore.view';

const CLASSIC_CATS = ['All', 'Forts', 'Temples', 'Heritage', 'Food', 'Nature', 'Museums'];
const DECCAN_CATS = ['All', 'Forts', 'Temples', 'Wadas', 'Food lanes', 'Hills'];

/** Fallback copy if routes have not loaded yet (same as the seed). */
const ROUTE_COPY = [
  { title: 'Old Pune peth walk', summary: '5 stops · help within 1.5 km', deccanTitle: 'Peth heritage walk', deccanSummary: 'Kasba → Budhwar → Shukrawar' },
  { title: 'Fort day trip', summary: '2 forts · offline pack included', deccanTitle: 'Two-fort monsoon trek', deccanSummary: 'Sinhagad → Rajgad · offline pack' },
  { title: 'Temple morning', summary: '4 stops · done by noon', deccanTitle: 'Ganpati darshan', deccanSummary: 'Kasba → Dagdusheth → Sarasbaug' },
];

const HELP_WORDS = /\b(hospital|clinic|police|pharmacy|ambulance|doctor)s?\b/i;

/** Build the API query from Explore + Filters state. */
export function useExploreQuery(): PlaceQuery {
  const pos = useCurrentPosition();
  const s = useExploreStore();
  const q = useDebounced(s.q.trim(), 300);
  return useMemo(
    () => ({
      ...CHIP_FILTERS[s.cat],
      q: q || undefined,
      // Unknown location → popularity order, unless a distance filter needs a centre (Pune)
      near: pos.known || RADIUS[s.dist] ? nearParam(pos) : undefined,
      radiusKm: RADIUS[s.dist],
      openNow: s.open || undefined,
      free: s.free || undefined,
      accessible: s.access || undefined,
      helpWithinKm: s.help ? 2 : undefined,
      limit: 30,
    }),
    [s.cat, q, pos, s.dist, s.open, s.free, s.access, s.help]
  );
}

export default function ExploreScreen() {
  const theme = useTheme();
  const deccan = theme === 'deccan';
  const p = usePalette();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const requireLogin = useRequireLogin();
  const store = useExploreStore();
  const query = useExploreQuery();
  const places = usePlaces(query);
  const routes = useRoutes();
  const togglePlan = useTogglePlan();
  const toast = useFlash(2700);
  const [slide, setSlide] = useState(0);

  // Nothing matched a search: try it as an address and show places near it (TECH_DESIGN §9.1)
  const noMatch = !!query.q && places.isSuccess && places.data.data.length === 0;
  const geo = useQuery({ queryKey: ['geocode', query.q], queryFn: () => miscApi.geocode(query.q!), enabled: noMatch, staleTime: Infinity });
  const nearAddress = usePlaces(
    { near: geo.data ? `${geo.data.lat.toFixed(3)},${geo.data.lng.toFixed(3)}` : undefined, radiusKm: 5, limit: 20 },
    noMatch && !!geo.data
  );

  // "hospitals" etc. lives on the Map's Help layer
  useEffect(() => {
    if (HELP_WORDS.test(query.q ?? '')) navigate('/map?layer=help');
  }, [query.q, navigate]);

  const showingAddress = noMatch && !!geo.data && !!nearAddress.data;
  const list = (showingAddress ? nearAddress.data?.data : places.data?.data) ?? [];

  const chips = (deccan ? DECCAN_CATS : CLASSIC_CATS).map((label) => {
    const on = label === store.cat;
    const c = deccan
      ? { pressed: on ? 'true' : 'false', bg: on ? p.primary : p.surface, fg: on ? p.surface : p.ink, bd: on ? p.primary : p.chipBd }
      : chipColors(p, on);
    return { label, key: label, ...c, pick: () => store.set({ cat: label }) };
  });

  const rows = list.map((pl) => {
    const row = placeRow(pl, theme);
    const added = pl.planStopId !== null;
    return {
      key: pl.id,
      name: pl.name,
      ...row,
      helpColor: row.warn ? '#8A4A12' : p.muted,
      added,
      notAdded: !added,
      pressed: added ? 'true' : 'false',
      addLabel: added ? `Remove ${pl.name} from plan` : `Add ${pl.name} to plan`,
      addBg: added ? p.primary : p.surface,
      addBd: added ? p.primary : p.addBd,
      toggle: () => {
        if (!requireLogin()) return;
        togglePlan.mutate(
          { id: pl.id, planStopId: pl.planStopId },
          {
            onSuccess: (r) => toast.flash(r.added ? `${pl.name} added to ${r.weekday}` : `${pl.name} removed from your plan`),
            onError: (e) => toast.flash(e.message),
          }
        );
      },
    };
  });

  const routeItems = ROUTE_COPY.map((copy, i) => {
    const r = routes.data?.[i];
    return {
      ...copy,
      ...(r ? { title: r.title, summary: r.summary, deccanTitle: r.deccanTitle ?? copy.deccanTitle, deccanSummary: r.deccanSummary ?? copy.deccanSummary } : {}),
      stopCount: r?.stopCount ?? (i === 1 ? 2 : i === 0 ? 5 : 4),
      load: async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!r || !requireLogin()) return;
        try {
          await itineraryApi.fromRoute(r.id);
          await qc.invalidateQueries({ queryKey: ['itinerary'] });
          await qc.invalidateQueries({ queryKey: ['places'] });
          navigate('/plan');
        } catch (err) {
          toast.flash((err as Error).message);
        }
      },
    };
  });

  const filtered = query.q || store.cat !== 'All' || store.open || store.free || store.access || store.help || store.dist !== 'Any';

  const v = {
    chips,
    places: rows,
    routes: routeItems,
    dots: [0, 1, 2].map((i) => ({ w: i === slide ? '20px' : '6px', bg: i === slide ? p.ink : p.slideDotOff })),
    empty: places.isSuccess && rows.length === 0 && !geo.isFetching && !nearAddress.isFetching,
    emptyText: filtered ? 'Nothing matches yet. Try another search or fewer filters.' : 'Nothing here yet. Try another category.',
    showToast: toast.show,
    toastText: toast.text,
    heading: showingAddress ? `Near ${geo.data!.name}` : store.cat === 'All' ? (deccan ? 'Near you' : 'Nearby') : store.cat,
    sortLabel: query.near ? 'By distance' : 'Popular',
    q: store.q,
    onQuery: (e: React.ChangeEvent<HTMLInputElement>) => store.set({ q: e.target.value }),
    onSlide: (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const first = el.firstElementChild as HTMLElement | null;
      const step = first ? first.offsetWidth + 12 : 300;
      const i = Math.max(0, Math.min(2, Math.round(el.scrollLeft / step)));
      if (i !== slide) setSlide(i);
    },
  };
  return <Themed classic={ExploreView} deccan={DeccanExploreView} v={v} />;
}
