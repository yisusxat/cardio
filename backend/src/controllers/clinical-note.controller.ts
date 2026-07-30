import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/api-response";
import { AuthRequest } from "../middlewares/auth.middleware";
import { NotFoundError, ForbiddenError } from "../utils/errors";

export const clinicalNoteSchema = z.object({
  bpRead: z.string().max(20).optional().nullable(),
  heartRate: z.string().max(20).optional().nullable(),
  diagnosis: z.string().min(1, "El diagnóstico es obligatorio").max(1000),
  treatment: z.string().min(1, "El tratamiento es obligatorio").max(2000),
  notes: z.string().max(2000).optional().nullable(),
});

export const clinicalNoteController = {
  /** Doctor creates or updates a clinical note for an appointment */
  async upsertForAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: appointmentId } = req.params;
      const data = clinicalNoteSchema.parse(req.body);

      // Verify appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true },
      });
      if (!appointment) throw new NotFoundError("Appointment");

      // Verify logged in user is the doctor for this appointment (or admin)
      if (req.user!.role === "DOCTOR" && appointment.doctor.userId !== req.user!.id) {
        throw new ForbiddenError("Solo el médico de la cita puede emitir su ficha clínica.");
      }

      const note = await prisma.clinicalNote.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          bpRead: data.bpRead || null,
          heartRate: data.heartRate || null,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          notes: data.notes || null,
        },
        update: {
          bpRead: data.bpRead || null,
          heartRate: data.heartRate || null,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          notes: data.notes || null,
        },
      });

      sendSuccess(res, note, 200, "Ficha clínica guardada exitosamente");
    } catch (err) {
      next(err);
    }
  },

  /** Get clinical note for a specific appointment */
  async getForAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const targetAppointmentId = String(req.params.id || '');
      const note = await prisma.clinicalNote.findUnique({
        where: { appointmentId: targetAppointmentId },
        include: {
          doctor: {
            select: {
              specialty: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });
      sendSuccess(res, note ?? null);
    } catch (err) {
      next(err);
    }
  },

  /** Get complete clinical history for a patient */
  async getPatientHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const targetId = String(req.params.id || '');

      // Patients can see their own history. Doctors can see history if authorized.
      if (req.user!.role === "PATIENT" && req.user!.id !== targetId) {
        throw new ForbiddenError();
      }

      if (req.user!.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.id } });
        if (!doctor) throw new ForbiddenError();

        // Check active appointment between doctor and patient
        const appointment = await prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            patientId: targetId,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
        });
        if (!appointment) {
          throw new ForbiddenError("No tiene una cita activa con este paciente para acceder a su historial.");
        }
      }

      const notes = await prisma.clinicalNote.findMany({
        where: { patientId: targetId },
        include: {
          appointment: { select: { date: true, startTime: true, endTime: true, reason: true } },
          doctor: {
            select: {
              specialty: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      sendSuccess(res, notes);
    } catch (err) {
      next(err);
    }
  },
};
