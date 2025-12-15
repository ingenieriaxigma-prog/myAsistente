// Utilidades de navegación centralizadas

import type { Screen, Gender, ProblemArea } from '../types';

/**
 * Obtiene los pasos relevantes del diagnóstico según el género y áreas problemáticas
 */
export const getRelevantDiagnosisSteps = (
  gender: Gender,
  problemAreas: ProblemArea[] = []
): Screen[] => {
  const steps: Screen[] = ['diagnosis-step1'];
  
  // Agregar pasos según las áreas problemáticas seleccionadas
  if (problemAreas.includes('colorectal')) {
    steps.push('diagnosis-step2');
  }
  
  if (problemAreas.includes('urinary')) {
    steps.push('diagnosis-step2-urinary');
  }
  
  if (problemAreas.includes('prolapse') && (gender === 'female' || gender === 'trans')) {
    steps.push('diagnosis-step2-prolapse');
  }
  
  if (problemAreas.includes('sexual')) {
    steps.push('diagnosis-step2-sexual');
  }
  
  if (problemAreas.includes('male') && (gender === 'male' || gender === 'trans')) {
    steps.push('diagnosis-step2-male');
  }
  
  if (problemAreas.includes('trans') && gender === 'trans') {
    steps.push('diagnosis-step2-trans');
  }
  
  // Siempre termina con análisis y resultados
  steps.push('diagnosis-analysis');
  steps.push('diagnosis-step3');
  
  return steps;
};

/**
 * Obtiene el siguiente paso en el flujo de diagnóstico
 */
export const getNextDiagnosisStep = (
  currentStep: Screen,
  gender: Gender,
  problemAreas: ProblemArea[] = []
): Screen | null => {
  const relevantSteps = getRelevantDiagnosisSteps(gender, problemAreas);
  const currentIndex = relevantSteps.indexOf(currentStep);
  
  if (currentIndex >= 0 && currentIndex < relevantSteps.length - 1) {
    return relevantSteps[currentIndex + 1];
  }
  
  return null;
};

/**
 * Obtiene el paso anterior en el flujo de diagnóstico
 */
export const getPreviousDiagnosisStep = (
  currentStep: Screen,
  gender: Gender,
  problemAreas: ProblemArea[] = []
): Screen | null => {
  const relevantSteps = getRelevantDiagnosisSteps(gender, problemAreas);
  const currentIndex = relevantSteps.indexOf(currentStep);
  
  if (currentIndex > 0) {
    return relevantSteps[currentIndex - 1];
  }
  
  return null;
};

/**
 * Obtiene información del paso actual (número y total)
 */
export const getDiagnosisStepInfo = (
  currentStep: Screen,
  gender: Gender,
  problemAreas: ProblemArea[] = []
): { current: number; total: number } => {
  const relevantSteps = getRelevantDiagnosisSteps(gender, problemAreas);
  const currentIndex = relevantSteps.indexOf(currentStep);
  
  return {
    current: currentIndex + 1,
    total: relevantSteps.length,
  };
};
