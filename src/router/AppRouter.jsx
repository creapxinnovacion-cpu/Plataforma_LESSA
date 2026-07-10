import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Páginas
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Capture from '../pages/Capture';
import Catalog from '../pages/Catalog';
import Validation from '../pages/Validation';
import History from '../pages/History';
import Profile from '../pages/Profile';

// Guardián de Rutas Autenticadas y Gating de Roles
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#080b11] text-[#f3f4f6]">
        <span className="w-8 h-8 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Cargando perfil...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Si no está autorizado para este rol, redirigir a su dashboard por defecto
    if (user.role === 'especialista') {
      return <Navigate to="/validation" replace />;
    }
    return <Navigate to="/capture" replace />;
  }

  return children;
}

export default function AppRouter() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas bajo Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard General accesible por todos */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Rutas exclusivas del Colaborador */}
          <Route 
            path="capture" 
            element={
              <ProtectedRoute allowedRoles={['colaborador', 'administrador']}>
                <Capture />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="history" 
            element={
              <ProtectedRoute allowedRoles={['colaborador', 'administrador']}>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute allowedRoles={['colaborador', 'administrador']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Ruta del Catálogo accesible por todos */}
          <Route path="catalog" element={<Catalog />} />

          {/* Ruta de Validación exclusiva del Especialista */}
          <Route 
            path="validation" 
            element={
              <ProtectedRoute allowedRoles={['especialista', 'administrador']}>
                <Validation />
              </ProtectedRoute>
            } 
          />

          {/* Redirección por defecto */}
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
