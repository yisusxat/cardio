import { Calendar, Clock, User, DollarSign } from 'lucide-react';
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
    <div
      className="flex flex-col rounded-2xl border border-neutral-100 bg-white transition-all duration-200 hover:border-neutral-200 hover:-translate-y-0.5 overflow-hidden"
      style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
    >
      {/* Top accent bar by status */}
      <div
        className="h-1 w-full"
        style={{
          background: a.status === 'PENDING' ? '#fbbf24'
            : a.status === 'CONFIRMED' ? '#e11d48'
            : a.status === 'COMPLETED' ? '#10b981'
            : '#d1d5db',
        }}
      />

      <div className="p-5">
        {/* Header row: date + badge */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Calendar className="h-4 w-4 text-primary-500 flex-shrink-0" />
              {formatDate(a.date)}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              {formatTime(a.startTime)} – {formatTime(a.endTime)}
            </div>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {/* Doctor / Patient info */}
        {viewAs === 'patient' && a.doctor && (
          <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-800">
                Dr(a). {a.doctor.user.firstName} {a.doctor.user.lastName}
              </p>
              <p className="text-xs text-neutral-400">{a.doctor.specialty}</p>
            </div>
          </div>
        )}

        {viewAs === 'doctor' && patientName && (
          <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-200">
              <User className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-400">Paciente</p>
              <p className="truncate text-sm font-semibold text-neutral-800">{patientName}</p>
            </div>
          </div>
        )}

        {/* Reason */}
        {a.reason && (
          <p className="mb-3 text-xs text-neutral-400 italic leading-relaxed line-clamp-2">
            "{a.reason}"
          </p>
        )}

        {/* Services */}
        {a.services.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {a.services.map((s) => (
              <span
                key={s.id}
                className="rounded-lg border border-primary-100 bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700"
              >
                {s.service.name}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
          <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
          {formatPrice(Number(a.totalAmount))}
        </div>
      </div>

      {/* Actions */}
      {(onCancel || onStatusChange) && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3 flex flex-wrap gap-2">
          {viewAs === 'patient' && onCancel && a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
            <Button variant="danger" size="sm" loading={loading} onClick={() => onCancel(a.id)}>
              Cancelar cita
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
