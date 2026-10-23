import { api } from './client';

export type SosAlertResult = { eventId: number; contactsAlerted: number; trackUrl: string; repeated: boolean };

export const sosApi = {
  /** keepalive: the request survives the page handing over to the phone dialer. */
  alert: (key: string, body: { sessionId: string; lat?: number; lng?: number; accuracy?: number }) =>
    api<SosAlertResult>('/sos/alert', { body, headers: { 'Idempotency-Key': key }, keepalive: true, noRetry: false }),
  cancel: (key: string) => api<{ cancelled: boolean; contactsTold: number }>('/sos/cancel', { body: {}, headers: { 'Idempotency-Key': key }, keepalive: true }),

  activeTrip: () => api<{ sessionId: string; startedAt: string } | null>('/share-trip'),
  /** text: false = the phone hands the link over itself (no server texts, no contacts needed). */
  startTrip: (sessionId: string, text = true) =>
    api<{ sessionId: string; contactsNotified: number; sharedWith: string[] }>('/share-trip', { body: { sessionId, text } }),
  /** Who really got the live-trip text (an SMS trial only reaches verified numbers). */
  tripDelivery: (sessionId: string) =>
    api<{ sessionId: string; contacts: { name: string; status: 'queued' | 'sent' | 'failed' }[] }>(`/share-trip/${sessionId}/delivery`),
  stopTrip: (sessionId: string) => api<{ stopped: boolean }>(`/share-trip/${sessionId}`, { method: 'DELETE', keepalive: true }),
};
