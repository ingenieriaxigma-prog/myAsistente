// Context API para estado global de la aplicación

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { Screen, Specialty, PatientData, UrgencyLevel, Exercise } from '../types';

interface AppContextType {
  // Estado de navegación
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  
  // Estado de especialidad
  selectedSpecialty: Specialty;
  setSelectedSpecialty: (specialty: Specialty) => void;
  
  // Estado del paciente
  patientData: PatientData;
  setPatientData: (data: PatientData) => void;
  updatePatientData: (data: Partial<PatientData>) => void;
  
  // Estado de síntomas
  selectedSymptoms: string[];
  setSelectedSymptoms: (symptoms: string[]) => void;
  selectedUrinarySymptoms: string[];
  setSelectedUrinarySymptoms: (symptoms: string[]) => void;
  selectedProlapseSymptoms: string[];
  setSelectedProlapseSymptoms: (symptoms: string[]) => void;
  selectedSexualSymptoms: string[];
  setSelectedSexualSymptoms: (symptoms: string[]) => void;
  selectedMaleSymptoms: string[];
  setSelectedMaleSymptoms: (symptoms: string[]) => void;
  selectedTransSymptoms: string[];
  setSelectedTransSymptoms: (symptoms: string[]) => void;
  
  // Estado de tratamiento
  selectedExercise: Exercise | null;
  setSelectedExercise: (exercise: Exercise | null) => void;
  urgencyLevel: UrgencyLevel;
  setUrgencyLevel: (level: UrgencyLevel) => void;
  
  // Funciones de utilidad
  resetAppState: () => void;
  resetDiagnosisData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Estado de navegación
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  
  // Estado de especialidad
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>(null);
  
  // Estado del paciente
  const [patientData, setPatientData] = useState<PatientData>({
    gender: null,
    ageRange: '',
    hasSymptoms: false,
    healthDescription: '',
  });
  
  // Estado de síntomas
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedUrinarySymptoms, setSelectedUrinarySymptoms] = useState<string[]>([]);
  const [selectedProlapseSymptoms, setSelectedProlapseSymptoms] = useState<string[]>([]);
  const [selectedSexualSymptoms, setSelectedSexualSymptoms] = useState<string[]>([]);
  const [selectedMaleSymptoms, setSelectedMaleSymptoms] = useState<string[]>([]);
  const [selectedTransSymptoms, setSelectedTransSymptoms] = useState<string[]>([]);
  
  // Estado de tratamiento
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('mild');

  // Función para actualizar parcialmente los datos del paciente
  const updatePatientData = useCallback((data: Partial<PatientData>) => {
    setPatientData(prev => ({ ...prev, ...data }));
  }, []);

  // Función para resetear el estado completo de la app
  const resetAppState = useCallback(() => {
    setCurrentScreen('login');
    setSelectedSpecialty(null);
    setPatientData({
      gender: null,
      ageRange: '',
      hasSymptoms: false,
      healthDescription: '',
    });
    setSelectedSymptoms([]);
    setSelectedUrinarySymptoms([]);
    setSelectedProlapseSymptoms([]);
    setSelectedSexualSymptoms([]);
    setSelectedMaleSymptoms([]);
    setSelectedTransSymptoms([]);
    setSelectedExercise(null);
    setUrgencyLevel('mild');
  }, []);

  // Función para resetear solo los datos de diagnóstico
  const resetDiagnosisData = useCallback(() => {
    setPatientData({
      gender: null,
      ageRange: '',
      hasSymptoms: false,
      healthDescription: '',
    });
    setSelectedSymptoms([]);
    setSelectedUrinarySymptoms([]);
    setSelectedProlapseSymptoms([]);
    setSelectedSexualSymptoms([]);
    setSelectedMaleSymptoms([]);
    setSelectedTransSymptoms([]);
    setUrgencyLevel('mild');
  }, []);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    currentScreen,
    setCurrentScreen,
    selectedSpecialty,
    setSelectedSpecialty,
    patientData,
    setPatientData,
    updatePatientData,
    selectedSymptoms,
    setSelectedSymptoms,
    selectedUrinarySymptoms,
    setSelectedUrinarySymptoms,
    selectedProlapseSymptoms,
    setSelectedProlapseSymptoms,
    selectedSexualSymptoms,
    setSelectedSexualSymptoms,
    selectedMaleSymptoms,
    setSelectedMaleSymptoms,
    selectedTransSymptoms,
    setSelectedTransSymptoms,
    selectedExercise,
    setSelectedExercise,
    urgencyLevel,
    setUrgencyLevel,
    resetAppState,
    resetDiagnosisData,
  }), [
    currentScreen,
    selectedSpecialty,
    patientData,
    updatePatientData,
    selectedSymptoms,
    selectedUrinarySymptoms,
    selectedProlapseSymptoms,
    selectedSexualSymptoms,
    selectedMaleSymptoms,
    selectedTransSymptoms,
    selectedExercise,
    urgencyLevel,
    resetAppState,
    resetDiagnosisData,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  return context;
}
