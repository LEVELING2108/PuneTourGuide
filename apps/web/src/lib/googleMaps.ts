/**
 * Hand-off to Google Maps through its public URL scheme (no API key, no cost). On Android
 * these open the Google Maps app; elsewhere, maps.google.com. The app's own map stays on
 * OpenStreetMap data (MapTiler tiles, OSRM routes) so offline packs and both themes keep working.
 * https://developers.google.com/maps/documentation/urls/get-started
 */
import type { TravelMode } from '../api/routing';

/** The place's Google listing (reviews, photos, busy times), searched by name in Pune. */
export function googlePlaceUrl(place: { name: string; area?: string | null; lat?: number | null; lng?: number | null }) {
  const query = [place.name, place.area, 'Pune'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Turn-by-turn in Google Maps with voice and live traffic, starting from where the phone is.
 * An auto-rickshaw follows car roads, so Auto maps to driving.
 */
export function googleDirectionsUrl(dest: { lat: number; lng: number }, mode: TravelMode) {
  const travelmode = mode === 'walk' ? 'walking' : 'driving';
  return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat.toFixed(6)},${dest.lng.toFixed(6)}&travelmode=${travelmode}`;
}
