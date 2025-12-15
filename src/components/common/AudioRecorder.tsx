// Componente reutilizable para grabación de audio

import { Mic, Pause, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AudioRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  gradient: string;
}

export function AudioRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  gradient,
}: AudioRecorderProps) {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <button
        onClick={onStartRecording}
        className={`w-10 h-10 bg-gradient-to-r ${gradient} text-white rounded-lg flex items-center justify-center hover:shadow-md transition-all`}
        title="Grabar audio"
      >
        <Mic className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm text-red-600">{formatTime(recordingTime)}</span>
      </div>
      <button
        onClick={onStopRecording}
        className="p-1 hover:bg-red-100 rounded transition-colors"
        title="Detener grabación"
      >
        <Pause className="w-4 h-4 text-red-600" />
      </button>
      <button
        onClick={onCancelRecording}
        className="p-1 hover:bg-red-100 rounded transition-colors"
        title="Cancelar"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
}
