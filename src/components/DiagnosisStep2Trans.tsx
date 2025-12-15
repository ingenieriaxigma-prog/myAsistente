import { useState } from 'react';
import type { Specialty } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { DiagnosisScreenLayout } from './common/DiagnosisScreenLayout';
import { SymptomSelector } from './common/SymptomSelector';
import { GradientButton } from './common/GradientButton';
import { transSymptoms } from '../config/symptoms';

interface DiagnosisStep2TransProps {
  specialty: Specialty;
  onBack: () => void;
  onContinue: (transSymptoms: string[]) => void;
  initialSymptoms: string[];
}

export function DiagnosisStep2Trans({ specialty, onBack, onContinue, initialSymptoms }: DiagnosisStep2TransProps) {
  const theme = useSpecialtyTheme(specialty);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);
  const [customSymptom, setCustomSymptom] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
      subtitle="Síntomas trans / LGBTQI+"
      stepInfo="Paso 7 de 8"
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
            Selecciona los síntomas relacionados con cirugía afirmativa, hormonoterapia u otros aspectos de salud trans/LGBTQI+.
            Este espacio es seguro y confidencial.
          </p>
        </div>

        <SymptomSelector
          symptoms={transSymptoms}
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
