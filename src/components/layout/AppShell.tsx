import type { ReactNode } from 'react';
import './AppShell.css';

interface AppShellProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <div className="app-shell">
      {header && <header className="app-header">{header}</header>}

      <main className="app-content">
        {children}
      </main>

      {footer && <footer className="app-footer">{footer}</footer>}
    </div>
  );
}
