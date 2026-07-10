import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Inicializar estado (por ejemplo, al recargar la página)
  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const savedUser = localStorage.getItem('lessa_user');
      if (savedUser) {
        set({ user: JSON.parse(savedUser), isAuthenticated: true });
      }
    } catch (err) {
      localStorage.removeItem('lessa_user');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    set({ loading: true, error: null });
    const isGas = api.defaults.baseURL.includes('script.google.com');
    try {
      let response;
      if (isGas) {
        // En Apps Script enviamos action: "LOGIN" por POST
        response = await api.post('', {
          action: 'LOGIN',
          email,
          password
        });
        
        // Mapear respuesta de GAS
        if (response.data && response.data.success) {
          const { token, role, name } = response.data.data;
          const userData = { email, role, name: name || email.split('@')[0] };
          
          localStorage.setItem('lessa_user', JSON.stringify(userData));
          set({ user: userData, isAuthenticated: true, error: null });
          return userData;
        } else {
          const msg = response.data?.message || 'Credenciales incorrectas.';
          set({ error: msg, isAuthenticated: false });
          throw new Error(msg);
        }
      } else {
        // API FastAPI estándar
        response = await api.post('/api/v1/auth/login', { email, password });
        const { token, role, name } = response.data;
        const userData = { email, role, name: name || email.split('@')[0] };
        
        localStorage.setItem('lessa_user', JSON.stringify(userData));
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        set({ user: userData, isAuthenticated: true, error: null });
        return userData;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error de conexión con el servidor.';
      set({ error: errorMsg, isAuthenticated: false });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Cerrar sesión
  logout: async () => {
    set({ loading: true });
    const isGas = api.defaults.baseURL.includes('script.google.com');
    try {
      if (!isGas) {
        await api.post('/api/v1/auth/logout').catch(() => {});
      }
    } finally {
      localStorage.removeItem('lessa_user');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  }
}));
