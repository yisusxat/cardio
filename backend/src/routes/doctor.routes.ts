import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  doctorController,
  updateProfileSchema,
  createScheduleSchema,
  createServiceSchema,
  updateServiceSchema,
  availabilityQuerySchema,
} from '../controllers/doctor.controller';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', doctorController.getAll);
router.get('/:id', doctorController.getById);
router.get(
  '/:id/availability',
  validate(availabilityQuerySchema, 'query'),
  doctorController.getAvailability,
);

// ── Doctor-only ───────────────────────────────────────────────────────────────
router.patch(
  '/profile',
  authenticate,
  requireRole(UserRole.DOCTOR),
  validate(updateProfileSchema),
  doctorController.updateProfile,
);

router.post(
  '/schedules',
  authenticate,
  requireRole(UserRole.DOCTOR),
  validate(createScheduleSchema),
  doctorController.createSchedule,
);
router.delete(
  '/schedules/:scheduleId',
  authenticate,
  requireRole(UserRole.DOCTOR),
  doctorController.deleteSchedule,
);

router.post(
  '/services',
  authenticate,
  requireRole(UserRole.DOCTOR),
  validate(createServiceSchema),
  doctorController.createService,
);
router.patch(
  '/services/:serviceId',
  authenticate,
  requireRole(UserRole.DOCTOR),
  validate(updateServiceSchema),
  doctorController.updateService,
);
router.delete(
  '/services/:serviceId',
  authenticate,
  requireRole(UserRole.DOCTOR),
  doctorController.deleteService,
);

export default router;
