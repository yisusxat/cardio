import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { patientController, patientProfileSchema } from "../controllers/patient.controller";

const router = Router();

// Patient profile (self)
router.get("/profile", authenticate, patientController.getProfile);
router.put("/profile", authenticate, validate(patientProfileSchema), patientController.upsertProfile);

// Doctor accessing patient summary (for appointment view)
router.get("/summary/:patientId", authenticate, patientController.getPatientSummary);

export default router;
