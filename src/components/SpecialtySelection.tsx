import { Plus, Info } from 'lucide-react';
import type { Specialty } from '../types';
import { ScreenContainer } from './common/ScreenContainer';
import { SpecialtyCard } from './common/SpecialtyCard';
import { activeSpecialties, upcomingSpecialties } from '../config/specialties';

interface SpecialtySelectionProps {
  onSelectSpecialty: (specialty: Specialty) => void;
}

export function SpecialtySelection({ onSelectSpecialty }: SpecialtySelectionProps) {
  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">08:29 AM</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl mb-2">Selecciona tu especialidad</h1>
          <p className="text-gray-500 mb-8">Elige el área de salud que necesitas</p>

          {/* Tarjetas de especialidades */}
          <div className="space-y-4">
            {/* Especialidades activas */}
            {activeSpecialties.map((specialty) => (
              <SpecialtyCard
                key={specialty.id}
                name={specialty.name}
                subtitle={specialty.subtitle}
                description={specialty.description}
                gradient={specialty.gradient}
                icon={specialty.icon}
                available={specialty.available}
                badge={specialty.badge}
                onClick={() => onSelectSpecialty(specialty.id as Specialty)}
              />
            ))}

            {/* Especialidades próximamente */}
            {upcomingSpecialties.map((specialty) => (
              <SpecialtyCard
                key={specialty.id}
                name={specialty.name}
                subtitle={specialty.subtitle}
                description={specialty.description}
                gradient={specialty.gradient}
                icon={specialty.icon}
                available={specialty.available}
                badge={specialty.badge}
              />
            ))}

            {/* Más especialidades (desactivada) */}
            <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-5 opacity-60 cursor-not-allowed">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Plus className="w-7 h-7 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg mb-1 text-gray-600">Más especialidades</h3>
                  <p className="text-sm text-gray-500">Próximamente más áreas de salud</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tip informativo */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              <span className="text-blue-600">Consejo:</span> Puedes cambiar de especialidad en cualquier momento desde tu perfil
            </p>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
