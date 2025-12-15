import { ChevronLeft, User, Calendar, AlertCircle } from 'lucide-react';
import type { Specialty, PatientData } from '../types';
import { useState, useEffect } from 'react';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { DiagnosisScreenLayout } from './common/DiagnosisScreenLayout';
import { OptionButton } from './common/OptionButton';
import { GradientButton } from './common/GradientButton';
import { getProblemAreasForGender } from '../config/problemAreas';

interface DiagnosisStep1Props {
  specialty: Specialty;
  onBack: () => void;
  onContinue: (data: PatientData) => void;
  initialData: PatientData;
  onViewHistory?: () => void; // 🆕 Opcional: función para ver historial
}

export function DiagnosisStep1({ specialty, onBack, onContinue, initialData, onViewHistory }: DiagnosisStep1Props) {
  const theme = useSpecialtyTheme(specialty);
  
  const [gender, setGender] = useState<'male' | 'female' | 'trans' | null>(initialData.gender);
  const [ageRange, setAgeRange] = useState(initialData.ageRange);
  const [hasSymptoms, setHasSymptoms] = useState(initialData.hasSymptoms);
  const [healthDescription, setHealthDescription] = useState(initialData.healthDescription || '');
  const [medicalHistory, setMedicalHistory] = useState(initialData.medicalHistory || false);
  const [medications, setMedications] = useState(initialData.medications || false);
  const [problemAreas, setProblemAreas] = useState<string[]>(initialData.problemAreas || []);

  const ageRanges = [
    '18-30 años',
    '31-45 años',
    '46-60 años',
    '61-75 años',
    '76+ años',
  ];

  const toggleProblemArea = (areaId: string) => {
    setProblemAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const canContinue = gender && ageRange && problemAreas.length > 0;

  const handleContinue = () => {
    if (canContinue) {
      onContinue({ gender, ageRange, hasSymptoms, healthDescription, medicalHistory, medications, problemAreas });
    }
  };

  return (
    <DiagnosisScreenLayout
      gradient={theme.gradient}
      title="Diagnóstico Inteligente"
      subtitle="Paso 1: Información básica"
      stepInfo="Paso 1 de 5"
      onBack={onBack}
      onViewHistory={onViewHistory}
      footer={
        <GradientButton
          gradient={theme.gradient}
          onClick={handleContinue}
          disabled={!canContinue}
          fullWidth
          size="lg"
        >
          Continuar
        </GradientButton>
      }
    >
      {/* Contenido */}
      <div className="bg-white rounded-t-3xl p-6 pb-4 overflow-y-auto">
        <div className={`${theme.bgLight} border-l-4 ${theme.borderColor} rounded-r-xl p-4 mb-6`}>
          <p className="text-sm text-gray-700 leading-relaxed">
            Para brindarte una evaluación precisa, necesitamos algunos datos básicos. Toda la información es confidencial.
          </p>
        </div>

        {/* Género */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-700 mb-3">
            <User className={`w-5 h-5 ${theme.textColor}`} />
            <span>Género</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              onClick={() => setGender('male')}
              selected={gender === 'male'}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  <span role="img" aria-label="masculino">👨</span>
                </div>
                <p className="text-sm">Masculino</p>
              </div>
            </OptionButton>
            <OptionButton
              onClick={() => setGender('female')}
              selected={gender === 'female'}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  <span role="img" aria-label="femenino">👩</span>
                </div>
                <p className="text-sm">Femenino</p>
              </div>
            </OptionButton>
            <OptionButton
              onClick={() => setGender('trans')}
              selected={gender === 'trans'}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  <span role="img" aria-label="transgénero">⚧️</span>
                </div>
                <p className="text-sm">Transgénero</p>
              </div>
            </OptionButton>
          </div>
        </div>

        {/* Rango de edad */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-700 mb-3">
            <Calendar className={`w-5 h-5 ${theme.textColor}`} />
            <span>Rango de edad</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ageRanges.map((range) => (
              <button
                key={range}
                onClick={() => setAgeRange(range)}
                className={`p-3 rounded-xl border-2 transition-all text-sm ${
                  ageRange === range
                    ? `${theme.borderColor} ${theme.bgLight}`
                    : `border-gray-200 bg-white ${theme.hoverBorder}`
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Áreas problemáticas */}
        {gender && (
          <div className="mb-6">
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <AlertCircle className={`w-5 h-5 ${theme.textColor}`} />
              <span>¿Qué tipo de síntomas presentas?</span>
              <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Selecciona las áreas donde experimentas molestias. Solo verás las preguntas relevantes para ti.
            </p>
            <div className="space-y-2">
              {getProblemAreasForGender(gender).map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleProblemArea(area.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    problemAreas.includes(area.id)
                      ? `${theme.borderColor} ${theme.bgLight}`
                      : `border-gray-200 bg-white ${theme.hoverBorder}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      problemAreas.includes(area.id) ? `${theme.borderColor} bg-gradient-to-r ${theme.gradient}` : 'border-gray-300'
                    }`}>
                      {problemAreas.includes(area.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{area.icon}</span>
                        <span className="text-sm">{area.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{area.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preguntas adicionales */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-gray-700 mb-2">
            <AlertCircle className={`w-5 h-5 ${theme.textColor}`} />
            <span>Información adicional</span>
          </label>
          
          <button
            onClick={() => setHasSymptoms(!hasSymptoms)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              hasSymptoms
                ? `${theme.borderColor} ${theme.bgLight}`
                : `border-gray-200 bg-white ${theme.hoverBorder}`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">¿Experimentas síntomas actualmente?</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                hasSymptoms ? `${theme.borderColor} bg-gradient-to-r ${theme.gradient}` : 'border-gray-300'
              }`}>
                {hasSymptoms && <span className="text-white text-sm">✓</span>}
              </div>
            </div>
          </button>

          <button
            onClick={() => setMedicalHistory(!medicalHistory)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              medicalHistory
                ? `${theme.borderColor} ${theme.bgLight}`
                : `border-gray-200 bg-white ${theme.hoverBorder}`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">¿Tienes antecedentes médicos relevantes?</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                medicalHistory ? `${theme.borderColor} bg-gradient-to-r ${theme.gradient}` : 'border-gray-300'
              }`}>
                {medicalHistory && <span className="text-white text-sm">✓</span>}
              </div>
            </div>
          </button>

          <button
            onClick={() => setMedications(!medications)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              medications
                ? `${theme.borderColor} ${theme.bgLight}`
                : `border-gray-200 bg-white ${theme.hoverBorder}`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">¿Tomas medicamentos regularmente?</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                medications ? `${theme.borderColor} bg-gradient-to-r ${theme.gradient}` : 'border-gray-300'
              }`}>
                {medications && <span className="text-white text-sm">✓</span>}
              </div>
            </div>
          </button>

          {/* Campo de descripción del estado de salud */}
          <div className="mt-4 mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              Describe tu estado actual y la razón principal para realizar este diagnóstico
            </label>
            <textarea
              value={healthDescription}
              onChange={(e) => setHealthDescription(e.target.value)}
              placeholder="Ejemplo: Actualmente presento dolor abdominal intenso y dificultad para evacuar. También tengo un poco de dolor de cabeza desde hace dos días. El dolor abdominal empeora después de las comidas..."
              className={`w-full p-4 rounded-xl border-2 ${theme.hoverBorder} focus:outline-none focus:ring-2 focus:ring-offset-0 ${theme.borderColor.replace('border-', 'focus:ring-')} transition-all text-sm resize-none`}
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-2">
              Esta información será analizada junto con tus respuestas para brindarte un diagnóstico más preciso.
            </p>
          </div>
        </div>
      </div>
    </DiagnosisScreenLayout>
  );
}