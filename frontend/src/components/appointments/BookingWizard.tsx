import { useState } from 'react';
import { format, addDays, startOfToday, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn, formatPrice, formatTime } from '../../lib/utils';
import Button from '../ui/Button';
import api from '../../lib/api';
import { useUIStore } from '../../stores/ui.store';

interface Service {
  id: string;
  name: string;
  price: number | string;
  description?: string | null;
}

interface BookingWizardProps {
  doctorId: string;
  services: Service[];
  onSuccess: () => void;
  onCancel: () => void;
}

const STEP_LABELS = ['Fecha y Hora', 'Servicios', 'Confirmación'];

export default function BookingWizard({ doctorId, services, onSuccess, onCancel }: BookingWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const toast = useUIStore();

  const today = startOfToday();
  const weekStart = addDays(today, weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchSlots = async (dateStr: string) => {
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await api.get(`/doctors/${doctorId}/availability?date=${dateStr}`);
      setAvailableSlots(res.data.data.slots ?? []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const str = format(date, 'yyyy-MM-dd');
    setSelectedDate(str);
    fetchSlots(str);
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    setLoadingCreate(true);
    try {
      await api.post('/appointments', {
        doctorId,
        date: selectedDate,
        startTime: selectedSlot,
        serviceIds: selectedServices,
        reason: reason || undefined,
        slotDuration: 30,
      });
      toast.success('¡Cita agendada exitosamente!');
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al crear la cita';
      toast.error(msg);
    } finally {
      setLoadingCreate(false);
    }
  };

  const totalPrice =
    selectedServices.length > 0
      ? selectedServices.reduce((sum, id) => {
          const svc = services.find((s) => s.id === id);
          return sum + (svc ? Number(svc.price) : 0);
        }, 0)
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                i < step
                  ? 'bg-primary-600 text-white'
                  : i === step
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600'
                    : 'bg-gray-100 text-gray-400',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium', i === step ? 'text-primary-700' : 'text-gray-400')}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && <div className="h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 0: Date & time */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {format(weekStart, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="rounded-lg p-1.5 hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const isPast = isBefore(day, today);
              const str = format(day, 'yyyy-MM-dd');
              const isSelected = str === selectedDate;
              return (
                <button
                  key={str}
                  disabled={isPast}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'flex flex-col items-center rounded-xl py-2 text-xs transition-all',
                    isPast ? 'cursor-not-allowed opacity-30' : 'hover:bg-primary-50',
                    isSelected ? 'bg-primary-600 text-white' : 'text-gray-700',
                  )}
                >
                  <span className="font-medium">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-base font-bold">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          {/* Slots */}
          {selectedDate && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Horarios disponibles</p>
              {loadingSlots ? (
                <p className="text-sm text-gray-400">Cargando horarios...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-400">No hay horarios disponibles este día</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                        selectedSlot === slot
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50',
                      )}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">Selecciona los servicios (opcional)</p>
          {services.map((s) => {
            const selected = selectedServices.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-4 text-left transition-all',
                  selected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary-600">{formatPrice(Number(s.price))}</span>
                  <div
                    className={cn(
                      'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                      selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300',
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="mt-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Motivo de consulta (opcional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe brevemente el motivo de tu visita..."
              className="input-field resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-900 mb-3">Resumen de la cita</p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha</span>
                <span className="font-medium">{format(new Date(selectedDate + 'T00:00:00'), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hora</span>
                <span className="font-medium">{formatTime(selectedSlot)}</span>
              </div>
              {selectedServices.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Servicios</span>
                  <span className="font-medium text-right">{selectedServices.map((id) => services.find((s) => s.id === id)?.name).join(', ')}</span>
                </div>
              )}
              {reason && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Motivo</span>
                  <span className="font-medium text-right max-w-[180px] truncate">{reason}</span>
                </div>
              )}
              {totalPrice !== null && (
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="font-semibold text-gray-700">Total estimado</span>
                  <span className="font-bold text-primary-600">{formatPrice(totalPrice)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-100 pt-4">
        <Button variant="secondary" onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}>
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>
        {step < 2 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && (!selectedDate || !selectedSlot)}
          >
            Siguiente
          </Button>
        ) : (
          <Button loading={loadingCreate} onClick={handleConfirm}>
            Confirmar Cita
          </Button>
        )}
      </div>
    </div>
  );
}
