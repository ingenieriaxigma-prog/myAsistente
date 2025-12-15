import { Clock, Home, Download, Calendar, Stethoscope, Activity, TrendingUp, Dumbbell, FileText, Brain, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import type { Specialty, PatientData, DiagnosisResult, DiagnosisMetadata } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { GradientButton } from './common/GradientButton';
import { ActionCard } from './common/ActionCard';
import { urgencyConfig } from '../config/diagnosisResults';
import { ModalAlert, ConfirmModal } from './common/Toast';
import { useState } from 'react';
import { generateDiagnosisPDF } from '../utils/pdfGenerator';

interface DiagnosisStep3Props {
  specialty: Specialty;
  patientData: PatientData;
  symptoms: string[];
  diagnosisResult: DiagnosisResult;  // NUEVO
  metadata: DiagnosisMetadata;       // NUEVO
  onBack: () => void;
  onBackToHome: () => void;
  onStartTreatmentPlan?: () => void;
  onSaveDiagnosis?: () => void;      // 🆕 NUEVO
  onResetDiagnosisFlow?: () => void; // 🆕 NUEVO
}

export function DiagnosisStep3({ 
  specialty, 
  patientData, 
  symptoms,
  diagnosisResult,  // NUEVO
  metadata,         // NUEVO
  onBack, 
  onBackToHome, 
  onStartTreatmentPlan,
  onSaveDiagnosis,
  onResetDiagnosisFlow
}: DiagnosisStep3Props) {
  const theme = useSpecialtyTheme(specialty);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Usar resultado de IA en lugar de cálculo simple
  const urgencyLevel = diagnosisResult.urgencyLevel;
  const result = urgencyConfig[urgencyLevel]; // Solo para colores e iconos
  
  // 🆕 USAR TEXTOS DE IA EN LUGAR DE CONFIG ESTÁTICO
  const urgencyTitle = diagnosisResult.urgencyTitle;
  const urgencyDescription = diagnosisResult.urgencyDescription;
  const urgencyTimeframe = diagnosisResult.urgencyTimeframe;

  const handleDownloadReport = async () => {
    try {
      setShowPdfModal(true);
      
      // Pequeño delay para mostrar el modal antes de generar el PDF
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await generateDiagnosisPDF({
        specialty,
        patientData,
        symptoms,
        diagnosisResult,
        urgencyTitle,
        urgencyDescription,
        urgencyTimeframe
      });
      
      // Mantener el modal visible por un momento para que el usuario vea el mensaje
      setTimeout(() => {
        setShowPdfModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setShowPdfModal(false);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const handleScheduleAppointment = () => {
    alert('Redirigiendo a sistema de agendamiento de citas...');
  };

  const handleStartTreatment = () => {
    if (onStartTreatmentPlan) {
      onStartTreatmentPlan();
    } else {
      alert('Iniciando plan de tratamiento personalizado...');
    }
  };

  const handleSaveDiagnosis = () => {
    if (onSaveDiagnosis) {
      onSaveDiagnosis();
    } else {
      alert('Guardando diagnóstico...');
    }
  };

  const handleResetDiagnosisFlow = () => {
    setShowResetConfirm(true);
  };

  const confirmResetDiagnosisFlow = () => {
    if (onResetDiagnosisFlow) {
      onResetDiagnosisFlow();
    }
    onBackToHome();
    setShowResetConfirm(false);
  };

  const cancelResetDiagnosisFlow = () => {
    setShowResetConfirm(false);
  };

  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-4 text-white flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={onBackToHome}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-2xl mb-1">Resultados de evaluación</h1>
        <p className="text-white/80 text-sm">Análisis completo y plan de acción</p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Resultado principal - Nivel de urgencia */}
        <div className={`${result.bgColor} border-2 ${result.borderColor} rounded-2xl p-5`}>
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-14 h-14 ${result.bgColor} border-2 ${result.borderColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <result.icon className={`w-7 h-7 ${result.iconColor}`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl mb-1 ${result.textColor}`}>{urgencyTitle}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{urgencyDescription}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${result.textColor} bg-white/50 rounded-xl p-3 mt-3`}>
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{urgencyTimeframe}</span>
          </div>
        </div>

        {/* Resumen de IA */}
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <h3 className="text-base mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Análisis Clínico con IA
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {diagnosisResult.summary}
          </p>
          
          {/* Indicador de RAG */}
          {metadata.ragUsed && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
              <CheckCircle className="w-4 h-4" />
              <span>
                Análisis basado en {metadata.chunksFound} fuentes de nuestra base de conocimiento médico
              </span>
            </div>
          )}
        </div>

        {/* Posibles diagnósticos */}
        {diagnosisResult.possibleDiagnoses && diagnosisResult.possibleDiagnoses.length > 0 && (
          <div>
            <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Posibles Diagnósticos
            </h3>
            <div className="space-y-2">
              {diagnosisResult.possibleDiagnoses.map((diagnosis, index) => (
                <div 
                  key={index}
                  className={`rounded-xl p-4 border-2 ${
                    diagnosis.probability === 'high' 
                      ? 'bg-orange-50 border-orange-200' 
                      : diagnosis.probability === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium">{diagnosis.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      diagnosis.probability === 'high'
                        ? 'bg-orange-200 text-orange-800'
                        : diagnosis.probability === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {diagnosis.probability === 'high' ? 'Alta probabilidad' : 
                       diagnosis.probability === 'medium' ? 'Probabilidad media' : 
                       'Baja probabilidad'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {diagnosis.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Red Flags si existen */}
        {diagnosisResult.redFlags && diagnosisResult.redFlags.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <h3 className="text-sm text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Señales de Alarma Detectadas
            </h3>
            <ul className="space-y-1">
              {diagnosisResult.redFlags.map((flag, index) => (
                <li key={index} className="text-xs text-red-700 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resumen de información del paciente */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumen de tu evaluación
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2">
              <span className="text-gray-500">Género:</span>
              <p className="text-gray-900 mt-0.5">
                {patientData.gender === 'male' ? 'Masculino' : 
                 patientData.gender === 'female' ? 'Femenino' : 'Transgénero'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <span className="text-gray-500">Edad:</span>
              <p className="text-gray-900 mt-0.5">{patientData.ageRange}</p>
            </div>
            <div className="bg-white rounded-lg p-2 col-span-2">
              <span className="text-gray-500">Síntomas reportados:</span>
              <p className="text-gray-900 mt-0.5">{symptoms.length} síntomas</p>
            </div>
          </div>
        </div>

        {/* Acciones inmediatas */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Acciones inmediatas
          </h3>
          <div className="space-y-2">
            {diagnosisResult.recommendations.immediate.map((action, index) => (
              <ActionCard 
                key={index}
                title={action.title}
                description={action.description}
                priority={action.priority}
              />
            ))}
          </div>
        </div>

        {/* Cambios en el estilo de vida */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Cambios en el estilo de vida
          </h3>
          <div className="space-y-2">
            {diagnosisResult.recommendations.lifestyle.map((action, index) => (
              <ActionCard 
                key={index}
                title={action.title}
                description={action.description}
                variant="compact"
              />
            ))}
          </div>
        </div>

        {/* Monitoreo y seguimiento */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Monitoreo y seguimiento
          </h3>
          <div className="space-y-2">
            {diagnosisResult.recommendations.monitoring.map((action, index) => (
              <ActionCard 
                key={index}
                title={action.title}
                description={action.description}
                variant="compact"
              />
            ))}
          </div>
        </div>

        {/* Próximos pasos */}
        {diagnosisResult.nextSteps && diagnosisResult.nextSteps.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <h3 className="text-sm text-blue-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Próximos Pasos Recomendados
            </h3>
            <ol className="space-y-2">
              {diagnosisResult.nextSteps.map((step, index) => (
                <li key={index} className="text-xs text-blue-800 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Aviso importante:</strong> Esta evaluación es informativa y no reemplaza una consulta médica profesional. 
            Los resultados son orientativos y basados en la información proporcionada. Siempre consulta con un profesional 
            de la salud para un diagnóstico y tratamiento adecuado.
          </p>
        </div>
      </div>

      {/* Footer con botones de acción */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <GradientButton
            gradient={theme.gradient}
            onClick={handleScheduleAppointment}
            size="md"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar cita
          </GradientButton>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </button>
        </div>

        {/* 🆕 BANNER COMPACTO: Plan personalizado con IA */}
        <div className={`bg-gradient-to-r ${theme.gradient} rounded-xl p-4 text-white shadow-md`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm mb-0.5 flex items-center gap-1.5">
                ✨ Plan Personalizado de 8 Semanas
              </h3>
              <p className="text-white/90 text-xs">
                La IA creará ejercicios adaptados a tu diagnóstico y edad
              </p>
            </div>
          </div>
        </div>

        <GradientButton
          gradient={theme.gradient}
          onClick={handleStartTreatment}
          fullWidth
          size="lg"
        >
          <Dumbbell className="w-5 h-5 mr-2" />
          Iniciar plan de tratamiento
        </GradientButton>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveDiagnosis}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Guardar diagnóstico
          </button>
          <button
            onClick={handleResetDiagnosisFlow}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nuevo diagnóstico
          </button>
        </div>
      </div>

      {/* PDF Generation Modal */}
      {showPdfModal && (
        <ModalAlert
          type="info"
          title="Generando reporte PDF completo con análisis y plan de acción..."
          onClose={null}
          buttonText="OK"
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <ConfirmModal
          title="¿Iniciar un nuevo diagnóstico?"
          message="Los datos actuales se perderán si no los has guardado."
          onConfirm={confirmResetDiagnosisFlow}
          onCancel={cancelResetDiagnosisFlow}
        />
      )}
    </ScreenContainer>
  );
}