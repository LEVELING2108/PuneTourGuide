import rateLimit from 'express-rate-limit';

// Global API limiter: 300 requests per 15-minute window per IP
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Authentication limiter (login / register): 20 attempts per 15-minute window
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// AI Generation limiter: 10 generation requests per 15-minute window
export const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI itinerary generation limit reached. Please wait a few minutes before trying again.' },
});
