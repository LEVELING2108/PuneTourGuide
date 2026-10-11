import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env';

/**
 * Structured JSON logs (one line per event) with a request id on every request line.
 * Rules: never log tokens, OTP codes or medical data; mask phone numbers.
 * Request lines carry method, path (no query string) and status only, never bodies or headers.
 */
// Belt and braces: if anything ever logs one of these fields, it is replaced
export const REDACT_PATHS = [
  'password',
  'code',
  'token',
  'refreshToken',
  'accessToken',
  'idToken',
  'credential',
  '*.password',
  '*.code',
  '*.token',
  '*.refreshToken',
  '*.accessToken',
  '*.idToken',
  'headers.authorization',
  'headers.cookie',
  '*.headers.authorization',
  '*.headers.cookie',
  'medical',
  '*.medical',
];

export const logger = pino({
  level: env.LOG_LEVEL ?? (env.isTest ? 'silent' : env.isProd ? 'info' : 'debug'),
  base: { service: 'tour-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: { paths: REDACT_PATHS, censor: '[redacted]' },
  ...(env.isProd || env.isTest
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname,service' } } }),
});

const REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;

/** Path without the query string: queries can hold coordinates or search text. */
const pathOf = (url = '') => url.split('?')[0];

export const httpLogger = pinoHttp({
  logger,
  // Reuse the load balancer's id so one request can be followed across services
  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const incoming = req.headers['x-request-id'];
    const id = typeof incoming === 'string' && REQUEST_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  serializers: {
    req: (req: { id: string; method: string; url: string }) => ({ id: req.id, method: req.method, path: pathOf(req.url) }),
    res: (res: { statusCode: number }) => ({ status: res.statusCode }),
    err: pino.stdSerializers.err,
  },
  customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  // Health checks every few seconds would drown everything else
  autoLogging: { ignore: (req) => pathOf(req.url).startsWith('/api/v1/health') || pathOf(req.url) === '/api/health' },
  quietReqLogger: true,
});

/** Error text safe for logs: the message only (stack in development), never request data. */
export const errText = (err: unknown) => (err instanceof Error ? err.message : String(err));
