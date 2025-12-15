// Componente reutilizable para botones de opciones (género, edad, síntomas, etc.)

import { ReactNode, memo } from 'react';

interface OptionButtonProps {
  icon?: ReactNode;
  label?: string;
  description?: string;
  isSelected?: boolean;
  selected?: boolean; // Alias para compatibilidad
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  children?: ReactNode;
}

export const OptionButton = memo(function OptionButton({
  icon: Icon,
  label,
  description,
  isSelected,
  selected,
  onClick,
  disabled = false,
  variant = 'default',
  children,
}: OptionButtonProps) {
  const baseClasses = "rounded-xl transition-all duration-200 text-left";
  const sizeClasses = variant === 'compact' ? 'p-3' : 'p-4';
  const isActive = isSelected ?? selected ?? false;
  const stateClasses = isActive
    ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-md'
    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // Si se pasan children, usar ese modo
  if (children) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses} ${stateClasses} ${disabledClasses}`}
      >
        {children}
      </button>
    );
  }

  // Modo original con icon/label/description
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${stateClasses} ${disabledClasses}`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`text-2xl ${isActive ? 'opacity-100' : 'opacity-70'}`}>
            {Icon}
          </div>
        )}
        <div className="flex-1">
          <div className="font-bold">{label}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
    </button>
  );
});