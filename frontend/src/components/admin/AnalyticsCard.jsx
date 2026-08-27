import React from 'react';

const AnalyticsCard = ({ title, value, icon: Icon, trend, color = 'indigo' }) => {
  const colorStyles = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className="text-3xl font-extrabold text-white mt-1.5">{value}</div>
        {trend && <span className="text-[11px] text-slate-500 mt-1 block">{trend}</span>}
      </div>
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center ${
          colorStyles[color] || colorStyles.indigo
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default AnalyticsCard;
