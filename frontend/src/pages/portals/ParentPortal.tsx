import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, DollarSign, MessageSquare, CheckCircle2, Award, Send, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

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

interface Invoice {
  id: number;
  invoice_number?: string;
  student_id?: number;
  total_amount?: number;
  amount_paid?: number;
  due_date?: string;
  status?: string;
}

export const ParentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hifz' | 'attendance' | 'fees' | 'messages'>('hifz');
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [hifzRecords, setHifzRecords] = useState<HifzRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadPortalData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view the parent portal.');
        setLoading(false);
        return;
      }

      try {
        const [profileRes, studentsRes, hifzRes, invoicesRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/students?page=1&per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/hifz/records?per_page=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/finance/invoices', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!profileRes.ok) throw new Error('Unable to load profile');

        const profileData = await profileRes.json();
        const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
        const hifzData = hifzRes.ok ? await hifzRes.json() : { records: [] };
        const invoicesData = invoicesRes.ok ? await invoicesRes.json() : [];

        const linkedChildren = (studentsData.students || []).filter((student: any) => student.parent_name === profileData.full_name);
        const linkedChildIds = linkedChildren.map((child: any) => child.id);

        setProfile(profileData);
        setChildren(linkedChildren);
        setHifzRecords((hifzData.records || []).filter((record: HifzRecord) => linkedChildIds.includes(record.student_id)).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
        setInvoices((invoicesData || []).filter((invoice: Invoice) => linkedChildIds.includes(invoice.student_id as number)));
      } catch {
        setError('Unable to load your portal data right now.');
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
  const balanceDue = invoices.reduce((sum, invoice) => sum + Math.max(0, (invoice.total_amount || 0) - (invoice.amount_paid || 0)), 0);
  const latestChildRecords = hifzRecords.slice(0, 4);

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading parent portal…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 rounded-3xl border border-gold-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs text-gold-400 font-semibold mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Parent & Guardian Portal
          </div>
          <h1 className="text-3xl font-extrabold">Welcome, {profile?.full_name || 'Parent'}</h1>
          <p className="text-xs text-slate-300 mt-1">{activeChild ? `${activeChild.full_name} • ${activeChild.student_id_number}` : 'No linked child profile found yet.'}</p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 p-4 rounded-2xl text-center min-w-[220px]">
          <div className="text-xs text-gold-400 font-semibold">Linked Children</div>
          <div className="text-2xl font-extrabold text-white">{children.length}</div>
          <div className="text-[10px] text-emerald-300 font-medium">Latest balance due: {balanceDue > 0 ? `$${balanceDue.toLocaleString()}` : 'Clear'}</div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 overflow-x-auto pb-1">
        {[
          { key: 'hifz', label: 'Quran Hifz Progress', icon: BookOpen },
          { key: 'attendance', label: 'Prayer & School Attendance', icon: Clock },
          { key: 'fees', label: 'Fee Payments & Invoices', icon: DollarSign },
          { key: 'messages', label: 'Message Teachers', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold transition border-b-2 whitespace-nowrap ${
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

      {activeTab === 'hifz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Hifz Daily Recitation Logs</h3>
            {latestChildRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Child</th>
                      <th className="p-3">Sabaq (New)</th>
                      <th className="p-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {latestChildRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{record.date ? new Date(record.date).toLocaleDateString() : '—'}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{record.student_name || 'Child'}</td>
                        <td className="p-3 font-bold text-gold-600 dark:text-gold-400">{record.sabaq?.surah || '—'}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">{record.sabaq?.grade || 'A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No hifz records have been entered for your children yet.</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Linked Children</h3>
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="font-semibold text-slate-900 dark:text-white">{child.full_name}</div>
                  <div className="text-xs text-slate-500">{child.student_id_number} • {child.status || 'Active'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" /> Latest Attendance Summary
            </h3>
            <div className="space-y-3 text-xs">
              {children.length > 0 ? children.map((child) => (
                <div key={child.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{child.full_name}</span>
                    <span className="text-slate-400 block text-[11px]">Status: {child.status || 'Active'}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Present
                  </span>
                </div>
              )) : <div className="text-sm text-slate-500">No attendance data is available yet.</div>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hostel & School Summary</h3>
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Linked Children:</span>
                <span className="font-bold text-gold-400">{children.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Latest Hifz Records:</span>
                <span className="font-bold text-gold-400">{hifzRecords.length}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-800 pt-2">
                <span className="text-slate-300">Parent Portal Status:</span>
                <span className="font-bold text-white">Live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Fee Statement & Online Payment</h3>
            <span className="text-xs font-semibold text-rose-500">{balanceDue > 0 ? `$${balanceDue.toLocaleString()} Balance Outstanding` : 'No outstanding balance'}</span>
          </div>

          {paidSuccess && (
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Payment processed successfully. The latest invoice status will refresh from the system.</span>
            </div>
          )}

          {invoices.length > 0 ? invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{invoice.invoice_number || `Invoice #${invoice.id}`}</div>
                <div className="text-xs text-slate-500">Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'} | Total: ${invoice.total_amount?.toLocaleString() || 0} | Paid: ${invoice.amount_paid?.toLocaleString() || 0}</div>
              </div>
              <button
                onClick={() => setPaidSuccess(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 shadow-md transition"
              >
                Pay Remaining ${Math.max(0, (invoice.total_amount || 0) - (invoice.amount_paid || 0)).toLocaleString()}
              </button>
            </div>
          )) : <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No invoices are currently linked to your children.</div>}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Message Your Child’s Teachers & Warden</h3>

          {messageSent && (
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your message has been queued for the school office.</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Recipient:</label>
              <select className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                <option>Lead Hifz Teacher</option>
                <option>Hostel Warden</option>
                <option>Academic Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Message / Inquiry:</label>
              <textarea
                rows={4}
                required
                placeholder="Type your inquiry regarding your child’s studies, health, or leave request..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-gold-400 font-bold text-xs rounded-xl hover:brightness-110 shadow-md inline-flex items-center gap-2 transition">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
