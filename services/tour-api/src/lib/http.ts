import type { NextFunction, Request, Response } from 'express';

/** Success envelope: { data, meta? }. */
export const ok = (res: Response, data: unknown, meta?: Record<string, unknown>, status = 200) =>
  res.status(status).json(meta ? { data, meta } : { data });

export const created = (res: Response, data: unknown) => ok(res, data, undefined, 201);

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Express 5 forwards rejected promises, but keep handlers explicit about it. */
export const handle = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
