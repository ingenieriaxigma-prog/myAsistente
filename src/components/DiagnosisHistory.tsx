import { useState, useEffect } from 'react';
import { FileText, ChevronRight, Calendar, AlertCircle, Clock, Loader, Download, Trash2, Dumbbell } from 'lucide-react';
import type { Specialty } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { projectId } from '../utils/supabase/info';
import { ConfirmModal, ModalAlert } from './common/Toast';
import { generateDiagnosisPDF } from '../utils/pdfGenerator';

interface DiagnosisHistoryProps {
  specialty: Specialty;
  sessionToken?: string; // 🆕 Recibir el token como prop
  onViewTreatmentPlan?: (diagnosisId: string) => void; // 🆕 Callback para ver plan de entrenamiento
}

interface SavedDiagnosis {
  id: string;
  createdAt: string;
  urgencyLevel: 'urgent' | 'moderate' | 'mild';
  diagnosesCount: number;
  symptomsCount: number;
  specialty: string;
  summary: string;
}

export function DiagnosisHistory({ specialty, sessionToken, onViewTreatmentPlan }: DiagnosisHistoryProps) {
  const theme = useSpecialtyTheme(specialty);
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<SavedDiagnosis | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [diagnosisToDelete, setDiagnosisToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (sessionToken) {
      loadDiagnosisHistory();
    } else {
      setLoading(false);
      setError('No hay sesión activa');
    }
  }, [sessionToken]);

  const loadDiagnosisHistory = async () => {
    if (!sessionToken) {
      console.error('No session token available');
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Loading diagnosis history...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/history`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('📥 Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load diagnosis history');
      }

      // Transform the data from the backend format
      const transformedDiagnoses = (data.history || []).map((item: any) => ({
        id: item.id,
        createdAt: item.created_at,
        urgencyLevel: item.urgency_level,
        diagnosesCount: item.possible_diagnoses?.length || 0,
        symptomsCount: item.symptoms?.length || 0,
        specialty: item.specialty === 'MyPelvic' ? 'pelvic' : 'colop',
        summary: item.summary || item.urgency_description || 'Sin descripción'
      }));

      setDiagnoses(transformedDiagnoses);
    } catch (err) {
      console.error('❌ Error loading diagnosis history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'mild':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'urgent':
        return 'Urgente';
      case 'moderate':
        return 'Moderado';
      case 'mild':
        return 'Leve';
      default:
        return level;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, diagnosisId: string) => {
    e.stopPropagation();
    setDiagnosisToDelete(diagnosisId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!diagnosisToDelete || !sessionToken) return;

    try {
      setDeleting(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/${diagnosisToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete diagnosis');
      }

      // Remove from local state
      setDiagnoses(prev => prev.filter(d => d.id !== diagnosisToDelete));
      setShowDeleteConfirm(false);
      setDiagnosisToDelete(null);
    } catch (err) {
      console.error('❌ Error deleting diagnosis:', err);
      alert('Error al eliminar el diagnóstico');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDiagnosisToDelete(null);
  };

  const handleDownloadPDF = async (e: React.MouseEvent, diagnosis: SavedDiagnosis) => {
    e.stopPropagation();
    
    if (!sessionToken) {
      alert('No hay sesión activa');
      return;
    }
    
    try {
      setGeneratingPdf(true);
      
      // Fetch full diagnosis details from backend
      console.log('📥 Fetching full diagnosis details for PDF generation...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/diagnosis/${diagnosis.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch diagnosis details');
      }

      const { diagnosis: fullDiagnosis } = await response.json();
      console.log('✅ Full diagnosis details retrieved:', fullDiagnosis);

      // Log patient_data to debug
      console.log('📋 Patient data from DB:', fullDiagnosis.patient_data);

      // Validate patient data
      if (!fullDiagnosis.patient_data) {
        throw new Error('No se encontraron datos del paciente en el diagnóstico guardado');
      }

      // Transform database format to PDF generator format
      const pdfData = {
        specialty: fullDiagnosis.specialty,
        patientData: {
          gender: fullDiagnosis.patient_data.gender,
          ageRange: fullDiagnosis.patient_data.ageRange || fullDiagnosis.patient_data.age_range,
        },
        symptoms: fullDiagnosis.symptoms || [],
        diagnosisResult: {
          urgencyLevel: fullDiagnosis.urgency_level,
          urgencyTitle: fullDiagnosis.urgency_title,
          urgencyDescription: fullDiagnosis.urgency_description,
          urgencyTimeframe: fullDiagnosis.urgency_timeframe,
          summary: fullDiagnosis.summary,
          possibleDiagnoses: fullDiagnosis.possible_diagnoses || [],
          redFlags: fullDiagnosis.red_flags || [],
          recommendations: fullDiagnosis.recommendations || {
            immediate: [],
            lifestyle: [],
            monitoring: []
          },
          nextSteps: fullDiagnosis.next_steps || []
        },
        urgencyTitle: fullDiagnosis.urgency_title,
        urgencyDescription: fullDiagnosis.urgency_description,
        urgencyTimeframe: fullDiagnosis.urgency_timeframe
      };

      console.log('📋 Transformed PDF data:', pdfData);

      // Generate PDF
      console.log('📄 Generating PDF...');
      await generateDiagnosisPDF(pdfData);
      console.log('✅ PDF generated successfully');

      // Small delay to show the loading state
      setTimeout(() => {
        setGeneratingPdf(false);
      }, 500);

    } catch (err) {
      console.error('❌ Error generating PDF:', err);
      setGeneratingPdf(false);
      alert('Error al generar el PDF del diagnóstico');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-gray-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 mb-1">Error al cargar el historial</p>
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={loadDiagnosisHistory}
              className="mt-2 text-xs text-red-700 underline hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (diagnoses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className={`w-16 h-16 ${theme.lightBg} rounded-full flex items-center justify-center mb-4`}>
          <FileText className={`w-8 h-8 ${theme.textPrimary}`} />
        </div>
        <h3 className="text-gray-900 mb-2">No hay diagnósticos guardados</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Completa tu primer diagnóstico inteligente para ver tu historial médico aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Historial de Diagnósticos</h3>
        <span className="text-sm text-gray-500">{diagnoses.length} {diagnoses.length === 1 ? 'registro' : 'registros'}</span>
      </div>

      {diagnoses.map((diagnosis) => (
        <div
          key={diagnosis.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedDiagnosis(diagnosis)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 ${theme.lightBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <FileText className={`w-5 h-5 ${theme.textPrimary}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getUrgencyColor(diagnosis.urgencyLevel)}`}>
                    {getUrgencyLabel(diagnosis.urgencyLevel)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {diagnosis.specialty === 'pelvic' ? 'MyPelvic' : 'MyColop'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">{diagnosis.summary}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(diagnosis.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            <span>{diagnosis.diagnosesCount} diagnóstico{diagnosis.diagnosesCount !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{diagnosis.symptomsCount} síntoma{diagnosis.symptomsCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            <button
              onClick={(e) => handleDownloadPDF(e, diagnosis)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, diagnosis.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
            {onViewTreatmentPlan && (
              <button
                onClick={() => onViewTreatmentPlan(diagnosis.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <Dumbbell className="w-4 h-4" />
                Ver Plan de Entrenamiento
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Modal de detalles (futuro) */}
      {selectedDiagnosis && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDiagnosis(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4">Detalles del Diagnóstico</h3>
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidad de detalles completos próximamente...
            </p>
            <button
              onClick={() => setSelectedDiagnosis(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Eliminar Diagnóstico"
          message="¿Estás seguro de que quieres eliminar este diagnóstico?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          loading={deleting}
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmButtonColor="red"
        />
      )}

      {/* Modal de generación de PDF */}
      {generatingPdf && (
        <ModalAlert
          type="info"
          title="Generando PDF del diagnóstico guardado..."
          onClose={null}
        />
      )}
    </div>
  );
}