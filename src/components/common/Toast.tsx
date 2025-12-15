import { CheckCircle, XCircle, AlertCircle, Info, X, Loader } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  showCloseButton?: boolean;
}

export function Toast({ type, message, onClose, duration = 3000, showCloseButton = false }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
    error: <XCircle className="w-6 h-6 text-red-600" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors[type]} min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className={`text-sm flex-1 ${textColors[type]}`}>
          {message}
        </p>
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 hover:opacity-70 transition-opacity ${textColors[type]}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ModalAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: (() => void) | null;
  buttonText?: string;
}

export function ModalAlert({ type, title, message, onClose, buttonText = 'OK' }: ModalAlertProps) {
  const icons = {
    success: (
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
    ),
    error: (
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
    ),
    warning: (
      <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-yellow-600" />
      </div>
    ),
    info: (
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
        <Info className="w-8 h-8 text-blue-600" />
      </div>
    )
  };

  const buttonColors = {
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center text-center">
          {icons[type]}
          <h3 className="text-lg text-gray-900 mb-2">{title}</h3>
          {message && (
            <p className="text-sm text-gray-600 mb-6">{message}</p>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-white transition-colors ${buttonColors[type]}`}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'blue' | 'red' | 'green';
  loading?: boolean;
}

export function ConfirmModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmButtonColor = 'blue',
  loading = false
}: ConfirmModalProps) {
  const confirmColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-scale-in">
        {/* Figma icon placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <svg viewBox="0 0 38 57" className="w-8 h-12">
              <path fill="#fff" d="M19 28.5a9.5 9.5 0 0 1 9.5-9.5H38V9.5A9.5 9.5 0 0 0 28.5 0h-19A9.5 9.5 0 0 0 0 9.5v19A9.5 9.5 0 0 0 9.5 38H19v-9.5Z"/>
              <path fill="#fff" opacity="0.6" d="M19 38a9.5 9.5 0 1 0 0 19v-19Z"/>
              <circle fill="#fff" opacity="0.8" cx="28.5" cy="28.5" r="9.5"/>
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-base text-gray-900 mb-2">{title}</h3>
          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`py-3 px-4 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${confirmColors[confirmButtonColor]}`}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}