import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, DollarSign, Calendar, CheckCircle2,
  Star, Award, Shield,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import BookingWizard from '../../components/appointments/BookingWizard';
import StripePaymentModal from '../../components/ui/StripePaymentModal';
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

const TRUST_BADGES = [
  { icon: Award, label: 'Certificado Internacional' },
  { icon: Shield, label: 'Datos Protegidos' },
  { icon: Star, label: '5 Estrellas' },
];

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

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

      {/* ── Immersive Hero ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0005 0%, #2d000f 50%, #4a0018 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Glow */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-20"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(225,29,72,0.5) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="group mb-8 flex items-center gap-2 text-sm font-medium text-white/50 transition-all duration-200 hover:text-white/90"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Volver a especialistas
          </button>

          {/* Doctor identity */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl sm:rounded-3xl"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {initials}
              </div>

              <div>
                <div className="mb-2">
                  <Badge variant="primary" className="text-[10px]">{doctor.specialty}</Badge>
                </div>
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Dr(a). {name}
                </h1>
                {doctor.bio && (
                  <p className="mt-2 text-sm text-white/50 leading-relaxed max-w-md line-clamp-2">
                    {doctor.bio}
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            {(isPatient || !isAuthenticated) && (
              <button
                onClick={handleBook}
                className="flex-shrink-0 inline-flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 sm:self-center"
                style={{
                  background: 'linear-gradient(135deg, #be123c, #e11d48)',
                  boxShadow: '0 8px 32px -4px rgba(225,29,72,0.5)',
                }}
              >
                <Calendar className="h-4 w-4" />
                Agendar Cita
              </button>
            )}
          </div>

          {/* Trust badges strip */}
          <div className="mt-8 flex flex-wrap gap-3">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2"
                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
              >
                <b.icon className="h-3.5 w-3.5 text-primary-400" />
                <span className="text-xs font-medium text-white/60">{b.label}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
            >
              <DollarSign className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs font-medium text-white/60">
                Desde {formatPrice(Number(doctor.basePrice))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Schedule card */}
            <div
              className="rounded-2xl border border-neutral-100 bg-white p-5"
              style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
            >
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
                      <span className="rounded-lg border border-primary-100 bg-primary-50/60 px-2.5 py-0.5 text-xs text-primary-600">
                        {s.startTime} – {s.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio expanded (if exists) */}
            {doctor.bio && (
              <div
                className="rounded-2xl border border-neutral-100 bg-white p-5"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
              >
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">Sobre el Especialista</h2>
                <p className="text-sm leading-relaxed text-neutral-500">{doctor.bio}</p>
              </div>
            )}
          </div>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border border-neutral-100 bg-white p-7"
              style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
            >
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                <div className="h-1 w-5 rounded-full" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e)' }} />
                Servicios Disponibles
              </h2>

              {activeServices.length === 0 ? (
                <p className="text-sm text-neutral-400">No hay servicios registrados</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeServices.map((s) => (
                    <div
                      key={s.id}
                      className="group relative overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/30"
                      style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                            {s.description && (
                              <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">{s.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="flex-shrink-0 rounded-lg bg-primary-50 border border-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">
                          {formatPrice(Number(s.price))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom CTA */}
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
          onSuccess={() => { setBookingOpen(false); setPayModalOpen(true); }}
          onCancel={() => setBookingOpen(false)}
        />
      </Modal>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={payModalOpen}
        onClose={() => { setPayModalOpen(false); navigate('/patient/appointments'); }}
        amount={Number(doctor.basePrice)}
        doctorName={name}
        onSuccess={() => navigate('/patient/appointments')}
      />

    </PageLayout>
  );
}
