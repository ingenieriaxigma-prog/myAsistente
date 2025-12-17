import { useState, lazy, Suspense } from 'react';
import { useAuth } from './hooks/useAuth';
import { getNextDiagnosisStep, getPreviousDiagnosisStep } from './utils/navigation';
import { projectId } from './utils/supabase/info';
import { LoginScreen } from './components/LoginScreen';
import { SpecialtySelection } from './components/SpecialtySelection';
import { SpecialtyHome } from './components/SpecialtyHome';
import { AdminPanel } from './components/AdminPanel';
import { SuccessModal } from './components/SuccessModal';
import type { 
  Exercise, 
  Screen, 
  Specialty, 
  PatientData, 
  UrgencyLevel,
  DiagnosisResult,
  DiagnosisMetadata
} from './types';
import { calculateUrgencyLevel } from './utils/symptoms';

// Lazy load para componentes grandes
const ClinicalChat = lazy(() => import('./components/ClinicalChat').then(m => ({ default: m.ClinicalChat })));
const DiagnosisStep1 = lazy(() => import('./components/DiagnosisStep1').then(m => ({ default: m.DiagnosisStep1 })));
const DiagnosisStep2 = lazy(() => import('./components/DiagnosisStep2').then(m => ({ default: m.DiagnosisStep2 })));
const DiagnosisStep2Urinary = lazy(() => import('./components/DiagnosisStep2Urinary').then(m => ({ default: m.DiagnosisStep2Urinary })));
const DiagnosisStep2Prolapse = lazy(() => import('./components/DiagnosisStep2Prolapse').then(m => ({ default: m.DiagnosisStep2Prolapse })));
const DiagnosisStep2Sexual = lazy(() => import('./components/DiagnosisStep2Sexual').then(m => ({ default: m.DiagnosisStep2Sexual })));
const DiagnosisStep2Male = lazy(() => import('./components/DiagnosisStep2Male').then(m => ({ default: m.DiagnosisStep2Male })));
const DiagnosisStep2Trans = lazy(() => import('./components/DiagnosisStep2Trans').then(m => ({ default: m.DiagnosisStep2Trans })));
const DiagnosisAnalysis = lazy(() => import('./components/DiagnosisAnalysis').then(m => ({ default: m.DiagnosisAnalysis })));
const DiagnosisStep3 = lazy(() => import('./components/DiagnosisStep3').then(m => ({ default: m.DiagnosisStep3 })));
const AITreatmentPlan = lazy(() => import('./components/AITreatmentPlan').then(m => ({ default: m.AITreatmentPlan }))); // 🆕 Plan generado por IA
const ExerciseDetail = lazy(() => import('./components/ExerciseDetail').then(m => ({ default: m.ExerciseDetail })));
const ProfileScreen = lazy(() => import('./components/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, session, loading: authLoading } = useAuth();
  const appUser = user ?? session?.user ?? null;
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>(null);
  const [patientData, setPatientData] = useState<PatientData>({
    gender: null,
    ageRange: '',
    hasSymptoms: false,
    healthDescription: ''
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedUrinarySymptoms, setSelectedUrinarySymptoms] = useState<string[]>([]);
  const [selectedProlapseSymptoms, setSelectedProlapseSymptoms] = useState<string[]>([]);
  const [selectedSexualSymptoms, setSelectedSexualSymptoms] = useState<string[]>([]);
  const [selectedMaleSymptoms, setSelectedMaleSymptoms] = useState<string[]>([]);
  const [selectedTransSymptoms, setSelectedTransSymptoms] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('mild');
  
  // NUEVO: Estados para diagnóstico con IA
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [diagnosisMetadata, setDiagnosisMetadata] = useState<DiagnosisMetadata | null>(null);

  // 🆕 Estado para el plan de tratamiento generado
  const [generatedTreatmentPlan, setGeneratedTreatmentPlan] = useState<any | null>(null);
  
  // 🆕 Estado para el ID del diagnóstico guardado
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);

  // 🆕 Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    details: { label: string; value: string; }[];
  } | null>(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false); // 🆕 Estado para abrir historial en perfil

  // 🆕 Función para resetear todo el flujo de diagnóstico
  const resetDiagnosisFlow = () => {
    console.log('🧹 Resetting diagnosis flow...');
    setPatientData({
      gender: null,
      ageRange: '',
      hasSymptoms: false,
      healthDescription: ''
    });
    setSelectedSymptoms([]);
    setSelectedUrinarySymptoms([]);
    setSelectedProlapseSymptoms([]);
    setSelectedSexualSymptoms([]);
    setSelectedMaleSymptoms([]);
    setSelectedTransSymptoms([]);
    setDiagnosisResult(null);
    setDiagnosisMetadata(null);
    setUrgencyLevel('mild');
    setGeneratedTreatmentPlan(null); // 🔥 LIMPIAR PLAN DE TRATAMIENTO
    setSavedDiagnosisId(null); // 🔥 LIMPIAR ID DE DIAGNÓSTICO GUARDADO
  };

  // 🆕 Función para guardar diagnóstico (simulado por ahora)
  const handleSaveDiagnosis = async () => {
    if (!diagnosisResult || !selectedSpecialty || !appUser || !session) {
      console.error('Missing required data:', {
        diagnosisResult: !!diagnosisResult,
        selectedSpecialty: !!selectedSpecialty,
        user: !!appUser,
        session: !!session
      });
      return;
    }
    
    // 🔥 COMBINAR TODOS LOS SÍNTOMAS
    const allSymptoms = [
      ...selectedSymptoms,
      ...selectedUrinarySymptoms,
      ...selectedProlapseSymptoms,
      ...selectedSexualSymptoms,
      ...selectedMaleSymptoms,
      ...selectedTransSymptoms
    ].filter(s => s);
    
    console.log('💾 Saving diagnosis result...');
    console.log('User:', appUser?.email);
    console.log('Session access_token:', session.access_token ? 'Present' : 'Missing');
    console.log('Diagnosis result:', diagnosisResult);
    console.log('Patient data:', patientData);
    console.log('All combined symptoms:', allSymptoms);
    console.log('Specialty:', selectedSpecialty);
    console.log('Metadata:', diagnosisMetadata);
    
    try {
      const requestBody = {
        diagnosisResult,
        patientData,
        symptoms: allSymptoms, // 🔥 USAR TODOS LOS SÍNTOMAS COMBINADOS
        specialty: selectedSpecialty,
        metadata: diagnosisMetadata // 🔥 Include metadata from diagnosis analysis
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/save`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`, // 🔥 Use session.access_token instead of user.access_token
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Server error:', data);
        throw new Error(data.details || data.error || 'Failed to save diagnosis');
      }

      console.log('✅ Diagnosis saved:', data.diagnosisId);
      
      // Mapear nivel de urgencia a texto legible
      const urgencyLabels = {
        urgent: 'Urgente',
        moderate: 'Moderado',
        mild: 'Leve'
      };

      setSuccessModalData({
        title: 'Diagnóstico Guardado Exitosamente',
        message: 'Tu diagnóstico ha sido guardado correctamente en tu historial médico.',
        details: [
          { label: 'Nivel de Urgencia', value: urgencyLabels[diagnosisResult.urgencyLevel] || diagnosisResult.urgencyLevel },
          { label: 'Diagnósticos Analizados', value: diagnosisResult.possibleDiagnoses.length.toString() },
          { label: 'Síntomas Evaluados', value: allSymptoms.length.toString() } // 🔥 USAR TOTAL DE SÍNTOMAS
        ]
      });
      setShowSuccessModal(true);
      setSavedDiagnosisId(data.diagnosisId);

      return data.diagnosisId; // 🆕 Retornar el diagnosisId para usarlo en auto-guardado

    } catch (error) {
      console.error('❌ Error saving diagnosis:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert(`XIGMA - Error al guardar el diagnóstico:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
      throw error; // 🆕 Re-lanzar el error para que el auto-guardado lo maneje
    }
  };

  // 🆕 Función para guardar diagnóstico SILENTIOSAMENTE (sin modal)
  const handleSilentSaveDiagnosis = async () => {
    if (!diagnosisResult || !selectedSpecialty || !user || !session) {
      console.error('Missing required data for silent save');
      return null;
    }
    
    // 🔥 COMBINAR TODOS LOS SÍNTOMAS
    const allSymptoms = [
      ...selectedSymptoms,
      ...selectedUrinarySymptoms,
      ...selectedProlapseSymptoms,
      ...selectedSexualSymptoms,
      ...selectedMaleSymptoms,
      ...selectedTransSymptoms
    ].filter(s => s);
    
    console.log('💾 Silently saving diagnosis...');
    
    try {
      const requestBody = {
        diagnosisResult,
        patientData,
        symptoms: allSymptoms, // 🔥 USAR TODOS LOS SÍNTOMAS COMBINADOS
        specialty: selectedSpecialty,
        metadata: diagnosisMetadata
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/save`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Silent save error:', data);
        return null;
      }

      console.log('✅ Diagnosis silently saved:', data.diagnosisId);
      setSavedDiagnosisId(data.diagnosisId);
      return data.diagnosisId;

    } catch (error) {
      console.error('❌ Error in silent save:', error);
      return null;
    }
  };

  // Función para navegar al siguiente paso
  const navigateToNextStep = () => {
    const nextStep = getNextDiagnosisStep(
      currentScreen,
      patientData.gender,
      patientData.problemAreas
    );
    if (nextStep) setCurrentScreen(nextStep);
  };

  // Función para navegar al paso anterior
  const navigateToPreviousStep = () => {
    const prevStep = getPreviousDiagnosisStep(
      currentScreen,
      patientData.gender,
      patientData.problemAreas
    );
    if (prevStep) setCurrentScreen(prevStep);
  };

  // Handlers de navegación principal
  const handleLogin = () => {
    if (!appUser) {
      console.error('handleLogin called without user/session ready');
      return;
    }
    console.log('handleLogin called, user:', appUser);
    setCurrentScreen('specialty-selection');
  };
  
  const handleSpecialtySelect = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setCurrentScreen('specialty-home');
  };

  const handleBackToSpecialties = () => {
    setSelectedSpecialty(null);
    setCurrentScreen('specialty-selection');
  };

  const handleOpenChat = () => setCurrentScreen('chat');
  const handleOpenDiagnosis = () => setCurrentScreen('diagnosis-step1');
  const handleBackFromChat = () => {
    resetDiagnosisFlow(); // Limpiar diagnóstico al salir
    setCurrentScreen('specialty-home');
  };
  const handleOpenProfile = () => setCurrentScreen('profile');
  const handleBackFromProfile = () => setCurrentScreen('specialty-home');
  const handleBackToHome = () => {
    resetDiagnosisFlow(); // Limpiar diagnóstico al volver al home
    setCurrentScreen('specialty-home');
  };
  const handleOpenAdmin = () => setCurrentScreen('admin');
  const handleBackFromAdmin = () => setCurrentScreen('profile');

  const handleLogout = () => {
    setCurrentScreen('login');
    setSelectedSpecialty(null);
    setPatientData({
      gender: null,
      ageRange: '',
      hasSymptoms: false,
      healthDescription: ''
    });
    setSelectedSymptoms([]);
    setSelectedUrinarySymptoms([]);
    setSelectedProlapseSymptoms([]);
    setSelectedSexualSymptoms([]);
    setSelectedMaleSymptoms([]);
    setSelectedTransSymptoms([]);
  };

  // Handlers del flujo de diagnóstico
  const handleContinueToStep2 = (data: PatientData) => {
    setPatientData(data);
    const nextStep = getNextDiagnosisStep('diagnosis-step1', data.gender, data.problemAreas);
    if (nextStep) setCurrentScreen(nextStep);
  };

  const handleContinueToStep2Urinary = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
    navigateToNextStep();
  };

  const handleContinueToStep2Prolapse = (urinarySymptoms: string[]) => {
    setSelectedUrinarySymptoms(urinarySymptoms);
    navigateToNextStep();
  };

  const handleContinueToStep2Sexual = (prolapseSymptoms: string[]) => {
    setSelectedProlapseSymptoms(prolapseSymptoms);
    navigateToNextStep();
  };

  const handleContinueToStep2Male = (sexualSymptoms: string[]) => {
    setSelectedSexualSymptoms(sexualSymptoms);
    navigateToNextStep();
  };

  const handleContinueToStep2Trans = (maleSymptoms: string[]) => {
    setSelectedMaleSymptoms(maleSymptoms);
    navigateToNextStep();
  };

  const handleContinueToStep3 = (transSymptoms: string[]) => {
    setSelectedTransSymptoms(transSymptoms);
    navigateToNextStep();
  };

  // ACTUALIZADO: Handler con IA real
  const handleAnalysisComplete = (result: DiagnosisResult, metadata: DiagnosisMetadata) => {
    console.log('📊 Diagnosis complete:', result);
    setDiagnosisResult(result);
    setDiagnosisMetadata(metadata);
    setUrgencyLevel(result.urgencyLevel);
    setCurrentScreen('diagnosis-step3');
  };

  // 🆕 ACTUALIZADO: Auto-guardar diagnóstico si no está guardado
  const handleStartTreatmentPlan = async () => {
    // Si el diagnóstico no ha sido guardado, guardarlo automáticamente de forma silenciosa
  if (!savedDiagnosisId && diagnosisResult && selectedSpecialty && appUser && session) {
      console.log('💾 Auto-guardando diagnóstico silenciosamente antes de ir al plan...');
      await handleSilentSaveDiagnosis(); // 🔥 Guardar SILENTIOSAMENTE (sin modal)
    }
    setCurrentScreen('treatment-plan');
  };

  const handleViewExerciseDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentScreen('exercise-detail');
  };

  const handleBackToTreatmentPlan = () => setCurrentScreen('treatment-plan');

  // 🆕 Handler para ver plan desde historial
  const handleViewTreatmentPlanFromHistory = async (diagnosisId: string) => {
    try {
      console.log(`📥 Loading treatment plan and diagnosis for: ${diagnosisId}`);
      
      // 🔥 LIMPIAR ESTADOS PREVIOS
      setGeneratedTreatmentPlan(null);
      
      // 🔥 CARGAR DIAGNÓSTICO COMPLETO PRIMERO
      const diagnosisResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/${diagnosisId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!diagnosisResponse.ok) {
        const errorData = await diagnosisResponse.json();
        throw new Error(errorData.error || 'Error al cargar el diagnóstico');
      }

      const diagnosisData = await diagnosisResponse.json();
      console.log('✅ Diagnosis loaded:', diagnosisData);

      // 🔥 RESTAURAR EL ESTADO DEL DIAGNÓSTICO
      if (diagnosisData.diagnosis) {
        const diag = diagnosisData.diagnosis;
        
        // Reconstruir diagnosisResult y diagnosisMetadata
        const result: DiagnosisResult = {
          urgencyLevel: diag.urgency_level,
          urgencyTitle: diag.urgency_title,
          urgencyDescription: diag.urgency_description,
          urgencyTimeframe: diag.urgency_timeframe,
          summary: diag.summary,
          possibleDiagnoses: diag.possible_diagnoses || [],
          redFlags: diag.red_flags || [],
          recommendations: diag.recommendations || { immediate: [], lifestyle: [], monitoring: [] },
          nextSteps: diag.next_steps || []
        };

        const metadata: DiagnosisMetadata = {
          ragUsed: diag.rag_used || false,
          chunksFound: diag.chunks_found || 0,
          modelUsed: diag.model_used || 'gpt-4o-mini',
          timestamp: diag.created_at
        };

        // Restaurar patientData y symptoms
        const patientDataFromDiag: PatientData = diag.patient_data || {
          gender: null,
          ageRange: '',
          hasSymptoms: false,
          healthDescription: ''
        };

        const symptomsFromDiag: string[] = diag.symptoms || [];

        // 🔥 ACTUALIZAR TODOS LOS ESTADOS
        setDiagnosisResult(result);
        setDiagnosisMetadata(metadata);
        setPatientData(patientDataFromDiag);
        setSelectedSymptoms(symptomsFromDiag);
        setSavedDiagnosisId(diagnosisId);
      }

      // 🔥 AHORA CARGAR EL PLAN DE TRATAMIENTO
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/treatment/plan/${diagnosisId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          alert('XIGMA - No se encontró un plan de entrenamiento para este diagnóstico.');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar el plan');
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Treatment plan loaded:', data);
      
      // Cargar el plan en el estado
      setGeneratedTreatmentPlan(data.treatmentPlan);
      
      // Navegar al plan
      setCurrentScreen('treatment-plan');
      
    } catch (error) {
      console.error('❌ Error loading treatment plan from history:', error);
      alert(`XIGMA - Error al cargar el plan: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-50 w-full h-[100dvh]">
      <div className="w-full h-full md:flex md:justify-center md:px-6 lg:px-8">
        <div className="w-full h-full md:max-w-[1200px] md:bg-white md:rounded-2xl md:shadow-md md:overflow-hidden">
          {currentScreen === 'login' && (
            <LoginScreen onLogin={handleLogin} />
          )}
          
          {currentScreen === 'specialty-selection' && (
            <SpecialtySelection onSelectSpecialty={handleSpecialtySelect} />
          )}
          
          {currentScreen === 'specialty-home' && (
            <SpecialtyHome 
              specialty={selectedSpecialty}
              onBack={handleBackToSpecialties}
              onOpenChat={handleOpenChat}
              onOpenDiagnosis={handleOpenDiagnosis}
              onOpenProfile={handleOpenProfile}
            />
          )}
          
          {currentScreen === 'chat' && (
            <Suspense fallback={<LoadingFallback />}>
              <ClinicalChat 
                specialty={selectedSpecialty}
                onBack={handleBackFromChat}
              />
            </Suspense>
          )}
          
          {currentScreen === 'diagnosis-step1' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep1 
                specialty={selectedSpecialty}
                onBack={() => {
                  resetDiagnosisFlow(); // Limpiar cuando sale desde step1
                  setCurrentScreen('specialty-home');
                }}
                onContinue={handleContinueToStep2}
                initialData={patientData}
                onViewHistory={() => {
                  setShowHistoryTab(true); // 🆕 Activar flag para mostrar historial
                  setCurrentScreen('profile');
                }}
              />
            </Suspense>
          )}
          
          {currentScreen === 'diagnosis-step2' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2 
                specialty={selectedSpecialty}
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep2Urinary}
                initialSymptoms={selectedSymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-step2-urinary' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2Urinary 
                specialty={selectedSpecialty}
                gender={patientData.gender} // 🆕 Pasar género para filtrar síntomas
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep2Prolapse}
                initialSymptoms={selectedUrinarySymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-step2-prolapse' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2Prolapse 
                specialty={selectedSpecialty}
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep2Sexual}
                initialSymptoms={selectedProlapseSymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-step2-sexual' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2Sexual 
                specialty={selectedSpecialty}
                gender={patientData.gender} // 🆕 Pasar género para filtrar síntomas
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep2Male}
                initialSymptoms={selectedSexualSymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-step2-male' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2Male 
                specialty={selectedSpecialty}
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep2Trans}
                initialSymptoms={selectedMaleSymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-step2-trans' && (
            <Suspense fallback={<LoadingFallback />}>
              <DiagnosisStep2Trans 
                specialty={selectedSpecialty}
                onBack={navigateToPreviousStep}
                onContinue={handleContinueToStep3}
                initialSymptoms={selectedTransSymptoms}
              />
            </Suspense>
          )}

          {currentScreen === 'diagnosis-analysis' && (() => {
            // 🔥 COMBINAR TODOS LOS SÍNTOMAS DE LOS DIFERENTES PASOS
            const allSymptoms = [
              ...selectedSymptoms,
              ...selectedUrinarySymptoms,
              ...selectedProlapseSymptoms,
              ...selectedSexualSymptoms,
              ...selectedMaleSymptoms,
              ...selectedTransSymptoms
            ].filter(s => s); // Eliminar valores vacíos
            
            console.log('🔍 All combined symptoms for analysis:', allSymptoms);
            
            return (
              <Suspense fallback={<LoadingFallback />}>
                <DiagnosisAnalysis 
                  specialty={selectedSpecialty}
                  patientData={patientData}
                  symptoms={allSymptoms}
                  onBack={navigateToPreviousStep}
                  onComplete={handleAnalysisComplete}
                />
              </Suspense>
            );
          })()}
          
          {currentScreen === 'diagnosis-step3' && diagnosisResult && diagnosisMetadata && (() => {
            // 🔥 COMBINAR TODOS LOS SÍNTOMAS PARA MOSTRAR EN STEP3
            const allSymptoms = [
              ...selectedSymptoms,
              ...selectedUrinarySymptoms,
              ...selectedProlapseSymptoms,
              ...selectedSexualSymptoms,
              ...selectedMaleSymptoms,
              ...selectedTransSymptoms
            ].filter(s => s);
            
            return (
              <Suspense fallback={<LoadingFallback />}>
                <DiagnosisStep3 
                  specialty={selectedSpecialty}
                  patientData={patientData}
                  symptoms={allSymptoms}
                  diagnosisResult={diagnosisResult}
                  metadata={diagnosisMetadata}
                  onBack={navigateToPreviousStep}
                  onBackToHome={handleBackToHome}
                  onStartTreatmentPlan={handleStartTreatmentPlan}
                  onSaveDiagnosis={handleSaveDiagnosis}
                  onResetDiagnosisFlow={resetDiagnosisFlow}
                />
              </Suspense>
            );
          })()}
          
          {currentScreen === 'treatment-plan' && diagnosisResult && diagnosisMetadata && (() => {
            // 🔥 COMBINAR TODOS LOS SÍNTOMAS PARA PASAR AL PLAN
            const allSymptoms = [
              ...selectedSymptoms,
              ...selectedUrinarySymptoms,
              ...selectedProlapseSymptoms,
              ...selectedSexualSymptoms,
              ...selectedMaleSymptoms,
              ...selectedTransSymptoms
            ].filter(s => s);
            
            return (
              <Suspense fallback={<LoadingFallback />}>
                <AITreatmentPlan 
                  specialty={selectedSpecialty}
                  patientData={patientData}
                  diagnosisResult={diagnosisResult}
                  diagnosisMetadata={diagnosisMetadata}
                  symptoms={allSymptoms}
                  onBack={() => setCurrentScreen('diagnosis-step3')}
                  onBackToHome={handleBackToHome}
                  onViewExerciseDetail={handleViewExerciseDetail}
                  sessionToken={session?.access_token}
                  existingPlan={generatedTreatmentPlan}
                  onPlanGenerated={(plan) => setGeneratedTreatmentPlan(plan)}
                  diagnosisId={savedDiagnosisId}
                />
              </Suspense>
            );
          })()}
          
          {currentScreen === 'exercise-detail' && selectedExercise && (
            <Suspense fallback={<LoadingFallback />}>
              <ExerciseDetail 
                specialty={selectedSpecialty}
                exercise={selectedExercise}
                onBack={handleBackToTreatmentPlan}
                onComplete={handleBackToTreatmentPlan}
              />
            </Suspense>
          )}

          {currentScreen === 'profile' && (
            <Suspense fallback={<LoadingFallback />}>
              <ProfileScreen 
                specialty={selectedSpecialty}
                onBack={() => {
                  setShowHistoryTab(false);
                  handleBackFromProfile();
                }}
                onLogout={handleLogout}
                onOpenAdmin={handleOpenAdmin}
                initialTab={showHistoryTab ? 'history' : 'profile'}
                sessionToken={session?.access_token}
                onViewTreatmentPlan={handleViewTreatmentPlanFromHistory}
              />
            </Suspense>
          )}

          {currentScreen === 'admin' && (
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanel 
                onBack={handleBackFromAdmin}
                selectedSpecialty={selectedSpecialty}
                session={session}
              />
            </Suspense>
          )}
          {showSuccessModal && successModalData && selectedSpecialty && (
            <SuccessModal
              isOpen={showSuccessModal}
              title={successModalData.title}
              message={successModalData.message}
              details={successModalData.details}
              specialty={selectedSpecialty}
              onClose={() => setShowSuccessModal(false)}
              onViewProfile={() => {
                setShowSuccessModal(false);
                setShowHistoryTab(true); // 🆕 Activar flag para mostrar historial
                setCurrentScreen('profile');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
