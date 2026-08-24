import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  let user = null;

  try {
    const rawUser = sessionStorage.getItem('user');
    if (rawUser) {
      user = JSON.parse(rawUser);
    }
  } catch (e) {
    console.error('Failed to parse user from sessionStorage:', e);
  }

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <header className="bg-[#0f0e0d] border-b border-white/[0.08] text-[#f2f0ec] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Logo / Brand */}
          <Link
            to={token ? (role === 'Admin' ? '/admin' : '/dashboard') : '/login'}
            className="flex items-center space-x-2 shrink-0"
          >
            <div className="w-7 h-7 rounded bg-[#f2994a] flex items-center justify-center font-medium text-[#0d0d0c] text-xs">
              M
            </div>
            <span className="font-medium text-sm tracking-tight text-[#f2f0ec] hidden min-[360px]:inline">
              AuthDash
            </span>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar py-1">
            {token && user ? (
              <>
                <div className="flex items-center space-x-1.5 bg-[#171614] px-2 sm:px-3 py-1 rounded border border-white/[0.08] max-w-[140px] min-[400px]:max-w-[200px] sm:max-w-none">
                  <span className="text-[11px] sm:text-xs font-normal text-[#f2f0ec] truncate">
                    {user.fullName || user.email}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      role === 'Admin'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {role || 'User'}
                  </span>
                </div>

                {role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="text-[11px] sm:text-xs text-[#8a8782] hover:text-[#f2f0ec] px-2 py-1.5 rounded hover:bg-white/[0.05] font-normal shrink-0"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="text-[11px] sm:text-xs text-[#8a8782] hover:text-[#f2f0ec] px-2 py-1.5 rounded hover:bg-white/[0.05] font-normal shrink-0"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-[11px] sm:text-xs bg-white/[0.05] hover:bg-white/[0.1] text-[#f2f0ec] border border-white/[0.1] font-normal px-2.5 sm:px-3 py-1.5 rounded shrink-0"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs text-[#8a8782] hover:text-[#f2f0ec] font-normal px-2.5 py-1.5 rounded hover:bg-white/[0.05]"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-xs bg-[#f2994a] hover:bg-[#eb5e28] text-[#0d0d0c] font-medium px-3 py-1.5 rounded"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
