import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import AnalyticsCard from '../../components/admin/AnalyticsCard';
import ViolationTable from '../../components/admin/ViolationTable';
import StudentRiskList from '../../components/admin/StudentRiskList';
import { fetchReportsSummary, fetchViolations, fetchProctoringStatus } from '../../services/proctorService';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    total_students: 142,
    total_exams: 8,
    total_reports: 95,
    total_violations: 24,
    flagged_reports: 3,
  });

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
          const statusData = await fetchProctoringStatus('all');
          setCandidates(statusData.candidates || []);
        } catch (e) {
          console.warn('Failed to load status candidates');
        }

        setSummary({
          ...sumData,
          total_violations: Math.max(sumData.total_violations || 0, vData.length)
        });
      } catch (err) {
        console.warn('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute violation analytics breakdown
  const violationCounts = {
    EXTERNAL_DEVICE: violations.filter((v) => (v.violation_type || '').includes('EXTERNAL_DEVICE')).length,
    MULTIPLE_PERSONS: violations.filter((v) => (v.violation_type || '').includes('MULTIPLE_PERSONS')).length,
    HEAD_MOVEMENT: violations.filter((v) => (v.violation_type || '').includes('HEAD_MOVEMENT')).length,
    TALKING: violations.filter((v) => (v.violation_type || '').includes('TALKING')).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="flex items-center justify-between">
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
              <span className="text-xs font-bold text-emerald-400">OpenCV AI Engine Online</span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>

          {/* Analytics Breakdown Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Abnormal Activity Analytics by Class</span>
              </h3>
              <span className="text-xs text-slate-400">5-Class Target Distribution</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">External Device</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block">{violationCounts.EXTERNAL_DEVICE}</span>
                <span className="text-[10px] text-slate-500">Severity: HIGH (25 pts)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">Multiple Persons</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block">{violationCounts.MULTIPLE_PERSONS}</span>
                <span className="text-[10px] text-slate-500">Severity: HIGH (30 pts)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">Head Movement</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">{violationCounts.HEAD_MOVEMENT}</span>
                <span className="text-[10px] text-slate-500">Severity: LOW (5 pts)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">Talking Behavior</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1 block">{violationCounts.TALKING}</span>
                <span className="text-[10px] text-slate-500">Severity: MEDIUM (10 pts)</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Violations & Student Risk Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ViolationTable violations={violations} />
            </div>

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
