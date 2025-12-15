// Componente reutilizable para tarjetas con icono

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface IconCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  gradient: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

export function IconCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  onClick, 
  disabled = false,
  badge 
}: IconCardProps) {
  const baseClasses = "w-full border-2 rounded-2xl p-5 transition-all duration-200 text-left";
  const enabledClasses = "bg-white border-gray-200 hover:shadow-lg hover:border-blue-300 cursor-pointer group";
  const disabledClasses = "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
    >
      <div className="flex items-start gap-4">
        <div 
          className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 ${
            !disabled ? 'group-hover:scale-110' : ''
          } transition-transform shadow-md`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-800">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 leading-tight">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
