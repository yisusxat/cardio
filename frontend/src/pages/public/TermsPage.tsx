import { Scale, Calendar, CheckCircle2, AlertCircle, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

export default function TermsPage() {
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
            <Scale className="h-3.5 w-3.5" /> Términos Legales de Uso
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
            Términos y Condiciones de Servicio
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Vigente desde: {new Date().getFullYear()} — CardioCenter Plataforma Médica
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-neutral-100 bg-white p-8 sm:p-10 shadow-sm leading-relaxed text-sm text-neutral-700">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" /> 1. Aceptación del Servicio
            </h2>
            <p>
              Al registrarte o utilizar la plataforma <strong>CardioCenter</strong>, aceptas de manera plena y sin reservas los presentes Términos y Condiciones. Esta plataforma facilita la gestión de agenda, consultas médicas y seguimiento de atención médica especializada en cardiología.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" /> 2. Agendamiento de Citas y Cancelaciones
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Agendamiento:</strong> Las citas quedan registradas en estado de solicitud entrante o confirmada de acuerdo a la disponibilidad publicada por el especialista.</li>
              <li><strong>Cancelaciones:</strong> El paciente puede cancelar una cita previamente agendada en cualquier momento desde su panel, salvo que la cita ya haya sido completada por el médico.</li>
              <li><strong>Puntualidad:</strong> Se solicita a los pacientes estar disponibles a la hora estipulada en la reserva.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary-600" /> 3. Deslinde de Emergencias Médicas
            </h2>
            <p className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
              🚨 <strong>Aviso Importante:</strong> CardioCenter es una plataforma de gestión de consultas médicas agendadas. <strong>No está diseñada para atender emergencias cardiovasculares de urgencia inminente.</strong> Si estás experimentando dolor torácico intenso, falta de aire repentina o síntomas de infarto, llama inmediatamente a los servicios de emergencia de tu localidad o dirígete a la sala de urgencias más cercana.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-600" /> 4. Responsabilidad Profesional del Médico
            </h2>
            <p>
              Cada médico especialista registrado en CardioCenter es un profesional autónomo certificado. El diagnóstico, prescripción médica y recomendaciones vertidas en la Ficha Clínica son responsabilidad profesional directa del cardiólogo tratante.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
