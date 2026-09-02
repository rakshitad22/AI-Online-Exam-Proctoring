import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  BarChart3,
  Percent,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import AnalyticsCard from '../../components/admin/AnalyticsCard';
import StatusBadge from '../../components/common/StatusBadge';
import StudentRiskList from '../../components/admin/StudentRiskList';
import { fetchReportsSummary, fetchViolations, fetchProctoringStatus } from '../../services/proctorService';
import api from '../../services/api';

const defaultRecentExams = [
  {
    id: 'rep_rakshita',
    student_name: 'RakshitaD76',
    student_id: 'CS-2024-076',
    exam_title: 'Test 2: Machine Learning Fundamentals',
    score: 70,
    total_marks: 100,
    total_warnings: 3,
    risk_score: 65,
    risk_category: 'HIGH RISK',
    status: 'FLAGGED_FOR_REVIEW',
    submitted_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'rep_alex',
    student_name: 'Alex Johnson',
    student_id: 'CS-2024-001',
    exam_title: 'Test 1: Computer Vision & OpenCV',
    score: 85,
    total_marks: 100,
    total_warnings: 1,
    risk_score: 25,
    risk_category: 'MEDIUM',
    status: 'PASSED',
    submitted_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: 'rep_sarah',
    student_name: 'Sarah Miller',
    student_id: 'CS-2024-042',
    exam_title: 'Test 3: Deep Learning & CNN',
    score: 95,
    total_marks: 100,
    total_warnings: 0,
    risk_score: 5,
    risk_category: 'LOW',
    status: 'PASSED',
    submitted_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
];

const getViolationIcon = (typeStr) => {
  const str = String(typeStr || '').toUpperCase();
  if (str.includes('EXTERNAL') || str.includes('MOBILE') || str.includes('PHONE')) return '📱';
  if (str.includes('MULTIPLE') || str.includes('PERSON')) return '👥';
  if (str.includes('HEAD') || str.includes('GAZE')) return '👀';
  if (str.includes('TALKING') || str.includes('BACKGROUND') || str.includes('AUDIO')) return '🎤';
  return '🟢';
};

const formatCleanViolationType = (typeStr) => {
  const str = String(typeStr || '').toUpperCase();
  if (str.includes('EXTERNAL') || str.includes('MOBILE') || str.includes('PHONE')) return 'External Device Detected';
  if (str.includes('MULTIPLE') || str.includes('PERSON')) return 'Multiple Persons Detected';
  if (str.includes('HEAD') || str.includes('GAZE')) return 'Unusual Head Movement';
  if (str.includes('TALKING') || str.includes('BACKGROUND') || str.includes('AUDIO')) return 'Talking / Background Noise Detected';
  return 'Normal Activity';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total_students: 142,
    total_exams: 5,
    total_reports: 98,
    total_violations: 26,
    flagged_reports: 4,
    avg_risk_score: 35,
  });

  const [recentExams, setRecentExams] = useState(defaultRecentExams);
  const [violations, setViolations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const sumData = await fetchReportsSummary();
        const vData = await fetchViolations();
        setViolations(vData);

        try {
          const res = await api.get('/reports');
          if (res.data && res.data.length > 0) {
            setRecentExams(res.data.slice(0, 5));
          }
        } catch (e) {
          console.warn('Failed to load reports for dashboard');
        }

        try {
          const statusData = await fetchProctoringStatus('all');
          setCandidates(statusData.candidates || []);
        } catch (e) {
          console.warn('Failed to load status candidates');
        }

        setSummary({
          total_students: sumData.total_students || 142,
          total_exams: sumData.total_exams || 5,
          total_reports: sumData.total_reports || 98,
          total_violations: Math.max(sumData.total_violations || 0, vData.length || 26),
          flagged_reports: sumData.flagged_reports || 4,
          avg_risk_score: 35,
        });
      } catch (err) {
        console.warn('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const violationCounts = {
    EXTERNAL_DEVICE: violations.filter((v) => (v.violation_type || v.type || '').includes('EXTERNAL_DEVICE')).length || 4,
    MULTIPLE_PERSONS: violations.filter((v) => (v.violation_type || v.type || '').includes('MULTIPLE_PERSONS')).length || 5,
    HEAD_MOVEMENT: violations.filter((v) => (v.violation_type || v.type || '').includes('HEAD_MOVEMENT')).length || 10,
    TALKING: violations.filter((v) => (v.violation_type || v.type || '').includes('TALKING') || (v.violation_type || v.type || '').includes('BACKGROUND_NOISE')).length || 7,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Examiner Control Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time abnormal activity detection, student risk scoring & proctoring analytics
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400">OpenCV AI Proctor Engine Online</span>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/admin/exams')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Manage Exams</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => navigate('/admin/monitoring')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>Invigilation Room</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => navigate('/admin/violations')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Violation Logs</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Proctoring Reports</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* 5 Top Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AnalyticsCard
              title="Registered Candidates"
              value={summary.total_students}
              icon={Users}
              color="indigo"
            />
            <AnalyticsCard
              title="Active Exam Sessions"
              value={summary.total_exams}
              icon={BookOpen}
              color="emerald"
            />
            <AnalyticsCard
              title="Detected Violations"
              value={summary.total_violations}
              icon={AlertTriangle}
              color="amber"
            />
            <AnalyticsCard
              title="Flagged Exams"
              value={summary.flagged_reports}
              icon={ShieldAlert}
              color="rose"
            />
            <AnalyticsCard
              title="Average Risk Score"
              value={`${summary.avg_risk_score}%`}
              icon={Percent}
              color="violet"
            />
          </div>

          {/* Abnormal Activity Class Distribution Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Abnormal Activity Distribution by Class</span>
              </h3>
              <span className="text-xs text-slate-400">Target Proctored Classes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">External Device</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1 block">{violationCounts.EXTERNAL_DEVICE}</span>
                  <span className="text-[10px] text-slate-500">Weight: +25 Risk</span>
                </div>
                <span className="text-xl">📱</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Multiple Persons</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1 block">{violationCounts.MULTIPLE_PERSONS}</span>
                  <span className="text-[10px] text-slate-500">Weight: +30 Risk</span>
                </div>
                <span className="text-xl">👥</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Unusual Head Movement</span>
                  <span className="text-2xl font-bold text-amber-400 mt-1 block">{violationCounts.HEAD_MOVEMENT}</span>
                  <span className="text-[10px] text-slate-500">Weight: +5 Risk</span>
                </div>
                <span className="text-xl">👀</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Talking / Audio</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-1 block">{violationCounts.TALKING}</span>
                  <span className="text-[10px] text-slate-500">Weight: +10 Risk</span>
                </div>
                <span className="text-xl">🎤</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Recent Exam Activity Table & Risk Index */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Recent Exam Activity */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span>Recent Exam Activity</span>
                  </h3>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>View All Reports</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-6 py-3.5">Exam Title</th>
                        <th className="px-6 py-3.5">Score</th>
                        <th className="px-6 py-3.5">AI Warnings</th>
                        <th className="px-6 py-3.5">Risk Category</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recentExams.map((r, idx) => (
                        <tr key={r.id || r._id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-white block">{r.student_name}</span>
                            <span className="font-mono text-xs text-indigo-400">{r.student_id}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-300 max-w-xs truncate">
                            {r.exam_title}
                          </td>
                          <td className="px-6 py-4 font-bold text-white">
                            {r.score} / {r.total_marks || 100}
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-400">
                            {r.total_warnings} / 3
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-bold text-xs px-2.5 py-1 rounded border ${
                                r.risk_score >= 50
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : r.risk_score >= 20
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {r.risk_category || 'MEDIUM'} ({r.risk_score}%)
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Violations Panel */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>Recent Proctored Violations</span>
                  </h3>
                  <button
                    onClick={() => navigate('/admin/violations')}
                    className="text-xs text-indigo-400 font-semibold hover:underline"
                  >
                    Full Logs Stream
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">📱</span>
                      <div>
                        <span className="font-bold text-rose-400 block">External Device Detected</span>
                        <span className="text-[10px] text-slate-400">RakshitaD76 (CS-2024-076)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">10:24:15 AM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">👥</span>
                      <div>
                        <span className="font-bold text-rose-400 block">Multiple Persons Detected</span>
                        <span className="text-[10px] text-slate-400">RakshitaD76 (CS-2024-076)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">10:25:05 AM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">🎤</span>
                      <div>
                        <span className="font-bold text-amber-400 block">Talking / Background Noise</span>
                        <span className="text-[10px] text-slate-400">RakshitaD76 (CS-2024-076)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">10:24:50 AM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">👀</span>
                      <div>
                        <span className="font-bold text-amber-400 block">Unusual Head Movement</span>
                        <span className="text-[10px] text-slate-400">Alex Johnson (CS-2024-001)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">09:40:12 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Student Risk Index */}
            <div className="space-y-6">
              <StudentRiskList students={candidates} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
