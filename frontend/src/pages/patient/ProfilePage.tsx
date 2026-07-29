import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, User, Shield, Phone, Calendar,
  Droplets, Activity, AlertTriangle, Users, ChevronDown,
  ChevronUp, Save, CheckCircle, FileText,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/use-auth";
import { useUIStore } from "../../stores/ui.store";
import { getPatientCode, formatDate } from "../../lib/utils";
import api from "../../lib/api";
import type { PatientProfile, Gender, BloodType, AlcoholConsumption } from "../../stores/auth.store";

/* ── helpers ───────────────────────────────────────────────────────────── */
function calcAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function calcBMI(w: number | null | undefined, h: number | null | undefined): string | null {
  if (!w || !h || h === 0) return null;
  const bmi = w / ((h / 100) ** 2);
  return bmi.toFixed(1);
}

const BLOOD_TYPE_LABEL: Record<BloodType, string> = {
  A_POS: "A+", A_NEG: "A-", B_POS: "B+", B_NEG: "B-",
  AB_POS: "AB+", AB_NEG: "AB-", O_POS: "O+", O_NEG: "O-",
};
const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Masculino", FEMALE: "Femenino",
  OTHER: "Otro", PREFER_NOT_TO_SAY: "Prefiero no decirlo",
};
const ALCOHOL_LABEL: Record<AlcoholConsumption, string> = {
  NONE: "No consume", OCCASIONAL: "Ocasional",
  MODERATE: "Moderado", HEAVY: "Frecuente",
};

/* ── section accordion ────────────────────────────────────────────────── */
function Section({
  title, icon: Icon, open, onToggle, children, accent,
}: {
  title: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-3xl border border-neutral-100 bg-white overflow-hidden"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: accent ?? "linear-gradient(135deg, #e11d48, #9f1239)" }}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6 border-t border-neutral-100 pt-5">{children}</div>}
    </div>
  );
}

/* ── select field ─────────────────────────────────────────────────────── */
function SelectField({
  label, id, value, onChange, options, placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── toggle field ─────────────────────────────────────────────────────── */
function ToggleField({
  label, value, onChange,
}: { label: string; value: boolean | null | undefined; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-4">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((b) => (
          <button
            key={String(b)}
            type="button"
            onClick={() => onChange(value === b ? null : b)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: value === b
                ? b ? "linear-gradient(135deg,#e11d48,#9f1239)" : "#f3f4f6"
                : "transparent",
              color: value === b ? (b ? "white" : "#374151") : "#9ca3af",
              border: value === b ? "none" : "1px solid #e5e7eb",
            }}
          >
            {b ? "Sí" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
type FormData = {
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  weightKg: string;
  heightCm: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  smoker: boolean | null;
  alcoholConsumption: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

const EMPTY: FormData = {
  phone: "", dateOfBirth: "", gender: "", bloodType: "",
  weightKg: "", heightCm: "", allergies: "", chronicConditions: "",
  currentMedications: "", smoker: null, alcoholConsumption: "",
  emergencyContactName: "", emergencyContactPhone: "",
};

function profileToForm(p: PatientProfile | null | undefined): FormData {
  if (!p) return EMPTY;
  return {
    phone: p.phone ?? "",
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
    gender: p.gender ?? "",
    bloodType: p.bloodType ?? "",
    weightKg: p.weightKg != null ? String(p.weightKg) : "",
    heightCm: p.heightCm != null ? String(p.heightCm) : "",
    allergies: p.allergies ?? "",
    chronicConditions: p.chronicConditions ?? "",
    currentMedications: p.currentMedications ?? "",
    smoker: p.smoker ?? null,
    alcoholConsumption: p.alcoholConsumption ?? "",
    emergencyContactName: p.emergencyContactName ?? "",
    emergencyContactPhone: p.emergencyContactPhone ?? "",
  };
}

interface ClinicalHistoryNote {
  id: string;
  diagnosis: string;
  treatment: string;
  bpRead?: string | null;
  heartRate?: string | null;
  notes?: string | null;
  createdAt: string;
  doctor?: { user: { firstName: string; lastName: string } };
  appointment?: { date: string };
}

export default function PatientProfilePage() {
  const { user, fetchMe } = useAuth();
  const toast = useUIStore();
  const [form, setForm] = useState<FormData>(profileToForm(user?.patientProfile));
  const [historyNotes, setHistoryNotes] = useState<ClinicalHistoryNote[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState<string>("personal");

  // Fetch fresh profile from API on mount to guarantee real-time sync with doctor edits
  useEffect(() => {
    fetchMe();
    api.get("/patients/profile")
      .then((res) => {
        if (res.data?.data) {
          setForm(profileToForm(res.data.data));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.patientProfile) {
      setForm(profileToForm(user.patientProfile));
    }
  }, [user?.patientProfile]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/patients/history/${user.id}`)
        .then((res) => setHistoryNotes(res.data?.data ?? []))
        .catch(() => setHistoryNotes([]));
    }
  }, [user?.id]);

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };
  const setVal = (field: keyof FormData) => (v: string | boolean | null) => {
    setForm((f) => ({ ...f, [field]: v }));
    setSaved(false);
  };

  const toggle = (section: string) => setOpenSection((s) => (s === section ? "" : section));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/patients/profile", {
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: (form.gender as Gender) || null,
        bloodType: (form.bloodType as BloodType) || null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
        allergies: form.allergies || null,
        chronicConditions: form.chronicConditions || null,
        currentMedications: form.currentMedications || null,
        smoker: form.smoker,
        alcoholConsumption: (form.alcoholConsumption as AlcoholConsumption) || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
      });
      await fetchMe();
      setSaved(true);
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const age = calcAge(form.dateOfBirth);
  const bmi = calcBMI(
    form.weightKg ? parseFloat(form.weightKg) : null,
    form.heightCm ? parseFloat(form.heightCm) : null,
  );

  const completedFields = [
    form.phone, form.dateOfBirth, form.gender, form.bloodType,
    form.weightKg, form.heightCm, form.allergies, form.chronicConditions,
    form.currentMedications, form.smoker !== null ? "x" : "",
    form.alcoholConsumption, form.emergencyContactName, form.emergencyContactPhone,
  ].filter(Boolean).length;
  const totalFields = 13;
  const completionPct = Math.round((completedFields / totalFields) * 100);

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/patient/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Link>

        {/* Hero card */}
        <div
          className="mb-6 rounded-3xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0f0005 0%, #2d000f 45%, #4a0018 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0"
            style={{ height: "65%", background: "radial-gradient(ellipse 80% 60% at 40% 100%, rgba(225,29,72,0.18) 0%, transparent 70%)" }}
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg, #e11d48, #9f1239)", boxShadow: "0 8px 32px -8px rgba(225,29,72,0.5)" }}
              >
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    <Shield className="h-3.5 w-3.5" /> Paciente Verificado
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-400/40 bg-primary-500/20 px-3 py-1 text-xs font-mono font-bold text-primary-200">
                    ID: {getPatientCode(user?.id)}
                  </span>
                </div>
                <h1 className="font-display text-2xl font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="mt-0.5 text-sm text-white/50">{user?.email}</p>
              </div>
            </div>

            {/* Completeness ring */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none" stroke="#e11d48" strokeWidth="7"
                    strokeDasharray={`${(completionPct / 100) * 213.6} 213.6`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <span className="relative text-xl font-bold text-white">{completionPct}%</span>
              </div>
              <p className="text-xs text-white/50">Perfil completo</p>
            </div>
          </div>

          {/* Quick stats */}
          {(age != null || bmi || form.bloodType) && (
            <div className="relative mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              {age != null && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  <Calendar className="h-3.5 w-3.5 text-primary-400" /> {age} años
                </span>
              )}
              {form.bloodType && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  <Droplets className="h-3.5 w-3.5 text-primary-400" />
                  {BLOOD_TYPE_LABEL[form.bloodType as BloodType]}
                </span>
              )}
              {bmi && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  <Activity className="h-3.5 w-3.5 text-primary-400" /> IMC {bmi}
                </span>
              )}
              {form.phone && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  <Phone className="h-3.5 w-3.5 text-primary-400" /> {form.phone}
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── A. Información Personal ── */}
          <Section title="Información Personal" icon={User} open={openSection === "personal"} onToggle={() => toggle("personal")} accent="linear-gradient(135deg,#2563eb,#1d4ed8)">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1.5 block">Nombre completo</label>
                <p className="rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm font-medium text-neutral-600">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1.5 block">Correo electrónico</label>
                <p className="rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm font-medium text-neutral-600">
                  {user?.email}
                </p>
              </div>
              <Input
                label="Teléfono"
                id="phone"
                type="tel"
                placeholder="+58 414 000 0000"
                value={form.phone}
                onChange={set("phone")}
              />
              <Input
                label="Fecha de nacimiento"
                id="dob"
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
                hint={age != null ? `${age} años` : undefined}
              />
              <SelectField
                label="Género"
                id="gender"
                value={form.gender}
                onChange={setVal("gender")}
                placeholder="Seleccionar..."
                options={Object.entries(GENDER_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              />
            </div>
          </Section>

          {/* ── B. Datos Clínicos ── */}
          <Section title="Datos Clínicos" icon={Activity} open={openSection === "clinical"} onToggle={() => toggle("clinical")} accent="linear-gradient(135deg,#0891b2,#0e7490)">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Tipo de sangre"
                id="bloodType"
                value={form.bloodType}
                onChange={setVal("bloodType")}
                placeholder="Seleccionar..."
                options={Object.entries(BLOOD_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              />
              <Input
                label="Peso (kg)"
                id="weight"
                type="number"
                placeholder="70"
                value={form.weightKg}
                onChange={set("weightKg")}
                hint={bmi ? `IMC: ${bmi}` : undefined}
              />
              <Input
                label="Talla (cm)"
                id="height"
                type="number"
                placeholder="170"
                value={form.heightCm}
                onChange={set("heightCm")}
              />
              <SelectField
                label="Consumo de alcohol"
                id="alcohol"
                value={form.alcoholConsumption}
                onChange={setVal("alcoholConsumption")}
                placeholder="Seleccionar..."
                options={Object.entries(ALCOHOL_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              />
            </div>
            <div className="mt-4">
              <ToggleField
                label="¿Fumador/a activo/a?"
                value={form.smoker}
                onChange={setVal("smoker")}
              />
            </div>
          </Section>

          {/* ── C. Antecedentes Médicos ── */}
          <Section title="Antecedentes Médicos" icon={AlertTriangle} open={openSection === "history"} onToggle={() => toggle("history")} accent="linear-gradient(135deg,#d97706,#b45309)">
            <div className="flex flex-col gap-4">
              {[
                { field: "allergies" as const, label: "Alergias conocidas", placeholder: "Ej: Penicilina, látex, mariscos..." },
                { field: "chronicConditions" as const, label: "Condiciones crónicas", placeholder: "Ej: Hipertensión, diabetes tipo 2..." },
                { field: "currentMedications" as const, label: "Medicamentos actuales", placeholder: "Ej: Losartán 50mg, Metformina 850mg..." },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label htmlFor={field} className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {label}
                  </label>
                  <textarea
                    id={field}
                    rows={3}
                    placeholder={placeholder}
                    value={form[field] as string}
                    onChange={set(field)}
                    className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* ── D. Contacto de Emergencia ── */}
          <Section title="Contacto de Emergencia" icon={Users} open={openSection === "emergency"} onToggle={() => toggle("emergency")} accent="linear-gradient(135deg,#dc2626,#b91c1c)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre del contacto"
                id="ec-name"
                placeholder="Ana García"
                value={form.emergencyContactName}
                onChange={set("emergencyContactName")}
              />
              <Input
                label="Teléfono del contacto"
                id="ec-phone"
                type="tel"
                placeholder="+58 412 000 0000"
                value={form.emergencyContactPhone}
                onChange={set("emergencyContactPhone")}
              />
            </div>
          </Section>

          {/* ── E. Historial de Fichas Clínicas & Recetas ── */}
          <Section
            title={`Historial de Consultas Médicas (${historyNotes.length})`}
            icon={FileText}
            open={openSection === "notes"}
            onToggle={() => toggle("notes")}
            accent="linear-gradient(135deg,#e11d48,#9f1239)"
          >
            {historyNotes.length === 0 ? (
              <div className="py-6 text-center text-neutral-400 text-xs">
                Aún no posees expedientes o fichas clínicas emitidas por tus médicos tratantes.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {historyNotes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <span className="font-semibold text-neutral-800">
                          {formatDate(note.appointment?.date ?? note.createdAt)}
                        </span>
                        {note.doctor && (
                          <span className="text-neutral-500 font-medium">
                            · Dr(a). {note.doctor.user.firstName} {note.doctor.user.lastName}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 font-mono text-[11px] text-neutral-600 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                        {note.bpRead && <span>PA: {note.bpRead}</span>}
                        {note.heartRate && <span>FC: {note.heartRate} bpm</span>}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">Diagnóstico</span>
                      <p className="font-semibold text-neutral-900">{note.diagnosis}</p>
                    </div>
                    <div className="mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">Tratamiento & Prescripción</span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-xl border border-neutral-200/80">{note.treatment}</p>
                    </div>
                    {note.notes && (
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">Notas de Evolución</span>
                        <p className="text-neutral-500 italic">{note.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Save button */}
          <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-6 py-4" style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06)" }}>
            <p className="text-xs text-neutral-400">
              {saved
                ? <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><CheckCircle className="h-3.5 w-3.5" /> Guardado</span>
                : "Los cambios se guardan en tu expediente médico"}
            </p>
            <Button type="submit" loading={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar perfil
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
