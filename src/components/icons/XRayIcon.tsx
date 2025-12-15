interface XRayIconProps {
  className?: string;
}

export function XRayIcon({ className = "w-6 h-6" }: XRayIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Radiografía - esqueleto/rayos X */}
      
      {/* Marco de la radiografía */}
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Esqueleto simplificado - cráneo */}
      <circle
        cx="12"
        cy="8"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Columna vertebral */}
      <path
        d="M12 10.5L12 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Vértebras */}
      <circle cx="12" cy="11.5" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="13" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="14.5" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" opacity="0.6" />
      
      {/* Costillas izquierdas */}
      <path
        d="M12 11.5C11 11.5 10 12 9.5 12.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12 13C11 13 10 13.5 9.5 14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12 14.5C11 14.5 10 15 9.5 15.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Costillas derechas */}
      <path
        d="M12 11.5C13 11.5 14 12 14.5 12.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12 13C13 13 14 13.5 14.5 14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12 14.5C13 14.5 14 15 14.5 15.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Pelvis */}
      <path
        d="M10 17C10 18 10.5 18.5 11 18.5C11.5 18.5 11.75 18.25 12 18C12.25 18.25 12.5 18.5 13 18.5C13.5 18.5 14 18 14 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
