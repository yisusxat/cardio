import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Mutate to parsed/coerced value
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
