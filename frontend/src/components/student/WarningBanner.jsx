import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

const WarningBanner = ({ warningsCount = 0, maxWarnings = 3, latestMessage, latestActivity = 'NORMAL' }) => {
  let bannerStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
  let icon = <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
  let title = 'AI MONITORING LIVE';

  const isRedAlert = latestActivity === 'EXTERNAL_DEVICE' || latestActivity === 'MULTIPLE_PERSONS' || warningsCount >= maxWarnings;
  const isYellowAlert = latestActivity === 'HEAD_MOVEMENT' || latestActivity === 'TALKING';

  if (isRedAlert) {
    bannerStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200 animate-pulse shadow-rose-900/50 shadow-lg';
    icon = <AlertOctagon className="w-6 h-6 text-rose-400" />;
    title = warningsCount >= maxWarnings ? 'CRITICAL EXAM WARNING' : 'CRITICAL AI VIOLATION DETECTED';
  } else if (isYellowAlert) {
    bannerStyle = 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-amber-900/30 shadow-md';
    icon = <AlertTriangle className="w-6 h-6 text-amber-400" />;
    title = 'PROCTORING WARNING';
  }

  const getDisplayMessage = () => {
    if (latestActivity === 'EXTERNAL_DEVICE') return '⚠ Mobile Phone / External Device Detected!';
    if (latestActivity === 'MULTIPLE_PERSONS') return '⚠ Multiple Persons Detected!';
    if (latestActivity === 'HEAD_MOVEMENT') return '⚠ Excessive Head Movement Detected';
    if (latestActivity === 'TALKING') return '⚠ Talking / Mouth Movement Detected';
    if (latestActivity === 'NORMAL') return '✓ AI Monitoring: Normal';
    return latestMessage || 'AI proctoring system active.';
  };

  return (
    <div className={`rounded-2xl p-4 border transition-all flex items-center justify-between shadow-lg ${bannerStyle}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-current/20">
          {icon}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm uppercase tracking-wide">
              {title}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 border border-current">
              Warning {warningsCount} / {maxWarnings}
            </span>
          </div>
          <p className="text-xs mt-1 font-bold tracking-wide">
            {getDisplayMessage()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningBanner;
