import { describe, expect, it } from 'vitest';
import { byMonth, categoryText, visitDate, type Stamp } from './visited';

const stamp = (placeId: number, category: string, collectedAt: string): Stamp => ({
  placeId,
  name: `Place ${placeId}`,
  nameMr: null,
  category,
  kind: null,
  area: 'Kasba Peth',
  xp: 40,
  estYear: null,
  collectedAt,
});

describe('visited places', () => {
  it('counts categories, most visited first', () => {
    const s = [stamp(1, 'Fort', '2026-10-20T05:00:00Z'), stamp(2, 'Temple', '2026-10-19T05:00:00Z'), stamp(3, 'Fort', '2026-10-01T05:00:00Z')];
    expect(categoryText(s)).toBe('2 forts · 1 temple');
    expect(categoryText([])).toBe('');
  });

  it('groups by month in Pune time', () => {
    // 31 Oct 20:00 UTC is already 1 Nov in Pune
    const s = [stamp(1, 'Fort', '2026-10-31T20:00:00Z'), stamp(2, 'Food', '2026-10-20T05:00:00Z'), stamp(3, 'Museum', '2026-09-03T05:00:00Z')];
    expect(byMonth(s).map((g) => [g.month, g.items.map((x) => x.placeId)])).toEqual([
      ['November 2026', [1]],
      ['October 2026', [2]],
      ['September 2026', [3]],
    ]);
    expect(visitDate('2026-10-31T20:00:00Z')).toBe('1 Nov');
  });
});
