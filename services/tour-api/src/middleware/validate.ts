import type { NextFunction, Request, Response } from 'express';
import { z, ZodError, type ZodTypeAny } from 'zod';
import { badRequest } from '../lib/errors';

type Schemas = { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny };

/** Parsed, typed inputs live on res.locals so Express 5's read-only req.query is left alone. */
export type Validated<B = unknown, Q = unknown, P = unknown> = { body: B; query: Q; params: P };

const issues = (err: ZodError) => err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));

/** Validate body / query / params with Zod (unknown body fields rejected via .strict() in schemas). */
export const validate = (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
  const out: Validated = { body: undefined, query: undefined, params: undefined };
  for (const part of ['body', 'query', 'params'] as const) {
    const schema = schemas[part];
    if (!schema) continue;
    const parsed = schema.safeParse(req[part] ?? {});
    if (!parsed.success) {
      return next(badRequest('VALIDATION_FAILED', 'Some fields are missing or invalid', issues(parsed.error)));
    }
    out[part] = parsed.data;
  }
  res.locals.input = out;
  next();
};

export const input = <B = any, Q = any, P = any>(res: Response) => res.locals.input as Validated<B, Q, P>;

export const idParam = z.object({ id: z.coerce.number().int().positive() });
