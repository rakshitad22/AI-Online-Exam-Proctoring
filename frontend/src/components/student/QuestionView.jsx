import React from 'react';

const QuestionView = ({ question, questionIndex, totalQuestions, selectedOption, onSelectOption }) => {
  if (!question) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300">
          {question.marks || 1} Mark(s)
        </span>
      </div>

      <h2 className="text-lg font-bold text-white leading-snug">
        {question.question_text}
      </h2>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(question.id, idx)}
              className={`w-full text-left p-4 rounded-xl font-medium text-sm transition-all border flex items-center justify-between ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionView;
