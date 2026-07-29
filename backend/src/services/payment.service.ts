import { prisma } from '../config/prisma';
import { PaymentMethod, PaymentStatus, UserRole } from '@prisma/client';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export const paymentService = {
  async getForUser(userId: string, role: UserRole) {
    if (role === UserRole.PATIENT) {
      return prisma.payment.findMany({
        where: { appointment: { patientId: userId } },
        include: { appointment: { include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (role === UserRole.DOCTOR) {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');
      return prisma.payment.findMany({
        where: { appointment: { doctorId: doctor.id } },
        include: { appointment: { include: { patient: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return prisma.payment.findMany({
      include: { appointment: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: {
    appointmentId: string;
    amount: number;
    method: PaymentMethod;
    requesterId: string;
    requesterRole: UserRole;
  }) {
    const { appointmentId, amount, method, requesterId, requesterRole } = data;

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundError('Appointment');

    // Only the patient of the appointment (or admin) can register a payment
    if (requesterRole === UserRole.PATIENT && appointment.patientId !== requesterId) {
      throw new ForbiddenError();
    }

    if (amount <= 0) throw new ValidationError('Amount must be positive');

    return prisma.payment.create({
      data: {
        appointmentId,
        amount,
        method,
        status: PaymentStatus.PAID,
      },
    });
  },
};
