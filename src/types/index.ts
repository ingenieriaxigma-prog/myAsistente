// Tipos para el sistema de tratamiento y ejercicios
export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  instructions: string[];
  benefits: string[];
  precautions?: string[];
  repetitions?: string;
  frequency: string;
  icon: string;
  completed: boolean;
  completedDates: string[];
  applicableFor?: string[]; // Áreas problemáticas aplicables
}

export type Screen = 
  | 'login' 
  | 'specialty-selection' 
  | 'specialty-home' 
  | 'chat' 
  | 'profile'
  | 'admin'
  | 'diagnosis-step1'
  | 'diagnosis-step2'
  | 'diagnosis-step2-urinary'
  | 'diagnosis-step2-prolapse'
  | 'diagnosis-step2-sexual'
  | 'diagnosis-step2-male'
  | 'diagnosis-step2-trans'
  | 'diagnosis-analysis'
  | 'diagnosis-step3'
  | 'treatment-plan'
  | 'exercise-detail';

export type Specialty = 'MyPelvic' | 'MyColop' | null;

export type Gender = 'male' | 'female' | 'trans' | null;

export type UrgencyLevel = 'urgent' | 'moderate' | 'mild';

export type ProblemArea = 'colorectal' | 'urinary' | 'prolapse' | 'sexual' | 'male' | 'trans';

export interface PatientData {
  gender: Gender;
  ageRange: string;
  hasSymptoms: boolean;
  healthDescription: string;
  medicalHistory?: boolean;
  medications?: boolean;
  problemAreas?: ProblemArea[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: Attachment[];
  metadata?: {
    model?: string;
    modelReason?: string;
    hasImages?: boolean;
    rag_enabled?: boolean;
    sources_count?: number;
    actually_used_sources?: boolean; // True if AI actually used DB sources
    sources?: Array<{
      index: number;
      similarity: number;
      preview: string;
    }>;
    rag?: {
      chunks_found?: number;
      chunks?: Array<{
        index: number;
        similarity: number;
        preview: string;
      }>;
    };
  };
}

export interface Attachment {
  type: 'image' | 'file' | 'audio';
  name: string;
  url: string;
  size?: number;
  base64?: string; // Base64 data for images and files
  extractedText?: string; // Extracted text from PDFs and documents
  mimeType?: string;
  storagePath?: string;
  uploading?: boolean;
  uploadError?: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  date: Date;
}

export interface TreatmentDay {
  day: number;
  date: Date;
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
}

export interface NavigationProps {
  onBack: () => void;
}

export interface SpecialtyProps {
  specialty: Specialty;
}

export interface DiagnosisStepProps extends SpecialtyProps, NavigationProps {
  onContinue: (data: any) => void;
}

// ============================================================================
// DIAGNOSIS RESULT TYPES (AI-powered diagnosis)
// ============================================================================

export interface DiagnosisResult {
  urgencyLevel: UrgencyLevel;
  urgencyTitle: string;        // ⬅️ NUEVO: Título personalizado por IA
  urgencyDescription: string;  // ⬅️ NUEVO: Descripción personalizada por IA
  urgencyTimeframe: string;    // ⬅️ NUEVO: Timeframe personalizado por IA
  summary: string;
  possibleDiagnoses: PossibleDiagnosis[];
  recommendations: DiagnosisRecommendations;
  redFlags: string[];
  nextSteps: string[];
}

export interface PossibleDiagnosis {
  name: string;
  probability: 'high' | 'medium' | 'low';
  description: string;
}

export interface DiagnosisRecommendations {
  immediate: DiagnosisAction[];
  lifestyle: DiagnosisAction[];
  monitoring: DiagnosisAction[];
}

export interface DiagnosisAction {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface DiagnosisMetadata {
  ragUsed: boolean;
  chunksFound: number;
  symptomsAnalyzed: number;
}
