import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserSuccess } from '../store/authSlice';
import api from '../services/api';
import UserModal from '../components/UserModal';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const currentAdminId = currentUser?.id || currentUser?._id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Confirm State
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/users');
        if (isMounted) setUsers(response.data);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching users:', err);
          if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError('Failed to fetch user accounts');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError('');
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    setModalError('');
    setSuccessMsg('');

    try {
      if (selectedUser) {
        // Edit User
        const response = await api.put(`/users/${selectedUser._id}`, formData);
        setUsers(users.map((u) => (u._id === selectedUser._id ? response.data : u)));
        setSuccessMsg(`User "${response.data.fullName}" updated successfully.`);

        // Synchronize Redux shared auth state if active admin edited themselves
        if (currentAdminId && selectedUser._id === currentAdminId) {
          dispatch(updateUserSuccess(response.data));
        }
      } else {
        // Add User
        const response = await api.post('/users', formData);
        setUsers([response.data, ...users]);
        setSuccessMsg(`User "${response.data.fullName}" created successfully.`);
      }
      handleCloseModal();
    } catch (err) {
      console.error('User submit error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setModalError(err.response.data.message);
      } else {
        setModalError('Failed to save user details');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user) => {
    if (currentAdminId && user._id === currentAdminId) {
      setError('You cannot delete your own logged-in administrator account.');
      return;
    }
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setSuccessMsg('');
    setError('');

    try {
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setSuccessMsg(`User "${userToDelete.fullName}" deleted successfully.`);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete user error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete user');
      }
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d0d0c] p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-[#f2f0ec] tracking-tight">
              User management
            </h1>
            <p className="text-xs text-[#8a8782] mt-0.5">
              Manage user accounts, roles, and access credentials
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f2994a] hover:bg-[#eb5e28] text-[#0d0d0c] font-medium px-4 py-2 rounded text-xs transition-colors min-h-[40px] cursor-pointer"
          >
            + Add user
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="bg-[#5fae7f]/10 border border-[#5fae7f]/30 text-[#5fae7f] text-xs px-3.5 py-2.5 rounded flex items-center justify-between break-words-anywhere">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-[#5fae7f] hover:text-[#5fae7f]/80 p-1">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="bg-[#e0645a]/10 border border-[#e0645a]/30 text-[#e0645a] text-xs px-3.5 py-2.5 rounded flex items-center justify-between break-words-anywhere">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-[#e0645a] hover:text-[#e0645a]/80 p-1">
              ✕
            </button>
          </div>
        )}

        {/* Filter and Stats Bar */}
        <div className="bg-[#171614] border border-white/[0.08] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name, email or role..."
              className="w-full bg-[#1a1918] border border-white/[0.1] text-[#f2f0ec] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#f2994a] focus:ring-1 focus:ring-[#f2994a]/40 placeholder:text-[#5a5854]"
            />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-normal text-[#8a8782] w-full sm:w-auto justify-between sm:justify-end">
            <span className="bg-[#1a1918] px-2.5 py-1 rounded border border-white/[0.08]">
              Total users: <strong className="text-[#f2f0ec] font-medium">{users.length}</strong>
            </span>
            <span className="bg-[#1a1918] px-2.5 py-1 rounded border border-white/[0.08]">
              Admins: <strong className="text-[#f2f0ec] font-medium">{users.filter((u) => u.role === 'Admin').length}</strong>
            </span>
          </div>
        </div>

        {/* Main Content Area: Desktop Table + Mobile Cards */}
        <div className="bg-[#171614] border border-white/[0.08] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#8a8782] text-xs">
              Loading user accounts...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-[#5a5854] text-xs">
              No users matching your filter.
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Visible on sm screens and larger >=640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs text-[#f2f0ec]">
                  <thead className="bg-[#1a1918] border-b border-white/[0.08] text-[#8a8782] font-normal">
                    <tr>
                      <th className="px-4 py-3 font-normal">User</th>
                      <th className="px-4 py-3 font-normal">Email</th>
                      <th className="px-4 py-3 font-normal">Role</th>
                      <th className="px-4 py-3 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {filteredUsers.map((u) => {
                      const isCurrentAdmin = currentAdminId && u._id === currentAdminId;
                      return (
                        <tr key={u._id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#f2f0ec] flex items-center space-x-2.5">
                            <div className="w-6 h-6 rounded bg-[#f2994a]/10 text-[#f2994a] border border-[#f2994a]/20 flex items-center justify-center font-medium text-[11px] shrink-0">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="truncate max-w-[180px] lg:max-w-none">
                              {u.fullName}
                              {isCurrentAdmin && (
                                <span className="ml-1.5 text-[10px] text-[#f2994a] font-normal">
                                  (You)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[#8a8782] truncate max-w-[200px] lg:max-w-none">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium inline-block ${
                                u.role === 'Admin'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] text-[#f2f0ec] border border-white/[0.1] rounded font-normal text-[11px] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u)}
                              disabled={isCurrentAdmin}
                              title={
                                isCurrentAdmin
                                  ? 'You cannot delete your own logged-in admin account'
                                  : 'Delete user'
                              }
                              className={`px-2.5 py-1 rounded font-normal text-[11px] ${
                                isCurrentAdmin
                                  ? 'bg-white/[0.02] text-white/20 border border-white/[0.04] cursor-not-allowed'
                                  : 'bg-[#e0645a]/10 hover:bg-[#e0645a]/20 text-[#e0645a] border border-[#e0645a]/30 cursor-pointer'
                              }`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Visible on mobile screens <640px) */}
              <div className="block sm:hidden divide-y divide-white/[0.08]">
                {filteredUsers.map((u) => {
                  const isCurrentAdmin = currentAdminId && u._id === currentAdminId;
                  return (
                    <div key={u._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-7 h-7 rounded bg-[#f2994a]/10 text-[#f2994a] border border-[#f2994a]/20 flex items-center justify-center font-medium text-xs shrink-0">
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#f2f0ec] truncate">
                              {u.fullName}
                              {isCurrentAdmin && (
                                <span className="ml-1 text-[11px] text-[#f2994a] font-normal">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-xs font-mono text-[#8a8782] break-words-anywhere">{u.email}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                            u.role === 'Admin'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="flex-1 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-[#f2f0ec] border border-white/[0.1] rounded font-normal text-xs text-center min-h-[38px] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u)}
                          disabled={isCurrentAdmin}
                          title={
                            isCurrentAdmin
                              ? 'You cannot delete your own logged-in admin account'
                              : 'Delete user'
                          }
                          className={`flex-1 py-2 rounded font-normal text-xs text-center min-h-[38px] ${
                            isCurrentAdmin
                              ? 'bg-white/[0.02] text-white/20 border border-white/[0.04] cursor-not-allowed'
                              : 'bg-[#e0645a]/10 hover:bg-[#e0645a]/20 text-[#e0645a] border border-[#e0645a]/30 cursor-pointer'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={selectedUser}
        isSubmitting={isSubmitting}
        apiError={modalError}
        isSelf={!!(selectedUser && currentAdminId && selectedUser._id === currentAdminId)}
      />

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0d0c]/80">
          <div className="bg-[#171614] border border-white/[0.08] rounded-xl p-4 sm:p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-medium text-[#f2f0ec]">Confirm delete user</h3>
            <p className="text-[#8a8782] text-xs break-words-anywhere">
              Are you sure you want to delete user{' '}
              <strong className="text-[#f2f0ec] font-medium">{userToDelete.fullName}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setUserToDelete(null)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-normal text-[#8a8782] hover:text-[#f2f0ec] hover:bg-white/[0.05] rounded min-h-[38px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-white bg-[#e0645a] hover:bg-[#d55349] rounded min-h-[38px]"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
