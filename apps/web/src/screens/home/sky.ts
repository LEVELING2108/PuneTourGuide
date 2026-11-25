import { useEffect, useState } from 'react';

export type Sky = 'dawn' | 'day' | 'dusk' | 'night' | 'rain';

/** The sky on the Home card: Pune's clock, unless it is raining. */
export function skyAt(hour: number, raining = false): Sky {
  if (raining) return 'rain';
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

export const puneHour = (now = new Date()) =>
  Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(now));

/** Checks the clock every minute, so a Home left open moves from day to dusk by itself. */
export function useSky(raining: boolean | undefined) {
  const [hour, setHour] = useState(() => puneHour());
  useEffect(() => {
    const t = window.setInterval(() => setHour(puneHour()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return skyAt(hour, raining);
}
