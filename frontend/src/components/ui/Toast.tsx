import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore, type Toast } from '../../stores/ui.store';

const VARIANTS = {
  success: {
    icon: <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px', color: '#10b981' }} />,
    accent: '#10b981',
    bg: 'rgba(255,255,255,0.92)',
    border: 'rgba(16,185,129,0.2)',
    text: '#064e3b',
  },
  error: {
    icon: <XCircle className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px', color: '#e11d48' }} />,
    accent: '#e11d48',
    bg: 'rgba(255,255,255,0.92)',
    border: 'rgba(225,29,72,0.2)',
    text: '#4c0519',
  },
  info: {
    icon: <Info className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px', color: '#3b82f6' }} />,
    accent: '#3b82f6',
    bg: 'rgba(255,255,255,0.92)',
    border: 'rgba(59,130,246,0.2)',
    text: '#1e3a8a',
  },
  warning: {
    icon: <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px', color: '#f59e0b' }} />,
    accent: '#f59e0b',
    bg: 'rgba(255,255,255,0.92)',
    border: 'rgba(245,158,11,0.2)',
    text: '#78350f',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const v = VARIANTS[toast.type];

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-4 animate-slide-up"
      style={{
        background: v.bg,
        borderColor: v.border,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.15), 0 2px 8px -2px rgba(0,0,0,0.08)',
        borderLeft: `3px solid ${v.accent}`,
      }}
    >
      <div className="mt-0.5">{v.icon}</div>
      <p className="flex-1 text-sm font-medium leading-snug" style={{ color: v.text }}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:text-neutral-600"
        aria-label="Cerrar notificación"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-80 sm:w-96">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
