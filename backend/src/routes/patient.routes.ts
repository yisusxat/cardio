import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { noCache } from "../middlewares/no-cache.middleware";
import { patientController, patientProfileSchema } from "../controllers/patient.controller";
import { clinicalNoteController } from "../controllers/clinical-note.controller";

const router = Router();

// Patient profile (self)
router.get("/profile", authenticate, noCache, patientController.getProfile);
router.put("/profile", authenticate, validate(patientProfileSchema), patientController.upsertProfile);

// Doctor fills patient administrative profile
router.put("/admin/:patientId", authenticate, validate(patientProfileSchema), patientController.upsertPatientAdmin);

// Doctor accessing patient summary (for appointment view)
router.get("/summary/:patientId", authenticate, noCache, patientController.getPatientSummary);

// Clinical history for patient profile & doctor view
router.get("/history/:patientId", authenticate, noCache, clinicalNoteController.getPatientHistory);

export default router;
