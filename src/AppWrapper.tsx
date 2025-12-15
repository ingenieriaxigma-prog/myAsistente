// Wrapper principal que incluye todos los providers y optimizaciones

import { useEffect } from 'react';
import App from './App';
import { AppProviders } from './context';
import { InstallPrompt } from './components/common/InstallPrompt';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Componente interno que usa hooks PWA
function PWAComponents() {
  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado:', reg);
        })
        .catch((err) => {
          console.error('Error al registrar Service Worker:', err);
        });
    }
  }, []);

  return (
    <>
      <InstallPrompt />
      <OfflineIndicator />
    </>
  );
}

function AppWithProviders() {
  return (
    <AppProviders>
      <App />
      <PWAComponents />
    </AppProviders>
  );
}

export default AppWithProviders;