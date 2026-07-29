import { prisma } from '../config/prisma';
import { AppointmentStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';

// ── Time helpers ─────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function generateSlots(startTime: string, endTime: string, slotMinutes = 30): string[] {
  const slots: string[] = [];
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (current + slotMinutes <= end) {
    slots.push(toTimeString(current));
    current += slotMinutes;
  }
  return slots;
}

function rangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return toMinutes(start1) < toMinutes(end2) && toMinutes(end1) > toMinutes(start2);
}

// ── Doctor service ────────────────────────────────────────────────────────────

const DOCTOR_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  schedules: { orderBy: { dayOfWeek: 'asc' as const } },
  services: {
    where: { isActive: true },
    orderBy: { name: 'asc' as const },
  },
} as const;

export const doctorService = {
  async getAll() {
    return prisma.doctor.findMany({
      where: { isActive: true },
      include: DOCTOR_INCLUDE,
      orderBy: { user: { firstName: 'asc' } },
    });
  },

  async getById(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: DOCTOR_INCLUDE,
    });
    if (!doctor) throw new NotFoundError('Doctor');
    return doctor;
  },

  async getByUserId(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: DOCTOR_INCLUDE,
    });
    if (!doctor) throw new NotFoundError('Doctor profile');
    return doctor;
  },

  async updateProfile(
    userId: string,
    data: { specialty?: string; bio?: string; basePrice?: number },
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    return prisma.doctor.update({
      where: { id: doctor.id },
      data,
      include: DOCTOR_INCLUDE,
    });
  },

  // ── Availability ────────────────────────────────────────────────────────────

  async getAvailability(doctorId: string, dateStr: string, slotMinutes = 30) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.isActive) throw new NotFoundError('Doctor');

    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0=Sun … 6=Sat

    const schedule = await prisma.schedule.findFirst({
      where: { doctorId, dayOfWeek },
    });

    if (!schedule) return { date: dateStr, dayOfWeek, slots: [] };

    const allSlots = generateSlots(schedule.startTime, schedule.endTime, slotMinutes);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: { not: AppointmentStatus.CANCELLED },
      },
      select: { startTime: true, endTime: true },
    });

    const availableSlots = allSlots.filter((slot) => {
      const slotEnd = toTimeString(toMinutes(slot) + slotMinutes);
      return !existingAppointments.some((appt) =>
        rangesOverlap(slot, slotEnd, appt.startTime, appt.endTime),
      );
    });

    return { date: dateStr, dayOfWeek, scheduleStart: schedule.startTime, scheduleEnd: schedule.endTime, slots: availableSlots };
  },

  // ── Schedules ───────────────────────────────────────────────────────────────

  async createSchedule(
    userId: string,
    data: { dayOfWeek: number; startTime: string; endTime: string },
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    if (toMinutes(data.startTime) >= toMinutes(data.endTime)) {
      throw new ValidationError('startTime must be before endTime');
    }

    return prisma.schedule.create({
      data: { doctorId: doctor.id, ...data },
    });
  },

  async deleteSchedule(userId: string, scheduleId: string) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundError('Schedule');
    if (schedule.doctorId !== doctor.id) throw new ForbiddenError();

    await prisma.schedule.delete({ where: { id: scheduleId } });
  },

  // ── Services ────────────────────────────────────────────────────────────────

  async createService(
    userId: string,
    data: { name: string; description?: string; price: number },
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    return prisma.service.create({
      data: { doctorId: doctor.id, ...data },
    });
  },

  async updateService(
    userId: string,
    serviceId: string,
    data: { name?: string; description?: string; price?: number; isActive?: boolean },
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundError('Service');
    if (service.doctorId !== doctor.id) throw new ForbiddenError();

    return prisma.service.update({ where: { id: serviceId }, data });
  },

  async deleteService(userId: string, serviceId: string) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundError('Doctor profile');

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundError('Service');
    if (service.doctorId !== doctor.id) throw new ForbiddenError();

    // Soft delete
    return prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });
  },
};
