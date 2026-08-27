import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
      case 'NORMAL EXAM BEHAVIOR':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'FLAGGED_FOR_REVIEW':
      case 'WARNING':
      case 'SUSPICIOUS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MOBILE PHONE':
      case 'EXTERNAL DEVICE / MOBILE PHONE':
      case 'MULTIPLE PERSONS':
      case 'TALKING TO ANOTHER PERSON':
      case 'HEAD MOVEMENT':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()} inline-flex items-center gap-1.5`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
