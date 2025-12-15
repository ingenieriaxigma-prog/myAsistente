import { useEffect, useState } from 'react';
import { Brain, Activity, CheckCircle, FileText } from 'lucide-react';
import type { Specialty, PatientData, DiagnosisResult, DiagnosisMetadata } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { GradientHeader } from './common/GradientHeader';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../services/api';

interface DiagnosisAnalysisProps {
  specialty: Specialty;
  patientData: PatientData;
  symptoms: string[];
  onBack: () => void;
  onComplete: (result: DiagnosisResult, metadata: DiagnosisMetadata) => void;
}

interface AnalysisStepProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isComplete: boolean;
  gradient: string;
}

function AnalysisStep({ icon: Icon, label, isActive, isComplete, gradient }: AnalysisStepProps) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
      isActive ? 'bg-blue-50 scale-105' : isComplete ? 'bg-green-50' : 'bg-gray-50'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
        isActive 
          ? `bg-gradient-to-r ${gradient} animate-pulse shadow-lg` 
          : isComplete 
          ? 'bg-green-500 shadow-md' 
          : 'bg-gray-200'
      }`}>
        <Icon className={`w-6 h-6 ${isActive || isComplete ? 'text-white' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm transition-colors duration-500 ${
          isActive ? 'text-blue-900' : isComplete ? 'text-green-900' : 'text-gray-500'
        }`}>
          {label}
        </p>
      </div>
      {isComplete && (
        <CheckCircle className="w-5 h-5 text-green-500 animate-bounce-in" />
      )}
    </div>
  );
}

export function DiagnosisAnalysis({ specialty, patientData, symptoms, onBack, onComplete }: DiagnosisAnalysisProps) {
  const theme = useSpecialtyTheme(specialty);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analysisSteps = [
    { icon: FileText, label: 'Recopilando información', delay: 0 },
    { icon: Brain, label: 'Analizando síntomas con IA', delay: 800 },
    { icon: Activity, label: 'Evaluando gravedad', delay: 1600 },
    { icon: CheckCircle, label: 'Generando recomendaciones', delay: 2400 },
  ];

  useEffect(() => {
    let mounted = true;
    
    const performAnalysis = async () => {
      try {
        // Animar pasos mientras carga
        const timers = analysisSteps.map((step, index) => {
          return setTimeout(() => {
            if (mounted) setCurrentStep(index + 1);
          }, step.delay);
        });

        // Llamar al backend para análisis real
        console.log('🔍 Starting intelligent diagnosis analysis...');
        
        // Obtener el token de acceso de la sesión de Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          throw new Error('No se pudo obtener la sesión de autenticación');
        }
        
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          console.error('❌ No access token found');
          throw new Error('No se encontró token de autenticación. Por favor inicia sesión nuevamente.');
        }
        
        console.log('✅ Access token obtained');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/analyze`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              patientData,
              symptoms,
              specialty
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to analyze diagnosis');
        }

        const data = await response.json();
        console.log('✅ Diagnosis analysis complete:', data);

        if (mounted) {
          setAnalysisComplete(true);
          
          // Esperar un momento para mostrar que completó
          setTimeout(() => {
            if (mounted) {
              onComplete(data.result, data.metadata);
            }
          }, 1000);
        }

        return () => {
          timers.forEach(timer => clearTimeout(timer));
        };
        
      } catch (error) {
        console.error('❌ Error analyzing diagnosis:', error);
        if (mounted) {
          setError(error.message);
        }
      }
    };

    performAnalysis();

    return () => {
      mounted = false;
    };
  }, [specialty, patientData, symptoms, onComplete]);

  return (
    <ScreenContainer>
      {/* Header con gradiente */}
      <GradientHeader gradient={theme.gradient} className="p-6 text-white text-center">
        <h1 className="text-2xl mb-2">Análisis en progreso</h1>
        <p className="text-white/80 text-sm">Evaluando tu información clínica con IA</p>
      </GradientHeader>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Animación central */}
        <div className="relative mb-12">
          {/* Círculo pulsante exterior */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-20 rounded-full animate-ping`} 
            style={{ width: '160px', height: '160px', margin: '-20px' }}
          />
          
          {/* Círculo principal */}
          <div className={`w-32 h-32 bg-gradient-to-r ${theme.gradient} rounded-full flex items-center justify-center shadow-2xl relative`}>
            <Brain className="w-16 h-16 text-white animate-pulse" />
            
            {/* Puntos orbitales */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* Pasos de análisis */}
        <div className="w-full max-w-md space-y-4">
          {analysisSteps.map((step, index) => (
            <AnalysisStep
              key={index}
              icon={step.icon}
              label={step.label}
              isActive={currentStep === index}
              isComplete={currentStep > index}
              gradient={theme.gradient}
            />
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="w-full max-w-md mt-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 ease-out`}
              style={{ width: `${(currentStep / analysisSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {Math.round((currentStep / analysisSteps.length) * 100)}% completado
          </p>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-white/95">
          <div className="max-w-md">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg text-red-900 mb-2">Error en el análisis</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Volver e intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}