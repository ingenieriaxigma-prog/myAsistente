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
      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 opacity-50 cursor-not-allowed">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg text-gray-600">{name}</h3>
              {badge && (
                <span className="px-2 py-0.5 bg-gray-200 text-xs rounded-full text-gray-600">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{subtitle}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 text-left group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg mb-1">{name}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
});