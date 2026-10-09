import { useRef, useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useTheme } from '../../stores/theme';
import PlanView from '../../views/classic/Plan.view';
import DeccanPlanView from '../../views/deccan/DeccanPlan.view';

type DemoStop = { time: string; name: string; xp: number; help: string; warn?: boolean; tone: string };

const DAY1: DemoStop[] = [
  { time: '9:30 AM', name: 'Shaniwar Wada', xp: 40, help: 'KEM Hospital · 1.2 km', tone: '#7A1F4E' },
  { time: '11:30 AM', name: 'Dagdusheth Ganpati', xp: 30, help: 'KEM Hospital · 0.9 km', tone: '#A4462B' },
  { time: '3:00 PM', name: 'Sinhagad Fort trek', xp: 80, help: 'Weak signal · help list saved offline', warn: true, tone: '#0E5B5E' },
];
const DAY2: DemoStop[] = [
  { time: '10:00 AM', name: 'Aga Khan Palace', xp: 40, help: 'Ruby Hall Clinic · 4 km', tone: '#0E5B5E' },
  { time: '1:00 PM', name: 'Pataleshwar Caves', xp: 30, help: 'Hospital · 1.6 km', tone: '#A4462B' },
  { time: '5:30 PM', name: 'Parvati Hill', xp: 30, help: 'Hospital · 2 km', tone: '#7A1F4E' },
];
const DAY2_OPTIMISED: DemoStop[] = [
  { ...DAY2[1], time: '10:00 AM' },
  { ...DAY2[0], time: '12:30 PM' },
  DAY2[2],
];

export default function PlanScreen() {
  const theme = useTheme();
  const p = usePalette();
  const deccan = theme === 'deccan';
  const [day, setDay] = useState<1 | 2>(1);
  const [sharing, setSharing] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({ 'Shaniwar Wada': true });
  const [busy, setBusy] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const toast = useFlash(3100);
  const timer = useRef<number>(0);

  const list = day === 1 ? DAY1 : flipped ? DAY2_OPTIMISED : DAY2;
  let earned = 0;
  const stops = list.map((s, i) => {
    const d = !!done[s.name];
    if (d) earned += s.xp;
    const [t, ampm] = s.time.split(' ');
    return {
      ...s,
      key: s.name,
      xp: deccan ? String(s.xp) : '+' + s.xp + ' XP',
      time: deccan ? t : s.time,
      ampm,
      no: '0' + (i + 1),
      done: d,
      pressed: d ? 'true' : 'false',
      helpColor: s.warn ? '#8A4A12' : p.muted,
      ring: d ? p.primary : p.stopRingOff,
      fill: d ? p.primary : p.surface,
      tick: d ? p.surface : p.stopRingOff,
      opacity: d ? 0.62 : 1,
      line: i === list.length - 1 ? 'none' : 'block',
      toggle: () => setDone({ ...done, [s.name]: !d }),
    };
  });

  const trackOn = deccan ? '#C59A3A' : '#2FA58A';
  const trackOff = deccan ? '#4A3F37' : '#3A423F';
  const dayOn = p.onInk;

  const v = {
    stops,
    dayName: day === 1 ? 'Saturday' : 'Sunday',
    xpLabel: earned + ' XP EARNED',
    xp: '+' + earned,
    segX: day === 1 ? '0%' : '100%',
    day1Color: day === 1 ? dayOn : p.muted,
    day2Color: day === 2 ? dayOn : p.muted,
    c1: day === 1 ? dayOn : p.muted,
    c2: day === 2 ? dayOn : p.muted,
    pickDay1: () => setDay(1),
    pickDay2: () => setDay(2),
    sharing: sharing ? 'true' : 'false',
    sharePressed: sharing ? 'true' : 'false',
    trackBg: sharing ? trackOn : trackOff,
    knobLeft: sharing ? '24px' : '4px',
    knob: sharing ? '24px' : '4px',
    shareText: sharing ? 'Aai and Aman can follow your route' : 'Off · nobody can see your location',
    toggleShare: () => setSharing(!sharing),
    optLabel: busy ? 'Optimising…' : 'Optimise',
    showToast: toast.show,
    toastKey: toast.key,
    toastText: toast.text,
    optimise: () => {
      if (busy) return;
      setBusy(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const already = day === 1 || flipped;
        if (day === 2) setFlipped(true);
        setBusy(false);
        toast.flash(already ? 'Already the best order for today' : 'Reordered · saves about 25 min of travel');
      }, 900);
    },
  };
  return <Themed classic={PlanView} deccan={DeccanPlanView} v={v} />;
}
