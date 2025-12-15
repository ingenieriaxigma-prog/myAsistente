// Componente para headers sticky/fixed que permanecen visibles al hacer scroll

import { ReactNode } from 'react';

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function StickyHeader({ children, className = '', gradient }: StickyHeaderProps) {
  const baseClasses = "sticky top-0 z-10 flex-shrink-0";
  const gradientClasses = gradient ? `bg-gradient-to-br ${gradient}` : '';
  
  return (
    <div className={`${baseClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
}
