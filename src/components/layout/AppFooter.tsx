import type { ReactNode } from 'react';

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
