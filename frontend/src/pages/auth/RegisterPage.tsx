import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ToastContainer from '../../components/ui/Toast';

const BENEFITS = [
  'Acceso a 12+ cardiólogos especializados',
  'Agenda y cancela citas sin cargo',
  'Historial médico centralizado y seguro',
  'Recordatorios automáticos de citas',
];

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const set = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setLocalError('');
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      navigate('/patient/dashboard');
    } catch {
      // error shown via store
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen">
      <ToastContainer />

      {/* ── Left panel: brand ── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
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
          style={{ height: '65%', background: 'radial-gradient(ellipse 80% 60% at 40% 100%, rgba(225,29,72,0.16) 0%, transparent 70%)' }}
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

        {/* Middle: content */}
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
            Tu portal de salud cardiovascular
          </p>
          <h2
            className="font-display font-semibold text-white leading-[1.1]"
            style={{ fontSize: 'clamp(1.7rem, 2.3vw, 2.2rem)' }}
          >
            Comienza a cuidar<br />tu corazón hoy.
          </h2>
          <p className="mt-5 text-sm text-white/45 leading-relaxed max-w-xs">
            Únete a más de 2,500 pacientes que confían en CardioCenter para su salud cardiovascular.
          </p>

          <ul className="mt-8 space-y-3.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          {/* Testimonial mini */}
          <div
            className="mt-10 rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
          >
            <p className="text-sm text-white/70 italic leading-relaxed">
              "Registrarme tomó menos de un minuto. El mismo día ya tenía mi cita confirmada."
            </p>
            <p className="mt-3 text-xs font-semibold text-white/40">— María G. · Paciente CardioCenter</p>
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-white/25">
          © {new Date().getFullYear()} CardioCenter. Todos los derechos reservados.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}
          >
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-base font-bold text-neutral-900">
            Cardio<span className="text-primary-600">Center</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-semibold text-neutral-900">Crear tu cuenta</h1>
            <p className="mt-1.5 text-sm text-neutral-400">Regístrate gratis como paciente en segundos</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                placeholder="Carlos"
                value={form.firstName}
                onChange={set('firstName')}
                required
                id="reg-firstname"
              />
              <Input
                label="Apellido"
                placeholder="Mendoza"
                value={form.lastName}
                onChange={set('lastName')}
                required
                id="reg-lastname"
              />
            </div>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={set('email')}
              required
              id="reg-email"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={set('password')}
              required
              id="reg-password"
              hint="Al menos 8 caracteres"
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              required
              id="reg-confirm"
            />

            {displayError && (
              <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
                {displayError}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Crear cuenta gratis
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Inicia sesión
            </Link>
          </p>

          <p className="mt-6 text-center text-[11px] text-neutral-300 leading-relaxed">
            Al crear una cuenta, aceptas nuestros{' '}
            <span className="text-neutral-400 cursor-pointer hover:text-primary-600 transition-colors">Términos de servicio</span>
            {' '}y{' '}
            <span className="text-neutral-400 cursor-pointer hover:text-primary-600 transition-colors">Política de privacidad</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
