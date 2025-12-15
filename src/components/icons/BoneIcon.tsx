interface BoneIconProps {
  className?: string;
}

export function BoneIcon({ className = "w-6 h-6" }: BoneIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ortopedia - hueso y articulación */}
      
      {/* Articulación superior */}
      <circle
        cx="7"
        cy="7"
        r="3.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Articulación inferior */}
      <circle
        cx="17"
        cy="17"
        r="3.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Hueso/fémur conectando las articulaciones */}
      <path
        d="M9.5 9.5L14.5 14.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Detalles de la articulación superior */}
      <circle
        cx="7"
        cy="7"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />
      
      {/* Detalles de la articulación inferior */}
      <circle
        cx="17"
        cy="17"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />
      
      {/* Líneas de fuerza/estrés en el hueso */}
      <path
        d="M11 11L11.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M12.5 12.5L13 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Tendones/ligamentos */}
      <path
        d="M5.5 5.5L4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M8.5 5.5L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M18.5 18.5L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M15.5 18.5L14 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
