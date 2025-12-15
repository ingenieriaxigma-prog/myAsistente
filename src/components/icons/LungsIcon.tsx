interface LungsIconProps {
  className?: string;
}

export function LungsIcon({ className = "w-6 h-6" }: LungsIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pulmones - vista frontal */}
      
      {/* Tráquea central */}
      <path
        d="M12 3L12 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Bronquios principales */}
      <path
        d="M12 7L9 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 7L15 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      {/* Pulmón izquierdo */}
      <path
        d="M9 9C7.5 10 6 11.5 5.5 13.5C5 15.5 5 17.5 5.5 19C6 20.5 7 21.5 8.5 21.5C9.5 21.5 10 20.5 10.5 19C11 17.5 11 15.5 11 13.5C11 11.5 10 10 9 9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pulmón derecho */}
      <path
        d="M15 9C16.5 10 18 11.5 18.5 13.5C19 15.5 19 17.5 18.5 19C18 20.5 17 21.5 15.5 21.5C14.5 21.5 14 20.5 13.5 19C13 17.5 13 15.5 13 13.5C13 11.5 14 10 15 9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bronquiolos - pulmón izquierdo */}
      <path
        d="M9 9L7.5 11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M9 9L8 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Bronquiolos - pulmón derecho */}
      <path
        d="M15 9L16.5 11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M15 9L16 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
