import React from 'react';
import { Award, Shield, User, ThumbsUp, Star } from 'lucide-react';

export default function Profile() {
  const userStats = {
    name: 'Cristian Alejandro',
    role: 'Colaborador',
    memberSince: 'Julio 2026',
    contributions: 42,
    approvalRate: '88%',
    level: 3,
    points: 340,
    nextLevelPoints: 500,
  };

  const badges = [
    { title: 'Primer Envío', desc: 'Subió su primera muestra al banco de datos.', icon: Award, unlocked: true },
    { title: 'Calidad Impecable', desc: '10 aprobaciones consecutivas sin rechazos.', icon: Star, unlocked: true },
    { title: 'Veterano LESSA', desc: 'Aportó más de 100 muestras verificadas.', icon: Shield, unlocked: false },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white">Perfil de Colaborador</h1>
        <p className="text-slate-400 text-sm mt-1">Administra tus logros, puntos e insignias de colaboración.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Perfil Principal */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light rounded-full flex items-center justify-center">
            <User size={48} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">{userStats.name}</h2>
            <p className="text-xs text-brand-purple-light font-bold uppercase tracking-wider mt-1">{userStats.role}</p>
            <p className="text-[10px] text-slate-500 mt-2">Miembro desde {userStats.memberSince}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-850/60 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Contribuciones</span>
              <span className="text-lg font-extrabold text-white mt-1 block">{userStats.contributions}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Aprobación</span>
              <span className="text-lg font-extrabold text-white mt-1 block">{userStats.approvalRate}</span>
            </div>
          </div>
        </div>

        {/* Nivel y Gamificación */}
        <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-850 pb-4">Nivel de Colaboración</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase">Nivel Actual</span>
                <p className="text-2xl font-black text-brand-purple-light mt-0.5">Nivel {userStats.level}</p>
              </div>
              <span className="text-xs text-slate-400 font-bold">{userStats.points} / {userStats.nextLevelPoints} pts</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-purple rounded-full transition-all duration-500" 
                style={{ width: `${(userStats.points / userStats.nextLevelPoints) * 100}%` }}
              />
            </div>
          </div>

          {/* Insignias e Logros */}
          <div className="pt-6 border-t border-slate-850/60">
            <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-4">Insignias Obtenidas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={idx} 
                    className={`p-4 border rounded-xl flex flex-col items-center text-center space-y-2 ${
                      badge.unlocked 
                        ? 'bg-slate-950/40 border-slate-850 text-white' 
                        : 'bg-slate-950/10 border-slate-900/40 text-slate-600'
                    }`}
                  >
                    <Icon size={24} className={badge.unlocked ? 'text-brand-purple-light' : 'text-slate-700'} />
                    <span className="text-xs font-bold block">{badge.title}</span>
                    <span className="text-[10px] text-slate-500 leading-normal">{badge.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
