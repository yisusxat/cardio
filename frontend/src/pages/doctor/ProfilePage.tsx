import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Stethoscope, User, Mail, DollarSign, CheckCircle, Shield,
  Clock, Plus, Settings, Eye, X, Tag,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ScheduleManagerModal from '../../components/doctors/ScheduleManagerModal';
import ServiceManagerModal from '../../components/doctors/ServiceManagerModal';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice, getDayName } from '../../lib/utils';

export default function DoctorProfilePage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const doctorProfile = user?.doctorProfile;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [bio, setBio] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  // Synchronize state dynamically when doctorProfile is fetched or updated
  useEffect(() => {
    if (doctorProfile) {
      if (doctorProfile.specialty) {
        // Split specialty string by commas or multiple spaces into tags array
        const initialTags = doctorProfile.specialty
          .split(/[,]+/)
          .map((t) => t.trim())
          .filter(Boolean);
        setTags(initialTags.length > 0 ? initialTags : [doctorProfile.specialty.trim()]);
      } else {
        setTags([]);
      }
      setBio(doctorProfile.bio ?? '');
      setBasePrice(doctorProfile.basePrice !== undefined ? String(doctorProfile.basePrice) : '');
    }
  }, [doctorProfile]);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  const schedules = (doctorProfile?.schedules as {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[]) ?? [];

  const services = (doctorProfile?.services as {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
  }[]) ?? [];

  // ── Tag Handlers ─────────────────────────────────────────────────────────────
  const addTag = (value: string) => {
    const trimmed = value.trim().replace(/,/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

  // ── Form Submission ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Include any remaining input as tag before submitting
    let finalTags = [...tags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
      finalTags.push(tagInput.trim());
    }

    if (finalTags.length === 0) {
      toast.error('Por favor ingresa al menos una especialidad médica');
      return;
    }

    setLoading(true);

    const joinedSpecialties = finalTags.join(', ');

    try {
      await api.patch('/doctors/profile', {
        specialty: joinedSpecialties,
        bio: bio || undefined,
        basePrice: basePrice ? Number(basePrice) : undefined,
      });

      toast.success('Perfil profesional actualizado correctamente');
      await fetchMe();
    } catch {
      toast.error('Error al actualizar el perfil médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back and Preview CTA */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Portal Médico
          </Link>

          {doctorProfile?.id && (
            <Link
              to={`/doctors/${doctorProfile.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Ver Mi Perfil Público (Vista del Paciente)
            </Link>
          )}
        </div>

        {/* Profile Card Header */}
        <div
          className="mb-8 rounded-3xl border border-neutral-100 bg-white p-8"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div
                className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl text-3xl font-bold text-white shadow-red-glow"
                style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)' }}
              >
                {initials}
              </div>

              <div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-700">
                    <Shield className="h-3.5 w-3.5" /> Especialista Verificado CardioCenter
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
                  Dr(a). {user?.firstName} {user?.lastName}
                </h1>

                {/* Tags display in Header */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.length > 0 ? (
                    tags.map((t, idx) => (
                      <span key={idx} className="rounded-lg border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-400">Especialista en Cardiología · CardioCenter</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-neutral-100 pt-6">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <User className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Nombre</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">{user?.firstName} {user?.lastName}</p>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Correo</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 truncate">{user?.email}</p>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Consulta Base</span>
              </div>
              <p className="text-xs font-semibold text-primary-600">
                {doctorProfile?.basePrice ? formatPrice(Number(doctorProfile.basePrice)) : '$0 USD'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Coherence Section: Schedules & Services Overview ────────────────────── */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Schedules summary */}
          <div
            className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Horarios de Atención Configurados</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Gestionar
                </button>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3">No has registrado bloques de disponibilidad.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs rounded-xl bg-neutral-50 px-3 py-2 border border-neutral-100">
                      <span className="font-semibold text-neutral-700">{getDayName(s.dayOfWeek)}</span>
                      <span className="font-mono text-neutral-500">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Services summary */}
          <div
            className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100">
                    <Settings className="h-4 w-4 text-neutral-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Servicios Médicos Ofrecidos</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Gestionar
                </button>
              </div>

              {services.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3">No has registrado servicios aún.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {services.map((serv) => (
                    <div
                      key={serv.id}
                      className={`flex items-center justify-between text-xs rounded-xl px-3 py-2 border transition-all ${
                        serv.isActive
                          ? 'bg-neutral-50 border-neutral-100'
                          : 'bg-neutral-100/50 border-neutral-200/60 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${serv.isActive ? 'text-neutral-700' : 'text-neutral-400 line-through'}`}>
                          {serv.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            serv.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {serv.isActive ? 'Activo' : 'Desactivado'}
                        </span>
                      </div>
                      <span className={`font-bold ${serv.isActive ? 'text-primary-600' : 'text-neutral-400'}`}>
                        {formatPrice(Number(serv.price))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div
          className="rounded-3xl border border-neutral-100 bg-white p-7"
          style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
        >
          <div className="mb-6 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-semibold text-neutral-900">Editar Perfil Profesional</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">

              {/* ── Interactive Specialty Tag Input ── */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                  <Tag className="h-4 w-4 text-primary-500" /> Especialidades Médicas (Etiquetas / Tags)
                </label>
                <div
                  className="min-h-[46px] flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-2.5 transition-all focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/15"
                >
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 animate-scale-up"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="rounded p-0.5 hover:bg-primary-200 hover:text-primary-900 transition-colors"
                        title="Eliminar etiqueta"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleTagInputBlur}
                    placeholder={tags.length === 0 ? "Escribe y presiona Espacio o Enter (Ej. Ecocardiografía)" : "Añadir más..."}
                    className="flex-1 bg-transparent py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none min-w-[140px]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Presiona <span className="font-semibold text-neutral-600">Espacio</span>, <span className="font-semibold text-neutral-600">Coma</span> o <span className="font-semibold text-neutral-600">Enter</span> para convertir la palabra en etiqueta.
                </p>
              </div>

              <Input
                label="Precio Base de Consulta ($ USD)"
                type="number"
                min="0"
                step="0.01"
                placeholder="120"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Biografía Médica y Trayectoria
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu formación académica, certificaciones y áreas de enfoque médico..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field resize-none text-sm"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Esta información se mostrará en tu tarjeta pública para que los pacientes puedan conocerte.
              </p>
            </div>

            <div className="mt-2 flex justify-end border-t border-neutral-100 pt-5">
              <Button type="submit" loading={loading}>
                <CheckCircle className="h-4 w-4" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </div>

        {/* Modals for Direct Profile Management */}
        <ScheduleManagerModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
        />
        <ServiceManagerModal
          isOpen={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
        />

      </div>
    </PageLayout>
  );
}
