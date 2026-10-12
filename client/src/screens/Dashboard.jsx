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

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'SuperAdmin';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0d0c] p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
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
              </div>
            </div>

            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                Role: {user?.role || 'User'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isAdmin ? (
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
              className="bg-white/[0.05] hover:bg-white/[0.1] text-[#f2f0ec] border border-white/[0.1] font-normal text-xs px-3.5 py-2 rounded cursor-pointer"
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
