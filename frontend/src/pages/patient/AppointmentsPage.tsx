import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Spinner from '../../components/ui/Spinner';
import ReviewModal from '../../components/ui/ReviewModal';
import api from '../../lib/api';
import { useUIStore } from '../../stores/ui.store';
import AppointmentCard, { Appointment } from '../../components/appointments/AppointmentCard';

type FilterKey = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'CONFIRMED', label: 'Confirmadas' },
  { key: 'COMPLETED', label: 'Completadas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

export default function PatientAppointmentsPage() {
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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

  useEffect(() => { fetchAppointments(); }, []);

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

  const filtered = appointments.filter((a) => filter === 'ALL' || a.status === filter);
  const countFor = (k: FilterKey) => k === 'ALL' ? appointments.length : appointments.filter(a => a.status === k).length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-7">
          <Link
            to="/patient/dashboard"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Panel
          </Link>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">Mis Citas Médicas</h1>
          <p className="mt-1 text-sm text-neutral-400">Historial completo y gestión de tus consultas cardiovasculares</p>
        </div>

        {/* Filter tabs — scrollable on mobile */}
        <div className="mb-7 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => {
              const count = countFor(f.key);
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    background: active ? 'linear-gradient(135deg, #be123c, #e11d48)' : 'white',
                    color: active ? 'white' : '#6b7280',
                    boxShadow: active
                      ? '0 4px 16px -4px rgba(225,29,72,0.4)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                    border: active ? 'none' : '1px solid #f3f4f6',
                  }}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        background: active ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                        color: active ? 'white' : '#6b7280',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
              <Calendar className="h-7 w-7 text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-600">No hay citas en esta categoría</p>
            <p className="mt-1 text-xs text-neutral-400">Prueba con otro filtro o agenda una nueva cita</p>
            <Link to="/doctors" className="mt-5">
              <button className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors">
                Ver Especialistas
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                viewAs="patient"
                onCancel={handleCancel}
                onOpenReview={(app) => { setSelectedAppointment(app); setReviewModalOpen(true); }}
                loading={cancellingId === a.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedAppointment && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => { setReviewModalOpen(false); setSelectedAppointment(null); }}
          doctorName={selectedAppointment.doctor ? `${selectedAppointment.doctor.user.firstName} ${selectedAppointment.doctor.user.lastName}` : 'Especialista'}
          onSubmitted={() => fetchAppointments()}
        />
      )}
    </PageLayout>
  );
}
