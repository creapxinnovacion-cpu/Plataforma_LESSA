import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      // Redireccionar según el rol
      if (user.role === 'colaborador') {
        navigate('/capture');
      } else if (user.role === 'especialista') {
        navigate('/validation');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      // Manejado en el authStore
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080b11] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(170,59,255,0.08)_0%,transparent_65%)] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">LESSA IA</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Plataforma de Captura y Banco de Datos Inteligente</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-950/40 border border-red-900/60 text-red-200 px-4 py-3.5 rounded-xl text-sm animate-pulse">
            <ShieldAlert size={18} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple-light transition duration-250 text-sm"
                {...register('email', { 
                  required: 'El correo electrónico es requerido', 
                  pattern: { value: /^\S+@\S+$/i, message: 'Dirección de correo inválida' } 
                })}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Key size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple-light transition duration-250 text-sm"
                {...register('password', { 
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' }
                })}
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-purple hover:bg-purple-600 active:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-slate-500 text-xs">
            Desarrollado para la Lengua de Señas Salvadoreña (LESSA) v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
