import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { routingApi, type RouteStep, type TravelMode } from '../../api/routing';
import type { MapView } from '../../components/map/MapCanvas';
import { destinationPin, mePin } from '../../components/map/pins';
import { Themed } from '../../components/Themed';
import { ArrivalSheet } from '../../components/TripArrival';
import { useTripWatch } from '../../features/tripWatch';
import { nextStop } from '../../features/tripLogic';
import { useTripActions, useTripStore } from '../../features/tripMode';
import { isMedical, useHelpNearby } from '../../features/help';
import { namesText, useLiveStore } from '../../features/live';
import { useCurrentPosition, useWatchPosition } from '../../features/location';
import { kmText, usePlace, usePlan } from '../../features/places';
import { alongMetres, clockIn, closestIndex, distText, durText, metres, offRouteMetres, type LatLng, type Pair } from '../../lib/geo';
import { googleDirectionsUrl } from '../../lib/googleMaps';
import { chipColors, usePalette } from '../../lib/palette';
import { useIsLoggedIn } from '../../stores/auth';
import NavigationView from '../../views/classic/Navigation.view';
import DeccanNavigationView from '../../views/deccan/DeccanNavigation.view';

const MapCanvas = lazy(() => import('../../components/map/MapCanvas'));

const OFF_ROUTE_M = 50;
const OFF_ROUTE_MS = 10_000;
const ARRIVED_M = 30;

/** Turn arrow paths for the banner icon (24×24 viewBox). */
const ARROWS: Record<string, string[]> = {
  left: ['M16 20V12a4 4 0 0 0-4-4H5', 'M9 4L5 8l4 4'],
  right: ['M8 20V12a4 4 0 0 1 4-4h7', 'M15 4l4 4-4 4'],
  straight: ['M12 20V4', 'M6 10l6-6 6 6'],
  uturn: ['M8 20V10a4 4 0 0 1 8 0v6', 'M12 12l4 4 4-4'],
  arrive: ['M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z', 'M12 10h.01'],
};

const arrowFor = (s: RouteStep | undefined) => {
  if (!s || s.type === 'arrive') return ARROWS.arrive;
  const m = s.modifier ?? 'straight';
  if (m === 'uturn') return ARROWS.uturn;
  if (m.includes('left')) return ARROWS.left;
  if (m.includes('right')) return ARROWS.right;
  return ARROWS.straight;
};

const shortTurn = (s: RouteStep) =>
  s.type === 'arrive' ? 'arrive' : s.modifier?.includes('left') ? 'left' : s.modifier?.includes('right') ? 'right' : s.modifier === 'uturn' ? 'U-turn' : 'straight on';

const key = (p: LatLng | null) => (p ? `${p.lat.toFixed(4)},${p.lng.toFixed(4)}` : '');

export default function NavigationScreen() {
  const p = usePalette();
  const [params] = useSearchParams();
  const { stopId } = useParams();
  const loggedIn = useIsLoggedIn();

  // Destination: ?to=<placeId>, a plan stop (/directions/:stopId), or ?lat&lng&name (help points).
  const plan = usePlan(loggedIn && !!stopId);
  const stopPlaceId = stopId ? plan.data?.flatMap((d) => d.stops).find((s) => s.id === Number(stopId))?.place.id : null;
  const placeId = Number(params.get('to')) || stopPlaceId || null;
  const place = usePlace(placeId);
  const qLat = Number(params.get('lat'));
  const qLng = Number(params.get('lng'));
  const dest = useMemo(() => {
    if (place.data?.lat != null && place.data.lng != null) return { lat: place.data.lat, lng: place.data.lng, name: place.data.name };
    if (qLat && qLng) return { lat: qLat, lng: qLng, name: (params.get('name') ?? 'Destination').slice(0, 80) };
    return null;
  }, [place.data, qLat, qLng, params]);

  // Directions opened from trip mode: back to the trip, and ask on arrival there too
  const tripRun = useTripStore((st) => st.run);
  const tripDay = useTripStore((st) => st.day);
  const inTrip = params.get('trip') === '1' && !!tripRun;
  const tripNext = inTrip && tripDay ? nextStop(tripDay.stops, tripRun.skipped) : null;
  const tripWatch = useTripWatch(tripNext);
  const tripActions = useTripActions();
  const navigate = useNavigate();

  const [mode, setMode] = useState<TravelMode>(params.get('mode') === 'auto' ? 'auto' : 'walk');
  const watch = useWatchPosition();
  const liveTrip = useLiveStore((st) => st.trip);
  const last = useCurrentPosition();
  const me: LatLng | null = watch.pos ?? (last.known ? last : null);

  // The route is computed from `origin`; it moves only on a mode change or a re-route.
  const [origin, setOrigin] = useState<LatLng | null>(null);
  useEffect(() => {
    if (!origin && me) setOrigin(me);
  }, [origin, me]);

  const route = useQuery({
    queryKey: ['nav', mode, key(origin), key(dest)],
    queryFn: ({ signal }) => routingApi.directions([origin!, dest!], mode, signal),
    enabled: !!origin && !!dest,
    staleTime: Infinity,
    retry: 1,
  });
  const r = route.data;

  // Re-route when more than 50 m off the line for 10 seconds (TECH_DESIGN §3).
  const offSince = useRef<number | null>(null);
  useEffect(() => {
    if (!r || !watch.pos) return;
    if (offRouteMetres(r.geometry, watch.pos) <= OFF_ROUTE_M) {
      offSince.current = null;
    } else if (offSince.current === null) {
      offSince.current = Date.now();
    } else if (Date.now() - offSince.current > OFF_ROUTE_MS) {
      offSince.current = null;
      setOrigin(watch.pos);
    }
  }, [r, watch.pos]);

  // Progress along the route.
  const stepIdx = useMemo(() => {
    if (!r) return [];
    let from = 0;
    return r.steps.map((s) => (from = closestIndex(r.geometry, s, from)));
  }, [r]);
  const at = me ?? origin;
  const posIdx = r && at ? closestIndex(r.geometry, at) : 0;
  const nextI = r ? r.steps.findIndex((_, i) => i > 0 && stepIdx[i] > posIdx) : -1;
  const next = r && nextI > 0 ? r.steps[nextI] : r?.steps[r.steps.length - 1];
  const then = r && nextI > 0 ? r.steps[nextI + 1] : undefined;
  const toNext = r && nextI > 0 ? alongMetres(r.geometry, posIdx, stepIdx[nextI]) : 0;
  const remaining = r ? alongMetres(r.geometry, posIdx, r.geometry.length - 1) : 0;
  const etaS = r && r.distanceM > 0 ? (r.durationS * remaining) / r.distanceM : 0;
  const arrived = !!(dest && me && metres(me, dest) < ARRIVED_M);

  // Nearest hospital from where you are (real OSM data).
  const helpQ = useHelpNearby(me);
  const hospital = (helpQ.data ?? []).filter(isMedical).map((h) => ({ ...h, km: me ? Math.round((metres(me, h) / 1000) * 10) / 10 : h.km }))[0];

  // Map camera: fit the route once, then follow you until you pan away; Re-centre resumes.
  const [follow, setFollow] = useState(true);
  const [view, setView] = useState<MapView | null>(null);
  const fittedFor = useRef('');
  const lastFollow = useRef<LatLng | null>(null);
  useEffect(() => {
    if (!r || fittedFor.current === r.geometry.length + key(origin)) return;
    fittedFor.current = r.geometry.length + key(origin);
    lastFollow.current = origin;
    setView({ key: `fit-${fittedFor.current}`, fit: r.geometry, padding: [200, 40, 300, 40], maxZoom: 17 });
  }, [r, origin]);
  useEffect(() => {
    // Show the whole route first; start following once you have actually moved.
    if (!follow || !watch.pos || !r || (lastFollow.current && metres(lastFollow.current, watch.pos) < 15)) return;
    lastFollow.current = watch.pos;
    setView({ key: `follow-${key(watch.pos)}`, center: watch.pos, zoom: 17 });
  }, [follow, watch.pos, r]);

  // ── Text ─────────────────────────────────────────────────────
  let nextDist = '';
  let instruction = '';
  let eta = '';
  let meta = '';
  if (!dest) {
    instruction = place.isLoading ? 'Loading destination…' : 'Choose a place to get directions';
  } else if (!me) {
    instruction = watch.denied ? 'Turn on location to get directions' : 'Finding your location…';
    meta = dest.name;
  } else if (arrived) {
    nextDist = 'Arrived';
    instruction = `You have arrived at ${dest.name}`;
    meta = dest.name;
  } else if (route.isError) {
    instruction = 'Directions are unavailable right now';
    meta = `${distText(metres(me, dest))} away in a straight line · ${dest.name}`;
  } else if (!r) {
    instruction = 'Finding the best way…';
    meta = dest.name;
  } else {
    nextDist = distText(toNext || remaining);
    instruction = next?.instruction ?? 'Continue';
    eta = durText(etaS);
    meta = `${distText(remaining)}${mode === 'auto' ? ' by road' : ''} · arrive ${clockIn(etaS)} · ${dest.name}`;
  }
  const thenText = r && then && !arrived ? `Then ${shortTurn(then)} in ${distText(alongMetres(r.geometry, stepIdx[nextI], stepIdx[nextI + 1]))}` : '';

  const markers = [
    ...(dest ? [{ key: 'dest', lat: dest.lat, lng: dest.lng, html: destinationPin(dest.name), title: dest.name, z: 500 }] : []),
    ...(me ? [{ key: 'me', lat: me.lat, lng: me.lng, html: mePin(24, '0 4px 10px rgba(17,22,20,0.3)'), title: 'You are here', z: 1000 }] : []),
  ];
  const line: Pair[] = r ? r.geometry.slice(posIdx) : [];
  const lines = r
    ? [
        { key: 'halo', points: line, color: p.primary, weight: 16, opacity: 0.18 },
        { key: 'route', points: line, color: p.primary, weight: 7 },
      ]
    : [];

  const v = {
    mapNode: (
      <Suspense fallback={null}>
        <MapCanvas
          center={me ?? dest ?? { lat: 18.5204, lng: 73.8567 }}
          zoom={16}
          markers={markers}
          lines={lines}
          view={view}
          attributionTop={190}
          label="Route map"
          onMoveEnd={() => setFollow(false)}
        />
      </Suspense>
    ),
    modes: (['Walk', 'Auto'] as const).map((label) => {
      const m: TravelMode = label === 'Walk' ? 'walk' : 'auto';
      return {
        label,
        key: label,
        ...chipColors(p, m === mode),
        pick: () => {
          if (m === mode) return;
          setMode(m);
          if (me) setOrigin(me);
        },
      };
    }),
    eta,
    meta,
    googleHref: dest ? googleDirectionsUrl(dest, mode) : '',
    nextDist,
    instruction,
    streetMr: '',
    arrow: arrowFor(arrived ? { type: 'arrive' } as RouteStep : next),
    thenText,
    hasThen: !!thenText,
    recenter: () => {
      setFollow(true);
      if (me) setView({ key: `re-${Date.now()}`, center: me, zoom: 17 });
    },
    infoText: [
      liveTrip ? `${namesText(liveTrip.sharedWith)} can see your trip` : null,
      hospital ? `${hospital.name} ${kmText(hospital.km)} from here` : 'Hospitals and police are on the Map under Help nearby',
    ]
      .filter(Boolean)
      .join(' · '),
    infoDot: liveTrip ? '#2FA58A' : '#C8321C',
    endHref: inTrip ? '/trip' : '/plan',
    endLabel: inTrip ? 'Back to trip' : 'End directions',
  };
  const arrivedStop = tripWatch.arrived;
  return (
    <>
      <Themed classic={NavigationView} deccan={DeccanNavigationView} v={v} />
      {arrivedStop && (
        <ArrivalSheet
          stop={arrivedStop}
          onVisit={() => {
            tripWatch.dismiss();
            void tripActions.visit(arrivedStop.id).then(() => navigate('/trip'));
          }}
          onLater={tripWatch.dismiss}
        />
      )}
    </>
  );
}
