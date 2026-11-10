import type { usersApi } from '../api/auth';

export type Stamp = Awaited<ReturnType<typeof usersApi.stamps>>['stamps'][number];

const PLURAL: Record<string, [string, string]> = {
  Fort: ['fort', 'forts'],
  Temple: ['temple', 'temples'],
  Heritage: ['heritage site', 'heritage sites'],
  Museum: ['museum', 'museums'],
  Nature: ['nature spot', 'nature spots'],
  Food: ['food stop', 'food stops'],
};

/** "3 forts · 2 temples · 1 museum", most visited first. */
export function categoryText(stamps: Stamp[]) {
  const counts = new Map<string, number>();
  stamps.forEach((s) => counts.set(s.category, (counts.get(s.category) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([c, n]) => {
      const [one, many] = PLURAL[c] ?? [c.toLowerCase(), `${c.toLowerCase()}s`];
      return `${n} ${n === 1 ? one : many}`;
    })
    .join(' · ');
}

/** Stamps (newest first) grouped by month in Pune time: [{ month: "October 2026", items }]. */
export function byMonth(stamps: Stamp[]) {
  const fmt = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const groups: { month: string; items: Stamp[] }[] = [];
  stamps.forEach((s) => {
    const month = fmt.format(new Date(s.collectedAt));
    const last = groups[groups.length - 1];
    if (last?.month === month) last.items.push(s);
    else groups.push({ month, items: [s] });
  });
  return groups;
}

/** "12 Oct" in Pune time. */
export const visitDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
