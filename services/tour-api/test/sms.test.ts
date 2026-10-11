import { describe, expect, it } from 'vitest';
import { SmsError, twilioError } from '../src/clients/sms';

const axiosError = (status: number, data?: { code?: number; message?: string }) =>
  Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data } });

describe('Twilio errors', () => {
  it('names the reason and stops retrying for a number the trial cannot text', () => {
    const e = twilioError(axiosError(400, { code: 21608, message: 'The number +918070558858 is unverified.' }));
    expect(e).toBeInstanceOf(SmsError);
    expect(e.permanent).toBe(true);
    expect(e.message).toBe('Twilio 21608: number not verified on the trial account');
    expect(e.message).not.toMatch(/\d{6,}/);
  });

  it('masks any phone number in an unknown error', () => {
    const e = twilioError(axiosError(400, { code: 29999, message: 'Something about +91 80705 58858 went wrong' }));
    expect(e.message).toBe('Twilio 29999: Something about [number] went wrong');
    expect(e.permanent).toBe(true);
  });

  it('keeps retrying when Twilio is busy or the network fails', () => {
    expect(twilioError(axiosError(429, { code: 20429, message: 'Too many requests' })).permanent).toBe(false);
    expect(twilioError(axiosError(503)).permanent).toBe(false);
    const net = twilioError(new Error('timeout of 10000ms exceeded'));
    expect(net.permanent).toBe(false);
    expect(net.message).toBe('Twilio network: timeout of 10000ms exceeded');
  });
});
