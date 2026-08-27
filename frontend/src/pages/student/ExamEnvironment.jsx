import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, Send, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import WebcamStream from '../../components/student/WebcamStream';
import WarningBanner from '../../components/student/WarningBanner';
import QuestionView from '../../components/student/QuestionView';
import { ExamContext } from '../../context/ExamContext';
import { AuthContext } from '../../context/AuthContext';
import { submitExamAnswers } from '../../services/proctorService';

const ExamEnvironment = () => {
  const { activeExam, warningsCount, addWarning, violationsLog } = useContext(ExamContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 mins default
  const [submitting, setSubmitting] = useState(false);
  const [latestWarningMsg, setLatestWarningMsg] = useState(null);
  const [latestActivity, setLatestActivity] = useState('NORMAL');

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
          handleSubmitExam();
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
    setLatestActivity(detectionResult.activity || 'NORMAL');
    const msg = detectionResult.message || detectionResult.warning_message;
    if (msg) {
      setLatestWarningMsg(msg);
    }
    if (detectionResult.warning_triggered) {
      addWarning(detectionResult);
    }
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        exam_id: activeExam.id,
        answers: answers,
        total_warnings: warningsCount,
        violation_summary: {
          total_violations: violationsLog.length,
          log: violationsLog,
        },
      };

      const result = await submitExamAnswers(payload);
      navigate('/student/results', { state: { resultReport: result } });
    } catch (err) {
      console.warn('Backend submission fallback for phase 1 demo mode');
      // Create local fallback result object
      const fallbackReport = {
        exam_title: activeExam.title,
        score: Object.keys(answers).length * 20,
        total_marks: activeExam.total_marks || 100,
        status: warningsCount >= 3 ? 'FLAGGED_FOR_REVIEW' : 'PASSED',
        total_warnings: warningsCount,
        risk_score: Math.min(1.0, warningsCount * 0.25),
        submitted_at: new Date().toISOString(),
      };
      navigate('/student/results', { state: { resultReport: fallbackReport } });
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeExam) return null;

  const questions = activeExam.questions || [];
  const currentQuestion = questions[currentQIndex];

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
            <span className="text-[11px] text-slate-400">Candidate: {user?.full_name || 'Student'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-base font-extrabold text-white">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
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
            totalQuestions={questions.length}
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
              onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQIndex === questions.length - 1}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live AI Webcam Monitor Sidebar */}
        <div className="space-y-6">
          <WebcamStream
            examId={activeExam.id}
            studentId={user?.student_id || 'std_demo_01'}
            onWarning={handleProctorWarning}
          />

          {/* Violation Stream Logger Panel */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-300">Live AI Violation Stream</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-400 border border-slate-800">
                {violationsLog.length} Event(s)
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {violationsLog.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No abnormal activities detected. Maintain focus.
                </p>
              ) : (
                violationsLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-rose-400 block">{log.type}</span>
                      <span className="text-[10px] text-slate-400">{log.message}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEnvironment;
