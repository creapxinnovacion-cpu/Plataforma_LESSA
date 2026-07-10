import { create } from 'zustand';
import api from '../services/api';

export const useDatasetStore = create((set, get) => ({
  catalog: [
    { label: 'Letra A', category: 'Alfabeto', approved: 25, pending: 2, status: 'complete' },
    { label: 'Letra B', category: 'Alfabeto', approved: 18, pending: 5, status: 'progress' },
    { label: 'Letra C', category: 'Alfabeto', approved: 30, pending: 0, status: 'complete' },
    { label: 'Letra CH', category: 'Alfabeto', approved: 12, pending: 8, status: 'progress' },
    { label: 'Número 1', category: 'Números', approved: 22, pending: 1, status: 'complete' },
    { label: 'Número 2', category: 'Números', approved: 5, pending: 15, status: 'need-samples' },
    { label: 'Hola', category: 'Saludos', approved: 40, pending: 3, status: 'complete' },
    { label: 'Gracias', category: 'Saludos', approved: 2, pending: 1, status: 'need-samples' },
    { label: 'Policía', category: 'Emergencias', approved: 0, pending: 4, status: 'need-samples' },
    { label: 'Ayuda', category: 'Emergencias', approved: 1, pending: 0, status: 'need-samples' },
  ],
  pendingQueue: [],
  validationsHistory: [],
  stats: {
    totalSigns: 120,
    totalImages: 0,
    approvedSamples: 0,
    pendingSamples: 0,
    rejectedSamples: 0
  },
  loading: false,
  error: null,

  // Helper para verificar si es Google Apps Script
  _isGas: () => {
    const baseURL = api.defaults.baseURL || '';
    return baseURL.includes('script.google.com');
  },

  // Cargar estadísticas generales de la API
  fetchStats: async () => {
    set({ loading: true, error: null });
    const isGas = get()._isGas();
    try {
      let response;
      if (isGas) {
        response = await api.get('', { params: { action: 'STATS' } });
        // Mapear respuesta de GAS
        if (response.data && response.data.success) {
          const gasStats = response.data.data;
          set({
            stats: {
              totalSigns: 120,
              totalImages: (gasStats.Total_Aprobados || 0) + (gasStats.Total_Pendientes || 0),
              approvedSamples: gasStats.Total_Aprobados || 0,
              pendingSamples: gasStats.Total_Pendientes || 0,
              rejectedSamples: gasStats.Total_Rechazados || 0
            },
            error: null
          });
          return;
        }
      } else {
        response = await api.get('/api/v1/dashboard/stats');
        set({ stats: response.data, error: null });
      }
    } catch (err) {
      console.warn("Fallo fetchStats API, usando mock:", err);
      // Fallback local en caso de error de conexión
      set({ error: null });
    } finally {
      set({ loading: false });
    }
  },

  // Cargar cola de elementos pendientes de validación
  fetchPending: async () => {
    set({ loading: true, error: null });
    const isGas = get()._isGas();
    try {
      let response;
      if (isGas) {
        response = await api.get('', { params: { action: 'PENDING' } });
        if (response.data && response.data.success) {
          // Aplanar metadatos si vienen de GAS
          const gasList = response.data.data.map(item => ({
            id: item.id,
            sign_label: item.seña || item.sena || 'A',
            category: item.categoria || 'Alfabeto',
            file_type: 'video',
            captured_by: item.usuario || 'Colaborador',
            captured_at: item.fecha,
            avg_fps: item.fps || 30.0,
            estimated_confidence: 0.95
          }));
          set({ pendingQueue: gasList, error: null });
          return;
        }
      } else {
        response = await api.get('/api/v1/validation/pending');
        set({ pendingQueue: response.data, error: null });
      }
    } catch (err) {
      console.warn("Fallo fetchPending API, usando mock:", err);
      // Mock fallback local en caso de error
      set({
        pendingQueue: [
          { id: 'f8d29837-84bc-498c', sign_label: 'A', category: 'Alfabeto', file_type: 'video', captured_by: 'Criss_Colab', captured_at: '2026-07-09T22:30:15', avg_fps: 29.5, estimated_confidence: 0.98 },
          { id: 'c9038ba3-34ea-12ab', sign_label: 'B', category: 'Alfabeto', file_type: 'video', captured_by: 'Ale_Colab', captured_at: '2026-07-09T22:45:00', avg_fps: 28.0, estimated_confidence: 0.92 }
        ],
        error: null
      });
    } finally {
      set({ loading: false });
    }
  },

  // Aprobar muestra
  approveSample: async (id, validator, observations) => {
    set({ loading: true, error: null });
    const isGas = get()._isGas();
    try {
      if (isGas) {
        await api.post('', {
          action: 'APPROVE',
          id: id,
          validated_by: validator,
          observaciones: observations
        });
      } else {
        await api.patch(`/api/v1/validation/${id}`, {
          status: 'approved',
          validated_by: validator,
          observaciones: observations
        });
      }

      // Remover de la cola local
      set((state) => ({
        pendingQueue: state.pendingQueue.filter(item => item.id !== id),
        stats: {
          ...state.stats,
          approvedSamples: state.stats.approvedSamples + 1,
          pendingSamples: Math.max(state.stats.pendingSamples - 1, 0)
        }
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Rechazar muestra
  rejectSample: async (id, reason, validator, observations) => {
    set({ loading: true, error: null });
    const isGas = get()._isGas();
    try {
      if (isGas) {
        await api.post('', {
          action: 'REJECT',
          id: id,
          motivo: reason,
          validated_by: validator,
          observaciones: observations
        });
      } else {
        await api.patch(`/api/v1/validation/${id}`, {
          status: 'rejected',
          motivo: reason,
          validated_by: validator,
          observaciones: observations
        });
      }

      // Remover de la cola local
      set((state) => ({
        pendingQueue: state.pendingQueue.filter(item => item.id !== id),
        stats: {
          ...state.stats,
          pendingSamples: Math.max(state.stats.pendingSamples - 1, 0)
        }
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Crear usuario (Panel de Administrador)
  createNewUser: async (email, password, name, role) => {
    set({ loading: true, error: null });
    const isGas = get()._isGas();
    try {
      if (isGas) {
        await api.post('', {
          action: 'CREATE_USER',
          email,
          password,
          nombre: name,
          rol: role
        });
      } else {
        await api.post('/api/v1/auth/users', {
          email,
          password,
          name,
          role
        });
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  }
}));
