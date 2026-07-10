import React, { useRef, useState, useEffect } from 'react';
import { useCaptureStore } from '../store/captureStore';
import { Video, Square, Film, ArrowRight } from 'lucide-react';

export default function VideoRecorder({ stream, onRecordingComplete }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const { activeSign } = useCaptureStore();

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    // Usar el tipo MIME adecuado para compatibilidad
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Guardar trozos de data cada 100ms
      setRecording(true);

      // Auto-detener después de 3 segundos (tiempo estándar para capturar una seña)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 3000);
    } catch (err) {
      console.error("Error iniciando MediaRecorder:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {recording ? (
        <button
          onClick={stopRecording}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg shadow-red-900/20"
        >
          <Square size={16} />
          <span>Detener ({activeSign})</span>
        </button>
      ) : (
        <button
          onClick={startRecording}
          disabled={!stream}
          className="px-5 py-3 bg-brand-purple hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg shadow-purple-900/20"
        >
          <Video size={16} />
          <span>Grabar Seña '{activeSign}'</span>
        </button>
      )}
    </div>
  );
}
