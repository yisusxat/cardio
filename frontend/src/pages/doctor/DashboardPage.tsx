import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle, Users, ArrowRight,
  Heart, Settings, TrendingUp, DollarSign, RotateCcw,
  Printer, Download, ArrowUpDown, Receipt, Search, UserCheck, Filter,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import AppointmentCard, { Appointment } from '../../components/appointments/AppointmentCard';
import Spinner from '../../components/ui/Spinner';
import ClinicalNoteModal from '../../components/ui/ClinicalNoteModal';
import PatientAdminModal from '../../components/ui/PatientAdminModal';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui.store';
import { formatDate, formatPrice, getPatientCode } from '../../lib/utils';

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'REVENUE';
type TimePeriod = 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';
type SortOrder = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const PERIOD_LABELS: Record<TimePeriod, string> = {
  ALL: 'Histórico Completo',
  THIS_MONTH: 'Este Mes',
  LAST_MONTH: 'Mes Anterior',
  THIS_YEAR: 'Este Año',
  CUSTOM: 'Rango Personalizado',
};

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});
  const [savedAdmins, setSavedAdmins] = useState<Record<string, boolean>>({});

  // Revenue Controls
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DATE_DESC');

  // Patients History Controls
  const [patientSearch, setPatientSearch] = useState('');
  const [patientPeriod, setPatientPeriod] = useState<TimePeriod>('ALL');
  const [patientStartYear, setPatientStartYear] = useState<string>('ALL');
  const [patientStartMonth, setPatientStartMonth] = useState<string>('ALL');
  const [patientStartDate, setPatientStartDate] = useState<string>('');
  const [patientEndDate, setPatientEndDate] = useState<string>('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data ?? []);
    } catch {
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setActionId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success('Estado actualizado correctamente');
      fetchAppointments();
    } catch {
      toast.error('No se pudo actualizar el estado de la cita');
    } finally {
      setActionId(null);
    }
  };

  const pending = appointments.filter((a) => a.status === 'PENDING');
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  const monthRevenue = completed.reduce((s, a) => s + Number(a.totalAmount ?? 0), 0);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';

  const toggleFilter = (type: FilterType) => {
    setActiveFilter((prev) => (prev === type ? 'ALL' : type));
  };

  // Available years from appointments
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear());
    completed.forEach((a) => {
      const y = new Date(a.date).getFullYear();
      if (!isNaN(y)) yearsSet.add(y);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [completed]);

  // Filtered Revenue List
  const filteredRevenue = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let list = completed.filter((a) => {
      const d = new Date(a.date);
      if (timePeriod === 'THIS_MONTH') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
      if (timePeriod === 'LAST_MONTH') {
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
      }
      if (timePeriod === 'THIS_YEAR') {
        return d.getFullYear() === currentYear;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortOrder === 'DATE_DESC') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'DATE_ASC') return new Date(a.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'AMOUNT_DESC') return Number(b.totalAmount) - Number(a.totalAmount);
      if (sortOrder === 'AMOUNT_ASC') return Number(a.totalAmount) - Number(b.totalAmount);
      return 0;
    });
  }, [completed, timePeriod, sortOrder]);

  const filteredTotal = useMemo(() => {
    return filteredRevenue.reduce((s, a) => s + Number(a.totalAmount ?? 0), 0);
  }, [filteredRevenue]);

  const averageTicket = useMemo(() => {
    if (filteredRevenue.length === 0) return 0;
    return filteredTotal / filteredRevenue.length;
  }, [filteredRevenue, filteredTotal]);

  // Filtered Completed Patients List with Month/Year & Custom Range
  const filteredCompletedPatients = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return completed.filter((a) => {
      const d = new Date(a.date);

      // Preset Period filters
      if (patientPeriod === 'THIS_MONTH' && !(d.getFullYear() === currentYear && d.getMonth() === currentMonth)) {
        return false;
      }
      if (patientPeriod === 'LAST_MONTH') {
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        if (!(d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth)) return false;
      }
      if (patientPeriod === 'THIS_YEAR' && d.getFullYear() !== currentYear) {
        return false;
      }

      // Custom Month & Year Dropdown Filters
      if (patientStartYear !== 'ALL' && d.getFullYear() !== Number(patientStartYear)) {
        return false;
      }
      if (patientStartMonth !== 'ALL' && d.getMonth() !== Number(patientStartMonth)) {
        return false;
      }

      // Custom Date Range Filters (From / To)
      if (patientStartDate) {
        const start = new Date(patientStartDate);
        start.setHours(0, 0, 0, 0);
        if (d.getTime() < start.getTime()) return false;
      }
      if (patientEndDate) {
        const end = new Date(patientEndDate);
        end.setHours(23, 59, 59, 999);
        if (d.getTime() > end.getTime()) return false;
      }

      // Search query filter
      if (patientSearch.trim()) {
        const q = patientSearch.toLowerCase().trim();
        const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase() : '';
        const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId).toLowerCase();
        const reason = (a.reason ?? '').toLowerCase();
        return pName.includes(q) || pCode.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [completed, patientPeriod, patientStartYear, patientStartMonth, patientStartDate, patientEndDate, patientSearch]);

  // Unique Patients Count
  const uniquePatientsCount = useMemo(() => {
    const ids = new Set(filteredCompletedPatients.map((a) => a.patient?.id ?? (a as any).patientId));
    return ids.size;
  }, [filteredCompletedPatients]);

  // Dynamic Period Description Label
  const getPeriodDescription = () => {
    if (patientPeriod === 'CUSTOM') {
      const parts = [];
      if (patientStartMonth !== 'ALL') parts.push(MONTH_NAMES[Number(patientStartMonth)]);
      if (patientStartYear !== 'ALL') parts.push(patientStartYear);
      if (patientStartDate && patientEndDate) {
        return `Del ${patientStartDate} al ${patientEndDate}`;
      }
      if (parts.length > 0) return `Rango: ${parts.join(' ')}`;
      return 'Rango Personalizado';
    }
    return PERIOD_LABELS[patientPeriod];
  };

  // Reset Patients Filters
  const resetPatientFilters = () => {
    setPatientPeriod('ALL');
    setPatientStartYear('ALL');
    setPatientStartMonth('ALL');
    setPatientStartDate('');
    setPatientEndDate('');
    setPatientSearch('');
  };

  // Export Patients History CSV
  const exportPatientsCSV = () => {
    if (filteredCompletedPatients.length === 0) {
      toast.error('No hay registros para exportar');
      return;
    }
    const headers = ['Fecha', 'Hora', 'ID Paciente', 'Nombre Paciente', 'Motivo Consulta', 'Monto (USD)', 'Estado'];
    const rows = filteredCompletedPatients.map((a) => {
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente';
      const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId);
      return [
        a.date.split('T')[0],
        a.startTime,
        pCode,
        `"${pName}"`,
        `"${a.reason ?? 'Consulta'}"`,
        Number(a.totalAmount).toFixed(2),
        'Atendido',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Historial_Pacientes_Dr_${user?.lastName ?? 'Medico'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Historial de Pacientes en CSV descargado');
  };

  const exportRevenueCSV = () => {
    if (filteredRevenue.length === 0) {
      toast.error('No hay registros para exportar');
      return;
    }
    const headers = ['Fecha', 'Hora', 'ID Paciente', 'Nombre Paciente', 'Monto (USD)', 'Estado'];
    const rows = filteredRevenue.map((a) => {
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente';
      const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId);
      return [
        a.date.split('T')[0],
        a.startTime,
        pCode,
        `"${pName}"`,
        Number(a.totalAmount).toFixed(2),
        'Cobrado',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Ingresos_Dr_${user?.lastName ?? 'Medico'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte de Ingresos en CSV descargado');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 print:p-0">

        {/* ── Executive Printable PDF Template (ONLY visible on print) ── */}
        <div className="hidden print:block font-sans text-neutral-900 leading-normal relative">

          {/* Marca de Agua Antifalsificación repetida en cada página */}
          <div className="watermark-container">
            <div className="watermark-text">
              <div className="text-6xl mb-1 opacity-40">❤️ CARDIOCENTER</div>
              <div>DOCUMENTO OFICIAL AUTÉNTICO</div>
              <div className="text-lg font-bold tracking-normal opacity-80 mt-1">PROHIBIDA SU ALTERACIÓN O COPIA NO AUTORIZADA</div>
              <div className="text-xs font-mono tracking-widest mt-1 opacity-60">REGISTRO AUDITADO EN SISTEMA</div>
            </div>
          </div>

          {/* Header Membrete */}
          <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-xl">
                ❤️
              </div>
              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-neutral-900">CardioCenter</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Centro de Cardiología de Excelencia</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                {activeFilter === 'COMPLETED' ? 'Historial de Pacientes Atendidos' : 'Documento Oficial de Facturación'}
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">Emisión: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 mb-6 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Médico Tratante</p>
              <p className="text-sm font-bold text-neutral-900">Dr(a). {user?.firstName} {user?.lastName}</p>
              <p className="text-neutral-500">Especialista en Cardiología</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Período Auditado</p>
              <p className="text-sm font-bold text-neutral-900">
                {activeFilter === 'COMPLETED' ? getPeriodDescription() : PERIOD_LABELS[timePeriod]}
              </p>
              <p className="text-neutral-500">
                {activeFilter === 'COMPLETED' ? `${filteredCompletedPatients.length} consultas registradas` : `${filteredRevenue.length} transacciones registradas`}
              </p>
            </div>
          </div>

          {/* KPI Executive Summary */}
          {activeFilter === 'COMPLETED' ? (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg border-2 border-neutral-900 bg-neutral-900 p-3 text-white">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Total Pacientes Atendidos</p>
                <p className="text-lg font-extrabold mt-0.5">{filteredCompletedPatients.length} consultas</p>
              </div>
              <div className="rounded-lg border border-neutral-300 bg-white p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Pacientes Únicos</p>
                <p className="text-lg font-extrabold text-neutral-900 mt-0.5">{uniquePatientsCount} pacientes</p>
              </div>
              <div className="rounded-lg border border-neutral-300 bg-white p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Monto Facturado</p>
                <p className="text-lg font-extrabold font-mono text-neutral-900 mt-0.5">
                  ${filteredCompletedPatients.reduce((s, a) => s + Number(a.totalAmount ?? 0), 0).toFixed(2)} USD
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg border-2 border-neutral-900 bg-neutral-900 p-3 text-white">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Total Recaudado</p>
                <p className="text-lg font-extrabold font-mono mt-0.5">${filteredTotal.toFixed(2)} USD</p>
              </div>
              <div className="rounded-lg border border-neutral-300 bg-white p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Consultas Atendidas</p>
                <p className="text-lg font-extrabold text-neutral-900 mt-0.5">{filteredRevenue.length} pacientes</p>
              </div>
              <div className="rounded-lg border border-neutral-300 bg-white p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Promedio por Cita</p>
                <p className="text-lg font-extrabold font-mono text-neutral-900 mt-0.5">${averageTicket.toFixed(2)} USD</p>
              </div>
            </div>
          )}

          {/* Transactions / Patients Table */}
          <table className="w-full text-left text-xs border-collapse border border-neutral-300 mb-8">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                <th className="p-2.5 border-r border-neutral-300 w-8 text-center">#</th>
                <th className="p-2.5 border-r border-neutral-300">Fecha y Hora</th>
                <th className="p-2.5 border-r border-neutral-300">ID Paciente</th>
                <th className="p-2.5 border-r border-neutral-300">Paciente</th>
                <th className="p-2.5 border-r border-neutral-300">Motivo / Diagnóstico</th>
                <th className="p-2.5 text-right">Importe USD</th>
              </tr>
            </thead>
            <tbody>
              {(activeFilter === 'COMPLETED' ? filteredCompletedPatients : filteredRevenue).map((a, idx) => {
                const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente';
                const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId);
                return (
                  <tr key={a.id} className="border-b border-neutral-200">
                    <td className="p-2 border-r border-neutral-200 text-center font-mono text-neutral-500">{idx + 1}</td>
                    <td className="p-2 border-r border-neutral-200 font-medium">{formatDate(a.date)} · {a.startTime} hs</td>
                    <td className="p-2 border-r border-neutral-200 font-mono font-bold text-neutral-700">{pCode}</td>
                    <td className="p-2 border-r border-neutral-200 font-semibold">{pName}</td>
                    <td className="p-2 border-r border-neutral-200 text-neutral-600">{a.reason ?? 'Consulta de Control'}</td>
                    <td className="p-2 text-right font-mono font-bold">${Number(a.totalAmount).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Signature */}
          <div className="mt-12 flex justify-between items-end text-[10px] text-neutral-500 pt-8 border-t border-neutral-200">
            <div>
              <p className="font-semibold text-neutral-700">CardioCenter — Sistema de Gestión Médica</p>
              <p>Documento generado electrónicamente con firma de auditoría digital.</p>
            </div>
            <div className="text-center w-56">
              <div className="border-b border-neutral-900 pb-1 mb-1"></div>
              <p className="font-bold text-neutral-900">Dr(a). {user?.firstName} {user?.lastName}</p>
              <p className="text-[9px]">Firma Autorizada / Sello Médico</p>
            </div>
          </div>
        </div>

        {/* ── Screen Header (Hidden on print) ─────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">Portal Médico</p>
              <h1 className="font-display text-2xl font-semibold text-neutral-900">
                Dr(a). {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-neutral-400">Gestión de agenda y consultas activas</p>
            </div>
          </div>

          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              Ver Todas las Secciones
            </button>
          )}
        </div>

        {/* ── Interactive KPI Filter Cards (Hidden on print) ───────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
          {[
            { id: 'PENDING' as const, icon: Clock, value: pending.length, label: 'Por confirmar', color: 'text-amber-600', bg: 'bg-amber-50', accent: 'border-amber-200' },
            { id: 'CONFIRMED' as const, icon: Calendar, value: confirmed.length, label: 'Confirmadas', color: 'text-primary-600', bg: 'bg-primary-50', accent: 'border-primary-200' },
            { id: 'COMPLETED' as const, icon: Users, value: completed.length, label: 'Pacientes atendidos', color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'border-emerald-200' },
            { id: 'REVENUE' as const, icon: TrendingUp, value: `$${monthRevenue.toLocaleString()}`, label: 'Ingresos totales', color: 'text-neutral-700', bg: 'bg-neutral-100', accent: 'border-neutral-200' },
          ].map((s) => {
            const isActive = activeFilter === s.id;
            return (
              <div
                key={s.id}
                onClick={() => toggleFilter(s.id)}
                className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'ring-2 ring-primary-500 border-transparent shadow-lg bg-primary-50/20 scale-[1.02]'
                    : `${s.accent} hover:-translate-y-1 hover:shadow-md`
                }`}
                style={{ boxShadow: isActive ? undefined : '0 4px 24px -4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  {isActive ? (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Filtrado
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Filtrar →
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-16 print:hidden">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* 1. Pending requests (Visible on ALL or PENDING filter) */}
            {(activeFilter === 'ALL' || activeFilter === 'PENDING') && (
              <section className="print:hidden">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <h2 className="text-base font-semibold text-neutral-900">Solicitudes Pendientes</h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      {pending.length} nueva{pending.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {pending.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-8 text-center">
                    <Clock className="h-8 w-8 text-amber-400 mb-2" />
                    <p className="text-sm font-medium text-neutral-600">No hay solicitudes de citas pendientes por confirmar</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pending.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        viewAs="doctor"
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente'}
                        onStatusChange={handleStatusChange}
                        onOpenPatientAdmin={(app) => { setSelectedAppointment(app); setAdminModalOpen(true); }}
                        loading={actionId === a.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 2. Confirmed agenda (Visible on ALL or CONFIRMED filter) */}
            {(activeFilter === 'ALL' || activeFilter === 'CONFIRMED') && (
              <section className="print:hidden">
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary-500" />
                  <h2 className="text-base font-semibold text-neutral-900">Agenda Confirmada</h2>
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                    {confirmed.length} activa{confirmed.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {confirmed.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                      <Heart className="h-6 w-6 text-primary-400 fill-primary-200" />
                    </div>
                    <p className="text-sm font-medium text-neutral-600">No hay citas confirmadas pendientes</p>
                    <p className="mt-1 text-xs text-neutral-400">Revisa las solicitudes de arriba para confirmarlas</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {confirmed.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        viewAs="doctor"
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente'}
                        onStatusChange={handleStatusChange}
                        onOpenClinicalNote={(app) => { setSelectedAppointment(app); setNoteModalOpen(true); }}
                        onOpenPatientAdmin={(app) => { setSelectedAppointment(app); setAdminModalOpen(true); }}
                        clinicalNoteSaved={!!savedNotes[a.id]}
                        patientAdminSaved={!!savedAdmins[a.id] || !!a.patient?.patientProfile?.dateOfBirth}
                        loading={actionId === a.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 3. Completed Patients History Enhanced (Visible on COMPLETED filter) */}
            {activeFilter === 'COMPLETED' && (
              <section className="animate-fade-in print:hidden">

                {/* Toolbar & Search Bar for Completed Patients */}
                <div className="mb-6 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-neutral-900">Historial de Pacientes Atendidos</h2>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">Busca expedientes, filtra por rango de mes/año y emite reportes de pacientes atendidos</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handlePrintReport}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-all shadow-sm"
                      >
                        <Printer className="h-4 w-4" /> Reporte PDF
                      </button>
                      <button
                        onClick={exportPatientsCSV}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
                      >
                        <Download className="h-4 w-4 text-emerald-600" /> Exportar CSV
                      </button>
                    </div>
                  </div>

                  {/* Preset Period Buttons & Search Input */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      {/* Live Search Input */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          placeholder="Buscar por paciente, cédula o código (PAT-XXX)..."
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-2 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:border-primary-400 focus:bg-white focus:outline-none transition-all"
                        />
                        {patientSearch && (
                          <button
                            onClick={() => setPatientSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Period Quick Presets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-1 hidden sm:inline">Período:</span>
                        {[
                          { id: 'ALL' as const, label: 'Todos' },
                          { id: 'THIS_MONTH' as const, label: 'Este Mes' },
                          { id: 'LAST_MONTH' as const, label: 'Mes Anterior' },
                          { id: 'THIS_YEAR' as const, label: 'Este Año' },
                          { id: 'CUSTOM' as const, label: '🗓️ Rango Personalizado' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setPatientPeriod(p.id);
                              if (p.id !== 'CUSTOM') {
                                setPatientStartYear('ALL');
                                setPatientStartMonth('ALL');
                                setPatientStartDate('');
                                setPatientEndDate('');
                              }
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                              patientPeriod === p.id
                                ? 'bg-neutral-900 text-white shadow-sm'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Custom Range Selector (Visible when CUSTOM or interacting) */}
                    {(patientPeriod === 'CUSTOM' || patientStartYear !== 'ALL' || patientStartMonth !== 'ALL' || patientStartDate || patientEndDate) && (
                      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-primary-100 bg-primary-50/30 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <Filter className="h-3.5 w-3.5 text-primary-600" />
                          <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Filtrar por Mes / Año / Rango:</span>
                        </div>

                        {/* Month Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-neutral-500 font-medium">Mes:</span>
                          <select
                            value={patientStartMonth}
                            onChange={(e) => {
                              setPatientStartMonth(e.target.value);
                              setPatientPeriod('CUSTOM');
                            }}
                            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800 focus:border-primary-400 focus:outline-none"
                          >
                            <option value="ALL">Todos los meses</option>
                            {MONTH_NAMES.map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>
                        </div>

                        {/* Year Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-neutral-500 font-medium">Año:</span>
                          <select
                            value={patientStartYear}
                            onChange={(e) => {
                              setPatientStartYear(e.target.value);
                              setPatientPeriod('CUSTOM');
                            }}
                            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800 focus:border-primary-400 focus:outline-none"
                          >
                            <option value="ALL">Todos los años</option>
                            {availableYears.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        {/* Date Range Inputs */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 font-medium">Desde:</span>
                          <input
                            type="date"
                            value={patientStartDate}
                            onChange={(e) => {
                              setPatientStartDate(e.target.value);
                              setPatientPeriod('CUSTOM');
                            }}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-primary-400 focus:outline-none"
                          />
                          <span className="text-xs text-neutral-500 font-medium">Hasta:</span>
                          <input
                            type="date"
                            value={patientEndDate}
                            onChange={(e) => {
                              setPatientEndDate(e.target.value);
                              setPatientPeriod('CUSTOM');
                            }}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-primary-400 focus:outline-none"
                          />
                        </div>

                        {/* Reset Filter Button */}
                        <button
                          onClick={resetPatientFilters}
                          className="ml-auto text-xs font-semibold text-primary-600 hover:text-primary-800 underline"
                        >
                          Limpiar Filtros
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary KPI Cards for Patients History */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Consultas Completadas</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{filteredCompletedPatients.length} atenciones</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Pacientes Únicos</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{uniquePatientsCount} pacientes</p>
                  </div>
                  <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
                    <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider">Monto Total Atendido</p>
                    <p className="text-2xl font-bold text-primary-900 mt-1">
                      ${filteredCompletedPatients.reduce((s, a) => s + Number(a.totalAmount ?? 0), 0).toLocaleString()} USD
                    </p>
                  </div>
                </div>

                {/* Patient Cards Grid */}
                {filteredCompletedPatients.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
                    <Users className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm font-medium text-neutral-600">
                      {patientSearch ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No hay pacientes atendidos en el período seleccionado'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCompletedPatients.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        viewAs="doctor"
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente'}
                        onOpenClinicalNote={(app) => { setSelectedAppointment(app); setNoteModalOpen(true); }}
                        onOpenPatientAdmin={(app) => { setSelectedAppointment(app); setAdminModalOpen(true); }}
                        clinicalNoteSaved={!!savedNotes[a.id]}
                        patientAdminSaved={!!savedAdmins[a.id] || !!a.patient?.patientProfile?.dateOfBirth}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 4. Revenue breakdown & Report Controls (Visible on REVENUE filter) */}
            {activeFilter === 'REVENUE' && (
              <section className="animate-fade-in">

                {/* Controls & Toolbar (Hidden on print) */}
                <div className="mb-6 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm print:hidden">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-neutral-900">Reporte de Ingresos y Facturación</h2>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">Filtra y ordena el historial de facturación por período y emite el reporte oficial en PDF o CSV</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handlePrintReport}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-all shadow-sm"
                      >
                        <Printer className="h-4 w-4" /> Emitir Reporte PDF
                      </button>
                      <button
                        onClick={exportRevenueCSV}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
                      >
                        <Download className="h-4 w-4 text-emerald-600" /> Exportar CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                    {/* Period filters */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-1">Período:</span>
                      {[
                        { id: 'ALL' as const, label: 'Todos' },
                        { id: 'THIS_MONTH' as const, label: 'Este Mes' },
                        { id: 'LAST_MONTH' as const, label: 'Mes Anterior' },
                        { id: 'THIS_YEAR' as const, label: 'Este Año' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setTimePeriod(p.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            timePeriod === p.id
                              ? 'bg-neutral-900 text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Order selector */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Ordenar por:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="DATE_DESC">Fecha: Más reciente</option>
                        <option value="DATE_ASC">Fecha: Más antigua</option>
                        <option value="AMOUNT_DESC">Monto: Mayor a menor</option>
                        <option value="AMOUNT_ASC">Monto: Menor a mayor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary KPI Cards for Revenue Report (Hidden on print) */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Cobrado</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">${filteredTotal.toLocaleString()} USD</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Pacientes / Consultas</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{filteredRevenue.length} atendidos</p>
                  </div>
                  <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
                    <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider">Promedio por Cita</p>
                    <p className="text-2xl font-bold text-primary-900 mt-1">${averageTicket.toFixed(2)} USD</p>
                  </div>
                </div>

                {/* Transactions Table (Hidden on print) */}
                {filteredRevenue.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center print:hidden">
                    <DollarSign className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm font-medium text-neutral-600">No hay registros de facturación para el período seleccionado</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden print:hidden">
                    <div className="divide-y divide-neutral-100">
                      {filteredRevenue.map((a) => {
                        const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente';
                        const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId);
                        return (
                          <div key={a.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                                <DollarSign className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-neutral-900">{pName}</span>
                                  <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[10px] font-mono font-bold text-neutral-600">{pCode}</span>
                                </div>
                                <p className="text-xs text-neutral-400">{formatDate(a.date)} · {a.startTime} hs</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-neutral-900">{formatPrice(Number(a.totalAmount))}</p>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                Cobrado ✓
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Quick links */}
            {activeFilter === 'ALL' && (
              <section className="grid gap-4 sm:grid-cols-2 print:hidden">
                {[
                  { to: '/doctor/schedules', icon: Calendar, title: 'Gestionar Horarios', desc: 'Configura tu disponibilidad semanal', color: 'bg-primary-50 text-primary-600' },
                  { to: '/doctor/services', icon: Settings, title: 'Gestionar Servicios', desc: 'Administra tus servicios y precios', color: 'bg-neutral-100 text-neutral-600' },
                ].map((l) => (
                  <Link key={l.to} to={l.to}>
                    <div
                      className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-200 hover:border-neutral-200 hover:-translate-y-0.5 cursor-pointer"
                      style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.05)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${l.color}`}>
                          <l.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{l.title}</p>
                          <p className="text-xs text-neutral-400">{l.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-300" />
                    </div>
                  </Link>
                ))}
              </section>
            )}
          </div>
        )}
      </div>

      {/* Clinical Note Modal */}
      {selectedAppointment && (
        <ClinicalNoteModal
          isOpen={noteModalOpen}
          onClose={() => { setNoteModalOpen(false); setSelectedAppointment(null); }}
          appointmentId={selectedAppointment.id}
          patientName={selectedAppointment.patient ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}` : 'Paciente'}
          dateStr={selectedAppointment.date.split('T')[0]}
          onSaved={() => {
            if (selectedAppointment) {
              setSavedNotes((prev) => ({ ...prev, [selectedAppointment.id]: true }));
            }
          }}
        />
      )}

      {/* Patient Admin Modal */}
      {selectedAppointment && (
        <PatientAdminModal
          isOpen={adminModalOpen}
          onClose={() => { setAdminModalOpen(false); setSelectedAppointment(null); }}
          patientId={selectedAppointment.patient ? (selectedAppointment.patient as any).id ?? (selectedAppointment as any).patientId : ''}
          patientName={selectedAppointment.patient ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}` : 'Paciente'}
          onSaved={() => {
            if (selectedAppointment) {
              setSavedAdmins((prev) => ({ ...prev, [selectedAppointment.id]: true }));
            }
            fetchAppointments();
          }}
        />
      )}
    </PageLayout>
  );
}
