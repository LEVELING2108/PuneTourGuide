import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

export const api = () => request(app);

/** Empty every user-owned table (places/routes are left for read tests that seed them). */
export async function resetUsers() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "User", "RefreshToken", "PasswordReset", "OtpCode", "EmergencyContact", "MedicalProfile", "Stamp", "SosEvent", "UserSavedPlace", "ItineraryDay", "ItineraryStop" RESTART IDENTITY CASCADE'
  );
}

let counter = 0;

/** Register a fresh user and return its access token + refresh cookie. */
export async function signUp(overrides: Record<string, unknown> = {}) {
  counter += 1;
  const body = {
    name: 'Sourav',
    email: `user${counter}-${Date.now()}@example.com`,
    password: 'Correct-horse-9',
    acceptTerms: true,
    ...overrides,
  };
  const res = await api().post('/api/v1/auth/register').send(body);
  if (res.status !== 201) throw new Error(`signUp failed: ${res.status} ${JSON.stringify(res.body)}`);
  return {
    token: res.body.data.accessToken as string,
    user: res.body.data.user,
    cookie: res.headers['set-cookie'] as unknown as string[],
    email: body.email,
    password: body.password,
  };
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
