import React from 'react';

interface KPICardProps {
  titulo: string;
  valor: number;
  corBorda: string;
}

export const KPICard: React.FC<KPICardProps> = ({ titulo, valor, corBorda }) => {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${corBorda} border-t border-r border-b border-slate-200`}>
      <p className="text-xs font-medium text-slate-500 uppercase">{titulo}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{valor}</p>
    </div>
  );
};