import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors';

/** Last middleware: every error becomes { error: { code, message } } with the right status. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  }
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Request body is not valid JSON' } });
  }
  // Never echo internals (could include tokens or medical data)
  console.error('[API] Unhandled error:', err instanceof Error ? err.message : err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
}

export const notFoundHandler = (_req: Request, res: Response) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API endpoint not found' } });
