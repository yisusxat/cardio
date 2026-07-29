import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-neutral-100 bg-white py-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 60% 80% at 100% 50%, rgba(225,29,72,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="section-label mb-5">
            Nuestros especialistas
          </div>
          <h1 className="font-display font-semibold text-neutral-900" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>
            Encuentra el cardiólogo ideal para ti
          </h1>
          <p className="mt-3 text-neutral-500 max-w-lg leading-relaxed">
            Un equipo de especialistas certificados, comprometidos con tu salud cardiovascular.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Filter */}
        <div className="mb-10">
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
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner size="lg" className="text-primary-600" />
            <p className="text-sm text-neutral-400">Cargando especialistas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <Search className="h-6 w-6 text-primary-300" />
            </div>
            <p className="font-medium text-neutral-700">Sin resultados</p>
            <p className="text-sm text-neutral-400">No se encontraron médicos con esos criterios</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-neutral-400">
              {filtered.length} especialista{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => (
                <div key={d.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <DoctorCard doctor={d} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
