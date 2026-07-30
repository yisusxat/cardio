import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { appointmentService } from '../services/appointment.service';
import { sendSuccess } from '../utils/api-response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  serviceIds: z.array(z.string().uuid()).default([]),
  reason: z.string().optional(),
  slotDuration: z.number().int().positive().default(30),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ]),
});

import { logAuditEvent } from '../utils/audit-logger';

export const appointmentController = {
  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = req.user!;
      let appointments;

      if (role === 'PATIENT') {
        appointments = await appointmentService.getForPatient(userId);
      } else {
        appointments = await appointmentService.getForDoctor(userId);
      }

      sendSuccess(res, appointments);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.create({
        patientId: req.user!.id,
        ...req.body,
      });
      logAuditEvent({
        action: 'APPOINTMENT_CREATE',
        userId: req.user!.id,
        userRole: req.user!.role,
        resourceId: appointment.id,
        status: 'SUCCESS',
        details: { doctorId: req.body.doctorId, date: req.body.date },
        req,
      });
      sendSuccess(res, appointment, 201, 'Appointment created');
    } catch (err) {
      logAuditEvent({
        action: 'APPOINTMENT_CREATE',
        userId: req.user?.id,
        userRole: req.user?.role,
        status: 'FAILED',
        req,
      });
      next(err);
    }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.updateStatus(
        req.params.id,
        req.user!.id,
        req.body.status,
      );
      logAuditEvent({
        action: `APPOINTMENT_STATUS_${req.body.status}`,
        userId: req.user!.id,
        userRole: req.user!.role,
        resourceId: appointment.id,
        status: 'SUCCESS',
        req,
      });
      sendSuccess(res, appointment);
    } catch (err) {
      logAuditEvent({
        action: 'APPOINTMENT_STATUS_UPDATE',
        userId: req.user?.id,
        userRole: req.user?.role,
        resourceId: req.params.id,
        status: 'FAILED',
        req,
      });
      next(err);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await appointmentService.cancelByPatient(req.params.id, req.user!.id);
      logAuditEvent({
        action: 'APPOINTMENT_CANCEL',
        userId: req.user!.id,
        userRole: req.user!.role,
        resourceId: req.params.id,
        status: 'SUCCESS',
        req,
      });
      sendSuccess(res, null, 200, 'Appointment cancelled');
    } catch (err) {
      logAuditEvent({
        action: 'APPOINTMENT_CANCEL',
        userId: req.user?.id,
        userRole: req.user?.role,
        resourceId: req.params.id,
        status: 'FAILED',
        req,
      });
      next(err);
    }
  },
};
