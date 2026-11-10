/** "Sourav Suman" → "SS" (avatar placeholder). */
export const initials = (name: string | undefined) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || '?';
