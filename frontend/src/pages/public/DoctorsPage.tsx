import { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DoctorCard from '../../components/doctors/DoctorCard';
import DoctorFilter from '../../components/doctors/DoctorFilter';
import Spinner from '../../components/ui/Spinner';
import api from '../../lib/api';

interface Doctor {
  id: string;
  specialty: string;
  bio?: string | null;
  basePrice: number;
  user: { firstName: string; lastName: string };
  schedules: { dayOfWeek: number }[];
  services: { id: string; name: string; price: number }[];
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    api.get('/doctors')
      .then((r) => setDoctors(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();

  const filtered = doctors.filter((d) => {
    const name = `${d.user.firstName} ${d.user.lastName}`.toLowerCase();
    const matchSearch =
      !search || name.includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = !specialty || d.specialty === specialty;
    return matchSearch && matchSpecialty;
  });

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nuestros Especialistas</h1>
          <p className="mt-2 text-gray-500">Encuentra el cardiólogo ideal para ti</p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <DoctorFilter
            search={search}
            specialty={specialty}
            specialties={specialties}
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400">No se encontraron médicos con esos criterios</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
