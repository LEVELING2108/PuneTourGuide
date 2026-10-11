import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { maskPhone } from '../lib/phone';

export type SmsKind = 'sos' | 'safe' | 'trip' | 'test' | 'otp';

export type Sms = {
  kind: SmsKind;
  /** E.164 */
  to: string;
  body: string;
  /** The same text with medical details removed; the only version that may reach a log. */
  logBody: string;
  /** Template variables for providers that need registered templates (India DLT via MSG91). */
  vars: Record<string, string>;
};

export type SendResult = { provider: string; providerId: string | null };

const http = axios.create({ timeout: 10_000 });

/** Development: print instead of sending. Phone masked; medical text never printed. */
async function sendConsole(sms: Sms): Promise<SendResult> {
  logger.info({ kind: sms.kind, to: maskPhone(sms.to) }, `sms (console): ${sms.logBody}`);
  return { provider: 'console', providerId: null };
}

/** Twilio Messages API. SMS_API_KEY = "AccountSid:AuthToken", SMS_SENDER_ID = sender number. */
async function sendTwilio(sms: Sms): Promise<SendResult> {
  const [sid, token] = (env.SMS_API_KEY ?? '').split(':');
  const { data } = await http.post(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    new URLSearchParams({ To: sms.to, From: env.SMS_SENDER_ID ?? '', Body: sms.body }).toString(),
    { auth: { username: sid, password: token }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return { provider: 'twilio', providerId: data?.sid ?? null };
}

/**
 * MSG91 Flow API. Indian carriers only deliver DLT-registered templates, so each kind has its own
 * template id (MSG91_TEMPLATE_SOS / _SAFE / _TRIP / _TEST) using the variables in `sms.vars`.
 */
async function sendMsg91(sms: Sms): Promise<SendResult> {
  const templateId = process.env[`MSG91_TEMPLATE_${sms.kind.toUpperCase()}`];
  if (!templateId) throw new Error(`MSG91_TEMPLATE_${sms.kind.toUpperCase()} is not set`);
  const { data } = await http.post(
    'https://control.msg91.com/api/v5/flow/',
    { template_id: templateId, short_url: '0', recipients: [{ mobiles: sms.to.replace('+', ''), ...sms.vars }] },
    { headers: { authkey: env.SMS_API_KEY ?? '', 'Content-Type': 'application/json' } }
  );
  if (data?.type === 'error') throw new Error(`MSG91: ${data.message ?? 'rejected'}`);
  return { provider: 'msg91', providerId: data?.request_id ?? data?.message ?? null };
}

/** Console unless a real provider and its key are configured. */
export const smsProvider = () => (env.SMS_PROVIDER !== 'console' && env.SMS_API_KEY ? env.SMS_PROVIDER : 'console');

export function sendSms(sms: Sms): Promise<SendResult> {
  switch (smsProvider()) {
    case 'twilio':
      return sendTwilio(sms);
    case 'msg91':
      return sendMsg91(sms);
    default:
      return sendConsole(sms);
  }
}

if (env.isProd && smsProvider() === 'console') {
  logger.error('No SMS provider configured in production: SOS alerts to contacts will NOT be delivered. Set SMS_PROVIDER and SMS_API_KEY.');
}

/**
 * "Call me" for login codes: a voice call that reads the code twice (Twilio). Other providers
 * report it as unavailable so the app sends the SMS instead; console mode just logs the call.
 */
export async function callWithCode(to: string, code: string): Promise<'voice' | 'unavailable'> {
  const provider = smsProvider();
  if (provider === 'console') {
    logger.info({ to: maskPhone(to) }, 'voice call (console): login code');
    return 'voice';
  }
  if (provider !== 'twilio') return 'unavailable';
  const [sid, token] = (env.SMS_API_KEY ?? '').split(':');
  const digits = code.split('').join(', ');
  const twiml = `<Response><Say voice="alice" language="en-IN">Your Pune Explorer code is ${digits}. Again: ${digits}.</Say></Response>`;
  await http.post(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,
    new URLSearchParams({ To: to, From: env.SMS_SENDER_ID ?? '', Twiml: twiml }).toString(),
    { auth: { username: sid, password: token }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return 'voice';
}
