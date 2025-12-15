interface BabyIconProps {
  className?: string;
}

export function BabyIcon({ className = "w-6 h-6" }: BabyIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bebé/Pediatría - representación tierna y simple */}
      
      {/* Cabeza del bebé */}
      <circle
        cx="12"
        cy="8"
        r="4.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Cara - ojos */}
      <circle
        cx="10.5"
        cy="7.5"
        r="0.8"
        fill="currentColor"
      />
      <circle
        cx="13.5"
        cy="7.5"
        r="0.8"
        fill="currentColor"
      />
      
      {/* Sonrisa */}
      <path
        d="M10 9C10.5 9.5 11.2 9.8 12 9.8C12.8 9.8 13.5 9.5 14 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Cuerpo del bebé */}
      <path
        d="M8.5 12C8 12.5 7.5 13.5 7.5 15C7.5 16.5 8 18 8.5 19C9 20 10 21 11 21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15.5 12C16 12.5 16.5 13.5 16.5 15C16.5 16.5 16 18 15.5 19C15 20 14 21 13 21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Brazos */}
      <path
        d="M8 13.5L5.5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 13.5L18.5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      {/* Manitas */}
      <circle
        cx="5"
        cy="15.5"
        r="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="19"
        cy="15.5"
        r="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Mechón de cabello */}
      <path
        d="M11.5 3.5C11.5 3.5 11.8 3.2 12 3C12.2 3.2 12.5 3.5 12.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
