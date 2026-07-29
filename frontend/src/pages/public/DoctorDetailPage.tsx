import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BookingWizard from '../../components/appointments/BookingWizard';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, getDayName, getInitials } from '../../lib/utils';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';

interface Doctor {
  id: string;
  specialty: string;
  bio?: string | null;
  basePrice: number;
  isActive: boolean;
  user: { id: string; firstName: string; lastName: string; email: string };
  schedules: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  services: { id: string; name: string; description?: string | null; price: number; isActive: boolean }[];
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/doctors/${id}`)
      .then((r) => setDoctor(r.data.data))
      .catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spinner size="lg" className="text-primary-600" />
          <p className="text-sm text-neutral-400">Cargando especialista...</p>
        </div>
      </PageLayout>
    );
  }

  if (!doctor) return null;

  const name = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const initials = getInitials(doctor.user.firstName, doctor.user.lastName);
  const activeServices = doctor.services.filter((s) => s.isActive);

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    setBookingOpen(true);
  };

  return (
    <PageLayout>
      {/* Page header strip */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-medium text-neutral-500 transition-all duration-200 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Volver a especialistas
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Sidebar ───────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Profile card */}
            <div className="card p-7 text-center">
              {/* Avatar */}
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl text-2xl font-bold text-white shadow-red-glow"
                style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)' }}
              >
                {initials}
              </div>

              {/* Name & specialty */}
              <h1 className="mt-5 text-xl font-bold text-neutral-900">Dr(a). {name}</h1>
              <div className="mt-2 flex justify-center">
                <Badge variant="primary">{doctor.specialty}</Badge>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <p className="mt-5 text-sm leading-relaxed text-neutral-500 text-left border-t border-neutral-100 pt-5">
                  {doctor.bio}
                </p>
              )}

              {/* Price */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100/60 px-4 py-3.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-600">
                  <DollarSign className="h-4 w-4 text-primary-500" />
                  Consulta desde
                </div>
                <span className="font-bold text-primary-700 text-base">
                  {formatPrice(Number(doctor.basePrice))}
                </span>
              </div>

              {/* CTA */}
              {(isPatient || !isAuthenticated) && (
                <button
                  onClick={handleBook}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
                    boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.35)',
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Agendar Cita
                </button>
              )}
            </div>

            {/* Schedule card */}
            <div className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50">
                  <Clock className="h-3.5 w-3.5 text-primary-600" />
                </div>
                Horarios de Atención
              </h2>
              {doctor.schedules.length === 0 ? (
                <p className="text-sm text-neutral-400">Sin horarios disponibles</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {doctor.schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-700">{getDayName(s.dayOfWeek)}</span>
                      <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-500">
                        {s.startTime} – {s.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Main content ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="card p-7">
              <h2 className="mb-6 text-lg font-semibold text-neutral-900">Servicios Disponibles</h2>

              {activeServices.length === 0 ? (
                <p className="text-sm text-neutral-400">No hay servicios registrados</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeServices.map((s) => (
                    <div
                      key={s.id}
                      className="group relative overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all duration-200 hover:border-primary-200/60 hover:bg-white hover:shadow-luxury"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                            {s.description && (
                              <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">{s.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-sm font-bold text-primary-600">
                          {formatPrice(Number(s.price))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom CTA inside content */}
              {(isPatient || !isAuthenticated) && (
                <div className="mt-8 flex justify-end border-t border-neutral-100 pt-6">
                  <button
                    onClick={handleBook}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
                      boxShadow: '0 6px 20px -4px rgba(225, 29, 72, 0.35)',
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Agendar Cita
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Agendar Cita"
        size="xl"
      >
        <BookingWizard
          doctorId={doctor.id}
          services={activeServices}
          onSuccess={() => { setBookingOpen(false); navigate('/patient/appointments'); }}
          onCancel={() => setBookingOpen(false)}
        />
      </Modal>
    </PageLayout>
  );
}
