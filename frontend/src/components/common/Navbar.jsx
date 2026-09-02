import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, User, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-slate-800/80">
      <div className="flex items-center space-x-3">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg text-white tracking-wide">
              AI<span className="text-indigo-400">Proctor</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
              CNN & YOLO Core
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-100">{user.full_name || 'RakshitaD76'}</span>
              <span className="text-[10px] text-indigo-400 font-semibold capitalize">
                {user.role === 'admin' ? 'Administrator' : 'Student Account'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shadow-md">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
