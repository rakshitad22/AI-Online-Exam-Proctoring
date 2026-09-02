import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

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
    { name: 'Active Monitoring', path: '/admin/monitoring', icon: ShieldAlert },
    { name: 'Violation Logs', path: '/admin/violations', icon: AlertTriangle },
    { name: 'Proctoring Reports', path: '/admin/reports', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 glass-card border-r border-slate-800 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Navigation Menu
          </h3>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Abnormal Activity AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time multi-class vision pipeline tracking device, posture, count & audio cues.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        AI Proctor System v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
