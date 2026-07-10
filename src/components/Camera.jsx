import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useCaptureStore } from '../store/captureStore';
import { CameraOff, Loader2 } from 'lucide-react';

export default function Camera({ onLandmarksDetected, onStreamActive }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelError, setModelError] = useState(null);

  // Traer acciones de Zustand
  const {
    calibrationStep,
    setHandDetected,
    setHandCentered,
    setLightingQuality,
    setStabilityQuality,
    setFps,
    addSample
  } = useCaptureStore();

  // Historial para cálculo de estabilidad y FPS
  const lastLandmarksRef = useRef(null);
  const jitterHistoryRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef(null);

  // Referencias mutables para evitar re-crear bucles
  const landmarkerRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    // 1. Inicializar MediaPipe Hand Landmarker
    const initLandmarker = async () => {
      try {
        setLoadingModel(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "video",
          numHands: 1
        });
        landmarkerRef.current = landmarker;
        setLoadingModel(false);
        startCamera();
      } catch (err) {
        console.error("Error cargando HandLandmarker:", err);
        setModelError("No se pudo iniciar el modelo de IA local. Verifique su conexión.");
        setLoadingModel(false);
      }
    };

    initLandmarker();

    // Medición de FPS cada segundo
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      // Limpieza al desmontar
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
      stopCamera();
    };
  }, []);

  // 2. Activar Cámara Web
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          if (onStreamActive) {
            onStreamActive(stream);
          }
          // Iniciar bucle de detección
          animationFrameIdRef.current = requestAnimationFrame(detectionLoop);
        };
      }
    } catch (err) {
      console.error("Error al acceder a la cámara web:", err);
      setModelError("Permiso de cámara denegado o no disponible.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Bucle de Inferencia en Tiempo Real
  const detectionLoop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker || video.paused || video.ended) {
      animationFrameIdRef.current = requestAnimationFrame(detectionLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame del video en espejo
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Contar frame para FPS
    frameCountRef.current++;

    const now = performance.now();
    const timestamp = now;

    // Ejecutar detección
    const results = landmarker.detectForVideo(video, timestamp);

    // Analizar iluminación (Sub-muestreo rápido de píxeles)
    analyzeLighting(ctx, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      setHandDetected(true);
      const hand = results.landmarks[0];

      // 1. Centrado (coordenada X promedio)
      const xCenter = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
      const centered = xCenter > 0.25 && xCenter < 0.75;
      setHandCentered(centered);

      // 2. Estabilidad (mide cambio con respecto al frame anterior)
      analyzeStability(hand);

      // 3. Dibujar Esqueleto de Landmarks en Canvas (Estilo Neón)
      drawSkeleton(ctx, hand);

      // Enviar landmarks al callback para su consumo (por ejemplo, autodisparador)
      if (onLandmarksDetected) {
        onLandmarksDetected(hand);
      }
    } else {
      setHandDetected(false);
      setHandCentered(false);
      setStabilityQuality('low');
      jitterHistoryRef.current = [];
      lastLandmarksRef.current = null;
    }

    // Restaurar transformación de espejo para futuros ciclos
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    animationFrameIdRef.current = requestAnimationFrame(detectionLoop);
  };

  // Cálculo de Iluminación promedio (Greyscale)
  const analyzeLighting = (ctx, width, height) => {
    try {
      // Muestrear área de píxeles
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let colorSum = 0;
      let sampleCount = 0;

      // Saltar píxeles para velocidad (muestrear cada 15 píxeles)
      for (let i = 0; i < data.length; i += 60) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        colorSum += brightness;
        sampleCount++;
      }

      const avgBrightness = colorSum / sampleCount;
      if (avgBrightness > 135) {
        setLightingQuality('perfect');
      } else if (avgBrightness > 100) {
        setLightingQuality('good');
      } else {
        setLightingQuality('low');
      }
    } catch (e) {}
  };

  // Cálculo de temblor (Jittering) de landmarks
  const analyzeStability = (hand) => {
    if (!lastLandmarksRef.current) {
      lastLandmarksRef.current = hand;
      return;
    }

    const prev = lastLandmarksRef.current;
    let totalDist = 0;

    // Calcular desplazamiento euclidiano promedio de todos los joints
    for (let i = 0; i < hand.length; i++) {
      const dx = hand[i].x - prev[i].x;
      const dy = hand[i].y - prev[i].y;
      const dz = hand[i].z - prev[i].z;
      totalDist += Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    const avgShift = totalDist / hand.length;
    jitterHistoryRef.current.push(avgShift);

    // Mantener ventana móvil de 15 frames
    if (jitterHistoryRef.current.length > 15) {
      jitterHistoryRef.current.shift();
    }

    const sumJitter = jitterHistoryRef.current.reduce((a, b) => a + b, 0);
    const avgJitter = sumJitter / jitterHistoryRef.current.length;

    // Umbral de estabilidad (menor a 0.015 en coordenadas normalizadas es estable)
    if (avgJitter < 0.015) {
      setStabilityQuality('stable');
    } else {
      setStabilityQuality('low');
    }

    lastLandmarksRef.current = hand;
  };

  // Dibujar Conexiones y Nodos de la Mano
  const drawSkeleton = (ctx, hand) => {
    // Definición de conexiones de la mano de MediaPipe
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Pulgar
      [0, 5], [5, 6], [6, 7], [7, 8],       // Índice
      [5, 9], [9, 10], [10, 11], [11, 12],  // Medio
      [9, 13], [13, 14], [14, 15], [15, 16],// Anular
      [13, 17], [17, 18], [18, 19], [19, 20],// Meñique
      [0, 17]                               // Palma base
    ];

    // Dibujar conexiones en color Neón Violeta
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#aa3bff';

    connections.forEach(([from, to]) => {
      const ptFrom = hand[from];
      const ptTo = hand[to];
      ctx.beginPath();
      ctx.moveTo(ptFrom.x * ctx.canvas.width, ptFrom.y * ctx.canvas.height);
      ctx.lineTo(ptTo.x * ctx.canvas.width, ptTo.y * ctx.canvas.height);
      ctx.stroke();
    });

    // Dibujar articulaciones (puntos clave)
    ctx.shadowBlur = 0; // Desactivar glow para velocidad en círculos
    ctx.fillStyle = '#f3f4f6';
    hand.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  if (loadingModel) {
    return (
      <div className="w-full aspect-video bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-brand-purple-light" size={32} />
        <span className="text-xs font-semibold uppercase tracking-wider">Cargando Motores de IA en Local...</span>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="w-full aspect-video bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-red-400 gap-3 p-6 text-center">
        <CameraOff size={32} />
        <span className="text-sm font-semibold">{modelError}</span>
        <button 
          onClick={startCamera} 
          className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white border border-slate-700/60 cursor-pointer"
        >
          Reintentar Cámara
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 shadow-2xl">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
