// Utilidades para análisis de síntomas

import type { UrgencyLevel } from '../types';

/**
 * Calcula el nivel de urgencia basado en síntomas
 */
export const calculateUrgencyLevel = (symptoms: string[]): UrgencyLevel => {
  const symptomCount = symptoms.length;
  
  // Síntomas de alarma que requieren atención urgente
  const alarmSignals = [
    'sangrado',
    'perdida-peso',
    'fiebre',
    'dolor-severo',
    'incontinencia-total',
  ];
  
  const hasAlarmSignals = symptoms.some(symptom =>
    alarmSignals.some(alarm => symptom.includes(alarm))
  );
  
  if (hasAlarmSignals || symptomCount > 5) {
    return 'urgent';
  } else if (symptomCount > 2) {
    return 'moderate';
  }
  
  return 'mild';
};

/**
 * Agrupa síntomas por categoría
 */
export const groupSymptomsByCategory = (symptoms: string[]): Record<string, string[]> => {
  const groups: Record<string, string[]> = {
    digestive: [],
    urinary: [],
    sexual: [],
    pain: [],
    other: [],
  };
  
  symptoms.forEach(symptom => {
    if (symptom.includes('estreñimiento') || symptom.includes('diarrea') || symptom.includes('gases')) {
      groups.digestive.push(symptom);
    } else if (symptom.includes('incontinencia') || symptom.includes('urgencia-urinaria')) {
      groups.urinary.push(symptom);
    } else if (symptom.includes('sexual') || symptom.includes('disfuncion')) {
      groups.sexual.push(symptom);
    } else if (symptom.includes('dolor')) {
      groups.pain.push(symptom);
    } else {
      groups.other.push(symptom);
    }
  });
  
  return groups;
};
