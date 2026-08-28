import React, { useEffect, useState } from 'react';
import { Upload, Plus, Loader2, AlertCircle, Users, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TeacherPortal: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

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
        setError(isAr ? 'الرجاء تسجيل الدخول لعرض بوابة المعلم.' : 'Please sign in to view the teacher portal.');
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
        setError(isAr ? 'تعذر تحميل بيانات بوابة المعلم حالياً.' : 'Unable to load your teacher portal data right now.');
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
        {isAr ? 'جاري تحميل بوابة المعلم…' : 'Loading teacher portal…'}
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
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'بوابة المعلم وشيخ الحلقة' : 'Teacher & Halaqah Master Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {isAr ? 'أهلاً وسهلاً، ' : 'Welcome, '}{profile?.full_name || (isAr ? 'المعلم' : 'Teacher')}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isAr ? 'الصلاحيات:' : 'Roles:'} {profile?.roles?.join(', ') || (isAr ? 'معلم' : 'Teacher')}
          </p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center min-w-[200px]">
          <div className="text-xs text-gold-400 font-semibold">
            {isAr ? 'طلاب الحلقة المسندين' : 'Assigned Halaqah Students'}
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {students.length} {isAr ? 'طالب' : 'Students'}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Homework / Assignment */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold-500 shrink-0" />
            <span>{isAr ? 'إسناد واجب / مهمة جديدة' : 'Upload New Assignment'}</span>
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSuccessMsg(isAr ? 'تم نشر الواجب بنجاح للطلاب!' : 'Assignment uploaded successfully!');
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'عنوان الواجب / السورة المقررة' : 'Assignment Title'}
              </label>
              <input
                required
                type="text"
                placeholder={isAr ? 'مثال: حفظ سورة الكهف من الآية 1 إلى 15' : 'e.g. Tafsir Surah Al-Kahf Notes'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'تاريخ التسليم / التسميع' : 'Due Date'}
              </label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110 shadow cursor-pointer"
            >
              {isAr ? 'نشر الواجب للحلقة' : 'Publish Homework to Class'}
            </button>
          </form>
          {successMsg && (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Halaqah Roster */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-500 shrink-0" />
            <span>{isAr ? 'قائمة طلاب الحلقة الحالية' : 'Current Halaqah Roster'}</span>
          </h3>
          <div className="space-y-3 text-xs">
            {students.length > 0 ? (
              students.slice(0, 8).map((student) => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                    <div className="text-slate-500 text-[11px]">{student.student_id_number}</div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg border border-emerald-500/20 text-[10px]">
                    {student.status === 'Active' ? (isAr ? 'نشط' : 'Active') : (student.status || (isAr ? 'نشط' : 'Active'))}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 p-4 text-center">
                {isAr ? 'لا يوجد طلاب مسندون لهذا المعلم حالياً.' : 'No students are available for this teacher yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest Hifz Updates */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gold-500 shrink-0" />
          <span>{isAr ? 'آخر تحديثات الحفظ والتسميع' : 'Latest Hifz Updates'}</span>
        </h3>
        <div className="space-y-3 text-xs">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{record.student_name || (isAr ? 'الطالب' : 'Student')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {record.sabaq?.grade || 'A'}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  {record.sabaq?.surah || (isAr ? 'لم يُسجل حفظ بعد' : 'No hifz entry yet')} • {record.teacher_notes || (isAr ? 'تم التسجيل بواسطة الشيخ' : 'Recorded by teacher')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 p-4 text-center">
              {isAr ? 'لا توجد تحديثات حفظ حديثة بعد.' : 'No recent hifz updates are available yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TeacherPortal;
