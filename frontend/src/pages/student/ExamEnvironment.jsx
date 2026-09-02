import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, Send, AlertTriangle, X, Radio } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import WebcamStream, { formatCleanLabel } from '../../components/student/WebcamStream';
import WarningBanner from '../../components/student/WarningBanner';
import QuestionView from '../../components/student/QuestionView';
import Modal from '../../components/common/Modal';
import { ExamContext } from '../../context/ExamContext';
import { AuthContext } from '../../context/AuthContext';
import { submitExamAnswers } from '../../services/proctorService';

const getViolationIcon = (typeStr) => {
  const str = String(typeStr || '').toUpperCase();
  if (str.includes('EXTERNAL') || str.includes('MOBILE') || str.includes('PHONE')) return '📱';
  if (str.includes('MULTIPLE') || str.includes('PERSON')) return '👥';
  if (str.includes('HEAD') || str.includes('GAZE')) return '👀';
  if (str.includes('TALKING') || str.includes('BACKGROUND') || str.includes('AUDIO')) return '🎤';
  return '🟢';
};

const ExamEnvironment = () => {
  const { activeExam, warningsCount, addWarning, violationsLog } = useContext(ExamContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 mins default
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [latestWarningMsg, setLatestWarningMsg] = useState(null);
  const [latestActivity, setLatestActivity] = useState('NORMAL');

  const candidateName = user?.full_name || 'RakshitaD76';

  useEffect(() => {
    if (!activeExam) {
      navigate('/student/dashboard');
      return;
    }

    if (activeExam.duration_minutes) {
      setTimeLeft(activeExam.duration_minutes * 60);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam]);

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleProctorWarning = (detectionResult) => {
    const act = detectionResult.activity || detectionResult.detected_class || 'NORMAL';
    setLatestActivity(act);
    const msg = detectionResult.message || detectionResult.warning_message;
    if (msg) {
      setLatestWarningMsg(msg);
    }
    if (detectionResult.warning_triggered) {
      addWarning(detectionResult);
    }
  };

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const executeSubmission = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    const questions = activeExam.questions || [];
    const totalQCount = questions.length || 20;
    
    // Calculate score locally for consistency
    let correctCount = 0;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correct_option) {
        correctCount++;
      }
    });

    const marksPerQ = activeExam.total_marks ? activeExam.total_marks / totalQCount : 5;
    const computedScore = Math.round(correctCount * marksPerQ);
    const computedPercentage = Math.round((computedScore / (activeExam.total_marks || 100)) * 100);

    try {
      const payload = {
        exam_id: activeExam.id,
        answers: answers,
        total_warnings: warningsCount,
        student_id: user?.student_id || 'CS-2024-076',
        student_name: candidateName,
        violation_summary: {
          total_violations: violationsLog.length,
          log: violationsLog,
        },
      };

      const result = await submitExamAnswers(payload);
      const finalReport = {
        exam_id: activeExam.id,
        exam_title: activeExam.title,
        candidate_name: candidateName,
        student_id: user?.student_id || 'CS-2024-076',
        score: result.score !== undefined ? result.score : computedScore,
        total_marks: activeExam.total_marks || 100,
        percentage: result.percentage !== undefined ? result.percentage : computedPercentage,
        status: warningsCount >= 3 ? 'FLAGGED_FOR_REVIEW' : (result.status || 'PASSED'),
        total_warnings: warningsCount,
        risk_score: result.risk_score !== undefined ? result.risk_score : Math.min(100, warningsCount * 25),
        risk_category: result.risk_category || (warningsCount >= 3 ? 'CRITICAL' : warningsCount >= 2 ? 'HIGH RISK' : 'LOW'),
        submitted_at: result.submitted_at || new Date().toISOString(),
        answers_breakdown: {
          answered: Object.keys(answers).length,
          unanswered: totalQCount - Object.keys(answers).length,
          correct: correctCount,
          wrong: Object.keys(answers).length - correctCount,
          total_questions: totalQCount,
        },
        violations: violationsLog,
      };
      navigate('/student/results', { state: { resultReport: finalReport } });
    } catch (err) {
      console.warn('Backend submission fallback for phase 1 demo mode');
      const fallbackReport = {
        exam_id: activeExam.id,
        exam_title: activeExam.title,
        candidate_name: candidateName,
        student_id: user?.student_id || 'CS-2024-076',
        score: computedScore,
        total_marks: activeExam.total_marks || 100,
        percentage: computedPercentage,
        status: warningsCount >= 3 ? 'FLAGGED_FOR_REVIEW' : 'PASSED',
        total_warnings: warningsCount,
        risk_score: Math.min(100, warningsCount * 25),
        risk_category: warningsCount >= 3 ? 'CRITICAL' : warningsCount >= 2 ? 'HIGH RISK' : 'LOW',
        submitted_at: new Date().toISOString(),
        answers_breakdown: {
          answered: Object.keys(answers).length,
          unanswered: totalQCount - Object.keys(answers).length,
          correct: correctCount,
          wrong: Object.keys(answers).length - correctCount,
          total_questions: totalQCount,
        },
        violations: violationsLog,
      };
      navigate('/student/results', { state: { resultReport: fallbackReport } });
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeExam) return null;

  const questions = activeExam.questions || [];
  const totalQuestions = questions.length || 20;
  const currentQuestion = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeLow = timeLeft < 300;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Exam Header */}
      <header className="glass-nav px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">{activeExam.title}</h1>
            <span className="text-[11px] text-slate-400">Candidate: <strong className="text-white">{candidateName}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
            isTimeLow
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-white'
          }`}>
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-base font-extrabold">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleOpenConfirm}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Exam'}</span>
          </button>
        </div>
      </header>

      {/* Main Exam Grid */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
        {/* Left 2 Cols: Question Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warning Counter Banner */}
          <WarningBanner
            warningsCount={warningsCount}
            maxWarnings={3}
            latestMessage={latestWarningMsg}
            latestActivity={latestActivity}
          />

          {/* Question Interface */}
          <QuestionView
            question={currentQuestion}
            questionIndex={currentQIndex}
            totalQuestions={totalQuestions}
            selectedOption={currentQuestion ? answers[currentQuestion.id] : undefined}
            onSelectOption={handleSelectOption}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Previous Question
            </button>

            <div className="flex items-center flex-wrap gap-1 justify-center max-w-md">
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border ${
                    currentQIndex === idx
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : answers[q.id] !== undefined
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentQIndex === totalQuestions - 1}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live AI Video & Audio Proctor Sidebar */}
        <div className="space-y-6">
          <WebcamStream
            examId={activeExam.id}
            studentId={user?.student_id || 'CS-2024-076'}
            onWarning={handleProctorWarning}
          />

          {/* AI Violation Stream Logger Panel */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Violation Stream</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-400 border border-slate-800">
                {violationsLog.length} Event(s)
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {violationsLog.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center flex items-center justify-center space-x-2">
                  <span className="text-sm">🟢</span>
                  <span className="text-xs text-emerald-400 font-semibold">Normal Activity Detected</span>
                </div>
              ) : (
                violationsLog.map((log) => {
                  const icon = getViolationIcon(log.type);
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-start space-x-2.5 text-xs shadow-sm"
                    >
                      <span className="text-base select-none mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-300 truncate">{formatCleanLabel(log.type)}</span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">{log.timestamp}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">{log.message}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <Modal isOpen={true} onClose={() => setShowConfirmModal(false)} title="Submit Examination?">
          <div className="space-y-5">
            <p className="text-xs text-slate-300">
              Are you sure you want to finalize and submit your examination? Once submitted, you cannot change your answers.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Answered</span>
                <span className="text-lg font-extrabold text-emerald-400">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="space-y-0.5 border-x border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unanswered</span>
                <span className="text-lg font-extrabold text-amber-400">{unansweredCount} / {totalQuestions}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Warnings</span>
                <span className={`text-lg font-extrabold ${warningsCount >= 3 ? 'text-rose-400' : 'text-indigo-400'}`}>
                  {warningsCount} / 3
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeSubmission}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Confirm Submission'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExamEnvironment;
