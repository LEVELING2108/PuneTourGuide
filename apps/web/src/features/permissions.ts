/** Device permission prompts used by the Permissions screen and the SOS flow. */

export const PUNE_CENTRE = { lat: 18.5204, lng: 73.8567 };

export function getPosition(options: PositionOptions = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 60000, ...options });
  });
}

/** Triggers the OS location prompt. Resolves true when granted. */
export async function requestLocation(): Promise<boolean> {
  try {
    const pos = await getPosition({ enableHighAccuracy: false });
    rememberPosition(pos.coords.latitude, pos.coords.longitude);
    return true;
  } catch (err) {
    // A timeout still means permission was granted
    return (err as GeolocationPositionError)?.code === 3;
  }
}

type MotionPermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

/** iOS needs DeviceMotionEvent.requestPermission() from a tap; elsewhere motion is available. */
export async function requestMotion(): Promise<boolean> {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return false;
  const api = window.DeviceMotionEvent as unknown as MotionPermissionApi;
  if (typeof api.requestPermission === 'function') {
    try {
      return (await api.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

const LAST_POS_KEY = 'pe_last_pos';

export function rememberPosition(lat: number, lng: number) {
  try {
    localStorage.setItem(LAST_POS_KEY, JSON.stringify({ lat, lng, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/** Last known fix, or Pune centre (TECH_DESIGN §9.1). */
export function lastPosition(): { lat: number; lng: number; known: boolean } {
  try {
    const raw = localStorage.getItem(LAST_POS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.lat === 'number' && typeof p.lng === 'number') return { lat: p.lat, lng: p.lng, known: true };
    }
  } catch {
    /* ignore */
  }
  return { ...PUNE_CENTRE, known: false };
}
