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
          className="mb-6 rounded-3xl border border-neutral-100 bg-white p-8"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar Prominente */}
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-red-glow"
                style={{ background: 'linear-gradient(135deg, #e11d48, #9f1239)' }}
              >
                {initials}
              </div>

              <div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    <Shield className="h-3.5 w-3.5" /> Paciente Verificado
                  </span>
                </div>
                <h1 className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="mt-1 text-sm text-neutral-400">Miembro de CardioCenter</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 border-t border-neutral-100 pt-6">
            {[
              { icon: User, label: 'Nombre completo', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}` },
              { icon: Mail, label: 'Correo electrónico', value: user?.email ?? '—' },
              { icon: Shield, label: 'Rol de usuario', value: 'Paciente' },
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
