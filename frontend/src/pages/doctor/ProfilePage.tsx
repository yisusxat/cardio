import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, User, Mail, DollarSign, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice } from '../../lib/utils';

export default function DoctorProfilePage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const doctorProfile = user?.doctorProfile;

  const [specialty, setSpecialty] = useState(doctorProfile?.specialty ?? '');
  const [bio, setBio] = useState(doctorProfile?.bio ?? '');
  const [basePrice, setBasePrice] = useState(String(doctorProfile?.basePrice ?? ''));
  const [loading, setLoading] = useState(false);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/doctor/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Portal Médico
        </Link>

        {/* Profile Card Header */}
        <div
          className="mb-8 rounded-3xl border border-neutral-100 bg-white overflow-hidden"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
        >
          {/* Hero band */}
          <div
            className="h-32 relative"
            style={{ background: 'linear-gradient(135deg, #0f0005 0%, #2d000f 50%, #4a0018 100%)' }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
          </div>

          {/* Avatar + Main Info */}
          <div className="px-8 pb-8">
            <div className="-mt-12 mb-5 flex flex-wrap items-end justify-between gap-4">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white text-3xl font-bold text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
              >
                {initials}
              </div>
              <span className="mb-1 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-700">
                Especialista Verificado CardioCenter
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-neutral-900">
              Dr(a). {user?.firstName} {user?.lastName}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {doctorProfile?.specialty ?? 'Especialista en Cardiología'} · CardioCenter
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
