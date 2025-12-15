// Componente reutilizable para botones con gradiente

import { ReactNode, memo, ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  gradient: string;
  children: ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GradientButton = memo(function GradientButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  gradient = 'from-blue-500 to-blue-600',
  className = '',
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };
  
  return (
    <button
      className={`bg-gradient-to-r ${gradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
        fullWidth ? 'w-full' : ''
      } ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});