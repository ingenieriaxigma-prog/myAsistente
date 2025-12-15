// Componente reutilizable para tarjetas de ejercicios

import { memo } from 'react';
import { Play, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Exercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onToggleComplete: (exerciseId: string) => void;
  onViewDetail: (exercise: Exercise) => void;
  accentColor?: string;
}

export const ExerciseCard = memo(function ExerciseCard({ 
  exercise, 
  onToggleComplete, 
  onViewDetail,
  accentColor = 'blue'
}: ExerciseCardProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    hard: 'bg-red-100 text-red-700 border-red-300',
  };

  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Moderado',
    hard: 'Avanzado',
  };

  return (
    <div 
      className={`bg-white border-2 rounded-2xl p-4 transition-all duration-200 ${
        exercise.completed 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icono del ejercicio */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
          exercise.completed ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {exercise.icon}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Título y botón de completado */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="text-sm text-gray-900 mb-1">{exercise.title}</h3>
              <p className="text-xs text-gray-600">{exercise.description}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(exercise.id);
              }}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                exercise.completed
                  ? 'bg-green-500 text-white'
                  : 'border-2 border-gray-300 hover:border-blue-500'
              }`}
            >
              {exercise.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Información adicional */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{exercise.duration}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full border text-xs ${difficultyColors[exercise.difficulty]}`}>
              {difficultyLabels[exercise.difficulty]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
              {exercise.category}
            </span>
          </div>

          {/* Frecuencia */}
          <div className="text-xs text-gray-600 mb-3">
            <strong>Frecuencia:</strong> {exercise.frequency}
          </div>

          {/* Botón de ver detalles */}
          <button
            onClick={() => onViewDetail(exercise)}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white rounded-xl py-2 text-sm hover:bg-blue-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            Ver instrucciones
          </button>

          {/* Indicador de racha si está completado */}
          {exercise.completed && exercise.completedDates.length > 0 && (
            <div className="mt-2 text-xs text-green-700 bg-green-100 rounded-lg px-3 py-1.5 text-center">
              ✓ Completado {exercise.completedDates.length} {exercise.completedDates.length === 1 ? 'vez' : 'veces'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});