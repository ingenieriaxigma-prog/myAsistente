// Sugerencias de prompts para el chat clínico por especialidad

// Pool ampliado de sugerencias para cada especialidad
export const chatPromptSuggestionsPool = {
  MyPelvic: [
    // Ejercicios y fortalecimiento
    '¿Qué ejercicios recomiendas para fortalecer el suelo pélvico?',
    'Ejercicios para recuperación postparto',
    'Explícame técnicas de hipopresivos',
    '¿Cómo hacer ejercicios de Kegel correctamente?',
    'Rutina de ejercicios para suelo pélvico',
    
    // Incontinencia
    'Dame información sobre incontinencia urinaria',
    '¿Cómo controlar la incontinencia de urgencia?',
    'Tratamientos para incontinencia fecal',
    '¿Qué es la incontinencia por esfuerzo?',
    
    // Prolapso
    '¿Cómo prevenir el prolapso?',
    'Síntomas de prolapso de órganos pélvicos',
    '¿El prolapso tiene solución sin cirugía?',
    
    // Dolor pélvico
    '¿Qué puede causar dolor pélvico crónico?',
    'Tratamientos para dolor en la pelvis',
    'Ejercicios para aliviar dolor pélvico',
    
    // Salud sexual y otros
    '¿Cómo mejorar la función sexual femenina?',
    'Disfunción del suelo pélvico en hombres',
    '¿Qué es la diástasis abdominal?',
    'Consejos para mejorar la postura pélvica',
  ],
  MyColop: [
    // Hemorroides
    '¿Qué causa las hemorroides?',
    'Tratamientos naturales para hemorroides',
    '¿Cómo prevenir las hemorroides?',
    '¿Cuándo operar las hemorroides?',
    
    // Estreñimiento y digestión
    'Consejos para prevenir el estreñimiento',
    '¿Cómo mejorar mi salud digestiva?',
    'Dieta para problemas colorectales',
    'Alimentos que ayudan al tránsito intestinal',
    '¿Es normal ir al baño una vez al día?',
    
    // Síntomas y diagnóstico
    'Síntomas de problemas de colon',
    '¿Qué es el síndrome de intestino irritable?',
    '¿Cuándo debo preocuparme por sangrado rectal?',
    'Diferencia entre colitis y colon irritable',
    
    // Prevención
    '¿Cómo prevenir el cáncer de colon?',
    'Importancia de la colonoscopia',
    'Factores de riesgo colorrectal',
    
    // Fisuras y otros
    '¿Qué son las fisuras anales?',
    'Tratamiento para fisura anal',
    '¿Qué es una fístula anal?',
    'Cuidados después de cirugía colorrectal',
  ],
};

// Función para obtener sugerencias aleatorias
export function getRandomSuggestions(
  specialty: 'MyPelvic' | 'MyColop',
  count: number = 3
): string[] {
  const pool = chatPromptSuggestionsPool[specialty] || [];
  
  // Si el pool tiene menos elementos que los solicitados, devolver todos
  if (pool.length <= count) {
    return [...pool];
  }
  
  // Mezclar el array usando algoritmo Fisher-Yates
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Devolver los primeros 'count' elementos
  return shuffled.slice(0, count);
}

// Mantener compatibilidad con código existente (deprecated)
export const chatPromptSuggestions = {
  MyPelvic: [
    '¿Qué ejercicios recomiendas para fortalecer el suelo pélvico?',
    'Dame información sobre incontinencia urinaria',
    'Explícame técnicas de hipopresivos',
  ],
  MyColop: [
    '¿Qué causa las hemorroides?',
    'Consejos para prevenir el estreñimiento',
    '¿Cómo mejorar mi salud digestiva?',
  ],
};
