import { describe, expect, it } from 'vitest';
import pino from 'pino';
import { scrub } from '../src/lib/sentry';
import { REDACT_PATHS } from '../src/lib/logger';

describe('error reports', () => {
  it('drop request bodies, headers, cookies, query strings and user details', () => {
    const event = scrub({
      type: undefined,
      request: { method: 'POST', url: 'https://x/api/v1/auth/otp/verify?phone=9876543210', data: { code: '123456' }, headers: { authorization: 'Bearer t' }, cookies: { pe_rt: 'r' } },
      user: { id: '7', email: 'a@b.c', ip_address: '1.2.3.4' },
      extra: { body: 'secret' },
    });
    expect(event.request).toEqual({ method: 'POST', url: 'https://x/api/v1/auth/otp/verify' });
    expect(event.user).toEqual({ id: '7' });
    expect(event.extra).toBeUndefined();
  });
});

describe('log redaction', () => {
  it('replaces secret fields even if something logs them', () => {
    const lines: string[] = [];
    const log = pino(
      { redact: { paths: REDACT_PATHS, censor: '[redacted]' } },
      { write: (l: string) => lines.push(l) }
    );
    log.info({ password: 'p', code: '123456', body: { token: 't' }, req: { headers: { authorization: 'Bearer x' } } }, 'x');
    expect(lines[0]).not.toMatch(/123456|Bearer x|"p"|"t"/);
  });
});

describe('SMS provider settings', () => {
  it('lists every missing DLT template for MSG91', async () => {
    const { smsConfigProblems } = await import('../src/config/env');
    const missing = smsConfigProblems({ SMS_API_KEY: 'k', MSG91_TEMPLATE_SOS: 't1', MSG91_TEMPLATE_OTP: 't2' }, 'msg91');
    expect(missing).toEqual(['MSG91_TEMPLATE_SAFE (DLT template id)', 'MSG91_TEMPLATE_TRIP (DLT template id)', 'MSG91_TEMPLATE_TEST (DLT template id)']);
  });

  it('checks the Twilio key format and sender', async () => {
    const { smsConfigProblems } = await import('../src/config/env');
    expect(smsConfigProblems({ SMS_API_KEY: 'AC123:secret', SMS_SENDER_ID: '+15550001' }, 'twilio')).toEqual([]);
    expect(smsConfigProblems({ SMS_API_KEY: 'nope' }, 'twilio')).toHaveLength(2);
    expect(smsConfigProblems({}, 'console')).toEqual([]);
  });
});
