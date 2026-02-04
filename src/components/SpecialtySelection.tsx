import { Plus, Info } from 'lucide-react';
import type { Specialty } from '../types';
import { SpecialtyCard } from './common/SpecialtyCard';
import { activeSpecialties, upcomingSpecialties } from '../config/specialties';

interface SpecialtySelectionProps {
  onSelectSpecialty: (specialty: Specialty) => void;
}

export function SpecialtySelection({ onSelectSpecialty }: SpecialtySelectionProps) {
  return (
    <div className="min-h-screen w-full bg-[#f2f5fb] md:bg-[#eef2f7] flex flex-col items-center">
      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-8 md:px-10 md:py-12">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-16 left-10 h-44 w-44 rounded-full bg-[#0b2b6b]/10 blur-[60px]" />
          <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-[#1451b3]/10 blur-[70px]" />
        </div>

        <div className="rounded-[28px] border border-[#e3e9f5] bg-white shadow-[0_12px_28px_rgba(11,23,43,0.08)]">
          <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-5 text-sm text-[#7b879a] md:px-8">
            <span className="uppercase tracking-[0.2em]">MyAsistente</span>
          </div>

          <div className="px-6 py-8 md:px-10 relative z-10">
            <h1 className="text-3xl font-semibold text-[#0b2b6b] mb-2">Selecciona tu especialidad</h1>
            <p className="text-sm text-[#64748b] mb-8">Elige el área de salud que necesitas</p>

            <div className="grid gap-4 lg:grid-cols-2 pointer-events-auto relative z-10">
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

              <div className="w-full rounded-2xl border border-dashed border-[#d6dee9] bg-[#f8fafc] p-5 opacity-70 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e9eef6] flex items-center justify-center flex-shrink-0">
                    <Plus className="w-7 h-7 text-[#94a3b8]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#475569] mb-1">Más especialidades</h3>
                    <p className="text-sm text-[#94a3b8]">Próximamente más áreas de salud</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#dbe7ff] bg-[#f1f6ff] p-4 flex gap-3">
              <Info className="w-5 h-5 text-[#1d4ed8] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#334155]">
                <span className="text-[#1d4ed8] font-semibold">Consejo:</span> Puedes cambiar de especialidad en cualquier momento desde tu perfil
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
