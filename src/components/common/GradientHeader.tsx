// Componente reutilizable para headers con gradiente (ahora sticky por defecto)

import { ReactNode } from 'react';

interface GradientHeaderProps {
  gradient: string;
  children: ReactNode;
  className?: string;
  sticky?: boolean; // Por defecto true
}

export function GradientHeader({ gradient, children, className = '', sticky = true }: GradientHeaderProps) {
  const stickyClasses = sticky ? 'sticky top-0 z-10' : '';
  
  return (
    <div className={`bg-gradient-to-br ${gradient} ${stickyClasses} flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}