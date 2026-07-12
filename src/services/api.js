import axios from 'axios';

// Cargar URL del backend desde variable de entorno de Vite o usar fallback local de FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Apps Script no soporta cookies HttpOnly cross-origin estándar
  headers: {
    // Evitamos configurar Content-Type por defecto para prevenir fallas de CORS preflight (OPTIONS) en Apps Script
  },
});

// Interceptor para agregar headers cuando se usa FastAPI local o en Render
api.interceptors.request.use(
  (config) => {
    const isGas = config.baseURL.includes('script.google.com');
    if (!isGas) {
      config.headers['Content-Type'] = 'application/json';
      config.withCredentials = true;
      const userStr = localStorage.getItem('lessa_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
          }
        } catch (e) { }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar fallas de sesión en FastAPI
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isGas = error.config?.baseURL?.includes('script.google.com');
    if (!isGas && error.response && error.response.status === 401) {
      localStorage.removeItem('lessa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
