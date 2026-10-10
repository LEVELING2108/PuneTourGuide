import axios from 'axios';
import { env } from '../config/env';

export type Email = { to: string; subject: string; text: string; html: string };

/** user@example.com → u•••@example.com (logs never hold full addresses). */
export const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, '$1•••$2');

export const emailProvider = () => (env.EMAIL_API_KEY ? 'resend' : 'console');

/**
 * Resend (https://resend.com) when EMAIL_API_KEY is set; otherwise development console mode,
 * which prints only the recipient and subject: the body can hold a reset link (a secret).
 */
export async function sendEmail(mail: Email): Promise<void> {
  if (emailProvider() === 'console') {
    console.log(`[email:console] → ${maskEmail(mail.to)}: ${mail.subject}`);
    return;
  }
  await axios.post(
    'https://api.resend.com/emails',
    { from: env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html },
    { headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}` }, timeout: 10_000 }
  );
}

if (env.isProd && emailProvider() === 'console') {
  console.error('[email] No email provider configured in production: password-reset emails will NOT be delivered. Set EMAIL_API_KEY.');
}
