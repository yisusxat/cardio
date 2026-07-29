import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((v) => Number(v)),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32).default('super-secret-default-jwt-token-cardiocenter-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('12')
    .transform((v) => Number(v)),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000')
    .transform((v) => Number(v)),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .default('100')
    .transform((v) => Number(v)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
