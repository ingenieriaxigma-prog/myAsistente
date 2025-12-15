import { useState, useEffect } from 'react';
import { Camera, User, Mail, Calendar, Users, Save, LogOut, Shield, FileText, Activity, Loader, AlertCircle } from 'lucide-react';
import type { Specialty } from '../types';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { BackButton } from './common/BackButton';
import { GradientButton } from './common/GradientButton';
import { useAuth } from '../hooks/useAuth';
import { projectId } from '../utils/supabase/info';
import { DiagnosisHistory } from './DiagnosisHistory';
import { ModalAlert } from './common/Toast';

// Super Admin configuration
const SUPER_ADMIN_EMAIL = 'ingenieriaxigma@gmail.com';

interface ProfileScreenProps {
  specialty: Specialty;
  onBack: () => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  initialTab?: TabType;
  sessionToken?: string;
  onViewTreatmentPlan?: (diagnosisId: string) => void; // 🆕 Callback para ver plan de entrenamiento
}

interface UserProfile {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  photoUrl: string;
}

type TabType = 'profile' | 'history';

export function ProfileScreen({ specialty, onBack, onLogout, onOpenAdmin, initialTab = 'profile', sessionToken, onViewTreatmentPlan }: ProfileScreenProps) {
  const theme = useSpecialtyTheme(specialty);
  const { session, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    birthDate: '',
    gender: '',
    photoUrl: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Check if current user is super admin and load profile on mount
  useEffect(() => {
    const checkSuperAdmin = () => {
      const userEmail = user?.email || localStorage.getItem('user_email');
      if (userEmail === SUPER_ADMIN_EMAIL) {
        setIsSuperAdmin(true);
        console.log('✅ Super admin detected:', userEmail);
      } else {
        setIsSuperAdmin(false);
        console.log('👤 Regular user:', userEmail);
      }
    };
    
    checkSuperAdmin();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = sessionToken || session?.access_token;
    
    if (!token) {
      console.error('No session token available');
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Loading profile...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/profile`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('📥 Profile response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      setProfile(data.profile);
      console.log('✅ Profile loaded successfully');

    } catch (err) {
      console.error('❌ Error loading profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = sessionToken || session?.access_token;
    
    if (!token) {
      setShowErrorModal(true);
      setModalMessage('No hay sesión activa');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('💾 Saving profile...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profile.name,
            birthDate: profile.birthDate,
            gender: profile.gender,
            photoUrl: profile.photoUrl
          })
        }
      );

      const data = await response.json();
      console.log('💾 Save response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setProfile(data.profile);
      setIsEditing(false);
      setShowSuccessModal(true);
      setModalMessage('✅ Perfil actualizado correctamente');
      console.log('✅ Profile saved successfully');

    } catch (err) {
      console.error('❌ Error saving profile:', err);
      setShowErrorModal(true);
      setModalMessage(`❌ Error al guardar el perfil: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setShowErrorModal(true);
        setModalMessage('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const token = sessionToken || session?.access_token;
      if (!token) {
        setShowErrorModal(true);
        setModalMessage('No hay sesión activa');
        return;
      }

      try {
        setUploadingPhoto(true);

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const photoBase64 = event.target?.result as string;

          console.log('📸 Uploading photo...');
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b/profile/upload-photo`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                photoBase64,
                fileName: file.name
              })
            }
          );

          const data = await response.json();
          console.log('📸 Upload response:', data);

          if (!response.ok) {
            throw new Error(data.error || 'Failed to upload photo');
          }

          // Update profile with new photo URL
          setProfile(prev => ({ ...prev, photoUrl: data.photoUrl }));
          console.log('✅ Photo uploaded successfully');
          
          // Auto-save the profile with the new photo
          if (!isEditing) {
            await handleSaveProfile();
          }
        };

        reader.readAsDataURL(file);

      } catch (err) {
        console.error('❌ Error uploading photo:', err);
        setShowErrorModal(true);
        setModalMessage(`Error al subir la foto: ${err.message}`);
      } finally {
        setUploadingPhoto(false);
      }
    };
    input.click();
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <ScreenContainer>
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-6 text-white flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <BackButton onClick={onBack} variant="light" />
            <h1 className="text-xl">Mi Perfil</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (error && !profile.email) {
    return (
      <ScreenContainer>
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-6 text-white flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <BackButton onClick={onBack} variant="light" />
            <h1 className="text-xl">Mi Perfil</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 mb-2">Error al cargar el perfil</p>
                <p className="text-xs text-red-600 mb-3">{error}</p>
                <button
                  onClick={loadProfile}
                  className="text-xs text-red-700 underline hover:text-red-800"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.gradient} p-6 text-white flex-shrink-0`}>
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={onBack} variant="light" />
          <h1 className="text-xl">Mi Perfil</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Foto de perfil */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl overflow-hidden">
              {uploadingPhoto ? (
                <Loader className="w-8 h-8 animate-spin" />
              ) : profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(profile.name)}</span>
              )}
            </div>
            <button
              onClick={handlePhotoChange}
              disabled={uploadingPhoto}
              className={`absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Camera className={`w-4 h-4 ${theme.textPrimary}`} />
            </button>
          </div>
          <h2 className="text-xl mt-4">{profile.name || 'Usuario'}</h2>
          <p className="text-white/80 text-sm">{profile.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'profile'
                ? `${theme.textPrimary} border-b-2 ${theme.borderColor}`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Perfil</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'history'
                ? `${theme.textPrimary} border-b-2 ${theme.borderColor}`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Historial</span>
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'profile' ? (
          <>
            {/* Botón de editar */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  isEditing 
                    ? 'bg-gray-200 text-gray-700' 
                    : `${theme.lightBg} ${theme.textPrimary}`
                }`}
              >
                {isEditing ? 'Cancelar' : 'Editar perfil'}
              </button>
            </div>

            {/* Información del perfil */}
            <div className="space-y-4">
              {/* Nombre */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${theme.lightBg} rounded-xl flex items-center justify-center`}>
                    <User className={`w-5 h-5 ${theme.textPrimary}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Nombre completo</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ingresa tu nombre completo"
                        className="w-full text-sm text-gray-900 bg-white rounded-lg px-3 py-2 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profile.name || 'No especificado'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${theme.lightBg} rounded-xl flex items-center justify-center`}>
                    <Mail className={`w-5 h-5 ${theme.textPrimary}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Correo electrónico</label>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                    <p className="text-xs text-gray-400 mt-1">El correo no puede ser modificado</p>
                  </div>
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${theme.lightBg} rounded-xl flex items-center justify-center`}>
                    <Calendar className={`w-5 h-5 ${theme.textPrimary}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Fecha de nacimiento</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profile.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="w-full text-sm text-gray-900 bg-white rounded-lg px-3 py-2 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {profile.birthDate ? (
                          new Date(profile.birthDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        ) : (
                          'No especificado'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Género */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${theme.lightBg} rounded-xl flex items-center justify-center`}>
                    <Users className={`w-5 h-5 ${theme.textPrimary}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Género</label>
                    {isEditing ? (
                      <select
                        value={profile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full text-sm text-gray-900 bg-white rounded-lg px-3 py-2 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Selecciona tu género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Transgénero">Transgénero</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decir">Prefiero no decir</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{profile.gender || 'No especificado'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                <strong>Privacidad:</strong> Tu información personal está protegida y nunca será compartida con terceros sin tu consentimiento explícito.
              </p>
            </div>
          </>
        ) : (
          <DiagnosisHistory 
            specialty={specialty} 
            sessionToken={sessionToken}
            onViewTreatmentPlan={onViewTreatmentPlan}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-2 flex-shrink-0">
        {isEditing && (
          <GradientButton
            gradient={theme.gradient}
            onClick={handleSaveProfile}
            fullWidth
            size="lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar cambios
              </>
            )}
          </GradientButton>
        )}
        
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>

        {isSuperAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Shield className="w-5 h-5" />
            Administrar
          </button>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <ModalAlert
          type="success"
          title="Perfil actualizado correctamente"
          message="Tus cambios se han guardado exitosamente"
          onClose={() => setShowSuccessModal(false)}
          buttonText="OK"
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ModalAlert
          type="error"
          title="Error al guardar"
          message={modalMessage.replace('❌ Error al guardar el perfil: ', '')}
          onClose={() => setShowErrorModal(false)}
          buttonText="OK"
        />
      )}
    </ScreenContainer>
  );
}