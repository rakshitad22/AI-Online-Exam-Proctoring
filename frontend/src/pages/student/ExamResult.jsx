import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ShieldCheck, Home, FileText } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';

const ExamResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const report = location.state?.resultReport || {
    exam_title: 'Test 2: Machine Learning Fundamentals',
    candidate_name: 'RakshitaD76',
    score: 70,
    total_marks: 100,
    status: 'PASSED',
    total_warnings: 3,
    risk_score: 65,
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

  const candidateName = report.candidate_name || 'RakshitaD76';
  const rawRiskScore = typeof report.risk_score === 'number' ? report.risk_score : 0;
  const riskPercent = rawRiskScore > 1 ? Math.min(100, Math.round(rawRiskScore)) : Math.round(rawRiskScore * 100);

  const getRiskCategory = (score) => {
    if (score < 20) return { label: 'LOW RISK', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score < 50) return { label: 'MEDIUM RISK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score < 75) return { label: 'HIGH RISK', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'CRITICAL RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const riskCat = getRiskCategory(riskPercent);
  const isPassed = report.status === 'PASSED' || report.status === 'PASS';
  const isFlagged = report.status === 'FLAGGED_FOR_REVIEW' || report.total_warnings >= 3;

  const breakdown = report.answers_breakdown || {
    answered: 20,
    unanswered: 0,
    correct: Math.round((report.score / (report.total_marks || 100)) * 20),
    wrong: 20 - Math.round((report.score / (report.total_marks || 100)) * 20),
    total_questions: 20,
  };

  const violationsList = report.violations || [];
  const extDeviceCount = violationsList.filter((v) => v.type === 'EXTERNAL_DEVICE').length;
  const multiPersonCount = violationsList.filter((v) => v.type === 'MULTIPLE_PERSONS').length;
  const headMoveCount = violationsList.filter((v) => v.type === 'HEAD_MOVEMENT').length;
  const talkingCount = violationsList.filter((v) => v.type === 'TALKING' || v.type === 'BACKGROUND_NOISE').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-8 flex flex-col justify-center">
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
              Examination Submission Complete
            </span>
            <h1 className="text-2xl font-extrabold text-white">{report.exam_title}</h1>
            <p className="text-xs text-slate-400">
              Candidate: <strong className="text-white">{candidateName}</strong> | Submitted on{' '}
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
                {report.total_warnings} / 3
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
                {riskCat.label}
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

          {/* Proctoring Summary */}
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
  );
};

export default ExamResult;
