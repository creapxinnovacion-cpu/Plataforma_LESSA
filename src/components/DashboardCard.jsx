import React from 'react';

export default function DashboardCard({ title, value, change, icon: Icon, colorClass }) {
  return (
    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      {change && <p className="text-slate-450 text-xs mt-4 font-medium">{change}</p>}
    </div>
  );
}
