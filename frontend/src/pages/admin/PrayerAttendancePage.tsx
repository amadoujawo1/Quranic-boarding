import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Save, Calendar } from 'lucide-react';

export const PrayerAttendancePage: React.FC = () => {
  const [selectedPrayer, setSelectedPrayer] = useState('Fajr');
  const [selectedDate, setSelectedDate] = useState('2026-07-25');
  const [saved, setSaved] = useState(false);

  const [students, setStudents] = useState([
    { id: 1, name: 'Youssef Al-Faruq', id_num: 'QBS-2026-001', room: 'Abu Bakr 101', status: 'Jamaat' },
    { id: 2, name: 'Zaid Ibn Harith', id_num: 'QBS-2026-002', room: 'Abu Bakr 101', status: 'Jamaat' },
    { id: 3, name: 'Tariq Ziad', id_num: 'QBS-2026-014', room: 'Abu Bakr 102', status: 'Late' },
    { id: 4, name: 'Hamza Bilal', id_num: 'QBS-2026-089', room: 'Umar 201', status: 'Jamaat' },
    { id: 5, name: 'Bilal Hassan', id_num: 'QBS-2026-092', room: 'Umar 202', status: 'Excused (Sickbay)' },
  ]);

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const toggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Jamaat' ? 'Late' : currentStatus === 'Late' ? 'Absent' : 'Jamaat';
    setStudents(students.map(s => s.id === id ? { ...s, status: nextStatus } : s));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Congregational Prayer Attendance</h1>
          <p className="text-xs text-slate-500">Record Fajr, Dhuhr, Asr, Maghrib, and Isha Jamaat attendance in the mosque.</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition"
        >
          <Save className="w-4 h-4" /> Save Prayer Attendance Log
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Prayer attendance saved to central database.</span>
        </div>
      )}

      {/* Selector controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Prayer Time</label>
          <div className="flex gap-2">
            {prayers.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPrayer(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  selectedPrayer === p
                    ? 'bg-emerald-950 text-gold-400 border border-gold-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="p-4">Student ID</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Dorm Room</th>
              <th className="p-4">Prayer Status</th>
              <th className="p-4 text-right">Quick Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-bold text-gold-600 dark:text-gold-400">{s.id_num}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                <td className="p-4 text-slate-500">{s.room}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    s.status === 'Jamaat' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(s.id, s.status)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
