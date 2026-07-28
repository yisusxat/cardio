export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  INSURANCE = 'INSURANCE',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  specialty: string;
  bio?: string;
  basePrice: number;
  isActive: boolean;
  user: User;
  schedules: Schedule[];
  services: Service[];
}

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Service {
  id: string;
  doctorId: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: AppointmentStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  doctor: Doctor;
  services: AppointmentService[];
}

export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  priceAtTime: number;
  service: Service;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
