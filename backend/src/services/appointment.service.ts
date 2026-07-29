import { prisma } from '../config/prisma';
import { AppointmentStatus, UserRole } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { hasAdminProfile } from '../controllers/patient.controller';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  return `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
}

function rangesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2);
}

const APPOINTMENT_INCLUDE = {
  doctor: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  services: { include: { service: true } },
  payments: true,
} as const;

// Doctor view — always includes patient name + profile (for age)
const DOCTOR_APPOINTMENT_INCLUDE = {
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      patientProfile: {
        select: { dateOfBirth: true },
      },
    },
  },
  services: { include: { service: true } },
  payments: true,
} as const;

export const appointmentService = {
  async getForUser(userId: string, role: UserRole) {
    if (role === UserRole.PATIENT) {
      return prisma.appointment.findMany({
        where: { patientId: userId },
        include: APPOINTMENT_INCLUDE,
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      });
    }

    if (role === UserRole.DOCTOR) {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      return prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: DOCTOR_APPOINTMENT_INCLUDE,
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      });
    }

    // ADMIN: all appointments
    return prisma.appointment.findMany({
      include: APPOINTMENT_INCLUDE,
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    });
  },

  async getForPatient(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: APPOINTMENT_INCLUDE,
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    });
  },

  async getForDoctor(userId: string) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    return prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: DOCTOR_APPOINTMENT_INCLUDE,
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    });
  },

  async create(data: {
    patientId: string;
    doctorId: string;
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:MM
    serviceIds: string[];
    reason?: string;
    slotDuration?: number;
  }) {
    const { patientId, doctorId, date, startTime, serviceIds, reason, slotDuration = 30 } = data;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { services: { where: { isActive: true } } },
    });
    if (!doctor || !doctor.isActive) throw new NotFoundError('Doctor');

    // Validate services belong to this doctor
    const validServices = doctor.services.filter((s) => serviceIds.includes(s.id));
    if (serviceIds.length > 0 && validServices.length !== serviceIds.length) {
      throw new ValidationError('One or more selected services are invalid');
    }

    const endMinutes = toMinutes(startTime) + slotDuration;
    const endTime = toTimeString(endMinutes);

    // Validate against doctor schedule
    const appointmentDate = new Date(date + 'T00:00:00');
    const dayOfWeek = appointmentDate.getDay();
    const schedule = await prisma.schedule.findFirst({ where: { doctorId, dayOfWeek } });
    if (!schedule) throw new ValidationError('Doctor is not available on this day');

    if (
      toMinutes(startTime) < toMinutes(schedule.startTime) ||
      toMinutes(endTime) > toMinutes(schedule.endTime)
    ) {
      throw new ValidationError('Selected time is outside the doctor schedule');
    }

    // Check conflicts
    const existing = await prisma.appointment.findMany({
      where: { doctorId, date: appointmentDate, status: { not: AppointmentStatus.CANCELLED } },
      select: { startTime: true, endTime: true },
    });
    if (existing.some((a) => rangesOverlap(startTime, endTime, a.startTime, a.endTime))) {
      throw new ValidationError('This time slot is already booked');
    }

    const servicesTotal = validServices.reduce((s, svc) => s + Number(svc.price), 0);
    const totalAmount = servicesTotal || Number(doctor.basePrice);

    return prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: appointmentDate,
        startTime,
        endTime,
        reason,
        status: AppointmentStatus.PENDING,
        totalAmount,
        services: {
          create: validServices.map((s) => ({ serviceId: s.id, priceAtTime: s.price })),
        },
      },
      include: APPOINTMENT_INCLUDE,
    });
  },

  async updateStatus(
    appointmentId: string,
    userId: string,
    status: AppointmentStatus,
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.doctorId !== doctor.id) throw new ForbiddenError();

    // When marking as COMPLETED, patient must have an administrative profile filled
    if (status === AppointmentStatus.COMPLETED) {
      const profileOk = await hasAdminProfile(appointment.patientId);
      if (!profileOk) {
        throw new ValidationError(
          'No se puede completar la cita: el paciente no tiene Ficha Administrativa. El doctor debe llenarla primero.',
        );
      }
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: APPOINTMENT_INCLUDE,
    });
  },

  async cancelByPatient(appointmentId: string, patientId: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.patientId !== patientId) throw new ForbiddenError();
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new ValidationError('Cannot cancel a completed appointment');
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });
  },
};
