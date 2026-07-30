import { Shield, Lock, Eye, FileText, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

export default function PrivacyPage() {
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
            <Shield className="h-3.5 w-3.5" /> Protección de Datos y Privacidad
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Última actualización: {new Date().getFullYear()} — CardioCenter Centro Médicos Especializados
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-neutral-100 bg-white p-8 sm:p-10 shadow-sm leading-relaxed text-sm text-neutral-700">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" /> 1. Compromiso de Confidencialidad Médica
            </h2>
            <p>
              En <strong>CardioCenter</strong> nos tomamos con absoluta rigurosidad la confidencialidad de tu información personal y médica (Protected Health Information - PHI). Todos los datos clínicos recopilados en las consultas son procesados bajo estrictos estándares de privacidad conforme a las mejores prácticas internacionales de salud digital.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" /> 2. Información que Recopilamos
            </h2>
            <p className="mb-3">
              Para brindarte la atención cardiológica de la más alta calidad, recopilamos únicamente los datos necesarios para tu atención médica:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Datos de Identificación Personal:</strong> Nombre, apellidos, correo electrónico y número de teléfono.</li>
              <li><strong>Ficha de Registro Administrativo:</strong> Fecha de nacimiento, sexo, grupo sanguíneo y contacto de emergencia.</li>
              <li><strong>Historial Clínico de Consultas:</strong> Diagnósticos, notas clínicas, recetas médicas y parámetros cardiovasculares guardados exclusivamente por tu médico tratante.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary-600" /> 3. Uso y Acceso Restringido de los Datos
            </h2>
            <p className="mb-3">
              Tus datos de salud <strong>jamás serán vendidos, comercializados ni compartidos con terceros</strong> con fines publicitarios.
            </p>
            <p>
              El acceso a tu expediente clínico está restringido únicamente al médico cardiólogo con el que poseas una cita activa o completada. La plataforma implementa controles de autorización a nivel de servidor (ABAC) para garantizar que ningún usuario no autorizado acceda a tu ficha médica.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" /> 4. Cifrado y Medidas de Seguridad
            </h2>
            <p>
              Toda la comunicación entre tu navegador y nuestros servidores viaja cifrada mediante HTTPS/TLS de última generación. La base de datos cuenta con almacenamiento cifrado en reposo (AES-256) y respaldos automáticos inmutables.
            </p>
          </section>

          <section className="pt-6 border-t border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-600" /> 5. Sus Derechos como Paciente
            </h2>
            <p>
              Tienes derecho a consultar tu historial clínico en todo momento a través de tu Portal de Paciente, solicitar correcciones de datos administrativos o requerir la baja de tu cuenta enviando una solicitud a <code>privacidad@cardiocenter.com</code>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
