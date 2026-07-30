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

import { logAuditEvent } from '../utils/audit-logger';

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      logAuditEvent({
        action: 'USER_REGISTER',
        userId: result.user.id,
        userRole: result.user.role,
        status: 'SUCCESS',
        req,
      });
      sendSuccess(res, result, 201, 'Registration successful');
    } catch (err) {
      logAuditEvent({
        action: 'USER_REGISTER',
        status: 'FAILED',
        details: { email: req.body?.email },
        req,
      });
      next(err);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      logAuditEvent({
        action: 'USER_LOGIN',
        userId: result.user.id,
        userRole: result.user.role,
        status: 'SUCCESS',
        req,
      });
      sendSuccess(res, result, 200, 'Login successful');
    } catch (err) {
      logAuditEvent({
        action: 'USER_LOGIN',
        status: 'FAILED',
        details: { email: req.body?.email },
        req,
      });
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

  async logout(req: AuthRequest, res: Response) {
    logAuditEvent({
      action: 'USER_LOGOUT',
      userId: req.user?.id,
      userRole: req.user?.role,
      status: 'SUCCESS',
      req,
    });
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
