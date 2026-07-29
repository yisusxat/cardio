import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
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
    services: { id: string; name: string; price: number | string; isActive?: boolean }[];
  };
}

const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const name = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const initials = getInitials(doctor.user.firstName, doctor.user.lastName);

  // Filter ONLY active services for public display
  const activeServices = doctor.services.filter((s) => s.isActive !== false);

  // Days of week configured
  const days = [...new Set(doctor.schedules.map((s) => s.dayOfWeek))].sort();

  return (
    <Link
      to={`/doctors/${doctor.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-luxury transition-all duration-300 hover:shadow-luxury-md hover:-translate-y-1.5 hover:border-neutral-300/60"
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full flex-shrink-0 transition-all duration-300"
        style={{
          background: 'linear-gradient(90deg, #be123c, #e11d48, #f43f5e)',
          opacity: 0,
        }}
        ref={(el) => {
          if (el) {
            const card = el.closest('.group');
            if (card) {
              const show = () => (el.style.opacity = '1');
              const hide = () => (el.style.opacity = '0');
              card.addEventListener('mouseenter', show);
              card.addEventListener('mouseleave', hide);
            }
          }
        }}
      />

      {/* Card body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-[17px] font-bold text-white shadow-luxury transition-all duration-300 group-hover:shadow-red-glow"
              style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-neutral-900 transition-colors duration-200 group-hover:text-primary-700">
                Dr(a). {name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="primary">{doctor.specialty}</Badge>
              </div>
            </div>
          </div>
          {/* Arrow indicator */}
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-neutral-300 transition-all duration-200 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p className="mt-4 text-sm text-neutral-500 line-clamp-2 leading-relaxed">{doctor.bio}</p>
        )}

        {/* Active Services Only */}
        {activeServices.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeServices.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-primary-50/60 border border-primary-100/80 px-2.5 py-0.5 text-xs font-medium text-primary-700"
              >
                {s.name}
              </span>
            ))}
            {activeServices.length > 3 && (
              <span className="rounded-lg bg-primary-50/60 px-2.5 py-0.5 text-xs font-semibold text-primary-600">
                +{activeServices.length - 3} más
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Schedules & Price */}
      <div className="flex items-center justify-between border-t border-primary-50 bg-primary-50/40 px-6 py-3.5 transition-colors duration-200 group-hover:bg-primary-50">
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
          <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary-600" />
          <span>
            {days.length > 0
              ? days.map((d) => DAY_ABBR[d]).join(', ')
              : 'Consultar horarios'}
          </span>
        </div>
        <span className="text-sm font-bold text-primary-600">
          Desde {formatPrice(Number(doctor.basePrice))}
        </span>
      </div>
    </Link>
  );
}
