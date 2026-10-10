import type { Sms } from '../../clients/sms';
import { env } from '../../config/env';

export type Recipient = { name: string; phone: string };

const first = (name: string) => name.trim().split(/\s+/)[0] || 'Your contact';
export const trackUrl = (sessionId: string) => `${env.APP_URL.replace(/\/$/, '')}/track/${sessionId}`;
const mapUrl = (lat: number, lng: number) => `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;

const istTime = (d: Date) =>
  new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(d);

/**
 * SOS alert. Medical details (blood group, and a short summary if the user allowed it) go only
 * to the contacts; `logBody` is the same text without them.
 */
export function sosSms(
  to: Recipient,
  from: string,
  at: { lat?: number; lng?: number; sessionId: string },
  hospital: { name: string; km: number } | null,
  medical: string | null
): Sms {
  const who = first(from);
  const parts = [
    `SOS from ${who}: needs help now.`,
    `Live location: ${trackUrl(at.sessionId)}`,
    at.lat !== undefined && at.lng !== undefined ? `Map: ${mapUrl(at.lat, at.lng)}` : 'Location pending: the live link updates once their GPS fixes.',
    hospital ? `Nearest hospital: ${hospital.name} (${hospital.km} km).` : null,
    'Call them, or 112.',
  ].filter(Boolean) as string[];
  const logBody = parts.join(' ');
  return {
    kind: 'sos',
    to: to.phone,
    body: medical ? `${logBody} Medical: ${medical}` : logBody,
    logBody: medical ? `${logBody} Medical: [redacted]` : logBody,
    vars: { name: who, link: trackUrl(at.sessionId), map: at.lat !== undefined && at.lng !== undefined ? mapUrl(at.lat, at.lng) : '', hospital: hospital?.name ?? '', medical: medical ?? '' },
  };
}

export function safeSms(to: Recipient, from: string, startedAt: Date): Sms {
  const who = first(from);
  const body = `${who} is safe now. Please ignore the SOS alert sent at ${istTime(startedAt)}.`;
  return { kind: 'safe', to: to.phone, body, logBody: body, vars: { name: who, time: istTime(startedAt) } };
}

export function tripSms(to: Recipient, from: string, sessionId: string): Sms {
  const who = first(from);
  const body = `${who} is sharing their live trip with you on Pune Explorer: ${trackUrl(sessionId)} (updates while their trip sharing is on).`;
  return { kind: 'trip', to: to.phone, body, logBody: body, vars: { name: who, link: trackUrl(sessionId) } };
}

export function testSms(to: Recipient, from: string): Sms {
  const who = first(from);
  const body = `TEST - no action needed. ${who} added you as an emergency contact on Pune Explorer. In an emergency you will get their live location by SMS.`;
  return { kind: 'test', to: to.phone, body, logBody: body, vars: { name: who } };
}
