import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/api-response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
});

export const paymentController = {
  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getForUser(req.user!.id, req.user!.role);
      sendSuccess(res, payments);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.create({
        ...req.body,
        requesterId: req.user!.id,
        requesterRole: req.user!.role,
      });
      sendSuccess(res, payment, 201, 'Payment registered');
    } catch (err) {
      next(err);
    }
  },
};
