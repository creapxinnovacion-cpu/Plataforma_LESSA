import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function History() {
  const contributions = [
    { id: '1', sign_label: 'A', date: '2026-07-09', status: 'approved', notes: 'Excelente iluminación y contraste.' },
    { id: '2', sign_label: 'B', date: '2026-07-08', status: 'rejected', notes: 'Mano recortada por los bordes.' },
    { id: '3', sign_label: 'C', date: '2026-07-08', status: 'approved', notes: 'Forma correcta.' },
    { id: '4', sign_label: 'CH', date: '2026-07-07', status: 'pending', notes: null },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white">Historial de Contribuciones</h1>
        <p className="text-slate-400 text-sm mt-1">Revisa el estado de todas tus muestras subidas y lee la retroalimentación de los especialistas.</p>
      </div>

      {/* Listado de Contribuciones */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-950/20">
              <th className="p-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Seña</th>
              <th className="p-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Fecha de Envío</th>
              <th className="p-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Estado</th>
              <th className="p-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60">
            {contributions.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                <td className="p-4">
                  <span className="font-extrabold text-white text-sm">Seña '{item.sign_label}'</span>
                </td>
                <td className="p-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <span>{item.date}</span>
                  </div>
                </td>
                <td className="p-4">
                  {item.status === 'approved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 size={12} />
                      Aprobado
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      <XCircle size={12} />
                      Rechazado
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Clock size={12} />
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs text-slate-400 italic">
                  {item.notes || 'Ninguna.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
