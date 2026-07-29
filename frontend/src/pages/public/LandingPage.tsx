import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Shield, Calendar, Star, ArrowRight, CheckCircle,
  Activity, Users, Award, ChevronRight, UserCheck, ClipboardList,
  Stethoscope, Quote,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import DoctorCard from '../../components/doctors/DoctorCard';
import Button from '../../components/ui/Button';
import HeartbeatWidget from '../../components/ui/HeartbeatWidget';
import { useInView } from '../../hooks/useInView';
import api from '../../lib/api';

/* ─── Data ──────────────────────────────────────────────────────────────────── */
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

const PROCESS = [
  {
    step: '01',
    icon: UserCheck,
    title: 'Crea tu perfil',
    desc: 'Regístrate gratis en segundos. Tu información está protegida con los más altos estándares de seguridad médica.',
  },
  {
    step: '02',
    icon: Stethoscope,
    title: 'Elige tu especialista',
    desc: 'Explora nuestro directorio de cardiólogos certificados, revisa sus perfiles y encuentra al que mejor se adapte a ti.',
  },
  {
    step: '03',
    icon: ClipboardList,
    title: 'Agenda tu cita',
    desc: 'Selecciona el horario que prefieras y recibe confirmación inmediata. Recordatorios automáticos incluidos.',
  },
];

const TESTIMONIALS = [
  {
    name: 'María González',
    age: 54,
    text: 'El nivel de atención en CardioCenter es excepcional. Mi cardiólogo tomó el tiempo de explicarme cada detalle de mi diagnóstico. Me sentí completamente segura y en las mejores manos.',
    rating: 5,
    condition: 'Hipertensión arterial',
  },
  {
    name: 'Carlos Rodríguez',
    age: 41,
    text: 'Agendar mi cita fue increíblemente fácil. La tecnología que usan es de primer nivel y el equipo médico demuestra una dedicación que rara vez se encuentra. Totalmente recomendado.',
    rating: 5,
    condition: 'Arritmia cardíaca',
  },
  {
    name: 'Ana Martínez',
    age: 67,
    text: 'Llevo dos años siendo paciente aquí y cada visita supera mis expectativas. El seguimiento personalizado y la calidez del equipo hacen toda la diferencia en mi tratamiento.',
    rating: 5,
    condition: 'Insuficiencia cardíaca',
  },
];

const ACCREDITATIONS = [
  'Sociedad Española de Cardiología',
  'American Heart Association',
  'ISO 9001 Certificado',
  'Joint Commission International',
  'European Society of Cardiology',
];

/* ─── Animated section wrapper ──────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [doctors, setDoctors] = useState<unknown[]>([]);

  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.data?.slice(0, 3) ?? [])).catch(() => {});
  }, []);

  return (
    <PageLayout>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0005 0%, #1e0008 30%, #3a0014 65%, #580020 100%)' }}
      >
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 55% 50% at 8% 65%, rgba(225,29,72,0.16) 0%, transparent 65%),
              radial-gradient(ellipse 45% 55% at 92% 15%, rgba(244,63,94,0.10) 0%, transparent 55%),
              radial-gradient(ellipse 30% 40% at 75% 85%, rgba(190,18,60,0.08) 0%, transparent 50%)
            `,
          }}
        />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-36 sm:px-6 lg:px-8 lg:pt-36 lg:pb-44">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

            {/* ── Left ── */}
            <div className="flex-1 max-w-2xl">

              {/* Pre-title badge */}
              <div className="section-label-dark mb-7 animate-fade-up inline-flex">
                <Heart className="h-3.5 w-3.5 text-primary-400 fill-primary-400" />
                Excelencia en cardiología — Desde 2014
              </div>

              <h1
                className="animate-fade-up animate-delay-100 font-display font-semibold text-white leading-[1.04] tracking-tight"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
              >
                Cuidamos{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #fda4af 0%, #f43f5e 45%, #e11d48 100%)',
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

              <p className="animate-fade-up animate-delay-200 mt-6 text-[1.05rem] leading-relaxed text-white/55 max-w-lg">
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
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 14px 44px -4px rgba(225, 29, 72, 0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px -4px rgba(225, 29, 72, 0.5)')}
                  >
                    Ver Especialistas
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </Link>
                <Link to="/register">
                  <button className="btn-outline-white">Crear cuenta gratis</button>
                </Link>
              </div>

              {/* Trust items */}
              <div className="animate-fade-up animate-delay-400 mt-11 flex flex-wrap gap-5">
                {TRUST_ITEMS.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/45">
                    <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: HeartbeatWidget ── */}
            <div className="hidden lg:flex lg:flex-shrink-0 animate-fade-up animate-delay-300">
              <HeartbeatWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS — floating over hero
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 -mt-16 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="group flex flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md p-6 text-center animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-white"
                style={{
                  animationDelay: `${i * 80}ms`,
                  boxShadow: '0 20px 60px -12px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.06)',
                }}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 transition-all duration-300 group-hover:bg-primary-600 group-hover:shadow-red-glow">
                  <s.icon className="h-5 w-5 text-primary-600 transition-colors duration-300 group-hover:text-white" />
                </div>
                <p className="text-2xl font-bold text-neutral-900 tracking-tight">{s.value}</p>
                <p className="mt-1 text-[11px] font-medium text-neutral-400 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ACCREDITATION BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="mt-16 border-y border-neutral-100 bg-white py-5">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-300 flex-shrink-0">
              Acreditaciones
            </span>
            <div className="hidden sm:block h-3.5 w-px bg-neutral-200" />
            {ACCREDITATIONS.map((a) => (
              <span key={a} className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 cursor-default">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PROCESS — "Cómo funciona"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

          <FadeIn className="text-center mb-16">
            <div className="section-label mb-5 mx-auto w-fit">
              <Activity className="h-3.5 w-3.5" />
              Proceso simplificado
            </div>
            <h2 className="font-display font-semibold text-neutral-900" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              Tu salud, en tres pasos
            </h2>
            <p className="mt-4 text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
              Hemos diseñado la experiencia más sencilla y segura para conectarte con el especialista que necesitas.
            </p>
          </FadeIn>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div
              className="absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] hidden h-px sm:block"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #fecdd3 20%, #fda4af 50%, #fecdd3 80%, transparent 100%)' }}
            />

            {PROCESS.map((p, i) => (
              <FadeIn key={p.step} delay={i * 120}>
                <div className="group relative flex flex-col items-center text-center p-8 rounded-3xl border border-neutral-100 bg-white transition-all duration-300 hover:border-primary-100 hover:shadow-luxury-md">
                  {/* Step number */}
                  <div className="relative mb-6">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                        boxShadow: '0 4px 20px -4px rgba(225,29,72,0.15)',
                      }}
                    >
                      <p.icon className="h-8 w-8 text-primary-600" />
                    </div>
                    {/* Step badge */}
                    <span
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-neutral-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY US — Features
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white pt-20 pb-24 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="section-label mb-5 mx-auto w-fit">
              <Heart className="h-3.5 w-3.5 fill-primary-500" />
              ¿Por qué elegirnos?
            </div>
            <h2 className="font-display text-neutral-900 font-semibold" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              Un centro de excelencia dedicado<br className="hidden sm:block" /> a tu salud cardíaca
            </h2>
            <p className="mt-4 text-neutral-400 max-w-lg mx-auto text-sm leading-relaxed">
              Combinamos tecnología de vanguardia con el más alto nivel de especialización médica.
            </p>
          </FadeIn>

          <div className="grid gap-7 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 110}>
                <div className="group relative h-full rounded-3xl border border-neutral-100 bg-white p-8 transition-all duration-300 hover:border-primary-100 hover:shadow-luxury-md overflow-hidden">
                  {/* Watermark number */}
                  <span className="pointer-events-none absolute right-5 top-4 font-display text-7xl font-bold select-none transition-colors duration-300 text-neutral-50 group-hover:text-primary-50/70">
                    0{i + 1}
                  </span>
                  {/* Hover accent line */}
                  <div className="absolute left-0 top-0 h-1 w-0 rounded-t-3xl bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500 group-hover:w-full" />

                  <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', boxShadow: '0 4px 20px -4px rgba(225,29,72,0.12)' }}
                  >
                    <f.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="relative text-[17px] font-semibold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="relative text-sm text-neutral-400 leading-relaxed">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INSPIRATIONAL QUOTE BAND
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: 'linear-gradient(135deg, #0f0005 0%, #2d000f 45%, #4a0018 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(225,29,72,0.12) 0%, transparent 70%)' }}
        />

        <FadeIn className="relative mx-auto max-w-4xl px-5 text-center sm:px-6">
          {/* ECG decoration */}
          <div className="mb-10 flex justify-center">
            <svg viewBox="0 0 240 32" className="w-52 opacity-50" style={{ height: '24px' }}>
              <path
                d="M0,16 L45,16 L52,10 L58,16 L68,16 L72,2 L76,30 L80,16 L96,16 L104,10 L110,16 L240,16"
                stroke="#f43f5e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

          <Quote className="mx-auto mb-6 h-8 w-8 text-primary-800 fill-primary-900/40" />

          <blockquote
            className="font-display font-semibold text-white"
            style={{ fontSize: 'clamp(1.45rem, 3.2vw, 2.1rem)', lineHeight: 1.25 }}
          >
            "El corazón que late con propósito<br className="hidden sm:block" />
            {' '}es el corazón que vive con plenitud."
          </blockquote>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">
            CardioCenter — Excelencia en Cardiología
          </p>

          <div className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-primary-600/50 to-transparent" />
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

          <FadeIn className="text-center mb-14">
            <div className="section-label mb-5 mx-auto w-fit">
              <Star className="h-3.5 w-3.5 fill-primary-500" />
              Testimonios de pacientes
            </div>
            <h2 className="font-display font-semibold text-neutral-900" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              Lo que dicen nuestros pacientes
            </h2>
            <p className="mt-4 text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
              Más de 2,500 pacientes han confiado su salud cardiovascular a nuestros especialistas.
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="group flex h-full flex-col rounded-3xl border border-neutral-100 bg-white p-7 transition-all duration-300 hover:border-primary-100 hover:shadow-luxury-md overflow-hidden">
                  {/* Top accent */}
                  <div className="mb-5 flex items-center justify-between">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="h-4 w-4 fill-primary-500 text-primary-500" />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-primary-100 fill-primary-100 rotate-180" />
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm text-neutral-500 leading-relaxed italic mb-6">
                    "{t.text}"
                  </p>

                  {/* Patient */}
                  <div className="flex items-center gap-3 pt-5 border-t border-neutral-50">
                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #e11d48, #9f1239)' }}
                    >
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{t.name}</p>
                      <p className="text-xs text-neutral-400">{t.age} años · {t.condition}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DOCTORS
      ══════════════════════════════════════════════════════════════════════ */}
      {doctors.length > 0 && (
        <section className="bg-white py-24 border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <FadeIn className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
              <div>
                <div className="section-label mb-4">
                  <Award className="h-3.5 w-3.5" />
                  Nuestro equipo
                </div>
                <h2 className="font-display font-semibold text-neutral-900" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                  Especialistas de confianza
                </h2>
                <p className="mt-2 text-sm text-neutral-400">Médicos certificados listos para atenderte</p>
              </div>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex-shrink-0"
              >
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </FadeIn>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(doctors as Parameters<typeof DoctorCard>[0]['doctor'][]).map((d) => (
                <DoctorCard key={(d as { id: string }).id} doctor={d} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/doctors">
                <Button variant="secondary">
                  Ver todos los especialistas <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-28"
        style={{ background: 'linear-gradient(135deg, #7f1d2e 0%, #be123c 50%, #e11d48 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 70% at 50% 110%, rgba(255,255,255,0.07) 0%, transparent 65%)' }}
        />

        <FadeIn className="relative mx-auto max-w-3xl px-5 text-center sm:px-6">
          <div className="section-label-dark mb-6 mx-auto w-fit">
            <Heart className="h-3.5 w-3.5 fill-white/60" />
            Empieza hoy
          </div>
          <h2 className="font-display font-semibold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Tu salud no puede esperar
          </h2>
          <p className="mt-5 text-[1.05rem] text-white/55 max-w-md mx-auto leading-relaxed">
            Regístrate gratis y agenda tu primera consulta con el mejor especialista para ti.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-5">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/55">
                <CheckCircle className="h-4 w-4 text-white/75 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <Link to="/register" className="mt-10 inline-block">
            <button
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-9 py-4 text-sm font-bold text-primary-700 transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: '0 20px 60px -8px rgba(0,0,0,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 28px 70px -8px rgba(0,0,0,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 20px 60px -8px rgba(0,0,0,0.25)')}
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </Link>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER — Premium multi-column
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

          {/* Main footer grid */}
          <div className="py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 group mb-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 4px 16px -4px rgba(225,29,72,0.4)' }}
                >
                  <Heart className="h-4.5 w-4.5 text-white fill-white" style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-base font-bold text-neutral-900">
                  Cardio<span className="text-primary-600">Center</span>
                </span>
              </Link>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-[200px]">
                Centro de cardiología de excelencia. Cuidando corazones desde 2014.
              </p>
              {/* Social placeholder */}
              <div className="mt-5 flex gap-3">
                {['FB', 'IG', 'TW'].map((s) => (
                  <div
                    key={s}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-[10px] font-bold text-neutral-400 hover:border-primary-200 hover:text-primary-600 cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900">Especialidades</h4>
              <ul className="space-y-2.5">
                {['Cardiología General', 'Ecocardiografía', 'Electrofisiología', 'Cardiología Preventiva', 'Rehabilitación Cardíaca'].map((s) => (
                  <li key={s}>
                    <span className="text-sm text-neutral-400 hover:text-primary-600 cursor-pointer transition-colors">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Información */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900">Información</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Nuestros médicos', to: '/doctors' },
                  { label: 'Crear cuenta', to: '/register' },
                  { label: 'Iniciar sesión', to: '/login' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-neutral-400 hover:text-primary-600 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900">Contacto</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-300 mb-0.5">Teléfono</span>
                  +1 (800) CARDIO-1
                </li>
                <li>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-300 mb-0.5">Email</span>
                  contacto@cardiocenter.com
                </li>
                <li>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-300 mb-0.5">Horario</span>
                  Lun – Vie: 8:00 – 18:00
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-neutral-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-400">© {new Date().getFullYear()} CardioCenter. Todos los derechos reservados.</p>
            <div className="flex gap-5">
              {['Privacidad', 'Términos', 'Cookies'].map((l) => (
                <span key={l} className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating Mobile CTA ── */}
      <div className="fixed bottom-6 right-5 z-40 md:hidden">
        <Link to="/doctors">
          <button
            className="flex items-center gap-2.5 rounded-full px-5 py-3.5 text-xs font-bold text-white shadow-luxury-lg transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
              boxShadow: '0 10px 30px -4px rgba(225,29,72,0.6)',
            }}
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar Cita</span>
          </button>
        </Link>
      </div>

    </PageLayout>
  );
}
