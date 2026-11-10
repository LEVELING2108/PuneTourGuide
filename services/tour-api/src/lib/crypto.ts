import crypto from 'crypto';
import { env } from '../config/env';

export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

/** Uniform random 6-digit code. */
export const randomCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

/** Constant-time comparison of two hex digests. */
export const safeEqualHex = (a: string, b: string) => {
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

const KEY = Buffer.from(env.MEDICAL_ENC_KEY, 'hex');

/** AES-256-GCM. Output: base64(iv | tag | ciphertext). */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
}

export const encryptOptional = (v: string | null | undefined) => (v ? encrypt(v) : null);
export const decryptOptional = (v: string | null | undefined) => (v ? decrypt(v) : null);
