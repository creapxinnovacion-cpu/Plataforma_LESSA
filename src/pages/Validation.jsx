import React, { useState, useEffect } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import { useAuthStore } from '../store/authStore';
import { Check, X, AlertTriangle, AlertCircle, FileText, ChevronRight, User, Loader2 } from 'lucide-react';

export default function Validation() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [observations, setObservations] = useState('');
  const [rejectReason, setRejectReason] = useState('Mano cortada');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Zustand Store
  const {
    pendingQueue,
    loading,
    fetchPending,
    approveSample,
    rejectSample
  } = useDatasetStore();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchPending();
  }, []);

  // Seleccionar la primera muestra por defecto cuando se carga la lista
  useEffect(() => {
    if (pendingQueue.length > 0 && !selectedItem) {
      setSelectedItem(pendingQueue[0]);
    } else if (pendingQueue.length === 0) {
      setSelectedItem(null);
    }
  }, [pendingQueue]);

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      await approveSample(selectedItem.id, user?.email || 'especialista@lessa.org', observations);
      setObservations('');
      // Seleccionar el siguiente en la cola si queda alguno
      const remaining = pendingQueue.filter(item => item.id !== selectedItem.id);
      setSelectedItem(remaining.length > 0 ? remaining[0] : null);
    } catch (e) {
      alert("Error al aprobar muestra: " + e.message);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    try {
      await rejectSample(selectedItem.id, rejectReason, user?.email || 'especialista@lessa.org', observations);
      setObservations('');
      setShowRejectModal(false);
      // Seleccionar el siguiente en la cola si queda alguno
      const remaining = pendingQueue.filter(item => item.id !== selectedItem.id);
      setSelectedItem(remaining.length > 0 ? remaining[0] : null);
    } catch (e) {
      alert("Error al rechazar muestra: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white">Workspace de Validación Experta</h1>
        <p className="text-slate-400 text-sm mt-1">Revisa y evalúa las muestras multimedia enviadas por colaboradores antes de integrarlas al dataset de producción.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cola de Pendientes (Lateral Izquierda) */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-4 h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Pendientes ({pendingQueue.length})</h2>
          
          {loading && pendingQueue.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin text-brand-purple-light" size={24} />
            </div>
          ) : pendingQueue.length === 0 ? (
            <p className="text-xs text-slate-650 text-center p-8">No hay muestras pendientes de revisión en este momento.</p>
          ) : (
            <div className="space-y-2">
              {pendingQueue.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'bg-brand-purple/10 border-brand-purple/40 text-brand-purple-light'
                      : 'bg-slate-950/40 border-slate-850 text-slate-350 hover:bg-slate-900/40'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">Seña '{item.sign_label}'</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1">Por {item.captured_by}</div>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reproductor de Video y Overlay de Landmarks (Centro) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <>
              <div className="bg-slate-950 border border-slate-850 rounded-2xl aspect-video relative overflow-hidden shadow-2xl flex items-center justify-center">
                {/* Simulador de Video y Esqueleto de Landmarks */}
                <div className="text-center text-slate-650 flex flex-col items-center">
                  <FileText size={48} className="mb-2" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visualizador de Seña '{selectedItem.sign_label}'</p>
                  <p className="text-[10px] text-slate-600 mt-1">Muestra ID: {selectedItem.id}</p>
                </div>
                
                {/* Overlay superior */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 pointer-events-none">
                  <Check size={14} />
                  Landmarks Calculados (Confianza: {selectedItem.estimated_confidence * 100}%)
                </div>
              </div>

              {/* Caja de Comentarios / Observaciones */}
              <div className="space-y-2">
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Observaciones (Opcional)</label>
                <textarea
                  placeholder="Escribe comentarios o notas de validación aquí..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full h-20 px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple-light transition text-xs"
                />
              </div>

              {/* Panel de Decisiones */}
              <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white">¿Aprobar esta muestra?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Al aprobarla, se moverá a /Aprobados y reentrenará la IA.</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-950/25 hover:bg-red-900/20 border border-red-900/40 text-red-200 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="flex-1 sm:flex-none px-6 py-3 bg-emerald-950/30 hover:bg-emerald-900/25 border border-emerald-900/40 text-emerald-250 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Check size={16} />
                    Aprobar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl aspect-video relative flex flex-col items-center justify-center text-slate-500 gap-2">
              <FileText size={32} />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Ninguna muestra seleccionada</p>
            </div>
          )}
        </div>

        {/* Metadatos y Detalles de Calidad (Derecha) */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-850 pb-4">Detalles Técnicos</h2>

          {selectedItem ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Colaborador</span>
                <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                  <User size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-200 font-semibold">{selectedItem.captured_by}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">FPS Promedio</span>
                  <span className="text-sm font-extrabold text-white">{selectedItem.avg_fps} fps</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Tipo de Archivo</span>
                  <span className="text-sm font-extrabold text-white capitalize">{selectedItem.file_type}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850/60 flex items-start gap-2.5 text-amber-250">
                <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="text-xs font-bold block">Revisión Biomecánica:</span>
                  <p className="text-[10px] text-amber-450 mt-1 leading-relaxed">
                    Valida que el contorno y los landmarks cubran completamente los nudillos y las articulaciones de los dedos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-550 italic">Seleccione un elemento de la cola para ver detalles.</p>
          )}
        </div>
      </div>

      {/* Modal de Motivo de Rechazo (TSK-3.2) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Elegir Motivo de Rechazo</h3>
            
            <div className="space-y-2">
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Motivos Comunes</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
              >
                <option value="Mano cortada">Mano cortada (fuera de límites)</option>
                <option value="Mala iluminación">Mala iluminación (muy oscuro/brillante)</option>
                <option value="Seña incorrecta">Seña incorrecta (movimiento erróneo)</option>
                <option value="Bajo contraste de fondo">Bajo contraste de fondo</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-855 justify-end">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject}
                className="px-6 py-2 bg-red-650 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
