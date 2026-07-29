import { useEffect, type ReactNode } from 'react';
import { X, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl bg-white animate-slide-up',
          sizeClasses[size],
          className,
        )}
        style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.3), 0 4px 20px -4px rgba(0,0,0,0.1)' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Accent stripe */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #9f1239, #e11d48, #f43f5e)' }}
        />

        {title && (
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50">
                <Heart className="h-3.5 w-3.5 text-primary-600 fill-primary-300" />
              </div>
              <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
