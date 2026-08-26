import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Calendar, LogOut, ChevronRight, Home, Menu, Check, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';

interface AdminHeaderProps {
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

const PAGE_NAMES: Record<string, { en: string; ar: string }> = {
  '/admin/dashboard':        { en: 'Dashboard', ar: 'لوحة المتابعة' },
  '/admin/admissions':       { en: 'Admissions Management', ar: 'إدارة طلبات القبول' },
  '/admin/students':         { en: 'Student Management', ar: 'إدارة الطلاب' },
  '/admin/hifz':             { en: 'Hifz Tracker', ar: 'متابعة الحفظ والتجويد' },
  '/admin/attendance':       { en: 'Daily Attendance', ar: 'سجل الحضور اليومي' },
  '/admin/prayer-attendance':{ en: 'Prayer Attendance', ar: 'حضور صلوات الجماعة' },
  '/admin/finance':          { en: 'Fee & Financials', ar: 'الرسوم والمالية' },
  '/admin/users':            { en: 'Users & Roles', ar: 'المستخدمون والصلاحيات' },
  '/admin/academic':         { en: 'Academic Calendar', ar: 'التقويم الدراسي' },
  '/admin/staff':            { en: 'Staff Management', ar: 'إدارة الكادر التعليمي' },
  '/admin/settings':         { en: 'Settings', ar: 'الإعدادات' },
  '/portal/parent':          { en: 'Parent Portal', ar: 'بوابة ولي الأمر' },
  '/portal/student':         { en: 'Student Portal', ar: 'بوابة الطالب' },
  '/portal/teacher':         { en: 'Teacher Portal', ar: 'بوابة المعلم' },
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'New Admission Application', desc: 'Abdullah Omar submitted online form', time: '10m ago' },
  { id: '2', title: 'Maintenance Alert', desc: 'Aisha Hall Dorm B AC repair requested', time: '1h ago' },
  { id: '3', title: 'Hifz Completion Certificate', desc: 'Youssef Al-Faruq completed Juz 30', time: '2h ago' },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, darkMode, setDarkMode, onLogout, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const { language, t, isRTL } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('read_notifications');
    if (saved) {
      const readIds: string[] = JSON.parse(saved);
      return INITIAL_NOTIFICATIONS.filter(n => !readIds.includes(n.id));
    }
    return INITIAL_NOTIFICATIONS;
  });

  const pageNameObj = PAGE_NAMES[location.pathname];
  const pageName = pageNameObj ? pageNameObj[language] : (language === 'ar' ? 'البوابة' : 'Portal');
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    const savedReadIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    localStorage.setItem('read_notifications', JSON.stringify([...savedReadIds, id]));
  };

  const handleMarkAllAsRead = () => {
    const allIds = INITIAL_NOTIFICATIONS.map(n => n.id);
    setNotifications([]);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3">

      {/* Left: Breadcrumb & Mobile Menu Trigger */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gold-500 md:hidden transition shrink-0 cursor-pointer"
            title={language === 'ar' ? 'القائمة الرئيسية' : 'Open navigation menu'}
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
                <ChevronRight className="w-3 h-3 opacity-50 rtl:rotate-180" />
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
      <div className="flex items-center space-x-3 rtl:space-x-reverse w-full md:w-auto justify-end">
        
        {/* Language Switcher */}
        <LanguageToggle />

        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
          title={language === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 relative transition cursor-pointer"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <span>{t('notifications')}</span>
                  {notifications.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                      {notifications.length} {language === 'ar' ? 'جديد' : 'New'}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 hover:underline transition cursor-pointer"
                  >
                    {t('mark_all_read')}
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs flex justify-between items-start cursor-pointer group"
                      title={language === 'ar' ? 'اضغط لتحديده كمقروء' : 'Click to mark as read'}
                    >
                      <div className="space-y-1 pr-3 rtl:pr-0 rtl:pl-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-gold-500 transition">{n.title}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{n.desc}</div>
                        <div className="text-[10px] text-slate-400">{n.time}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition shrink-0 cursor-pointer"
                        title={t('mark_all_read')}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">{t('all_caught_up')}</p>
                    <p className="text-[11px] text-slate-400">{language === 'ar' ? 'لا توجد إشعارات جديدة حالياً.' : 'No unread notifications at this time.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
            title={t('btn_sign_out')}
          >
            <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
            <span className="hidden sm:inline">{t('btn_sign_out')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
