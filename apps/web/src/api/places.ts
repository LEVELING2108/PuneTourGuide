import { api, apiWithMeta } from './client';

export type Category = 'Heritage' | 'Temple' | 'Fort' | 'Museum' | 'Nature' | 'Food';

export type PlaceSummary = {
  id: number;
  name: string;
  nameMr: string | null;
  category: Category;
  kind: string | null;
  area: string | null;
  km: number | null;
  hospital: { name: string; km: number | null } | null;
  weakSignal: boolean;
  free: boolean;
  accessible: boolean;
  xp: number;
  hours: string | null;
  openNow: boolean | null;
  entryFee: string | null;
  visitMinutes: number | null;
  lat: number | null;
  lng: number | null;
  curated: boolean;
  isSaved: boolean;
  planStopId: number | null;
  /** When you collected this place's stamp (ISO), or null. */
  visitedAt: string | null;
};

export type PlaceDetail = PlaceSummary & {
  description: string;
  descriptionMr: string | null;
  address: string;
  estYear: string | null;
};

export type PlaceQuery = {
  q?: string;
  category?: string;
  kind?: string;
  near?: string;
  radiusKm?: number;
  openNow?: boolean;
  free?: boolean;
  accessible?: boolean;
  helpWithinKm?: number;
  saved?: boolean;
  limit?: number;
  cursor?: number;
};

export const placesApi = {
  list: (query: PlaceQuery) => apiWithMeta<PlaceSummary[], { nextCursor: number | null }>('/places', { query }),
  count: (query: PlaceQuery) => api<{ count: number }>('/places/count', { query }).then((r) => r.count),
  categories: () => api<Record<string, number>>('/places/categories'),
  get: (id: number, near?: string) => api<PlaceDetail>(`/places/${id}`, { query: { near } }),
  /** "Also nearby" + "Food nearby"; km is from that place. */
  nearby: (id: number) => api<{ places: PlaceSummary[]; food: PlaceSummary[] }>(`/places/${id}/nearby`),
  visit: (id: number) =>
    api<{ placeId: number; stampCollected: boolean; xpAwarded: number; totalXp: number; visitedAt: string }>(`/places/${id}/visit`, { method: 'POST' }),
  save: (id: number) => api<{ isSaved: boolean }>(`/places/${id}/save`, { method: 'PUT' }),
  unsave: (id: number) => api<{ isSaved: boolean }>(`/places/${id}/save`, { method: 'DELETE' }),
};

export const miscApi = {
  weather: () => api<{ tempC: number; condition: string; isRaining: boolean } | null>('/weather'),
  geocode: (q: string) => api<{ name: string; lat: number; lng: number } | null>('/geocode', { query: { q } }),
};
