import { API_BASE, api } from './client';

/** Live Google Maps data (never stored by the app; the server marks it no-store). */
export type GooglePhoto = { name: string; authors: { name: string; uri: string | null }[] };
export type Unavailable = { available: false; reason: 'not-configured' | 'daily-limit' | 'not-linked' | 'unavailable' };

export type GooglePlaceInfo =
  | { available: true; rating: number | null; ratingCount: number | null; openNow: boolean | null; hours: string[]; mapsUri: string | null; photo: GooglePhoto | null }
  | Unavailable;

export type Spot = {
  googleId: string;
  name: string;
  type: string | null;
  rating: number | null;
  ratingCount: number | null;
  openNow: boolean | null;
  km: number | null;
  photo: GooglePhoto | null;
  mapsUri: string | null;
  visitedAt: string | null;
};

export type SpotDetail = Spot & { photos: GooglePhoto[]; hours: string[]; address: string | null; lat: number | null; lng: number | null; xp: number };

export const googleApi = {
  place: (id: number) => api<GooglePlaceInfo>(`/google/places/${id}`),
  nearby: (id: number) => api<{ available: true; sideQuests: Spot[]; food: Spot[] } | Unavailable>(`/google/places/${id}/nearby`),
  spot: (googleId: string) => api<({ available: true } & SpotDetail) | Unavailable>(`/google/spots/${encodeURIComponent(googleId)}`),
  visitSpot: (googleId: string) =>
    api<{ googleId: string; firstVisit: boolean; xpAwarded: number; totalXp: number; visitedAt: string }>(`/google/spots/${encodeURIComponent(googleId)}/visit`, { method: 'POST' }),
};

/** <img src> for a Google photo: our server redirects to Google's short-lived image URL. */
export const googlePhotoUrl = (photo: GooglePhoto, width: number) =>
  `${API_BASE}/google/photo?name=${encodeURIComponent(photo.name)}&w=${Math.round(width)}`;
