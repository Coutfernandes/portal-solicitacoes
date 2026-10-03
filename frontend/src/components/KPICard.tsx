import React from 'react';

interface KPICardProps {
  titulo: string;
  valor: number;
  corBorda?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ titulo, valor, corBorda = 'border-slate-300' }) => {
  return (
    <div className={`bg-white p-4 rounded-xl border-2 ${corBorda} shadow-sm h-full flex flex-col justify-between overflow-hidden`}>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
        {titulo}
      </span>
      <span className="text-3xl font-extrabold text-slate-800 mt-2 block">
        {valor}
      </span>
    </div>
  );
};