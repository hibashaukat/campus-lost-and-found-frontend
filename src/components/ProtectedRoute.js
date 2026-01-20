import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || !userRole) {
    // No token or role, redirect to login
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    // Wrong role, redirect to appropriate dashboard
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User is authorized
  return children;
};

export default ProtectedRoute;