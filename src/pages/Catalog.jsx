import React, { useState } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import { Search, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Alfabeto');

  // Traer catálogo de Zustand
  const catalog = useDatasetStore((state) => state.catalog);

  const categories = ['Alfabeto', 'Números', 'Saludos', 'Verbos', 'Emergencias'];
  
  const filteredSigns = catalog.filter(sign => 
    sign.category === activeTab && 
    sign.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white">Catálogo de Señas LESSA</h1>
        <p className="text-slate-400 text-sm mt-1">Explora las señas catalogadas y visualiza el progreso de recolección de muestras.</p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-850 p-4 rounded-2xl">
        <div className="flex gap-2 shrink-0 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer shrink-0 ${
                activeTab === cat 
                  ? 'bg-brand-purple/10 border-brand-purple/40 text-brand-purple-light' 
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar seña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple-light transition duration-200 text-xs"
          />
        </div>
      </div>

      {/* Grid de Señas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSigns.map((sign, idx) => {
          return (
            <div key={idx} className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/85 transition duration-200 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-base">{sign.label}</h3>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-slate-950/60 border-slate-850 text-slate-400">
                    {sign.category}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-[10px] text-slate-550 block font-semibold uppercase">Aprobadas</span>
                    <span className="text-lg font-extrabold text-slate-350">{sign.approved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-550 block font-semibold uppercase">Pendientes</span>
                    <span className="text-lg font-extrabold text-slate-350">{sign.pending}</span>
                  </div>
                </div>
              </div>

              {/* Barra de Progreso Interna */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                  <span>Progreso</span>
                  <span>{sign.approved}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-purple rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((sign.approved / 25) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
