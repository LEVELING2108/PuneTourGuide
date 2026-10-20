import { useNavigate } from 'react-router';
import type { Stop } from '../../api/itinerary';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { kmText, placeTone, usePlan } from '../../features/places';
import { namesText } from '../../features/live';
import { defaultDayId, useMoveStop, useOptimiseDay, useTickStop } from '../../features/plan';
import { isNoContacts, useTripShare } from '../../features/trip';
import { usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useIsLoggedIn } from '../../stores/auth';
import { usePlanStore } from '../../stores/plan';
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
  const move = useMoveStop();
  const toast = useFlash(3100);
  const share = useTripShare();
  // The tab you last viewed or added to stays open when you come back from Explore
  const { dayId: remembered, setDay } = usePlanStore();

  useAccountRequired();

  const days = plan.data ?? [];
  const idx = Math.max(0, days.findIndex((d) => d.id === defaultDayId(days, remembered)));
  const day = days[idx];
  const otherDay = days[idx === 0 ? 1 : 0];
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
      moveLabel: otherDay ? `Move to Day ${otherDay.day}` : '',
      moveAria: otherDay ? `Move ${s.place.name} to Day ${otherDay.day}` : '',
      move: () => {
        if (!otherDay) return;
        move.mutate(
          { stopId: s.id, dayId: otherDay.id },
          {
            onSuccess: () => toast.flash(`${s.place.name} moved to Day ${otherDay.day} · ${otherDay.weekday}`),
            onError: (err) => toast.flash(err.message),
          }
        );
      },
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
  const trackOn = deccan ? '#C59A3A' : '#2FA58A';
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
    pickDay1: () => days[0] && setDay(days[0].id),
    pickDay2: () => days[1] && setDay(days[1].id),
    // Live trip sharing (TECH_DESIGN §9.6): texted link + location while the toggle is on
    sharing: share.on ? 'true' : 'false',
    sharePressed: share.on ? 'true' : 'false',
    trackBg: share.on ? trackOn : trackOff,
    knobLeft: share.on ? '24px' : '4px',
    knob: share.on ? '24px' : '4px',
    shareText: share.busy
      ? share.on
        ? 'Stopping…'
        : 'Starting…'
      : share.on
        ? share.status === 'reconnecting'
          ? 'Reconnecting · your last location stays visible'
          : `${namesText(share.sharedWith)} can follow your route`
        : 'Off · nobody can see your location',
    toggleShare: () => {
      share
        .toggle()
        .then((r) => toast.flash(r.on ? `Live trip shared with ${namesText(r.sharedWith ?? [])}` : 'Stopped sharing your location'))
        .catch((err) => {
          if (isNoContacts(err)) navigate('/settings/contacts/new');
          else toast.flash(err instanceof Error ? err.message : 'Could not start sharing');
        });
    },
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
