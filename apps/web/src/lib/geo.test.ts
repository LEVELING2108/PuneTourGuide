import { describe, expect, it } from 'vitest';
import { declutter, dotBox, labelBox } from '../components/map/declutter';
import { alongMetres, closestIndex, distText, durText, esc, metres, parseAt, splitLegs, type Pair } from './geo';

const line: Pair[] = [
  [18.5, 73.8],
  [18.501, 73.8],
  [18.502, 73.8],
  [18.503, 73.8],
  [18.504, 73.8],
];

describe('geo', () => {
  it('measures distance in metres', () => {
    expect(Math.round(metres({ lat: 18.5, lng: 73.8 }, { lat: 18.501, lng: 73.8 }))).toBe(111);
  });

  it('finds the closest vertex and the distance along the line', () => {
    expect(closestIndex(line, { lat: 18.5021, lng: 73.8001 })).toBe(2);
    expect(Math.round(alongMetres(line, 1, 3))).toBe(222);
  });

  it('splits a route into legs at each waypoint', () => {
    const legs = splitLegs(line, [
      { lat: 18.5, lng: 73.8 },
      { lat: 18.502, lng: 73.8 },
      { lat: 18.504, lng: 73.8 },
    ]);
    expect(legs).toHaveLength(2);
    expect(legs[0].at(-1)).toEqual(legs[1][0]);
  });

  it('formats distance and time like the mockups', () => {
    expect(distText(648)).toBe('650 m');
    expect(distText(1240)).toBe('1.2 km');
    expect(durText(480)).toBe('8 min');
    expect(durText(3900)).toBe('1 hr 5 min');
  });

  it('escapes names before they go into marker HTML', () => {
    expect(esc('<img src=x onerror=alert(1)> & "Wada"')).toBe('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;Wada&quot;');
  });
});

describe('declutter', () => {
  const at = (lat: number, lng: number, force = false) => ({ lat, lng, force });

  it('drops labels that would overlap one already shown', () => {
    const kept = declutter([at(18.52, 73.85), at(18.5201, 73.8501), at(18.53, 73.87)], 14, () => labelBox('Shaniwar Wada'));
    expect(kept).toHaveLength(2);
  });

  it('always keeps forced markers (you, route stops)', () => {
    const kept = declutter([at(18.52, 73.85, true), at(18.52, 73.85, true), at(18.52, 73.85)], 14, () => dotBox(30));
    expect(kept).toHaveLength(2);
  });
});

describe('parseAt', () => {
  it('reads "lat,lng" and rejects junk', () => {
    expect(parseAt('18.5195,73.8553')).toEqual({ lat: 18.5195, lng: 73.8553 });
    expect(parseAt(null)).toBeNull();
    expect(parseAt('99,73')).toBeNull();
    expect(parseAt('18.5,73.8;drop')).toBeNull();
  });
});
