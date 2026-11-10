import { api } from './client';

export type LatLng = { lat: number; lng: number };
export type TravelMode = 'walk' | 'auto';

export type RouteStep = {
  type: string;
  modifier: string | null;
  name: string;
  instruction: string;
  distanceM: number;
  durationS: number;
  lat: number;
  lng: number;
};

export type Directions = {
  mode: TravelMode;
  distanceM: number;
  durationS: number;
  /** [lat, lng] pairs */
  geometry: [number, number][];
  legs: { distanceM: number; durationS: number }[];
  steps: RouteStep[];
};

const pt = (p: LatLng) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

export const routingApi = {
  directions: (points: LatLng[], mode: TravelMode, signal?: AbortSignal) =>
    api<Directions>('/directions', {
      query: {
        from: pt(points[0]),
        to: pt(points[points.length - 1]),
        via: points.slice(1, -1).map(pt).join(';') || undefined,
        mode,
      },
      signal,
    }),
};
