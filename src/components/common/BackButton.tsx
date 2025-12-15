// Componente reutilizable para botón de regresar

import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'light' | 'dark';
}

export function BackButton({ onClick, label = 'Atrás', variant = 'light' }: BackButtonProps) {
  const colorClass = variant === 'light' ? 'text-white' : 'text-gray-700';
  
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1 ${colorClass} hover:opacity-80 transition-opacity`}
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
