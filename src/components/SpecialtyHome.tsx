import { ChevronLeft, MessageCircle, ClipboardList, UserCircle } from 'lucide-react';
import { useState } from 'react';
import type { Specialty } from '../types';
import { PelvisIcon } from './icons/PelvisIcon';
import { ColonIcon } from './icons/ColonIcon';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { GradientHeader } from './common/GradientHeader';

interface SpecialtyHomeProps {
  specialty: Specialty;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenDiagnosis: () => void;
  onOpenProfile: () => void;
}

export function SpecialtyHome({ specialty, onBack, onOpenChat, onOpenDiagnosis, onOpenProfile }: SpecialtyHomeProps) {
  const theme = useSpecialtyTheme(specialty);
  
  const iconMap = {
    MyPelvic: PelvisIcon,
    MyColop: ColonIcon,
  };
  
  const SpecialtyIcon = specialty ? iconMap[specialty] : ColonIcon;

  return (
    <ScreenContainer>
      {/* Header con gradiente */}
      <GradientHeader gradient={theme.gradient} className="p-6 text-white flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <UserCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <SpecialtyIcon className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-3xl mb-1">{theme.name}</h1>
            <p className="text-white/90">{theme.subtitle}</p>
          </div>
        </div>
      </GradientHeader>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-8">
          <h2 className="text-xl mb-6 text-gray-800">¿Cómo podemos ayudarte hoy?</h2>

          <div className="space-y-4">
            {/* Chat Experto */}
            <button
              onClick={onOpenChat}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-2">Chat Experto</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Conversa con nuestro asistente clínico inteligente. Obtén respuestas basadas en nuestra base de conocimiento médico.
                  </p>
                </div>
              </div>
            </button>

            {/* Diagnóstico Inteligente */}
            <button
              onClick={onOpenDiagnosis}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-2">Diagnóstico Inteligente</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Realiza una evaluación guiada de síntomas para obtener un análisis preliminar y recomendaciones personalizadas.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Información adicional */}
          <div className={`mt-8 ${theme.lightBg} rounded-2xl p-5`}>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">Nota importante:</span> Esta herramienta utiliza IA avanzada combinada con documentación médica especializada para brindarte información precisa.
            </p>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}