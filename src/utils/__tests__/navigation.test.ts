// Tests unitarios para utilidades de navegación

import { describe, it, expect } from 'vitest';
import { 
  getRelevantDiagnosisSteps, 
  getNextDiagnosisStep, 
  getPreviousDiagnosisStep,
  getDiagnosisStepInfo 
} from '../navigation';
import type { Screen, Gender, ProblemArea } from '../../types';

describe('getRelevantDiagnosisSteps', () => {
  it('debe retornar paso colorectal para MyColop sin áreas problemáticas', () => {
    const steps = getRelevantDiagnosisSteps(null, []);
    expect(steps).toContain('diagnosis-step2');
  });

  it('debe incluir paso urinary cuando está en áreas problemáticas', () => {
    const steps = getRelevantDiagnosisSteps('female', ['urinary']);
    expect(steps).toContain('diagnosis-step2-urinary');
  });

  it('debe incluir paso prolapse para paciente femenino', () => {
    const steps = getRelevantDiagnosisSteps('female', ['prolapse']);
    expect(steps).toContain('diagnosis-step2-prolapse');
  });

  it('debe incluir paso sexual para cualquier género', () => {
    const steps = getRelevantDiagnosisSteps('male', ['sexual']);
    expect(steps).toContain('diagnosis-step2-sexual');
  });

  it('debe incluir paso male solo para paciente masculino', () => {
    const steps = getRelevantDiagnosisSteps('male', ['male']);
    expect(steps).toContain('diagnosis-step2-male');
  });

  it('NO debe incluir paso male para paciente femenino', () => {
    const steps = getRelevantDiagnosisSteps('female', ['male']);
    expect(steps).not.toContain('diagnosis-step2-male');
  });

  it('debe incluir paso trans para paciente transgénero', () => {
    const steps = getRelevantDiagnosisSteps('trans', ['trans']);
    expect(steps).toContain('diagnosis-step2-trans');
  });
});

describe('getNextDiagnosisStep', () => {
  it('debe navegar de step1 a step2 (colorectal) por defecto', () => {
    const next = getNextDiagnosisStep('diagnosis-step1', null, []);
    expect(next).toBe('diagnosis-step2');
  });

  it('debe navegar de step2 a analysis cuando no hay más pasos', () => {
    const next = getNextDiagnosisStep('diagnosis-step2', null, []);
    expect(next).toBe('diagnosis-analysis');
  });

  it('debe navegar de step2 a step2-urinary cuando urinary está en áreas', () => {
    const next = getNextDiagnosisStep('diagnosis-step2', 'female', ['urinary']);
    expect(next).toBe('diagnosis-step2-urinary');
  });

  it('debe navegar correctamente a través de múltiples pasos', () => {
    const areas: ProblemArea[] = ['urinary', 'prolapse', 'sexual'];
    
    const step1 = getNextDiagnosisStep('diagnosis-step1', 'female', areas);
    expect(step1).toBe('diagnosis-step2');
    
    const step2 = getNextDiagnosisStep('diagnosis-step2', 'female', areas);
    expect(step2).toBe('diagnosis-step2-urinary');
    
    const step3 = getNextDiagnosisStep('diagnosis-step2-urinary', 'female', areas);
    expect(step3).toBe('diagnosis-step2-prolapse');
  });
});

describe('getPreviousDiagnosisStep', () => {
  it('debe retornar null desde diagnosis-step1', () => {
    const prev = getPreviousDiagnosisStep('diagnosis-step1', null, []);
    expect(prev).toBe(null);
  });

  it('debe navegar de step2 a step1', () => {
    const prev = getPreviousDiagnosisStep('diagnosis-step2', null, []);
    expect(prev).toBe('diagnosis-step1');
  });

  it('debe navegar de analysis al último paso de síntomas', () => {
    const prev = getPreviousDiagnosisStep('diagnosis-analysis', null, []);
    expect(prev).toBe('diagnosis-step2');
  });

  it('debe navegar correctamente hacia atrás con múltiples áreas', () => {
    const areas: ProblemArea[] = ['urinary', 'prolapse'];
    
    const prev1 = getPreviousDiagnosisStep('diagnosis-step2-prolapse', 'female', areas);
    expect(prev1).toBe('diagnosis-step2-urinary');
    
    const prev2 = getPreviousDiagnosisStep('diagnosis-step2-urinary', 'female', areas);
    expect(prev2).toBe('diagnosis-step2');
  });
});

describe('getDiagnosisStepInfo', () => {
  it('debe retornar información correcta para step1', () => {
    const info = getDiagnosisStepInfo('diagnosis-step1', null, []);
    expect(info.stepNumber).toBe(1);
    expect(info.totalSteps).toBe(3);
    expect(info.title).toContain('Información básica');
  });

  it('debe calcular totalSteps correctamente con múltiples áreas', () => {
    const areas: ProblemArea[] = ['urinary', 'prolapse', 'sexual'];
    const info = getDiagnosisStepInfo('diagnosis-step2', 'female', areas);
    expect(info.totalSteps).toBe(6); // step1 + colorectal + 3 áreas + analysis
  });

  it('debe retornar step actual correcto', () => {
    const areas: ProblemArea[] = ['urinary'];
    const info = getDiagnosisStepInfo('diagnosis-step2-urinary', 'female', areas);
    expect(info.stepNumber).toBe(3);
  });
});
