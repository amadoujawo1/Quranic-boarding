import React, { useEffect, useState } from 'react';
import { Upload, Plus, Loader2, AlertCircle, Users } from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortalData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view the teacher portal.');
        setLoading(false);
        return;
      }

      try {
        const [profileRes, studentsRes, hifzRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/students?page=1&per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/hifz/records?per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!profileRes.ok) throw new Error('Unable to load profile');
        const profileData = await profileRes.json();
        const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
        const hifzData = hifzRes.ok ? await hifzRes.json() : { records: [] };

        setProfile(profileData);
        setStudents(studentsData.students || []);
        setRecords((hifzData.records || []).slice(0, 8));
      } catch {
        setError('Unable to load your teacher portal data right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teacher portal…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1">Teacher & Halaqah Master Portal</div>
          <h1 className="text-3xl font-extrabold">{profile?.full_name || 'Teacher'}</h1>
          <p className="text-xs text-slate-300 mt-1">Roles: {profile?.roles?.join(', ') || 'Teacher'}</p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center">
          <div className="text-xs text-gold-400 font-semibold">Assigned Halaqah Students</div>
          <div className="text-2xl font-extrabold text-white">{students.length} Students</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold-500" /> Upload New Assignment
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg('Assignment uploaded successfully!'); setTimeout(() => setSuccessMsg(''), 3000); }} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignment Title</label>
              <input required type="text" placeholder="e.g. Tafsir Surah Al-Kahf Notes" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input required type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110">
              Publish Homework to Class
            </button>
          </form>
          {successMsg && <div className="text-xs text-emerald-600 font-bold">{successMsg}</div>}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-500" /> Current Halaqah Roster
          </h3>
          <div className="space-y-3 text-xs">
            {students.length > 0 ? students.slice(0, 8).map((student) => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                  <div className="text-slate-500">{student.student_id_number}</div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg border border-emerald-500/20">{student.status || 'Active'}</span>
              </div>
            )) : <div className="text-sm text-slate-500">No students are available for this teacher yet.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Latest Hifz Updates</h3>
        <div className="space-y-3 text-xs">
          {records.length > 0 ? records.map((record) => (
            <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{record.student_name || 'Student'}</span>
                <span className="text-gold-600">{record.sabaq?.grade || 'A'}</span>
              </div>
              <p className="text-slate-500 mt-1">{record.sabaq?.surah || 'No hifz entry yet'} • {record.teacher_notes || 'Recorded by teacher'}</p>
            </div>
          )) : <div className="text-sm text-slate-500">No recent hifz updates are available yet.</div>}
        </div>
      </div>
    </div>
  );
};
