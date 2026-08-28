import React, { useEffect, useState } from 'react';
import { Clock, FileText, CheckCircle2, Loader2, AlertCircle, BookOpen, Award, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const StudentPortal: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

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
        setError(isAr ? 'الرجاء تسجيل الدخول لعرض بوابة الطالب.' : 'Please sign in to view the student portal.');
        setLoading(false);
        return;
      }

      try {
        // Step 1: load profile first
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
          // Step 3: load student-specific data in parallel
          const [summaryRes, hifzRes, invoicesRes] = await Promise.allSettled([
            fetch(`/api/hifz/student/${matchingStudent.id}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`/api/hifz/records?student_id=${matchingStudent.id}&per_page=10`, { headers: { Authorization: `Bearer ${token}` } }),
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
        setError(isAr ? 'تعذر تحميل بيانات البوابة حالياً. يرجى إعادة المحاولة.' : 'Unable to load your portal data right now. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, [isAr]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500 font-arabic">
        <Loader2 className="w-5 h-5 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
        {isAr ? 'جاري تحميل بوابة الطالب…' : 'Loading student portal…'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2 font-arabic">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-arabic">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'بوابة الطالب' : 'Student Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {isAr ? 'السلام عليكم ورحمة الله، ' : 'Assalamu Alaikum, '}{profile?.full_name || (isAr ? 'الطالب' : 'Student')}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {student
              ? `${isAr ? 'رقم القيد' : 'Student ID'}: ${student.student_id_number} | ${isAr ? 'الحالة' : 'Status'}: ${student.status === 'Active' ? (isAr ? 'نشط' : 'Active') : (student.status || (isAr ? 'نشط' : 'Active'))}`
              : (isAr ? 'لم يتم العثور على سجل طالب مرتبط بعد.' : 'No linked student record found yet.')}
          </p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center min-w-[200px]">
          <div className="text-xs text-gold-400 font-semibold">
            {isAr ? 'ملخص الحفظ الأخير' : 'Latest Hifz Summary'}
          </div>
          <div className="text-xl font-extrabold text-white mt-1">
            {summary?.highest_completed_juz
              ? `${summary.highest_completed_juz} ${isAr ? 'أجزاء' : 'Juz'}`
              : (isAr ? 'لا توجد بيانات بعد' : 'No data yet')}
          </div>
          <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
            {summary?.latest_record?.sabaq?.surah || (isAr ? 'بانتظار إدخال المعلم' : 'Awaiting teacher input')}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hifz Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500 shrink-0" />
            <span>{isAr ? 'أحدث أنشطة الحفظ والتسميع' : 'Recent Hifz Activity'}</span>
          </h3>
          <div className="space-y-3 text-xs">
            {records.length > 0 ? (
              records.map((record) => (
                <div key={record.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                    <span className="text-gold-600 dark:text-gold-400">{record.sabaq?.surah || (isAr ? 'تحديث الحفظ' : 'Hifz Update')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {record.sabaq?.grade || 'A'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {record.date ? new Date(record.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB') : '—'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                    {record.teacher_notes || (isAr ? 'تم التسجيل بواسطة الشيخ/المعلم.' : 'Recorded by teacher.')}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
                {isAr ? 'لم يتم تسجيل أي أنشطة حفظ لك بعد.' : 'No hifz activity has been recorded for you yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Current Fee Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500 shrink-0" />
            <span>{isAr ? 'حالة الرسوم والفواتير الحالية' : 'Current Fee Status'}</span>
          </h3>
          <div className="space-y-3 text-xs">
            {invoices.length > 0 ? (
              invoices.map((invoice) => {
                const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
                const isPaid = invoice.status === 'Paid' || balance <= 0;
                return (
                  <div key={invoice.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                      <span>{invoice.invoice_number || `${isAr ? 'فاتورة' : 'Invoice'} #${invoice.id}`}</span>
                      <span className={`font-mono font-bold ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        GMD {balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>{isAr ? 'المبلغ الإجمالي:' : 'Total Amount:'} GMD {(invoice.total_amount || 0).toLocaleString()}</span>
                      <span>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle className="w-3 h-3" /> {isAr ? 'مسدد' : 'Paid'}
                          </span>
                        ) : invoice.status === 'Partial' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="w-3 h-3" /> {isAr ? 'جزئي' : 'Partial'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <XCircle className="w-3 h-3" /> {isAr ? 'غير مسدد' : 'Unpaid'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
                {isAr ? 'لا توجد فواتير مرتبطة بملف الطالب حالياً.' : 'No invoices are linked to your student profile yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StudentPortal;
