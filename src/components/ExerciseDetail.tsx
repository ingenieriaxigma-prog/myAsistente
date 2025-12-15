import { CheckCircle2, Clock, Target, AlertCircle, Award, Check } from 'lucide-react';
import { useState } from 'react';
import type { Specialty, Exercise } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { BackButton } from './common/BackButton';
import { GradientButton } from './common/GradientButton';

interface ExerciseDetailProps {
  specialty: Specialty;
  exercise: Exercise;
  onBack: () => void;
  onComplete: () => void;
}

export function ExerciseDetail({ specialty, exercise, onBack, onComplete }: ExerciseDetailProps) {
  const theme = useSpecialtyTheme(specialty);
  const [isCompleted, setIsCompleted] = useState(exercise.completed);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const difficultyConfig = {
    easy: { label: 'Fácil', color: 'text-green-600 bg-green-50 border-green-200' },
    medium: { label: 'Moderado', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    hard: { label: 'Avanzado', color: 'text-red-600 bg-red-50 border-red-200' },
  };

  const difficulty = difficultyConfig[exercise.difficulty];

  const toggleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const handleCompleteExercise = () => {
    setIsCompleted(true);
    onComplete();
  };

  const allStepsCompleted = completedSteps.length === exercise.instructions.length;

  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-4 text-white flex-shrink-0`}>
        <BackButton onClick={onBack} variant="light" className="mb-3" />
        
        <div className="flex items-start gap-3 mb-3">
          {/* Icono del ejercicio */}
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {exercise.icon}
          </div>
          
          {/* Info del ejercicio */}
          <div className="flex-1">
            <h1 className="text-xl mb-1">{exercise.title}</h1>
            <p className="text-white/90 text-sm mb-2">{exercise.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-lg bg-white/20 text-xs backdrop-blur-sm`}>
                {exercise.category}
              </span>
              <span className={`px-2 py-1 rounded-lg bg-white/20 text-xs backdrop-blur-sm`}>
                {difficulty.label}
              </span>
              <span className={`px-2 py-1 rounded-lg bg-white/20 text-xs backdrop-blur-sm flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                {exercise.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de completado */}
        {isCompleted && (
          <div className="bg-green-500 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">¡Ejercicio completado!</span>
          </div>
        )}
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Información clave */}
        <div className="grid grid-cols-2 gap-3">
          {exercise.repetitions && (
            <div className={`${theme.lightBg} rounded-xl p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <Target className={`w-4 h-4 ${theme.textPrimary}`} />
                <span className="text-xs text-gray-600">Repeticiones</span>
              </div>
              <p className="text-sm text-gray-900">{exercise.repetitions}</p>
            </div>
          )}
          <div className={`${theme.lightBg} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`w-4 h-4 ${theme.textPrimary}`} />
              <span className="text-xs text-gray-600">Frecuencia</span>
            </div>
            <p className="text-sm text-gray-900">{exercise.frequency}</p>
          </div>
        </div>

        {/* Instrucciones paso a paso */}
        <div>
          <h2 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            📋 Instrucciones
          </h2>
          <div className="space-y-2">
            {exercise.instructions.map((instruction, index) => {
              const isStepCompleted = completedSteps.includes(index);
              
              return (
                <button
                  key={index}
                  onClick={() => toggleStepComplete(index)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    isStepCompleted 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      isStepCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {isStepCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      )}
                    </div>
                    <p className={`flex-1 text-sm ${
                      isStepCompleted ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {instruction}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Beneficios */}
        <div>
          <h2 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
            ✨ Beneficios
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <ul className="space-y-2">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                  <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Precauciones */}
        {exercise.precautions && exercise.precautions.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
              ⚠️ Precauciones
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <ul className="space-y-2">
                {exercise.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-900">
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Progreso de pasos */}
        {completedSteps.length > 0 && (
          <div className={`${theme.lightBg} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Progreso de pasos</span>
              <span className="text-sm text-gray-900">
                {completedSteps.length} de {exercise.instructions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
                style={{ width: `${(completedSteps.length / exercise.instructions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón de completar */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        {isCompleted ? (
          <GradientButton
            gradient={theme.gradient}
            onClick={onBack}
            fullWidth
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Volver al plan
          </GradientButton>
        ) : (
          <GradientButton
            gradient={theme.gradient}
            onClick={handleCompleteExercise}
            disabled={!allStepsCompleted}
            fullWidth
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {allStepsCompleted ? 'Marcar como completado' : 'Completa todos los pasos'}
          </GradientButton>
        )}
      </div>
    </ScreenContainer>
  );
}
