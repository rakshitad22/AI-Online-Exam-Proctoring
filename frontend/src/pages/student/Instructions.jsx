import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Camera, CheckSquare, AlertTriangle, Play, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { ExamContext } from '../../context/ExamContext';

const Instructions = () => {
  const { activeExam, setExamStatus } = useContext(ExamContext);
  const [agreed, setAgreed] = useState(false);
  const [cameraChecked, setCameraChecked] = useState(false);
  const navigate = useNavigate();

  if (!activeExam) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <p className="text-slate-400 mb-4">No exam selected. Please choose an exam from your dashboard.</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleTestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraChecked(true);
      // Stop track after testing
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      alert('Camera access failed! Please allow webcam permissions in your browser settings.');
    }
  };

  const handleProceed = () => {
    if (!cameraChecked) {
      alert('Please perform the live camera permission check before starting.');
      return;
    }
    if (!agreed) {
      alert('Please agree to the AI proctoring rules and terms.');
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
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Pre-Exam Requirements & Verification
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{activeExam.title}</h1>
            <p className="text-sm text-slate-400 mt-2">
              Duration: <span className="text-white font-semibold">{activeExam.duration_minutes} Minutes</span> | Total Marks:{' '}
              <span className="text-white font-semibold">{activeExam.total_marks}</span>
            </p>
          </div>

          {/* AI Rules Box */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>AI Proctoring Rules & Detection Classes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">1. Single Person Constraint</span>
                No second person should enter the webcam field of view. AI detects <span className="text-rose-400 font-semibold">Multiple Persons</span>.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">2. No External Devices</span>
                Mobile phones, tablets, or unauthorized reference materials are prohibited.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">3. Forward Head Orientation</span>
                Excessive gazing away or frequent side <span className="text-amber-400 font-semibold">Head Movements</span> trigger warnings.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">4. Silence & Mouth Motion</span>
                Speaking or whispering to another person triggers <span className="text-rose-400 font-semibold">Talking Behavior Alerts</span>.
              </div>
            </div>
          </div>

          {/* Webcam Permission Check */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Webcam Hardware & Permission Check</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click test to confirm browser camera access for live video stream analysis.
                </p>
              </div>
            </div>

            <button
              onClick={handleTestCamera}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                cameraChecked
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-600/20'
              }`}
            >
              {cameraChecked ? 'Camera Verified ✓' : 'Test Webcam Stream'}
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
                I agree to be continuously monitored via AI computer vision throughout the examination. I understand that accumulating 3 or more warnings will automatically flag my exam for examiner review.
              </span>
            </label>
          </div>

          {/* Start Exam Button */}
          <button
            onClick={handleProceed}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-600/30"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Proctored Exam Environment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
