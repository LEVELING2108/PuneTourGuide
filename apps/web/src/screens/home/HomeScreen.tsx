import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { usersApi } from '../../api/auth';
import { miscApi } from '../../api/places';
import type { PlanDay, Stop } from '../../api/itinerary';
import { Themed } from '../../components/Themed';
import { useCurrentPosition, type Position } from '../../features/location';
import { useOffline } from '../../features/offline';
import { kmText, useCategoryCounts, usePlan } from '../../features/places';
import { useSafetySummary } from '../../features/safety';
import { useIsLoggedIn, useUser } from '../../stores/auth';
import { useExploreStore } from '../../stores/explore';
import { usePermissionStore } from '../../stores/permissions';
import { useTheme } from '../../stores/theme';
import MainView from '../../views/classic/Main.view';
import DeccanHomeView from '../../views/deccan/DeccanHome.view';
import type { HomeStatus, RouteDots } from './HomeParts';
import { useSky } from './sky';

const HELP_WORDS = /\b(hospital|clinic|police|pharmacy|ambulance|doctor)s?\b/i;

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

/** Rough door-to-door time: walk under 1.5 km, otherwise auto at city speed. */
function travelText(pos: Position, stop: Stop) {
  if (!pos.known || stop.place.lat === null || stop.place.lng === null) return null;
  const km = haversineKm(pos, { lat: stop.place.lat, lng: stop.place.lng }) * 1.3;
  const min = km < 1.5 ? (km / 4.5) * 60 : (km / 18) * 60 + 5;
  return min < 60 ? `${Math.max(1, Math.round(min))} min` : `${Math.round((min / 60) * 10) / 10} hr`;
}

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

function nextStop(plan: PlanDay[] | undefined) {
  if (!plan?.length) return null;
  const day = plan.find((d) => d.date === todayIso()) ?? plan[0];
  const idx = day.stops.findIndex((s) => !s.done);
  return { day, idx, stop: idx >= 0 ? day.stops[idx] : null };
}

const COLLECTIONS = [
  { label: 'Forts', cat: 'Forts', count: 'Fort' },
  { label: 'Temples', cat: 'Temples', count: 'Temple' },
  { label: 'Heritage', cat: 'Heritage', count: 'Heritage' },
  { label: 'Food', cat: 'Food', deccanCat: 'Food lanes', count: 'Food' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useUser();
  const loggedIn = useIsLoggedIn();
  const pos = useCurrentPosition();
  const perms = usePermissionStore();
  const safety = useSafetySummary();
  const explore = useExploreStore();
  // Weather only draws the sky; the phone already shows the temperature
  const weather = useQuery({ queryKey: ['weather'], queryFn: miscApi.weather, staleTime: 15 * 60_000 });
  const plan = usePlan(loggedIn);
  const counts = useCategoryCounts();
  const stamps = useQuery({ queryKey: ['stamps'], queryFn: usersApi.stamps, enabled: loggedIn, staleTime: 60_000 });
  const packs = useOffline((o) => o.saved);
  const sky = useSky(weather.data?.isRaining);
  const [q, setQ] = useState('');

  const ready = perms.location && perms.motion;
  const missing = [!perms.location, !perms.motion].filter(Boolean).length;
  const first = user?.name?.split(' ')[0];

  const next = nextStop(plan.data);
  const s = next?.stop;
  const travel = s ? travelText(pos, s) : null;
  const hospital = s?.place.hospital?.km !== null && s?.place.hospital?.km !== undefined ? `Hospital ${kmText(s.place.hospital.km)}` : null;
  const dayXp = next?.day.stops.filter((x) => x.done).reduce((n, x) => n + x.place.xp, 0) ?? 0;

  let nextKicker = 'Start planning';
  let nextName = 'Plan your day';
  let nextMeta = ['Add places from Explore', 'or load a route'];
  let nextHref = '/explore';
  let route: RouteDots = null;
  if (s && next) {
    nextKicker = `Next stop, ${s.time}`;
    nextName = s.place.name;
    nextMeta = [[s.place.area, travel].filter(Boolean).join(', '), hospital ?? ''].filter(Boolean);
    nextHref = '/plan';
    route = { done: next.day.stops.map((x) => x.done), current: next.idx };
  } else if (next && next.day.stops.length) {
    nextKicker = 'Day complete';
    nextName = 'Every stop visited';
    nextMeta = [`+${dayXp} XP today`, 'Plan tomorrow'];
    nextHref = '/plan';
  }

  const status: HomeStatus = {
    safety: ready
      ? { detail: [packs.length ? 'Offline pack' : null, safety.short].filter(Boolean).join(', '), href: theme === 'deccan' ? '/settings' : '/profile' }
      : null,
    progress: user
      ? {
          title: stamps.data ? `${stamps.data.collected} of ${stamps.data.total} stamps` : user.levelName,
          detail: user.nextLevelName ? `${user.xpToNext} XP to ${user.nextLevelName}` : 'Top level reached',
        }
      : null,
  };

  const goSearch = (text: string) => {
    const t = text.trim();
    if (HELP_WORDS.test(t)) return navigate('/map?layer=help');
    explore.set({ q: t, cat: 'All' });
    navigate('/explore');
  };

  const v = {
    notReady: !ready,
    greeting: `नमस्कार, ${first ?? 'traveller'}`,
    q,
    onQuery: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
    onSearch: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') goSearch(q);
    },
    sky,
    nextKicker,
    nextName,
    nextMeta,
    nextHref,
    route,
    status,
    setupText: `${missing === 2 ? '2 steps' : '1 step'} left · location and shake to SOS`,
    stepsLeft: `· ${missing === 2 ? '2 steps' : '1 step'} left`,
    collections: COLLECTIONS.map((c) => {
      const n = counts.data?.[c.count];
      return {
        count: n,
        countText: n === undefined ? '' : `${n} places`,
        open: () => explore.set({ cat: theme === 'deccan' && c.deccanCat ? c.deccanCat : c.cat, q: '' }),
      };
    }),
  };
  return <Themed classic={MainView} deccan={DeccanHomeView} v={v} />;
}
