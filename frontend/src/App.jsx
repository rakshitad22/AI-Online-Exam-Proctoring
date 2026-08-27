import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ExamProvider } from './context/ExamContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import Instructions from './pages/student/Instructions';
import ExamEnvironment from './pages/student/ExamEnvironment';
import ExamResult from './pages/student/ExamResult';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageExams from './pages/admin/ManageExams';
import ActiveMonitoring from './pages/admin/ActiveMonitoring';
import ReportsView from './pages/admin/ReportsView';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading AI Proctoring System...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/instructions"
        element={
          <ProtectedRoute allowedRole="student">
            <Instructions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exam-room"
        element={
          <ProtectedRoute allowedRole="student">
            <ExamEnvironment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRole="student">
            <ExamResult />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute allowedRole="admin">
            <ManageExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute allowedRole="admin">
            <ActiveMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRole="admin">
            <ReportsView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ExamProvider>
    </AuthProvider>
  );
}
