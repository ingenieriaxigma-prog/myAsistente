interface PelvisIconProps {
  className?: string;
}

export function PelvisIcon({ className = "w-6 h-6" }: PelvisIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pelvis ósea simplificada */}
      <path
        d="M12 4C10.5 4 9 5 8 6.5C7 8 6.5 10 6 12C5.5 14 5 16 4.5 17.5C4 19 4 20 5 20C6 20 6.5 19 7 18C7.5 17 8 16 8.5 15.5C9 15 9.5 15 10 15.5C10.5 16 11 17 11.5 18.5C11.75 19.25 11.75 20 12 20C12.25 20 12.25 19.25 12.5 18.5C13 17 13.5 16 14 15.5C14.5 15 15 15 15.5 15.5C16 16 16.5 17 17 18C17.5 19 18 20 19 20C20 20 20 19 19.5 17.5C19 16 18.5 14 18 12C17.5 10 17 8 16 6.5C15 5 13.5 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Cavidad pélvica central */}
      <ellipse
        cx="12"
        cy="10"
        rx="3.5"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Articulaciones de cadera */}
      <circle
        cx="8.5"
        cy="15.5"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        opacity="0.3"
      />
      <circle
        cx="15.5"
        cy="15.5"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}
