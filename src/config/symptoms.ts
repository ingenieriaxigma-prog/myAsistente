// Configuración centralizada de síntomas por área problemática

import type { Symptom } from '../components/common/SymptomSelector';
import type { Gender } from '../types';

// Síntomas colorectales
export const colorectalSymptoms: Symptom[] = [
  { id: 'sangrado', label: 'Sangrado rectal', description: '¿Has notado sangre al defecar?' },
  { id: 'dolor-defecar', label: 'Dolor al defecar', description: '¿Sientes dolor durante la evacuación?' },
  { id: 'estrenimiento', label: 'Estreñimiento', description: '¿Tienes dificultad para evacuar?' },
  { id: 'diarrea', label: 'Diarrea', description: '¿Evacuaciones líquidas frecuentes?' },
  { id: 'picazon', label: 'Picazón anal', description: '¿Sientes comezón en la zona anal?' },
  { id: 'bulto', label: 'Bulto o protuberancia', description: '¿Has notado alguna masa?' },
  { id: 'mucosidad', label: 'Mucosidad', description: '¿Presencia de moco en las heces?' },
  { id: 'dolor-abdominal', label: 'Dolor abdominal', description: '¿Dolor en el abdomen?' },
  { id: 'perdida-peso', label: 'Pérdida de peso', description: '¿Has perdido peso sin razón aparente?' },
  { id: 'fiebre', label: 'Fiebre', description: '¿Has tenido temperatura elevada?' },
  { id: 'incontinencia', label: 'Incontinencia fecal', description: '¿Dificultad para controlar evacuaciones?' },
  { id: 'cambio-habitos', label: 'Cambio en hábitos intestinales', description: '¿Cambios en tu patrón normal?' },
];

// Síntomas urinarios - COMUNES a todos los géneros
const commonUrinarySymptoms: Symptom[] = [
  { id: 'incontinencia-urgencia', label: 'Incontinencia de urgencia', description: '¿Pérdidas de orina con urgencia repentina?' },
  { id: 'incontinencia-esfuerzo', label: 'Incontinencia de esfuerzo', description: '¿Pérdidas al toser, estornudar o hacer ejercicio?' },
  { id: 'frecuencia', label: 'Frecuencia urinaria aumentada', description: '¿Orinas más de 8 veces al día?' },
  { id: 'nocturia', label: 'Nocturia', description: '¿Te levantas de noche a orinar?' },
  { id: 'urgencia', label: 'Urgencia miccional', description: '¿Necesidad súbita e intensa de orinar?' },
  { id: 'dolor-orinar', label: 'Dolor al orinar', description: '¿Ardor o dolor durante la micción?' },
  { id: 'vaciado-incompleto', label: 'Sensación de vaciado incompleto', description: '¿Sientes que no vacías completamente?' },
  { id: 'sangre-orina', label: 'Sangre en la orina', description: '¿Has notado sangre al orinar?' },
];

// Síntomas urinarios - ESPECÍFICOS para hombres (relacionados con próstata)
const maleUrinarySymptoms: Symptom[] = [
  { id: 'chorro-debil', label: 'Chorro débil o interrumpido', description: '¿El flujo de orina es débil o se corta?' },
  { id: 'goteo', label: 'Goteo post-miccional', description: '¿Goteo prolongado después de orinar?' },
  { id: 'dificultad-iniciar', label: 'Dificultad para iniciar micción', description: '¿Problemas para empezar a orinar?' },
];

// Síntomas urinarios - Array principal (combina ambos)
export const urinarySymptoms: Symptom[] = [
  ...commonUrinarySymptoms,
  ...maleUrinarySymptoms,
];

/**
 * Obtiene síntomas urinarios filtrados según el género
 */
export const getUrinarySymptomsByGender = (gender: Gender): Symptom[] => {
  if (!gender) return urinarySymptoms;
  
  if (gender === 'male') {
    // Hombres ven todos los síntomas urinarios (comunes + próstata)
    return [...commonUrinarySymptoms, ...maleUrinarySymptoms];
  }
  
  if (gender === 'female' || gender === 'trans') {
    // Mujeres y personas trans ven principalmente síntomas comunes
    // Algunos síntomas de chorro débil pueden aplicar, pero menos frecuentes
    return commonUrinarySymptoms;
  }
  
  return urinarySymptoms;
};

// Síntomas de prolapso
export const prolapseSymptoms: Symptom[] = [
  { id: 'bulto-vaginal', label: 'Sensación de bulto o protrusión', description: '¿Sientes un bulto o algo que sobresale?' },
  { id: 'presion-pelvica', label: 'Presión pélvica', description: '¿Sensación de peso o presión?' },
  { id: 'dolor-espalda', label: 'Dolor lumbar', description: '¿Dolor en la parte baja de la espalda?' },
  { id: 'dificultad-defecar', label: 'Dificultad para defecar', description: '¿Necesitas ayuda manual para evacuar?' },
  { id: 'dificultad-orinar', label: 'Dificultad para orinar', description: '¿Problemas para iniciar o completar la micción?' },
  { id: 'empeora-pie', label: 'Empeora al estar de pie', description: '¿Los síntomas aumentan con actividad?' },
  { id: 'mejora-acostada', label: 'Mejora al acostarse', description: '¿Los síntomas disminuyen en reposo?' },
  { id: 'manchado-vaginal', label: 'Manchado o sangrado', description: '¿Irritación o sangrado en zona genital?' },
];

// Síntomas de disfunción sexual - COMUNES a todos los géneros
const commonSexualSymptoms: Symptom[] = [
  { id: 'falta-deseo', label: 'Disminución del deseo sexual', description: '¿Pérdida de interés?' },
  { id: 'evitacion-sexual', label: 'Evitación de actividad sexual', description: '¿Evitas el contacto íntimo?' },
];

// Síntomas de disfunción sexual - ESPECÍFICOS para mujeres y personas trans con anatomía femenina
const femaleSexualSymptoms: Symptom[] = [
  { id: 'dolor-penetracion', label: 'Dolor durante la penetración', description: '¿Dispareunia o dolor al tener relaciones?' },
  { id: 'dolor-profundo', label: 'Dolor pélvico profundo', description: '¿Dolor interno durante el sexo?' },
  { id: 'espasmo-muscular', label: 'Espasmo muscular', description: '¿Contracción involuntaria de músculos?' },
  { id: 'sequedad-vaginal', label: 'Sequedad vaginal', description: '¿Falta de lubricación?' },
  { id: 'dificultad-orgasmo', label: 'Dificultad para alcanzar el orgasmo', description: '¿Problemas con el clímax?' },
  { id: 'sangrado-post-coital', label: 'Sangrado post-coital', description: '¿Sangrado después del sexo?' },
];

// Síntomas de disfunción sexual - ESPECÍFICOS para hombres
const maleSexualSymptoms: Symptom[] = [
  { id: 'disfuncion-erectil', label: 'Disfunción eréctil', description: '¿Dificultad para lograr o mantener erección?' },
  { id: 'eyaculacion-precoz', label: 'Eyaculación precoz', description: '¿Eyaculación antes de lo deseado?' },
  { id: 'eyaculacion-retardada', label: 'Eyaculación retardada', description: '¿Dificultad para eyacular?' },
  { id: 'dolor-penetracion-anal', label: 'Dolor durante penetración anal', description: '¿Dolor al tener relaciones anales?' },
  { id: 'orgasmo-doloroso', label: 'Orgasmo doloroso', description: '¿Dolor durante el orgasmo?' },
  { id: 'dificultad-orgasmo', label: 'Dificultad para alcanzar el orgasmo', description: '¿Problemas con el clímax?' },
];

// Síntomas de disfunción sexual - Array principal (mantener por compatibilidad, pero será reemplazado por función)
export const sexualSymptoms: Symptom[] = [
  ...commonSexualSymptoms,
  ...femaleSexualSymptoms,
  ...maleSexualSymptoms,
];

/**
 * Obtiene síntomas sexuales filtrados según el género
 */
export const getSexualSymptomsByGender = (gender: Gender): Symptom[] => {
  if (!gender) return sexualSymptoms;
  
  if (gender === 'male') {
    return [...commonSexualSymptoms, ...maleSexualSymptoms];
  }
  
  if (gender === 'female') {
    return [...commonSexualSymptoms, ...femaleSexualSymptoms];
  }
  
  if (gender === 'trans') {
    // Personas trans pueden tener cualquier anatomía, incluir todos
    return [...commonSexualSymptoms, ...femaleSexualSymptoms, ...maleSexualSymptoms];
  }
  
  return sexualSymptoms;
};

// Síntomas masculinos
export const maleSymptoms: Symptom[] = [
  { id: 'disfuncion-erectil', label: 'Disfunción eréctil', description: '¿Dificultad para lograr o mantener erección?' },
  { id: 'eyaculacion-precoz', label: 'Eyaculación precoz', description: '¿Eyaculación antes de lo deseado?' },
  { id: 'eyaculacion-retardada', label: 'Eyaculación retardada', description: '¿Dificultad para eyacular?' },
  { id: 'dolor-testicular', label: 'Dolor testicular', description: '¿Dolor en los testículos?' },
  { id: 'dolor-perineal', label: 'Dolor perineal', description: '¿Dolor entre testículos y ano?' },
  { id: 'problemas-prostata', label: 'Síntomas prostáticos', description: '¿Dificultad urinaria relacionada con próstata?' },
  { id: 'disminucion-libido', label: 'Disminución de libido', description: '¿Pérdida de interés sexual?' },
  { id: 'orgasmo-doloroso', label: 'Orgasmo doloroso', description: '¿Dolor durante el orgasmo?' },
];

// Síntomas trans/LGBTQI+
export const transSymptoms: Symptom[] = [
  { id: 'dolor-post-cirugia', label: 'Dolor post-quirúrgico', description: '¿Dolor después de cirugía afirmativa?' },
  { id: 'cicatrizacion', label: 'Problemas de cicatrización', description: '¿Complicaciones en la cicatrización?' },
  { id: 'dilatacion', label: 'Dificultad con dilatación', description: '¿Problemas con el régimen de dilatación?' },
  { id: 'sensibilidad-alterada', label: 'Sensibilidad alterada', description: '¿Cambios en la sensibilidad genital?' },
  { id: 'efectos-hormonales', label: 'Efectos de hormonoterapia', description: '¿Síntomas relacionados con hormonas?' },
  { id: 'incontinencia-post-op', label: 'Incontinencia post-operatoria', description: '¿Pérdidas después de cirugía?' },
  { id: 'estenosis', label: 'Estenosis o estrechamiento', description: '¿Estrechamiento del canal?' },
  { id: 'disforia-corporal', label: 'Disforia relacionada con función pélvica', description: '¿Malestar con función corporal?' },
];

// Función helper para obtener síntomas por área problemática
export const getSymptomsByArea = (area: string): Symptom[] => {
  const symptomMap: Record<string, Symptom[]> = {
    colorectal: colorectalSymptoms,
    urinary: urinarySymptoms,
    prolapse: prolapseSymptoms,
    sexual: sexualSymptoms,
    male: maleSymptoms,
    trans: transSymptoms,
  };

  return symptomMap[area] || [];
};

// Obtener el título de la sección según el área
export const getSymptomAreaTitle = (area: string): string => {
  const titleMap: Record<string, string> = {
    colorectal: 'Síntomas colorectales',
    urinary: 'Síntomas urinarios',
    prolapse: 'Síntomas de prolapso',
    sexual: 'Síntomas de disfunción sexual',
    male: 'Síntomas de salud masculina',
    trans: 'Síntomas trans/LGBTQI+',
  };

  return titleMap[area] || 'Síntomas';
};