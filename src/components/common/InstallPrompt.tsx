// Componente para promover instalación de PWA

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Mostrar prompt después de 30 segundos si es instalable y no está instalado
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  // No mostrar si ya está instalado o fue rechazado
  if (isInstalled || !showPrompt || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Guardar preferencia en localStorage
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base mb-1">Instala My Health</h3>
            <p className="text-sm text-white/90 mb-3">
              Accede más rápido y úsala sin conexión
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm hover:bg-white/90 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm hover:bg-white/30 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
