import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ToastContainer from '../../components/ui/Toast';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
      <ToastContainer />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl">
            <Heart className="h-7 w-7 text-primary-600 fill-primary-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
            <p className="mt-1 text-sm text-white/60">Regístrate como paciente y agenda hoy</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" placeholder="Carlos" value={form.firstName} onChange={set('firstName')} required id="reg-firstname" />
              <Input label="Apellido" placeholder="Mendoza" value={form.lastName} onChange={set('lastName')} required id="reg-lastname" />
            </div>
            <Input label="Correo electrónico" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required id="reg-email" />
            <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} required id="reg-password" hint="Al menos 8 caracteres" />
            <Input label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={set('confirmPassword')} required id="reg-confirm" />

            {displayError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {displayError}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full mt-1">
              Crear Cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
