import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ToastContainer from '../../components/ui/Toast';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4">
      <ToastContainer />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl">
            <Heart className="h-7 w-7 text-primary-600 fill-primary-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Bienvenido a CardioCenter</h1>
            <p className="mt-1 text-sm text-white/60">Inicia sesión para continuar</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 animate-slide-up">
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
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full mt-1">
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-xs text-white/60">
          Demo: <span className="font-mono">carlos@email.com</span> / <span className="font-mono">patient123</span>
        </div>
      </div>
    </div>
  );
}
