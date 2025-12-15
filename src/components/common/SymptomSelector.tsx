// Componente reutilizable para selección de síntomas

import { useState } from 'react';

export interface Symptom {
  id: string;
  label: string;
  description?: string;
}

interface SymptomSelectorProps {
  symptoms: Symptom[];
  selectedSymptoms: string[];
  onToggleSymptom: (symptomId: string) => void;
  allowCustom?: boolean;
  customSymptom?: string;
  onCustomSymptomChange?: (value: string) => void;
  showCustomInput?: boolean;
  onToggleCustomInput?: () => void;
}

export function SymptomSelector({
  symptoms,
  selectedSymptoms,
  onToggleSymptom,
  allowCustom = false,
  customSymptom = '',
  onCustomSymptomChange,
  showCustomInput = false,
  onToggleCustomInput,
}: SymptomSelectorProps) {
  return (
    <div className="space-y-3">
      {symptoms.map((symptom) => {
        const isSelected = selectedSymptoms.includes(symptom.id);
        
        return (
          <button
            key={symptom.id}
            onClick={() => onToggleSymptom(symptom.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              isSelected
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                  isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm mb-0.5 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {symptom.label}
                </p>
                {symptom.description && (
                  <p className="text-xs text-gray-500">{symptom.description}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Opción "Otro" con input personalizado */}
      {allowCustom && (
        <div className="space-y-2">
          <button
            onClick={onToggleCustomInput}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              showCustomInput
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                  showCustomInput
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {showCustomInput && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${showCustomInput ? 'text-blue-900' : 'text-gray-800'}`}>
                  Otro síntoma
                </p>
                <p className="text-xs text-gray-500">Describe tu síntoma</p>
              </div>
            </div>
          </button>

          {showCustomInput && onCustomSymptomChange && (
            <textarea
              value={customSymptom}
              onChange={(e) => onCustomSymptomChange(e.target.value)}
              placeholder="Describe tu síntoma aquí..."
              className="w-full p-3 rounded-xl border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows={3}
            />
          )}
        </div>
      )}

      {/* Opción "Ninguno" */}
      <button
        onClick={() => onToggleSymptom('ninguno')}
        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
          selectedSymptoms.includes('ninguno')
            ? 'bg-gray-100 border-gray-400'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
              selectedSymptoms.includes('ninguno')
                ? 'bg-gray-500 border-gray-500'
                : 'border-gray-300'
            }`}
          >
            {selectedSymptoms.includes('ninguno') && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${selectedSymptoms.includes('ninguno') ? 'text-gray-700' : 'text-gray-600'}`}>
              Ninguno de estos síntomas
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
