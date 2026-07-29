import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Calendar, Star, ArrowRight, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import DoctorCard from '../../components/doctors/DoctorCard';
import Button from '../../components/ui/Button';
import api from '../../lib/api';

const FEATURES = [
  {
    icon: Shield,
    title: 'Especialistas Certificados',
    description: 'Todos nuestros cardiólogos cuentan con certificación y amplia experiencia clínica.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Calendar,
    title: 'Agenda Online 24/7',
    description: 'Reserva tu cita en minutos, elige el horario que más te convenga.',
    color: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: Star,
    title: 'Atención Personalizada',
    description: 'Cada médico gestiona su propia agenda para darte la mejor atención.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const STATS = [
  { label: 'Pacientes atendidos', value: '2,500+' },
  { label: 'Médicos especializados', value: '12+' },
  { label: 'Años de experiencia', value: '10+' },
  { label: 'Procedimientos exitosos', value: '98%' },
];

export default function LandingPage() {
  const [doctors, setDoctors] = useState<unknown[]>([]);

  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.data?.slice(0, 3) ?? [])).catch(() => {});
  }, []);

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #60a5fa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #14b8a6 0%, transparent 40%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <Heart className="h-4 w-4 text-accent-400 fill-accent-400" />
              Tu salud cardiovascular, nuestra prioridad
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
              Cuida tu
              <span className="block text-accent-400">corazón</span>
              con los mejores
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70 max-w-xl">
              CardioCenter conecta a pacientes con cardiólogos especialistas. Agenda tu cita de forma segura y rápida.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/doctors">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 shadow-xl">
                  Ver Médicos <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 10 720 30C480 50 240 0 0 30L0 60Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <p className="text-3xl font-extrabold text-primary-600">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Por qué elegirnos?</h2>
            <p className="mt-4 text-lg text-gray-500">Un centro de excelencia dedicado a tu salud cardíaca</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ──────────────────────────────────────────────────────────── */}
      {doctors.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Nuestros Especialistas</h2>
                <p className="mt-2 text-gray-500">Médicos certificados listos para atenderte</p>
              </div>
              <Link to="/doctors" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(doctors as Parameters<typeof DoctorCard>[0]['doctor'][]).map((d) => (
                <DoctorCard key={(d as { id: string }).id} doctor={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Tu salud no puede esperar
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Regístrate gratis y agenda tu primera consulta hoy mismo
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {['Sin costo de registro', 'Agenda en minutos', 'Cancelación gratuita'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle className="h-4 w-4 text-accent-400" /> {item}
              </div>
            ))}
          </div>
          <Link to="/register" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 shadow-xl">
              Comenzar ahora <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                <Heart className="h-3.5 w-3.5 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">CardioCenter</span>
            </div>
            <p className="text-xs text-gray-400">© 2025 CardioCenter. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </PageLayout>
  );
}
