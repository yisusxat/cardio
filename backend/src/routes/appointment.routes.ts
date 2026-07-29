import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  appointmentController,
  createAppointmentSchema,
  updateStatusSchema,
} from '../controllers/appointment.controller';

const router = Router();

// All require authentication
router.use(authenticate);

router.get('/', appointmentController.getMine);

router.post(
  '/',
  requireRole(UserRole.PATIENT),
  validate(createAppointmentSchema),
  appointmentController.create,
);

router.patch(
  '/:id/status',
  requireRole(UserRole.DOCTOR),
  validate(updateStatusSchema),
  appointmentController.updateStatus,
);

router.delete('/:id', requireRole(UserRole.PATIENT), appointmentController.cancel);

export default router;
