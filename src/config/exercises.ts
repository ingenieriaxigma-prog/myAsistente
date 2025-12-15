// Configuración centralizada de ejercicios terapéuticos

import type { Exercise } from '../types';

// Ejercicios para suelo pélvico (MyPelvic)
export const pelvicFloorExercises: Exercise[] = [
  {
    id: 'kegel-basic',
    title: 'Ejercicios de Kegel Básicos',
    description: 'Fortalecimiento fundamental del suelo pélvico',
    duration: '10 min',
    difficulty: 'easy',
    category: 'Fortalecimiento',
    instructions: [
      'Siéntate o recuéstate en posición cómoda',
      'Identifica los músculos del suelo pélvico (como si contuvieras la orina)',
      'Contrae estos músculos durante 5 segundos',
      'Relaja completamente durante 5 segundos',
      'Repite 10 veces',
    ],
    benefits: ['Mejora el control de vejiga', 'Fortalece el suelo pélvico', 'Previene prolapsos'],
    repetitions: '3 series de 10 repeticiones',
    frequency: 'Diario (mañana y noche)',
    icon: '🧘‍♀️',
    completed: false,
    completedDates: [],
    applicableFor: ['urinary', 'prolapse'],
  },
  {
    id: 'bridge',
    title: 'Puente (Bridge)',
    description: 'Fortalece glúteos y core',
    duration: '8 min',
    difficulty: 'medium',
    category: 'Fortalecimiento',
    instructions: [
      'Acuéstate boca arriba, rodillas dobladas',
      'Pies apoyados en el suelo, separados al ancho de caderas',
      'Eleva la pelvis contrayendo glúteos y core',
      'Mantén 5-10 segundos',
      'Baja lentamente',
    ],
    benefits: ['Fortalece glúteos', 'Mejora postura', 'Soporta suelo pélvico'],
    repetitions: '3 series de 12 repeticiones',
    frequency: '4-5 veces por semana',
    icon: '🌉',
    completed: false,
    completedDates: [],
    applicableFor: ['prolapse', 'urinary'],
  },
  {
    id: 'squat-wall',
    title: 'Sentadilla en Pared',
    description: 'Fortalece piernas y core',
    duration: '6 min',
    difficulty: 'medium',
    category: 'Fortalecimiento',
    instructions: [
      'Apoya la espalda contra una pared',
      'Desliza hacia abajo hasta que rodillas estén a 90°',
      'Mantén la posición 15-30 segundos',
      'Sube lentamente',
      'Respira de forma natural',
    ],
    benefits: ['Fortalece cuádriceps', 'Mejora estabilidad core', 'Apoya función pélvica'],
    repetitions: '3 series de 30 segundos',
    frequency: '3 veces por semana',
    icon: '💪',
    completed: false,
    completedDates: [],
    applicableFor: ['prolapse'],
  },
  {
    id: 'deep-breathing',
    title: 'Respiración Diafragmática',
    description: 'Relajación del suelo pélvico',
    duration: '10 min',
    difficulty: 'easy',
    category: 'Relajación',
    instructions: [
      'Acuéstate en posición cómoda',
      'Coloca una mano en el pecho y otra en el abdomen',
      'Inhala profundamente por la nariz (el abdomen debe elevarse)',
      'Exhala lentamente por la boca',
      'Repite 10-15 veces',
    ],
    benefits: ['Reduce tensión pélvica', 'Mejora coordinación respiratoria', 'Calma el sistema nervioso'],
    repetitions: '2-3 sesiones',
    frequency: 'Diario',
    icon: '🌬️',
    completed: false,
    completedDates: [],
    applicableFor: ['sexual', 'urinary'],
  },
];

// Ejercicios para salud colorectal (MyColop)
export const colorectalExercises: Exercise[] = [
  {
    id: 'knee-to-chest',
    title: 'Rodilla al Pecho',
    description: 'Facilita el movimiento intestinal',
    duration: '5 min',
    difficulty: 'easy',
    category: 'Estiramiento',
    instructions: [
      'Acuéstate boca arriba',
      'Lleva ambas rodillas hacia el pecho',
      'Abraza las rodillas con los brazos',
      'Mantén 20-30 segundos',
      'Mécete suavemente de lado a lado',
    ],
    benefits: ['Alivia gases', 'Reduce hinchazón', 'Mejora digestión'],
    repetitions: '3-5 repeticiones',
    frequency: 'Diario',
    icon: '🤸',
    completed: false,
    completedDates: [],
    applicableFor: ['colorectal'],
  },
  {
    id: 'cat-cow',
    title: 'Gato-Vaca (Yoga)',
    description: 'Masajea órganos internos',
    duration: '8 min',
    difficulty: 'easy',
    category: 'Yoga',
    instructions: [
      'Posición de cuatro apoyos (manos y rodillas)',
      'Inhala arqueando la espalda (vaca)',
      'Exhala redondeando la espalda (gato)',
      'Movimiento fluido y sincronizado con respiración',
      'Repite 10-15 veces',
    ],
    benefits: ['Estimula digestión', 'Mejora flexibilidad espinal', 'Reduce tensión'],
    repetitions: '2 series de 10 repeticiones',
    frequency: '4-5 veces por semana',
    icon: '🐱',
    completed: false,
    completedDates: [],
    applicableFor: ['colorectal'],
  },
  {
    id: 'walking',
    title: 'Caminata Moderada',
    description: 'Ejercicio cardiovascular suave',
    duration: '20 min',
    difficulty: 'easy',
    category: 'Cardio',
    instructions: [
      'Camina a paso moderado',
      'Mantén postura erguida',
      'Respira de forma natural',
      'Puede ser después de comidas',
      'Incrementa duración gradualmente',
    ],
    benefits: ['Mejora tránsito intestinal', 'Reduce estreñimiento', 'Fortalece sistema cardiovascular'],
    frequency: 'Diario (preferible después de comidas)',
    icon: '🚶',
    completed: false,
    completedDates: [],
    applicableFor: ['colorectal'],
  },
  {
    id: 'torso-twist',
    title: 'Torsión de Torso',
    description: 'Estimula el sistema digestivo',
    duration: '7 min',
    difficulty: 'easy',
    category: 'Yoga',
    instructions: [
      'Siéntate con piernas cruzadas o extendidas',
      'Coloca la mano derecha detrás de ti',
      'Gira suavemente el torso hacia la derecha',
      'Mantén 20-30 segundos',
      'Repite hacia el otro lado',
    ],
    benefits: ['Mejora digestión', 'Alivia estreñimiento', 'Aumenta flexibilidad'],
    repetitions: '3 repeticiones por lado',
    frequency: '5-6 veces por semana',
    icon: '🔄',
    completed: false,
    completedDates: [],
    applicableFor: ['colorectal'],
  },
];

/**
 * Genera un plan de ejercicios personalizado según especialidad, áreas problemáticas y urgencia
 */
export const generateExercisePlan = (
  specialty: 'MyPelvic' | 'MyColop',
  problemAreas: string[],
  urgencyLevel: 'urgent' | 'moderate' | 'mild'
): Exercise[] => {
  const exercisePool = specialty === 'MyPelvic' ? pelvicFloorExercises : colorectalExercises;
  
  // Filtrar ejercicios aplicables a las áreas problemáticas del paciente
  let filteredExercises = exercisePool;
  
  if (problemAreas.length > 0) {
    filteredExercises = exercisePool.filter(exercise => 
      !exercise.applicableFor || 
      exercise.applicableFor.some(area => problemAreas.includes(area))
    );
  }

  // Ajustar según urgencia
  if (urgencyLevel === 'urgent') {
    // Para casos urgentes, solo ejercicios muy suaves
    return filteredExercises.filter(ex => ex.difficulty === 'easy').slice(0, 3);
  } else if (urgencyLevel === 'moderate') {
    // Para casos moderados, mix de ejercicios
    return filteredExercises.slice(0, 5);
  } else {
    // Para casos leves, plan más completo
    return filteredExercises.slice(0, 6);
  }
};

/**
 * Calcula el progreso semanal basado en ejercicios completados
 */
export const calculateWeekProgress = (exercises: Exercise[]): number => {
  const completed = exercises.filter(ex => ex.completed).length;
  const total = exercises.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};
