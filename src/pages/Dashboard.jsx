import React, { useEffect, useState } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import { useAuthStore } from '../store/authStore';
import DashboardCard from '../components/DashboardCard';
import { Database, Image, CheckCircle2, AlertTriangle, Cpu, UserPlus, ShieldAlert, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function Dashboard() {
  const { stats, fetchStats, createNewUser, loading: loadingStore, error: storeError } = useDatasetStore();
  const user = useAuthStore((state) => state.user);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [userCreationSuccess, setUserCreationSuccess] = useState(false);
  const [userCreationError, setUserCreationError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateUser = async (data) => {
    setUserCreationSuccess(false);
    setUserCreationError(null);
    try {
      await createNewUser(data.email, data.password, data.name, data.role);
      setUserCreationSuccess(true);
      reset(); // Limpiar campos del formulario
      fetchStats(); // Actualizar contador de usuarios
    } catch (err) {
      setUserCreationError(err.message || 'Error al crear el usuario.');
    }
  };

  const cards = [
    { title: 'Señas Catalogadas', value: stats.totalSigns ?? 0, change: '100% categorizadas', icon: Database, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { title: 'Imágenes Recolectadas', value: stats.totalImages ?? 0, change: 'Muestras cargadas', icon: Image, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { title: 'Muestras Aprobadas', value: stats.approvedSamples ?? 0, change: 'Muestras aceptadas', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Pendientes de Revisión', value: stats.pendingSamples ?? 0, change: 'Revisión por especialista', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  const isAdmin = user?.role === 'administrador';

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Analítico</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitoreo general de capturas y rendimiento del modelo de Inteligencia Artificial.
          {isAdmin && <span className="text-brand-purple-light font-semibold"> (Vista de Administrador)</span>}
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <DashboardCard
            key={idx}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            colorClass={card.color}
          />
        ))}
      </div>

      {/* Grid de Estado de Red Neuronal y Controles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado del Modelo de IA */}
        <div className={`bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 ${
          isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Estado de la Red Neuronal (MLP Classifier)</h2>
              <p className="text-slate-500 text-xs">Métricas del último entrenamiento de producción.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-500 font-medium">Precisión Global (Accuracy)</span>
              <p className="text-2xl font-bold text-brand-purple-light mt-1">100.0%</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-500 font-medium">F1-Score Ponderado</span>
              <p className="text-2xl font-bold text-brand-purple-light mt-1">1.0000</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-550 font-medium">Última Versión</span>
              <p className="text-2xl font-bold text-brand-purple-light mt-1">lessa_mlp_best.keras</p>
            </div>
          </div>

          <div className="bg-slate-950/20 border border-slate-850/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Matriz de Confusión Resumida</h4>
            <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
              [Visualización de Matriz de Confusión - 100% de coincidencia diagonal en validación]
            </div>
          </div>
        </div>

        {/* Panel de Gestión de Usuarios para el Administrador (TSK-4.1) */}
        {isAdmin && (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2.5 border-b border-slate-850 pb-4 mb-4">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Gestión de Usuarios</h2>
                  <p className="text-slate-500 text-[10px]">Crea nuevas cuentas de colaboradores o especialistas.</p>
                </div>
              </div>

              {/* Mensajes de Alerta */}
              {userCreationSuccess && (
                <div className="mb-4 flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 p-3 rounded-xl text-xs">
                  <Check size={14} />
                  <span>Usuario creado exitosamente.</span>
                </div>
              )}
              {userCreationError && (
                <div className="mb-4 flex items-center gap-2 bg-red-950/40 border border-red-900/60 text-red-300 p-3 rounded-xl text-xs">
                  <ShieldAlert size={14} />
                  <span>{userCreationError}</span>
                </div>
              )}

              {/* Formulario de creación de usuario */}
              <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder:text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple-light"
                    {...register('name', { required: 'El nombre es requerido' })}
                  />
                  {errors.name && <p className="text-red-400 text-[9px] mt-1 font-medium">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="colaborador@lessa.org"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder:text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple-light"
                    {...register('email', { required: 'El correo es requerido' })}
                  />
                  {errors.email && <p className="text-red-400 text-[9px] mt-1 font-medium">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder:text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple-light"
                    {...register('password', { required: 'La contraseña es requerida' })}
                  />
                  {errors.password && <p className="text-red-400 text-[9px] mt-1 font-medium">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Rol de Usuario</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
                    {...register('role')}
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="especialista">Especialista (Validador)</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loadingStore}
                  className="w-full py-3 bg-brand-purple hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loadingStore ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Registrar Usuario</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
