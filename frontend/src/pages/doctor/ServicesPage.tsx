import { useState, type FormEvent } from 'react';
import { Trash2, Plus, Stethoscope } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice } from '../../lib/utils';

export default function DoctorServicesPage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const services = (user?.doctorProfile?.services as {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
  }[]) ?? [];

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/doctors/services', {
        name,
        description: description || undefined,
        price: Number(price),
      });
      toast.success('Servicio creado');
      await fetchMe();
      setModalOpen(false);
      setName('');
      setDescription('');
      setPrice('');
    } catch {
      toast.error('Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/doctors/services/${id}`);
      toast.success('Servicio desactivado');
      await fetchMe();
    } catch {
      toast.error('Error al desactivar el servicio');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Servicios Médicos</h1>
            <p className="mt-1 text-sm text-gray-500">Ofrece y administra los procedimientos o consultas especiales</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo Servicio
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            No has agregado servicios médicos adicionales.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="card flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    </div>
                    <span className="font-bold text-primary-600">{formatPrice(Number(s.price))}</span>
                  </div>
                  {s.description && (
                    <p className="mt-2 text-sm text-gray-500">{s.description}</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Desactivar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Servicio Médico">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Nombre del Servicio"
              placeholder="Ej. Ecocardiograma completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Breve explicación del procedimiento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
              />
            </div>
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
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Guardar Servicio
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
}
