import { Cookie, ShieldCheck, Database, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

export default function CookiesPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Inicio
        </Link>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-700 mb-3">
            <Cookie className="h-3.5 w-3.5" /> Política de Cookies y Almacenamiento
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
            Política de Cookies
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Información transparente sobre el uso de cookies en CardioCenter
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-neutral-100 bg-white p-8 sm:p-10 shadow-sm leading-relaxed text-sm text-neutral-700">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary-600" /> 1. ¿Qué son las Cookies?
            </h2>
            <p>
              Las cookies y tecnologías de almacenamiento web (como `localStorage` o `sessionStorage`) son pequeños fragmentos de datos guardados en tu navegador para permitir el funcionamiento seguro y fluido de la plataforma.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-600" /> 2. Tipos de Cookies que Utilizamos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
                  <Check className="h-4 w-4 text-emerald-600" /> Cookies Estrictamente Necesarias
                </div>
                <p className="text-xs text-neutral-600">
                  Son esenciales para autenticar tu sesión activa mediante tokens seguros (JWT) y mantener tu acceso al Portal del Paciente o Médico.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
                  <Check className="h-4 w-4 text-emerald-600" /> Cookies de Funcionalidad
                </div>
                <p className="text-xs text-neutral-600">
                  Guardan tus preferencias de interfaz (modo claro/oscuro) y estado de navegación para evitar reingresar datos en cada visita.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary-600" /> 3. Ausencia de Cookies Publicitarias de Terceros
            </h2>
            <p>
              En <strong>CardioCenter</strong> <strong>no utilizamos cookies de rastreo publicitario ni vendemos datos a redes de anuncios</strong>. Tu privacidad médica está 100% protegida.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
