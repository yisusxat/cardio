import { Search, SlidersHorizontal } from 'lucide-react';

interface DoctorFilterProps {
  search: string;
  specialty: string;
  specialties: string[];
  onSearchChange: (searchQuery: string) => void;
  onSpecialtyChange: (specialtyQuery: string) => void;
}

export default function DoctorFilter({
  search,
  specialty,
  specialties,
  onSearchChange,
  onSpecialtyChange,
}: DoctorFilterProps) {
  return (
    <div
      className="rounded-2xl border border-neutral-100 bg-white p-4"
      style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-11"
            id="doctor-search"
          />
        </div>

        {/* Divider */}
        <div className="hidden h-9 w-px bg-neutral-100 sm:block" />

        {/* Specialty select */}
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <select
            value={specialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="input-field w-full appearance-none pl-10 pr-10 sm:w-52"
            id="specialty-filter"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'calc(100% - 14px) center',
            }}
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
