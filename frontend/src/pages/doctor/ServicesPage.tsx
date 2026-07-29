import { useState, useEffect, type FormEvent } from 'react';
import { Trash2, Plus, Stethoscope, ArrowLeft, DollarSign, Pencil, Power, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatPrice } from '../../lib/utils';

interface MedicalServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
}

export default function DoctorServicesPage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Fetch fresh data when entering page
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchMe();
    setRefreshing(false);
  };

  const services = (user?.doctorProfile?.services as MedicalServiceItem[]) ?? [];
  const activeCount = services.filter((s) => s.isActive).length;

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (s: MedicalServiceItem) => {
    setEditingId(s.id);
    setName(s.name);
    setDescription(s.description ?? '');
    setPrice(String(s.price));
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setLoading(true);

    try {
      if (editingId) {
        // Edit existing service
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

      await fetchMe();
      setModalOpen(false);
      resetForm();
    } catch {
      toast.error('Error al guardar el servicio médico');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (s: MedicalServiceItem) => {
    setTogglingId(s.id);
    try {
      await api.patch(`/doctors/services/${s.id}`, {
        isActive: !s.isActive,
      });
      toast.success(
        s.isActive
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

  const handleDelete = async (id: string) => {
    setTogglingId(id);
    try {
      await api.delete(`/doctors/services/${id}`);
      toast.success('Servicio desactivado correctamente (permanece en la lista)');
      await fetchMe();
    } catch {
      toast.error('Error al desactivar el servicio');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

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
              <h1 className="font-display text-2xl font-semibold text-neutral-900">Servicios Médicos Ofrecidos</h1>
              <p className="mt-1 text-sm text-neutral-400">
                {activeCount} activo{activeCount !== 1 ? 's' : ''} de {services.length} servicio{services.length !== 1 ? 's' : ''} registrados
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
                title="Actualizar listado de servicios"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #be123c, #e11d48)', boxShadow: '0 6px 20px -4px rgba(225,29,72,0.4)' }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Servicio</span>
                <span className="sm:hidden">Añadir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Garantía de Tarifas y Citas:</strong> Los servicios desactivados no desaparecen de tu panel; se mantienen visibles con la etiqueta <strong>Desactivado</strong> para que puedas reactivarlos cuando desees. Todas las citas previas mantendrán su precio contratado.
          </span>
        </div>

        {/* Services grid */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <Stethoscope className="h-7 w-7 text-primary-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">Sin servicios registrados</p>
            <p className="mt-1 text-xs text-neutral-400 max-w-xs">
              Añade los procedimientos y consultas especiales que ofreces
            </p>
            <button
              onClick={handleOpenCreateModal}
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
                className={`group flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-200 hover:border-neutral-200 ${
                  !s.isActive ? 'border-neutral-200 bg-neutral-50/70 opacity-90' : 'border-neutral-100'
                }`}
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.07)' }}
              >
                {/* Top accent */}
                <div className={`h-1 bg-gradient-to-r ${s.isActive ? 'from-primary-500 to-primary-700' : 'from-neutral-300 to-neutral-400'} opacity-100 transition-opacity duration-300`} />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${s.isActive ? 'bg-primary-50' : 'bg-neutral-100'}`}>
                        <Stethoscope className={`h-5 w-5 ${s.isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${s.isActive ? 'text-neutral-900' : 'text-neutral-500 line-through'}`}>
                            {s.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            s.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                          }`}
                        >
                          {s.isActive ? 'Activo' : 'Desactivado'}
                        </span>
                      </div>
                    </div>
                    <div className={`flex flex-shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 ${s.isActive ? 'bg-primary-50' : 'bg-neutral-100'}`}>
                      <DollarSign className={`h-3.5 w-3.5 ${s.isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                      <span className={`text-sm font-bold ${s.isActive ? 'text-primary-700' : 'text-neutral-600'}`}>
                        {formatPrice(Number(s.price))}
                      </span>
                    </div>
                  </div>

                  {s.description && (
                    <p className="flex-1 text-xs text-neutral-400 leading-relaxed mt-1">{s.description}</p>
                  )}
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3">
                  <button
                    type="button"
                    disabled={togglingId === s.id}
                    onClick={() => handleToggleActive(s)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      s.isActive
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {s.isActive ? 'Desactivar' : 'Activar Servicio'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(s)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-white hover:text-primary-600 transition-colors border border-transparent hover:border-neutral-200"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      disabled={togglingId === s.id}
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Desactivar este servicio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm(); }}
          title={editingId ? 'Modificar Servicio Médico' : 'Nuevo Servicio Médico'}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="input-field resize-none text-xs"
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
            <div className="mt-2 flex justify-end gap-3 border-t border-neutral-100 pt-3">
              <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                {editingId ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Guardar Cambios' : 'Guardar Servicio'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
}
