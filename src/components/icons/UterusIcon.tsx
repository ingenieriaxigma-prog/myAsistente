interface UterusIconProps {
  className?: string;
}

export function UterusIcon({ className = "w-6 h-6" }: UterusIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Útero - forma característica */}
      
      {/* Cuerpo del útero */}
      <path
        d="M12 8C9.5 8 7.5 9.5 7 12C6.5 14.5 7 17 8.5 18.5C9.5 19.5 10.5 20 12 20C13.5 20 14.5 19.5 15.5 18.5C17 17 17.5 14.5 17 12C16.5 9.5 14.5 8 12 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Trompa de Falopio izquierda */}
      <path
        d="M7 12C6 11.5 5 11 4.5 10C4 9 4 8 4.5 7.5C5 7 5.5 7 6 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Trompa de Falopio derecha */}
      <path
        d="M17 12C18 11.5 19 11 19.5 10C20 9 20 8 19.5 7.5C19 7 18.5 7 18 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Ovario izquierdo */}
      <ellipse
        cx="4.5"
        cy="7.5"
        rx="1.5"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Ovario derecho */}
      <ellipse
        cx="19.5"
        cy="7.5"
        rx="1.5"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Cuello uterino */}
      <path
        d="M11 20C11 20.5 11 21 11.5 21.5C11.75 21.75 12.25 21.75 12.5 21.5C13 21 13 20.5 13 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
