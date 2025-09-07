import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'donor' | 'organizer';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (role && userData?.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}