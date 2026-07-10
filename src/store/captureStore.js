import { create } from 'zustand';

export const useCaptureStore = create((set) => ({
  activeSign: 'A', // Seña seleccionada por defecto
  activeCategory: 'Alfabeto',
  calibrationStep: 'idle', // 'idle' | 'aligning' | 'recording' | 'completed'
  handDetected: false,
  handCentered: false,
  lightingQuality: 'low', // 'low' | 'good' | 'perfect'
  stabilityQuality: 'low', // 'low' | 'stable'
  capturedSamples: [], // Buffer local de muestras temporales (máximo 10)
  fps: 0,

  setActiveSign: (sign, category) => set({ activeSign: sign, activeCategory: category || 'Alfabeto' }),
  setCalibrationStep: (step) => set({ calibrationStep: step }),
  setHandDetected: (detected) => set({ handDetected: detected }),
  setHandCentered: (centered) => set({ handCentered: centered }),
  setLightingQuality: (quality) => set({ lightingQuality: quality }),
  setStabilityQuality: (quality) => set({ stabilityQuality: quality }),
  setFps: (fpsValue) => set({ fps: fpsValue }),
  
  addSample: (sample) => set((state) => {
    const updated = [...state.capturedSamples, sample];
    return { 
      capturedSamples: updated,
      // Si llegamos a 10 muestras, marcar el sprint de calibración como completado
      calibrationStep: updated.length >= 10 ? 'completed' : state.calibrationStep
    };
  }),
  
  clearSamples: () => set({ capturedSamples: [], calibrationStep: 'idle' }),
  resetStore: () => set({
    calibrationStep: 'idle',
    handDetected: false,
    handCentered: false,
    lightingQuality: 'low',
    stabilityQuality: 'low',
    capturedSamples: [],
    fps: 0
  })
}));
