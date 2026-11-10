/** Clock helpers for itinerary times ("9:30 AM"). Dates are Pune (IST) calendar days. */

export function parseTime(t: string | null | undefined): number | null {
  if (!t) return null;
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3]?.toUpperCase() === 'PM') h += 12;
  if (!m[3] && Number(m[1]) >= 12) h = Number(m[1]);
  return h * 60 + Number(m[2]);
}

export function formatTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${ampm}`;
}

/** Round up to the next 15 minutes. */
export const roundUp15 = (minutes: number) => Math.ceil(minutes / 15) * 15;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Today's date in Pune, as a UTC-midnight Date (matches a DATE column). */
export function puneToday(now = new Date()): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  return new Date(`${ymd}T00:00:00Z`);
}

export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export const weekday = (d: Date) => WEEKDAYS[d.getUTCDay()];

/** "Day 1 · Sat" */
export const dayLabel = (n: number, d: Date) => `Day ${n} · ${weekday(d).slice(0, 3)}`;
