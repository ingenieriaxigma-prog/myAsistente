import { useState } from 'react';
import { Heart, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { TermsModal } from './TermsModal';
import { ScreenContainer } from './common/ScreenContainer';
import { GradientHeader } from './common/GradientHeader';
import { GradientButton } from './common/GradientButton';
import { useAuth } from '../hooks/useAuth';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithOAuth } = useAuth();

  const appGradient = 'from-blue-500 to-blue-600';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        console.log('[LoginScreen] Starting sign in...');
        await signIn(email, password);
        console.log('[LoginScreen] Sign in completed successfully');
        onLogin();
      } else {
        // Sign up
        if (!acceptedTerms) {
          setError('Debes aceptar los términos y condiciones');
          setLoading(false);
          return;
        }
        console.log('[LoginScreen] Starting sign up...');
        await signUp(email, password, name);
        console.log('[LoginScreen] Sign up completed successfully');
        onLogin();
      }
    } catch (err: any) {
      console.error('[LoginScreen] Authentication error:', err);
      setError(err.message || 'Error al autenticar. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // NOTE: To enable Google OAuth, you must configure it in your Supabase project
      // Follow instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
      await signInWithOAuth('google');
      // OAuth redirect will handle the login
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Error al autenticar con Google. Asegúrate de haber configurado OAuth en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsModal(false);
  };

  return (
    <ScreenContainer>
      <div className="flex-1 w-full md:min-h-screen md:bg-[#f5f7fa] md:flex md:items-center md:justify-center">
        <div className="w-full md:max-w-[480px] md:bg-white md:rounded-2xl md:shadow-lg md:border md:border-gray-100 md:p-6 md:mx-auto">
          {/* Header con gradiente */}
          <GradientHeader gradient={appGradient} className="p-6 md:p-5 text-white text-center flex-shrink-0">
            <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <div className={`bg-gradient-to-br ${appGradient} w-[72px] h-[72px] rounded-xl flex items-center justify-center`}>
                <Heart className="w-10 h-10 text-white animate-[heartbeat_1.5s_ease-in-out_infinite]" fill="white" />
              </div>
            </div>
            <h1 className="text-3xl mb-2">My</h1>
            <p className="text-base text-blue-100">Asistente</p>
          </GradientHeader>

          {/* Formulario con scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-5">
              <div className="w-full max-w-[420px] mx-auto bg-white rounded-xl shadow-md px-6 py-6 md:px-6 md:py-6">
                <div className="flex gap-2 mb-6 md:mb-4 bg-gray-100 p-1.5 rounded-xl">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 rounded-lg transition-all text-base font-medium ${
                      isLogin 
                        ? 'bg-white shadow-md' 
                        : 'text-gray-600'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 rounded-lg transition-all text-base font-medium ${
                      !isLogin 
                        ? 'bg-white shadow-md' 
                        : 'text-gray-600'
                    }`}
                  >
                    Registro
                  </button>
                </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 text-base font-medium">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="Ingresa tu nombre"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2 text-base font-medium">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-base font-medium">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-blue-600 text-sm hover:text-blue-700 transition-colors font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <GradientButton
              type="submit"
              gradient={appGradient}
              fullWidth
              className="py-3.5 mt-6 text-base font-medium"
              disabled={loading}
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </GradientButton>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Botón de Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2.5 group text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Términos y Condiciones */}
          {!isLogin && (
            <div className="mt-6 mb-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs leading-relaxed text-gray-600 cursor-pointer select-none">
                He leído y acepto los{' '}
                <span
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-700 underline cursor-pointer font-medium"
                >
                  Términos y Condiciones
                </span>
              </label>
            </div>
          )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </ScreenContainer>
  );
}
