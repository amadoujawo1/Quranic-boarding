import React, { useState } from 'react';
import { Users, Search, Plus, QrCode, Filter, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showQrModal, setShowQrModal] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [students, setStudents] = useState<any[]>([]);

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newStudent,
        student_id_number: newStudent.student_id_number || `QBS-2026-00${students.length + 1}`,
        email: newStudent.email || `std_QBS-2026-00${students.length + 1}@qbsms.edu`
      };
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const created = await response.json();
        setStudents([...students, created]);
        setShowAddModal(false);
        setNewStudent({ full_name: '', email: '', student_id_number: '', gender: 'Male', date_of_birth: '2013-01-01', parent_name: '', parent_phone: '', parent_relationship: 'Father' });
      } else {
        try {
          const errorData = await response.json();
          alert(errorData.message || "Failed to add student");
        } catch (e) {
          alert("Server error. Please check if the backend is running.");
        }
      }
    } catch (error) {
      console.error("Error adding student", error);
      alert("Network error: Could not reach the server.");
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-xs text-slate-500">Admissions, Student Profiles, QR Code Student IDs, and Documents.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Register New Student
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">Student ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Parent / Guardian</th>
              <th className="p-4">Hifz Progress</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="p-4 font-bold text-gold-600 dark:text-gold-400">{s.student_id_number}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{s.full_name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{s.gender}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{s.parent_name || 'N/A'}</td>
                <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{s.hifz_juz || 0} / 30 Juz</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[10px]">
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => setShowQrModal(s)}
                    className="p-1.5 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 transition"
                    title="View QR ID Card"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Code ID Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gold-500 rounded-3xl p-8 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="bg-emerald-950 p-4 rounded-2xl text-white border border-gold-500/30 space-y-2">
              <div className="text-xs font-bold text-gold-400">Quranic Boarding School</div>
              <div className="text-lg font-extrabold">{showQrModal.full_name}</div>
              <div className="text-xs text-slate-300">{showQrModal.student_id_number}</div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mx-auto w-44 h-44 flex items-center justify-center">
              {/* Simulated QR Code SVG */}
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v20 h-10 z M40,40 h20 v20 h-20 z M70,40 h20 v10 h-20 z M50,70 h30 v20 h-30 z" />
              </svg>
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 bg-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110"
            >
              Close ID Card
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddStudent} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Student Admission</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
              <input required type="text" value={newStudent.full_name} onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent / Guardian Full Name</label>
              <input required type="text" value={newStudent.parent_name} onChange={(e) => setNewStudent({...newStudent, parent_name: e.target.value})} placeholder="e.g. Sheikh Ibrahim Al-Faruq" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                <select value={newStudent.parent_relationship} onChange={(e) => setNewStudent({...newStudent, parent_relationship: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs">
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Phone / Contact</label>
                <input type="text" value={newStudent.parent_phone} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} placeholder="+220 700 0000" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select value={newStudent.gender} onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110">Save Student</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
