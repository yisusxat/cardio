import { Calendar, Clock, User } from 'lucide-react';
import Badge, { appointmentStatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, formatPrice, formatTime } from '../../lib/utils';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  status: string;
  totalAmount: number | string;
  doctor?: {
    user: { firstName: string; lastName: string };
    specialty: string;
  };
  services: { id: string; service: { name: string }; priceAtTime: number | string }[];
}

interface AppointmentCardProps {
  appointment: Appointment;
  viewAs: 'patient' | 'doctor';
  patientName?: string;
  onCancel?: (appointmentId: string) => void;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  loading?: boolean;
}

export default function AppointmentCard({
  appointment: a,
  viewAs,
  patientName,
  onCancel,
  onStatusChange,
  loading,
}: AppointmentCardProps) {
  const { variant, label } = appointmentStatusBadge(a.status);

  return (
    <div className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Date & time */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <Calendar className="h-4 w-4 text-primary-500" />
              {formatDate(a.date)}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatTime(a.startTime)} – {formatTime(a.endTime)}
            </div>
          </div>

          {/* Doctor or patient */}
          {viewAs === 'patient' && a.doctor && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              Dr(a). {a.doctor.user.firstName} {a.doctor.user.lastName}
              <span className="text-gray-400">·</span>
              <span className="text-xs text-gray-500">{a.doctor.specialty}</span>
            </div>
          )}
          {viewAs === 'doctor' && patientName && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" /> Paciente: {patientName}
            </div>
          )}

          {/* Reason */}
          {a.reason && (
            <p className="text-sm text-gray-500">"{a.reason}"</p>
          )}

          {/* Services */}
          {a.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {a.services.map((s) => (
                <span key={s.id} className="rounded-lg bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                  {s.service.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge variant={variant}>{label}</Badge>
          <span className="text-sm font-semibold text-gray-800">{formatPrice(Number(a.totalAmount))}</span>
        </div>
      </div>

      {/* Actions */}
      {(onCancel || onStatusChange) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {viewAs === 'patient' && onCancel && a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              onClick={() => onCancel(a.id)}
            >
              Cancelar
            </Button>
          )}
          {viewAs === 'doctor' && onStatusChange && (
            <>
              {a.status === 'PENDING' && (
                <Button size="sm" loading={loading} onClick={() => onStatusChange(a.id, 'CONFIRMED')}>
                  Confirmar
                </Button>
              )}
              {a.status === 'CONFIRMED' && (
                <Button size="sm" loading={loading} onClick={() => onStatusChange(a.id, 'COMPLETED')}>
                  Completar
                </Button>
              )}
              {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                <Button variant="danger" size="sm" loading={loading} onClick={() => onStatusChange(a.id, 'CANCELLED')}>
                  Cancelar
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
