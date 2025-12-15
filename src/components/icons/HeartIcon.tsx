interface HeartIconProps {
  className?: string;
}

export function HeartIcon({ className = "w-6 h-6" }: HeartIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corazón anatómico con detalles médicos */}
      
      {/* Contorno principal del corazón */}
      <path
        d="M12 21C12 21 4 15 4 9C4 6.5 5.5 5 7.5 5C9 5 10.5 6 11.5 7.5C11.75 8 12 8 12 8C12 8 12.25 8 12.5 7.5C13.5 6 15 5 16.5 5C18.5 5 20 6.5 20 9C20 15 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Líneas de división de cámaras cardíacas */}
      <path
        d="M12 8L12 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Aurículas */}
      <path
        d="M8 10C8 10 9 9 10 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      <path
        d="M16 10C16 10 15 9 14 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Línea de pulso ECG */}
      <path
        d="M7 13L8 13L8.5 11.5L9.5 14.5L10 13L11 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      
      <path
        d="M13 13L14 13L14.5 11.5L15.5 14.5L16 13L17 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}
