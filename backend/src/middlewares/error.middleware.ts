import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/api-response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    sendError(res, message, 400, 'VALIDATION_ERROR');
    return;
  }

  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500, 'INTERNAL_ERROR');
}
