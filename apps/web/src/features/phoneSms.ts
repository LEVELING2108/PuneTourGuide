import { API_BASE } from '../api/client';

/**
 * Texts sent from the traveller's own phone (TECH_DESIGN §9.5): the app opens the messaging app with
 * the recipients and the message filled in, and the person taps Send. Free, reaches any number, needs
 * no SMS provider or DLT registration, and works with mobile signal but no data.
 */

/**
 * Server texts (Twilio / MSG91) reach everyone only with a paid, DLT-registered sender. Until then this
 * stays off: phone-number login is hidden and trip shares go from the phone. SOS still asks the server
 * to text as a backup either way.
 */
export const serverSms = () => import.meta.env.VITE_SERVER_SMS === 'true';

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** `sms:` link for one or more numbers. Several recipients use iOS's own form there. */
export function smsHref(phones: string[], body: string, ios = isIos()) {
  const to = phones.map((p) => p.replace(/[^\d+]/g, '')).filter(Boolean);
  const text = encodeURIComponent(body);
  if (ios && to.length > 1) return `sms://open?addresses=${to.join(',')}&body=${text}`;
  // "?&body=" works on both Android and iOS for one number; Android also takes a comma-separated list
  return `sms:${to.join(',')}?&body=${text}`;
}

/** Public live-location page family can open (the same one the server's texts link to; works from the Android app too). */
export function trackLink(sessionId: string) {
  const origin = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : window.location.origin;
  return `${origin}/track/${sessionId}`;
}

const pin = (at: { lat: number; lng: number }) => `https://maps.google.com/?q=${at.lat.toFixed(5)},${at.lng.toFixed(5)}`;

/** Same rule as the server's alert: blood group always, allergies and medicines only if the person allowed it. */
export function medicalSummary(m: { bloodGroup: string | null; allergies: string; medicines: string; showOnLockScreen: boolean } | null | undefined) {
  if (!m) return null;
  const parts: string[] = [];
  if (m.bloodGroup) parts.push(`blood group ${m.bloodGroup}`);
  if (m.showOnLockScreen) {
    if (m.allergies.trim()) parts.push(`allergies: ${m.allergies.trim().slice(0, 80)}`);
    if (m.medicines.trim()) parts.push(`medicines: ${m.medicines.trim().slice(0, 80)}`);
  }
  return parts.length ? parts.join('; ') : null;
}

/**
 * The SOS text, matching the server's: the live link when a session started, a map pin from GPS
 * (GPS needs no data), the nearest hospital and the medical summary.
 */
export function sosText(o: {
  link: string | null;
  at: { lat: number; lng: number } | null;
  hospital?: { name: string; km: number } | null;
  medical?: string | null;
}) {
  return [
    'SOS: I need help now.',
    o.link ? `Live location: ${o.link}` : null,
    o.at ? `Map: ${pin(o.at)}` : 'I could not get my location.',
    o.hospital ? `Nearest hospital: ${o.hospital.name} (${o.hospital.km} km).` : null,
    'Call me, or 112.',
    o.medical ? `Medical: ${o.medical}` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

export const tripText = () => "I'm sharing my live location with you on Pune Explorer. It updates while my sharing is on:";

/** "Send the link yourself": the phone's share sheet (WhatsApp, SMS…), else copy to the clipboard. */
export async function shareTrackLink(sessionId: string): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = trackLink(sessionId);
  const text = tripText();
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Follow my trip', text, url });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled';
    }
  }
  await navigator.clipboard?.writeText(`${text} ${url}`).catch(() => undefined);
  return 'copied';
}

export const testText = () =>
  'TEST - no action needed. I added you as an emergency contact on Pune Explorer. In an emergency I will text you my live location from this number.';
