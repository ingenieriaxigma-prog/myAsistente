// Export centralizado de todos los contextos

export { AppProvider, useAppContext } from './AppContext';
export { UserProvider, useUser } from './UserContext';
export type { UserProfile } from './UserContext';

// Provider combinado para envolver toda la aplicación
import { ReactNode } from 'react';
import { AppProvider } from './AppContext';
import { UserProvider } from './UserContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </UserProvider>
  );
}
