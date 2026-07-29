import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Clock, CheckCircle, Users, ArrowRight,
  Heart, Settings, TrendingUp, DollarSign, RotateCcw,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import AppointmentCard, { Appointment } from "../../components/appointments/AppointmentCard";
import Spinner from "../../components/ui/Spinner";
import ClinicalNoteModal from "../../components/ui/ClinicalNoteModal";
import PatientAdminModal from "../../components/ui/PatientAdminModal";
import api from "../../lib/api";
import { useAuth } from "../../hooks/use-auth";
import { useUIStore } from "../../stores/ui.store";
import { formatDate, formatPrice, getPatientCode } from "../../lib/utils";

type FilterType = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "REVENUE";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const toast = useUIStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});
  const [savedAdmins, setSavedAdmins] = useState<Record<string, boolean>>({});

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.data ?? []);
    } catch {
      toast.error("Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setActionId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success("Estado actualizado correctamente");
      fetchAppointments();
    } catch {
      toast.error("No se pudo actualizar el estado de la cita");
    } finally {
      setActionId(null);
    }
  };

  const pending = appointments.filter((a) => a.status === "PENDING");
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const monthRevenue = completed.reduce((s, a) => s + Number(a.totalAmount ?? 0), 0);

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  const toggleFilter = (type: FilterType) => {
    setActiveFilter((prev) => (prev === type ? "ALL" : type));
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
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

          {activeFilter !== "ALL" && (
            <button
              onClick={() => setActiveFilter("ALL")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              Ver Todas las Secciones
            </button>
          )}
        </div>

        {/* ── Interactive KPI Filter Cards ───────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { id: "PENDING" as const, icon: Clock, value: pending.length, label: "Por confirmar", color: "text-amber-600", bg: "bg-amber-50", accent: "border-amber-200" },
            { id: "CONFIRMED" as const, icon: Calendar, value: confirmed.length, label: "Confirmadas", color: "text-primary-600", bg: "bg-primary-50", accent: "border-primary-200" },
            { id: "COMPLETED" as const, icon: Users, value: completed.length, label: "Pacientes atendidos", color: "text-emerald-600", bg: "bg-emerald-50", accent: "border-emerald-200" },
            { id: "REVENUE" as const, icon: TrendingUp, value: `$${monthRevenue.toLocaleString()}`, label: "Ingresos totales", color: "text-neutral-700", bg: "bg-neutral-100", accent: "border-neutral-200" },
          ].map((s) => {
            const isActive = activeFilter === s.id;
            return (
              <div
                key={s.id}
                onClick={() => toggleFilter(s.id)}
                className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "ring-2 ring-primary-500 border-transparent shadow-lg bg-primary-50/20 scale-[1.02]"
                    : `${s.accent} hover:-translate-y-1 hover:shadow-md`
                }`}
                style={{ boxShadow: isActive ? undefined : "0 4px 24px -4px rgba(0,0,0,0.06)" }}
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
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* 1. Pending requests (Visible on ALL or PENDING filter) */}
            {(activeFilter === "ALL" || activeFilter === "PENDING") && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <h2 className="text-base font-semibold text-neutral-900">Solicitudes Pendientes</h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      {pending.length} nueva{pending.length !== 1 ? "s" : ""}
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
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Paciente"}
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
            {(activeFilter === "ALL" || activeFilter === "CONFIRMED") && (
              <section>
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary-500" />
                  <h2 className="text-base font-semibold text-neutral-900">Agenda Confirmada</h2>
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                    {confirmed.length} activa{confirmed.length !== 1 ? "s" : ""}
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
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Paciente"}
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

            {/* 3. Completed patients history (Visible on COMPLETED filter) */}
            {activeFilter === "COMPLETED" && (
              <section className="animate-fade-in">
                <div className="mb-5 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-base font-semibold text-neutral-900">Historial de Pacientes Atendidos</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {completed.length} paciente{completed.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {completed.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
                    <Users className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm font-medium text-neutral-600">Aún no hay pacientes marcados como atendidos</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completed.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        viewAs="doctor"
                        patientName={a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Paciente"}
                        onOpenClinicalNote={(app) => { setSelectedAppointment(app); setNoteModalOpen(true); }}
                        onOpenPatientAdmin={(app) => { setSelectedAppointment(app); setAdminModalOpen(true); }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 4. Revenue breakdown (Visible on REVENUE filter) */}
            {activeFilter === "REVENUE" && (
              <section className="animate-fade-in">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-base font-semibold text-neutral-900">Desglose de Ingresos y Facturación</h2>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">Total: ${monthRevenue.toLocaleString()} USD</span>
                </div>

                {completed.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
                    <DollarSign className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm font-medium text-neutral-600">No hay registros de ingresos para mostrar</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                    <div className="divide-y divide-neutral-100">
                      {completed.map((a) => {
                        const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Paciente";
                        const pCode = getPatientCode(a.patient?.id ?? (a as any).patientId);
                        return (
                          <div key={a.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
            {activeFilter === "ALL" && (
              <section className="grid gap-4 sm:grid-cols-2">
                {[
                  { to: "/doctor/schedules", icon: Calendar, title: "Gestionar Horarios", desc: "Configura tu disponibilidad semanal", color: "bg-primary-50 text-primary-600" },
                  { to: "/doctor/services", icon: Settings, title: "Gestionar Servicios", desc: "Administra tus servicios y precios", color: "bg-neutral-100 text-neutral-600" },
                ].map((l) => (
                  <Link key={l.to} to={l.to}>
                    <div
                      className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-200 hover:border-neutral-200 hover:-translate-y-0.5 cursor-pointer"
                      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.05)" }}
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
          patientName={selectedAppointment.patient ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}` : "Paciente"}
          dateStr={selectedAppointment.date.split("T")[0]}
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
          patientId={selectedAppointment.patient ? (selectedAppointment.patient as any).id ?? (selectedAppointment as any).patientId : ""}
          patientName={selectedAppointment.patient ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}` : "Paciente"}
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
