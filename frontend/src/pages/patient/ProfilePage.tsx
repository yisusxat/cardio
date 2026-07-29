import { useAuth } from '../../hooks/use-auth';
import { Link } from 'react-router-dom';
import { Heart, User, Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/patient/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Link>

        {/* Profile card */}
        <div
          className="mb-6 rounded-3xl border border-neutral-100 bg-white overflow-hidden"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
        >
          {/* Hero band */}
          <div
            className="h-28 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 50%, #f43f5e 100%)' }}
          >
            {/* Ambient light glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 70%)',
              }}
            />
            {/* Subtle dot pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
          </div>

          {/* Avatar + info */}
          <div className="px-8 pb-8">
            <div className="-mt-10 mb-5 flex items-end justify-between">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white text-2xl font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e11d48, #9f1239)' }}
              >
                {initials}
              </div>
              <span className="mb-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                Paciente Verificado
              </span>
            </div>

            <h1 className="font-display text-2xl font-semibold text-neutral-900">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">Miembro de CardioCenter</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { icon: User, label: 'Nombre completo', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}` },
                { icon: Mail, label: 'Correo electrónico', value: user?.email ?? '—' },
                { icon: Shield, label: 'Rol', value: 'Paciente' },
                { icon: Heart, label: 'Estado de cuenta', value: 'Activa' },
              ].map((f) => (
                <div key={f.label} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <f.icon className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{f.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health reminders */}
        <div
          className="rounded-3xl border border-neutral-100 bg-white p-6"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.05)' }}
        >
          <div className="mb-5 flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary-500 fill-primary-500" />
            <h2 className="text-sm font-semibold text-neutral-900">Recomendaciones de Salud</h2>
          </div>
          <ul className="space-y-3">
            {[
              'Realiza chequeos cardiovasculares anuales',
              'Mantén una dieta baja en sodio y grasas saturadas',
              'Practica actividad física moderada al menos 30 min/día',
              'Controla tu presión arterial regularmente',
            ].map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-neutral-500">
                <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
