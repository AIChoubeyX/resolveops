import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export const ProtectedRoute = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">Loading your workspace...</div>;
  }
  return user && !loading ? (profile ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />) : <Navigate to="/login" replace state={{ from: location }} />;
};
