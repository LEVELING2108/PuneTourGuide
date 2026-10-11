import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { SharedStore } from './rateLimitStore';

// Global API limiter: 300 requests per 15-minute window per IP in production
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  store: new SharedStore('legacy-api'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Authentication limiter (login / register): 20 attempts per 15-minute window
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: new SharedStore('legacy-auth'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// AI Generation limiter: 10 generation requests per 15-minute window
export const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: new SharedStore('legacy-ai'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProd,
  message: { error: 'AI itinerary generation limit reached. Please wait a few minutes before trying again.' },
});
