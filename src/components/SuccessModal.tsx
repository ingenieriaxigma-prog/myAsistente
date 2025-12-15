import { CheckCircle, X } from 'lucide-react';
import type { Specialty } from '../types';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: () => void;
  title: string;
  message: string;
  details?: {
    label: string;
    value: string;
  }[];
  specialty: Specialty;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  onViewProfile,
  title, 
  message, 
  details,
  specialty 
}: SuccessModalProps) {
  if (!isOpen) return null;

  // Determinar colores según la especialidad
  const colors = specialty === 'MyPelvic' 
    ? {
        gradient: 'from-teal-500 to-cyan-600',
        icon: 'text-teal-600',
        iconBg: 'bg-teal-100',
        button: 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700',
        accent: 'text-teal-600'
      }
    : {
        gradient: 'from-blue-500 to-blue-600',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        accent: 'text-blue-600'
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <CheckCircle size={32} className={colors.icon} />
        </div>

        {/* Title */}
        <h2 className={`text-center mb-2 ${colors.accent}`}>
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{detail.label}</span>
                <span className="text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Ver en Perfil Button - Primary */}
          {onViewProfile && (
            <button
              onClick={() => {
                onViewProfile();
                onClose();
              }}
              className={`w-full py-3 px-4 ${colors.button} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              Ver en Perfil
            </button>
          )}

          {/* Entendido Button - Secondary */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200"
          >
            Entendido
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {onViewProfile 
            ? 'Accede a tu historial completo en cualquier momento'
            : 'Puedes ver tus resultados guardados en tu perfil'
          }
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}