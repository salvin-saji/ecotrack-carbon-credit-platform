import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  // redirect to home (not /login) so back-button never loops to a stale login page
  if (!user) return <Navigate to="/" replace />;
  return children;
}
