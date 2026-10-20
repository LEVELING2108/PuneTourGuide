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
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  APP_URL: z.string().url().default('http://localhost:5050'),
  SAFETY_SERVICE_URL: z.string().url().default('http://localhost:8010'),
  OSRM_URL: z.string().url().default('https://router.project-osrm.org'),
  OSRM_FOOT_URL: z.string().url().default('https://routing.openstreetmap.de/routed-foot'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  // Google Maps Platform, server side only (Places API (New) + Routes API). Unset = Google features off.
  GOOGLE_MAPS_SERVER_KEY: z.string().optional(),
  // Most Google calls per kind per day (Pune time), across all instances. Keeps spend inside the free monthly amounts.
  GOOGLE_DAILY_CAPS: z.string().default('details=230,nearby=230,photo=300'),
  SMS_PROVIDER: z.enum(['console', 'msg91', 'twilio']).default('console'),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Pune Explorer <no-reply@pune-explorer.app>'),
  CLOUDINARY_URL: z.string().optional(),
  MEDICAL_ENC_KEY: prodRequired(z.string().regex(/^[0-9a-f]{64}$/i, 'MEDICAL_ENC_KEY must be 32 bytes hex')),
  WEATHER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ENVIRONMENT: z.string().optional(),
  // Release tag for error reports: set by CI, or Render's commit variable
  SENTRY_RELEASE: z.string().optional(),
  RENDER_GIT_COMMIT: z.string().optional(),
  // Public origin of the safety service when it is not served under /safety on the app's domain
  SAFETY_PUBLIC_URL: z.string().url().optional().or(z.literal('')),
  // Map tile hosts the page may load from (CSP), comma-separated. Must match VITE_MAP_TILE_URL.
  MAP_TILE_ORIGINS: z
    .string()
    .default('https://tile.openstreetmap.org,https://*.tile.openstreetmap.org,https://*.basemaps.cartocdn.com,https://api.maptiler.com'),
});

// A blank line in an env file (KEY=) means "not set": use the default instead of failing validation
const definedEnv = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v.trim() !== ''));
const parsed = EnvSchema.safeParse(definedEnv);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Refuse to start with a broken config (TECH_DESIGN §8)
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

/**
 * A half-configured SMS provider only fails when an SOS is sent, which is the worst moment to
 * find out. In production, refuse to start instead.
 */
export function smsConfigProblems(e: Record<string, string | undefined>, provider: string): string[] {
  if (provider === 'msg91') {
    const kinds = ['SOS', 'SAFE', 'TRIP', 'TEST', 'OTP'];
    return [
      ...(e.SMS_API_KEY ? [] : ['SMS_API_KEY (MSG91 auth key)']),
      ...kinds.filter((k) => !e[`MSG91_TEMPLATE_${k}`]).map((k) => `MSG91_TEMPLATE_${k} (DLT template id)`),
    ];
  }
  if (provider === 'twilio') {
    return [
      ...(/^AC\w+:\w+$/.test(e.SMS_API_KEY ?? '') ? [] : ['SMS_API_KEY ("AccountSid:AuthToken")']),
      ...(e.SMS_SENDER_ID ? [] : ['SMS_SENDER_ID (Twilio number)']),
    ];
  }
  return [];
}

if (isProd) {
  const missing = smsConfigProblems(process.env, parsed.data.SMS_PROVIDER);
  if (missing.length) throw new Error(`SMS_PROVIDER=${parsed.data.SMS_PROVIDER} is missing:\n${missing.map((m) => `  - ${m}`).join('\n')}`);
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
