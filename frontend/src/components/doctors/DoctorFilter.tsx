import { Search } from 'lucide-react';

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
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field pl-10"
          id="doctor-search"
        />
      </div>
      <select
        value={specialty}
        onChange={(e) => onSpecialtyChange(e.target.value)}
        className="input-field w-full sm:w-56"
        id="specialty-filter"
      >
        <option value="">Todas las especialidades</option>
        {specialties.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
