import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  await prisma.payment.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Admin ────────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'admin@cardiocenter.com',
      password: await hash('admin1234'),
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
    },
  });

  // ── Patients ─────────────────────────────────────────────────────────────────
  const patients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'carlos@email.com',
        password: await hash('patient123'),
        firstName: 'Carlos',
        lastName: 'Mendoza',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lucia@email.com',
        password: await hash('patient123'),
        firstName: 'Lucía',
        lastName: 'Fernández',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'roberto@email.com',
        password: await hash('patient123'),
        firstName: 'Roberto',
        lastName: 'Silva',
        role: 'PATIENT',
      },
    }),
  ]);

  // ── Doctors ──────────────────────────────────────────────────────────────────
  const doctorData = [
    {
      email: 'dra.garcia@cardiocenter.com',
      firstName: 'Ana',
      lastName: 'García',
      specialty: 'Cardiología Intervencionista',
      bio: 'Especialista con más de 15 años de experiencia en cardiología intervencionista y cateterismo cardíaco. Graduada de la Universidad Nacional con fellowship en la Clínica Cleveland.',
      basePrice: 150,
      schedules: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '13:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '13:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' },
      ],
      services: [
        { name: 'Consulta General', description: 'Evaluación cardiovascular completa', price: 150 },
        { name: 'Ecocardiograma', description: 'Ultrasonido del corazón', price: 280 },
        { name: 'Holter 24h', description: 'Monitoreo cardíaco por 24 horas', price: 200 },
      ],
    },
    {
      email: 'dr.torres@cardiocenter.com',
      firstName: 'Andrés',
      lastName: 'Torres',
      specialty: 'Electrofisiología Cardíaca',
      bio: 'Cardiólogo electrofisiólogo especializado en arritmias cardíacas y ablación. Más de 10 años de experiencia en el diagnóstico y tratamiento de trastornos del ritmo cardíaco.',
      basePrice: 180,
      schedules: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      ],
      services: [
        { name: 'Consulta de Arritmias', description: 'Evaluación especializada en trastornos del ritmo', price: 180 },
        { name: 'Electrocardiograma', description: 'ECG de 12 derivaciones con interpretación', price: 80 },
        { name: 'Estudio Electrofisiológico', description: 'Evaluación invasiva del sistema eléctrico', price: 500 },
      ],
    },
    {
      email: 'dra.morales@cardiocenter.com',
      firstName: 'Valentina',
      lastName: 'Morales',
      specialty: 'Cardiología Preventiva',
      bio: 'Especialista en cardiología preventiva y medicina del estilo de vida. Apasionada por la prevención de enfermedades cardiovasculares a través de cambios de hábitos y tratamiento temprano.',
      basePrice: 120,
      schedules: [
        { dayOfWeek: 1, startTime: '14:00', endTime: '19:00' },
        { dayOfWeek: 2, startTime: '14:00', endTime: '19:00' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '19:00' },
        { dayOfWeek: 4, startTime: '14:00', endTime: '19:00' },
        { dayOfWeek: 5, startTime: '14:00', endTime: '18:00' },
      ],
      services: [
        { name: 'Consulta Preventiva', description: 'Evaluación de riesgo cardiovascular', price: 120 },
        { name: 'Perfil Lipídico', description: 'Análisis completo de colesterol y triglicéridos', price: 60 },
        { name: 'Prueba de Esfuerzo', description: 'Electrocardiograma de esfuerzo (treadmill)', price: 220 },
      ],
    },
  ];

  const doctors: { id: string; services: { id: string; price: any }[] }[] = [];

  for (const d of doctorData) {
    const userDoc = await prisma.user.create({
      data: {
        email: d.email,
        password: await hash('doctor123'),
        firstName: d.firstName,
        lastName: d.lastName,
        role: 'DOCTOR',
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: userDoc.id,
        specialty: d.specialty,
        bio: d.bio,
        basePrice: d.basePrice,
        schedules: { create: d.schedules },
        services: { create: d.services },
      },
      include: { services: true },
    });

    doctors.push(doctor);
  }

  // ── Appointments ─────────────────────────────────────────────────────────────
  const today = new Date();
  const getDate = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d;
  };

  // Patient 0 appointments with doctor 0
  await prisma.appointment.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      date: getDate(3),
      startTime: '09:00',
      endTime: '09:30',
      reason: 'Control anual de presión arterial',
      status: 'CONFIRMED',
      totalAmount: 150,
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      date: getDate(-30),
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Dolor en el pecho',
      status: 'COMPLETED',
      totalAmount: 430,
      services: {
        create: [
          { serviceId: doctors[0].services[0].id, priceAtTime: doctors[0].services[0].price },
          { serviceId: doctors[0].services[1].id, priceAtTime: doctors[0].services[1].price },
        ],
      },
    },
  });

  // Payment for completed appt
  await prisma.payment.create({
    data: {
      appointmentId: appt2.id,
      amount: 430,
      method: 'CARD',
      status: 'PAID',
    },
  });

  // Patient 1 with doctor 1
  await prisma.appointment.create({
    data: {
      patientId: patients[1].id,
      doctorId: doctors[1].id,
      date: getDate(7),
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Palpitaciones frecuentes',
      status: 'PENDING',
      totalAmount: 180,
    },
  });

  // Patient 2 with doctor 2
  await prisma.appointment.create({
    data: {
      patientId: patients[2].id,
      doctorId: doctors[2].id,
      date: getDate(1),
      startTime: '15:00',
      endTime: '15:30',
      reason: 'Chequeo preventivo, antecedentes familiares',
      status: 'CONFIRMED',
      totalAmount: 120,
    },
  });

  console.log('✅ Seed completed!');
  console.log('\n📋 Demo accounts:');
  console.log('  Admin:    admin@cardiocenter.com    / admin1234');
  console.log('  Paciente: carlos@email.com           / patient123');
  console.log('  Paciente: lucia@email.com            / patient123');
  console.log('  Doctor:   dra.garcia@cardiocenter.com / doctor123');
  console.log('  Doctor:   dr.torres@cardiocenter.com  / doctor123');
  console.log('  Doctor:   dra.morales@cardiocenter.com / doctor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
