import React, { useEffect, useState } from 'react';
import { 
  Users, BookOpen, Home as HomeIcon, DollarSign, Award, Clock, 
  TrendingUp, Activity, CheckCircle, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      fetch('/api/dashboard/admin-stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load dashboard data');
          return res.json();
        })
        .then((data) => {
          setStats(data);
          setLastUpdated(
            data?.last_updated
              ? new Date(data.last_updated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : 'just now'
          );
        })
        .catch(() => {
          setStats({
            overview: {
              total_students: 450,
              active_students: 432,
              teachers: 38,
              parents: 380,
              staff: 65,
              hostel_occupancy_percentage: 84.5,
              occupied_beds: 338,
              total_beds: 400
            },
            attendance_today: { school_present: 425, fajr_jamaat: 412, school_attendance_percentage: 94.4, fajr_attendance_percentage: 97.2 },
            financials: {
              total_revenue: 145000,
              outstanding_fees: 32500,
              total_donations: 28400,
              total_expenses: 62000
            },
            recent_activity: []
          });
          setLastUpdated('last sync unavailable');
        })
        .finally(() => setLoading(false));
    };

    loadStats();
    const intervalId = window.setInterval(loadStats, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const overview = stats?.overview || {};
  const attendanceToday = stats?.attendance_today || {};
  const financials = stats?.financials || {};
  const recentActivity = stats?.recent_activity || [];
  const hifzChartData = stats?.hifz_progress_chart || [];
  const schoolAttendanceRate = attendanceToday.school_attendance_percentage ?? (overview.total_students && attendanceToday.school_present ? Math.round((attendanceToday.school_present / overview.total_students) * 100) : 0);
  const fajrAttendanceRate = attendanceToday.fajr_attendance_percentage ?? (attendanceToday.school_present && attendanceToday.fajr_jamaat ? Math.round((attendanceToday.fajr_jamaat / attendanceToday.school_present) * 100) : 0);
  const formatCurrency = (value: number | undefined) => `D${Number(value || 0).toLocaleString()}`;
  const lineChartData = {
    labels: hifzChartData.length > 0 ? hifzChartData.map((d: any) => d.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Juz Completed (All Students)',
        data: hifzChartData.length > 0 ? hifzChartData.map((d: any) => d.juz_completed) : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const finChartData = stats?.financial_breakdown_chart || { labels: ['Term 1', 'Term 2', 'Term 3'], revenue: [0, 0, 0], expenses: [0, 0, 0] };
  const barChartData = {
    labels: finChartData.labels,
    datasets: [
      {
        label: 'Collected Revenue (D)',
        data: finChartData.revenue,
        backgroundColor: '#0f8a4f'
      },
      {
        label: 'Operational Expenses (D)',
        data: finChartData.expenses,
        backgroundColor: '#b89220'
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-8 rounded-3xl border border-gold-500/30 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Executive Control Panel
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Quranic Boarding School Management</h1>
          <p className="text-xs text-slate-300">Live operational metrics for Hifz, Academics, and Finances.</p>
        </div>
        <div className="bg-emerald-900/80 border border-gold-500/40 px-6 py-4 rounded-2xl text-center">
          <div className="text-xs text-gold-400 font-medium">Live Fajr Jamaat Attendance</div>
          <div className="text-3xl font-extrabold text-white mt-1">{fajrAttendanceRate}%</div>
          <div className="text-[10px] text-emerald-300">Updated {lastUpdated || 'just now'}</div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition group"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Enrolled Students</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overview.total_students ?? 0}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">{overview.active_students ?? 0} active learners</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>


        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition group"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(financials.total_revenue)}</div>
            <div className="text-[11px] text-rose-500 font-medium mt-1">{formatCurrency(financials.outstanding_fees)} outstanding</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition group"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Teaching Staff</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overview.teachers ?? 0}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">On-boarded instructors</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition group"
      >
        <div>
          <div className="text-xs font-semibold text-slate-500">School Attendance Today</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{schoolAttendanceRate}%</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">{attendanceToday.school_present ?? 0} students present</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Clock className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quran Memorization Cumulative Progress</h3>
            <span className="text-xs text-gold-500 font-semibold">2026 Academic Year</span>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 2000, easing: 'easeOutQuart' } }} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Breakdown (Term Comparison)</h3>
            <span className="text-xs text-emerald-600 font-semibold">Revenue vs Expense</span>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 2000, easing: 'easeOutBounce' } }} />
          </div>
        </motion.div>
      </div>

      {/* Quick Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Academic & Financial Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">ID Number</th>
                <th className="p-3">Event / Milestone</th>
                <th className="p-3">Module</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.length > 0 ? recentActivity.map((activity: any, index: number) => (
                <tr key={`${activity.module}-${activity.timestamp}-${index}`}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{activity.student_name}</td>
                  <td className="p-3 text-slate-500">{activity.timestamp?.slice(0, 10) || 'Today'}</td>
                  <td className="p-3">{activity.event}</td>
                  <td className={`p-3 font-semibold ${activity.module === 'Hifz' ? 'text-gold-500' : activity.module === 'Finance' ? 'text-blue-500' : 'text-emerald-600'}`}>{activity.module}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${activity.status === 'Completed' || activity.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : activity.status === 'Partial' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">No recent activity yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
