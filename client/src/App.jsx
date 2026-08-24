import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import AdminDashboard from './screens/AdminDashboard';

// Helper component for root '/' redirect
const RootRedirect = () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (token) {
    if (role === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Header />
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Standard User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin User Management Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
