import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Settings } from 'lucide-react';
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
  patient?: {
    firstName: string;
    lastName: string;
  };
  services: { id: string; service: { name: string }; priceAtTime: number }[];
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data ?? []);
    } catch {
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setActionId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success('Estado actualizado correctamente');
      fetchAppointments();
    } catch {
      toast.error('No se pudo actualizar el estado de la cita');
    } finally {
      setActionId(null);
    }
  };

  const pending = appointments.filter((a) => a.status === 'PENDING');
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portal Médico — Dr(a). {user?.lastName}</h1>
            <p className="mt-1 text-sm text-gray-500">Gestión de agenda y consultas activas</p>
          </div>
          <div className="flex gap-3">
            <Link to="/doctor/schedules">
              <Button variant="secondary" size="sm">
                <Clock className="h-4 w-4" /> Horarios
              </Button>
            </Link>
            <Link to="/doctor/services">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4" /> Servicios
              </Button>
            </Link>
          </div>
        </div>

        {/* Doctor Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
                <p className="text-xs text-gray-500">Por confirmar</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{confirmed.length}</p>
                <p className="text-xs text-gray-500">Confirmadas</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
                <p className="text-xs text-gray-500">Atendidos</p>
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
            {/* Pending Requests */}
            {pending.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Solicitudes Pendientes</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pending.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      viewAs="doctor"
                      patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente'}
                      onStatusChange={handleStatusChange}
                      loading={actionId === a.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Schedule */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Agenda Confirmada</h2>
              {confirmed.length === 0 ? (
                <div className="card p-8 text-center text-sm text-gray-500">
                  No hay citas confirmadas pendientes.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {confirmed.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      viewAs="doctor"
                      patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente'}
                      onStatusChange={handleStatusChange}
                      loading={actionId === a.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
