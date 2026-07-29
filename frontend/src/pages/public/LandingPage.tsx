import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Shield, Calendar, Star, ArrowRight, CheckCircle,
  Activity, Users, Award, ChevronRight,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import DoctorCard from '../../components/doctors/DoctorCard';
import Button from '../../components/ui/Button';
import api from '../../lib/api';

const FEATURES = [
  {
    icon: Shield,
    title: 'Especialistas Certificados',
    description: 'Cardiólogos con amplia trayectoria, certificados por las principales sociedades médicas internacionales.',
  },
  {
    icon: Calendar,
    title: 'Agenda Online 24/7',
    description: 'Reserva tu cita en minutos desde cualquier dispositivo, eligiendo el horario que más te convenga.',
  },
  {
    icon: Star,
    title: 'Atención Personalizada',
    description: 'Cada médico gestiona su propia agenda para brindarte seguimiento individualizado y cercano.',
  },
];

const STATS = [
  { label: 'Pacientes Atendidos', value: '2,500+', icon: Users },
  { label: 'Médicos Especializados', value: '12+', icon: Award },
  { label: 'Años de Experiencia', value: '10+', icon: Activity },
  { label: 'Éxito en Procedimientos', value: '98%', icon: Heart },
];

const TRUST_ITEMS = [
  'Sin costo de registro',
  'Agenda en minutos',
  'Cancelación sin cargo',
];

export default function LandingPage() {
  const [doctors, setDoctors] = useState<unknown[]>([]);

  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.data?.slice(0, 3) ?? [])).catch(() => {});
  }, []);

  return (
    <PageLayout>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0008 0%, #2d0012 40%, #4a0020 70%, #6b0030 100%)' }}>
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 60% 50% at 10% 60%, rgba(225,29,72,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 60% at 90% 10%, rgba(244,63,94,0.12) 0%, transparent 60%)
            `,
          }}
        />

        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-6 lg:px-8 lg:py-40">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="section-label-dark mb-8 animate-fade-up">
              <Heart className="h-3.5 w-3.5 text-primary-400 fill-primary-400" />
              Tu salud cardiovascular, nuestra prioridad
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up animate-delay-100 font-display font-semibold text-white leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 4.75rem)' }}>
              Cuidamos{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                tu corazón
              </span>
              <br />
              con excelencia
            </h1>

            <p className="animate-fade-up animate-delay-200 mt-7 text-lg leading-relaxed text-white/60 max-w-xl">
              CardioCenter conecta a pacientes con los mejores cardiólogos especialistas.
              Agenda tu consulta de forma segura, sencilla y rápida.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up animate-delay-300 mt-10 flex flex-wrap gap-4">
              <Link to="/doctors">
                <button
                  className="group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
                    boxShadow: '0 8px 32px -4px rgba(225, 29, 72, 0.5)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 40px -4px rgba(225, 29, 72, 0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px -4px rgba(225, 29, 72, 0.5)')}
                >
                  Ver Especialistas
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-outline-white">
                  Crear cuenta gratis
                </button>
              </Link>
            </div>

            {/* Floating trust indicators */}
            <div className="animate-fade-up animate-delay-400 mt-12 flex flex-wrap gap-5">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/50">
                  <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #fafafa)' }}
        />
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 animate-fade-up">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="group flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-luxury transition-all duration-300 hover:border-primary-200 hover:shadow-luxury-md"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 transition-all duration-300 group-hover:bg-primary-600 group-hover:shadow-red-glow">
                  <s.icon className="h-5 w-5 text-primary-600 transition-colors duration-300 group-hover:text-white" />
                </div>
                <p className="text-3xl font-bold text-neutral-900 tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-neutral-400 text-center leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us ──────────────────────────────────────────────────────────── */}
      <section className="bg-white py-24 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-5 mx-auto w-fit">
              <Heart className="h-3.5 w-3.5 fill-primary-500" />
              ¿Por qué elegirnos?
            </div>
            <h2 className="font-display text-neutral-900 font-semibold" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              Un centro de excelencia dedicado<br className="hidden sm:block" /> a tu salud cardíaca
            </h2>
            <p className="mt-4 text-neutral-500 max-w-lg mx-auto leading-relaxed">
              Combinamos tecnología de vanguardia con el más alto nivel de especialización médica.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-3xl border border-neutral-100 bg-white p-8 transition-all duration-300 hover:border-primary-200 hover:shadow-luxury-md animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Number watermark */}
                <span className="absolute right-6 top-5 font-display text-6xl font-bold text-neutral-100 select-none transition-colors duration-300 group-hover:text-primary-50">
                  0{i + 1}
                </span>

                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-luxury transition-all duration-300 group-hover:bg-primary-600 group-hover:shadow-red-glow">
                  <f.icon className="h-5.5 w-5.5 text-primary-600 transition-colors duration-300 group-hover:text-white" style={{ width: '22px', height: '22px' }} />
                </div>
                <h3 className="relative text-[17px] font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="relative text-sm text-neutral-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ─────────────────────────────────────────────────────────── */}
      {doctors.length > 0 && (
        <section className="bg-white py-24 border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="section-label mb-4">
                  <Award className="h-3.5 w-3.5" />
                  Nuestro equipo
                </div>
                <h2 className="font-display font-semibold text-neutral-900" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                  Especialistas de confianza
                </h2>
                <p className="mt-2 text-neutral-500">Médicos certificados listos para atenderte</p>
              </div>
              <Link
                to="/doctors"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(doctors as Parameters<typeof DoctorCard>[0]['doctor'][]).map((d) => (
                <DoctorCard key={(d as { id: string }).id} doctor={d} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/doctors">
                <Button variant="secondary">Ver todos los especialistas <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)' }}
      >
        {/* Dot overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 70% 70% at 50% 100%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-6">
          <div className="section-label-dark mb-6 mx-auto w-fit">
            <Heart className="h-3.5 w-3.5 fill-white/60" />
            Empieza hoy
          </div>
          <h2 className="font-display font-semibold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tu salud no puede esperar
          </h2>
          <p className="mt-5 text-lg text-white/60 max-w-md mx-auto leading-relaxed">
            Regístrate gratis y agenda tu primera consulta con el mejor especialista para ti.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-5">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-white/80 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <Link to="/register" className="mt-10 inline-block">
            <button
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary-700 shadow-luxury-lg transition-all duration-300 hover:shadow-[0_20px_60px_-8px_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-red-glow">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-neutral-900">
                Cardio<span className="text-primary-600">Center</span>
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link to="/doctors" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">Médicos</Link>
              <Link to="/register" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">Registro</Link>
              <Link to="/login" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">Acceso</Link>
            </div>

            <p className="text-xs text-neutral-400">© {new Date().getFullYear()} CardioCenter. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

    </PageLayout>
  );
}
