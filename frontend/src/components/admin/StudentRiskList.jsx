import React from 'react';
import { AlertOctagon, CheckCircle, ShieldAlert } from 'lucide-react';

const StudentRiskList = ({ students = [] }) => {
  // Default mock list if no DB data yet
  const defaultList = [
    { id: '1', name: 'Alex Johnson', student_id: 'CS-2024-001', risk_score: 0.85, status: 'FLAGGED' },
    { id: '2', name: 'Sarah Miller', student_id: 'CS-2024-042', risk_score: 0.15, status: 'CLEAR' },
    { id: '3', name: 'David Chen', student_id: 'CS-2024-089', risk_score: 0.65, status: 'SUSPICIOUS' },
  ];

  const list = students.length > 0 ? students : defaultList;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span>Student Risk & Suspicion Index</span>
        </h3>
        <span className="text-xs text-slate-400">Live AI Scoring</span>
      </div>

      <div className="space-y-3">
        {list.map((std) => {
          const isHighRisk = std.risk_score > 0.6;
          return (
            <div
              key={std.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <h4 className="font-semibold text-sm text-slate-200">{std.name || std.student_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{std.student_id}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-xs font-bold block text-slate-300">
                    Risk Score: {(std.risk_score * 100).toFixed(0)}%
                  </span>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${std.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`p-2 rounded-xl text-xs font-extrabold ${
                    isHighRisk
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isHighRisk ? 'HIGH RISK' : 'CLEARED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentRiskList;
