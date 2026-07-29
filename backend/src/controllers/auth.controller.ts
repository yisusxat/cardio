import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 201, 'Registration successful');
    } catch (err) {
      next(err);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 200, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: AuthRequest, res: Response) {
    // Stateless JWT — client removes tokens; server just confirms
    sendSuccess(res, null, 200, 'Logged out successfully');
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },
};
