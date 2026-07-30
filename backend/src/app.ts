import './config/env'; // validate env first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import apiRouter from './routes';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  }),
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(
  '/api',
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  }),
);

// ── Body parsing (1MB Payload Limit for DoS protection) ──────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Frontend static files ─────────────────────────────────────────────────────
const frontendDistPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(frontendDistPath));

// ── SPA fallback: serve index.html for all non-API routes ─────────────────────
app.get('*', (req, res) => {
  // If it looks like an API route not found, return 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Route not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
