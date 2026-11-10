import { badRequest, conflict, notFound, tooMany } from '../../lib/errors';
import { formatIndian, toE164 } from '../../lib/phone';
import { getCachedData, setCachedData, sharedRedis } from '../../services/cacheService';
import { testSms } from '../notify/messages';
import { enqueueSms } from '../notify/sms.queue';
import { usersRepo } from '../users/users.repository';
import { contactsRepo } from './contacts.repository';

export const MAX_CONTACTS = 5;
const TEST_ALERTS_PER_DAY = 3;

type Row = Awaited<ReturnType<typeof contactsRepo.list>>[number];

/** The owner sees their own contacts' full numbers (they need them to call). */
export const toContactDto = (c: Row) => ({
  id: c.id,
  name: c.name,
  relation: c.relation,
  phone: c.phone,
  phoneDisplay: formatIndian(c.phone),
  isPrimary: c.isPrimary,
});

const phoneOrThrow = (raw: string) => {
  const e164 = toE164(raw);
  if (!e164) throw badRequest('PHONE_INVALID', 'Enter a valid mobile number');
  return e164;
};

/** Atomic per-day counter in Redis (shared by every instance); memory cache when Redis is down. */
async function countToday(key: string) {
  const redis = sharedRedis();
  if (redis) {
    try {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, 26 * 3600);
      return n;
    } catch {
      // fall through
    }
  }
  const n = ((await getCachedData<number>(key)) ?? 0) + 1;
  await setCachedData(key, n, 26 * 3600);
  return n;
}

export const contactsService = {
  async list(userId: number) {
    return (await contactsRepo.list(userId)).map(toContactDto);
  },

  async create(userId: number, input: { name: string; relation: string; phone: string; isPrimary?: boolean }) {
    const phone = phoneOrThrow(input.phone);
    const count = await contactsRepo.count(userId);
    if (count >= MAX_CONTACTS) throw conflict('CONTACT_LIMIT', `You can have up to ${MAX_CONTACTS} emergency contacts`);
    if (await contactsRepo.byPhone(userId, phone)) throw conflict('CONTACT_EXISTS', 'This number is already one of your contacts');
    // The first contact is always the primary one
    const isPrimary = count === 0 || !!input.isPrimary;
    return toContactDto(await contactsRepo.create(userId, { name: input.name, relation: input.relation, phone, isPrimary }));
  },

  async update(userId: number, id: number, input: { name?: string; relation?: string; phone?: string; isPrimary?: boolean }) {
    const current = await contactsRepo.get(userId, id);
    if (!current) throw notFound('CONTACT_NOT_FOUND', 'Contact not found');
    const phone = input.phone !== undefined ? phoneOrThrow(input.phone) : undefined;
    if (phone && phone !== current.phone) {
      const other = await contactsRepo.byPhone(userId, phone);
      if (other && other.id !== id) throw conflict('CONTACT_EXISTS', 'This number is already one of your contacts');
    }
    // Exactly one primary: it can be moved to another contact, not switched off
    if (input.isPrimary === false && current.isPrimary) throw badRequest('PRIMARY_REQUIRED', 'Make another contact primary instead');
    return toContactDto(await contactsRepo.update(userId, id, { ...input, phone }));
  },

  async remove(userId: number, id: number) {
    if (!(await contactsRepo.get(userId, id))) throw notFound('CONTACT_NOT_FOUND', 'Contact not found');
    await contactsRepo.remove(userId, id);
    return { id };
  },

  /** TEST SMS to every contact, at most 3 per user per day (and 3 per IP by the route limiter). */
  async testAlert(userId: number) {
    const contacts = await contactsRepo.list(userId);
    if (!contacts.length) throw conflict('NO_CONTACTS', 'Add an emergency contact first');
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const key = `tour:test-alert:${userId}:${day}`;
    if ((await countToday(key)) > TEST_ALERTS_PER_DAY) throw tooMany('TEST_ALERT_LIMIT', 'You can send 3 test alerts a day');
    const user = await usersRepo.findById(userId);
    await enqueueSms(userId, contacts.map((c) => testSms(c, user?.name ?? '')));
    return { sentTo: contacts.map((c) => c.name) };
  },
};
