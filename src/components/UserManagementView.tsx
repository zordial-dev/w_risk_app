import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Power, Check, AlertCircle, Loader2, X, Eye, EyeOff, ChevronDown, Pencil } from 'lucide-react';
import { UserAccount } from '../types/risk';

export const UserManagementView: React.FC = () => {
  const { currentUser, usersList, addUser, updateUser, toggleUserActive, deleteUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [password, setPassword] = useState('welcome123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editPassword, setEditPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword('');
    setEditShowPassword(false);
    setEditIsActive(user.isActive);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    const cleanName = editName.trim();
    const cleanEmail = editEmail.trim();
    const cleanPassword = editPassword.trim();

    if (!cleanName) {
      setEditError('Please enter the team member full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEditError('Please enter a valid corporate email address.');
      return;
    }

    if (cleanPassword && cleanPassword.length < 4) {
      setEditError('New password must be at least 4 characters long.');
      return;
    }

    setIsEditSaving(true);
    const res = await updateUser(editingUser.id, {
      name: cleanName,
      email: cleanEmail,
      role: editRole,
      ...(cleanPassword ? { password: cleanPassword } : {}),
      isActive: editIsActive,
    });
    setIsEditSaving(false);

    if (res.success) {
      setEditingUser(null);
    } else {
      setEditError(res.error || 'Failed to update user details.');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Please enter the team member full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSaving(true);
    const res = await addUser({ email: cleanEmail, name: cleanName, role, password: cleanPassword });
    setIsSaving(false);

    if (res.success) {
      setEmail('');
      setName('');
      setPassword('welcome123');
      setIsAddModalOpen(false);
    } else {
      setError(res.error || 'Failed to add user');
    }
  };

  const handleToggle = async (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      alert('You cannot disable your own active administrator account.');
      return;
    }
    setActionId(user.id);
    await toggleUserActive(user.id, !user.isActive);
    setActionId(null);
  };

  const handleDelete = async (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user account "${user.email}"?`)) {
      setActionId(user.id);
      await deleteUser(user.id);
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E274A] rounded-xl border border-black/[0.08] dark:border-blue-900/40 p-3.5 sm:p-5 shadow-xs transition-colors flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight truncate">
            Team & User Management
          </h2>
          <p className="text-[12px] text-[#86868B] dark:text-[#94A8C4] mt-0.5 truncate hidden sm:block">
            Manage personnel access, enable/disable accounts, and control roles
          </p>
          <p className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-0.5 truncate sm:hidden">
            Personnel access & roles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[11px] sm:text-[12px] font-semibold transition flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,118,206,0.25)] hover:opacity-95 whitespace-nowrap active:scale-[0.99]"
        >
          <UserPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Inset List */}
      <div className="bg-white dark:bg-[#0E274A] rounded-xl border border-black/[0.08] dark:border-blue-900/40 shadow-xs overflow-hidden transition-colors divide-y divide-black/[0.05] dark:divide-blue-900/30">
        {usersList.map((user) => {
          const isCurrent = user.id === currentUser?.id;
          const isBusy = actionId === user.id;

          return (
            <div
              key={user.id}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                !user.isActive ? 'opacity-60 bg-black/[0.01] dark:bg-white/[0.01]' : ''
              }`}
            >
              {/* User Identity Info */}
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-white flex items-center justify-center font-semibold text-[13px] shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                      {user.name}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#0076CE]/10 text-[#0076CE] dark:text-[#389BF2] border border-[#0076CE]/20">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#86868B] dark:text-[#98989D] truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Role Badge */}
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-black/[0.06] dark:bg-white/[0.1] text-[#1D1D1F] dark:text-white'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#86868B] dark:text-[#98989D]'
                  }`}
                >
                  {user.role}
                </span>

                {/* Edit User details & password */}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleOpenEdit(user)}
                  className="p-1.5 rounded-md text-[#86868B] dark:text-[#94A8C4] hover:text-[#0076CE] dark:hover:text-[#389BF2] hover:bg-[#0076CE]/10 transition"
                  title="Edit user details & password"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>

                {/* Status Toggle (Enable/Disable) */}
                <button
                  type="button"
                  disabled={isCurrent || isBusy}
                  onClick={() => handleToggle(user)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                    user.isActive
                      ? 'text-[#34C759] hover:bg-[#34C759]/10'
                      : 'text-[#FF9500] hover:bg-[#FF9500]/10'
                  } disabled:opacity-40`}
                  title={user.isActive ? 'Click to disable user' : 'Click to enable user'}
                >
                  <Power className="w-3 h-3" strokeWidth={2} />
                  <span>{user.isActive ? 'Active' : 'Disabled'}</span>
                </button>

                {/* Delete Account */}
                {!isCurrent && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDelete(user)}
                    className="p-1.5 rounded-md text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition disabled:opacity-30"
                    title="Delete user"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0E274A] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] dark:border-blue-900/40 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-blue-900/30">
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                Add New Team Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="py-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@wyndham.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                    className="w-full appearance-none bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg pl-3 pr-9 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 cursor-pointer transition"
                  >
                    <option value="user">Property Auditor (Standard User)</option>
                    <option value="admin">Executive Director (Administrator)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg pl-3 pr-9 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2 rounded bg-[#FF3B30]/10 text-[#FF3B30] text-[12px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,118,206,0.25)] transition active:scale-[0.99]"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0E274A] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] dark:border-blue-900/40 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-blue-900/30">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                  Edit Team Member
                </h3>
                <p className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-0.5">
                  Update profile information, role, or credentials
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="py-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@wyndham.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={editRole}
                    disabled={editingUser.id === currentUser?.id}
                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                    className="w-full appearance-none bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg pl-3 pr-9 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 cursor-pointer transition disabled:opacity-50"
                  >
                    <option value="user">Property Auditor (Standard User)</option>
                    <option value="admin">Executive Director (Administrator)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
                </div>
                {editingUser.id === currentUser?.id && (
                  <p className="text-[10px] text-[#86868B] dark:text-[#94A8C4] mt-1">
                    Cannot modify role for your active logged-in account.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider">
                    Update Password
                  </label>
                  <span className="text-[10px] text-[#86868B] dark:text-[#94A8C4]">Optional</span>
                </div>
                <div className="relative">
                  <input
                    type={editShowPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep unchanged"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg pl-3 pr-9 py-2 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#94A8C4] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
                    title={editShowPassword ? 'Hide password' : 'Show password'}
                  >
                    {editShowPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#86868B] dark:text-[#94A8C4] mt-1">
                  Leave empty to keep existing password, or enter 4+ characters to set a new one.
                </p>
              </div>

              {/* Active / Disabled Status */}
              {editingUser.id !== currentUser?.id && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-blue-900/30">
                  <div>
                    <div className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">
                      Account Status
                    </div>
                    <div className="text-[10px] text-[#86868B] dark:text-[#94A8C4]">
                      {editIsActive ? 'Account is active & enabled' : 'Account is locked/disabled'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(!editIsActive)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      editIsActive
                        ? 'bg-[#34C759]/15 text-[#34C759] hover:bg-[#34C759]/25'
                        : 'bg-[#FF9500]/15 text-[#FF9500] hover:bg-[#FF9500]/25'
                    }`}
                  >
                    {editIsActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              )}

              {editError && (
                <div className="p-2 rounded bg-[#FF3B30]/10 text-[#FF3B30] text-[12px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-black/[0.06] dark:border-blue-900/30">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="px-4 py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,118,206,0.25)] transition active:scale-[0.99] disabled:opacity-40"
                >
                  {isEditSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
