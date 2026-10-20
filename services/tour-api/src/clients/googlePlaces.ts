import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

/**
 * Google Places API (New), server side. The key travels in a header (never a URL, so it can't
 * reach access logs), and errors are rethrown without the request config, which holds the key.
 * Field masks keep each call at the cheapest SKU that has what we show.
 */
export type LatLng = { lat: number; lng: number };
export type GooglePhoto = { name: string; authors: { name: string; uri: string | null }[] };
export type GooglePlace = {
  id: string;
  name: string;
  type: string | null;
  primaryType: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  ratingCount: number | null;
  openNow: boolean | null;
  hours: string[];
  address: string | null;
  mapsUri: string | null;
  photos: GooglePhoto[];
};

export class GoogleApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string
  ) {
    super(`Google Places ${status} ${code}`);
  }
}

const BASE = 'https://places.googleapis.com/v1';
const http = axios.create({ timeout: 8000 });

export const googleConfigured = () => !!env.GOOGLE_MAPS_SERVER_KEY;

async function call<T>(method: 'get' | 'post', url: string, fieldMask: string | null, body?: unknown, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await http.request<T>({
      method,
      url,
      data: body,
      params,
      headers: { 'X-Goog-Api-Key': env.GOOGLE_MAPS_SERVER_KEY ?? '', ...(fieldMask ? { 'X-Goog-FieldMask': fieldMask } : {}) },
    });
    return data;
  } catch (e) {
    const err = e as AxiosError<{ error?: { status?: string } }>;
    throw new GoogleApiError(err.response?.status ?? 0, err.response?.data?.error?.status ?? err.code ?? 'NETWORK');
  }
}

type RawPlace = {
  id: string;
  displayName?: { text: string };
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  formattedAddress?: string;
  googleMapsUri?: string;
  photos?: { name: string; authorAttributions?: { displayName: string; uri?: string }[] }[];
};

const toPlace = (p: RawPlace, maxPhotos: number): GooglePlace => ({
  id: p.id,
  name: p.displayName?.text ?? '',
  type: p.primaryTypeDisplayName?.text ?? null,
  primaryType: p.primaryType ?? null,
  lat: p.location?.latitude ?? null,
  lng: p.location?.longitude ?? null,
  rating: p.rating ?? null,
  ratingCount: p.userRatingCount ?? null,
  openNow: p.currentOpeningHours?.openNow ?? null,
  hours: p.currentOpeningHours?.weekdayDescriptions ?? [],
  address: p.formattedAddress ?? null,
  mapsUri: p.googleMapsUri ?? null,
  photos: (p.photos ?? []).slice(0, maxPhotos).map((ph) => ({
    name: ph.name,
    authors: (ph.authorAttributions ?? []).map((a) => ({ name: a.displayName, uri: a.uri ?? null })),
  })),
});

// Enterprise fields (rating, hours) are what make a spot worth choosing; nothing from Atmosphere (reviews) is asked for.
const SPOT_FIELDS = 'id,displayName,primaryType,primaryTypeDisplayName,location,rating,userRatingCount,currentOpeningHours.openNow,googleMapsUri,photos';
const DETAIL_FIELDS = `${SPOT_FIELDS},currentOpeningHours.weekdayDescriptions,formattedAddress`;

export const googlePlaces = {
  /** Text Search, IDs only (no charge): the Google place for one of ours. */
  async findPlaceId(text: string, near: LatLng): Promise<string | null> {
    const data = await call<{ places?: { id: string }[] }>('post', `${BASE}/places:searchText`, 'places.id', {
      textQuery: text,
      pageSize: 1,
      locationBias: { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 2000 } },
    });
    return data.places?.[0]?.id ?? null;
  },

  /** Place Details (Enterprise): rating, open now, hours, address, photos. */
  async details(id: string, maxPhotos = 3): Promise<GooglePlace> {
    const data = await call<RawPlace>('get', `${BASE}/places/${encodeURIComponent(id)}`, DETAIL_FIELDS, undefined, { languageCode: 'en' });
    return toPlace(data, maxPhotos);
  },

  /** Nearby Search (Enterprise), most popular first. */
  async nearby(at: LatLng, includedTypes: string[], radiusM: number, max = 20): Promise<GooglePlace[]> {
    const data = await call<{ places?: RawPlace[] }>(
      'post',
      `${BASE}/places:searchNearby`,
      SPOT_FIELDS.split(',').map((f) => `places.${f}`).join(','),
      {
        includedTypes,
        maxResultCount: max,
        rankPreference: 'POPULARITY',
        languageCode: 'en',
        locationRestriction: { circle: { center: { latitude: at.lat, longitude: at.lng }, radius: radiusM } },
      }
    );
    return (data.places ?? []).map((p) => toPlace(p, 1));
  },

  /** Short-lived, keyless image URL for a photo (Place Details Photos). */
  async photoUri(photoName: string, maxWidthPx: number): Promise<string> {
    const data = await call<{ photoUri?: string }>('get', `${BASE}/${photoName}/media`, null, undefined, { maxWidthPx, skipHttpRedirect: true });
    if (!data.photoUri) throw new GoogleApiError(502, 'NO_PHOTO');
    return data.photoUri;
  },
};
