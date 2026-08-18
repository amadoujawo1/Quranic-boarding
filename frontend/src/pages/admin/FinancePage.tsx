import React, { useState, useEffect, useRef } from 'react';
import {
  Edit, Trash2,
  DollarSign, FileText, PlusCircle, CheckCircle2, AlertTriangle,
  Clock, TrendingUp, Wallet, CreditCard, Gift, Search,
  ChevronDown, X, ReceiptText, Building2, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// ── Animated counter ─────────────────────────────────────────────────────────
const Counter = ({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (isInView) {
      const ctrl = animate(0, target, { duration: 1.8, ease: 'easeOut', onUpdate: v => setVal(Math.floor(v)) });
      return ctrl.stop;
    }
  }, [isInView, target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Paid:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    Partial: 'bg-amber-100  text-amber-800  dark:bg-amber-950  dark:text-amber-300',
    Unpaid:  'bg-rose-100   text-rose-800   dark:bg-rose-950   dark:text-rose-300',
    Overdue: 'bg-red-100    text-red-800    dark:bg-red-950    dark:text-red-300',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

// ── Charts data dynamically calculated inside component ────────────────────

// =============================================================================
export const FinancePage: React.FC = () => {

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin') || user?.roles?.includes('Super Administrator');

  const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null);
  const [editDonationId, setEditDonationId] = useState<number | null>(null);
  const [editExpenseId, setEditExpenseId] = useState<number | null>(null);

  const [tab, setTab]             = useState<'invoices' | 'donations' | 'expenses'>('invoices');
  const [invoices, setInvoices]   = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [expenses, setExpenses]   = useState<any[]>([]);
  const [students, setStudents]   = useState<any[]>([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Modals
  const [showInvoiceModal, setShowInvoiceModal]   = useState(false);
  const [showPaymentModal, setShowPaymentModal]   = useState<any>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal]   = useState(false);

  const BLANK_INVOICE = { student_id: '', student_name: '', invoice_number: '', academic_term: 'Term 1', academic_year: '2026/2027', period_type: 'Term', period_value: 'Term 1', tuition_fee: 1200, due_date: '2026-09-30' };
  const [newInvoice, setNewInvoice] = useState<any>(BLANK_INVOICE);
  const [payAmount, setPayAmount]   = useState('');
  const [payMethod, setPayMethod]   = useState('Bank Transfer');
  const [newDonation, setNewDonation] = useState({ donor_name: '', amount: '', purpose: 'General Sadaqah' });
  const [newExpense, setNewExpense] = useState({ category: 'Kitchen & Nutrition', description: '', amount: '' });

  // Load real data when logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-jwt-token') return;
    fetch('/api/finance/invoices', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d && d.length) setInvoices(d); }).catch(() => {});
    fetch('/api/finance/donations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d && d.length) setDonations(d); }).catch(() => {});
    fetch('/api/students?per_page=500', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d && d.students) setStudents(d.students); }).catch(() => {});
  }, []);

  // Stats
  const totalRevenue  = invoices.reduce((s, i) => s + (i.amount_paid || 0), 0);
  const totalOutstand = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);
  const totalDonation = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalExpense  = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Dynamic charts data
  const getMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = new Array(12).fill(0);
    
    invoices.forEach((inv: any) => {
      if (inv.amount_paid > 0) {
        const date = new Date(inv.created_at || inv.due_date || Date.now());
        monthlyTotals[date.getMonth()] += inv.amount_paid;
      }
    });

    donations.forEach((d: any) => {
      const date = new Date(d.created_at || Date.now());
      monthlyTotals[date.getMonth()] += d.amount;
    });

    const currentMonth = new Date().getMonth();
    
    return {
      labels: months.slice(0, currentMonth + 1),
      datasets: [{
        label: 'Revenue Collected (D)',
        data: monthlyTotals.slice(0, currentMonth + 1),
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212,175,55,0.12)',
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const getBreakdownData = () => {
    let tuition = 0;
    let otherFees = 0;

    invoices.forEach((inv: any) => {
      const ratio = inv.total_amount > 0 ? inv.amount_paid / inv.total_amount : 0;
      const cleanTuition = Number(inv.tuition_fee || 0);
      const cleanOtherFees = Number(inv.total_amount || 0) - cleanTuition;

      tuition += cleanTuition * ratio;
      otherFees += cleanOtherFees * ratio;
    });

    return {
      labels: ['Tuition', 'Other Fees', 'Donations'],
      datasets: [{
        data: [Math.round(tuition), Math.round(otherFees), Math.round(totalDonation)].filter((value) => value > 0),
        backgroundColor: ['#0f8a4f', '#d4af37', '#8b5cf6'],
        borderWidth: 0,
      }]
    };
  };

  const revenueData = getMonthlyRevenue();
  const breakdownData = getBreakdownData();

  const summaryCards = [
    { title: 'Total Revenue',    value: totalRevenue,  prefix: 'D', icon: TrendingUp,    color: 'emerald' },
    { title: 'Outstanding Fees', value: totalOutstand, prefix: 'D', icon: AlertTriangle, color: 'rose'    },
    { title: 'Total Donations',  value: totalDonation, prefix: 'D', icon: Gift,          color: 'purple'  },
    { title: 'Total Expenses',   value: totalExpense,  prefix: 'D', icon: Wallet,        color: 'amber'   },
  ];

  // Handlers

  const handleDelete = async (type: string, id: number) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this record?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/finance/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (type === 'invoices') setInvoices(invoices.filter((i:any) => i.id !== id));
        if (type === 'donations') setDonations(donations.filter((d:any) => d.id !== id));
        if (type === 'expenses') setExpenses(expenses.filter((e:any) => e.id !== id));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to delete.');
      }
    } catch (e) { alert('Error deleting record. Please check your connection.'); }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const total = newInvoice.tuition_fee;

    const resetForm = () => { setShowInvoiceModal(false); setEditInvoiceId(null); setNewInvoice(BLANK_INVOICE); setStudentSearchQuery(''); };

    if (editInvoiceId) {
      const res = await fetch(`/api/finance/invoices/${editInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoices(invoices.map((i:any) => i.id === editInvoiceId ? updated : i));
        resetForm();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to update invoice.');
      }
    } else {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newInvoice, total_amount: total })
      });
      if (res.ok) {
        const created = await res.json();
        setInvoices([created, ...invoices]);
        resetForm();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to create invoice. Please check all fields.');
      }
    }
  };


  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!showPaymentModal || isNaN(amt) || amt <= 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/finance/invoices/${showPaymentModal.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, payment_method: payMethod })
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
        setShowPaymentModal(null);
        setPayAmount('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to record payment.');
      }
    } catch {
      alert('Network error. Could not reach the server.');
    }
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (editDonationId) {
      const res = await fetch(`/api/finance/donations/${editDonationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newDonation)
      });
      if (res.ok) {
        setDonations(donations.map((d:any) => d.id === editDonationId ? { ...d, ...newDonation, amount: parseFloat(newDonation.amount as string), last_edited_by: user.full_name || 'Admin' } : d));
        setShowDonationModal(false); setEditDonationId(null); setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' });;
        setEditDonationId(null);
      }
    } else {
      const res = await fetch('/api/finance/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newDonation)
      });
      if (res.ok) {
        const created = await res.json();
        setDonations([{ ...newDonation, id: created.id, amount: parseFloat(newDonation.amount as string), created_at: new Date().toISOString() }, ...donations]);
        setShowDonationModal(false); setEditDonationId(null); setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' });;
      }
    }
    setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' });
  };


  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (editExpenseId) {
      const res = await fetch(`/api/finance/expenses/${editExpenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        setExpenses(expenses.map((eItem:any) => eItem.id === editExpenseId ? { ...eItem, ...newExpense, amount: parseFloat(newExpense.amount as string), last_edited_by: user.full_name || 'Admin' } : eItem));
        setShowExpenseModal(false); setEditExpenseId(null); setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' });;
        setEditExpenseId(null);
      }
    } else {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        const created = await res.json();
        setExpenses([{ ...newExpense, id: created.id, amount: parseFloat(newExpense.amount as string), expense_date: new Date().toISOString() }, ...expenses]);
        setShowExpenseModal(false); setEditExpenseId(null); setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' });;
      }
    }
    setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' });
  };


  const filteredModalStudents = students.filter((s: any) => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (s.full_name || '').toLowerCase().includes(q) || (s.student_id_number || '').toLowerCase().includes(q);
  });

  const filteredInvoices = invoices.filter((inv: any) => {
    const studentName = (inv.student_name || '').toLowerCase();
    const invoiceNumber = (inv.invoice_number || '').toLowerCase();
    const matchSearch = studentName.includes(search.toLowerCase()) || invoiceNumber.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    rose:    'bg-rose-50    dark:bg-rose-950/60    text-rose-600    dark:text-rose-400',
    purple:  'bg-purple-50  dark:bg-purple-950/60  text-purple-600  dark:text-purple-400',
    amber:   'bg-amber-50   dark:bg-amber-950/60   text-amber-600   dark:text-amber-400',
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fee &amp; Financials</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tuition invoices, payments, donations, and expense tracking.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowDonationModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow">
            <Gift className="w-3.5 h-3.5" /> {editDonationId ? 'Edit Donation' : 'Record Donation'}
          </button>
          <button onClick={() => setShowExpenseModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition flex items-center gap-1.5 shadow">
            <Wallet className="w-3.5 h-3.5" /> {editExpenseId ? 'Edit Expense' : 'Log Expense'}
          </button>
          <button onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 hover:brightness-110 transition flex items-center gap-1.5 shadow-md">
            <PlusCircle className="w-3.5 h-3.5" /> New Invoice
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition group">
              <div>
                <div className="text-xs font-semibold text-slate-500">{card.title}</div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  <Counter target={card.value} prefix={card.prefix} />
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[card.color]} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Revenue Collection</h3>
            <span className="text-xs text-gold-500 font-semibold">2026 Academic Year</span>
          </div>
          <div className="h-52">
            <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, animation: { duration: 2000 } }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Breakdown</h3>
          <div className="h-44 flex items-center justify-center">
            <Doughnut data={breakdownData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } }, animation: { duration: 1500 } }} />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['invoices', 'donations', 'expenses'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition ${tab === t ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t === 'invoices' ? '📄 Invoices' : t === 'donations' ? '🤲 Donations' : '💸 Expenses'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Invoices */}
        {tab === 'invoices' && (
          <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name or invoice #..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none">
                {['All', 'Paid', 'Partial', 'Unpaid', 'Overdue'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4">Invoice #</th><th className="p-4">Student</th>
                    <th className="p-4">Total</th><th className="p-4">Paid</th>
                    <th className="p-4">Balance</th><th className="p-4">Period</th><th className="p-4">Due Date</th>
                    <th className="p-4">Status</th><th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-gold-600 dark:text-gold-400">{inv.invoice_number}</td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{inv.student_name}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">D{inv.total_amount.toLocaleString()}</td>
                      <td className="p-4 text-emerald-600 font-semibold">D{inv.amount_paid.toLocaleString()}</td>
                      <td className="p-4 text-rose-600 font-semibold">D{inv.balance_due.toLocaleString()}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {inv.period_type === 'Month' ? inv.period_value : inv.period_value}
                      </td>
                      <td className="p-4 text-slate-500">
                        <div>{inv.due_date}</div>
                        {inv.last_edited_by && <div className="text-[9px] text-slate-400 mt-0.5">Edited by {inv.last_edited_by}</div>}
                      </td>
                      <td className="p-4"><StatusBadge status={inv.status} /></td>
                                            <td className="p-4 text-right flex items-center justify-end gap-2">
                        {inv.status !== 'Paid' && (
                          <button onClick={() => { setShowPaymentModal(inv); setPayAmount(''); }}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Pay
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button onClick={() => { setEditInvoiceId(inv.id); setNewInvoice(inv as any); setShowInvoiceModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('invoices', inv.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-400 text-xs">No invoices found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Donations */}
        {tab === 'donations' && (
          <motion.div key="donations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr><th className="p-4">Donor</th><th className="p-4">Amount</th><th className="p-4">Purpose</th><th className="p-4">Date</th>{isAdmin && <th className="p-4 text-right">Actions</th>}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {donations.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-purple-500 shrink-0" />{d.donor_name}</div>
                    </td>
                    <td className="p-4 font-extrabold text-purple-600 dark:text-purple-400">D{d.amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{d.purpose}</td>
                                        <td className="p-4 text-slate-500">
                      <div>{typeof d.created_at === 'string' ? d.created_at.split('T')[0] : d.created_at}</div>
                      {d.last_edited_by && <div className="text-[9px] text-slate-400 mt-0.5">Edited by {d.last_edited_by}</div>}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => { setEditDonationId(d.id); setNewDonation(d as any); setShowDonationModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete('donations', d.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Expenses */}
        {tab === 'expenses' && (
          <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr><th className="p-4">Category</th><th className="p-4">Description</th><th className="p-4">Amount</th><th className="p-4">Date</th>{isAdmin && <th className="p-4 text-right">Actions</th>}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">{exp.category}</span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{exp.description}</td>
                    <td className="p-4 font-extrabold text-rose-600 dark:text-rose-400">D{exp.amount.toLocaleString()}</td>
                                        <td className="p-4 text-slate-500">
                      <div>{exp.expense_date}</div>
                      {exp.last_edited_by && <div className="text-[9px] text-slate-400 mt-0.5">Edited by {exp.last_edited_by}</div>}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => { setEditExpenseId(exp.id); setNewExpense(exp as any); setShowExpenseModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete('expenses', exp.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALS ── */}

      {/* New Invoice */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form onSubmit={handleAddInvoice} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-gold-500" /> {editInvoiceId ? 'Edit Fee Invoice' : 'New Fee Invoice'}
              </h3>
              <button type="button" onClick={() => { setShowInvoiceModal(false); setEditInvoiceId(null); setNewInvoice(BLANK_INVOICE); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Student dropdown with search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student <span className="text-rose-500">*</span>
              </label>
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Type student name or ID to filter..."
                  value={studentSearchQuery}
                  onChange={e => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>
              <select required value={newInvoice.student_id}
                onChange={e => {
                  const s = students.find((s: any) => String(s.id) === e.target.value);
                  setNewInvoice({ ...newInvoice, student_id: e.target.value, student_name: s ? s.full_name : '' });
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500">
                <option value="">— Select a student ({filteredModalStudents.length} found) —</option>
                {filteredModalStudents.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.student_id_number})</option>
                ))}
                {filteredModalStudents.length === 0 && (
                  <option value="" disabled>No students matching "{studentSearchQuery}"</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Number <span className="text-slate-400 font-normal">(auto if blank)</span></label>
              <input type="text" value={newInvoice.invoice_number}
                onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                placeholder="e.g. INV-2026-0001"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
                <select value={newInvoice.period_type} onChange={e => setNewInvoice({ ...newInvoice, period_type: e.target.value, period_value: e.target.value === 'Term' ? 'Term 1' : 'January' })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none">
                  <option value="Term">Termly</option>
                  <option value="Month">Monthly</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Period</label>
                <select value={newInvoice.period_value} onChange={e => setNewInvoice({ ...newInvoice, period_value: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none">
                  {newInvoice.period_type === 'Term' ? (
                    <>
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </>
                  ) : (
                    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m}>{m}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date <span className="text-rose-500">*</span></label>
              <input type="date" required value={newInvoice.due_date}
                onChange={e => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tuition Fee (D)</label>
              <input type="number" min="0" value={newInvoice.tuition_fee}
                onChange={e => setNewInvoice({ ...newInvoice, tuition_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none" />
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Total: <span className="text-emerald-600 font-extrabold">D{(newInvoice.tuition_fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowInvoiceModal(false); setEditInvoiceId(null); setNewInvoice(BLANK_INVOICE); }} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 transition">{editInvoiceId ? 'Save Changes' : 'Generate Invoice'}</button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Record Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form onSubmit={handleRecordPayment} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Record Payment
              </h3>
              <button type="button" onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-bold">{showPaymentModal.invoice_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Student</span><span className="font-bold">{showPaymentModal.student_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Balance Due</span><span className="font-bold text-rose-600">D{showPaymentModal.balance_due.toLocaleString()}</span></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Amount (D)</label>
              <input type="number" required min="1" max={showPaymentModal.balance_due} value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none">
                {['Bank Transfer', 'Credit Card', 'Cash', 'Online Gateway', 'Cheque'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPaymentModal(null)} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition">Confirm Payment</button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form onSubmit={handleAddDonation} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" /> {editDonationId ? 'Edit Donation' : 'Record Donation'}
              </h3>
              <button type="button" onClick={() => { setShowDonationModal(false); setEditDonationId(null); setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {[{ label: 'Donor Name (blank = Anonymous)', key: 'donor_name', type: 'text', req: false }, { label: 'Amount (D)', key: 'amount', type: 'number', req: true }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
                <input type={f.type} required={f.req} value={(newDonation as any)[f.key]}
                  onChange={e => setNewDonation({ ...newDonation, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose</label>
              <select value={newDonation.purpose} onChange={e => setNewDonation({ ...newDonation, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none">
                {['General Sadaqah', 'Hifz Scholarship Fund', 'Mosque Building Fund', 'Student Welfare & Nutrition', 'Library & Books'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowDonationModal(false); setEditDonationId(null); setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' }); }} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition">{editDonationId ? 'Save Changes' : 'Record'}</button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form onSubmit={handleAddExpense} initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" /> {editExpenseId ? 'Edit Expense' : 'Log Expense'}
              </h3>
              <button type="button" onClick={() => { setShowExpenseModal(false); setEditExpenseId(null); setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none">
                {['Kitchen & Nutrition', 'Utilities', 'Maintenance', 'Salaries', 'Library', 'Transport', 'Medical', 'Others'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea required value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                rows={2} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (D)</label>
              <input type="number" required min="1" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowExpenseModal(false); setEditExpenseId(null); setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' }); }} className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition">{editExpenseId ? 'Edit Expense' : 'Log Expense'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
