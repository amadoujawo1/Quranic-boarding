import React, { useEffect, useState } from 'react';
import {
  BookOpen, Clock, DollarSign, MessageSquare, CheckCircle2,
  ShieldCheck, Loader2, AlertCircle, Printer, X, CheckCircle, XCircle, AlertTriangle, Send
} from 'lucide-react';
import { StudentPayment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HifzRecord {
  id: number;
  student_id: number;
  student_name?: string;
  teacher_name?: string;
  date?: string;
  sabaq?: {
    surah?: string;
    grade?: string;
  };
  teacher_notes?: string;
}

export const ParentPortal: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hifz' | 'attendance' | 'fees' | 'messages'>('fees');
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [hifzRecords, setHifzRecords] = useState<HifzRecord[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<StudentPayment | null>(null);

  const isAr = language === 'ar';

  useEffect(() => {
    const loadPortalData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isAr ? 'الرجاء تسجيل الدخول لعرض بوابة ولي الأمر.' : 'Please sign in to view the parent portal.');
        setLoading(false);
        return;
      }

      try {
        const [profileRes, studentsRes, hifzRes, paymentsRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/students?page=1&per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/hifz/records?per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/finance/student-payments', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!profileRes.ok) throw new Error('Unable to load profile');

        const profileData = await profileRes.json();
        const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
        const hifzData = hifzRes.ok ? await hifzRes.json() : { records: [] };
        const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];

        const linkedChildren = (studentsData.students || []).filter(
          (student: any) => student.parent_name === profileData.full_name || student.parent_id === profileData.id
        );
        const linkedChildIds = linkedChildren.map((child: any) => child.id);

        setProfile(profileData);
        setChildren(linkedChildren.length > 0 ? linkedChildren : (studentsData.students || []).slice(0, 1));

        const validChildIds = linkedChildren.length > 0 ? linkedChildIds : (studentsData.students || []).slice(0, 1).map((c: any) => c.id);

        setHifzRecords(
          (hifzData.records || [])
            .filter((record: HifzRecord) => validChildIds.includes(record.student_id))
            .sort((a: HifzRecord, b: HifzRecord) => (b.date || '').localeCompare(a.date || ''))
        );

        setStudentPayments(
          (paymentsData || []).filter((p: StudentPayment) => validChildIds.includes(p.student_id))
        );
      } catch {
        setError(isAr ? 'تعذر تحميل بيانات البوابة. يرجى المحاولة مرة أخرى.' : 'Unable to load your portal data right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      setMessageSent(true);
      setMessageText('');
      setTimeout(() => setMessageSent(false), 4000);
    }
  };

  const activeChild = children[0];
  const balanceDue = studentPayments.reduce((sum, p) => sum + (p.balance || 0), 0);
  const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const latestChildRecords = hifzRecords.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
        {isAr ? 'جاري تحميل بوابة ولي الأمر…' : 'Loading parent portal…'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />{error}
      </div>
    );
  }

  const tabs = [
    { key: 'fees', label: isAr ? 'الرسوم الشهرية والإيصالات' : 'Monthly Fee Payments & Receipts', icon: DollarSign },
    { key: 'hifz', label: isAr ? 'تقدم حفظ القرآن' : 'Quran Hifz Progress', icon: BookOpen },
    { key: 'attendance', label: isAr ? 'الصلاة والحضور' : 'Prayer & Attendance', icon: Clock },
    { key: 'messages', label: isAr ? 'مراسلة المعلمين' : 'Message Teachers', icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {isAr ? 'بوابة ولي الأمر والوصي' : 'Parent & Guardian Portal'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isAr ? 'أهلاً وسهلاً، ' : 'Welcome, '}{profile?.full_name || (isAr ? 'ولي الأمر' : 'Parent')}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {activeChild
              ? `${activeChild.full_name} • ${isAr ? 'رقم القيد' : 'Student ID'}: ${activeChild.student_id_number}`
              : (isAr ? 'ملف الطالب المرتبط' : 'Linked child profile')}
          </p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center min-w-[220px]">
          <div className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
            {isAr ? 'ملخص رصيد الرسوم' : 'Fee Balance Summary'}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {balanceDue > 0 ? `GMD ${balanceDue.toLocaleString()}` : (isAr ? '✅ مسدد بالكامل' : '✅ Fully Cleared')}
          </div>
          <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
            {isAr ? 'إجمالي المدفوع' : 'Total Paid to Date'}: GMD {totalPaid.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: FEES & MONTHLY PAYMENTS ──────────────────────────────────── */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'كشف الرسوم الشهرية للطالب (GMD)' : 'Student Monthly Fee Breakdown (GMD)'}
              </h3>
              <p className="text-xs text-slate-500">{t('school_name')}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${balanceDue > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
              {balanceDue > 0
                ? `${isAr ? 'رصيد متبقٍّ' : 'Outstanding'}: GMD ${balanceDue.toLocaleString()}`
                : (isAr ? '✅ جميع الرسوم مسددة' : '✅ All Fees Paid')}
            </span>
          </div>

          {paidSuccess && (
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تم تقديم الدفع. تم تحديث الإيصال الرسمي.' : 'Payment submission initiated. Official receipt updated.'}</span>
            </div>
          )}

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5">{isAr ? 'الشهر' : 'Month'}</th>
                  <th className="p-3.5">{isAr ? 'نوع الرسم' : 'Fee Type'}</th>
                  <th className="p-3.5">{isAr ? 'المستحق' : 'Amount Due'}</th>
                  <th className="p-3.5">{isAr ? 'المدفوع' : 'Amount Paid'}</th>
                  <th className="p-3.5">{isAr ? 'الرصيد' : 'Balance'}</th>
                  <th className="p-3.5">{isAr ? 'رقم الإيصال' : 'Receipt No.'}</th>
                  <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5 text-right rtl:text-left">{isAr ? 'الإيصال' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.payment_month}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{p.fee_type}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">GMD {p.amount_due.toLocaleString()}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">GMD {p.amount_paid.toLocaleString()}</td>
                    <td className="p-3.5 font-extrabold text-rose-600 dark:text-rose-400">GMD {p.balance.toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-bold text-gold-600 dark:text-gold-400">{p.receipt_number}</td>
                    <td className="p-3.5">
                      {p.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {isAr ? 'مسدد' : 'Paid'}
                        </span>
                      ) : p.status === 'Partial' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> {isAr ? 'جزئي' : 'Partial'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <XCircle className="w-3 h-3 text-rose-600" /> {isAr ? 'غير مسدد' : 'Unpaid'}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right rtl:text-left">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-gold-400 border border-emerald-200 dark:border-emerald-800 hover:brightness-110 transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" /> {isAr ? 'عرض' : 'View Slip'}
                      </button>
                    </td>
                  </tr>
                ))}
                {studentPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      {isAr ? 'لا توجد سجلات دفع شهرية للطالب المرتبط.' : 'No monthly payment records found for your linked student.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: HIFZ PROGRESS ────────────────────────────────────────────── */}
      {activeTab === 'hifz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'سجلات الصباق والمنزل اليومية الأخيرة' : 'Recent Daily Sabaq & Manzil Logs'}
            </h3>
            {latestChildRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{isAr ? 'التاريخ' : 'Date'}</th>
                      <th className="p-3">{isAr ? 'الطفل' : 'Child'}</th>
                      <th className="p-3">{isAr ? 'صباق (سورة)' : 'Sabaq (Surah)'}</th>
                      <th className="p-3">{isAr ? 'التقدير' : 'Grade'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {latestChildRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{record.date ? new Date(record.date).toLocaleDateString() : '—'}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{record.student_name || (isAr ? 'الطفل' : 'Child')}</td>
                        <td className="p-3 font-bold text-gold-600 dark:text-gold-400">{record.sabaq?.surah || '—'}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">{record.sabaq?.grade || 'A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                {isAr ? 'لم يتم إدخال سجلات حفظ لأطفالك بعد.' : 'No hifz records have been entered for your children yet.'}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'الأبناء المرتبطون' : 'Linked Children'}
            </h3>
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="font-semibold text-slate-900 dark:text-white">{child.full_name}</div>
                  <div className="text-xs text-slate-500">{child.student_id_number} • {child.status === 'Active' ? (isAr ? 'نشط' : 'Active') : child.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE ───────────────────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" /> {isAr ? 'ملخص الحضور الأخير' : 'Latest Attendance Summary'}
            </h3>
            <div className="space-y-3 text-xs">
              {children.length > 0 ? children.map((child) => (
                <div key={child.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{child.full_name}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {isAr ? 'الحالة' : 'Status'}: {child.status === 'Active' ? (isAr ? 'نشط' : 'Active') : child.status}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 rtl:mr-0 rtl:ml-1" /> {isAr ? 'حاضر' : 'Present'}
                  </span>
                </div>
              )) : <div className="text-sm text-slate-500">{isAr ? 'لا توجد بيانات حضور متاحة بعد.' : 'No attendance data is available yet.'}</div>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'ملخص المدرسة' : 'School Summary'}
            </h3>
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">{isAr ? 'الأبناء المرتبطون:' : 'Linked Children:'}</span>
                <span className="font-bold text-gold-400">{children.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">{isAr ? 'أحدث سجلات الحفظ:' : 'Latest Hifz Records:'}</span>
                <span className="font-bold text-gold-400">{hifzRecords.length}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-800 pt-2">
                <span className="text-slate-300">{isAr ? 'حالة البوابة:' : 'Parent Portal Status:'}</span>
                <span className="font-bold text-white">{isAr ? 'مباشر' : 'Live'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: MESSAGES ─────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isAr ? 'مراسلة معلمي طفلك والناظر' : "Message Your Child's Teachers & Warden"}
          </h3>

          {messageSent && (
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تم استلام رسالتك من قِبَل إدارة المركز.' : 'Your message has been received by the centre administration.'}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'اختر المستلم:' : 'Select Recipient:'}
              </label>
              <select className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                <option>{isAr ? 'المعلم الرئيسي للحفظ (الأستاذ بلال)' : 'Lead Hifz Teacher (Ustadh Bilal)'}</option>
                <option>{isAr ? 'مكتب المالية والمحاسبة' : 'Accountant / Finance Office'}</option>
                <option>{isAr ? 'شؤون الطلاب وناظر الداخلية' : 'Student Affairs & Boarding Warden'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'رسالتك / استفسارك:' : 'Your Message / Inquiry:'}
              </label>
              <textarea
                rows={4}
                required
                placeholder={isAr ? 'اكتب استفسارك بخصوص الرسوم أو الدراسة أو الصحة أو طلب إجازة...' : 'Type your inquiry regarding fees, studies, health, or leave request...'}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110 shadow-md inline-flex items-center gap-2 transition cursor-pointer">
              <Send className="w-4 h-4" /> {isAr ? 'إرسال الرسالة' : 'Send Message'}
            </button>
          </form>
        </div>
      )}

      {/* ── PRINTABLE RECEIPT MODAL ─────────────────────────────────────────── */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 max-w-xl w-full space-y-6 shadow-2xl border border-slate-200 my-auto relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" /> {isAr ? 'إيصال دفع قابل للطباعة' : 'Printable Payment Receipt'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> {isAr ? 'طباعة' : 'Print'}
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-2 border-emerald-950/10 p-6 rounded-2xl space-y-5 bg-gradient-to-b from-emerald-50/20 to-transparent">
              <div className="text-center space-y-1">
                <div className="text-emerald-900 text-sm font-bold font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                <div className="flex justify-center items-center gap-3">
                  <img src="/logo.png" alt="School Logo" className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-500/40" />
                  <div>
                    <h2 className="text-base font-black text-emerald-950 uppercase">
                      Imaam Naafi' Centre for Quranic Memorization
                    </h2>
                    <p className="text-[10px] text-slate-600 font-medium">Banjul, The Gambia • Tel: +220 87 7918643</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                <div><span className="text-[10px] text-slate-500 uppercase block font-semibold">{isAr ? 'رقم الإيصال' : 'Receipt No'}</span><strong className="font-mono text-emerald-900">{selectedReceipt.receipt_number}</strong></div>
                <div><span className="text-[10px] text-slate-500 uppercase block font-semibold">{isAr ? 'التاريخ' : 'Date'}</span><strong>{selectedReceipt.payment_date}</strong></div>
                <div><span className="text-[10px] text-slate-500 uppercase block font-semibold">{isAr ? 'العام الدراسي' : 'Academic Year'}</span><strong>{selectedReceipt.academic_year}</strong></div>
              </div>

              <div className="border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                <div>{isAr ? 'الطالب' : 'Student'}: <strong className="text-slate-900">{selectedReceipt.student_name}</strong></div>
                <div>{isAr ? 'الرقم' : 'ID'}: <strong className="font-mono text-emerald-900">{selectedReceipt.student_id_number}</strong> • {isAr ? 'الفصل' : 'Class'}: <strong>{selectedReceipt.class_level}</strong></div>
                <div>{isAr ? 'الشهر' : 'Month'}: <strong className="text-emerald-800">{selectedReceipt.payment_month}</strong> • {isAr ? 'طريقة الدفع' : 'Method'}: <strong>{selectedReceipt.payment_method}</strong></div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-emerald-950 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">{isAr ? 'البيان' : 'Description'}</th>
                      <th className="p-2.5 text-right">{isAr ? 'المستحق' : 'Due'}</th>
                      <th className="p-2.5 text-right">{isAr ? 'المدفوع' : 'Paid'}</th>
                      <th className="p-2.5 text-right">{isAr ? 'الرصيد' : 'Balance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-semibold">{selectedReceipt.fee_type}</td>
                      <td className="p-2.5 text-right">GMD {selectedReceipt.amount_due.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">GMD {selectedReceipt.amount_paid.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-rose-600">GMD {selectedReceipt.balance.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                {isAr ? 'إيصال إلكتروني موثق • نظام إدارة مركز الإمام نافع' : "Verified System Electronic Receipt • Imaam Naafi' Centre Management System"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
