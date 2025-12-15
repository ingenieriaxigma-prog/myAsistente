// Componente de fallback para Suspense mientras se cargan componentes lazy

interface LoadingFallbackProps {
  message?: string;
  gradient?: string;
}

export function LoadingFallback({ 
  message = 'Cargando...', 
  gradient = 'from-blue-500 to-blue-600' 
}: LoadingFallbackProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex items-center justify-center" style={{ height: '844px' }}>
      <div className="text-center">
        {/* Spinner animado */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full animate-ping opacity-25`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full animate-pulse`} />
        </div>
        
        {/* Mensaje */}
        <p className="text-gray-600 text-sm">{message}</p>
        
        {/* Puntos animados */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
