import { useState, type FormEvent } from 'react';
import { Trash2, Plus, Stethoscope, ArrowLeft, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const resetForm = () => { setName(''); setDescription(''); setPrice(''); };

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
      resetForm();
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

  const active = services.filter((s) => s.isActive);

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
              <h1 className="font-display text-2xl font-semibold text-neutral-900">Servicios Médicos</h1>
              <p className="mt-1 text-sm text-neutral-400">
                {active.length} servicio{active.length !== 1 ? 's' : ''} activo{active.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #be123c, #e11d48)', boxShadow: '0 6px 20px -4px rgba(225,29,72,0.4)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Servicio</span>
              <span className="sm:hidden">Añadir</span>
            </button>
          </div>
        </div>

        {/* Services grid */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <Stethoscope className="h-7 w-7 text-primary-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">Sin servicios registrados</p>
            <p className="mt-1 text-xs text-neutral-400 max-w-xs">
              Añade los procedimientos y consultas especiales que ofreces
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Crear primer servicio
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="group flex flex-col rounded-2xl border border-neutral-100 bg-white overflow-hidden transition-all duration-200 hover:border-neutral-200 hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)', opacity: s.isActive ? 1 : 0.55 }}
              >
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                        <Stethoscope className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{s.name}</h3>
                        {!s.isActive && (
                          <span className="text-[10px] font-semibold uppercase text-neutral-400">Inactivo</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-primary-50 px-3 py-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary-600" />
                      <span className="text-sm font-bold text-primary-700">{formatPrice(Number(s.price))}</span>
                    </div>
                  </div>

                  {s.description && (
                    <p className="flex-1 text-xs text-neutral-400 leading-relaxed">{s.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-end border-t border-neutral-100 bg-neutral-50 px-5 py-3">
                  <button
                    disabled={deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Nuevo Servicio Médico">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Nombre del Servicio"
              placeholder="Ej. Ecocardiograma completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Descripción (Opcional)</label>
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
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); resetForm(); }}>
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
