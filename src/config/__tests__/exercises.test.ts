// Tests para configuración de ejercicios

import { describe, it, expect } from 'vitest';
import { generateExercisePlan, calculateWeekProgress } from '../exercises';
import type { Exercise } from '../../types';

describe('generateExercisePlan', () => {
  it('debe generar ejercicios de MyPelvic para áreas urinarias', () => {
    const plan = generateExercisePlan('MyPelvic', ['urinary'], 'mild');
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some(ex => ex.title.includes('Kegel'))).toBe(true);
  });

  it('debe generar ejercicios de MyColop', () => {
    const plan = generateExercisePlan('MyColop', ['colorectal'], 'mild');
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some(ex => ex.category === 'Estiramiento' || ex.category === 'Yoga')).toBe(true);
  });

  it('debe limitar ejercicios para urgencia alta', () => {
    const plan = generateExercisePlan('MyPelvic', ['urinary'], 'urgent');
    expect(plan.length).toBeLessThanOrEqual(3);
    expect(plan.every(ex => ex.difficulty === 'easy')).toBe(true);
  });

  it('debe generar plan moderado para urgencia moderate', () => {
    const plan = generateExercisePlan('MyPelvic', ['urinary'], 'moderate');
    expect(plan.length).toBeLessThanOrEqual(5);
  });

  it('debe generar plan completo para urgencia mild', () => {
    const plan = generateExercisePlan('MyPelvic', ['urinary', 'prolapse'], 'mild');
    expect(plan.length).toBeLessThanOrEqual(6);
  });

  it('todos los ejercicios deben tener propiedades requeridas', () => {
    const plan = generateExercisePlan('MyPelvic', ['urinary'], 'mild');
    plan.forEach(exercise => {
      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('title');
      expect(exercise).toHaveProperty('description');
      expect(exercise).toHaveProperty('duration');
      expect(exercise).toHaveProperty('difficulty');
      expect(exercise).toHaveProperty('instructions');
      expect(exercise).toHaveProperty('benefits');
    });
  });
});

describe('calculateWeekProgress', () => {
  it('debe retornar 0 cuando no hay ejercicios', () => {
    const progress = calculateWeekProgress([]);
    expect(progress).toBe(0);
  });

  it('debe retornar 0 cuando ningún ejercicio está completado', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        title: 'Test',
        description: '',
        duration: '10 min',
        difficulty: 'easy',
        category: 'Test',
        instructions: [],
        benefits: [],
        frequency: 'daily',
        icon: '💪',
        completed: false,
        completedDates: [],
      },
    ];
    const progress = calculateWeekProgress(exercises);
    expect(progress).toBe(0);
  });

  it('debe retornar 100 cuando todos los ejercicios están completados', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        title: 'Test 1',
        description: '',
        duration: '10 min',
        difficulty: 'easy',
        category: 'Test',
        instructions: [],
        benefits: [],
        frequency: 'daily',
        icon: '💪',
        completed: true,
        completedDates: ['2024-01-01'],
      },
      {
        id: '2',
        title: 'Test 2',
        description: '',
        duration: '10 min',
        difficulty: 'easy',
        category: 'Test',
        instructions: [],
        benefits: [],
        frequency: 'daily',
        icon: '💪',
        completed: true,
        completedDates: ['2024-01-01'],
      },
    ];
    const progress = calculateWeekProgress(exercises);
    expect(progress).toBe(100);
  });

  it('debe calcular progreso parcial correctamente', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        title: 'Test 1',
        description: '',
        duration: '10 min',
        difficulty: 'easy',
        category: 'Test',
        instructions: [],
        benefits: [],
        frequency: 'daily',
        icon: '💪',
        completed: true,
        completedDates: ['2024-01-01'],
      },
      {
        id: '2',
        title: 'Test 2',
        description: '',
        duration: '10 min',
        difficulty: 'easy',
        category: 'Test',
        instructions: [],
        benefits: [],
        frequency: 'daily',
        icon: '💪',
        completed: false,
        completedDates: [],
      },
    ];
    const progress = calculateWeekProgress(exercises);
    expect(progress).toBe(50);
  });
});
