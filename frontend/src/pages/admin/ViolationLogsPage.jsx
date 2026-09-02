import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import { fetchViolations } from '../../services/proctorService';

const defaultDemoViolations = [
  {
    id: 'v_1',
    student_id: 'CS-2024-076',
    student_name: 'RakshitaD76',
    violation_type: 'EXTERNAL_DEVICE',
    detected_class: 'External Device / Mobile Phone',
    confidence: 0.94,
    timestamp: '10:24:15 AM',
    severity: 'HIGH RISK',
    risk_weight: 25,
  },
  {
    id: 'v_2',
    student_id: 'CS-2024-076',
    student_name: 'RakshitaD76',
    violation_type: 'BACKGROUND_NOISE',
    detected_class: 'Background Noise / Suspicious Audio',
    confidence: 0.87,
    timestamp: '10:24:50 AM',
    severity: 'MEDIUM RISK',
    risk_weight: 15,
  },
  {
    id: 'v_3',
    student_id: 'CS-2024-076',
    student_name: 'RakshitaD76',
    violation_type: 'MULTIPLE_PERSONS',
    detected_class: 'Multiple Persons Detected',
    confidence: 0.96,
    timestamp: '10:25:05 AM',
    severity: 'HIGH RISK',
    risk_weight: 30,
  },
  {
    id: 'v_4',
    student_id: 'CS-2024-042',
    student_name: 'Sarah Miller',
    violation_type: 'HEAD_MOVEMENT',
    detected_class: 'Abnormal Head Movement',
    confidence: 0.82,
    timestamp: '09:40:12 AM',
    severity: 'LOW RISK',
    risk_weight: 5,
  },
];

const ViolationLogsPage = () => {
  const [violations, setViolations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadViolations = async () => {
      try {
        const data = await fetchViolations();
        if (data && data.length > 0) {
          setViolations(data);
        } else {
          setViolations(defaultDemoViolations);
        }
      } catch (err) {
        setViolations(defaultDemoViolations);
      } finally {
        setLoading(false);
      }
    };

    loadViolations();
  }, []);

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      (v.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.violation_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.detected_class || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === 'ALL' ||
      (v.violation_type || '').includes(selectedClass) ||
      (v.detected_class || '').includes(selectedClass);

    return matchesSearch && matchesClass;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <span>AI Proctoring Violation Logs</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Chronological audit stream of computer vision and audio abnormal activity events
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student ID or violation..."
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-60"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Classes</option>
                <option value="EXTERNAL_DEVICE">External Device</option>
                <option value="MULTIPLE_PERSONS">Multiple Persons</option>
                <option value="HEAD_MOVEMENT">Head Movement</option>
                <option value="TALKING">Talking / Audio</option>
              </select>
            </div>
          </div>

          {/* Violation Table Card */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Student ID & Name</th>
                    <th className="px-6 py-4">Violation Class</th>
                    <th className="px-6 py-4">AI Confidence</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Severity & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        Loading live violation logs...
                      </td>
                    </tr>
                  ) : filteredViolations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No violation log records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredViolations.map((v, idx) => {
                      const type = v.violation_type || v.detected_class || 'Abnormal Activity';
                      const isHigh = type.includes('EXTERNAL_DEVICE') || type.includes('MULTIPLE_PERSONS');
                      const confPct = Math.round((v.confidence || 0.9) * 100);

                      return (
                        <tr key={v.id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-indigo-400 block">
                              {v.student_id || 'CS-2024-076'}
                            </span>
                            <span className="text-xs text-slate-300 font-medium">
                              {v.student_name || 'RakshitaD76'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-semibold text-xs px-2.5 py-1 rounded-lg border ${
                                isHigh
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {v.detected_class || v.violation_type || 'Abnormal Activity'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-200">
                            {confPct}%
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">
                            {v.timestamp ? (v.timestamp.includes('T') ? new Date(v.timestamp).toLocaleTimeString() : v.timestamp) : '10:24:15 AM'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-extrabold text-[11px] px-2.5 py-1 rounded-md uppercase border ${
                                isHigh
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {v.severity || (isHigh ? 'HIGH RISK' : 'MEDIUM RISK')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViolationLogsPage;
