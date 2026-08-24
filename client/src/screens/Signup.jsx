import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [adminKey, setAdminKey] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token) {
      if (role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!['Admin', 'User'].includes(role)) {
      newErrors.role = 'Role must be Admin or User';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      const { token, user } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', user.role);

      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Unable to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 bg-[#0d0d0c] relative overflow-hidden">
      {/* Decorative Single Warm Radial Glow */}
      <div className="absolute w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-[#f2994a]/10 blur-[100px] sm:blur-[120px] pointer-events-none -z-0"></div>

      <div className="w-full max-w-sm bg-[#171614] border border-white/[0.08] rounded-xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative z-10">
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-medium text-[#f2f0ec] tracking-tight leading-tight">
            Create an account
          </h1>
          <p className="text-xs text-[#8a8782]">Register a new user or administrator account</p>
        </div>

        {apiError && (
          <div className="bg-[#e0645a]/10 border border-[#e0645a]/30 text-[#e0645a] text-xs px-3.5 py-2.5 rounded break-words-anywhere">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.fullName && <p className="text-xs text-[#e0645a] mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.email && <p className="text-xs text-[#e0645a] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.password && <p className="text-xs text-[#e0645a] mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Register as role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40"
            >
              <option value="User">Standard user</option>
              <option value="Admin">Administrator</option>
            </select>
            {errors.role && <p className="text-xs text-[#e0645a] mt-1">{errors.role}</p>}
          </div>

          {/* Conditional Admin Key input field when Admin role selected */}
          {role === 'Admin' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
                Admin key (Optional)
              </label>
              <input
                type="text"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="e.g. ADMIN_SECRET_KEY"
                className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f2994a] hover:bg-[#eb5e28] text-[#0d0d0c] font-medium text-sm py-2.5 px-4 rounded transition-colors disabled:opacity-50 mt-1 cursor-pointer min-h-[44px]"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.08] text-center">
          <p className="text-xs text-[#8a8782]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#f2994a] hover:text-[#eb5e28] font-normal">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
