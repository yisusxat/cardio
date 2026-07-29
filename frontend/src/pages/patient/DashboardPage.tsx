import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle, Plus, ArrowRight,
  Heart, Activity, User, ShieldAlert,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Spinner from '../../components/ui/Spinner';
import RiskCalculatorModal from '../../components/ui/RiskCalculatorModal';
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

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-primary-50 text-primary-700 border-primary-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [riskModalOpen, setRiskModalOpen] = useState(false);

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

  const upcoming = appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED');
  const past = appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-red-glow"
              style={{ background: 'linear-gradient(135deg, #e11d48, #9f1239)' }}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">Panel del Paciente</p>
              <h1 className="font-display text-2xl font-semibold text-neutral-900">
                Hola, {user?.firstName} 👋
              </h1>
              <p className="text-sm text-neutral-400">Bienvenido a tu portal de salud cardiovascular</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setRiskModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Activity className="h-4 w-4" /> Evaluar Mi Riesgo
            </button>
            <Link to="/doctors">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #be123c, #e11d48)',
                  boxShadow: '0 8px 32px -4px rgba(225,29,72,0.4)',
                }}
              >
                <Plus className="h-4 w-4" /> Agendar Cita
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Calendar,
              value: upcoming.length,
              label: 'Citas Próximas',
              color: 'text-primary-600',
              bg: 'bg-primary-50',
            },
            {
              icon: CheckCircle,
              value: completedCount,
              label: 'Consultas Completadas',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              icon: Activity,
              value: appointments.length,
              label: 'Total en Historial',
              color: 'text-neutral-600',
              bg: 'bg-neutral-100',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200"
              style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }}
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5.5 w-5.5 ${s.color}`} style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-xs font-medium text-neutral-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* Upcoming */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary-500 fill-primary-500" />
                  <h2 className="text-base font-semibold text-neutral-900">Próximas Citas</h2>
                  {upcoming.length > 0 && (
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                      {upcoming.length}
                    </span>
                  )}
                </div>
              </div>

              {upcoming.length === 0 ? (
                <div
                  className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                    <Calendar className="h-7 w-7 text-primary-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-700">No tienes citas agendadas</h3>
                  <p className="mt-1 text-xs text-neutral-400">Agenda con uno de nuestros especialistas hoy</p>
                  <Link to="/doctors" className="mt-5">
                    <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors">
                      Ver Especialistas <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
            </section>

            {/* History */}
            {past.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <h2 className="text-base font-semibold text-neutral-900">Historial Reciente</h2>
                  </div>
                  <Link
                    to="/patient/appointments"
                    className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Ver todo <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Timeline list */}
                <div className="flex flex-col gap-3">
                  {past.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-4 transition-all duration-200 hover:border-neutral-200"
                      style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                          <User className="h-5 w-5 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            Dr(a). {a.doctor.user.firstName} {a.doctor.user.lastName}
                          </p>
                          <p className="text-xs text-neutral-400">{a.doctor.specialty} · {a.date}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLOR[a.status] ?? ''}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Risk Calculator Modal */}
      <RiskCalculatorModal isOpen={riskModalOpen} onClose={() => setRiskModalOpen(false)} />
    </PageLayout>
  );
}
