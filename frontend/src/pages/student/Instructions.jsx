import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Camera, Mic, CheckCircle2, Play, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { ExamContext } from '../../context/ExamContext';
import { AuthContext } from '../../context/AuthContext';

const Instructions = () => {
  const { activeExam, setExamStatus } = useContext(ExamContext);
  const { user } = useContext(AuthContext);
  const [agreed, setAgreed] = useState(false);
  const [mediaChecked, setMediaChecked] = useState(false);
  const [testingMedia, setTestingMedia] = useState(false);
  const navigate = useNavigate();

  const candidateName = user?.full_name || 'RakshitaD76';

  if (!activeExam) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <p className="text-slate-400 mb-4">No exam selected. Please choose an exam from your dashboard.</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-semibold hover:bg-indigo-500"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleTestMedia = async () => {
    setTestingMedia(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaChecked(true);
      // Stop tracks after testing
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      alert('Media permissions failed! Please allow webcam and microphone access in your browser settings to proceed.');
    } finally {
      setTestingMedia(false);
    }
  };

  const handleProceed = () => {
    if (!mediaChecked) {
      alert('Please perform the webcam and microphone permission check before starting.');
      return;
    }
    if (!agreed) {
      alert('Please agree to the AI proctoring rules and examination terms.');
      return;
    }
    setExamStatus('IN_PROGRESS');
    navigate('/student/exam-room');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-8">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Pre-Exam Requirements & Verification
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Candidate: <span className="text-white font-bold">{candidateName}</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">{activeExam.title}</h1>
            <p className="text-sm text-slate-400 mt-2">
              Duration: <span className="text-white font-semibold">{activeExam.duration_minutes || 45} Minutes</span> | Total Questions:{' '}
              <span className="text-white font-semibold">{activeExam.question_count || activeExam.questions?.length || 20}</span> | Total Marks:{' '}
              <span className="text-white font-semibold">{activeExam.total_marks || 100}</span>
            </p>
          </div>

          {/* AI Rules Box */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Mandatory AI Proctoring Rules & Protocols</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">1. Single Person Constraint</span>
                Only one person should be visible. AI detects <span className="text-rose-400 font-semibold">Multiple Persons (+30 Risk)</span>.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">2. No External Devices</span>
                External devices such as mobile phones are strictly prohibited (<span className="text-rose-400 font-semibold">+25 Risk</span>).
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">3. Forward Head Orientation</span>
                Repeated abnormal <span className="text-amber-400 font-semibold">Head Movement (+5 Risk)</span> may trigger warnings.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">4. Silence & Speech Detection</span>
                Continuous <span className="text-amber-400 font-semibold">Talking Behavior (+10 Risk)</span> or background audio triggers warnings.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">5. Continuous AI Monitoring</span>
                The candidate is continuously monitored via video frame sampling and microphone RMS audio analysis.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">6. Warning Threshold Limit</span>
                Accumulating 3 warnings automatically flags the examination session for examiner review.
              </div>
            </div>
          </div>

          {/* Webcam & Microphone Permission Check */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center space-x-1">
                <Camera className="w-5 h-5" />
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">System Hardware & Permission Verification</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test browser webcam video stream and microphone RMS audio level access.
                </p>
              </div>
            </div>

            <button
              onClick={handleTestMedia}
              disabled={testingMedia}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                mediaChecked
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-600/20'
              }`}
            >
              {testingMedia ? 'Testing Stream...' : mediaChecked ? 'Webcam & Mic Verified ✓' : 'Test Webcam & Microphone'}
            </button>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I agree to be continuously monitored via AI computer vision and audio analysis throughout the examination. I understand that accumulating 3 warnings will flag my session for examiner review.
              </span>
            </label>
          </div>

          {/* Launch Exam Button */}
          <button
            onClick={handleProceed}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-600/30"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Proctored Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
