import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load services/tour-api/.env regardless of the working directory (src/ or dist/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;

// Secrets that are optional in development become required in production.
const prodRequired = (schema: z.ZodString) => (isProd ? schema : schema.optional());

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  JWT_SECRET: prodRequired(z.string().min(32, 'JWT_SECRET must be at least 32 characters')),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGINS: z.string().optional(),
  APP_URL: z.string().url().default('http://localhost:5050'),
  SAFETY_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  OSRM_URL: z.string().url().default('https://router.project-osrm.org'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  SMS_PROVIDER: z.enum(['console', 'msg91', 'twilio']).default('console'),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Pune Explorer <no-reply@pune-explorer.app>'),
  CLOUDINARY_URL: z.string().optional(),
  MEDICAL_ENC_KEY: prodRequired(z.string().regex(/^[0-9a-f]{64}$/i, 'MEDICAL_ENC_KEY must be 32 bytes hex')),
  WEATHER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Refuse to start with a broken config (TECH_DESIGN §8)
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const DEV_JWT_SECRET = 'pune_explorer_dev_secret_insecure_local_only_0000';
const DEV_MEDICAL_KEY = '0'.repeat(64);

if (!parsed.data.JWT_SECRET && !isTest) {
  console.warn('[env] JWT_SECRET not set; using an insecure development secret.');
}

export const env = {
  ...parsed.data,
  JWT_SECRET: parsed.data.JWT_SECRET ?? DEV_JWT_SECRET,
  MEDICAL_ENC_KEY: parsed.data.MEDICAL_ENC_KEY ?? DEV_MEDICAL_KEY,
  isProd,
  isTest,
};
