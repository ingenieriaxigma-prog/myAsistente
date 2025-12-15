import { useState, useEffect } from 'react';
import { ArrowLeft, Database, Upload, Check, X, AlertCircle, FileText, Clock, Package, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Super Admin configuration
const SUPER_ADMIN_EMAIL = 'ingenieriaxigma@gmail.com';

interface KnowledgeBase {
  specialty: string;
  version: string;
  updated_at: string;
  total_chunks: number;
  sources: string[];
  description: string;
  last_upload: string;
}

interface AdminPanelProps {
  onBack: () => void;
  selectedSpecialty: string | null;
  session: any;
}

export function AdminPanel({ onBack, selectedSpecialty, session }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'users' | 'analytics'>('knowledge');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Check super admin access on mount
  useEffect(() => {
    const checkAccess = () => {
      const userEmail = localStorage.getItem('user_email');
      const isAdmin = userEmail === SUPER_ADMIN_EMAIL;
      setIsSuperAdmin(isAdmin);
      setCheckingAccess(false);
      
      if (!isAdmin) {
        console.log('🚫 Access denied to admin panel for user:', userEmail);
      } else {
        console.log('✅ Super admin access granted:', userEmail);
      }
    };
    
    checkAccess();
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadKnowledgeBases();
    }
  }, [isSuperAdmin]);

  const loadKnowledgeBases = async () => {
    setLoading(true);
    try {
      // Get access token from session
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/knowledge/info`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data.knowledgeBases || []);
        console.log('📚 Knowledge bases loaded:', data.knowledgeBases);
      } else {
        console.error('Failed to load knowledge bases:', await response.text());
      }
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Leer el archivo JSON
      const text = await file.text();
      const knowledgeBase = JSON.parse(text);

      // Validar estructura básica
      if (!knowledgeBase.specialty || !knowledgeBase.chunks) {
        setUploadResult({
          success: false,
          message: 'Archivo JSON inválido. Debe contener "specialty" y "chunks".'
        });
        setUploading(false);
        return;
      }

      console.log(`📤 Uploading knowledge base: ${knowledgeBase.specialty}`, {
        chunks: knowledgeBase.chunks.length,
        version: knowledgeBase.version
      });

      // Get access token from session
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        setUploadResult({
          success: false,
          message: 'No hay sesión activa. Por favor inicia sesión nuevamente.'
        });
        setUploading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/knowledge/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(knowledgeBase),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message || `✅ Base de conocimiento subida: ${result.successful}/${result.processed} chunks procesados`
        });
        console.log('✅ Knowledge base uploaded successfully:', result);
        
        // Recargar la lista
        await loadKnowledgeBases();
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Error al subir la base de conocimiento'
        });
        console.error('❌ Upload failed:', result);
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: `Error: ${error.message}`
      });
      console.error('❌ Upload error:', error);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    if (specialty === 'MyPelvic') {
      return 'from-teal-500 to-cyan-600';
    } else if (specialty === 'MyColop') {
      return 'from-blue-500 to-blue-600';
    }
    return 'from-gray-500 to-gray-600';
  };

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl text-gray-900">🔧 Panel de Administración</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              Solo el super administrador tiene acceso a este panel.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Nota:</strong> Si crees que deberías tener acceso, contacta al administrador del sistema.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Volver al Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Sticky para mantenerlo visible */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl text-gray-900">🔧 Panel de Administración</h1>
                <p className="text-sm text-gray-600 mt-1">Super Usuario - Gestión Avanzada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'knowledge'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Base de Conocimiento</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled
            >
              <Package className="w-5 h-5" />
              <span>Usuarios</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Próximamente</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled
            >
              <FileText className="w-5 h-5" />
              <span>Analíticas</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Próximamente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8">
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl text-gray-900 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-500" />
                    Subir Base de Conocimiento
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sube un archivo JSON con la información médica para cada especialidad
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click para subir</span> o arrastra el archivo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JSON con formato: {"{"} specialty, version, chunks {"}"}</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Upload Status */}
              {uploading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-blue-700">Procesando y generando embeddings... Esto puede tardar unos minutos.</span>
                  </div>
                </div>
              )}

              {uploadResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  uploadResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {uploadResult.success ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm ${uploadResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {uploadResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Example Format */}
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  📄 Ver formato de ejemplo
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-x-auto">
{`{
  "specialty": "MyColop",
  "version": "1.0",
  "updated_at": "2024-12-13",
  "metadata": {
    "description": "Base de conocimiento de coloproctología",
    "sources": ["Manual médico", "Guías clínicas"]
  },
  "chunks": [
    {
      "id": "chunk_001",
      "content": "Las hemorroides son venas inflamadas...",
      "metadata": {
        "topic": "hemorroides",
        "section": "patologías"
      }
    }
  ]
}`}
                </pre>
              </details>
            </div>

            {/* Knowledge Bases List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-gray-900">📚 Bases de Conocimiento Activas</h2>
                <button
                  onClick={loadKnowledgeBases}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Clock className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : knowledgeBases.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay bases de conocimiento subidas</p>
                  <p className="text-sm text-gray-500 mt-1">Sube tu primer archivo JSON para comenzar</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {knowledgeBases.map((kb) => (
                    <div
                      key={kb.specialty}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Header con gradiente */}
                      <div className={`bg-gradient-to-r ${getSpecialtyColor(kb.specialty)} p-4`}>
                        <h3 className="text-white text-lg">{kb.specialty}</h3>
                        <p className="text-white/80 text-sm mt-1">{kb.description || 'Base de conocimiento médica'}</p>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Versión:</span>
                          <span className="text-gray-900">{kb.version}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Chunks:</span>
                          <span className="text-gray-900 font-semibold">{kb.total_chunks.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Última actualización:</span>
                          <span className="text-gray-900 text-xs">{formatDate(kb.last_upload)}</span>
                        </div>

                        {kb.sources && kb.sources.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Fuentes:</p>
                            <div className="flex flex-wrap gap-1">
                              {kb.sources.map((source, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-700 font-medium">Activa y funcionando</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs (placeholder) */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">Analíticas y Reportes</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
}