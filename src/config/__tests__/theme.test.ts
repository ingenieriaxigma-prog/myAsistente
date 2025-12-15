// Tests para configuración de temas

import { describe, it, expect } from 'vitest';
import { getSpecialtyTheme } from '../theme';

describe('getSpecialtyTheme', () => {
  it('debe retornar tema de MyPelvic correctamente', () => {
    const theme = getSpecialtyTheme('MyPelvic');
    expect(theme.gradient).toBe('from-teal-500 to-cyan-600');
    expect(theme.lightBg).toBe('bg-teal-50');
    expect(theme.textPrimary).toBe('text-teal-600');
  });

  it('debe retornar tema de MyColop correctamente', () => {
    const theme = getSpecialtyTheme('MyColop');
    expect(theme.gradient).toBe('from-blue-500 to-blue-600');
    expect(theme.lightBg).toBe('bg-blue-50');
    expect(theme.textPrimary).toBe('text-blue-600');
  });

  it('debe retornar tema por defecto cuando specialty es null', () => {
    const theme = getSpecialtyTheme(null);
    expect(theme.gradient).toBe('from-blue-500 to-blue-600');
  });

  it('debe tener todas las propiedades requeridas', () => {
    const theme = getSpecialtyTheme('MyPelvic');
    expect(theme).toHaveProperty('gradient');
    expect(theme).toHaveProperty('lightBg');
    expect(theme).toHaveProperty('darkBg');
    expect(theme).toHaveProperty('textPrimary');
    expect(theme).toHaveProperty('textSecondary');
    expect(theme).toHaveProperty('border');
    expect(theme).toHaveProperty('hoverBg');
  });
});
