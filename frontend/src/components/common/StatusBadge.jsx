import React from 'react';

const formatStatusText = (status) => {
  if (!status) return 'Normal';
  const str = String(status).toUpperCase();
  if (str.includes('EXTERNAL_DEVICE') || str.includes('MOBILE') || str.includes('PHONE') || str.includes('CV2')) {
    return 'External Device';
  }
  if (str.includes('MULTIPLE_PERSONS') || str.includes('MULTIPLE') || str.includes('PERSONS')) {
    return 'Multiple Persons';
  }
  if (str.includes('HEAD_MOVEMENT') || str.includes('HEAD')) {
    return 'Unusual Head Movement';
  }
  if (str.includes('TALKING') || str.includes('BACKGROUND_NOISE') || str.includes('AUDIO')) {
    return 'Talking / Audio';
  }
  if (str.includes('FLAGGED')) {
    return 'Flagged for Review';
  }
  if (str.includes('SUSPICIOUS')) {
    return 'Suspicious Session';
  }
  if (str.includes('PASSED') || str.includes('PASS')) {
    return 'Passed';
  }
  if (str.includes('FAILED') || str.includes('FAIL')) {
    return 'Failed';
  }
  if (str.includes('ACTIVE')) {
    return 'Active';
  }
  if (str.includes('NORMAL')) {
    return 'Normal';
  }
  return status.replace(/_/g, ' ');
};

const StatusBadge = ({ status }) => {
  const displayText = formatStatusText(status);
  const uppercaseStr = String(status || '').toUpperCase();

  const getBadgeStyle = () => {
    if (uppercaseStr.includes('PASSED') || uppercaseStr.includes('PASS') || uppercaseStr.includes('ACTIVE') || uppercaseStr.includes('NORMAL')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (uppercaseStr.includes('FAILED') || uppercaseStr.includes('FAIL')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (uppercaseStr.includes('FLAGGED') || uppercaseStr.includes('EXTERNAL') || uppercaseStr.includes('MULTIPLE')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    if (uppercaseStr.includes('SUSPICIOUS') || uppercaseStr.includes('HEAD') || uppercaseStr.includes('TALKING') || uppercaseStr.includes('WARNING')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()} inline-flex items-center gap-1.5`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayText}
    </span>
  );
};

export default StatusBadge;
