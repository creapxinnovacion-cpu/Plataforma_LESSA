import React from 'react';
import { Eye, FileCheck, Trash2 } from 'lucide-react';

export default function ImagePreview({ sample, onRemove }) {
  if (!sample) return null;

  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-brand-purple-light overflow-hidden">
          {sample.thumbnailUrl ? (
            <img src={sample.thumbnailUrl} alt="Miniatura" className="w-full h-full object-cover" />
          ) : (
            <Eye size={18} />
          )}
        </div>
        <div>
          <span className="text-xs font-bold text-white block">Muestra #{sample.idx}</span>
          <span className="text-[10px] text-slate-500 block">Luz: {sample.quality?.lighting || 'buena'} • Estabilidad: {sample.quality?.stability || 'estable'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-900/40 bg-emerald-950/20 flex items-center gap-1">
          <FileCheck size={10} />
          Lista
        </span>
        {onRemove && (
          <button 
            onClick={onRemove}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg transition cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
