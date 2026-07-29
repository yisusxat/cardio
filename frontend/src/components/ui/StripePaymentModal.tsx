import { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { formatPrice } from '../../lib/utils';
import { useUIStore } from '../../stores/ui.store';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  doctorName: string;
  onSuccess: () => void;
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  amount,
  doctorName,
  onSuccess,
}: StripePaymentModalProps) {
  const toast = useUIStore();
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('CARLOS MENDOZA');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('•••');
  const [processing, setProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      toast.success('¡Pago procesado exitosamente mediante conexión cifrada!');
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pasarela de Pago Segura (Stripe/Card)" size="md">
      <form onSubmit={handlePay} className="flex flex-col gap-4">
        {/* Animated Virtual Credit Card */}
        <div
          className="relative h-44 w-full overflow-hidden rounded-2xl p-5 text-white shadow-xl transition-transform hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #0f0005 0%, #2d000f 45%, #9f1239 100%)',
            boxShadow: '0 12px 36px -6px rgba(159, 18, 57, 0.4)',
          }}
        >
          {/* Card Shine */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />

          <div className="flex h-full flex-col justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-300">CardioCenter Pay</span>
              <CreditCard className="h-6 w-6 text-white/80" />
            </div>

            <div>
              <p className="font-mono text-lg font-bold tracking-wider">{cardNumber}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-white/70">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Titular</p>
                <p className="font-medium uppercase">{cardHolder}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Expira</p>
                <p className="font-medium">{expiry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount summary */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3.5 border border-neutral-100">
          <div>
            <p className="text-xs text-neutral-400">Total a pagar para la consulta con</p>
            <p className="text-xs font-bold text-neutral-800">Dr(a). {doctorName}</p>
          </div>
          <span className="text-lg font-bold text-primary-600">{formatPrice(amount)}</span>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase text-neutral-500">Nombre del Titular</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="input-field py-2 text-xs font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase text-neutral-500">Número de Tarjeta</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="input-field py-2 text-xs font-mono pl-9"
                required
              />
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-neutral-500">Vencimiento</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input-field py-2 text-xs font-mono text-center"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-neutral-500">CVC / CVV</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="input-field py-2 text-xs font-mono text-center"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 py-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encriptación SSL de 256 bits · Procesamiento Stripe seguro</span>
        </div>

        <div className="mt-1 flex justify-end gap-2 border-t border-neutral-100 pt-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={processing}>
            <CheckCircle2 className="h-4 w-4" /> Pagar {formatPrice(amount)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
