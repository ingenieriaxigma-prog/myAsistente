interface ColonIconProps {
  className?: string;
}

export function ColonIcon({ className = "w-6 h-6" }: ColonIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Estómago/Sistema digestivo basado en la imagen */}
      
      {/* Parte superior del esófago */}
      <path
        d="M10 3C10 3 10.5 3.5 11 4.5C11.5 5.5 12 6.5 12.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Cuerpo principal del estómago - forma curva característica */}
      <path
        d="M12.5 7C13.5 7.5 14.5 8 15.5 9C17 10.5 18 12.5 18 14.5C18 16.5 17.5 18.5 16.5 19.5C15.5 20.5 14 21 12.5 21C11 21 9.5 20.5 8.5 19.5C7.5 18.5 7 17 7 15.5C7 14 7.5 12.5 8.5 11.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Curvatura menor (lado izquierdo superior) */}
      <path
        d="M8.5 11.5C8 10.5 7.5 9.5 7 8.5C6.5 7.5 6 6.5 6 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Parte inferior - inicio del duodeno */}
      <path
        d="M7 15.5C6.5 16 6 16.5 5.5 17C5 17.5 4.5 18 4 18.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}