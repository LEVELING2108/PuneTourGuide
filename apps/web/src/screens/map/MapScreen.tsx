import { lazy, Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import type { PlanDay, Stop } from '../../api/itinerary';
import { miscApi, placesApi } from '../../api/places';
import { routingApi } from '../../api/routing';
import type { MapLine, MapMarker, MapView } from '../../components/map/MapCanvas';
import { declutter, dotBox, labelBox } from '../../components/map/declutter';
import { helpPin, legPin, mePin, placePin, stopPin, type StopPinKind } from '../../components/map/pins';
import { Themed } from '../../components/Themed';
import { driveMinutes, isMedical, useHelpNearby, type Help } from '../../features/help';
import { useCurrentPosition } from '../../features/location';
import { PUNE_CENTRE } from '../../features/permissions';
import { kmText, placeTone, usePlaceCount, usePlaces, usePlan } from '../../features/places';
import { puneTodayIso } from '../../features/plan';
import { distText, durText, metres, midpoint, splitLegs, type LatLng, type Pair } from '../../lib/geo';
import { chipColors, usePalette } from '../../lib/palette';
import { useIsLoggedIn } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import ClassicMapView from '../../views/classic/Map.view';
import DeccanMapView from '../../views/deccan/DeccanMap.view';

const MapCanvas = lazy(() => import('../../components/map/MapCanvas'));

type Mode = 'places' | 'route';
type Sheet = Mode | 'help';

const RADIUS_KM = 5;
const SHEET_PAD: [number, number, number, number] = [180, 40, 360, 40];
const shortName = (n: string) => n.replace(/\b(Temple|Fort|Palace|Museum|Garden|Cave|Hill)s?\b.*$/i, '').trim().split(' ').slice(0, 2).join(' ') || n;

/** First readable part of an OSM address ("Rasta Peth", not "489"). */
const shortAddress = (a: string | null) =>
  a
    ?.split(/[,;]/)
    .map((x) => x.replace(/^[\d\s/\-.#]+/, '').trim())
    .find((x) => /[a-z]{3}/i.test(x) && !/^pune$/i.test(x)) ?? null;

/** Today's day if planned, else the first day with stops. */
function routeDay(days: PlanDay[] | undefined) {
  if (!days?.length) return null;
  return days.find((d) => d.date === puneTodayIso() && d.stops.length) ?? days.find((d) => d.stops.length) ?? days[0];
}

const hasCoords = (s: Stop): s is Stop & { place: { lat: number; lng: number } } => s.place.lat !== null && s.place.lng !== null;

/** "8 min walk" for short hops, else "12 min by auto" (from the real route leg). */
const legText = (leg: { distanceM: number; durationS: number } | undefined) =>
  !leg ? null : leg.distanceM < 1200 ? `${durText((leg.distanceM / 4.5 / 1000) * 3600)} walk` : `${durText(leg.durationS)} by auto`;

export default function MapScreen() {
  const theme = useTheme();
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const loggedIn = useIsLoggedIn();
  const pos = useCurrentPosition();

  const initialLayer = params.get('layer');
  const [mode, setMode] = useState<Mode>(initialLayer === 'route' ? 'route' : 'places');
  const [help, setHelp] = useState(true);
  const [sheet, setSheet] = useState<Sheet>(initialLayer === 'route' ? 'route' : initialLayer === 'places' ? 'places' : 'help');
  const [centre, setCentre] = useState<LatLng>(() => (pos.known ? pos : PUNE_CENTRE));
  // Start with you in the part of the map the search bar and sheet leave visible.
  const [view, setView] = useState<MapView | null>(() =>
    pos.known ? { key: 'start', fit: [[pos.lat, pos.lng]], padding: SHEET_PAD, maxZoom: 14 } : null
  );
  const [zoom, setZoom] = useState(14);
  const [q, setQ] = useState('');
  const me = pos.known ? pos : null;
  const here = me ?? centre;

  // Places layer: the Explore query around the map centre (~1 km grid keeps the cache warm).
  const near = `${centre.lat.toFixed(2)},${centre.lng.toFixed(2)}`;
  const places = usePlaces({ near, radiusKm: RADIUS_KM, limit: 40 });
  const placeList = (places.data?.data ?? []).filter((x) => x.lat !== null && x.lng !== null);
  const placeCount = usePlaceCount({ near, radiusKm: RADIUS_KM });

  // Help layer: hospitals and police around you (or the map centre when location is off).
  const helpQ = useHelpNearby(me && metres(me, centre) < 2500 ? me : centre, help);
  const helpList = (helpQ.data ?? []).map((h) => ({ ...h, km: Math.round((metres(here, h) / 1000) * 10) / 10 }));

  // My route: today's stops and the real road geometry between them.
  const plan = usePlan(loggedIn);
  const day = routeDay(plan.data);
  const stops = (day?.stops ?? []).filter(hasCoords);
  const pts: LatLng[] = stops.map((s) => ({ lat: s.place.lat, lng: s.place.lng }));
  const route = useQuery({
    queryKey: ['route-line', pts.map((x) => `${x.lat.toFixed(4)},${x.lng.toFixed(4)}`).join(';')],
    queryFn: ({ signal }) => routingApi.directions(pts, 'auto', signal),
    enabled: mode === 'route' && pts.length >= 2 && pts.length <= 12,
    staleTime: 60 * 60_000,
  });
  const legs = useMemo(() => (route.data ? splitLegs(route.data.geometry, pts) : []), [route.data]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextIdx = stops.findIndex((s) => !s.done);
  const next = nextIdx >= 0 ? stops[nextIdx] : null;
  const after = nextIdx >= 0 ? stops[nextIdx + 1] ?? null : null;
  const left = stops.filter((s) => !s.done).length;

  // ── Map data ──────────────────────────────────────────────────
  const shadow = theme === 'deccan' ? '0 8px 18px -10px rgba(35,28,23,0.45)' : '0 8px 18px -10px rgba(17,22,20,0.45)';
  type Cand = MapMarker & { force?: boolean; box: { left: number; right: number; up: number; down: number } };
  const cands: Cand[] = [];
  const markers: MapMarker[] = [];
  const lines: MapLine[] = [];

  if (mode === 'places') {
    [...placeList.filter((x) => x.planStopId), ...placeList.filter((x) => !x.planStopId)].forEach((x, i) =>
      cands.push({
        box: labelBox(shortName(x.name)),
        key: `p${x.id}`,
        lat: x.lat!,
        lng: x.lng!,
        html: placePin(shortName(x.name), !!x.planStopId, x.planStopId ? p.primaryShadow : shadow, Math.min(i, 8) * 0.06),
        title: x.name,
        z: x.planStopId ? 200 : 100,
        onClick: () => navigate(`/place/${x.id}`),
      })
    );
  }

  if (mode === 'route') {
    legs.forEach((leg, i) => {
      const to = stops[i + 1];
      const done = stops[i].done && to.done;
      const isNext = to === next;
      lines.push({
        key: `leg${i}`,
        points: leg,
        color: done ? p.routeDone : to.place.weakSignal ? '#C27A1E' : p.primary,
        weight: 4,
        opacity: done || isNext || to.place.weakSignal ? 1 : 0.5,
        dash: to.place.weakSignal && !done ? '8 8' : undefined,
        className: to.place.weakSignal && !done ? 'weak' : isNext ? 'draw' : undefined,
      });
      const legInfo = route.data?.legs[i];
      if (!done && legInfo && leg.length > 1 && (isNext || to.place.weakSignal)) {
        const [lat, lng] = midpoint(leg);
        cands.push({ force: true, box: { left: 44, right: 44, up: 12, down: 12 }, key: `lab${i}`, lat, lng, html: legPin(`${durText(legInfo.durationS)}${to.place.weakSignal ? ' · weak signal' : ''}`, to.place.weakSignal), z: 300 });
      }
    });
    stops.forEach((s, i) => {
      const kind: StopPinKind = s.done ? 'done' : s === next ? 'next' : s.place.weakSignal ? 'weak' : 'later';
      cands.push({
        force: true,
        box: dotBox(32),
        key: `s${s.id}`,
        lat: s.place.lat,
        lng: s.place.lng,
        html: stopPin(i + 1, kind, p.routeDone, p.primaryShadow.replace('18px 30px -20px', '8px 18px -8px')),
        title: `${i + 1}. ${s.place.name}`,
        z: 400,
        onClick: s.place.id ? () => navigate(`/place/${s.place.id}`) : undefined,
      });
    });
  }

  if (help) {
    helpList
      .filter((h) => h.category !== 'clinic')
      .forEach((h) =>
        cands.push({
          box: dotBox(30),
          key: h.key,
          lat: h.lat,
          lng: h.lng,
          html: helpPin(isMedical(h) ? 'medical' : 'police', p.shield),
          title: h.name,
          z: 250,
          onClick: () => {
            setSheet('help');
          },
        })
      );
  }

  if (me) cands.unshift({ force: true, box: dotBox(18), key: 'me', lat: me.lat, lng: me.lng, html: mePin(18, '0 2px 8px rgba(17,22,20,0.3)'), title: 'You are here', z: 1000 });
  // You and route stops always; in Places mode labels come next, otherwise help comes first.
  const order = (c: Cand) => (c.force ? 0 : c.key.startsWith('p') ? (mode === 'places' ? 1 : 3) : 2);
  const kept = declutter([...cands].sort((a, b) => order(a) - order(b)), zoom, (c) => c.box, 26);
  markers.push(...kept.map((c) => ({ key: c.key, lat: c.lat, lng: c.lng, html: c.html, title: c.title, z: c.z, onClick: c.onClick })));

  // ── Chips ─────────────────────────────────────────────────────
  const pc = chipColors(p, mode === 'places');
  const rc = chipColors(p, mode === 'route');
  const hc = chipColors(p, help);

  const fitRoute = () => {
    if (pts.length) setView({ key: `route-${Date.now()}`, fit: pts.map((x) => [x.lat, x.lng] as Pair), padding: SHEET_PAD, maxZoom: 15 });
  };

  // ── Sheets ────────────────────────────────────────────────────
  const helpRows = (() => {
    const medical = helpList.filter(isMedical).slice(0, 2);
    const police = helpList.filter((h) => !isMedical(h)).slice(0, 1);
    return [...medical, ...police].map((h: Help, i, all) => ({
      key: h.key,
      name: h.name,
      meta: [shortAddress(h.address), `${kmText(h.km)}`, `${driveMinutes(h.km)} min`].filter(Boolean).join(' · '),
      dot: isMedical(h) ? '#C8321C' : p.shield,
      phone: h.phone,
      callHref: h.phone ? `tel:${h.phone}` : `/directions?lat=${h.lat.toFixed(5)}&lng=${h.lng.toFixed(5)}&name=${encodeURIComponent(h.name)}`,
      callLabel: h.phone ? `Call ${h.name}` : `Directions to ${h.name}`,
      isCall: !!h.phone,
      last: i === all.length - 1,
    }));
  })();

  const placeRows = placeList.slice(0, 3).map((x, i, all) => ({
    key: x.id,
    name: x.name,
    href: `/place/${x.id}`,
    meta: [x.kind && x.category !== 'Heritage' ? x.kind : x.category, kmText(x.km), x.planStopId ? 'in your plan' : null].filter(Boolean).join(' · '),
    tone: placeTone(x.category, theme),
    last: i === all.length - 1,
  }));

  const nextLeg = next && nextIdx > 0 ? route.data?.legs[nextIdx - 1] : undefined;
  const afterLeg = after ? route.data?.legs[nextIdx] : undefined;
  const nextHospital = next?.place.hospital ? [next.place.hospital.name, kmText(next.place.hospital.km)].filter(Boolean).join(' ') : null;
  const fromHere = next && me && nextIdx === 0 ? distText(metres(me, { lat: next.place.lat, lng: next.place.lng }) * 1.3) + ' away' : null;

  const search = async () => {
    const text = q.trim();
    if (text.length < 2) return;
    try {
      const hit = (await placesApi.list({ q: text, limit: 1 })).data.find((x) => x.lat !== null);
      const target = hit ? { lat: hit.lat!, lng: hit.lng! } : await miscApi.geocode(text);
      if (target) {
        setCentre({ lat: target.lat, lng: target.lng });
        setView({ key: `search-${Date.now()}`, center: { lat: target.lat, lng: target.lng }, zoom: 15 });
      }
    } catch {
      /* offline: keep the map where it is */
    }
  };

  const v = {
    mapNode: (
      <Suspense fallback={null}>
        <MapCanvas
          center={centre}
          zoom={14}
          markers={markers}
          lines={lines}
          view={view}
          attributionTop={168}
          label="Map of places, your route and help nearby"
          onMoveEnd={(c, z) => {
            setCentre(c);
            setZoom(z);
          }}
        />
      </Suspense>
    ),
    q,
    onQuery: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
    onSearch: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') void search();
    },
    showPlaces: mode === 'places',
    showRoute: mode === 'route',
    help,
    sheetPlaces: sheet === 'places',
    sheetRoute: sheet === 'route',
    sheetHelp: sheet === 'help',
    placesBg: pc.bg, placesFg: pc.fg, placesBd: pc.bd, placesPressed: pc.pressed,
    routeBg: rc.bg, routeFg: rc.fg, routeBd: rc.bd, routePressed: rc.pressed,
    helpBg: hc.bg, helpFg: hc.fg, helpBd: hc.bd, helpPressed: hc.pressed,
    pickPlaces: () => {
      setMode('places');
      setSheet('places');
    },
    pickRoute: () => {
      setMode('route');
      setSheet('route');
      fitRoute();
    },
    toggleHelp: () => {
      if (help) {
        setHelp(false);
        setSheet(sheet === 'help' ? mode : sheet);
      } else {
        setHelp(true);
        setSheet('help');
      }
    },

    // Places sheet
    placeRows,
    placesCount: placeCount.data === undefined ? '' : `${placeCount.data} within ${RADIUS_KM} km`,
    noPlaces: !places.isLoading && placeList.length === 0,

    // Route sheet
    routeNeedsLogin: !loggedIn,
    loginHref: '/login?next=%2Fmap%3Flayer%3Droute',
    routeEmpty: loggedIn && !plan.isLoading && stops.length === 0,
    routeDone: loggedIn && stops.length > 0 && !next,
    routeReady: loggedIn && !!next,
    routeCount: stops.length ? `${stops.length} ${stops.length === 1 ? 'stop' : 'stops'} · ${left} left` : '',
    nextNo: nextIdx + 1,
    nextKicker: next ? `NEXT · ${next.time.toUpperCase()}` : '',
    nextName: next?.place.name ?? '',
    nextMeta: [legText(nextLeg) ?? fromHere, nextHospital].filter(Boolean).join(' · '),
    hasAfter: !!after,
    afterNo: nextIdx + 2,
    afterWeak: !!after?.place.weakSignal,
    afterBg: after?.place.weakSignal ? '#FDF0E1' : 'var(--bg)',
    afterRing: after?.place.weakSignal ? '#C27A1E' : 'var(--line)',
    afterNoColor: after?.place.weakSignal ? '#8A4A12' : 'var(--muted)',
    afterColor: after?.place.weakSignal ? '#6E3A0E' : 'var(--muted)',
    afterText: after
      ? [`Then ${after.place.name}`, afterLeg ? `${durText(afterLeg.durationS)} by auto` : null, after.place.weakSignal ? 'weak signal on the way, check help on the map first' : null]
          .filter(Boolean)
          .join(' · ')
      : '',
    directionsHref: next?.place.id ? `/directions?to=${next.place.id}` : '/directions',
    liveSharing: false,

    // Help sheet
    helpRows,
    helpLoading: helpQ.isLoading,
    helpError: helpQ.isError || (!helpQ.isLoading && helpList.length === 0),
  };
  return <Themed classic={ClassicMapView} deccan={DeccanMapView} v={v} />;
}
