import React, { useState, useEffect } from 'react';
import { ShieldAlert, Eye, AlertOctagon, User, Radio, RefreshCw } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ViolationTable from '../../components/admin/ViolationTable';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchViolations } from '../../services/proctorService';

const ActiveMonitoring = () => {
  const [violations, setViolations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const activeCandidates = [
    { id: '1', name: 'RakshitaD76', student_id: 'CS-2024-076', exam: 'Test 2: Machine Learning Fundamentals', warnings: 3, status: 'FLAGGED' },
    { id: '2', name: 'Alex Johnson', student_id: 'CS-2024-001', exam: 'Test 1: Computer Vision & OpenCV', warnings: 1, status: 'SUSPICIOUS' },
    { id: '3', name: 'Sarah Miller', student_id: 'CS-2024-042', exam: 'Test 3: Deep Learning & CNN', warnings: 0, status: 'NORMAL' },
  ];

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await fetchViolations();
      if (data && data.length > 0) {
        setViolations(data);
      }
    } catch (err) {
      console.warn('Backend fallback for live violation streaming');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
                <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
                <span>Live Proctoring Invigilation Room</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time webcam feed telemetry, multi-candidate surveillance and automatic violation logging
              </p>
            </div>

            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Active Candidates Feed Grid */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Candidate Sessions ({activeCandidates.length} Online)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className={`glass-card rounded-2xl p-4 border transition-all ${
                    cand.status === 'FLAGGED'
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : cand.status === 'SUSPICIOUS'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-indigo-400">{cand.student_id}</span>
                    <StatusBadge status={cand.status} />
                  </div>

                  {/* Simulated Stream Box */}
                  <div className="w-full aspect-video bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden mb-3">
                    <User className="w-12 h-12 text-slate-700" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-300">
                      LIVE STREAM
                    </div>
                    {cand.warnings > 0 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                        {cand.warnings} Warning(s)
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">{cand.name}</h4>
                    <p className="text-xs text-slate-400">{cand.exam}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Violation Table */}
          <div id="violations">
            <ViolationTable violations={violations} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActiveMonitoring;
