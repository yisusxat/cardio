import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
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

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
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

  const upcoming = appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED');
  const past = appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.firstName} 👋</h1>
            <p className="mt-1 text-sm text-gray-500">Bienvenido a tu panel de salud cardiovascular</p>
          </div>
          <Link to="/doctors">
            <Button>
              <Plus className="h-4 w-4" /> Agendar Nueva Cita
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
                <p className="text-xs text-gray-500">Citas próximas</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((a) => a.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-gray-500">Citas completadas</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                <p className="text-xs text-gray-500">Total historial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Upcoming Section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Próximas Citas</h2>
              {upcoming.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-500">No tienes citas agendadas actualmente.</p>
                  <Link to="/doctors" className="mt-4 inline-block">
                    <Button variant="secondary" size="sm">Explorar Médicos</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((a) => (
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

            {/* Recent History Preview */}
            {past.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Historial Reciente</h2>
                  <Link to="/patient/appointments" className="text-sm font-medium text-primary-600 hover:underline">
                    Ver todo el historial
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {past.slice(0, 3).map((a) => (
                    <AppointmentCard key={a.id} appointment={a} viewAs="patient" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
