import React from 'react';
import { Clock, HelpCircle, Award, ArrowRight } from 'lucide-react';

const ExamCard = ({ exam, onStart }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Active Assessment
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Passing: {exam.passing_marks}/{exam.total_marks}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {exam.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-6">
          {exam.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
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

      <button
        onClick={() => onStart(exam)}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/25 group-hover:shadow-indigo-600/40"
      >
        <span>Proceed to Instructions</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ExamCard;
