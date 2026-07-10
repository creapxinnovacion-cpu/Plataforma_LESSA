import React from 'react';
import { CloudLightning, Check, AlertCircle } from 'lucide-react';

export default function UploadProgress({ progress, status, error }) {
  if (status === 'idle') return null;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {status === 'uploading' && <span className="w-4 h-4 border-2 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />}
          {status === 'success' && <Check size={18} className="text-emerald-400" />}
          {status === 'error' && <AlertCircle size={18} className="text-red-400" />}
          <span className="text-xs font-bold text-white">
            {status === 'uploading' && 'Subiendo muestras al Banco de Datos...'}
            {status === 'success' && '¡Muestras cargadas con éxito!'}
            {status === 'error' && 'Error al subir las muestras.'}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-400">{progress}%</span>
      </div>

      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            status === 'error' ? 'bg-red-500' : 'bg-brand-purple'
          }`} 
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-400 leading-normal bg-red-950/20 border border-red-900/30 p-2.5 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}
