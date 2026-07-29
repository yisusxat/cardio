import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatTime(time: string): string {
  // "14:30" → "2:30 PM"
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount);
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek] ?? '';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getApiErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as { response?: { data?: { error?: string } } }).response?.data?.error
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error;
  }
  return 'Ocurrió un error inesperado';
}
export function getPatientCode(userId?: string | null): string {
  if (!userId) return 'PAT-00000000';
  const clean = userId.replace(/-/g, '').toUpperCase();
  return `PAT-${clean.substring(0, 8)}`;
}
