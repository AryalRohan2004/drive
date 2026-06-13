import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container section text-center" style={{ padding: '6rem 0' }}>
        <div className="loading-spinner" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return (
      <div className="container section text-center" style={{ padding: '6rem 0' }}>
        <h1 className="h2">Access Denied</h1>
        <p className="text-muted" style={{ marginTop: '1rem' }}>
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}
