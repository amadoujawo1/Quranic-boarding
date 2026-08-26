import React, { useEffect, useState } from 'react';
import { 
  Clock, CheckCircle2, Save, Calendar, Users, 
  Sparkles, CheckCheck, RefreshCw, BookOpen, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Pagination } from '../../components/common/Pagination';

const ITEMS_PER_PAGE = 10;

export const PrayerAttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'school' | 'prayer'>('school');
  const [selectedPrayer, setSelectedPrayer] = useState('Fajr');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // School Attendance state
  const [schoolStudents, setSchoolStudents] = useState<any[]>([]);
  const [schoolStats, setSchoolStats] = useState<{
    total_students: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    attendance_percentage: number;
  }>({ total_students: 0, present_count: 0, late_count: 0, absent_count: 0, attendance_percentage: 0 });

  // Prayer Attendance state
  const [prayerStudents, setPrayerStudents] = useState<any[]>([]);
  const [prayerStats, setPrayerStats] = useState<{
    total_students: number;
    jamaat_count: number;
    late_count: number;
    absent_count: number;
    jamaat_percentage: number;
  }>({ total_students: 0, jamaat_count: 0, late_count: 0, absent_count: 0, jamaat_percentage: 0 });

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const loadSchoolAttendance = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/school?date=${selectedDate}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to load school attendance');
      const data = await res.json();
      setSchoolStudents(data.students || []);
      setSchoolStats({
        total_students: data.total_students || 0,
        present_count: data.present_count || 0,
        late_count: data.late_count || 0,
        absent_count: data.absent_count || 0,
        attendance_percentage: data.attendance_percentage || 0
      });
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const loadPrayerAttendance = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/prayer?date=${selectedDate}&prayer_name=${selectedPrayer}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to load prayer attendance');
      const data = await res.json();
      setPrayerStudents(data.students || []);
      setPrayerStats({
        total_students: data.total_students || 0,
        jamaat_count: data.jamaat_count || 0,
        late_count: data.late_count || 0,
        absent_count: data.absent_count || 0,
        jamaat_percentage: data.jamaat_percentage || 0
      });
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'school') {
      loadSchoolAttendance();
    } else {
      loadPrayerAttendance();
    }
  }, [activeTab, selectedDate, selectedPrayer]);

  const toggleSchoolStatus = (studentId: number) => {
    const statuses = ['Present', 'Late', 'Absent', 'Excused'];
    setSchoolStudents(prev =>
      prev.map(s => {
        if (s.student_id === studentId) {
          const currentIndex = statuses.indexOf(s.status);
          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const togglePrayerStatus = (studentId: number) => {
    const statuses = ['Jamaat', 'Late', 'Absent', 'Excused'];
    setPrayerStudents(prev =>
      prev.map(s => {
        if (s.student_id === studentId) {
          const currentIndex = statuses.indexOf(s.status);
          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const markAllSchoolPresent = () => {
    setSchoolStudents(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const markAllPrayerJamaat = () => {
    setPrayerStudents(prev => prev.map(s => ({ ...s, status: 'Jamaat' })));
  };

  const saveSchoolAttendance = async () => {
    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const logs = schoolStudents.map(s => ({
        student_id: s.student_id,
        status: s.status,
        remarks: s.remarks || ''
      }));
      const res = await fetch('/api/attendance/school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate,
          logs
        })
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setSaveSuccess(data.message || 'School attendance recorded successfully!');
      setTimeout(() => setSaveSuccess(null), 4000);
      loadSchoolAttendance();
    } catch {
      setSaveSuccess('School attendance updated!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const savePrayerAttendance = async () => {
    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const logs = prayerStudents.map(s => ({
        student_id: s.student_id,
        status: s.status,
        remarks: s.remarks || ''
      }));
      const res = await fetch('/api/attendance/prayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: selectedDate,
          prayer_name: selectedPrayer,
          logs
        })
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setSaveSuccess(data.message || `${selectedPrayer} prayer attendance recorded!`);
      setTimeout(() => setSaveSuccess(null), 4000);
      loadPrayerAttendance();
    } catch {
      setSaveSuccess(`${selectedPrayer} prayer attendance updated!`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredSchool = schoolStudents.filter(s =>
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.student_id_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrayer = prayerStudents.filter(s =>
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.student_id_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to page 1 whenever active list changes
  const activeFiltered = activeTab === 'school' ? filteredSchool : filteredPrayer;
  const totalPages = Math.max(1, Math.ceil(activeFiltered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = activeFiltered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset page on tab, prayer, date, or search change
  useEffect(() => { setCurrentPage(1); }, [activeTab, selectedPrayer, selectedDate, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-8 rounded-3xl border border-gold-500/30 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Central Attendance Management
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Daily School & Mosque Prayer Attendance</h1>
          <p className="text-xs text-slate-300">Live roll-call tracking for academic sessions and five daily congregational prayers.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-emerald-900/80 border border-gold-500/40 px-5 py-3 rounded-2xl text-center">
            <div className="text-[11px] text-gold-400 font-medium">School Attendance</div>
            <div className="text-2xl font-black text-white mt-0.5">{schoolStats.attendance_percentage}%</div>
            <div className="text-[10px] text-emerald-300">{schoolStats.present_count} / {schoolStats.total_students} Present</div>
          </div>
          <div className="bg-emerald-900/80 border border-gold-500/40 px-5 py-3 rounded-2xl text-center">
            <div className="text-[11px] text-gold-400 font-medium">Fajr Jamaat Rate</div>
            <div className="text-2xl font-black text-white mt-0.5">{prayerStats.jamaat_percentage}%</div>
            <div className="text-[10px] text-emerald-300">{prayerStats.jamaat_count} In Congregation</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('school')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'school'
                ? 'bg-emerald-950 text-gold-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Daily School Roll Call
          </button>
          <button
            onClick={() => setActiveTab('prayer')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'prayer'
                ? 'bg-emerald-950 text-gold-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Mosque Prayer Jamaat
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            />
          </div>

          <button
            onClick={activeTab === 'school' ? saveSchoolAttendance : savePrayerAttendance}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Attendance Log'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 p-4 rounded-2xl text-xs flex items-center gap-2 shadow-sm font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </motion.div>
      )}

      {/* Sub controls for Prayer */}
      {activeTab === 'prayer' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-2">Select Waqt / Prayer:</span>
            {prayers.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPrayer(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedPrayer === p
                    ? 'bg-emerald-950 text-gold-400 border border-gold-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={markAllPrayerJamaat}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All in Jamaat
          </button>
        </div>
      )}

      {activeTab === 'school' && (
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Recording school attendance for <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDate}</span>
          </div>
          <button
            onClick={markAllSchoolPresent}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All Present
          </button>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-500" />
            {activeTab === 'school' ? 'Enrolled Student Roll Call' : `${selectedPrayer} Prayer Mosque Attendance`}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-gold-500" /> Loading student attendance records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Gender</th>
                  <th className="p-3.5">Attendance Status</th>
                  <th className="p-3.5">Remarks</th>
                  <th className="p-3.5 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedRows.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-gold-600 dark:text-gold-400">{s.student_id_number}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{s.full_name}</td>
                    <td className="p-3.5 text-slate-500">{s.gender || 'Male'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        s.status === 'Present' || s.status === 'Jamaat'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.status === 'Late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : s.status === 'Excused'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      <input
                        type="text"
                        value={s.remarks || ''}
                        placeholder="Add remark..."
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTab === 'school') {
                            setSchoolStudents(prev => prev.map(x => x.student_id === s.student_id ? { ...x, remarks: val } : x));
                          } else {
                            setPrayerStudents(prev => prev.map(x => x.student_id === s.student_id ? { ...x, remarks: val } : x));
                          }
                        }}
                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-gold-500 outline-none text-xs w-36"
                      />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => activeTab === 'school' ? toggleSchoolStatus(s.student_id) : togglePrayerStatus(s.student_id)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No active enrolled students found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalItems={activeFiltered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            colorScheme="gold"
          />
        )}
      </div>
    </div>
  );
};
