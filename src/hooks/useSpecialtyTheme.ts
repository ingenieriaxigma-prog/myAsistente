// Hook personalizado para manejar temas de especialidades

import { useMemo } from 'react';
import { getSpecialtyTheme } from '../config/theme';
import type { Specialty } from '../types';

export const useSpecialtyTheme = (specialty: Specialty) => {
  const theme = useMemo(() => getSpecialtyTheme(specialty), [specialty]);
  
  return theme;
};
