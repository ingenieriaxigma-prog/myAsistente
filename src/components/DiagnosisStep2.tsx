import { useState } from 'react';
import type { Specialty } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { DiagnosisScreenLayout } from './common/DiagnosisScreenLayout';
import { SymptomSelector } from './common/SymptomSelector';
import { GradientButton } from './common/GradientButton';
import { colorectalSymptoms } from '../config/symptoms';

interface DiagnosisStep2Props {
  specialty: Specialty;
  onBack: () => void;
  onContinue: (symptoms: string[]) => void;
  initialSymptoms: string[];
}

export function DiagnosisStep2({ specialty, onBack, onContinue, initialSymptoms }: DiagnosisStep2Props) {
  const theme = useSpecialtyTheme(specialty);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);
  const [customSymptom, setCustomSymptom] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    // Si selecciona "ninguno", deselecciona todos los demás
    if (symptomId === 'ninguno') {
      setSelectedSymptoms(['ninguno']);
      setShowCustomInput(false);
      setCustomSymptom('');
      return;
    }
    
    // Si selecciona cualquier otro, quita "ninguno"
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
      // Si está ocultando el input, quitar "otro" de la selección
      setSelectedSymptoms(prev => prev.filter(id => !id.startsWith('otro:')));
      setCustomSymptom('');
    }
  };

  const handleCustomSymptomChange = (value: string) => {
    setCustomSymptom(value);
    
    // Remover "ninguno" si está seleccionado
    setSelectedSymptoms(prev => {
      const withoutNone = prev.filter(id => id !== 'ninguno');
      const withoutOther = withoutNone.filter(id => !id.startsWith('otro:'));
      
      if (value.trim()) {
        return [...withoutOther, `otro:${value}`];
      }
      return withoutOther;
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
      subtitle="Paso 2 de 8: Síntomas colorectales"
      stepInfo="Paso 2 de 8"
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
            Selecciona todos los síntomas que hayas experimentado recientemente.
            Esto nos ayudará a ofrecerte una evaluación más precisa.
          </p>
        </div>

        <SymptomSelector
          symptoms={colorectalSymptoms}
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
