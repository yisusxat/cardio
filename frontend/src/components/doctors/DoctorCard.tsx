import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatPrice, getInitials } from '../../lib/utils';
import Badge from '../ui/Badge';

interface DoctorCardProps {
  doctor: {
    id: string;
    specialty: string;
    bio?: string | null;
    basePrice: number | string;
    user: {
      firstName: string;
      lastName: string;
    };
    schedules: { dayOfWeek: number }[];
    services: { id: string; name: string; price: number | string }[];
  };
}

const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const name = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const initials = getInitials(doctor.user.firstName, doctor.user.lastName);
  const days = [...new Set(doctor.schedules.map((s) => s.dayOfWeek))].sort();

  return (
    <Link
      to={`/doctors/${doctor.id}`}
      className="group card flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-bold text-white shadow-md">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            Dr(a). {name}
          </h3>
          <Badge variant="primary" className="mt-1">{doctor.specialty}</Badge>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <p className="px-5 text-sm text-gray-500 line-clamp-2">{doctor.bio}</p>
      )}

      {/* Services preview */}
      {doctor.services.length > 0 && (
        <div className="mt-3 px-5">
          <div className="flex flex-wrap gap-1.5">
            {doctor.services.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {s.name}
              </span>
            ))}
            {doctor.services.length > 3 && (
              <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                +{doctor.services.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{days.map((d) => DAY_ABBR[d]).join(', ')}</span>
        </div>
        <span className="text-sm font-semibold text-primary-600">
          Desde {formatPrice(Number(doctor.basePrice))}
        </span>
      </div>
    </Link>
  );
}
