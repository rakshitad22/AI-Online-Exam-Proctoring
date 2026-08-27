import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { AlertTriangle, Clock, User } from 'lucide-react';

const ViolationTable = ({ violations = [] }) => {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Timestamped Violation Logs</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total Recorded: {violations.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Student ID</th>
              <th className="px-6 py-3.5">Violation Class</th>
              <th className="px-6 py-3.5">AI Confidence</th>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {violations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  No abnormal activity violations recorded yet.
                </td>
              </tr>
            ) : (
              violations.map((v, idx) => (
                <tr key={v.id || idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                    {v.student_id || 'std_demo_01'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {v.violation_type || v.type}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                    {((v.confidence || 0.9) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {v.timestamp
                        ? new Date(v.timestamp).toLocaleTimeString()
                        : new Date().toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={v.violation_type || v.type} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationTable;
