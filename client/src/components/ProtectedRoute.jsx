import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Verify token validity against MongoDB backend
    api
      .get('/auth/me')
      .then((res) => {
        setIsAuthenticated(true);
        sessionStorage.setItem('role', res.data.role);
        sessionStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error('Token validation error:', err);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (!token || !isAuthenticated) {
    if (!loading && (!token || !isAuthenticated)) {
      return <Navigate to="/login" replace />;
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#0d0d0c] text-[#8a8782] text-xs">
        Loading session...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
