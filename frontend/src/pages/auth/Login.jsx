import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, LogIn, Eye, EyeOff, UserCheck, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (eEmail, ePassword) => {
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(eEmail, ePassword);
      login(data);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const handleDemoStudent = () => {
    const demEmail = 'student@example.com';
    const demPass = 'student123';
    setEmail(demEmail);
    setPassword(demPass);
    handleLoginSubmit(demEmail, demPass);
  };

  const handleDemoAdmin = () => {
    const demEmail = 'admin@example.com';
    const demPass = 'admin123';
    setEmail(demEmail);
    setPassword(demPass);
    handleLoginSubmit(demEmail, demPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Exam Proctoring</h1>
          <p className="text-xs text-slate-400">Sign in to your student or examiner portal</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address / Username</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com or RakshitaD76"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-11 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Restored Prominent Demo Accounts Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>One-Click Demo Portals</span>
            <span className="text-indigo-400">Pre-configured Credentials</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={handleDemoStudent}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 text-xs font-bold text-indigo-300 border border-indigo-500/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Login as Demo Student (RakshitaD76)</span>
              </div>
              <span className="font-mono text-[10px] text-indigo-400/80">student@example.com</span>
            </button>

            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-xs font-bold text-purple-300 border border-purple-500/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Login as Demo Examiner (Dr. Sarah)</span>
              </div>
              <span className="font-mono text-[10px] text-purple-400/80">admin@example.com</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
