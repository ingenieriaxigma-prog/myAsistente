// Configuración de áreas problemáticas para diagnóstico

import type { Gender } from '../types';

export interface ProblemAreaConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  availableFor: Gender[];
}

// Áreas problemáticas base (disponibles para todos)
export const baseProblemAreas: ProblemAreaConfig[] = [
  {
    id: 'colorectal',
    label: 'Síntomas colorectales',
    icon: '🩺',
    description: 'Estreñimiento, incontinencia fecal, dolor al defecar',
    availableFor: ['male', 'female', 'trans'],
  },
  {
    id: 'urinary',
    label: 'Síntomas urinarios',
    icon: '💧',
    description: 'Incontinencia urinaria, urgencia, frecuencia',
    availableFor: ['male', 'female', 'trans'],
  },
  {
    id: 'sexual',
    label: 'Salud sexual y dolor',
    icon: '❤️',
    description: 'Dolor durante relaciones, disfunción sexual',
    availableFor: ['male', 'female', 'trans'],
  },
];

// Áreas específicas por género
export const genderSpecificProblemAreas: ProblemAreaConfig[] = [
  {
    id: 'prolapse',
    label: 'Prolapso / Soporte pélvico',
    icon: '🔻',
    description: 'Sensación de bulto, presión pélvica',
    availableFor: ['female', 'trans'],
  },
  {
    id: 'male',
    label: 'Salud masculina',
    icon: '👨‍⚕️',
    description: 'Disfunción eréctil, problemas prostáticos',
    availableFor: ['male', 'trans'],
  },
  {
    id: 'trans',
    label: 'Trans / LGBTQI+',
    icon: '🏳️‍⚧️',
    description: 'Post-cirugía afirmativa, hormonoterapia',
    availableFor: ['trans'],
  },
];

/**
 * Obtiene las áreas problemáticas disponibles para un género específico
 */
export const getProblemAreasForGender = (gender: Gender): ProblemAreaConfig[] => {
  if (!gender) return [];
  
  const allAreas = [...baseProblemAreas, ...genderSpecificProblemAreas];
  return allAreas.filter(area => area.availableFor.includes(gender));
};

/**
 * Obtiene una configuración de área problemática por su ID
 */
export const getProblemAreaById = (id: string): ProblemAreaConfig | undefined => {
  const allAreas = [...baseProblemAreas, ...genderSpecificProblemAreas];
  return allAreas.find(area => area.id === id);
};
