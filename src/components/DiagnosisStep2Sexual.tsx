import { useState } from 'react';
import type { Specialty, Gender } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { DiagnosisScreenLayout } from './common/DiagnosisScreenLayout';
import { SymptomSelector } from './common/SymptomSelector';
import { GradientButton } from './common/GradientButton';
import { getSexualSymptomsByGender } from '../config/symptoms';

interface DiagnosisStep2SexualProps {
  specialty: Specialty;
  gender: Gender; // 🆕 Recibir género para filtrar síntomas
  onBack: () => void;
  onContinue: (sexualSymptoms: string[]) => void;
  initialSymptoms: string[];
}

export function DiagnosisStep2Sexual({ specialty, gender, onBack, onContinue, initialSymptoms }: DiagnosisStep2SexualProps) {
  const theme = useSpecialtyTheme(specialty);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);
  const [customSymptom, setCustomSymptom] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 🆕 Obtener síntomas filtrados según el género
  const sexualSymptoms = getSexualSymptomsByGender(gender);

  const toggleSymptom = (symptomId: string) => {
    if (symptomId === 'ninguno') {
      setSelectedSymptoms(['ninguno']);
      setShowCustomInput(false);
      setCustomSymptom('');
      return;
    }
    
    setSelectedSymptoms(prev => {
      const withoutNone = prev.filter(id => id !== 'ninguno');
      return withoutNone.includes(symptomId)
        ? withoutNone.filter(id => id !== symptomId)
        : [...withoutNone, symptomId];
    });
  };

  const handleToggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
    if (showCustomInput) {
      setSelectedSymptoms(prev => prev.filter(id => !id.startsWith('otro:')));
      setCustomSymptom('');
    }
  };

  const handleCustomSymptomChange = (value: string) => {
    setCustomSymptom(value);
    setSelectedSymptoms(prev => {
      const withoutNone = prev.filter(id => id !== 'ninguno');
      const withoutOther = withoutNone.filter(id => !id.startsWith('otro:'));
      return value.trim() ? [...withoutOther, `otro:${value}`] : withoutOther;
    });
  };

  const handleContinue = () => {
    if (selectedSymptoms.length > 0) {
      onContinue(selectedSymptoms);
    }
  };

  return (
    <DiagnosisScreenLayout
      gradient={theme.gradient}
      title="Evaluación de síntomas"
      subtitle="Síntomas de disfunción sexual"
      stepInfo="Paso 5 de 8"
      onBack={onBack}
      footer={
        <GradientButton
          gradient={theme.gradient}
          onClick={handleContinue}
          disabled={selectedSymptoms.length === 0}
          fullWidth
          size="lg"
        >
          Continuar
        </GradientButton>
      }
    >
      <div className="p-6 pb-8">
        <div className={`${theme.lightBg} rounded-2xl p-4 mb-6`}>
          <p className="text-sm text-gray-700">
            Selecciona los síntomas relacionados con salud sexual que hayas experimentado.
            Tu privacidad es importante para nosotros.
          </p>
        </div>

        <SymptomSelector
          symptoms={sexualSymptoms}
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={toggleSymptom}
          allowCustom
          customSymptom={customSymptom}
          onCustomSymptomChange={handleCustomSymptomChange}
          showCustomInput={showCustomInput}
          onToggleCustomInput={handleToggleCustomInput}
        />
      </div>
    </DiagnosisScreenLayout>
  );
}