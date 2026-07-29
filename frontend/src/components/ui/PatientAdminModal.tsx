import { useState, useEffect } from "react";
import {
  User, Droplets, Activity,
  AlertTriangle, Users, CheckCircle, Lock, FileText, Calendar,
} from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import Spinner from "./Spinner";
import { useUIStore } from "../../stores/ui.store";
import { getPatientCode, formatDate } from "../../lib/utils";
import api from "../../lib/api";

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type BloodType = "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG";
type AlcoholConsumption = "NONE" | "OCCASIONAL" | "MODERATE" | "HEAVY";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "OTHER", label: "Otro" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiero no decirlo" },
];
const BLOOD_OPTIONS: { value: BloodType; label: string }[] = [
  { value: "A_POS", label: "A+" }, { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" }, { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" }, { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" }, { value: "O_NEG", label: "O-" },
];
const ALCOHOL_OPTIONS: { value: AlcoholConsumption; label: string }[] = [
  { value: "NONE", label: "No consume" },
  { value: "OCCASIONAL", label: "Ocasional" },
  { value: "MODERATE", label: "Moderado" },
  { value: "HEAVY", label: "Frecuente" },
];

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

interface PatientAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSaved: () => void;
}

interface FormState {
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
}

const EMPTY: FormState = {
  phone: "", dateOfBirth: "", gender: "", bloodType: "",
  weightKg: "", heightCm: "", allergies: "", chronicConditions: "",
  currentMedications: "", smoker: null, alcoholConsumption: "",
  emergencyContactName: "", emergencyContactPhone: "",
};

function SelectField({ label, id, value, onChange, options, placeholder }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, accent }: { icon: React.ElementType; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: accent }}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</span>
    </div>
  );
}

export default function PatientAdminModal({
  isOpen, onClose, patientId, patientName, onSaved,
}: PatientAdminModalProps) {
  const toast = useUIStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [historyNotes, setHistoryNotes] = useState<ClinicalHistoryNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const patientCode = getPatientCode(patientId);

  // Fetch existing patient profile data and clinical history on open
  useEffect(() => {
    if (isOpen && patientId) {
      setLoading(true);
      setAuthError(null);
      Promise.all([
        api.get(`/patients/summary/${patientId}`),
        api.get(`/patients/history/${patientId}`).catch(() => ({ data: { data: [] } })),
      ])
        .then(([resSummary, resHistory]) => {
          const p = resSummary.data.data?.profile;
          if (p) {
            setForm({
              phone: p.phone ?? "",
              dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "",
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
            });
          } else {
            setForm(EMPTY);
          }
          setHistoryNotes(resHistory.data?.data ?? []);
        })
        .catch((err) => {
          if (err.response?.status === 403) {
            setAuthError(err.response?.data?.error ?? "No posee permisos para ver esta ficha.");
          } else {
            setForm(EMPTY);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, patientId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };
  const setVal = (field: keyof FormState) => (v: string | boolean | null) => {
    setForm((f) => ({ ...f, [field]: v }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/patients/admin/${patientId}`, {
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        bloodType: form.bloodType || null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
        allergies: form.allergies || null,
        chronicConditions: form.chronicConditions || null,
        currentMedications: form.currentMedications || null,
        smoker: form.smoker,
        alcoholConsumption: form.alcoholConsumption || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
      });
      toast.success(`Ficha de paciente (${patientCode}) guardada`);
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "No se pudo guardar la ficha administrativa";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const hasMinimumData = !!(form.phone || form.dateOfBirth || form.gender);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha de Paciente: ${patientName}`} size="lg">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      ) : authError ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50 rounded-2xl border border-rose-200">
          <Lock className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-bold text-rose-900">Acceso Restringido</h3>
          <p className="mt-1 text-xs text-rose-700 max-w-sm">{authError}</p>
          <Button variant="secondary" onClick={onClose} className="mt-5">Cerrar</Button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-5">

          {/* Header ID banner */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-900 text-white px-4 py-3 shadow-md">
            <div>
              <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Código Único de Paciente</p>
              <p className="text-base font-mono font-bold text-primary-400">{patientCode}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-neutral-300">{patientName}</span>
              <p className="text-[10px] text-neutral-400">Expediente Médico Digital</p>
            </div>
          </div>

          {/* Notice banner */}
          {!hasMinimumData && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Ficha Administrativa Requerida</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Por favor complete los datos básicos para poder completar y archivar la consulta médica.
                </p>
              </div>
            </div>
          )}

          {/* A. Datos Personales */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <SectionHeader icon={User} title="Datos Personales" accent="linear-gradient(135deg,#2563eb,#1d4ed8)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Teléfono *" id="adm-phone" type="tel" placeholder="+58 414 000 0000" value={form.phone} onChange={set("phone")} required />
              <Input label="Fecha de nacimiento *" id="adm-dob" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} required />
              <SelectField label="Género *" id="adm-gender" value={form.gender} onChange={setVal("gender")} placeholder="Seleccionar..." options={GENDER_OPTIONS} />
            </div>
          </div>

          {/* B. Datos Clínicos básicos */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <SectionHeader icon={Activity} title="Datos Clínicos Básicos" accent="linear-gradient(135deg,#0891b2,#0e7490)" />
            <div className="grid gap-3 sm:grid-cols-3">
              <SelectField label="Tipo de sangre" id="adm-blood" value={form.bloodType} onChange={setVal("bloodType")} placeholder="Seleccionar..." options={BLOOD_OPTIONS} />
              <Input label="Peso (kg)" id="adm-weight" type="number" placeholder="70" value={form.weightKg} onChange={set("weightKg")} />
              <Input label="Talla (cm)" id="adm-height" type="number" placeholder="170" value={form.heightCm} onChange={set("heightCm")} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField label="Consumo de alcohol" id="adm-alcohol" value={form.alcoholConsumption} onChange={setVal("alcoholConsumption")} placeholder="Seleccionar..." options={ALCOHOL_OPTIONS} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">¿Fumador/a?</label>
                <div className="flex gap-2 pt-1">
                  {[true, false].map((b) => (
                    <button key={String(b)} type="button"
                      onClick={() => setVal("smoker")(form.smoker === b ? null : b)}
                      className="rounded-lg px-4 py-2 text-xs font-semibold transition-all border"
                      style={{
                        background: form.smoker === b ? (b ? "linear-gradient(135deg,#e11d48,#9f1239)" : "#f3f4f6") : "white",
                        color: form.smoker === b ? (b ? "white" : "#374151") : "#9ca3af",
                        borderColor: form.smoker === b ? "transparent" : "#e5e7eb",
                      }}
                    >{b ? "Sí" : "No"}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* C. Antecedentes */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <SectionHeader icon={Droplets} title="Antecedentes Médicos" accent="linear-gradient(135deg,#d97706,#b45309)" />
            <div className="flex flex-col gap-3">
              {[
                { field: "allergies" as const, label: "Alergias conocidas", placeholder: "Ej: Penicilina, látex..." },
                { field: "chronicConditions" as const, label: "Condiciones crónicas", placeholder: "Ej: Hipertensión, diabetes..." },
                { field: "currentMedications" as const, label: "Medicamentos actuales", placeholder: "Ej: Losartán 50mg..." },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label htmlFor={field} className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</label>
                  <textarea id={field} rows={2} placeholder={placeholder} value={form[field] as string} onChange={set(field)}
                    className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* D. Emergencia */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <SectionHeader icon={Users} title="Contacto de Emergencia" accent="linear-gradient(135deg,#dc2626,#b91c1c)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Nombre del contacto" id="adm-ec-name" placeholder="Ana García" value={form.emergencyContactName} onChange={set("emergencyContactName")} />
              <Input label="Teléfono del contacto" id="adm-ec-phone" type="tel" placeholder="+58 412 000 0000" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} />
            </div>
          </div>

          {/* E. Historial Clínico de Consultas */}
          {historyNotes.length > 0 && (
            <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
              <SectionHeader icon={FileText} title={`Historial Clínico (${historyNotes.length} consulta${historyNotes.length > 1 ? 's' : ''})`} accent="linear-gradient(135deg,#e11d48,#9f1239)" />
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {historyNotes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary-600" />
                        <span className="font-semibold text-neutral-800">
                          {formatDate(note.appointment?.date ?? note.createdAt)}
                        </span>
                        {note.doctor && (
                          <span className="text-neutral-400">
                            · Dr(a). {note.doctor.user.firstName} {note.doctor.user.lastName}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 font-mono text-[10px] text-neutral-500">
                        {note.bpRead && <span>PA: {note.bpRead}</span>}
                        {note.heartRate && <span>FC: {note.heartRate}</span>}
                      </div>
                    </div>
                    <p className="font-semibold text-neutral-800 mb-1">Diagnóstico: {note.diagnosis}</p>
                    <p className="text-neutral-600 leading-relaxed">Tratamiento: {note.treatment}</p>
                    {note.notes && <p className="mt-1 text-neutral-400 italic">Notas: {note.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              <CheckCircle className="h-4 w-4" /> Guardar Ficha Paciente
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
