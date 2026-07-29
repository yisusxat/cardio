import { useState, type FormEvent } from 'react';
import { Trash2, Plus, Clock } from 'lucide-react';
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Horarios</h1>
            <p className="mt-1 text-sm text-gray-500">Configura tus bloques de disponibilidad semanal</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo Horario
          </Button>
        </div>

        {schedules.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            No has configurado ningún horario de atención todavía.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {schedules.map((s) => (
              <div key={s.id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getDayName(s.dayOfWeek)}</p>
                    <p className="text-sm text-gray-500">{s.startTime} – {s.endTime}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deletingId === s.id}
                  onClick={() => handleDelete(s.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Añadir Horario de Atención">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Día de la semana</label>
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
              <Input
                label="Hora inicio"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Guardar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
}
