import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Stop } from '../../api/itinerary';
import { Themed } from '../../components/Themed';
import { kmText, placeTone, usePlan } from '../../features/places';
import { puneTodayIso, useOptimiseDay, useTickStop } from '../../features/plan';
import { usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useIsLoggedIn } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import PlanView from '../../views/classic/Plan.view';
import DeccanPlanView from '../../views/deccan/DeccanPlan.view';

function helpLine(s: Stop) {
  const h = s.place.hospital;
  const near = h ? [h.name, kmText(h.km)].filter(Boolean).join(' · ') : null;
  if (s.place.weakSignal) return near ? `Weak signal · ${near}` : 'Weak signal · check help on the map first';
  return near ?? 'Help nearby on the map';
}

export default function PlanScreen() {
  const theme = useTheme();
  const p = usePalette();
  const deccan = theme === 'deccan';
  const navigate = useNavigate();
  const loggedIn = useIsLoggedIn();
  const plan = usePlan(loggedIn);
  const tick = useTickStop();
  const optimise = useOptimiseDay();
  const toast = useFlash(3100);
  const [picked, setPicked] = useState<number | null>(null);

  // A plan belongs to an account: guests log in and come straight back.
  useEffect(() => {
    if (!loggedIn) navigate('/login?next=%2Fplan', { replace: true });
  }, [loggedIn, navigate]);

  const days = plan.data ?? [];
  const todayIdx = Math.max(0, days.findIndex((d) => d.date === puneTodayIso()));
  const idx = picked ?? todayIdx;
  const day = days[idx];
  const list = day?.stops ?? [];
  const earned = list.filter((s) => s.done).reduce((n, s) => n + s.place.xp, 0);
  const left = list.filter((s) => !s.done).length;

  const stops = list.map((s, i) => {
    const d = s.done;
    const [t, ampm] = s.time.split(' ');
    return {
      key: s.id,
      name: s.place.name,
      href: s.place.id ? `/place/${s.place.id}` : undefined,
      xp: deccan ? String(s.place.xp) : `+${s.place.xp} XP`,
      time: deccan ? t : s.time,
      ampm,
      no: String(i + 1).padStart(2, '0'),
      help: helpLine(s),
      tone: placeTone(s.place.category, theme),
      done: d,
      pressed: d ? 'true' : 'false',
      tickLabel: d ? `Mark ${s.place.name} not visited` : `Mark ${s.place.name} visited`,
      helpColor: s.place.weakSignal ? '#8A4A12' : p.muted,
      ring: d ? p.primary : p.stopRingOff,
      fill: d ? p.primary : p.surface,
      tick: d ? p.surface : p.stopRingOff,
      opacity: d ? 0.62 : 1,
      line: i === list.length - 1 ? 'none' : 'block',
      toggle: () =>
        tick.mutate(
          { stopId: s.id, done: !d },
          {
            onSuccess: (r) => {
              if (r.stampCollected) toast.flash(`Stamp collected · +${r.xpAwarded} XP`);
            },
            onError: (err) => toast.flash(err.message),
          }
        ),
    };
  });

  const tab = (i: number) => days[i]?.label ?? `Day ${i + 1}`;
  const trackOff = deccan ? '#4A3F37' : '#3A423F';

  const v = {
    stops,
    empty: !!day && list.length === 0,
    loading: plan.isLoading,
    emptyTitle: deccan ? 'No stops on this day' : 'Nothing planned yet',
    emptyText: 'Add places from Explore, or load a curated route.',
    dayName: day?.weekday ?? '',
    day1Label: tab(0),
    day2Label: tab(1),
    countText: list.length ? `${list.length} ${list.length === 1 ? 'stop' : 'stops'} · ${left} left` : '',
    xpLabel: `${earned} XP EARNED`,
    xp: `+${earned}`,
    segX: idx === 0 ? '0%' : '100%',
    day1Color: idx === 0 ? p.onInk : p.muted,
    day2Color: idx === 1 ? p.onInk : p.muted,
    c1: idx === 0 ? p.onInk : p.muted,
    c2: idx === 1 ? p.onInk : p.muted,
    day1Pressed: idx === 0 ? 'true' : 'false',
    day2Pressed: idx === 1 ? 'true' : 'false',
    pickDay1: () => setPicked(0),
    pickDay2: () => setPicked(1),
    // Live trip sharing needs emergency contacts and a tracking session (Phase 5).
    sharing: 'false',
    sharePressed: 'false',
    trackBg: trackOff,
    knobLeft: '4px',
    knob: '4px',
    shareText: 'Off · nobody can see your location',
    toggleShare: () => toast.flash('Add an emergency contact to share your trip'),
    optLabel: optimise.isPending ? 'Optimising…' : 'Optimise',
    optBusy: optimise.isPending ? 'true' : 'false',
    showToast: toast.show,
    toastKey: toast.key,
    toastText: toast.text,
    optimise: () => {
      if (!day || optimise.isPending) return;
      optimise.mutate(day.id, {
        onSuccess: (r) =>
          toast.flash(
            r.minutesSaved > 0
              ? `Reordered · saves about ${r.minutesSaved} min of travel${r.estimated ? ' (estimate)' : ''}`
              : 'Already the best order for today'
          ),
        onError: (err) => toast.flash(err.message),
      });
    },
  };
  return <Themed classic={PlanView} deccan={DeccanPlanView} v={v} />;
}
