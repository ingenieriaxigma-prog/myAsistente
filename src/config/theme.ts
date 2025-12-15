// Configuración central de temas y colores para todas las especialidades

export type Specialty = 'MyPelvic' | 'MyColop' | null;

export interface SpecialtyTheme {
  name: string;
  subtitle: string;
  gradient: string;
  lightGradient: string;
  bgColor: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  hoverBorderColor: string;
}

export const specialtyThemes: Record<'MyPelvic' | 'MyColop', SpecialtyTheme> = {
  MyPelvic: {
    name: 'MyPelvic',
    subtitle: 'Salud del piso pélvico',
    gradient: 'from-teal-500 to-cyan-600',
    lightGradient: 'from-teal-400 to-cyan-500',
    bgColor: 'teal-500',
    lightBg: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-300',
    hoverBorderColor: 'hover:border-teal-400',
  },
  MyColop: {
    name: 'MyColop',
    subtitle: 'Coloproctología',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-400 to-blue-500',
    bgColor: 'blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    hoverBorderColor: 'hover:border-blue-400',
  },
};

// Función helper para obtener el tema de una especialidad
export const getSpecialtyTheme = (specialty: Specialty): SpecialtyTheme => {
  return specialty ? specialtyThemes[specialty] : specialtyThemes.MyColop;
};

// Temas para especialidades futuras (próximamente)
export const futureSpecialties = {
  MyGineco: {
    name: 'MyGineco',
    subtitle: 'Ginecología',
    gradient: 'from-pink-400 to-pink-500',
    lightBg: 'bg-pink-50',
  },
  MyCardio: {
    name: 'MyCardio',
    subtitle: 'Cardiología',
    gradient: 'from-red-400 to-red-500',
    lightBg: 'bg-red-50',
  },
  MyOnco: {
    name: 'MyOnco',
    subtitle: 'Oncología',
    gradient: 'from-purple-400 to-purple-500',
    lightBg: 'bg-purple-50',
  },
  MyNeuro: {
    name: 'MyNeuro',
    subtitle: 'Neurología',
    gradient: 'from-indigo-400 to-indigo-500',
    lightBg: 'bg-indigo-50',
  },
  MyNeumo: {
    name: 'MyNeumo',
    subtitle: 'Neumología',
    gradient: 'from-green-400 to-green-500',
    lightBg: 'bg-green-50',
  },
  MyPedia: {
    name: 'MyPedia',
    subtitle: 'Pediatría',
    gradient: 'from-yellow-400 to-yellow-500',
    lightBg: 'bg-yellow-50',
  },
  MyRadio: {
    name: 'MyRadio',
    subtitle: 'Radiología',
    gradient: 'from-gray-400 to-gray-500',
    lightBg: 'bg-gray-50',
  },
  MyOrto: {
    name: 'MyOrto',
    subtitle: 'Ortopedia',
    gradient: 'from-orange-400 to-orange-500',
    lightBg: 'bg-orange-50',
  },
  MyPsiqui: {
    name: 'MyPsiqui',
    subtitle: 'Psiquiatría',
    gradient: 'from-teal-400 to-teal-500',
    lightBg: 'bg-teal-50',
  },
};
