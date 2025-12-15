interface MindIconProps {
  className?: string;
}

export function MindIcon({ className = "w-6 h-6" }: MindIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Psiquiatría - cerebro con conexiones neuronales/salud mental */}
      
      {/* Cabeza/contorno */}
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Cerebro simplificado con conexiones */}
      <path
        d="M9 9C9.5 8.5 10.5 8 11.5 8C12.5 8 13.5 8.5 14 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      <path
        d="M8.5 11.5C9 11 10 10.5 11 10.5C12 10.5 13 11 13.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      <path
        d="M10.5 13.5C11 13 11.5 12.5 12 12.5C12.5 12.5 13 13 13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Nodos/neuronas - puntos de conexión */}
      <circle cx="9" cy="9" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="9" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="13.5" cy="11.5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="10.5" cy="13.5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="13.5" cy="13.5" r="1" fill="currentColor" opacity="0.6" />
      
      {/* Ondas cerebrales/actividad mental */}
      <path
        d="M7 15.5C7.5 15 8 15 8.5 15C9 15 9.5 15 10 15.5C10.5 16 11 16 11.5 16C12 16 12.5 16 13 15.5C13.5 15 14 15 14.5 15C15 15 15.5 15 16 15.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Símbolo de salud mental - corazón pequeño */}
      <path
        d="M11 16.5C11 16.5 10.5 17 10.5 17.5C10.5 18 11 18.5 11.5 18.5C12 18.5 12.5 18 12.5 17.5C12.5 17 12 16.5 12 16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M12 16.5C12 16.5 12.5 17 12.5 17.5C12.5 18 12 18.5 11.5 18.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
