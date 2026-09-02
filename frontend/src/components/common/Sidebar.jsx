import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  ShieldAlert,
  Radio,
  AlertTriangle,
  FileText,
  Settings,
  ShieldCheck,
  Award
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Available Exams', path: '/student/dashboard#exams', icon: BookOpen },
    { name: 'My Exam Results', path: '/student/results', icon: FileCheck },
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Exams', path: '/admin/exams', icon: BookOpen },
    { name: 'Active Monitoring', path: '/admin/monitoring', icon: Radio },
    { name: 'Violation Logs', path: '/admin/violations', icon: AlertTriangle },
    { name: 'Proctoring Reports', path: '/admin/reports', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const isLinkActive = (path) => {
    if (path.includes('#')) {
      const basePath = path.split('#')[0];
      return location.pathname === basePath && location.hash === '#' + path.split('#')[1];
    }
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-6">
        {/* Top Section Header */}
        <div>
          <div className="px-3 mb-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {isAdmin ? 'NAVIGATION MENU' : 'STUDENT'}
            </span>
            <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PROCTOR AI
            </span>
          </div>

          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);

              return (
                <button
                  key={link.name}
                  onClick={() => {
                    if (link.path.includes('#')) {
                      const [base, hash] = link.path.split('#');
                      navigate(base);
                      setTimeout(() => {
                        const el = document.getElementById(hash);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{link.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Abnormal Activity AI Status Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>ABNORMAL ACTIVITY AI</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
            Real-time multi-class vision pipeline tracking device, posture, count & audio cues.
          </p>
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
              Engine Active (60fps)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>System Settings</span>
        </button>

        <div className="px-3 text-center space-y-0.5">
          <div className="text-[11px] font-bold text-slate-400">AI Proctor System v1.4.0</div>
          <div className="text-[10px] text-slate-500 font-mono">Secure. Smart. Reliable.</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
