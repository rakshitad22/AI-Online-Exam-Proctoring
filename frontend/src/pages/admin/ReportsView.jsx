import React, { useState, useEffect } from 'react';
import { FileText, Printer, ShieldAlert, CheckCircle2, AlertTriangle, Search, Eye, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

const ReportsView = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportTimeline, setReportTimeline] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      setReports([
        {
          id: 'rep_1',
          exam_id: 'exam_demo_1',
          exam_title: 'Computer Vision & AI Final Assessment 2026',
          student_id: 'CS-2024-001',
          student_name: 'Alex Johnson',
          score: 85,
          total_marks: 100,
          status: 'FLAGGED_FOR_REVIEW',
          total_warnings: 3,
          risk_score: 85.0,
          risk_category: 'CRITICAL',
          submitted_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 'rep_2',
          exam_id: 'exam_demo_1',
          exam_title: 'Computer Vision & AI Final Assessment 2026',
          student_id: 'CS-2024-042',
          student_name: 'Sarah Miller',
          score: 95,
          total_marks: 100,
          status: 'PASSED',
          total_warnings: 0,
          risk_score: 5.0,
          risk_category: 'LOW',
          submitted_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        },
      ]);
    }
  };

  const handleViewReportDetail = async (report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);

    try {
      const res = await api.get(`/proctoring/violations/${report.exam_id}`);
      setReportTimeline(res.data);
    } catch (err) {
      setReportTimeline([
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          violation_type: 'HEAD_MOVEMENT',
          confidence: 0.86,
          severity: 'LOW',
          details: 'Gaze offset from screen center'
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          violation_type: 'TALKING',
          confidence: 0.88,
          severity: 'MEDIUM',
          details: 'Continuous mouth movement detected'
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          violation_type: 'EXTERNAL_DEVICE',
          confidence: 0.94,
          severity: 'HIGH',
          details: 'Mobile phone object profile detected'
        }
      ]);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredReports = reports.filter(
    (r) =>
      r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.exam_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Exam Monitoring & Audit Reports
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Candidate performance, violation breakdown, transparent risk score calculation, and printable audit timelines
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name or ID..."
                className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
          </div>

          {/* Reports Summary Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Assessment Title</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Proctor Warnings</th>
                    <th className="px-6 py-4">Risk Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-200 block">{r.student_name}</span>
                        <span className="font-mono text-xs text-indigo-400">{r.student_id}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-xs">{r.exam_title}</td>
                      <td className="px-6 py-4 font-bold text-white">
                        {r.score} / {r.total_marks}
                      </td>
                      <td className="px-6 py-4 text-amber-400 font-bold">{r.total_warnings}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded border ${
                            r.risk_score >= 50
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : r.risk_score >= 20
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {r.risk_category || 'LOW'} ({r.risk_score.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 print:hidden">
                        <button
                          onClick={() => handleViewReportDetail(r)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Report Detail Modal */}
          {selectedReport && (
            <Modal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              title="Official Proctoring Audit Report"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedReport.student_name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Student ID: {selectedReport.student_id} | Exam: {selectedReport.exam_title}
                    </p>
                  </div>
                  <button
                    onClick={handlePrintReport}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Score</span>
                    <span className="text-lg font-bold text-white mt-0.5">
                      {selectedReport.score}/{selectedReport.total_marks}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Warnings</span>
                    <span className="text-lg font-bold text-amber-400 mt-0.5">
                      {selectedReport.total_warnings}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Risk Score</span>
                    <span className="text-lg font-bold text-indigo-400 mt-0.5">
                      {selectedReport.risk_score}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Category</span>
                    <span className="text-xs font-extrabold text-rose-400 mt-1 block uppercase">
                      {selectedReport.risk_category || 'LOW'}
                    </span>
                  </div>
                </div>

                {/* Chronological Violation Timeline */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Chronological Violation Timeline</span>
                  </h3>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {reportTimeline.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        No recorded violation events for this session.
                      </p>
                    ) : (
                      reportTimeline.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-rose-400 block">
                              {item.violation_type || item.detected_class}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {item.details || 'Detected by vision pipeline'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-slate-500 text-[10px] block">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-indigo-400 font-semibold text-[10px]">
                              {((item.confidence || 0.9) * 100).toFixed(0)}% Confidence
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportsView;
