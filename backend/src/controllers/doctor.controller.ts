import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { doctorService } from '../services/doctor.service';
import { sendSuccess } from '../utils/api-response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const updateProfileSchema = z.object({
  specialty: z.string().min(1).optional(),
  bio: z.string().optional(),
  basePrice: z.number().positive().optional(),
});

export const createScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  slotDuration: z.string().optional().transform((v) => (v ? Number(v) : 30)),
});

export const doctorController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await doctorService.getAll();
      sendSuccess(res, doctors);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await doctorService.getById(req.params.id);
      sendSuccess(res, doctor);
    } catch (err) {
      next(err);
    }
  },

  async getAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date, slotDuration } = req.query as unknown as { date: string; slotDuration: number };
      const availability = await doctorService.getAvailability(
        req.params.id,
        date,
        slotDuration,
      );
      sendSuccess(res, availability);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await doctorService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, doctor);
    } catch (err) {
      next(err);
    }
  },

  async createSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await doctorService.createSchedule(req.user!.id, req.body);
      sendSuccess(res, schedule, 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await doctorService.deleteSchedule(req.user!.id, req.params.scheduleId);
      sendSuccess(res, null, 200, 'Schedule deleted');
    } catch (err) {
      next(err);
    }
  },

  async createService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await doctorService.createService(req.user!.id, req.body);
      sendSuccess(res, service, 201);
    } catch (err) {
      next(err);
    }
  },

  async updateService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await doctorService.updateService(
        req.user!.id,
        req.params.serviceId,
        req.body,
      );
      sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  },

  async deleteService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await doctorService.deleteService(req.user!.id, req.params.serviceId);
      sendSuccess(res, null, 200, 'Service deactivated');
    } catch (err) {
      next(err);
    }
  },
};
