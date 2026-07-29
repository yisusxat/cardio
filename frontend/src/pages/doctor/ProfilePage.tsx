import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Stethoscope, User, Mail, DollarSign, CheckCircle, Shield,
  Clock, Plus, Settings, Eye,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice, getDayName } from '../../lib/utils';

export default function DoctorProfilePage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const doctorProfile = user?.doctorProfile;

  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronize state dynamically when doctorProfile is fetched or updated
  useEffect(() => {
    if (doctorProfile) {
      setSpecialty(doctorProfile.specialty ?? '');
      setBio(doctorProfile.bio ?? '');
      setBasePrice(doctorProfile.basePrice !== undefined ? String(doctorProfile.basePrice) : '');
    }
  }, [doctorProfile]);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  const schedules = (doctorProfile?.schedules as {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[]) ?? [];

  const services = (doctorProfile?.services as {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
  }[]) ?? [];

  const activeServices = services.filter((s) => s.isActive);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch('/doctors/profile', {
        specialty: specialty || undefined,
        bio: bio || undefined,
        basePrice: basePrice ? Number(basePrice) : undefined,
      });

      toast.success('Perfil profesional actualizado correctamente');
      await fetchMe();
    } catch {
      toast.error('Error al actualizar el perfil médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back and Preview CTA */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Portal Médico
          </Link>

          {doctorProfile?.id && (
            <Link
              to={`/doctors/${doctorProfile.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Ver Mi Perfil Público (Vista del Paciente)
            </Link>
          )}
        </div>

        {/* Profile Card Header */}
        <div
          className="mb-8 rounded-3xl border border-neutral-100 bg-white p-8"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div
                className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl text-3xl font-bold text-white shadow-red-glow"
                style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)' }}
              >
                {initials}
              </div>

              <div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-700">
                    <Shield className="h-3.5 w-3.5" /> Especialista Verificado CardioCenter
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
                  Dr(a). {user?.firstName} {user?.lastName}
                </h1>
                <p className="mt-1 text-sm text-neutral-400">
                  {doctorProfile?.specialty ?? 'Especialista en Cardiología'} · CardioCenter
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-neutral-100 pt-6">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <User className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Nombre</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">{user?.firstName} {user?.lastName}</p>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Correo</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 truncate">{user?.email}</p>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Consulta Base</span>
              </div>
              <p className="text-xs font-semibold text-primary-600">
                {doctorProfile?.basePrice ? formatPrice(Number(doctorProfile.basePrice)) : '$0 USD'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Coherence Section: Schedules & Services Overview ────────────────────── */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Schedules summary */}
          <div
            className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Horarios de Atención Configurados</h3>
                </div>
                <Link
                  to="/doctor/schedules"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Gestionar
                </Link>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3">No has registrado bloques de disponibilidad.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs rounded-xl bg-neutral-50 px-3 py-2 border border-neutral-100">
                      <span className="font-semibold text-neutral-700">{getDayName(s.dayOfWeek)}</span>
                      <span className="font-mono text-neutral-500">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Services summary */}
          <div
            className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100">
                    <Settings className="h-4 w-4 text-neutral-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Servicios Médicos Ofrecidos</h3>
                </div>
                <Link
                  to="/doctor/services"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Gestionar
                </Link>
              </div>

              {activeServices.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3">No tienes servicios adicionales activos.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeServices.map((serv) => (
                    <div key={serv.id} className="flex items-center justify-between text-xs rounded-xl bg-neutral-50 px-3 py-2 border border-neutral-100">
                      <span className="font-semibold text-neutral-700 truncate max-w-[200px]">{serv.name}</span>
                      <span className="font-bold text-primary-600">{formatPrice(Number(serv.price))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div
          className="rounded-3xl border border-neutral-100 bg-white p-7"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
        >
          <div className="mb-6 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-semibold text-neutral-900">Editar Perfil Profesional</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Especialidad Médica"
                placeholder="Ej. Cardiología Clínica y Electrofisiología"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              />

              <Input
                label="Precio Base de Consulta ($ USD)"
                type="number"
                min="0"
                step="0.01"
                placeholder="120"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Biografía Médica y Trayectoria
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu formación académica, certificaciones y áreas de enfoque médico..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field resize-none text-sm"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Esta información se mostrará en tu tarjeta pública para que los pacientes puedan conocerte.
              </p>
            </div>

            <div className="mt-2 flex justify-end border-t border-neutral-100 pt-5">
              <Button type="submit" loading={loading}>
                <CheckCircle className="h-4 w-4" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </div>

      </div>
    </PageLayout>
  );
}
