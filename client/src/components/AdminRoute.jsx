import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

const AdminRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const [verifiedRole, setVerifiedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Always verify active session and actual role directly against MongoDB backend (/api/auth/me)
    api
      .get('/auth/me')
      .then((res) => {
        setVerifiedRole(res.data.role);
        // Correct any tampered sessionStorage values with authoritative DB data
        sessionStorage.setItem('role', res.data.role);
        sessionStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error('Session verification error:', err);
        setVerifiedRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#0d0d0c] text-[#8a8782] text-xs">
        Verifying permissions...
      </div>
    );
  }

  if (verifiedRole !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
