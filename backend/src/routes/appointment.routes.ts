import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { noCache } from "../middlewares/no-cache.middleware";
import {
  appointmentController,
  createAppointmentSchema,
  updateStatusSchema,
} from "../controllers/appointment.controller";
import {
  clinicalNoteController,
  clinicalNoteSchema,
} from "../controllers/clinical-note.controller";

const router: Router = Router();

// All require authentication
router.use(authenticate);

router.get("/", appointmentController.getMine);

router.post(
  "/",
  requireRole(UserRole.PATIENT),
  validate(createAppointmentSchema),
  appointmentController.create
);

router.patch(
  "/:id/status",
  requireRole(UserRole.DOCTOR),
  validate(updateStatusSchema),
  appointmentController.updateStatus
);

router.delete("/:id", requireRole(UserRole.PATIENT), appointmentController.cancel);

// Clinical note routes
router.get("/:id/clinical-note", noCache, clinicalNoteController.getForAppointment);
router.post(
  "/:id/clinical-note",
  requireRole(UserRole.DOCTOR),
  validate(clinicalNoteSchema),
  clinicalNoteController.upsertForAppointment
);

export default router;
