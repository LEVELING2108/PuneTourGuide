import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { miscApi } from '../../api/places';
import type { PlanDay, Stop } from '../../api/itinerary';
import { Themed } from '../../components/Themed';
import { useCurrentPosition, type Position } from '../../features/location';
import { kmText, useCategoryCounts, usePlan } from '../../features/places';
import { useSafetySummary } from '../../features/safety';
import { useIsLoggedIn, useUser } from '../../stores/auth';
import { useExploreStore } from '../../stores/explore';
import { usePermissionStore } from '../../stores/permissions';
import { useTheme } from '../../stores/theme';
import MainView from '../../views/classic/Main.view';
import DeccanHomeView from '../../views/deccan/DeccanHome.view';

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
  const weather = useQuery({ queryKey: ['weather'], queryFn: miscApi.weather, staleTime: 15 * 60_000 });
  const plan = usePlan(loggedIn);
  const counts = useCategoryCounts();
  const [q, setQ] = useState('');

  const ready = perms.location && perms.motion;
  const missing = [!perms.location, !perms.motion].filter(Boolean).length;
  const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date());
  const temp = weather.data ? `${weather.data.tempC}°` : '';
  const first = user?.name?.split(' ')[0];

  const next = nextStop(plan.data);
  const s = next?.stop;
  const travel = s ? travelText(pos, s) : null;
  const hospital = s?.place.hospital?.km !== null && s?.place.hospital?.km !== undefined ? `hospital ${kmText(s.place.hospital.km)}` : null;
  const dayXp = next?.day.stops.filter((x) => x.done).reduce((n, x) => n + x.place.xp, 0) ?? 0;

  let nextKicker = 'START PLANNING';
  let nextName = 'Plan your day';
  let nextMeta = 'Add places from Explore or load a route';
  let nextCount = '';
  let nextHref = '/explore';
  if (s && next) {
    nextKicker = `NEXT STOP · ${s.time}`;
    nextName = s.place.name;
    nextMeta = [s.place.area, travel, hospital].filter(Boolean).join(' · ');
    nextCount = `${next.idx + 1} of ${next.day.stops.length}`;
    nextHref = '/plan';
  } else if (next && next.day.stops.length) {
    nextKicker = 'DAY COMPLETE';
    nextName = 'Every stop visited';
    nextMeta = `+${dayXp} XP today · plan tomorrow`;
    nextHref = '/plan';
  }

  const goSearch = (text: string) => {
    const t = text.trim();
    if (HELP_WORDS.test(t)) return navigate('/map?layer=help');
    explore.set({ q: t, cat: 'All' });
    navigate('/explore');
  };

  const v = {
    ready,
    notReady: !ready,
    dateLine: [weekday.toUpperCase(), 'PUNE', temp].filter(Boolean).join(' · '),
    greeting: `नमस्कार, ${first ?? 'traveller'}`,
    greetingLine: `नमस्कार, ${first ?? 'traveller'} · Pune${temp ? ` ${temp}` : ''}`,
    q,
    onQuery: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
    onSearch: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') goSearch(q);
    },
    nextKicker,
    nextName,
    nextMeta,
    nextMetaDeccan: nextMeta,
    nextCount,
    nextHref,
    setupText: `${missing === 2 ? '2 steps' : '1 step'} left · location and shake to SOS`,
    stepsLeft: `· ${missing === 2 ? '2 steps' : '1 step'} left`,
    readyText: safety.summary,
    readyTextDeccan: `· ${safety.short}`,
    collections: COLLECTIONS.map((c) => {
      const n = counts.data?.[c.count];
      return {
        countText: n === undefined ? '' : `${n} places`,
        open: () => explore.set({ cat: theme === 'deccan' && c.deccanCat ? c.deccanCat : c.cat, q: '' }),
      };
    }),
  };
  return <Themed classic={MainView} deccan={DeccanHomeView} v={v} />;
}
