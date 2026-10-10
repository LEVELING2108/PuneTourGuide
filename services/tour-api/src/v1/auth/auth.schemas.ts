import { z } from 'zod';
import { INTERESTS } from '../users/users.schemas';

const email = z.string().trim().toLowerCase().email().max(254);

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    email,
    password: z.string().min(8, 'Use at least 8 characters').max(128),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) }),
    interests: z.array(z.enum(INTERESTS)).optional(),
    theme: z.enum(['classic', 'deccan']).optional(),
    language: z.string().min(2).max(5).optional(),
  })
  .strict();

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) }).strict();

/** Native (Capacitor) clients send the refresh token in the body instead of a cookie. */
export const refreshSchema = z.object({ refreshToken: z.string().min(20).max(200).optional() }).strict();

const password = z.string().min(8, 'Use at least 8 characters').max(128);

export const otpSendSchema = z.object({ phone: z.string().trim().min(10).max(20), channel: z.enum(['sms', 'voice']).default('sms') }).strict();
export const otpVerifySchema = z.object({ phone: z.string().trim().min(10).max(20), code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') }).strict();
export const googleSchema = z.object({ idToken: z.string().min(100).max(5000) }).strict();
export const forgotSchema = z.object({ email }).strict();
export const resetSchema = z.object({ token: z.string().min(20).max(200), password }).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
