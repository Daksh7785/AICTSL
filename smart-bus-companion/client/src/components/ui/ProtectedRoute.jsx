import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requireAdmin }) => {
  // Check if we have an active session or token stored. 
  // In a real app we'd decode JWT or check context. 
  // Here we use localStorage 'userRole' set by the silent refresh/login.
  const role = localStorage.getItem('userRole');

  if (!role) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
