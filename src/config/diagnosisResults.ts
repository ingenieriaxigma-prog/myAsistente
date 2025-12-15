// Configuración para resultados de diagnóstico
// 🆕 ACTUALIZACIÓN: Los títulos, descripciones y timeframes ahora son generados por IA
// Este archivo solo se usa para colores, iconos y estilos visuales (UI)

import { AlertTriangle, AlertCircle, CheckCircle2, type LucideIcon } from 'lucide-react';
import type { UrgencyLevel } from '../types';

export interface DiagnosisResult {
  urgency: UrgencyLevel;
  title: string;  // ⚠️ NO SE USA - Ahora viene de IA (urgencyTitle)
  description: string;  // ⚠️ NO SE USA - Ahora viene de IA (urgencyDescription)
  timeframe: string;  // ⚠️ NO SE USA - Ahora viene de IA (urgencyTimeframe)
  icon: LucideIcon;  // ✅ SE USA - Icono visual
  bgColor: string;  // ✅ SE USA - Color de fondo
  borderColor: string;  // ✅ SE USA - Color de borde
  textColor: string;  // ✅ SE USA - Color de texto
  iconColor: string;  // ✅ SE USA - Color de icono
}

export const urgencyConfig: Record<UrgencyLevel, DiagnosisResult> = {
  urgent: {
    urgency: 'urgent',
    title: 'Atención Urgente Requerida',
    description: 'Los síntomas que presentas requieren evaluación médica inmediata. Se han detectado señales de alarma que necesitan atención prioritaria.',
    timeframe: 'Consulta en las próximas 24-48 horas',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
  },
  moderate: {
    urgency: 'moderate',
    title: 'Evaluación Médica Recomendada',
    description: 'Tus síntomas sugieren que sería beneficioso consultar con un especialista para una evaluación detallada y manejo adecuado.',
    timeframe: 'Consulta en los próximos 7-15 días',
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  mild: {
    urgency: 'mild',
    title: 'Síntomas Leves Detectados',
    description: 'Los síntomas que presentas parecen ser leves. Puedes comenzar con medidas de autocuidado y monitoreo. Si persisten, considera una evaluación médica.',
    timeframe: 'Monitoreo y consulta si persisten después de 30 días',
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
  },
};

export interface ActionItem {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export const getActionPlan = (urgencyLevel: UrgencyLevel) => {
  return {
    immediate: [
      {
        title: 'Agendar consulta médica',
        description: urgencyLevel === 'urgent' 
          ? 'Contacta a un especialista de inmediato o acude a urgencias si los síntomas empeoran'
          : urgencyLevel === 'moderate'
          ? 'Programa una cita con un gastroenterólogo o proctólogo en las próximas semanas'
          : 'Si los síntomas persisten por más de un mes, agenda una consulta preventiva',
        priority: 'high' as const,
      },
      {
        title: 'Registro de síntomas',
        description: 'Mantén un diario detallado de tus síntomas: frecuencia, intensidad, factores desencadenantes y cualquier cambio',
        priority: (urgencyLevel === 'urgent' ? 'high' : 'medium') as const,
      },
    ],
    lifestyle: [
      {
        title: 'Dieta y nutrición',
        description: 'Incrementa el consumo de fibra (25-30g/día), bebe al menos 2L de agua diariamente, reduce alimentos procesados y picantes',
      },
      {
        title: 'Actividad física',
        description: 'Realiza ejercicio moderado 30 minutos al día, 5 días a la semana. Evita ejercicios de alto impacto si hay dolor',
      },
      {
        title: 'Higiene intestinal',
        description: 'Establece horarios regulares, no reprimas el reflejo evacuatorio, evita esfuerzo excesivo durante la defecación',
      },
    ],
    monitoring: [
      {
        title: 'Señales de alerta',
        description: 'Busca atención inmediata si experimentas: sangrado abundante, dolor severo, fiebre alta, o pérdida de peso inexplicable',
      },
      {
        title: 'Seguimiento',
        description: 'Reevalúa tus síntomas semanalmente y ajusta el plan según la evolución. Comparte este registro con tu médico',
      },
    ],
  };
};