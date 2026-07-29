import { useState } from 'react';
import { Printer, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useUIStore } from '../../stores/ui.store';

interface ClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  dateStr: string;
  onSaved?: () => void;
}

export default function ClinicalNoteModal({ isOpen, onClose, patientName, dateStr, onSaved }: ClinicalNoteModalProps) {
  const toast = useUIStore();
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [bpRead, setBpRead] = useState('120/80');
  const [heartRate, setHeartRate] = useState('72');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success(`Ficha clínica guardada para ${patientName}`);
    onSaved?.();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Expediente Clínico: ${patientName}`} size="lg">
      <form onSubmit={handleSave} className="flex flex-col gap-4 print:p-0">
        <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-100">
          <div>
            <p className="text-xs font-semibold text-neutral-800">{patientName}</p>
            <p className="text-[11px] text-neutral-400">Fecha de consulta: {dateStr}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[11px] font-mono bg-white px-2 py-1 rounded border text-neutral-600">
              PA: {bpRead} mmHg
            </span>
            <span className="text-[11px] font-mono bg-white px-2 py-1 rounded border text-neutral-600">
              FC: {heartRate} bpm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Presión Arterial Examen</label>
            <input
              type="text"
              value={bpRead}
              onChange={(e) => setBpRead(e.target.value)}
              className="input-field py-1.5 text-xs font-mono"
              placeholder="120/80"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Frecuencia Cardíaca (bpm)</label>
            <input
              type="text"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="input-field py-1.5 text-xs font-mono"
              placeholder="72"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Diagnóstico Principal (CIE-10)</label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Ej. I10 - Hipertensión arterial esencial"
            className="input-field py-2 text-xs"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Tratamiento & Prescripción</label>
          <textarea
            rows={3}
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Medicamentos indicados, dosis y frecuencia..."
            className="input-field resize-none text-xs"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Notas de Evolución (Opcional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones de seguimiento..."
            className="input-field resize-none text-xs"
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
          {saved ? (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <Printer className="h-4 w-4" /> Imprimir Receta / Informe PDF
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit">
              <CheckCircle className="h-4 w-4" /> Guardar Expediente
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
