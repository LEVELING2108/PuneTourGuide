import { randomUUID } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture every SMS instead of sending it.
vi.mock('../src/clients/sms', async (orig) => ({
  ...(await orig<typeof import('../src/clients/sms')>()),
  sendSms: vi.fn(async () => ({ provider: 'test', providerId: 'p1' })),
  smsProvider: () => 'test',
}));

import { sendSms, SmsError, type Sms } from '../src/clients/sms';
import { encrypt } from '../src/lib/crypto';
import { prisma } from '../src/lib/prisma';
import { invalidateCache } from '../src/services/cacheService';
import { api, auth, resetUsers, signUp } from './helpers';

const sent = vi.mocked(sendSms);
const texts = () => sent.mock.calls.map((c) => c[0] as Sms);

const addContact = (token: string, body: Record<string, unknown>) => api().post('/api/v1/contacts').set(auth(token)).send(body);
const AT = { lat: 18.5195, lng: 73.8553 };

beforeEach(async () => {
  await resetUsers();
  await invalidateCache('tour:*');
  sent.mockClear();
});

describe('emergency contacts', () => {
  it('needs a login', async () => {
    expect((await api().get('/api/v1/contacts')).status).toBe(401);
  });

  it('normalises numbers, makes the first contact primary and keeps exactly one primary', async () => {
    const u = await signUp();
    const a = await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '098765 43210' });
    expect(a.status).toBe(201);
    expect(a.body.data).toMatchObject({ name: 'Aai', phone: '+919876543210', phoneDisplay: '98765 43210', isPrimary: true });

    const b = await addContact(u.token, { name: 'Aman', relation: 'Friend', phone: '+91 91234 56789', isPrimary: true });
    expect(b.body.data.isPrimary).toBe(true);
    const list = await api().get('/api/v1/contacts').set(auth(u.token));
    expect(list.body.data.map((c: { name: string; isPrimary: boolean }) => [c.name, c.isPrimary])).toEqual([
      ['Aman', true],
      ['Aai', false],
    ]);

    // Primary cannot be switched off, only moved
    const off = await api().patch(`/api/v1/contacts/${b.body.data.id}`).set(auth(u.token)).send({ isPrimary: false });
    expect(off.status).toBe(400);

    // Deleting the primary promotes the oldest remaining contact
    await api().delete(`/api/v1/contacts/${b.body.data.id}`).set(auth(u.token));
    const after = await api().get('/api/v1/contacts').set(auth(u.token));
    expect(after.body.data).toHaveLength(1);
    expect(after.body.data[0]).toMatchObject({ name: 'Aai', isPrimary: true });
  });

  it('rejects bad numbers, duplicates and more than five contacts', async () => {
    const u = await signUp();
    expect((await addContact(u.token, { name: 'X', relation: 'Friend', phone: '12345' })).status).toBe(400);
    expect((await addContact(u.token, { name: 'X', relation: 'Boss', phone: '9876543210' })).status).toBe(400);
    for (let i = 0; i < 5; i++) {
      expect((await addContact(u.token, { name: `C${i}`, relation: 'Friend', phone: `98765432${10 + i}` })).status).toBe(201);
    }
    expect((await addContact(u.token, { name: 'Dup', relation: 'Friend', phone: '9876543210' })).status).toBe(409);
    expect((await addContact(u.token, { name: 'Six', relation: 'Friend', phone: '9123456789' })).body.error.code).toBe('CONTACT_LIMIT');
  });

  it('cannot see or change another user’s contacts', async () => {
    const a = await signUp();
    const b = await signUp();
    const c = await addContact(a.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    expect((await api().get('/api/v1/contacts').set(auth(b.token))).body.data).toEqual([]);
    expect((await api().patch(`/api/v1/contacts/${c.body.data.id}`).set(auth(b.token)).send({ name: 'Hacked' })).status).toBe(404);
    expect((await api().delete(`/api/v1/contacts/${c.body.data.id}`).set(auth(b.token))).status).toBe(404);
  });

  it('sends a TEST alert to every contact, at most three a day', async () => {
    const u = await signUp({ name: 'Sourav Suman' });
    expect((await api().post('/api/v1/contacts/test-alert').set(auth(u.token))).status).toBe(409);
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    await addContact(u.token, { name: 'Aman', relation: 'Friend', phone: '9123456789' });

    const r = await api().post('/api/v1/contacts/test-alert').set(auth(u.token));
    expect(r.body.data.sentTo).toEqual(['Aai', 'Aman']);
    expect(texts()).toHaveLength(2);
    expect(texts()[0]).toMatchObject({ kind: 'test', to: '+919876543210' });
    expect(texts()[0].body).toMatch(/^TEST - no action needed\. Sourav added you/);
    const log = await prisma.smsMessage.findMany();
    expect(log.map((l) => [l.kind, l.status, l.toMasked])).toContainEqual(['test', 'sent', '+91 98XXX X210']);

    await api().post('/api/v1/contacts/test-alert').set(auth(u.token));
    await api().post('/api/v1/contacts/test-alert').set(auth(u.token));
    expect((await api().post('/api/v1/contacts/test-alert').set(auth(u.token))).status).toBe(429);
  });
});

describe('SOS', () => {
  const alert = (key: string | null, token?: string, body: Record<string, unknown> = { sessionId: randomUUID(), ...AT }) => {
    const req = api().post('/api/v1/sos/alert');
    if (key) req.set('Idempotency-Key', key);
    if (token) req.set(auth(token));
    return req.send(body);
  };

  it('needs an Idempotency-Key and valid coordinates', async () => {
    expect((await alert(null)).status).toBe(400);
    expect((await alert(randomUUID(), undefined, { sessionId: 'abc', ...AT })).status).toBe(400);
    expect((await alert(randomUUID(), undefined, { sessionId: randomUUID(), lat: 200, lng: 0 })).status).toBe(400);
  });

  it('still alerts contacts when the phone has no GPS fix yet', async () => {
    const u = await signUp();
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    const r = await alert(randomUUID(), u.token, { sessionId: randomUUID() });
    expect(r.status).toBe(201);
    expect(texts()[0].body).toContain('Location pending');
    expect((await alert(randomUUID(), u.token, { sessionId: randomUUID(), lat: 18.5 })).status).toBe(400);
  });

  it('works logged out: records the event, texts nobody', async () => {
    const r = await alert(randomUUID());
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({ contactsAlerted: 0, repeated: false });
    expect(r.body.data.trackUrl).toMatch(/\/track\/[0-9a-f-]{36}$/);
    expect(sent).not.toHaveBeenCalled();
    expect(await prisma.sosEvent.count()).toBe(1);
  });

  it('alerts every contact once, with live link, hospital and permitted medical details', async () => {
    const u = await signUp({ name: 'Sourav Suman' });
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    await addContact(u.token, { name: 'Aman', relation: 'Friend', phone: '9123456789' });
    await prisma.medicalProfile.create({
      data: { userId: u.user.id, bloodGroup: 'B+', allergiesEnc: encrypt('Penicillin'), showOnLockScreen: true },
    });

    const key = randomUUID();
    const sessionId = randomUUID();
    const r = await alert(key, u.token, { sessionId, ...AT });
    expect(r.status).toBe(201);
    expect(r.body.data.contactsAlerted).toBe(2);
    expect(texts()).toHaveLength(2);
    const sms = texts()[0];
    expect(sms.kind).toBe('sos');
    expect(sms.body).toContain(`/track/${sessionId}`);
    expect(sms.body).toContain('maps.google.com/?q=18.51950,73.85530');
    expect(sms.body).toContain('blood group B+; allergies: Penicillin');
    expect(sms.logBody).not.toContain('Penicillin');
    expect(sms.logBody).not.toContain('B+');

    // A retry with the same key (flaky network) never texts again
    const again = await alert(key, u.token, { sessionId, ...AT });
    expect(again.status).toBe(200);
    expect(again.body.data).toMatchObject({ eventId: r.body.data.eventId, repeated: true });
    expect(texts()).toHaveLength(2);

    // Someone else cannot hijack the key
    const other = await signUp();
    expect((await alert(key, other.token, { sessionId, ...AT })).status).toBe(403);
  });

  it('keeps medical details private unless the user allowed it', async () => {
    const u = await signUp();
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    await prisma.medicalProfile.create({ data: { userId: u.user.id, bloodGroup: 'O-', allergiesEnc: encrypt('Peanuts'), showOnLockScreen: false } });
    await alert(randomUUID(), u.token);
    expect(texts()[0].body).toContain('blood group O-');
    expect(texts()[0].body).not.toContain('Peanuts');
  });

  it("I'm safe tells the same contacts once, and only the phone that sent it can cancel", async () => {
    const u = await signUp();
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    const key = randomUUID();
    await alert(key, u.token);
    sent.mockClear();

    const other = await signUp();
    expect((await api().post('/api/v1/sos/cancel').set('Idempotency-Key', key).set(auth(other.token)).send({})).status).toBe(404);

    const c = await api().post('/api/v1/sos/cancel').set('Idempotency-Key', key).set(auth(u.token)).send({});
    expect(c.body.data).toMatchObject({ cancelled: true, contactsTold: 1 });
    expect(texts()[0]).toMatchObject({ kind: 'safe' });
    expect(texts()[0].body).toMatch(/is safe now/);

    const twice = await api().post('/api/v1/sos/cancel').set('Idempotency-Key', key).set(auth(u.token)).send({});
    expect(twice.body.data.contactsTold).toBe(0);
    expect(texts()).toHaveLength(1);
  });
});

describe('live trip sharing', () => {
  it('needs contacts, texts the link once, and stops', async () => {
    const u = await signUp({ name: 'Sourav' });
    const sessionId = randomUUID();
    expect((await api().post('/api/v1/share-trip').set(auth(u.token)).send({ sessionId })).body.error.code).toBe('NO_CONTACTS');

    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    const r = await api().post('/api/v1/share-trip').set(auth(u.token)).send({ sessionId });
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({ contactsNotified: 1, sharedWith: ['Aai'] });
    expect(texts()[0].body).toContain(`/track/${sessionId}`);

    await api().post('/api/v1/share-trip').set(auth(u.token)).send({ sessionId });
    expect(texts()).toHaveLength(1);

    expect((await api().get('/api/v1/share-trip').set(auth(u.token))).body.data.sessionId).toBe(sessionId);
    const stop = await api().delete(`/api/v1/share-trip/${sessionId}`).set(auth(u.token));
    expect(stop.body.data.stopped).toBe(true);
    expect((await api().get('/api/v1/share-trip').set(auth(u.token))).body.data).toBeNull();
  });

  it('says honestly who got the link and who did not', async () => {
    const u = await signUp({ name: 'Sourav' });
    await addContact(u.token, { name: 'Aai', relation: 'Parent', phone: '9876543210' });
    await addContact(u.token, { name: 'Rahul', relation: 'Friend', phone: '9876500000' });
    // e.g. an SMS trial account that only reaches verified numbers
    sent.mockImplementation(async (sms: Sms) => {
      if (sms.to.endsWith('500000')) throw new SmsError('Twilio 21608: unverified number', true);
      return { provider: 'test', providerId: 'p1' };
    });
    const sessionId = randomUUID();
    await api().post('/api/v1/share-trip').set(auth(u.token)).send({ sessionId });
    const res = await api().get(`/api/v1/share-trip/${sessionId}/delivery`).set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body.data.contacts).toEqual(
      expect.arrayContaining([
        { name: 'Aai', status: 'sent' },
        { name: 'Rahul', status: 'failed' },
      ])
    );
    const other = await signUp();
    expect((await api().get(`/api/v1/share-trip/${sessionId}/delivery`).set(auth(other.token))).status).toBe(404);
    sent.mockImplementation(async () => ({ provider: 'test', providerId: 'p1' }));
  });

  it('can leave the texting to the phone: no texts, no contacts needed', async () => {
    const u = await signUp({ name: 'Sourav' });
    const before = texts().length;
    const sessionId = randomUUID();
    const r = await api().post('/api/v1/share-trip').set(auth(u.token)).send({ sessionId, text: false });
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({ sessionId, contactsNotified: 0, sharedWith: [] });
    expect(texts()).toHaveLength(before);
    expect((await api().get('/api/v1/share-trip').set(auth(u.token))).body.data.sessionId).toBe(sessionId);
    expect((await api().get(`/api/v1/share-trip/${sessionId}/delivery`).set(auth(u.token))).body.data.contacts).toEqual([]);
  });

  it('is for logged-in users only', async () => {
    expect((await api().post('/api/v1/share-trip').send({ sessionId: randomUUID() })).status).toBe(401);
  });
});

describe('SOS rate limit', () => {
  it('is per account, so other people on the same IP cannot use up your SOS', async () => {
    const a = await signUp();
    const b = await signUp();
    const fire = (token: string) =>
      api()
        .post('/api/v1/sos/alert')
        .set('X-Test-Rate-Limit', 'on')
        .set('Idempotency-Key', randomUUID())
        .set(auth(token))
        .send({ sessionId: randomUUID(), ...AT });
    for (let i = 0; i < 30; i++) await fire(a.token);
    expect((await fire(a.token)).status).toBe(429);
    expect((await fire(b.token)).status).toBe(201);
  });
});
