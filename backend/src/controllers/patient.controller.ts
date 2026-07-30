import { Response, NextFunction } from "express";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/api-response";
import { AuthRequest } from "../middlewares/auth.middleware";
import { NotFoundError, ForbiddenError } from "../utils/errors";

const genderEnum = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
const bloodTypeEnum = z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]);
const alcoholEnum = z.enum(["NONE", "OCCASIONAL", "MODERATE", "HEAVY"]);

export const patientProfileSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: genderEnum.optional().nullable(),
  bloodType: bloodTypeEnum.optional().nullable(),
  weightKg: z.number().positive().max(500).optional().nullable(),
  heightCm: z.number().positive().max(300).optional().nullable(),
  allergies: z.string().max(1000).optional().nullable(),
  chronicConditions: z.string().max(1000).optional().nullable(),
  currentMedications: z.string().max(1000).optional().nullable(),
  smoker: z.boolean().optional().nullable(),
  alcoholConsumption: alcoholEnum.optional().nullable(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(20).optional().nullable(),
});

/** Returns formatted unique irreplaceable patient ID */
export function getPatientCode(userId: string): string {
  if (!userId) return "PAT-00000000";
  const clean = userId.replace(/-/g, "").toUpperCase();
  return `PAT-${clean.substring(0, 8)}`;
}

/** Returns true when a patient has the minimum administrative record filled */
export async function hasAdminProfile(patientUserId: string): Promise<boolean> {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientUserId },
    select: { phone: true, dateOfBirth: true, gender: true },
  });
  if (!profile) return false;
  return !!(profile.phone || profile.dateOfBirth || profile.gender);
}

/** Helper to check if a doctor has an active confirmed/completed appointment with a patient */
async function verifyDoctorAccessToPatient(doctorId: string, patientUserId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { userId: doctorId } });
  if (!doctor) throw new ForbiddenError("No posee un perfil médico activo.");

  const hasAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      patientId: patientUserId,
      status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] },
    },
  });

  if (!hasAppointment) {
    throw new ForbiddenError(
      "Solo el médico que posea una cita confirmada con este paciente puede consultar o modificar su ficha."
    );
  }
}

export const patientController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: req.user!.id },
      });
      const patientCode = getPatientCode(req.user!.id);
      sendSuccess(res, profile ? { ...profile, patientCode } : { patientCode });
    } catch (err) {
      next(err);
    }
  },

  async upsertProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = patientProfileSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw new NotFoundError("User");

      const profile = await prisma.patientProfile.upsert({
        where: { userId: req.user!.id },
        create: {
          userId: req.user!.id,
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
        update: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
      });

      const patientCode = getPatientCode(req.user!.id);
      sendSuccess(res, { ...profile, patientCode }, 200, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  },

  async upsertPatientAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "DOCTOR" && req.user!.role !== "ADMIN") {
        throw new ForbiddenError();
      }

      const { patientId } = req.params;
      const patient = await prisma.user.findUnique({ where: { id: patientId } });
      if (!patient) throw new NotFoundError("Patient");

      // Verify doctor has confirmed appointment with this patient (unless admin)
      if (req.user!.role === "DOCTOR") {
        await verifyDoctorAccessToPatient(req.user!.id, patientId);
      }

      const data = patientProfileSchema.parse(req.body);

      const profile = await prisma.patientProfile.upsert({
        where: { userId: patientId },
        create: {
          userId: patientId,
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
        update: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
      });

      const patientCode = getPatientCode(patientId);
      sendSuccess(res, { ...profile, patientCode }, 200, "Patient administrative profile updated");
    } catch (err) {
      next(err);
    }
  },

  async getPatientSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const targetPatientId = String(req.params.patientId || '');

      // Verify doctor access
      if (req.user!.role === "DOCTOR") {
        await verifyDoctorAccessToPatient(req.user!.id, targetPatientId);
      }

      const profile = await prisma.patientProfile.findUnique({
        where: { userId: targetPatientId },
      });
      const user = await prisma.user.findUnique({
        where: { id: targetPatientId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      if (!user) throw new NotFoundError("Patient");

      const patientCode = getPatientCode(targetPatientId);

      sendSuccess(res, {
        user: { ...user, patientCode },
        profile: profile ? { ...profile, patientCode } : null,
      });
    } catch (err) {
      next(err);
    }
  },
};
