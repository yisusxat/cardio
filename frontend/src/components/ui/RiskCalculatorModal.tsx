import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, ArrowRight, RotateCcw, Heart, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { calculateCardiovascularRisk, RiskResult } from '../../lib/risk-calculator';

interface RiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskCalculatorModal({ isOpen, onClose }: RiskCalculatorModalProps) {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [age, setAge] = useState<number>(52);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [systolicBP, setSystolicBP] = useState<number>(135);
  const [totalCholesterol, setTotalCholesterol] = useState<number>(210);
  const [hdlCholesterol, setHdlCholesterol] = useState<number>(45);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(false);

  const [result, setResult] = useState<RiskResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateCardiovascularRisk({
      age,
      gender,
      systolicBP,
      totalCholesterol,
      hdlCholesterol,
      isSmoker,
      hasDiabetes,
    });
    setResult(res);
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
  };

  const handleBookRedirect = () => {
    onClose();
    navigate('/doctors');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Evaluación de Riesgo Cardiovascular (SCORE2)" size="lg">
      {step === 1 ? (
        <form onSubmit={handleCalculate} className="flex flex-col gap-5">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Ingresa tus parámetros clínicos aproximados para calcular tu estimación de riesgo cardiovascular a 10 años.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Edad: <span className="text-primary-600 font-bold">{age} años</span>
              </label>
              <input
                type="range"
                min="30"
                max="85"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-primary-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Sexo Biológico
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                    gender === 'male'
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-600 bg-white'
                  }`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                    gender === 'female'
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-600 bg-white'
                  }`}
                >
                  Mujer
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">Presión Sistólica (mmHg)</label>
              <input
                type="number"
                min="80"
                max="220"
                value={systolicBP}
                onChange={(e) => setSystolicBP(Number(e.target.value))}
                className="input-field py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">Colesterol Total (mg/dL)</label>
              <input
                type="number"
                min="100"
                max="400"
                value={totalCholesterol}
                onChange={(e) => setTotalCholesterol(Number(e.target.value))}
                className="input-field py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">Colesterol HDL (mg/dL)</label>
              <input
                type="number"
                min="20"
                max="120"
                value={hdlCholesterol}
                onChange={(e) => setHdlCholesterol(Number(e.target.value))}
                className="input-field py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3 cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <input
                type="checkbox"
                checked={isSmoker}
                onChange={(e) => setIsSmoker(e.target.checked)}
                className="h-4 w-4 rounded accent-primary-600"
              />
              <span className="text-xs font-medium text-neutral-800">¿Fuma actualmente?</span>
            </label>

            <label className="flex items-center gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3 cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <input
                type="checkbox"
                checked={hasDiabetes}
                onChange={(e) => setHasDiabetes(e.target.checked)}
                className="h-4 w-4 rounded accent-primary-600"
              />
              <span className="text-xs font-medium text-neutral-800">¿Diagnóstico de Diabetes?</span>
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Activity className="h-4 w-4" /> Calcular Mi Riesgo
            </Button>
          </div>
        </form>
      ) : result ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Result Card */}
          <div
            className="flex flex-col items-center rounded-2xl p-6 text-center border"
            style={{ backgroundColor: `${result.categoryColor}0d`, borderColor: `${result.categoryColor}30` }}
          >
            <span className={`mb-2 rounded-full border px-3 py-1 text-xs font-bold ${result.badgeBg} ${result.badgeText}`}>
              {result.categoryLabel}
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-neutral-900">{result.scorePercent}%</span>
              <span className="text-xs font-medium text-neutral-400">riesgo a 10 años</span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm">
              Estimación estadística basada en el algoritmo clínico de riesgo cardiovascular validado internacionalmente.
            </p>
          </div>

          {/* Recommendations list */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
              <ShieldAlert className="h-4 w-4 text-primary-600" /> Recomendaciones Clínicas:
            </h4>
            <ul className="space-y-2.5">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-600">
                  <CheckCircle2 className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Recalcular Parámetros
            </button>

            <button
              onClick={handleBookRedirect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
                boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.35)',
              }}
            >
              <Heart className="h-4 w-4" /> Agendar Consulta Especializada <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
