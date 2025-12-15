interface BrainIconProps {
  className?: string;
}

export function BrainIcon({ className = "w-6 h-6" }: BrainIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cerebro - vista lateral simplificada */}
      
      {/* Hemisferio izquierdo */}
      <path
        d="M7 8C6 8 5 9 5 10.5C5 11.5 5.5 12.5 5.5 13.5C5.5 14.5 5 15.5 5.5 16.5C6 17.5 7 18 8 18C8.5 18 9 17.5 9.5 17C10 16.5 10.5 16 11 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Hemisferio derecho */}
      <path
        d="M17 8C18 8 19 9 19 10.5C19 11.5 18.5 12.5 18.5 13.5C18.5 14.5 19 15.5 18.5 16.5C18 17.5 17 18 16 18C15.5 18 15 17.5 14.5 17C14 16.5 13.5 16 13 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Parte superior del cerebro */}
      <path
        d="M7 8C7.5 7 8.5 6 9.5 5.5C10.5 5 11.5 5 12 5C12.5 5 13.5 5 14.5 5.5C15.5 6 16.5 7 17 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Conexión inferior */}
      <path
        d="M11 16C11.5 16.5 11.75 17 12 17C12.25 17 12.5 16.5 13 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Circunvoluciones cerebrales - lado izquierdo */}
      <path
        d="M7.5 10C8 10.5 8.5 11 9 11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M7 13C7.5 13.5 8 14 8.5 14.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Circunvoluciones cerebrales - lado derecho */}
      <path
        d="M16.5 10C16 10.5 15.5 11 15 11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M17 13C16.5 13.5 16 14 15.5 14.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Fisura central */}
      <path
        d="M12 7L12 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
