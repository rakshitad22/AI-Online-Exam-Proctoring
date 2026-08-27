import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Award, HelpCircle, Trash2, Edit3, Power, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchAllExams } from '../../services/proctorService';
import api from '../../services/api';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await fetchAllExams();
      setExams(data);
    } catch (err) {
      console.warn('Backend fallback for exam management listing');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingExamId(null);
    setTitle('');
    setDescription('');
    setDuration(45);
    setTotalMarks(100);
    setPassingMarks(40);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExamId(exam.id || exam._id);
    setTitle(exam.title);
    setDescription(exam.description);
    setDuration(exam.duration_minutes);
    setTotalMarks(exam.total_marks);
    setPassingMarks(exam.passing_marks);
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title,
        description,
        duration_minutes: Number(duration),
        total_marks: Number(totalMarks),
        passing_marks: Number(passingMarks),
        questions: [
          {
            id: 'q1',
            question_text: 'Sample Proctored Exam Question 1',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_option: 0,
            marks: 25,
          },
        ],
      };

      if (editingExamId) {
        await api.put(`/exams/${editingExamId}`, payload);
      } else {
        await api.post('/exams', payload);
      }

      setIsModalOpen(false);
      loadExams();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this proctored examination?')) return;
    try {
      await api.delete(`/exams/${examId}`);
      loadExams();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleActive = async (examId) => {
    try {
      await api.patch(`/exams/${examId}/toggle-active`);
      loadExams();
    } catch (err) {
      alert('Toggle active failed: ' + (err.response?.data?.detail || err.message));
    }
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
                Exam Configuration & Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Create, edit, activate/deactivate, and manage proctored examination parameters
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Proctored Exam</span>
            </button>
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const examId = exam.id || exam._id;
              const isActive = exam.is_active !== false;

              return (
                <div
                  key={examId}
                  className={`glass-card rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-semibold text-indigo-400">
                        ID: {examId}
                      </span>
                      <StatusBadge status={isActive ? 'ACTIVE' : 'DEACTIVATED'} />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{exam.title}</h3>
                    <p className="text-xs text-slate-400 mb-6 line-clamp-2">{exam.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span>{exam.duration_minutes} Minutes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <HelpCircle className="w-4 h-4 text-violet-400" />
                        <span>{exam.question_count || exam.questions?.length || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button
                      onClick={() => handleToggleActive(examId)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition-colors ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Exam"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(examId)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create/Edit Exam Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingExamId ? 'Edit Proctored Assessment' : 'Configure New Proctored Assessment'}
          >
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Vision & AI Final Assessment 2026"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide exam instructions and guidelines..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-4"
              >
                {saving ? 'Saving...' : editingExamId ? 'Update Exam Configuration' : 'Save & Publish Exam'}
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default ManageExams;
