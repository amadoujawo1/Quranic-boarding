import React, { useState, useEffect, useRef } from 'react';
import {
  Edit, Trash2,
  DollarSign, FileText, PlusCircle, CheckCircle2, AlertTriangle,
  Clock, TrendingUp, Wallet, CreditCard, Gift, Search,
  ChevronDown, X, ReceiptText, Building2, UserCheck, Printer,
  Sparkles, Calendar, Layers, CheckCircle, XCircle, ArrowUpRight,
  Download, RefreshCw, Filter, User
} from 'lucide-react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { StudentPayment, MonthlyCollectionReport, StudentPaymentStatsData } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ── Animated counter ─────────────────────────────────────────────────────────
const Counter = ({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (isInView) {
      const ctrl = animate(0, target, { duration: 1.6, ease: 'easeOut', onUpdate: v => setVal(Math.floor(v)) });
      return ctrl.stop;
    }
  }, [isInView, target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const PaymentStatusBadge = ({ status }: { status: string }) => {
  if (status === 'Paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Paid
      </span>
    );
  }
  if (status === 'Partial') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
      <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Unpaid
    </span>
  );
};

// =============================================================================
export const FinancePage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin') || user?.roles?.includes('Super Administrator') || user?.roles?.includes('Accountant');

  // Main navigation tab
  const [tab, setTab] = useState<'monthly_payments' | 'student_ledger' | 'collection_report' | 'donations' | 'expenses'>('monthly_payments');

  // State data
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [paymentStats, setPaymentStats] = useState<StudentPaymentStatsData | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for monthly payments
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('2026/2027');

  // Student Ledger interactive view
  const [selectedLedgerStudentId, setSelectedLedgerStudentId] = useState<number | null>(null);
  const [studentLedgerData, setStudentLedgerData] = useState<any | null>(null);

  // Modals
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [showQuickPayModal, setShowQuickPayModal] = useState<StudentPayment | null>(null);
  const [showGenerateDuesModal, setShowGenerateDuesModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<StudentPayment | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Edit states
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);

  // Form states
  const BLANK_STUDENT_PAYMENT = {
    student_id: '',
    student_name: '',
    class_level: 'Hifz Level 2',
    academic_year: '2026/2027',
    payment_month: 'August 2026',
    fee_type: 'Boarding / Tuition / Meals',
    amount_due: 2500,
    amount_paid: 2500,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    receipt_number: '',
    remarks: ''
  };
  const [paymentForm, setPaymentForm] = useState<any>(BLANK_STUDENT_PAYMENT);
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [quickPayMethod, setQuickPayMethod] = useState('Cash');
  const [quickPayRemarks, setQuickPayRemarks] = useState('');

  const [batchMonth, setBatchMonth] = useState('August 2026');
  const [batchYear, setBatchYear] = useState('2026/2027');
  const [batchAmountDue, setBatchAmountDue] = useState(2500);
  const [batchFeeType, setBatchFeeType] = useState('Boarding / Tuition / Meals');
  const [batchLevel, setBatchLevel] = useState('All Levels');

  const [modalStudentSearch, setModalStudentSearch] = useState('');
  const [newDonation, setNewDonation] = useState({ donor_name: '', amount: '', purpose: 'General Sadaqah' });
  const [newExpense, setNewExpense] = useState({ category: 'Kitchen & Nutrition', description: '', amount: '' });

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-jwt-token') return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [paymentsRes, statsRes, donationsRes, expensesRes, studentsRes] = await Promise.all([
        fetch('/api/finance/student-payments', { headers }),
        fetch('/api/finance/student-payments/stats', { headers }),
        fetch('/api/finance/donations', { headers }),
        fetch('/api/finance/expenses', { headers }),
        fetch('/api/students?per_page=500', { headers }),
      ]);

      if (paymentsRes.ok) {
        const pData = await paymentsRes.json();
        setStudentPayments(pData);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setPaymentStats(sData);
      }
      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setDonations(dData);
      }
      if (expensesRes.ok) {
        const eData = await expensesRes.json();
        setExpenses(eData);
      }
      if (studentsRes.ok) {
        const stData = await studentsRes.json();
        if (stData && stData.students) {
          setStudents(stData.students);
          if (stData.students.length > 0 && !selectedLedgerStudentId) {
            setSelectedLedgerStudentId(stData.students[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching finance data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch individual student ledger when student selected
  useEffect(() => {
    if (!selectedLedgerStudentId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`/api/finance/student-payments/student/${selectedLedgerStudentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setStudentLedgerData(d);
      })
      .catch(() => {});
  }, [selectedLedgerStudentId, studentPayments]);

  // Derived KPI Stats from Student Payments or PaymentStats
  const totalFeesDue = paymentStats?.total_due ?? studentPayments.reduce((s, p) => s + (p.amount_due || 0), 0);
  const totalCollected = paymentStats?.total_collected ?? studentPayments.reduce((s, p) => s + (p.amount_paid || 0), 0);
  const outstandingBalance = paymentStats?.outstanding_balance ?? studentPayments.reduce((s, p) => s + (p.balance || 0), 0);

  const paidCount = paymentStats?.paid_count ?? studentPayments.filter(p => p.status === 'Paid').length;
  const partialCount = paymentStats?.partial_count ?? studentPayments.filter(p => p.status === 'Partial').length;
  const unpaidCount = paymentStats?.unpaid_count ?? studentPayments.filter(p => p.status === 'Unpaid').length;

  // Month list available in payments
  const availableMonths = [
    'All',
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
    'January 2027',
    'February 2027',
    'March 2027',
    'April 2027',
    'May 2027',
    'June 2027',
    'July 2027'
  ];

  // Filtered Payments
  const filteredPayments = studentPayments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.student_name || '').toLowerCase().includes(q) ||
      (p.student_id_number || '').toLowerCase().includes(q) ||
      (p.receipt_number || '').toLowerCase().includes(q) ||
      (p.class_level || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchMonth = monthFilter === 'All' || p.payment_month === monthFilter;
    const matchYear = !academicYearFilter || p.academic_year === academicYearFilter;

    return matchSearch && matchStatus && matchMonth && matchYear;
  });

  // Modal Student filtered list
  const filteredModalStudents = students.filter(s => {
    const q = modalStudentSearch.toLowerCase().trim();
    if (!q) return true;
    return (s.full_name || '').toLowerCase().includes(q) || (s.student_id_number || '').toLowerCase().includes(q);
  });

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleSaveStudentPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (editPaymentId) {
        const res = await fetch(`/api/finance/student-payments/${editPaymentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(paymentForm)
        });
        if (res.ok) {
          const updated = await res.json();
          setStudentPayments(studentPayments.map(p => p.id === editPaymentId ? updated : p));
          setShowCreatePaymentModal(false);
          setEditPaymentId(null);
          setPaymentForm(BLANK_STUDENT_PAYMENT);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Failed to update payment record.');
        }
      } else {
        const res = await fetch('/api/finance/student-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(paymentForm)
        });
        if (res.ok) {
          const created = await res.json();
          setStudentPayments([created, ...studentPayments]);
          setShowCreatePaymentModal(false);
          setPaymentForm(BLANK_STUDENT_PAYMENT);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Failed to record student payment.');
        }
      }
    } catch (e) {
      alert('Network error recording payment.');
    }
  };

  const handleQuickPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuickPayModal) return;
    const amt = parseFloat(quickPayAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/finance/student-payments/${showQuickPayModal.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: amt,
          payment_method: quickPayMethod,
          remarks: quickPayRemarks
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setStudentPayments(studentPayments.map(p => p.id === updated.id ? updated : p));
        setShowQuickPayModal(null);
        setQuickPayAmount('');
        setQuickPayRemarks('');
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to process quick payment.');
      }
    } catch {
      alert('Network error processing payment.');
    }
  };

  const handleGenerateBatchDues = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/finance/student-payments/generate-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          payment_month: batchMonth,
          academic_year: batchYear,
          amount_due: batchAmountDue,
          fee_type: batchFeeType,
          class_level: batchLevel
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setShowGenerateDuesModal(false);
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to generate batch dues.');
      }
    } catch {
      alert('Network error generating monthly dues.');
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this payment record?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/finance/student-payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStudentPayments(studentPayments.filter(p => p.id !== id));
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to delete payment record.');
      }
    } catch {
      alert('Network error deleting record.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // ── Chart Data for Monthly Collection Report ───────────────────────────────
  const reportMonths = paymentStats?.monthly_reports || [];
  const chartLabels = reportMonths.map(r => r.month);
  const chartExpected = reportMonths.map(r => r.total_due);
  const chartCollected = reportMonths.map(r => r.total_collected);

  const collectionBarData = {
    labels: chartLabels.length ? chartLabels : ['Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'],
    datasets: [
      {
        label: 'Total Expected Due (GMD)',
        data: chartExpected.length ? chartExpected : [15000, 15000, 15000, 15000, 15000],
        backgroundColor: 'rgba(148, 163, 184, 0.5)',
        borderRadius: 6,
      },
      {
        label: 'Amount Collected (GMD)',
        data: chartCollected.length ? chartCollected : [12500, 14000, 9500, 2500, 10000],
        backgroundColor: '#0f8a4f',
        borderRadius: 6,
      }
    ]
  };

  const statusDoughnutData = {
    labels: ['Paid', 'Partial', 'Unpaid'],
    datasets: [{
      data: [paidCount, partialCount, unpaidCount],
      backgroundColor: ['#0f8a4f', '#f59e0b', '#f43f5e'],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-gold-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Student Monthly Payment &amp; Finance Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Imaam Naafi' Centre for Quranic Memorization • Academic Year {academicYearFilter}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => {
              setPaymentForm(BLANK_STUDENT_PAYMENT);
              setEditPaymentId(null);
              setShowCreatePaymentModal(true);
            }}
            className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 hover:brightness-110 transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Record Payment
          </button>
          <button
            onClick={() => setShowGenerateDuesModal(true)}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-emerald-800 text-emerald-100 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Generate Monthly Dues
          </button>
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Recommended Dashboard KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Fees Due */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Fees Due</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            <Counter target={totalFeesDue} prefix="GMD " />
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-medium">Billed to students</div>
        </motion.div>

        {/* 2. Total Collected */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span>Total Collected</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            <Counter target={totalCollected} prefix="GMD " />
          </div>
          <div className="mt-1 text-[10px] text-emerald-600/80 font-medium">
            {totalFeesDue > 0 ? `${((totalCollected / totalFeesDue) * 100).toFixed(1)}% collected` : '100%'}
          </div>
        </motion.div>

        {/* 3. Outstanding Balance */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500 dark:text-rose-400 text-xs font-semibold">
            <span>Outstanding</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-rose-600 dark:text-rose-400">
            <Counter target={outstandingBalance} prefix="GMD " />
          </div>
          <div className="mt-1 text-[10px] text-rose-500/80 font-medium">Pending arrears</div>
        </motion.div>

        {/* 4. Paid Students */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-950 shadow-xs flex flex-col justify-between bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span>Paid Records</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
            <Counter target={paidCount} suffix=" records" />
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">✅ Settled in full</div>
        </motion.div>

        {/* 5. Partially Paid */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-950 shadow-xs flex flex-col justify-between bg-amber-50/20 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-bold">
            <span>Partially Paid</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-black text-amber-700 dark:text-amber-300">
            <Counter target={partialCount} suffix=" records" />
          </div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">⚠️ Partial balance</div>
        </motion.div>

        {/* 6. Unpaid Students */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-950 shadow-xs flex flex-col justify-between bg-rose-50/20 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs font-bold">
            <span>Unpaid Records</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-black text-rose-700 dark:text-rose-300">
            <Counter target={unpaidCount} suffix=" records" />
          </div>
          <div className="mt-1 text-[10px] text-rose-600 font-semibold">❌ Zero payment</div>
        </motion.div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setTab('monthly_payments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            tab === 'monthly_payments'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> All Student Payments
        </button>

        <button
          onClick={() => setTab('student_ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            tab === 'student_ledger'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Student Monthly View
        </button>

        <button
          onClick={() => setTab('collection_report')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            tab === 'collection_report'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Monthly Collection Report
        </button>

        <button
          onClick={() => setTab('donations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            tab === 'donations'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5" /> Donations
        </button>

        <button
          onClick={() => setTab('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            tab === 'expenses'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-gold-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Expenses
        </button>
      </div>

      {/* ── TAB 1: ALL STUDENT MONTHLY PAYMENTS ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'monthly_payments' && (
          <motion.div
            key="monthly_payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by student name, ID (e.g. INCM-2026-001), receipt # or class..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="All">All Months</option>
                  {availableMonths.filter(m => m !== 'All').map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">✅ Paid</option>
                  <option value="Partial">⚠️ Partial</option>
                  <option value="Unpaid">❌ Unpaid</option>
                </select>

                <select
                  value={academicYearFilter}
                  onChange={e => setAcademicYearFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700 text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Student ID / Name</th>
                      <th className="p-4">Class / Level</th>
                      <th className="p-4">Payment Month</th>
                      <th className="p-4">Fee Type</th>
                      <th className="p-4">Amount Due</th>
                      <th className="p-4">Paid</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4">Method / Date</th>
                      <th className="p-4">Receipt No.</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{payment.student_name}</div>
                          <div className="text-[11px] font-mono text-gold-600 dark:text-gold-400 font-semibold">
                            {payment.student_id_number}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                          {payment.class_level}
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {payment.payment_month}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 text-[11px]">
                          {payment.fee_type}
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          GMD {payment.amount_due.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          GMD {payment.amount_paid.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">
                          GMD {payment.balance.toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          <div>{payment.payment_method}</div>
                          <div className="text-[10px] text-slate-400">{payment.payment_date}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {payment.receipt_number}
                        </td>
                        <td className="p-4">
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Receipt Button */}
                            <button
                              onClick={() => setShowReceiptModal(payment)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-gold-400 border border-emerald-200 dark:border-emerald-800 hover:brightness-110 transition flex items-center gap-1 cursor-pointer"
                              title="View & Print Official Receipt"
                            >
                              <Printer className="w-3 h-3" /> Receipt
                            </button>

                            {/* Pay Button for Partial or Unpaid */}
                            {payment.status !== 'Paid' && (
                              <button
                                onClick={() => {
                                  setShowQuickPayModal(payment);
                                  setQuickPayAmount(String(payment.balance));
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                                title="Record payment"
                              >
                                <CreditCard className="w-3 h-3" /> Pay
                              </button>
                            )}

                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditPaymentId(payment.id);
                                    setPaymentForm({ ...payment });
                                    setShowCreatePaymentModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePayment(payment.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 text-xs">
                          No student monthly payment records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: STUDENT MONTHLY VIEW (LEDGER VIEW) ───────────────────────── */}
        {tab === 'student_ledger' && (
          <motion.div
            key="student_ledger"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Student Picker Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-gold-500" /> Student Monthly Fee Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  View complete month-by-month payment statement, balances, receipts, and history for any student.
                </p>
              </div>

              <div className="w-full sm:w-80">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Select Student:
                </label>
                <select
                  value={selectedLedgerStudentId || ''}
                  onChange={e => setSelectedLedgerStudentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_id_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Summary & Month-by-Month View */}
            {studentLedgerData && (
              <div className="space-y-4">
                {/* Summary banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-gold-500/20 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-gold-400 tracking-wider uppercase">
                      Official Monthly Payment Statement
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      Student: {studentLedgerData.student_name}
                    </h3>
                    <div className="text-xs text-slate-300 mt-1 flex items-center gap-4">
                      <span>ID: <strong className="font-mono text-gold-400">{studentLedgerData.student_id_number}</strong></span>
                      {studentLedgerData.parent_name && (
                        <span>Parent / Guardian: <strong>{studentLedgerData.parent_name}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-300">Total Billed</div>
                      <div className="text-base font-extrabold text-white">GMD {studentLedgerData.total_due.toLocaleString()}</div>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-emerald-500/30 text-center">
                      <div className="text-[10px] uppercase font-bold text-emerald-300">Total Paid</div>
                      <div className="text-base font-extrabold text-emerald-300">GMD {studentLedgerData.total_paid.toLocaleString()}</div>
                    </div>
                    <div className="bg-rose-500/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-rose-500/30 text-center">
                      <div className="text-[10px] uppercase font-bold text-rose-300">Total Balance</div>
                      <div className="text-base font-extrabold text-rose-300">GMD {studentLedgerData.total_balance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Month-by-month table (As requested by user: Month, Amount Due, Paid, Balance, Status) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Monthly Payment Ledger
                    </h4>
                    <span className="text-xs text-slate-500">
                      {studentLedgerData.records?.length || 0} Months Recorded
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700 text-[10px]">
                        <tr>
                          <th className="p-4">Month</th>
                          <th className="p-4">Amount Due</th>
                          <th className="p-4">Paid</th>
                          <th className="p-4">Balance</th>
                          <th className="p-4">Fee Type</th>
                          <th className="p-4">Payment Date</th>
                          <th className="p-4">Receipt No.</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {studentLedgerData.records?.map((rec: StudentPayment) => (
                          <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {rec.payment_month}
                            </td>
                            <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                              GMD {rec.amount_due.toLocaleString()}
                            </td>
                            <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                              GMD {rec.amount_paid.toLocaleString()}
                            </td>
                            <td className="p-4 font-extrabold text-rose-600 dark:text-rose-400">
                              GMD {rec.balance.toLocaleString()}
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-400 text-[11px]">
                              {rec.fee_type}
                            </td>
                            <td className="p-4 text-slate-500">
                              {rec.payment_date}
                            </td>
                            <td className="p-4 font-mono font-semibold text-gold-600 dark:text-gold-400">
                              {rec.receipt_number}
                            </td>
                            <td className="p-4">
                              <PaymentStatusBadge status={rec.status} />
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setShowReceiptModal(rec)}
                                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:brightness-110 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" /> Receipt
                                </button>
                                {rec.status !== 'Paid' && (
                                  <button
                                    onClick={() => {
                                      setShowQuickPayModal(rec);
                                      setQuickPayAmount(String(rec.balance));
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                                  >
                                    Pay Balance
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!studentLedgerData.records || studentLedgerData.records.length === 0) && (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                              No monthly records exist yet for this student. Click "Record Payment" or "Generate Monthly Dues" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB 3: MONTHLY COLLECTION REPORT ────────────────────────────────── */}
        {tab === 'collection_report' && (
          <motion.div
            key="collection_report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Fee Collection Analysis</h3>
                    <p className="text-[11px] text-slate-500">Expected Dues vs Actual Collected per Month</p>
                  </div>
                  <span className="text-xs text-gold-500 font-semibold">2026/2027</span>
                </div>
                <div className="h-56">
                  <Bar
                    data={collectionBarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Payment Status Distribution</h3>
                <div className="h-52 flex items-center justify-center">
                  <Doughnut
                    data={statusDoughnutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Monthly Collection Summary Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Fee Performance Report
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700 text-[10px]">
                    <tr>
                      <th className="p-4">Payment Month</th>
                      <th className="p-4">Total Expected (GMD)</th>
                      <th className="p-4">Total Collected (GMD)</th>
                      <th className="p-4">Outstanding (GMD)</th>
                      <th className="p-4">Paid Count</th>
                      <th className="p-4">Partial Count</th>
                      <th className="p-4">Unpaid Count</th>
                      <th className="p-4">Collection Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reportMonths.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{m.month}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">GMD {m.total_due.toLocaleString()}</td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">GMD {m.total_collected.toLocaleString()}</td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">GMD {m.outstanding.toLocaleString()}</td>
                        <td className="p-4 text-emerald-600 font-semibold">{m.paid_count}</td>
                        <td className="p-4 text-amber-600 font-semibold">{m.partial_count}</td>
                        <td className="p-4 text-rose-600 font-semibold">{m.unpaid_count}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${m.collection_rate >= 80 ? 'bg-emerald-500' : m.collection_rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(100, m.collection_rate)}%` }}
                              />
                            </div>
                            <span className="font-bold">{m.collection_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reportMonths.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                          No collection data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: DONATIONS ────────────────────────────────────────────────── */}
        {tab === 'donations' && (
          <motion.div
            key="donations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sadaqah &amp; Waqf Contributions</h3>
              <button
                onClick={() => setShowDonationModal(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" /> Record Donation
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr><th className="p-4">Donor</th><th className="p-4">Amount</th><th className="p-4">Purpose</th><th className="p-4">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {donations.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-purple-500 shrink-0" />{d.donor_name}</div>
                      </td>
                      <td className="p-4 font-extrabold text-purple-600 dark:text-purple-400">GMD {d.amount?.toLocaleString()}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{d.purpose}</td>
                      <td className="p-4 text-slate-500">{typeof d.created_at === 'string' ? d.created_at.split('T')[0] : d.created_at}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs">No donations recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── TAB 5: EXPENSES ─────────────────────────────────────────────────── */}
        {tab === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operational &amp; Maintenance Expenses</h3>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" /> Log Expense
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr><th className="p-4">Category</th><th className="p-4">Description</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">{exp.category}</span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{exp.description}</td>
                      <td className="p-4 font-extrabold text-rose-600 dark:text-rose-400">GMD {exp.amount?.toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{exp.expense_date}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs">No expenses logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODALS ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* 1. RECORD STUDENT MONTHLY PAYMENT MODAL */}
      {showCreatePaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={handleSaveStudentPayment}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-gold-500" />
                {editPaymentId ? 'Edit Student Payment Record' : 'Record Student Monthly Payment'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePaymentModal(false);
                  setEditPaymentId(null);
                  setPaymentForm(BLANK_STUDENT_PAYMENT);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student <span className="text-rose-500">*</span>
              </label>
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Type student name or ID to filter..."
                  value={modalStudentSearch}
                  onChange={e => setModalStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>
              <select
                required
                value={paymentForm.student_id}
                onChange={e => {
                  const s = students.find(item => String(item.id) === e.target.value);
                  setPaymentForm({
                    ...paymentForm,
                    student_id: e.target.value,
                    student_name: s ? s.full_name : ''
                  });
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-gold-500 font-medium"
              >
                <option value="">— Select a student ({filteredModalStudents.length} matching) —</option>
                {filteredModalStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.student_id_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Class / Level & Academic Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class / Level</label>
                <select
                  value={paymentForm.class_level}
                  onChange={e => setPaymentForm({ ...paymentForm, class_level: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option>Hifz Level 2</option>
                  <option>Hifz Level 1</option>
                  <option>Tajweed Foundation</option>
                  <option>Mutawassit 1</option>
                  <option>Mutawassit 2</option>
                  <option>Qira'at Specialization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <select
                  value={paymentForm.academic_year}
                  onChange={e => setPaymentForm({ ...paymentForm, academic_year: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option>2026/2027</option>
                  <option>2025/2026</option>
                </select>
              </div>
            </div>

            {/* Payment Month & Fee Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Month <span className="text-rose-500">*</span></label>
                <select
                  value={paymentForm.payment_month}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_month: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none font-bold"
                >
                  {availableMonths.filter(m => m !== 'All').map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fee Type</label>
                <select
                  value={paymentForm.fee_type}
                  onChange={e => setPaymentForm({ ...paymentForm, fee_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option>Boarding / Tuition / Meals</option>
                  <option>Tuition &amp; Meals</option>
                  <option>Tuition Only</option>
                  <option>Boarding Only</option>
                  <option>Meals Only</option>
                </select>
              </div>
            </div>

            {/* Amount Due & Amount Paid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Due (GMD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentForm.amount_due}
                  onChange={e => setPaymentForm({ ...paymentForm, amount_due: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (GMD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentForm.amount_paid}
                  onChange={e => setPaymentForm({ ...paymentForm, amount_paid: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none font-bold text-emerald-600"
                />
              </div>
            </div>

            {/* Balance Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Computed Balance:</span>
              <span className="font-extrabold text-rose-600">
                GMD {Math.max(0, (paymentForm.amount_due || 0) - (paymentForm.amount_paid || 0)).toLocaleString()}
              </span>
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Wave / Mobile Money</option>
                  <option>QMoney</option>
                  <option>Afrimoney</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Receipt Number & Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Number <span className="text-slate-400 font-normal">(auto-generated if empty)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. REC-000123"
                value={paymentForm.receipt_number}
                onChange={e => setPaymentForm({ ...paymentForm, receipt_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks / Note</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={paymentForm.remarks}
                onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreatePaymentModal(false);
                  setEditPaymentId(null);
                  setPaymentForm(BLANK_STUDENT_PAYMENT);
                }}
                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 transition shadow-md"
              >
                {editPaymentId ? 'Save Changes' : 'Save Payment Record'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 2. QUICK PAY MODAL */}
      {showQuickPayModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={handleQuickPaySubmit}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Record Fee Payment
              </h3>
              <button type="button" onClick={() => setShowQuickPayModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span><strong className="text-slate-900 dark:text-white">{showQuickPayModal.student_name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Month:</span><strong>{showQuickPayModal.payment_month}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Due Amount:</span><span>GMD {showQuickPayModal.amount_due.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Current Paid:</span><span className="text-emerald-600 font-bold">GMD {showQuickPayModal.amount_paid.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1 font-bold">
                <span className="text-rose-500">Balance Due:</span>
                <span className="text-rose-600">GMD {showQuickPayModal.balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount (GMD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={showQuickPayModal.balance}
                value={quickPayAmount}
                onChange={e => setQuickPayAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-extrabold text-emerald-600 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={quickPayMethod}
                onChange={e => setQuickPayMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Wave / Mobile Money</option>
                <option>QMoney</option>
                <option>Afrimoney</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={quickPayRemarks}
                onChange={e => setQuickPayRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickPayModal(null)}
                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
              >
                Confirm Payment
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 3. BATCH GENERATE MONTHLY DUES MODAL */}
      {showGenerateDuesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={handleGenerateBatchDues}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" /> Batch Generate Monthly Dues
              </h3>
              <button type="button" onClick={() => setShowGenerateDuesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Automatically creates monthly fee bills (e.g. GMD 2,500) for all currently active students. Existing records for this month are automatically preserved without duplicates.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Month</label>
              <select
                value={batchMonth}
                onChange={e => setBatchMonth(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:outline-none"
              >
                {availableMonths.filter(m => m !== 'All').map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <select
                  value={batchYear}
                  onChange={e => setBatchYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option>2026/2027</option>
                  <option>2025/2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Due (GMD)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={batchAmountDue}
                  onChange={e => setBatchAmountDue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fee Type</label>
              <input
                type="text"
                value={batchFeeType}
                onChange={e => setBatchFeeType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGenerateDuesModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition"
              >
                Generate Dues
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 4. OFFICIAL PRINTABLE PAYMENT RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 max-w-xl w-full space-y-6 shadow-2xl border border-slate-200 my-auto relative"
          >
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" /> Printable Official Payment Receipt
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => setShowReceiptModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── RECEIPT SLIP CONTENT (Clean A4 / Print ready) ── */}
            <div className="receipt-container space-y-6 border-2 border-emerald-950/10 p-6 rounded-2xl bg-gradient-to-b from-emerald-50/20 to-transparent">
              {/* Institutional Header */}
              <div className="text-center space-y-1">
                <div className="text-emerald-900 text-sm font-bold font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                <div className="flex justify-center items-center gap-3 mt-1">
                  <img src="/logo.png" alt="School Logo" className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-500/40" />
                  <div>
                    <h2 className="text-base font-black text-emerald-950 uppercase tracking-wide">
                      Imaam Naafi' Centre for Quranic Memorization
                    </h2>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Banjul, The Gambia • P.O. Box 220 • Tel: +220 700 0000 / +220 300 0000
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-emerald-950 text-gold-400 font-extrabold text-xs uppercase tracking-widest rounded-full">
                    Official Student Fee Receipt
                  </span>
                </div>
              </div>

              {/* Receipt Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Receipt No.</div>
                  <div className="font-mono font-black text-emerald-900 text-sm">{showReceiptModal.receipt_number}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Payment Date</div>
                  <div className="font-bold text-slate-800">{showReceiptModal.payment_date || new Date().toISOString().split('T')[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Academic Year</div>
                  <div className="font-bold text-slate-800">{showReceiptModal.academic_year}</div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-semibold">Student ID:</span>{' '}
                    <strong className="font-mono text-emerald-900">{showReceiptModal.student_id_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Class / Level:</span>{' '}
                    <strong>{showReceiptModal.class_level}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Student Full Name:</span>{' '}
                  <strong className="text-sm text-slate-900">{showReceiptModal.student_name}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500 font-semibold">Payment Month:</span>{' '}
                    <strong className="text-emerald-800">{showReceiptModal.payment_month}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Payment Method:</span>{' '}
                    <strong>{showReceiptModal.payment_method}</strong>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-emerald-950 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Fee Description</th>
                      <th className="p-3 text-right">Amount Due</th>
                      <th className="p-3 text-right">Amount Paid</th>
                      <th className="p-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">
                        {showReceiptModal.fee_type}
                        {showReceiptModal.remarks && (
                          <div className="text-[10px] text-slate-500 font-normal">{showReceiptModal.remarks}</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700">
                        GMD {showReceiptModal.amount_due.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">
                        GMD {showReceiptModal.amount_paid.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-extrabold text-rose-600">
                        GMD {showReceiptModal.balance.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td className="p-3 uppercase">Total Received</td>
                      <td colSpan={3} className="p-3 text-right text-base text-emerald-900 font-black">
                        GMD {showReceiptModal.amount_paid.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status Badge & Stamp Signatures */}
              <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Payment Status:</div>
                  <PaymentStatusBadge status={showReceiptModal.status} />
                  <div className="text-[9px] text-slate-400 mt-1">
                    Recorded by: {showReceiptModal.recorded_by || 'Administrator'}
                  </div>
                </div>

                <div className="border border-dashed border-emerald-900/40 p-4 rounded-xl text-center w-48 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full border border-gold-500/50 flex items-center justify-center text-[10px] font-black text-emerald-900 uppercase">
                    SEAL
                  </div>
                  <div className="text-[10px] font-bold text-emerald-950 border-t border-slate-300 pt-1">
                    Authorized Official Stamp
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-slate-500 border-t border-slate-200 pt-3 italic">
                "May Allah bless your investment in the Quranic education of your child." • Valid without signature if system verified.
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. DONATION MODAL */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={async (e) => {
              e.preventDefault();
              const token = localStorage.getItem('token');
              const res = await fetch('/api/finance/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newDonation)
              });
              if (res.ok) {
                setShowDonationModal(false);
                setNewDonation({ donor_name: '', amount: '', purpose: 'General Sadaqah' });
                loadData();
              }
            }}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" /> Record Donation / Sadaqah
              </h3>
              <button type="button" onClick={() => setShowDonationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Donor Name (blank = Anonymous)</label>
              <input
                type="text"
                value={newDonation.donor_name}
                onChange={e => setNewDonation({ ...newDonation, donor_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (GMD) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                required
                min="1"
                value={newDonation.amount}
                onChange={e => setNewDonation({ ...newDonation, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose</label>
              <select
                value={newDonation.purpose}
                onChange={e => setNewDonation({ ...newDonation, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <option>General Sadaqah</option>
                <option>Hifz Scholarship Fund</option>
                <option>Mosque Building Fund</option>
                <option>Student Welfare &amp; Nutrition</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowDonationModal(false)} className="w-1/2 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition">Record</button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 6. EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={async (e) => {
              e.preventDefault();
              const token = localStorage.getItem('token');
              const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newExpense)
              });
              if (res.ok) {
                setShowExpenseModal(false);
                setNewExpense({ category: 'Kitchen & Nutrition', description: '', amount: '' });
                loadData();
              }
            }}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" /> Log Expense
              </h3>
              <button type="button" onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <option>Kitchen &amp; Nutrition</option>
                <option>Utilities &amp; Fuel</option>
                <option>Maintenance &amp; Repairs</option>
                <option>Salaries &amp; Honoraria</option>
                <option>Library &amp; Books</option>
                <option>Medical &amp; Clinic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={2}
                value={newExpense.description}
                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (GMD) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                required
                min="1"
                value={newExpense.amount}
                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowExpenseModal(false)} className="w-1/2 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" className="w-1/2 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition">Log Expense</button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
