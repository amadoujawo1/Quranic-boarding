import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, ShieldCheck, Search, X, Check, Edit, Trash2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  // Form State
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', full_name: '', role: 'Teacher' });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    student_id_number: '',
    gender: 'Male',
    date_of_birth: '2013-01-01',
    parent_name: '',
    parent_phone: '',
    parent_relationship: 'Father'
  });
  
  const allRoles = ['Super Admin', 'Admin', 'Teacher', 'Parent', 'Student', 'Hifz Coordinator', 'Accountant'];

  useEffect(() => {
    fetchUsers();
    fetchStudentCount();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStudentCount(data.total || (data.students || []).length);
      }
    } catch (e) { /* ignore */ }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewUser({ username: '', email: '', password: '', full_name: '', role: 'Teacher' });
        fetchUsers();
      } else {
        alert('Failed to create user. Make sure username/email is unique.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newStudent,
        student_id_number: newStudent.student_id_number || `QBS-2026-${String(studentCount + 1).padStart(3, '0')}`,
        email: newStudent.email || `std_QBS-2026-${String(studentCount + 1).padStart(3, '0')}@qbsms.edu`
      };
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        setShowStudentModal(false);
        setNewStudent({ full_name: '', email: '', student_id_number: '', gender: 'Male', date_of_birth: '2013-01-01', parent_name: '', parent_phone: '', parent_relationship: 'Father' });
        fetchUsers();
        fetchStudentCount();
        alert('Student registered successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to register student.');
      }
    } catch (error) {
      alert('Network error: Could not reach the server.');
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Delete user "${user.full_name}"? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete user.');
      }
    } catch (e) {
      alert('Network error: Could not reach the server.');
    }
  };

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRoleModal) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${showRoleModal.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roles: selectedRoles })
      });
      if (res.ok) {
        setShowRoleModal(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-gold-500" /> User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Create accounts, register students, and manage system privileges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStudentModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 hover:brightness-110 transition flex items-center gap-1.5 shadow-md">
            <GraduationCap className="w-4 h-4" /> Register Student
          </button>
          <button onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:brightness-110 transition flex items-center gap-1.5 shadow-md">
            <PlusCircle className="w-4 h-4" /> Add New User
          </button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-7 top-6" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Roles / Privileges</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-white">{u.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r: string) => (
                      <span key={r} className="px-2 py-0.5 rounded-lg bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-300 font-bold text-[10px]">
                        {r}
                      </span>
                    ))}
                    {u.roles.length === 0 && <span className="text-slate-400 italic">No roles</span>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setShowRoleModal(u); setSelectedRoles(u.roles); }}
                      className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Manage Roles
                    </button>
                    <button onClick={() => handleDeleteUser(u)}
                      className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-xs">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Register Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={handleRegisterStudent} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gold-500" /> Register Student Admission
                </h3>
                <button type="button" onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Full Name <span className="text-rose-500">*</span></label>
                <input required type="text" value={newStudent.full_name} onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  placeholder="e.g. Abdullahi Ceesay"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-gold-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent / Guardian Full Name</label>
                <input type="text" value={newStudent.parent_name} onChange={e => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                  placeholder="e.g. Sheikh Ibrahim Al-Faruq"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-gold-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                  <select value={newStudent.parent_relationship} onChange={e => setNewStudent({ ...newStudent, parent_relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs">
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Phone</label>
                  <input type="text" value={newStudent.parent_phone} onChange={e => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                    placeholder="+220 700 0000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select value={newStudent.gender} onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input type="date" value={newStudent.date_of_birth} onChange={e => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStudentModal(false)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 transition">Register Student</button>
              </div>
            </motion.form>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={handleCreateUser} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-500" /> Create New User
                </h3>
                <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" required value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none">
                    {allRoles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition">Create User</button>
              </div>
            </motion.form>
          </div>
        )}

        {/* Manage Roles Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={handleUpdateRoles} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-500" /> Manage Privileges
                </h3>
                <button type="button" onClick={() => setShowRoleModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              
              <p className="text-xs text-slate-500">Select the roles to assign to <strong className="text-slate-900 dark:text-white">{showRoleModal.full_name}</strong>.</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {allRoles.map(role => (
                  <label key={role} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{role}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowRoleModal(null)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition">Save Privileges</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
