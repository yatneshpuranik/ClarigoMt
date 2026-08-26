import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#0d0d0c] text-[#8a8782] text-xs">
        Verifying permissions...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;

