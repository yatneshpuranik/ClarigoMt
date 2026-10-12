import { useState, useEffect } from 'react';

const UserModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false, apiError = '', isSelf = false }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (initialData) {
        setFullName(initialData.fullName || '');
        setEmail(initialData.email || '');
        setPassword('');
        setRole(initialData.role || 'User');
      } else {
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('User');
      }
      setErrors({});
    }, 0);
    return () => clearTimeout(timer);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!initialData) {
      if (!password) {
        newErrors.password = 'Password is required for new user';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters if changed';
    }

    if (!['Admin', 'User'].includes(role)) {
      newErrors.role = 'Role must be Admin or User';
    }

    if (isSelf && role !== 'Admin') {
      newErrors.role = 'You cannot demote your own administrator account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      role,
    };

    if (password) {
      payload.password = password;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d0d0c]/80 backdrop-blur-none">
      <div className="bg-[#171614] border border-white/[0.08] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.08] flex justify-between items-center bg-[#171614] sticky top-0 z-10">
          <h3 className="text-sm sm:text-base font-medium text-[#f2f0ec]">
            {initialData ? 'Edit user account' : 'Add new user'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#8a8782] hover:text-[#f2f0ec] p-1.5 rounded hover:bg-white/[0.05] text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1">
          {apiError && (
            <div className="bg-[#e0645a]/10 border border-[#e0645a]/30 text-[#e0645a] text-xs px-3.5 py-2.5 rounded break-words-anywhere">
              {apiError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Full name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.fullName && <p className="text-xs text-[#e0645a] mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Email address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.email && <p className="text-xs text-[#e0645a] mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              Password {initialData ? '(leave blank to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={initialData ? '••••••••' : 'At least 6 characters'}
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
            {errors.password && <p className="text-xs text-[#e0645a] mt-1">{errors.password}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-normal text-[#8a8782] mb-1.5">
              User role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSelf ? (
                <option value="Admin">Administrator (Your active account)</option>
              ) : (
                <>
                  <option value="User">Standard user</option>
                  <option value="Admin">Administrator</option>
                </>
              )}
            </select>
            {isSelf && (
              <p className="text-[11px] text-[#8a8782] mt-1">
                You cannot demote your own active administrator account.
              </p>
            )}
            {errors.role && <p className="text-xs text-[#e0645a] mt-1">{errors.role}</p>}
          </div>

          {/* Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-normal text-[#8a8782] hover:text-[#f2f0ec] hover:bg-white/[0.05] rounded text-center min-h-[38px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#0d0d0c] bg-[#f2994a] hover:bg-[#eb5e28] rounded disabled:opacity-50 text-center min-h-[38px]"
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Save changes'
                : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
