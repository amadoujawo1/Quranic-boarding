import React, { useState, useRef } from 'react';
import { Users, Search, Plus, QrCode, Filter, Eye, CheckCircle2, ShieldAlert, Pencil, Trash2, X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Pagination } from '../../components/common/Pagination';

export const StudentManagement: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin') || user?.roles?.includes('Super Administrator');

  const [search, setSearch] = useState('');
  const [showQrModal, setShowQrModal] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);

  const [students, setStudents] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students?per_page=1000', {
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
      const payload = { ...newStudent };
      
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

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${showEditModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: showEditModal.full_name,
          gender: showEditModal.gender,
          date_of_birth: showEditModal.date_of_birth,
          status: showEditModal.status,
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setStudents(students.map(s => s.id === updated.id ? updated : s));
        setShowEditModal(null);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to update student');
      }
    } catch (error) {
      alert('Network error. Could not reach the server.');
    }
  };

  const handleDeleteStudent = async () => {
    if (!showDeleteConfirm) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setStudents(students.filter(s => s.id !== showDeleteConfirm.id));
        setShowDeleteConfirm(null);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete student');
      }
    } catch (error) {
      alert('Network error. Could not reach the server.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResults(null);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setImportResults(data);
        fetchStudents();
      } else {
        setImportResults({ error: data.message || 'Import failed.' });
      }
    } catch {
      setImportResults({ error: 'Network error. Could not reach the server.' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = 'full_name,gender,date_of_birth,parent_name,parent_phone,parent_relationship,student_id_number';
    const sample  = 'Ahmad Ceesay,Male,2012-06-15,Ibrahim Ceesay,+220700000,Father,QBS-2026-001';
    const blob = new Blob([`${headers}\n${sample}\n`], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id_number.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate paginated students (10 entries per page)
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-xs text-slate-500">Admissions, Student Profiles, QR Code Student IDs, and Documents.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={downloadTemplate}
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-sm transition border border-slate-200 dark:border-slate-700"
            title="Download CSV template"
          >
            <Download className="w-4 h-4" /> Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition disabled:opacity-60"
          >
            <Upload className="w-4 h-4" /> {importing ? 'Importing…' : 'Import CSV / XLSX'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Register New Student
          </button>
        </div>
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
            {currentStudents.map((s) => (
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
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* QR Code — always visible */}
                    <button
                      onClick={() => setShowQrModal(s)}
                      className="p-1.5 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 transition"
                      title="View QR ID Card"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Edit — Admin / Super Admin only */}
                    {isAdmin && (
                      <button
                        onClick={() => setShowEditModal({ ...s, date_of_birth: s.date_of_birth || '' })}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition"
                        title="Edit Student"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete — Admin / Super Admin only */}
                    {isAdmin && (
                      <button
                        onClick={() => setShowDeleteConfirm(s)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <Pagination
          currentPage={safeCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          colorScheme="gold"
        />
      </div>

      {/* Import Results Modal */}
      {importResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" /> Import Results
              </h3>
              <button onClick={() => setImportResults(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {importResults.error ? (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" /> {importResults.error}
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">{importResults.summary?.total ?? 0}</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Total Rows</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{importResults.summary?.imported ?? 0}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">Imported</div>
                  </div>
                  <div className="text-center p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl">
                    <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{importResults.summary?.failed ?? 0}</div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider mt-0.5">Failed</div>
                  </div>
                </div>

                {/* Per-row results */}
                <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                  {(importResults.results || []).map((r: any) => (
                    <div key={r.row} className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs ${
                      r.status === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                    }`}>
                      {r.status === 'success'
                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      <span>
                        <span className="font-bold">Row {r.row}:</span>{' '}
                        {r.status === 'success' ? `${r.name} (${r.student_id})` : r.error}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setImportResults(null)} className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:brightness-110">Close</button>
          </div>
        </div>
      )}

      {/* QR Code ID Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gold-500 rounded-3xl p-8 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="bg-emerald-950 p-4 rounded-2xl text-white border border-gold-500/30 space-y-2">
              <div className="text-xs font-bold text-gold-400">Centre for Quranic Memorization</div>
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

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditStudent} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" /> Edit Student
              </h3>
              <button type="button" onClick={() => setShowEditModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                required type="text"
                value={showEditModal.full_name}
                onChange={e => setShowEditModal({ ...showEditModal, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={showEditModal.gender}
                  onChange={e => setShowEditModal({ ...showEditModal, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={showEditModal.date_of_birth}
                  onChange={e => setShowEditModal({ ...showEditModal, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={showEditModal.status}
                onChange={e => setShowEditModal({ ...showEditModal, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(null)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:brightness-110">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-3xl p-8 max-w-sm w-full space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Student?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently remove <span className="font-semibold text-slate-800 dark:text-slate-200">{showDeleteConfirm.full_name}</span> and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl">Cancel</button>
              <button onClick={handleDeleteStudent} className="w-1/2 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:brightness-110">Yes, Delete</button>
            </div>
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
              <input type="text" value={newStudent.parent_name} onChange={(e) => setNewStudent({...newStudent, parent_name: e.target.value})} placeholder="e.g. Sheikh Ibrahim Al-Faruq" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs" />
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
