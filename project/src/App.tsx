import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelect from './components/RoleSelect';
import AuthForm from './components/AuthForm';
import DonorDashboard from './pages/DonorDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';

function AppRoutes() {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // If user is logged in and on login/signup page, redirect to dashboard
    if (userData && (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/')) {
      if (userData.role === 'donor') {
        navigate('/donor/dashboard');
      } else if (userData.role === 'organizer') {
        navigate('/organizer/dashboard');
      }
    }
  }, [userData, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/signup" element={<AuthForm mode="signup" />} />
      <Route 
        path="/donor/dashboard" 
        element={
          <ProtectedRoute role="donor">
            <DonorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizer/dashboard" 
        element={
          <ProtectedRoute role="organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}