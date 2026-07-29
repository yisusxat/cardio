export interface RiskInput {
  age: number;
  gender: 'male' | 'female';
  systolicBP: number; // mmHg
  totalCholesterol: number; // mg/dL
  hdlCholesterol: number; // mg/dL
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface RiskResult {
  scorePercent: number;
  category: 'low' | 'moderate' | 'high' | 'very_high';
  categoryLabel: string;
  categoryColor: string;
  badgeBg: string;
  badgeText: string;
  recommendations: string[];
}

export function calculateCardiovascularRisk(input: RiskInput): RiskResult {
  const { age, gender, systolicBP, totalCholesterol, hdlCholesterol, isSmoker, hasDiabetes } = input;

  // Base score points according to modified Framingham / SCORE2 estimation
  let points = 0;

  // Age factor
  if (age >= 70) points += 8;
  else if (age >= 60) points += 6;
  else if (age >= 50) points += 4;
  else if (age >= 40) points += 2;

  // Gender base
  if (gender === 'male') points += 2;

  // Systolic Blood Pressure
  if (systolicBP >= 160) points += 5;
  else if (systolicBP >= 140) points += 3;
  else if (systolicBP >= 130) points += 1;

  // Total Cholesterol
  if (totalCholesterol >= 280) points += 4;
  else if (totalCholesterol >= 240) points += 3;
  else if (totalCholesterol >= 200) points += 1;

  // HDL Cholesterol (protective factor)
  if (hdlCholesterol < 40) points += 2;
  else if (hdlCholesterol >= 60) points -= 1;

  // Risk Factors
  if (isSmoker) points += 4;
  if (hasDiabetes) points += 4;

  // Calculate percentage
  let scorePercent = Math.min(Math.max(Math.round(points * 1.8 * 10) / 10, 1.2), 38.5);

  let category: 'low' | 'moderate' | 'high' | 'very_high' = 'low';
  let categoryLabel = 'Riesgo Bajo';
  let categoryColor = '#10b981'; // Emerald
  let badgeBg = 'bg-emerald-50 border-emerald-200';
  let badgeText = 'text-emerald-700';
  let recommendations: string[] = [];

  if (scorePercent >= 20 || hasDiabetes && systolicBP >= 160) {
    category = 'very_high';
    categoryLabel = 'Riesgo Muy Alto';
    categoryColor = '#e11d48'; // Crimson Red
    badgeBg = 'bg-primary-50 border-primary-200';
    badgeText = 'text-primary-700';
    recommendations = [
      'Requiere evaluación cardiológica urgente con nuestros especialistas.',
      'Iniciar o ajustar tratamiento antihipertensivo y de lípidos.',
      'Control diario de presión arterial y monitoreo de síntomas.',
      'Modificación estricta del estilo de vida (dieta cardioprotectora y cese de tabaco).',
    ];
  } else if (scorePercent >= 10) {
    category = 'high';
    categoryLabel = 'Riesgo Alto';
    categoryColor = '#f97316'; // Orange
    badgeBg = 'bg-orange-50 border-orange-200';
    badgeText = 'text-orange-700';
    recommendations = [
      'Se recomienda agendar una consulta especializada en las próximas 2 semanas.',
      'Realización de ecocardiograma o prueba de esfuerzo.',
      'Optimización de metas de colesterol LDL (< 70 mg/dL).',
      'Ejercicio físico moderado (mínimo 150 min/semana).',
    ];
  } else if (scorePercent >= 5) {
    category = 'moderate';
    categoryLabel = 'Riesgo Moderado';
    categoryColor = '#eab308'; // Amber
    badgeBg = 'bg-amber-50 border-amber-200';
    badgeText = 'text-amber-700';
    recommendations = [
      'Programar un chequeo cardiovascular preventivo anual.',
      'Monitoreo periódico de presión arterial y perfil lipídico.',
      'Mantener dieta mediterránea rica en omega-3 y baja en sodio.',
      'Evitar el sedentarismo y controlar el estrés.',
    ];
  } else {
    category = 'low';
    categoryLabel = 'Riesgo Bajo';
    categoryColor = '#10b981'; // Emerald
    badgeBg = 'bg-emerald-50 border-emerald-200';
    badgeText = 'text-emerald-700';
    recommendations = [
      '¡Felicitaciones! Tus indicadores actuales se encuentran en rangos saludables.',
      'Mantener hábitos de vida activos y alimentación balanceada.',
      'Reevaluación de riesgo cardiovascular en 1 a 2 años.',
    ];
  }

  return {
    scorePercent,
    category,
    categoryLabel,
    categoryColor,
    badgeBg,
    badgeText,
    recommendations,
  };
}
