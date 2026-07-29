import { useState } from 'react';
import { Plus, Trash2, Settings, ShieldCheck, Pencil, CheckCircle2, X, Power } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice } from '../../lib/utils';

interface ServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MedicalServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
}

export default function ServiceManagerModal({ isOpen, onClose }: ServiceManagerModalProps) {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const services = (user?.doctorProfile?.services as MedicalServiceItem[]) ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
  };

  const handleStartEdit = (service: MedicalServiceItem) => {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description ?? '');
    setPrice(String(service.price));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setLoading(true);

    try {
      if (editingId) {
        // Update existing service
        await api.patch(`/doctors/services/${editingId}`, {
          name,
          description: description || undefined,
          price: Number(price),
        });
        toast.success('Servicio médico actualizado correctamente');
      } else {
        // Create new service
        await api.post('/doctors/services', {
          name,
          description: description || undefined,
          price: Number(price),
        });
        toast.success('Servicio médico creado correctamente');
      }

      resetForm();
      await fetchMe();
    } catch {
      toast.error('No se pudo guardar el servicio médico');
    } finally {
      setLoading(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleActive = async (service: MedicalServiceItem) => {
    setTogglingId(service.id);
    try {
      await api.patch(`/doctors/services/${service.id}`, {
        isActive: !service.isActive,
      });
      toast.success(
        service.isActive
          ? 'Servicio desactivado (las citas agendadas previas se respetan)'
          : 'Servicio reactivado para nuevos agendamientos'
      );
      await fetchMe();
    } catch {
      toast.error('No se pudo cambiar el estado del servicio');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteService = async (id: string) => {
    setTogglingId(id);
    try {
      await api.delete(`/doctors/services/${id}`);
      toast.success('Servicio eliminado (las citas agendadas previas se respetan)');
      if (editingId === id) resetForm();
      await fetchMe();
    } catch {
      toast.error('No se pudo eliminar el servicio');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activar, Desactivar & Editar Servicios Médicos" size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-800">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Protección de Citas Existentes:</strong> Al <strong>desactivar</strong> un servicio, este se ocultará únicamente para nuevas reservas. Todas las citas y precios previamente contratados por pacientes se mantendrán intactos.
          </span>
        </div>

        {/* Add/Edit Service form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {editingId ? '✏️ Modificar Servicio' : '➕ Crear Nuevo Servicio'}
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre del Servicio"
              placeholder="Ej. Ecocardiograma Doppler"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Precio ($ USD)"
              type="number"
              min="0"
              step="0.01"
              placeholder="150"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Descripción (Opcional)</label>
            <input
              type="text"
              placeholder="Breve detalle del procedimiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field py-1.5 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button size="sm" variant="secondary" type="button" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button size="sm" type="submit" loading={loading}>
              {editingId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingId ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </div>
        </form>

        {/* Services List */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-700">Listado de Servicios</h4>
          {services.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">No has registrado servicios aún.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {services.map((serv) => (
                <div
                  key={serv.id}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-all ${
                    !serv.isActive
                      ? 'border-neutral-200 bg-neutral-100/60 opacity-75'
                      : editingId === serv.id
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`h-4 w-4 ${serv.isActive ? 'text-neutral-500' : 'text-neutral-300'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-bold ${serv.isActive ? 'text-neutral-800' : 'text-neutral-400 line-through'}`}>
                          {serv.name}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            serv.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {serv.isActive ? 'Activo' : 'Desactivado'}
                        </span>
                      </div>
                      {serv.description && <p className="text-[11px] text-neutral-400">{serv.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-600 mr-1">{formatPrice(Number(serv.price))}</span>
                    
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(serv)}
                      disabled={togglingId === serv.id}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold border transition-colors ${
                        serv.isActive
                          ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={serv.isActive ? 'Desactivar este servicio' : 'Reactivar este servicio'}
                    >
                      <Power className="h-3 w-3" />
                      {serv.isActive ? 'Desactivar' : 'Activar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(serv)}
                      className="p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                      title="Editar este servicio"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(serv.id)}
                      disabled={togglingId === serv.id}
                      className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Eliminar este servicio"
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
