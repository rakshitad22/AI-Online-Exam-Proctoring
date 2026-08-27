import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ShieldCheck, Home } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';

const ExamResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const report = location.state?.resultReport || {
    exam_title: 'Computer Vision & AI Final Assessment 2026',
    score: 80,
    total_marks: 100,
    status: 'PASSED',
    total_warnings: 1,
    risk_score: 0.25,
    submitted_at: new Date().toISOString(),
  };

  const isPassed = report.status === 'PASSED';
  const isFlagged = report.status === 'FLAGGED_FOR_REVIEW';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto p-8 space-y-8 flex flex-col justify-center">
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-8 text-center relative overflow-hidden">
          {/* Header Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
            {isFlagged ? (
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            ) : isPassed ? (
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-rose-400" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              Examination Submission Complete
            </span>
            <h1 className="text-3xl font-extrabold text-white">{report.exam_title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Submitted on {new Date(report.submitted_at).toLocaleString()}
            </p>
          </div>

          {/* Results Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Obtained Score</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {report.score} / {report.total_marks}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Result Status</span>
              <div className="mt-2">
                <StatusBadge status={report.status} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">AI Warnings</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
                {report.total_warnings}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Risk Index</span>
              <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
                {(report.risk_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Detailed Message */}
          <div
            className={`p-4 rounded-2xl text-xs leading-relaxed border text-left ${
              isFlagged
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : isPassed
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {isFlagged
              ? 'Notice: Your exam accumulated multiple AI warning triggers during the proctoring session. The session log and video keyframe data have been flagged for manual review by an examiner.'
              : isPassed
              ? 'Congratulations! Your exam answers have been submitted successfully, and your proctoring log maintains low abnormal activity flags.'
              : 'Your score did not meet the required passing threshold. Please contact your instructor or course admin for re-assessment details.'}
          </div>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExamResult;
