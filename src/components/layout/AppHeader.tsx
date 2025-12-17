import type { ReactNode } from 'react';

interface AppHeaderProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ title, left, right }: AppHeaderProps) {
  return (
    <div className="flex items-center w-full gap-2">
      <div className="w-10 flex-shrink-0 flex items-center justify-start">
        {left}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {title && <h1 className="text-base font-semibold text-gray-900 text-center truncate">{title}</h1>}
      </div>
      <div className="w-10 flex-shrink-0 flex items-center justify-end">
        {right}
      </div>
    </div>
  );
}
