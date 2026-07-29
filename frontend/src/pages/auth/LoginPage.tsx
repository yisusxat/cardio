import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle, Shield, Star } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ToastContainer from '../../components/ui/Toast';

const TRUST_POINTS = [
  'Cardiólogos certificados internacionalmente',
  'Privacidad y datos protegidos',
  'Agenda en menos de 2 minutos',
];

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login(email, password) as { role?: string } | undefined;
      if (user && (user as { role?: string }).role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="flex min-h-screen">
      <ToastContainer />

      {/* ── Left panel: brand ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f0005 0%, #2d000f 45%, #4a0018 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          style={{ height: '60%', background: 'radial-gradient(ellipse 80% 60% at 40% 100%, rgba(225,29,72,0.18) 0%, transparent 70%)' }}
        />

        {/* Top: logo */}
        <Link to="/" className="relative inline-flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 4px 20px -4px rgba(225,29,72,0.5)' }}
          >
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Cardio<span className="text-primary-400">Center</span>
          </span>
        </Link>

        {/* Middle: headline */}
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
            Excelencia en Cardiología
          </p>
          <h2
            className="font-display font-semibold text-white leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)' }}
          >
            Tu corazón merece<br />los mejores cuidados.
          </h2>
          <p className="mt-5 text-sm text-white/45 leading-relaxed max-w-xs">
            Accede a tu portal de salud cardiovascular y gestiona tus consultas con los mejores especialistas.
          </p>

          <ul className="mt-8 space-y-3">
            {TRUST_POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>

          {/* Stats strip */}
          <div className="mt-10 flex gap-8">
            {[
              { icon: Star, value: '98%', label: 'Satisfacción' },
              { icon: Shield, value: '10+', label: 'Años de experiencia' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: footer note */}
        <p className="relative text-xs text-white/25">
          © {new Date().getFullYear()} CardioCenter. Todos los derechos reservados.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10 bg-white">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}
          >
            <Heart className="h-4.5 w-4.5 text-white fill-white" style={{ width: '18px', height: '18px' }} />
          </div>
          <span className="text-base font-bold text-neutral-900">
            Cardio<span className="text-primary-600">Center</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-neutral-900">Bienvenido de vuelta</h1>
            <p className="mt-1.5 text-sm text-neutral-400">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />

            {error && (
              <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Regístrate gratis
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-8 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Acceso Demo</p>
            <p className="text-xs text-neutral-500 font-mono">carlos@email.com · patient123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
