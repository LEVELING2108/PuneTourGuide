import { tileCredit } from './tiles';

describe('map credit', () => {
  it('names the tile provider its terms require, plus OpenStreetMap', () => {
    const c = tileCredit('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}{r}.png?key=k');
    expect(c).toContain('MapTiler');
    expect(c).toContain('OpenStreetMap');
    expect(tileCredit('https://tile.openstreetmap.org/{z}/{x}/{y}.png')).not.toContain('MapTiler');
  });
  it('lets a configured credit win', () => {
    expect(tileCredit('https://api.maptiler.com/x', 'Custom')).toBe('Custom');
  });
});
