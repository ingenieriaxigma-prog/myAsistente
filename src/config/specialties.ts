// Configuración de especialidades médicas para la app

import { PelvisIcon } from '../components/icons/PelvisIcon';
import { ColonIcon } from '../components/icons/ColonIcon';
import { UterusIcon } from '../components/icons/UterusIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { CellIcon } from '../components/icons/CellIcon';
import { BrainIcon } from '../components/icons/BrainIcon';
import { LungsIcon } from '../components/icons/LungsIcon';
import { BabyIcon } from '../components/icons/BabyIcon';
import { XRayIcon } from '../components/icons/XRayIcon';
import { BoneIcon } from '../components/icons/BoneIcon';
import { MindIcon } from '../components/icons/MindIcon';
import type { LucideIcon } from 'lucide-react';

export interface SpecialtyCardConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  badge?: string;
}

// Especialidades activas
export const activeSpecialties: SpecialtyCardConfig[] = [
  {
    id: 'MyPelvic',
    name: 'MyPelvic',
    subtitle: 'Salud del piso pélvico',
    description: 'Especialistas en salud pélvica',
    gradient: 'from-teal-500 to-cyan-600',
    icon: PelvisIcon,
    available: true,
  },
  {
    id: 'MyColop',
    name: 'MyColop',
    subtitle: 'Coloproctología',
    description: 'Cuidado digestivo especializado',
    gradient: 'from-blue-400 to-blue-500',
    icon: ColonIcon,
    available: true,
  },
];

// Especialidades próximamente
export const upcomingSpecialties: SpecialtyCardConfig[] = [
  {
    id: 'MyGineco',
    name: 'MyGineco',
    subtitle: 'Ginecología',
    description: 'Salud reproductiva femenina',
    gradient: 'from-pink-400 to-pink-500',
    icon: UterusIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyCardio',
    name: 'MyCardio',
    subtitle: 'Cardiología',
    description: 'Cuidado cardiovascular',
    gradient: 'from-red-400 to-red-500',
    icon: HeartIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyOnco',
    name: 'MyOnco',
    subtitle: 'Oncología',
    description: 'Tratamiento oncológico',
    gradient: 'from-purple-400 to-purple-500',
    icon: CellIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyNeuro',
    name: 'MyNeuro',
    subtitle: 'Neurología',
    description: 'Salud neurológica',
    gradient: 'from-indigo-400 to-indigo-500',
    icon: BrainIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyNeumo',
    name: 'MyNeumo',
    subtitle: 'Neumología',
    description: 'Salud respiratoria',
    gradient: 'from-green-400 to-green-500',
    icon: LungsIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyPedia',
    name: 'MyPedia',
    subtitle: 'Pediatría',
    description: 'Salud infantil',
    gradient: 'from-yellow-400 to-yellow-500',
    icon: BabyIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyRadio',
    name: 'MyRadio',
    subtitle: 'Radiología',
    description: 'Imágenes médicas',
    gradient: 'from-gray-400 to-gray-500',
    icon: XRayIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyOrto',
    name: 'MyOrto',
    subtitle: 'Ortopedia',
    description: 'Cuidado óseo y articular',
    gradient: 'from-orange-400 to-orange-500',
    icon: BoneIcon,
    available: false,
    badge: 'Próximamente',
  },
  {
    id: 'MyPsiqui',
    name: 'MyPsiqui',
    subtitle: 'Psiquiatría',
    description: 'Salud mental',
    gradient: 'from-teal-400 to-teal-500',
    icon: MindIcon,
    available: false,
    badge: 'Próximamente',
  },
];

// Todas las especialidades
export const allSpecialties = [...activeSpecialties, ...upcomingSpecialties];
