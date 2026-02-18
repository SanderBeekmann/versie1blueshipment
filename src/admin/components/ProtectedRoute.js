import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRoles }) {
  const { user, adminUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
      </div>
    );
  }

  if (!user || !adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(adminUser.rol)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
