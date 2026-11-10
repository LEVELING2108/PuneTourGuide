import { decrypt } from '../../lib/crypto';
import { conflict, forbidden, notFound } from '../../lib/errors';
import { maskPhone } from '../../lib/phone';
import { helpRepo } from '../help/help.repository';
import { safeSms, sosSms, trackUrl, tripSms } from '../notify/messages';
import { notifyRepo } from '../notify/notify.repository';
import { enqueueSms } from '../notify/sms.queue';
import { sosRepo } from './sos.repository';

type Sender = NonNullable<Awaited<ReturnType<typeof sosRepo.sender>>>;

/** Blood group always (responders need it fast); allergies and medicines only if the user allowed it. */
function medicalSummary(m: Sender['medical']): string | null {
  if (!m) return null;
  const parts: string[] = [];
  if (m.bloodGroup) parts.push(`blood group ${m.bloodGroup}`);
  if (m.showOnLockScreen) {
    const read = (v: string | null) => {
      try {
        return v ? decrypt(v).trim() : '';
      } catch {
        return '';
      }
    };
    const allergies = read(m.allergiesEnc);
    const medicines = read(m.medicinesEnc);
    if (allergies) parts.push(`allergies: ${allergies.slice(0, 80)}`);
    if (medicines) parts.push(`medicines: ${medicines.slice(0, 80)}`);
  }
  return parts.length ? parts.join('; ') : null;
}

/** Nearest real hospital to the person in trouble (imported OSM data). */
async function nearestHospital(lat: number, lng: number) {
  try {
    const rows = await helpRepo.near(lat, lng, 15, 40);
    const h = rows.find((r) => r.category === 'hospital' && r.emergency) ?? rows.find((r) => r.category === 'hospital');
    return h ? { name: h.name, km: h.km } : null;
  } catch {
    return null;
  }
}

export const sosService = {
  /**
   * SOS at zero (TECH_DESIGN §9.5). Idempotent per key: a retry never texts contacts twice.
   * Guests: the event is recorded, nothing is sent (the phone has already dialled 112).
   */
  async alert(userId: number | null, input: { idempotencyKey: string; sessionId: string; lat?: number; lng?: number }) {
    const existing = await sosRepo.byKey(input.idempotencyKey);
    if (existing) {
      if (existing.userId !== userId) throw forbidden('IDEMPOTENCY_KEY_REUSED', 'This alert belongs to someone else');
      return { eventId: existing.id, contactsAlerted: existing.contactsAlerted, trackUrl: trackUrl(existing.sessionId), repeated: true };
    }
    const { event, created } = await sosRepo.createOnce({ userId, ...input, lat: input.lat ?? null, lng: input.lng ?? null });
    if (!created) return { eventId: event.id, contactsAlerted: event.contactsAlerted, trackUrl: trackUrl(event.sessionId), repeated: true };

    let alerted = 0;
    if (userId) {
      const sender = await sosRepo.sender(userId);
      if (sender?.contacts.length) {
        const hospital = input.lat !== undefined && input.lng !== undefined ? await nearestHospital(input.lat, input.lng) : null;
        const medical = medicalSummary(sender.medical);
        await enqueueSms(
          userId,
          sender.contacts.map((c) => sosSms(c, sender.name, input, hospital, medical))
        );
        alerted = sender.contacts.length;
        await sosRepo.setAlerted(event.id, alerted);
      }
    }
    return { eventId: event.id, contactsAlerted: alerted, trackUrl: trackUrl(input.sessionId), repeated: false };
  },

  /** "I'm safe": closes the event and, if contacts were alerted, tells the same people. */
  async cancel(userId: number | null, idempotencyKey: string) {
    const event = await sosRepo.byKey(idempotencyKey);
    if (!event || event.userId !== userId) throw notFound('SOS_NOT_FOUND', 'No active SOS');
    const first = await sosRepo.cancel(event.id);
    let told = 0;
    if (first && userId && event.contactsAlerted > 0) {
      const sender = await sosRepo.sender(userId);
      if (sender?.contacts.length) {
        await enqueueSms(userId, sender.contacts.map((c) => safeSms(c, sender.name, event.startedAt)));
        told = sender.contacts.length;
      }
    }
    return { eventId: event.id, cancelled: true, contactsTold: told };
  },

  // ── Live trip sharing (TECH_DESIGN §9.6) ───────────────────────
  /** Live trip share. `text` = the server texts the link to every contact; otherwise the phone hands it over. */
  async startTrip(userId: number, sessionId: string, text = true) {
    const sender = await sosRepo.sender(userId);
    const contacts = sender?.contacts ?? [];
    if (text && !contacts.length) throw conflict('NO_CONTACTS', 'Add an emergency contact to share your trip');
    const existing = await sosRepo.tripBySession(userId, sessionId);
    if (existing) return { sessionId, contactsNotified: existing.contactsNotified, sharedWith: contacts.map((c) => c.name) };
    await sosRepo.endTrips(userId); // one live share at a time
    let trip;
    try {
      trip = await sosRepo.createTrip({ userId, sessionId });
    } catch {
      throw conflict('SESSION_TAKEN', 'Start sharing again');
    }
    if (!text || !sender) return { sessionId, contactsNotified: 0, sharedWith: contacts.map((c) => c.name) };
    const logIds = await enqueueSms(userId, contacts.map((c) => tripSms(c, sender.name, sessionId)));
    await sosRepo.setTripNotified(trip.id, contacts.length, logIds);
    return { sessionId, contactsNotified: contacts.length, sharedWith: contacts.map((c) => c.name) };
  },

  /**
   * Who really got the live-trip link: each text's delivery status (queued / sent / failed), so the
   * app never says "shared" when a text did not go (e.g. an SMS trial that only reaches verified numbers).
   */
  async tripDelivery(userId: number, sessionId: string) {
    const trip = await sosRepo.tripBySession(userId, sessionId);
    if (!trip) throw notFound('TRIP_NOT_FOUND', 'That live share was not found');
    const [sender, logs] = await Promise.all([sosRepo.sender(userId), notifyRepo.deliveries(trip.smsLogIds)]);
    const names = new Map((sender?.contacts ?? []).map((c) => [maskPhone(c.phone), c.name]));
    return {
      sessionId,
      contacts: logs.map((l) => ({ name: names.get(l.toMasked) ?? l.toMasked, status: l.status as 'queued' | 'sent' | 'failed' })),
    };
  },

  async stopTrip(userId: number, sessionId: string) {
    const r = await sosRepo.endTrips(userId, sessionId);
    return { sessionId, stopped: r.count > 0 };
  },

  async activeTrip(userId: number) {
    const t = await sosRepo.activeTrip(userId);
    return t ? { sessionId: t.sessionId, startedAt: t.startedAt.toISOString() } : null;
  },
};
