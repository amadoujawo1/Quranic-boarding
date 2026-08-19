import React, { useEffect, useState } from 'react';
import { Clock, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortalData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view the student portal.');
        setLoading(false);
        return;
      }

      try {
        // Step 1: load profile first — this is the critical call
        const profileRes = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!profileRes.ok) throw new Error('Unable to load profile');
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Step 2: find the student record linked to this user
        const studentsRes = await fetch('/api/students?page=1&per_page=200', { headers: { Authorization: `Bearer ${token}` } });
        const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
        const matchingStudent = (studentsData.students || []).find((s: any) => s.user_id === profileData.id) || null;
        setStudent(matchingStudent);

        if (matchingStudent) {
          // Step 3: load student-specific data in parallel — failures are isolated
          const [summaryRes, hifzRes, invoicesRes] = await Promise.allSettled([
            fetch(`/api/hifz/student/${matchingStudent.id}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`/api/hifz/records?student_id=${matchingStudent.id}&per_page=5`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`/api/finance/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
            setSummary(await summaryRes.value.json());
          }
          if (hifzRes.status === 'fulfilled' && hifzRes.value.ok) {
            const hifzData = await hifzRes.value.json();
            setRecords(hifzData.records || []);
          }
          if (invoicesRes.status === 'fulfilled' && invoicesRes.value.ok) {
            const allInvoices = await invoicesRes.value.json();
            setInvoices((allInvoices || []).filter((inv: any) => inv.student_id === matchingStudent.id));
          }
        }
      } catch (err: any) {
        setError('Unable to load your portal data right now. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading student portal…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1">Student Portal</div>
          <h1 className="text-3xl font-extrabold">Assalamu Alaikum, {profile?.full_name || 'Student'}</h1>
          <p className="text-xs text-slate-300 mt-1">{student ? `Student ID: ${student.student_id_number} | Status: ${student.status || 'Active'}` : 'No linked student record found yet.'}</p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center">
          <div className="text-xs text-gold-400 font-semibold">Latest Hifz Summary</div>
          <div className="text-xl font-extrabold text-white">{summary?.highest_completed_juz ? `${summary.highest_completed_juz} Juz` : 'No data yet'}</div>
          <div className="text-[10px] text-emerald-300 font-medium">{summary?.latest_record?.sabaq?.surah || 'Awaiting teacher input'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500" /> Recent Hifz Activity
          </h3>
          <div className="space-y-3 text-xs">
            {records.length > 0 ? records.map((record) => (
              <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{record.sabaq?.surah || 'Hifz Update'}</span>
                  <span className="text-emerald-600">{record.sabaq?.grade || 'A'}</span>
                </div>
                <p className="text-slate-500 mt-1">{record.teacher_notes || 'Recorded by teacher.'}</p>
              </div>
            )) : <div className="text-sm text-slate-500">No hifz activity has been recorded for you yet.</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" /> Current Fee Status
          </h3>
          <div className="space-y-3 text-xs">
            {invoices.length > 0 ? invoices.map((invoice) => (
              <div key={invoice.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{invoice.invoice_number || `Invoice #${invoice.id}`}</span>
                  <span className="text-rose-500">${((invoice.total_amount || 0) - (invoice.amount_paid || 0)).toLocaleString()}</span>
                </div>
                <p className="text-slate-500 mt-1">Status: {invoice.status || 'Unpaid'}</p>
              </div>
            )) : <div className="text-sm text-slate-500">No invoices are linked to your student profile yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
