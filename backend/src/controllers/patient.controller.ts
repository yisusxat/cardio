import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/api-response";
import { AuthRequest } from "../middlewares/auth.middleware";
import { NotFoundError } from "../utils/errors";

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

export const patientController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: req.user!.id },
      });
      sendSuccess(res, profile ?? null);
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

      sendSuccess(res, profile, 200, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  },

  async getPatientSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: patientId },
      });
      const user = await prisma.user.findUnique({
        where: { id: patientId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (!user) throw new NotFoundError("Patient");
      sendSuccess(res, { user, profile: profile ?? null });
    } catch (err) {
      next(err);
    }
  },
};
