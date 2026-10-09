/** Error with an API error code and HTTP status: { error: { code, message } }. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const badRequest = (code: string, message: string, details?: unknown) => new AppError(400, code, message, details);
export const unauthorized = (code = 'UNAUTHORIZED', message = 'Please log in to continue') => new AppError(401, code, message);
export const forbidden = (code = 'FORBIDDEN', message = 'Not allowed') => new AppError(403, code, message);
export const notFound = (code = 'NOT_FOUND', message = 'Not found') => new AppError(404, code, message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const tooMany = (code = 'RATE_LIMITED', message = 'Too many requests, try again later') => new AppError(429, code, message);
