// Layout base para pantallas de diagnóstico

import { ReactNode } from 'react';
import { ChevronLeft, ClockIcon } from 'lucide-react';

interface DiagnosisScreenLayoutProps {
  gradient: string;
  title: string;
  subtitle?: string;
  stepInfo?: string;
  onBack: () => void;
  onViewHistory?: () => void; // 🆕 Opcional: función para ver historial
  children: ReactNode;
  footer?: ReactNode;
}

export function DiagnosisScreenLayout({
  gradient,
  title,
  subtitle,
  stepInfo,
  onBack,
  onViewHistory,
  children,
  footer,
}: DiagnosisScreenLayoutProps) {
  return (
    <div 
      className={`bg-gradient-to-br ${gradient} rounded-3xl shadow-lg overflow-hidden flex flex-col w-full h-full`}
    >
      {/* Header - Sticky para mantenerlo visible */}
      <div className="sticky top-0 z-10 p-4 text-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            {stepInfo && (
              <span className="text-white/90 text-sm">{stepInfo}</span>
            )}
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Ver historial de diagnósticos"
              >
                <ClockIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <h1 className="text-2xl mb-1">{title}</h1>
        {subtitle && <p className="text-white/90 text-sm">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}