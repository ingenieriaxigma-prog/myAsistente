import { memo } from 'react';
import { LucideIcon } from 'lucide-react';

// Componente reutilizable para tarjetas de especialidades

interface SpecialtyCardProps {
  name: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon: LucideIcon;
  available: boolean;
  badge?: string;
  onClick?: () => void;
}

export const SpecialtyCard = memo(function SpecialtyCard({ 
  name,
  subtitle,
  description,
  gradient,
  icon: Icon,
  available,
  badge,
  onClick
}: SpecialtyCardProps) {
  if (!available) {
    return (
      <div className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 opacity-60 cursor-not-allowed">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_10px_20px_rgba(15,23,42,0.15)]`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg text-[#475569] font-semibold">{name}</h3>
              {badge && (
                <span className="px-2 py-0.5 bg-[#e2e8f0] text-xs rounded-full text-[#64748b]">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-[#64748b]">{subtitle}</p>
            <p className="text-xs text-[#94a3b8] mt-1">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition-all duration-200 group hover:border-[#2b59ff]/40 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] cursor-pointer relative z-10 pointer-events-auto"
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform shadow-[0_10px_20px_rgba(15,23,42,0.18)] group-hover:scale-105`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg mb-1 font-semibold text-[#0f172a]">{name}</h3>
          <p className="text-sm text-[#475569]">{subtitle}</p>
          <p className="text-xs text-[#94a3b8] mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
});
