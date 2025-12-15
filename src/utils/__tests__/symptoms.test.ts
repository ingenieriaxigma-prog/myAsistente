// Tests unitarios para utilidades de síntomas

import { describe, it, expect } from 'vitest';
import { calculateUrgencyLevel } from '../symptoms';

describe('calculateUrgencyLevel', () => {
  it('debe retornar "urgent" cuando hay señales de alarma', () => {
    const symptoms = ['sangrado', 'dolor-abdominal'];
    expect(calculateUrgencyLevel(symptoms)).toBe('urgent');
  });

  it('debe retornar "urgent" cuando hay pérdida de peso', () => {
    const symptoms = ['perdida-peso'];
    expect(calculateUrgencyLevel(symptoms)).toBe('urgent');
  });

  it('debe retornar "urgent" cuando hay fiebre', () => {
    const symptoms = ['fiebre', 'dolor'];
    expect(calculateUrgencyLevel(symptoms)).toBe('urgent');
  });

  it('debe retornar "urgent" cuando hay más de 5 síntomas', () => {
    const symptoms = ['s1', 's2', 's3', 's4', 's5', 's6'];
    expect(calculateUrgencyLevel(symptoms)).toBe('urgent');
  });

  it('debe retornar "moderate" cuando hay 3-5 síntomas sin señales de alarma', () => {
    const symptoms = ['estreñimiento', 'dolor-defecar', 'picazon'];
    expect(calculateUrgencyLevel(symptoms)).toBe('moderate');
  });

  it('debe retornar "mild" cuando hay 1-2 síntomas leves', () => {
    const symptoms = ['picazon'];
    expect(calculateUrgencyLevel(symptoms)).toBe('mild');
  });

  it('debe retornar "mild" cuando no hay síntomas', () => {
    const symptoms: string[] = [];
    expect(calculateUrgencyLevel(symptoms)).toBe('mild');
  });

  it('debe retornar "mild" cuando solo está "ninguno"', () => {
    const symptoms = ['ninguno'];
    expect(calculateUrgencyLevel(symptoms)).toBe('mild');
  });
});
