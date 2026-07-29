import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-primary-50 text-primary-700 border border-primary-100',
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger: 'bg-primary-50 text-primary-700 border border-primary-100',
  info: 'bg-blue-50 text-blue-700 border border-blue-100',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function appointmentStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  };
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };
  return { variant: map[status] ?? 'default', label: labels[status] ?? status };
}
