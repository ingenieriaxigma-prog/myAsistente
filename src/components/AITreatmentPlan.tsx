import { useState, useEffect } from 'react';
import { Home, Calendar, TrendingUp, Award, Target, Flame, BarChart3, Loader2, ChevronDown, ChevronUp, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import type { Specialty, PatientData, Exercise, UrgencyLevel, DiagnosisResult, DiagnosisMetadata } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { BackButton } from './common/BackButton';
import { GradientButton } from './common/GradientButton';
import { ExerciseCard } from './common/ExerciseCard';
import { Progress } from './ui/progress';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AIGeneratedPlan {
  planOverview: {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    goals: string[];
  };
  exercises: Exercise[];
  lifestyleChanges: Array<{
    category: string;
    title: string;
    description: string;
    icon: string;
  }>;
  monitoring: {
    trackSymptoms: string[];
    warningSignsForDoctor: string[];
    expectedMilestones: Array<{
      week: number;
      milestone: string;
    }>;
  };
  motivationalMessage: string;
  generatedAt: string;
}

interface AITreatmentPlanProps {
  specialty: Specialty;
  patientData: PatientData;
  diagnosisResult: DiagnosisResult;
  diagnosisMetadata: DiagnosisMetadata;
  symptoms: string[];
  onBack: () => void;
  onBackToHome: () => void;
  onViewExerciseDetail: (exercise: Exercise) => void;
  sessionToken?: string;
  existingPlan?: AIGeneratedPlan | null; // 🆕 Plan ya generado (para no regenerar)
  onPlanGenerated?: (plan: AIGeneratedPlan) => void; // 🆕 Callback cuando se genera un plan nuevo
  diagnosisId?: string | null; // 🆕 ID del diagnóstico guardado (para asociar el plan)
}

export function AITreatmentPlan({ 
  specialty, 
  patientData, 
  diagnosisResult,
  diagnosisMetadata,
  symptoms,
  onBack, 
  onBackToHome, 
  onViewExerciseDetail,
  sessionToken,
  existingPlan,
  onPlanGenerated,
  diagnosisId
}: AITreatmentPlanProps) {
  const theme = useSpecialtyTheme(specialty);

  // Estados para el plan de IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<AIGeneratedPlan | null>(null);
  
  // Estados para ejercicios y progreso
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weekProgress, setWeekProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  // Estados para expansión de secciones
  const [expandedSections, setExpandedSections] = useState({
    lifestyle: false,
    monitoring: false,
    milestones: false
  });

  // Generar plan con IA al montar el componente
  useEffect(() => {
    if (existingPlan) {
      setAiPlan(existingPlan);
      setExercises(existingPlan.exercises || []);
      
      // Calculate initial stats
      const completed = existingPlan.exercises.filter((ex: Exercise) => ex.completed).length;
      const total = existingPlan.exercises.length;
      setWeekProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
    } else {
      generateAIPlan();
    }
  }, []);

  const generateAIPlan = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      console.log('🤖 Requesting AI treatment plan generation...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/treatment/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            specialty,
            patientData,
            diagnosisResult,
            symptoms,
            metadata: diagnosisMetadata,
            diagnosisId // 🆕 Pasar diagnosisId para auto-guardar el plan
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate plan');
      }

      const data = await response.json();
      console.log('✅ AI plan generated:', data);
      
      setAiPlan(data.treatmentPlan);
      setExercises(data.treatmentPlan.exercises || []);
      
      // Calculate initial stats
      const completed = data.treatmentPlan.exercises.filter((ex: Exercise) => ex.completed).length;
      const total = data.treatmentPlan.exercises.length;
      setWeekProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
      
      // Callback para notificar que el plan se generó
      if (onPlanGenerated) {
        onPlanGenerated(data.treatmentPlan);
      }
      
    } catch (error) {
      console.error('❌ Error generating AI plan:', error);
      setGenerationError(error.message || 'Error al generar el plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleExerciseComplete = (exerciseId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setExercises(prevExercises => {
      const updated = prevExercises.map(ex => {
        if (ex.id === exerciseId) {
          const isCompleting = !ex.completed;
          const newCompletedDates = isCompleting 
            ? [...ex.completedDates, today]
            : ex.completedDates.filter(date => date !== today);
          
          return {
            ...ex,
            completed: isCompleting,
            completedDates: newCompletedDates,
          };
        }
        return ex;
      });

      // Recalcular progreso
      const completed = updated.filter(ex => ex.completed).length;
      const total = updated.length;
      setWeekProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
      
      // Calcular racha (simplificado)
      const completedCount = updated.filter(ex => ex.completed).length;
      setStreak(Math.min(completedCount, 7));
      
      // Calcular minutos totales
      const minutes = updated
        .filter(ex => ex.completed)
        .reduce((sum, ex) => sum + parseInt(ex.duration) || 0, 0);
      setTotalMinutes(minutes);
      
      return updated;
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const completedToday = exercises.filter(ex => ex.completed).length;
  const totalExercises = exercises.length;

  // Loading state
  if (isGenerating) {
    return (
      <ScreenContainer>
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-4 text-white flex-shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <BackButton onClick={onBack} variant="light" />
            <button 
              onClick={onBackToHome}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>
          <h1 className="text-2xl mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Generando tu plan
          </h1>
          <p className="text-white/90 text-sm">IA médica trabajando...</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} rounded-full opacity-20 animate-ping`}></div>
              <div className={`relative w-24 h-24 bg-gradient-to-r ${theme.gradient} rounded-full flex items-center justify-center`}>
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Creando tu plan personalizado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nuestra IA está analizando tu diagnóstico y creando ejercicios específicos para ti...
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // Error state
  if (generationError) {
    return (
      <ScreenContainer>
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-4 text-white flex-shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <BackButton onClick={onBack} variant="light" />
            <button 
              onClick={onBackToHome}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>
          <h1 className="text-2xl mb-1">Error al generar plan</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-lg text-gray-900 mb-2">No pudimos generar el plan</h3>
            <p className="text-sm text-gray-600 mb-6">{generationError}</p>
            <GradientButton
              gradient={theme.gradient}
              onClick={generateAIPlan}
              fullWidth
            >
              Reintentar
            </GradientButton>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // No plan yet
  if (!aiPlan) {
    return null;
  }

  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-4 text-white flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <BackButton onClick={onBack} variant="light" />
          <button 
            onClick={onBackToHome}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-2xl">{aiPlan.planOverview.title}</h1>
        </div>
        <p className="text-white/90 text-sm mb-2">{aiPlan.planOverview.description}</p>
        <div className="flex items-center gap-3 text-white/80 text-xs">
          <span>📅 {aiPlan.planOverview.duration}</span>
          <span>•</span>
          <span>💪 {aiPlan.planOverview.difficulty}</span>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats y progreso */}
        <div className={`${theme.lightBg} p-4 border-b border-gray-200`}>
          {/* Progreso semanal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Progreso de hoy</span>
              <span className="text-sm text-gray-900">
                {completedToday} de {totalExercises} ejercicios
              </span>
            </div>
            <Progress value={weekProgress} className="h-2" />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xl text-gray-900">{streak}</p>
              <p className="text-xs text-gray-500">Racha</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xl text-gray-900">{weekProgress}%</p>
              <p className="text-xs text-gray-500">Completado</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xl text-gray-900">{totalMinutes}</p>
              <p className="text-xs text-gray-500">Minutos</p>
            </div>
          </div>
        </div>

        {/* Mensaje motivacional personalizado por IA */}
        <div className="p-4 border-b border-gray-200">
          <div className={`${theme.lightBg} rounded-xl p-4 flex items-start gap-3 shadow-sm`}>
            <div className={`w-10 h-10 bg-gradient-to-r ${theme.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900 mb-1">Mensaje para ti</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {aiPlan.motivationalMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Objetivos del plan */}
        {aiPlan.planOverview.goals && aiPlan.planOverview.goals.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
              🎯 Objetivos del plan
            </h3>
            <div className="space-y-2">
              {aiPlan.planOverview.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className={`w-4 h-4 ${theme.textPrimary} flex-shrink-0 mt-0.5`} />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de ejercicios */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-gray-700">
              Tus ejercicios ({exercises.length})
            </h2>
            {diagnosisResult.urgencyLevel === 'urgent' && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                Plan suave
              </span>
            )}
          </div>

          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggleComplete={toggleExerciseComplete}
                onViewDetail={onViewExerciseDetail}
              />
            ))}
          </div>
        </div>

        {/* Cambios en estilo de vida */}
        {aiPlan.lifestyleChanges && aiPlan.lifestyleChanges.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('lifestyle')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm text-gray-700 flex items-center gap-2">
                🌟 Cambios en estilo de vida
              </h3>
              {expandedSections.lifestyle ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.lifestyle && (
              <div className="space-y-3">
                {aiPlan.lifestyleChanges.map((change, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{change.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900 mb-1">{change.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {change.description}
                        </p>
                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                          {change.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monitoreo */}
        {aiPlan.monitoring && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('monitoring')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm text-gray-700 flex items-center gap-2">
                📊 Monitoreo y seguimiento
              </h3>
              {expandedSections.monitoring ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.monitoring && (
              <div className="space-y-4">
                {aiPlan.monitoring.trackSymptoms && aiPlan.monitoring.trackSymptoms.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-500 mb-2">Síntomas a monitorear:</h4>
                    <ul className="space-y-1">
                      {aiPlan.monitoring.trackSymptoms.map((symptom, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiPlan.monitoring.warningSignsForDoctor && aiPlan.monitoring.warningSignsForDoctor.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-500 mb-2">Señales de alerta (consulta médico):</h4>
                    <ul className="space-y-1">
                      {aiPlan.monitoring.warningSignsForDoctor.map((sign, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-500">⚠️</span>
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hitos esperados */}
        {aiPlan.monitoring?.expectedMilestones && aiPlan.monitoring.expectedMilestones.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('milestones')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm text-gray-700 flex items-center gap-2">
                🎯 Hitos de progreso
              </h3>
              {expandedSections.milestones ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.milestones && (
              <div className="space-y-2">
                {aiPlan.monitoring.expectedMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                      S{milestone.week}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{milestone.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generado por IA badge */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Plan generado por IA médica • {new Date(aiPlan.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Footer con botones de acción */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <GradientButton
          gradient={theme.gradient}
          onClick={() => alert('XIGMA: Función de programar recordatorio próximamente')}
          fullWidth
          size="lg"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Programar recordatorios
        </GradientButton>
      </div>
    </ScreenContainer>
  );
}