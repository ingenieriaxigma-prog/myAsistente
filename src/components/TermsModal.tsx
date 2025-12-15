import { X, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header con botón cerrar */}
        <div className="relative p-6 pb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Ícono */}
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>

          {/* Título */}
          <h2 className="text-center text-gray-900 mb-2">
            My actualizará sus Condiciones y su Política de privacidad.
          </h2>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm text-center text-gray-600 mb-4">
            <span className="text-blue-600 cursor-pointer hover:text-blue-700">Las actualizaciones clave</span> incluyen más información sobre lo siguiente:
          </p>

          <ul className="space-y-3 text-sm text-gray-700 mb-4">
            <li className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">•</span>
              <span>El servicio de My y cómo procesamos tus datos médicos y de salud.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">•</span>
              <span>Cómo utilizamos modelos de inteligencia artificial para proporcionar diagnósticos y recomendaciones médicas personalizadas.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">•</span>
              <span>Cómo protegemos la confidencialidad de tu información de salud y cumplimos con regulaciones médicas.</span>
            </li>
          </ul>

          <p className="text-xs text-gray-500 leading-relaxed">
            Al seleccionar "Aceptar", aceptas las nuevas{' '}
            <span className="text-blue-600 cursor-pointer hover:text-blue-700">Condiciones</span>, que entrarán en vigor el que es más tarde de hace 30 días a partir de cuando las aceptas. También puedes seguir usando My. Después de este período, deberás aceptar las nuevas Condiciones para obtener información sobre cómo{' '}
            <span className="text-blue-600 cursor-pointer hover:text-blue-700">descargar tu información</span>, visita el{' '}
            <span className="text-blue-600 cursor-pointer hover:text-blue-700">Centro de ayuda</span>.
          </p>
        </div>

        {/* Botón Aceptar */}
        <div className="p-6 pt-4 flex-shrink-0">
          <button
            onClick={onAccept}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
