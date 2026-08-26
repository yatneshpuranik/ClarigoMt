import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading && !user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#0d0d0c] text-[#8a8782] text-xs">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0d0c] p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-[#171614] border border-white/[0.08] rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded bg-[#f2994a]/20 text-[#f2994a] border border-[#f2994a]/30 flex items-center justify-center font-medium text-base">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-xl font-medium text-[#f2f0ec] tracking-tight">
                  Welcome, {user?.fullName || 'User'}
                </h1>
                <p className="text-xs text-[#8a8782]">{user?.email}</p>
              </div>
            </div>

            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'Admin'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                Role: {user?.role || 'User'}
              </span>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#1a1918] border border-white/[0.08] p-3.5 rounded space-y-1">
              <span className="text-[11px] text-[#8a8782] font-normal">
                Account ID
              </span>
              <p className="text-xs font-mono text-[#f2f0ec] truncate">
                {user?.id || user?._id || 'N/A'}
              </p>
            </div>

            <div className="bg-[#1a1918] border border-white/[0.08] p-3.5 rounded space-y-1">
              <span className="text-[11px] text-[#8a8782] font-normal">
                Authentication status
              </span>
              <p className="text-xs font-medium text-[#5fae7f] flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fae7f] mr-2"></span>
                Session active (JWT protected)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            {user?.role === 'Admin' ? (
              <Link
                to="/admin"
                className="bg-[#f2994a] hover:bg-[#eb5e28] text-[#0d0d0c] font-medium text-xs px-3.5 py-2 rounded"
              >
                Go to admin panel →
              </Link>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleLogout}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-[#f2f0ec] border border-white/[0.1] font-normal text-xs px-3.5 py-2 rounded"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
