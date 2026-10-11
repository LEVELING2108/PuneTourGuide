import { cleanUrl, scrubEvent } from './monitoring';

describe('crash reports', () => {
  it('strip reset tokens, tracking ids and contact ids from URLs', () => {
    expect(cleanUrl('https://app/reset?token=abc#x')).toBe('https://app/reset');
    expect(cleanUrl('https://app/track/9f1c2e7a-1111')).toBe('https://app/track/:id');
    expect(cleanUrl('/settings/contacts/42')).toBe('/settings/contacts/:id');
  });

  it('drop request data and user details', () => {
    const e = scrubEvent({ request: { url: '/otp?phone=98', headers: { a: 1 }, data: 'x' }, user: { ip_address: '1.2.3.4' }, extra: { y: 1 } });
    expect(e).toEqual({ request: { url: '/otp' } });
  });
});
