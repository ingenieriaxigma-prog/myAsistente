// Componente reutilizable para tarjetas de acción o recomendación

import { ReactNode, memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export const ActionCard = memo(function ActionCard({ 
  icon: Icon, 
  title, 
  description, 
  priority, 
  onClick,
  variant = 'default' 
}: ActionCardProps) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-orange-200 bg-orange-50',
    low: 'border-blue-200 bg-blue-50',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const priorityLabels = {
    high: 'Alta prioridad',
    medium: 'Prioridad media',
    low: 'Baja prioridad',
  };

  const borderColor = priority ? priorityColors[priority] : 'border-gray-200 bg-white';
  const padding = variant === 'compact' ? 'p-3' : 'p-4';

  return (
    <div 
      className={`${borderColor} border-2 rounded-xl ${padding} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm text-gray-900">{title}</h3>
            {priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadgeColors[priority]}`}>
                {priorityLabels[priority]}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
});