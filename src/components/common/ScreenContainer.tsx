// Componente contenedor reutilizable para pantallas

import { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContainer({ children, className = '' }: ScreenContainerProps) {
  return (
    <div 
      className={`bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col w-full h-full ${className}`}
    >
      {children}
    </div>
  );
}