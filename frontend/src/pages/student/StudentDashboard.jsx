import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Award, Clock, ArrowRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ExamCard from '../../components/student/ExamCard';
import { fetchAllExams } from '../../services/proctorService';
import { ExamContext } from '../../context/ExamContext';
import { AuthContext } from '../../context/AuthContext';

const fallback5Exams = [
  {
    id: 'exam_demo_cv',
    title: 'Test 1: Computer Vision & OpenCV',
    description: 'Specialized examination covering OpenCV fundamentals, matrix operations, color space transformations, thresholding, and morphological operations.',
    duration_minutes: 45,
    total_marks: 100,
    passing_marks: 40,
    question_count: 20
  },
  {
    id: 'exam_demo_ml',
    title: 'Test 2: Machine Learning Fundamentals',
    description: 'Core assessment covering supervised/unsupervised learning, classification algorithms, gradient descent, bias-variance tradeoff, and evaluation metrics.',
    duration_minutes: 45,
    total_marks: 100,
    passing_marks: 40,
    question_count: 20
  },
  {
    id: 'exam_demo_dl',
    title: 'Test 3: Deep Learning & CNN',
    description: 'In-depth evaluation covering neural network backpropagation, convolutional layers, pooling, activation functions (ReLU, Softmax), and transfer learning.',
    duration_minutes: 45,
    total_marks: 100,
    passing_marks: 40,
    question_count: 20
  },
  {
    id: 'exam_demo_yolo',
    title: 'Test 4: YOLO & Object Detection',
    description: 'Advanced examination on single-stage vs two-stage object detectors, YOLO architecture (backbone, neck, head), non-maximum suppression (NMS), and IoU.',
    duration_minutes: 45,
    total_marks: 100,
    passing_marks: 40,
    question_count: 20
  },
  {
    id: 'exam_demo_proc',
    title: 'Test 5: AI-Based Online Proctoring',
    description: 'Comprehensive exam on continuous video invigilation, multi-class anomaly detection, temporal consecutive-frame verification, risk index calculation, and ethical AI.',
    duration_minutes: 45,
    total_marks: 100,
    passing_marks: 40,
    question_count: 20
  }
];

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setActiveExam } = useContext(ExamContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchAllExams();
        if (data && data.length > 0) {
          setExams(data);
        } else {
          setExams(fallback5Exams);
        }
      } catch (err) {
        setExams(fallback5Exams);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  const handleStartExam = (exam) => {
    setActiveExam(exam);
    navigate('/student/instructions');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          {/* Header Banner */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>AI Automated Invigilation Enabled</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-indigo-400">{user?.full_name || 'Student'}</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select an active online exam below. Ensure your webcam and microphone are working properly before entering the proctored exam room.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Available Exams</span>
                <p className="text-2xl font-bold text-white mt-1">{exams.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Proctoring Protocol</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">Multi-Class AI</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Max Warning Threshold</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">3 Warnings</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Exams Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Available Proctored Examinations</span>
            </h2>

            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
                Loading examination catalog...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map((exam) => (
                  <ExamCard key={exam.id || exam._id} exam={exam} onStart={handleStartExam} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
