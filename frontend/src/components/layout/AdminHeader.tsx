import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Calendar, LogOut, ChevronRight, Home, Menu } from 'lucide-react';

interface AdminHeaderProps {
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

const PAGE_NAMES: Record<string, string> = {
  '/admin/dashboard':        'Dashboard',
  '/admin/admissions':       'Admissions Management',
  '/admin/students':         'Student Management',
  '/admin/hifz':             'Hifz Tracker',
  '/admin/prayer-attendance':'Prayer Attendance',
  '/admin/hostel':           'Hostel Management',
  '/admin/finance':          'Fee & Financials',
  '/admin/academic':         'Academic Calendar',
  '/admin/staff':            'Staff Management',
  '/admin/settings':         'Settings',
  '/portal/parent':          'Parent Portal',
  '/portal/student':         'Student Portal',
  '/portal/teacher':         'Teacher Portal',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, darkMode, setDarkMode, onLogout, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const pageName = PAGE_NAMES[location.pathname] || 'Portal';
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const notifications = [
    { title: 'New Admission Application', desc: 'Abdullah Omar submitted online form', time: '10m ago' },
    { title: 'Maintenance Alert', desc: 'Aisha Hall Dorm B AC repair requested', time: '1h ago' },
    { title: 'Hifz Completion Certificate', desc: 'Youssef Al-Faruq completed Juz 30', time: '2h ago' },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3">

      {/* Left: Breadcrumb & Mobile Menu Trigger */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gold-500 md:hidden transition shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Home className="w-3 h-3" />
            {pathSegments.map((seg, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <span className={i === pathSegments.length - 1 ? 'text-gold-500 font-semibold' : ''}>
                  {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')}
                </span>
              </React.Fragment>
            ))}
          </div>
          {/* Page title */}
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
            {pageName}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
        
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 relative transition"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                <span>Recent Notifications</span>
                <span className="text-[10px] text-gold-500">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n, i) => (
                  <div key={i} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                    <div className="text-[11px] text-slate-500">{n.desc}</div>
                    <div className="text-[10px] text-slate-400">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
