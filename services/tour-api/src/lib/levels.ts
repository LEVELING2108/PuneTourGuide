/** XP levels shown on the profile / passport ("Level 4 · Trailblazer", "260 XP to Pathfinder"). */
export const LEVELS = [
  { level: 1, name: 'Newcomer', minXp: 0 },
  { level: 2, name: 'Wanderer', minXp: 250 },
  { level: 3, name: 'Explorer', minXp: 600 },
  { level: 4, name: 'Trailblazer', minXp: 1000 },
  { level: 5, name: 'Pathfinder', minXp: 1500 },
  { level: 6, name: 'Shiledar', minXp: 2200 },
  { level: 7, name: 'Puneri Legend', minXp: 3000 },
] as const;

export function levelFor(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  return {
    level: cur.level,
    levelName: cur.name,
    nextLevelName: next?.name ?? null,
    xpToNext: next ? next.minXp - xp : 0,
    // 0..1 progress through the current level
    progress: next ? (xp - cur.minXp) / (next.minXp - cur.minXp) : 1,
  };
}
