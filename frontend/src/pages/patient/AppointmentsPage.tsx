import { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Spinner from '../../components/ui/Spinner';
import api from '../../lib/api';
import { useUIStore } from '../../stores/ui.store';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  status: string;
  totalAmount: number;
  doctor: {
    user: { firstName: string; lastName: string };
    specialty: string;
  };
  services: { id: string; service: { name: string }; priceAtTime: number }[];
}

export default function PatientAppointmentsPage() {
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data ?? []);
    } catch {
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Cita cancelada correctamente');
      fetchAppointments();
    } catch {
      toast.error('No se pudo cancelar la cita');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = appointments.filter((a) => (filter === 'ALL' ? true : a.status === filter));

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Citas Médicas</h1>
            <p className="mt-1 text-sm text-gray-500">Historial completo y gestión de tus consultas</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'PENDING', label: 'Pendientes' },
              { key: 'CONFIRMED', label: 'Confirmadas' },
              { key: 'COMPLETED', label: 'Completadas' },
              { key: 'CANCELLED', label: 'Canceladas' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500">No hay citas registradas en esta categoría.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                viewAs="patient"
                onCancel={handleCancel}
                loading={cancellingId === a.id}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
