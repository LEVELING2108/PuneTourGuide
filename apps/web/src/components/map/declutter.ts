import type { LatLng } from '../../lib/geo';

/** Web-Mercator pixel position at a zoom level (256-px tiles). */
function px(p: LatLng, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const s = Math.sin((p.lat * Math.PI) / 180);
  return { x: ((p.lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale };
}

/**
 * Keep items (already in priority order) whose boxes do not overlap an item kept before them,
 * so labels stay readable at the current zoom. `box` is the marker's footprint in px from its anchor.
 */
export function declutter<T extends LatLng & { force?: boolean }>(items: T[], zoom: number, box: (t: T) => { left: number; right: number; up: number; down: number }, max = Infinity): T[] {
  const kept: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const out: T[] = [];
  for (const it of items) {
    const { x, y } = px(it, zoom);
    const b = box(it);
    const r = { x0: x - b.left, x1: x + b.right, y0: y - b.up, y1: y + b.down };
    // Forced items (you, route stops) always show and claim their space.
    if (!it.force && (out.length >= max || kept.some((k) => r.x0 < k.x1 && r.x1 > k.x0 && r.y0 < k.y1 && r.y1 > k.y0))) continue;
    kept.push(r);
    out.push(it);
  }
  return out;
}

/** Rough label width: 8 px per character of the display serif at 15 px, plus dot and padding. */
export const labelBox = (name: string) => ({ left: 14, right: 26 + name.length * 8, up: 16, down: 16 });
export const dotBox = (size: number) => ({ left: size / 2 + 2, right: size / 2 + 2, up: size / 2 + 2, down: size / 2 + 2 });
