import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ShieldCheck, Home, FileText, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const defaultFallbackReport = {
  id: 'rep_rakshita_default',
  exam_title: 'Test 2: Machine Learning Fundamentals',
  candidate_name: 'RakshitaD76',
  student_id: 'CS-2024-076',
  score: 70,
  total_marks: 100,
  percentage: 70,
  status: 'PASSED',
  total_warnings: 3,
  risk_score: 65,
  risk_category: 'HIGH RISK',
  submitted_at: new Date().toISOString(),
  answers_breakdown: {
    answered: 20,
    unanswered: 0,
    correct: 14,
    wrong: 6,
    total_questions: 20,
  },
  violations: [
    { type: 'HEAD_MOVEMENT', timestamp: '10:14:05' },
    { type: 'TALKING', timestamp: '10:18:22' },
    { type: 'EXTERNAL_DEVICE', timestamp: '10:22:10' },
  ],
};

const ExamResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [allResults, setAllResults] = useState([]);
  const [selectedReport, setSelectedReport] = useState(location.state?.resultReport || null);
  const [loading, setLoading] = useState(false);

  const candidateName = user?.full_name || 'RakshitaD76';

  useEffect(() => {
    loadMyResults();
  }, []);

  const loadMyResults = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      const data = res.data || [];
      const studentId = user?.student_id || 'CS-2024-076';
      
      const filtered = data.filter(
        (r) =>
          r.student_id === studentId ||
          r.student_name === candidateName ||
          r.student_id === 'CS-2024-076' ||
          r.student_name === 'RakshitaD76'
      );

      if (filtered.length > 0) {
        setAllResults(filtered);
        if (!selectedReport) {
          setSelectedReport(filtered[0]);
        }
      } else {
        const initialList = location.state?.resultReport
          ? [location.state.resultReport]
          : [defaultFallbackReport];
        setAllResults(initialList);
        if (!selectedReport) {
          setSelectedReport(initialList[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load student reports from API, using fallback state');
      const initialList = location.state?.resultReport
        ? [location.state.resultReport]
        : [defaultFallbackReport];
      setAllResults(initialList);
      if (!selectedReport) {
        setSelectedReport(initialList[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const report = selectedReport || defaultFallbackReport;
  const rawRiskScore = typeof report.risk_score === 'number' ? report.risk_score : (report.total_warnings ? report.total_warnings * 25 : 0);
  const riskPercent = rawRiskScore > 1 ? Math.min(100, Math.round(rawRiskScore)) : Math.round(rawRiskScore * 100);

  const getRiskCategory = (score) => {
    if (score < 20) return { label: 'LOW RISK', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score < 50) return { label: 'MEDIUM RISK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score < 75) return { label: 'HIGH RISK', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'CRITICAL RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const riskCat = getRiskCategory(riskPercent);
  const isPassed = report.status === 'PASSED' || report.status === 'PASS';
  const isFlagged = report.status === 'FLAGGED_FOR_REVIEW' || (report.total_warnings && report.total_warnings >= 3);

  const breakdown = report.answers_breakdown || {
    answered: 20,
    unanswered: 0,
    correct: Math.round((report.score / (report.total_marks || 100)) * 20),
    wrong: 20 - Math.round((report.score / (report.total_marks || 100)) * 20),
    total_questions: 20,
  };

  const violationsList = report.violations || report.violation_summary?.log || [];
  const extDeviceCount = violationsList.filter((v) => (v.type || v.violation_type || '').includes('EXTERNAL_DEVICE')).length;
  const multiPersonCount = violationsList.filter((v) => (v.type || v.violation_type || '').includes('MULTIPLE_PERSONS')).length;
  const headMoveCount = violationsList.filter((v) => (v.type || v.violation_type || '').includes('HEAD_MOVEMENT')).length;
  const talkingCount = violationsList.filter((v) => (v.type || v.violation_type || '').includes('TALKING') || (v.type || v.violation_type || '').includes('BACKGROUND_NOISE')).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
                <Award className="w-6 h-6 text-indigo-400" />
                <span>My Examination Results & Audit Reports</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Official proctored examination scores, AI warnings, risk index, and answer breakdowns for <strong className="text-white">{candidateName}</strong>
              </p>
            </div>

            <button
              onClick={loadMyResults}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Results</span>
            </button>
          </div>

          {/* Results List Selector */}
          {allResults.length > 1 && (
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Attended Examinations ({allResults.length} Submissions)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allResults.map((r, idx) => (
                  <button
                    key={r.id || r._id || idx}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      (report.id || report._id) === (r.id || r._id)
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs line-clamp-1">{r.exam_title || 'Proctored Exam'}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {r.score}/{r.total_marks || 100} ({r.percentage || Math.round((r.score / (r.total_marks || 100)) * 100)}%)
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Selected Result Card */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-8 relative overflow-hidden">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
                {isFlagged ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                ) : isPassed ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-rose-400" />
                )}
              </div>

              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
                Official Proctored Result Record
              </span>
              <h1 className="text-2xl font-extrabold text-white">{report.exam_title}</h1>
              <p className="text-xs text-slate-400">
                Candidate: <strong className="text-white">{report.student_name || candidateName}</strong> ({report.student_id || 'CS-2024-076'}) | Submitted on{' '}
                {new Date(report.submitted_at || Date.now()).toLocaleString()}
              </p>
            </div>

            {/* Results Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-semibold block">Obtained Score</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  {report.score} / {report.total_marks || 100}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  {report.percentage !== undefined ? report.percentage : Math.round((report.score / (report.total_marks || 100)) * 100)}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-semibold block">Result Status</span>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status={isFlagged ? 'FLAGGED_FOR_REVIEW' : isPassed ? 'PASSED' : 'FAILED'} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-semibold block">AI Warnings</span>
                <span className={`text-2xl font-extrabold mt-1 block ${report.total_warnings >= 3 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {report.total_warnings || 0} / 3
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-semibold block">Risk Index</span>
                <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
                  {riskPercent}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Risk Category</span>
                <span className={`mt-2 inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${riskCat.color}`}>
                  {report.risk_category || riskCat.label}
                </span>
              </div>
            </div>

            {/* Performance Question Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assessment Performance Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Correct Answers</span>
                  <span className="text-lg font-extrabold text-emerald-400">{breakdown.correct}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Wrong Answers</span>
                  <span className="text-lg font-extrabold text-rose-400">{breakdown.wrong}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Unanswered</span>
                  <span className="text-lg font-extrabold text-amber-400">{breakdown.unanswered}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Questions</span>
                  <span className="text-lg font-extrabold text-white">{breakdown.total_questions}</span>
                </div>
              </div>
            </div>

            {/* Proctoring Event Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Proctoring Event Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">External Device</span>
                  <span className={`font-mono font-bold ${extDeviceCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {extDeviceCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Multiple Persons</span>
                  <span className={`font-mono font-bold ${multiPersonCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {multiPersonCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Head Movement</span>
                  <span className={`font-mono font-bold ${headMoveCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {headMoveCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Talking / Audio</span>
                  <span className={`font-mono font-bold ${talkingCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {talkingCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-all border border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>Return to Student Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/admin/reports', { state: { targetCandidate: candidateName } })}
                className="py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <FileText className="w-4 h-4" />
                <span>View Detailed Audit Report</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamResult;
