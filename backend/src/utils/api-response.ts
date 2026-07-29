import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): Response {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(code ? { code } : {}),
  });
}
