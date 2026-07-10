import React, { useState, useEffect, useRef } from 'react';
import Camera from '../components/Camera';
import VideoRecorder from '../components/VideoRecorder';
import ImagePreview from '../components/ImagePreview';
import UploadProgress from '../components/UploadProgress';
import { useCaptureStore } from '../store/captureStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Play, Square, Settings, RefreshCw, CheckCircle, Lightbulb, Zap, ShieldCheck } from 'lucide-react';

export default function Capture() {
  const [stream, setStream] = useState(null);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Zustand Stores
  const {
    activeSign,
    activeCategory,
    calibrationStep,
    handDetected,
    handCentered,
    lightingQuality,
    stabilityQuality,
    capturedSamples,
    fps,
    setActiveSign,
    setCalibrationStep,
    addSample,
    clearSamples,
    resetStore
  } = useCaptureStore();

  const user = useAuthStore((state) => state.user);

  // Resetear el store al montar/desmontar
  useEffect(() => {
    resetStore();
    return () => resetStore();
  }, []);

  // Lógica de auto-captura (Ráfaga inteligente de landmarks)
  const handleLandmarksDetected = (landmarks) => {
    // Si no estamos en paso de grabación, ignorar
    if (calibrationStep !== 'recording') return;

    const now = performance.now();
    // Validar requisitos de calidad de calibración
    const isQualityMet = 
      handDetected && 
      handCentered && 
      lightingQuality !== 'low' && 
      stabilityQuality === 'stable';

    // Capturar muestra si cumple calidad y pasaron 1000ms desde la última toma
    if (isQualityMet && now - lastCaptureTime > 1000) {
      if (capturedSamples.length < 10) {
        // Crear objeto de muestra
        const sample = {
          idx: capturedSamples.length + 1,
          landmarks: landmarks,
          timestamp: new Date().toISOString(),
          quality: {
            lighting: lightingQuality,
            stability: stabilityQuality
          }
        };
        addSample(sample);
        setLastCaptureTime(now);
        
        // Efecto visual flash de disparo
        const flash = document.getElementById('camera-flash');
        if (flash) {
          flash.style.opacity = '0.4';
          setTimeout(() => flash.style.opacity = '0', 150);
        }
      }
    }
  };

  const handleStartCapture = () => {
    clearSamples();
    setCalibrationStep('recording');
  };

  const handleCancelCapture = () => {
    clearSamples();
    setCalibrationStep('idle');
  };

  // Enviar el lote de muestras capturadas al backend
  const handleUploadSamples = async () => {
    setUploadStatus('uploading');
    setUploadProgress(10);
    setUploadError(null);

    try {
      // Simular progreso de carga
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 20;
        });
      }, 300);

      // Crear payload para enviar a la API
      // En este flujo enviamos los landmarks y metadatos estructurados
      const payload = {
        action: "UPLOAD",
        usuario: user?.email || "colaborador@lessa.org",
        categoria: activeCategory,
        sena: activeSign,
        fps: Math.round(fps),
        resolucion: "640x480",
        duracion: 3.0,
        // Serializar landmarks de la última muestra capturada
        videoBase64: "MOCK_BASE64_SEQUENCE_DATA",
        videoName: `${activeSign}_seq_${Date.now()}.mp4`,
        thumbnailBase64: "MOCK_BASE64_THUMBNAIL_DATA",
        thumbnailName: `${activeSign}_thumb_${Date.now()}.png`
      };

      // Si estuviéramos conectando a Google Apps Script o FastAPI
      const response = await api.post('/api/v1/dataset/upload', payload);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        clearSamples();
        setUploadStatus('idle');
      }, 2000);
    } catch (err) {
      setUploadStatus('error');
      setUploadError(err.message || 'Ocurrió un error al enviar el dataset.');
    }
  };

  // Criterios de calidad generales para deshabilitar/habilitar controles
  const isReadyToStart = handDetected && handCentered && lightingQuality !== 'low' && stabilityQuality === 'stable';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Captura Inteligente y Guiada</h1>
          <p className="text-slate-400 text-sm mt-1">
            El sistema requiere cumplir 4 condiciones de calidad antes de tomar las 10 muestras en ráfaga secuencial.
          </p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-brand-purple-light font-bold shrink-0">
          Objetivo: 10 Variaciones de Ángulo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Cámara Viewfinder y Controles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-850 bg-slate-950 aspect-video">
            {/* Cámara Component */}
            <Camera 
              onLandmarksDetected={handleLandmarksDetected} 
              onStreamActive={(s) => setStream(s)} 
            />

            {/* Efecto de Flash de Disparo */}
            <div 
              id="camera-flash" 
              className="absolute inset-0 bg-white opacity-0 transition-opacity duration-75 pointer-events-none z-10" 
            />

            {/* Overlay Silueta de Guía Visual (TSK-2.4) */}
            {calibrationStep === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/40 backdrop-blur-[1px]">
                <div className="w-56 h-56 border-2 border-dashed border-purple-500/40 rounded-full flex flex-col items-center justify-center animate-pulse">
                  <Zap size={24} className="text-purple-400 mb-2" />
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest text-center px-4">
                    Coloca tu mano aquí para calibrar
                  </span>
                </div>
              </div>
            )}

            {/* HUD de Calidad Superior */}
            <div className="absolute top-4 left-4 right-4 flex justify-between gap-3 pointer-events-none z-20">
              <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md ${
                handDetected 
                  ? 'border-emerald-500/30 text-emerald-400' 
                  : 'border-red-500/30 text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${handDetected ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                {handDetected ? 'Mano Detectada' : 'Mano no Detectada'}
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-semibold">
                FPS: {fps}
              </div>
            </div>

            {/* HUD de Calidad Inferior */}
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3 pointer-events-none z-20">
              <div className={`bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border text-center ${
                handCentered ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
              }`}>
                <span className="text-[9px] text-slate-500 font-medium block uppercase tracking-wider">Alineación</span>
                <span className="text-xs font-bold block mt-0.5">{handCentered ? 'Centrado' : 'Deficiente'}</span>
              </div>
              <div className={`bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border text-center ${
                lightingQuality !== 'low' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
              }`}>
                <span className="text-[9px] text-slate-500 font-medium block uppercase tracking-wider">Luminosidad</span>
                <span className="text-xs font-bold block mt-0.5 capitalize">{lightingQuality}</span>
              </div>
              <div className={`bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border text-center ${
                stabilityQuality === 'stable' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
              }`}>
                <span className="text-[9px] text-slate-500 font-medium block uppercase tracking-wider">Estabilidad</span>
                <span className="text-xs font-bold block mt-0.5">{stabilityQuality === 'stable' ? 'Estable' : 'Inestable'}</span>
              </div>
            </div>
          </div>

          {/* Panel de Controles */}
          <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              {calibrationStep === 'idle' ? (
                <>
                  <h4 className="text-sm font-bold text-white">¿Listo para registrar?</h4>
                  <p className="text-xs text-slate-550 mt-0.5">El disparador se activará automáticamente al estabilizar la mano.</p>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-white">Capturando muestras...</h4>
                  <p className="text-xs text-brand-purple-light mt-0.5 font-bold">Muestras: {capturedSamples.length} / 10</p>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              {calibrationStep === 'recording' ? (
                <button
                  onClick={handleCancelCapture}
                  className="w-full sm:w-auto px-6 py-3 bg-red-950/20 hover:bg-red-900/25 border border-red-900/40 text-red-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Square size={16} />
                  <span>Cancelar Ráfaga</span>
                </button>
              ) : (
                <button
                  onClick={handleStartCapture}
                  disabled={!isReadyToStart}
                  className={`w-full sm:w-auto px-8 py-3.5 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg ${
                    isReadyToStart
                      ? 'bg-brand-purple hover:bg-purple-600 text-white shadow-purple-900/20'
                      : 'bg-slate-850 border border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={16} />
                  <span>Iniciar Ráfaga (10)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Catálogo de Referencia, Muestras y Envío */}
        <div className="space-y-6">
          {/* Tarjeta de Seña de Referencia */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-3">Seña a Capturar</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-550 text-[10px] font-bold uppercase tracking-wider mb-2">Selección</label>
                <select
                  value={activeSign}
                  onChange={(e) => setActiveSign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                >
                  <option value="A">Letra A (Alfabeto)</option>
                  <option value="B">Letra B (Alfabeto)</option>
                  <option value="C">Letra C (Alfabeto)</option>
                  <option value="CH">Letra CH (Alfabeto)</option>
                </select>
              </div>

              {/* Guía en caso de no calibración */}
              {!isReadyToStart && calibrationStep === 'idle' && (
                <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex gap-2.5 text-amber-200">
                  <Lightbulb size={16} className="shrink-0 text-amber-500 mt-0.5" />
                  <div className="text-[10px] leading-relaxed">
                    <span className="font-bold block">Requisitos pendientes:</span>
                    <ul className="list-disc pl-3 mt-1 space-y-0.5 text-amber-300/80">
                      {!handDetected && <li>Detectar presencia de mano.</li>}
                      {!handCentered && <li>Centrar mano en el centro del lente.</li>}
                      {lightingQuality === 'low' && <li>Mejorar iluminación del entorno.</li>}
                      {stabilityQuality !== 'stable' && <li>Mantener la mano estática (sin temblar).</li>}
                    </ul>
                  </div>
                </div>
              )}

              {isReadyToStart && calibrationStep === 'idle' && (
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 flex gap-2.5 text-emerald-200">
                  <ShieldCheck size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                  <div className="text-[10px] leading-relaxed">
                    <span className="font-bold block">Calibración Completa:</span>
                    <p className="text-emerald-350 mt-1">La mano está lista y estable. Haz clic en "Iniciar Ráfaga".</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Listado de Muestras Temporal y Carga */}
          {capturedSamples.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Muestras Capturadas</h3>
                <span className="text-xs text-brand-purple-light font-bold">{capturedSamples.length} / 10</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {capturedSamples.map((sample) => (
                  <ImagePreview key={sample.idx} sample={sample} />
                ))}
              </div>

              {capturedSamples.length >= 10 && uploadStatus === 'idle' && (
                <button
                  onClick={handleUploadSamples}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap size={16} />
                  <span>Subir 10 Muestras Aprobadas</span>
                </button>
              )}

              <UploadProgress 
                progress={uploadProgress} 
                status={uploadStatus} 
                error={uploadError} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
