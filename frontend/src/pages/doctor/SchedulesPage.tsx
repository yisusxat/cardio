import { useState, type FormEvent } from 'react';
import { Trash2, Plus, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { getDayName } from '../../lib/utils';

const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' },
];

const DAY_COLORS: Record<number, string> = {
  1: 'bg-primary-50 text-primary-700',
  2: 'bg-amber-50 text-amber-700',
  3: 'bg-emerald-50 text-emerald-700',
  4: 'bg-sky-50 text-sky-700',
  5: 'bg-violet-50 text-violet-700',
  6: 'bg-orange-50 text-orange-700',
  0: 'bg-neutral-100 text-neutral-600',
};

export default function DoctorSchedulesPage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');

  const schedules = (user?.doctorProfile?.schedules as {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[]) ?? [];

  // Sort by day
  const sorted = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/doctors/schedules', { dayOfWeek, startTime, endTime });
      toast.success('Horario añadido correctamente');
      await fetchMe();
      setModalOpen(false);
    } catch {
      toast.error('No se pudo guardar el horario. Verifica si ya existe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/doctors/schedules/${id}`);
      toast.success('Horario eliminado');
      await fetchMe();
    } catch {
      toast.error('Error al eliminar horario');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-7">
          <Link
            to="/doctor/dashboard"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Panel
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-neutral-900">Gestión de Horarios</h1>
              <p className="mt-1 text-sm text-neutral-400">Configura tus bloques de disponibilidad semanal</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #be123c, #e11d48)', boxShadow: '0 6px 20px -4px rgba(225,29,72,0.4)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Horario</span>
              <span className="sm:hidden">Añadir</span>
            </button>
          </div>
        </div>

        {/* Schedule grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <Clock className="h-7 w-7 text-primary-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">Sin horarios configurados</p>
            <p className="mt-1 text-xs text-neutral-400">Añade tu disponibilidad para que los pacientes puedan reservar</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Añadir primer horario
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-4 transition-all duration-200 hover:border-neutral-200 hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  <span className={`rounded-xl px-3 py-1.5 text-xs font-bold ${DAY_COLORS[s.dayOfWeek] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {getDayName(s.dayOfWeek)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {s.startTime} – {s.endTime}
                    </p>
                    <p className="text-xs text-neutral-400">Bloque de atención</p>
                  </div>
                </div>
                <button
                  disabled={deletingId === s.id}
                  onClick={() => handleDelete(s.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Añadir Horario de Atención">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Día de la semana</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="input-field"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Hora inicio" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              <Input label="Hora fin" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={loading}>Guardar Horario</Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
}
