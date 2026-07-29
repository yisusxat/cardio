import { useState } from 'react';
import { Plus, Trash2, Clock, ShieldCheck, Pencil, CheckCircle2, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { getDayName } from '../../lib/utils';

interface ScheduleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function ScheduleManagerModal({ isOpen, onClose }: ScheduleManagerModalProps) {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const schedules = (user?.doctorProfile?.schedules as ScheduleItem[]) ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setDayOfWeek(1);
    setStartTime('08:00');
    setEndTime('14:00');
  };

  const handleStartEdit = (s: ScheduleItem) => {
    setEditingId(s.id);
    setDayOfWeek(s.dayOfWeek);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Delete previous schedule item and create updated schedule block
        await api.delete(`/doctors/schedules/${editingId}`);
        await api.post('/doctors/schedules', {
          dayOfWeek,
          startTime,
          endTime,
        });
        toast.success('Horario de atención modificado correctamente');
      } else {
        await api.post('/doctors/schedules', {
          dayOfWeek,
          startTime,
          endTime,
        });
        toast.success('Horario de atención agregado correctamente');
      }

      resetForm();
      await fetchMe();
    } catch {
      toast.error('No se pudo guardar el horario (verifique cruces o formatos)');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/doctors/schedules/${id}`);
      toast.success('Bloque de horario eliminado');
      if (editingId === id) resetForm();
      await fetchMe();
    } catch {
      toast.error('No se pudo eliminar el bloque de horario');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestionar & Modificar Horarios de Atención" size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-800">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Garantía de Citas Agendadas:</strong> Modificar o ajustar la hora de un bloque horario aplicará a nuevos cupos disponibles. Las citas previamente agendadas por tus pacientes se respetarán en su fecha y hora original.
          </span>
        </div>

        {/* Add/Edit form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {editingId ? '✏️ Modificar Horario Existente' : '➕ Agregar Nuevo Horario'}
            </h4>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-3.5 w-3.5" /> Cancelar edición
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-600">Día de la Semana</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="input-field py-1.5 text-xs"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-600">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field py-1.5 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-600">Hora Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field py-1.5 text-xs font-mono"
                required
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            {editingId && (
              <Button size="sm" variant="secondary" type="button" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button size="sm" type="submit" loading={loading}>
              {editingId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingId ? 'Guardar Cambios' : 'Agregar Horario'}
            </Button>
          </div>
        </form>

        {/* Schedule List */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-700">Horarios Configurados</h4>
          {schedules.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">No has registrado horarios aún.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                    editingId === s.id
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span className="text-xs font-bold text-neutral-800">{getDayName(s.dayOfWeek)}</span>
                    <span className="text-xs font-mono text-neutral-500">{s.startTime} – {s.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(s)}
                      className="p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                      title="Editar este horario"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSchedule(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Eliminar este bloque"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-neutral-100 pt-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}
