import { useState, useEffect } from 'react';
import { Home, Calendar, TrendingUp, Award, Target, Flame, BarChart3 } from 'lucide-react';
import type { Specialty, PatientData, Exercise, UrgencyLevel } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { BackButton } from './common/BackButton';
import { GradientButton } from './common/GradientButton';
import { ExerciseCard } from './common/ExerciseCard';
import { Progress } from './ui/progress';
import { generateExercisePlan, calculateWeekProgress } from '../config/exercises';

interface TreatmentPlanProps {
  specialty: Specialty;
  patientData: PatientData;
  urgencyLevel: UrgencyLevel;
  onBack: () => void;
  onBackToHome: () => void;
  onViewExerciseDetail: (exercise: Exercise) => void;
}

export function TreatmentPlan({ 
  specialty, 
  patientData, 
  urgencyLevel, 
  onBack, 
  onBackToHome, 
  onViewExerciseDetail 
}: TreatmentPlanProps) {
  const theme = useSpecialtyTheme(specialty);

  // Estado para ejercicios y progreso
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weekProgress, setWeekProgress] = useState(0);
  const [streak, setStreak] = useState(3); // Días consecutivos
  const [totalMinutes, setTotalMinutes] = useState(45);

  // Generar plan de ejercicios personalizado
  useEffect(() => {
    const generatedExercises = generateExercisePlan(
      specialty, 
      patientData.problemAreas || [], 
      urgencyLevel
    );
    setExercises(generatedExercises);
    setWeekProgress(calculateWeekProgress(generatedExercises));
  }, [specialty, patientData, urgencyLevel]);

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
      setWeekProgress(calculateWeekProgress(updated));
      
      return updated;
    });
  };

  const completedToday = exercises.filter(ex => ex.completed).length;
  const totalExercises = exercises.length;

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
        <h1 className="text-2xl mb-1">Plan de Tratamiento</h1>
        <p className="text-white/90 text-sm">Personalizado para tus necesidades</p>
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
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xl text-gray-900">{streak}</p>
              <p className="text-xs text-gray-500">Racha (días)</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xl text-gray-900">{weekProgress}%</p>
              <p className="text-xs text-gray-500">Esta semana</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xl text-gray-900">{totalMinutes}</p>
              <p className="text-xs text-gray-500">Min totales</p>
            </div>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <div className="p-4 border-b border-gray-200">
          <div className={`${theme.lightBg} rounded-xl p-4 flex items-start gap-3`}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Target className={`w-5 h-5 ${theme.textPrimary}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-gray-900 mb-1">¡Sigue así!</h3>
              <p className="text-xs text-gray-600">
                {weekProgress >= 70 
                  ? 'Excelente progreso esta semana. La constancia es clave para resultados duraderos.'
                  : weekProgress >= 40
                  ? 'Vas por buen camino. Intenta completar al menos 4-5 ejercicios por semana.'
                  : 'Cada pequeño paso cuenta. Comienza con ejercicios fáciles y aumenta gradualmente.'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de ejercicios */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-gray-700">
              Tus ejercicios ({exercises.length})
            </h2>
            {urgencyLevel === 'urgent' && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                Plan suave - Consulta médica prioritaria
              </span>
            )}
          </div>

          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onToggleComplete={toggleExerciseComplete}
              onViewDetail={onViewExerciseDetail}
            />
          ))}

          {exercises.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No hay ejercicios disponibles</p>
              <p className="text-xs mt-1">Consulta con tu especialista</p>
            </div>
          )}
        </div>

        {/* Consejos adicionales */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            💡 Consejos para mejores resultados
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Realiza los ejercicios en un ambiente tranquilo y cómodo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Mantén una respiración natural y relajada durante los ejercicios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>La constancia es más importante que la intensidad</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Si sientes dolor, detente y consulta con tu especialista</span>
            </li>
          </ul>
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