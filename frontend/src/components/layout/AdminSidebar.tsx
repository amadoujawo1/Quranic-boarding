import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Home as HomeIcon, 
  DollarSign, FileText, Settings, ShieldCheck, LogOut, ChevronRight, ClipboardList, X, Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const { t, language, isRTL } = useLanguage();

  const menuItems = [
    { title: t('menu_overview'), path: '/admin/dashboard', icon: LayoutDashboard },
    { title: t('menu_attendance'), path: '/admin/attendance', icon: Clock },
    { title: t('menu_admissions'), path: '/admin/admissions', icon: ClipboardList },
    { title: t('menu_students'), path: '/admin/students', icon: Users },
    { title: t('menu_users'), path: '/admin/users', icon: Settings },
    { title: t('menu_finance'), path: '/admin/finance', icon: DollarSign },
    { title: t('menu_parent_portal'), path: '/portal/parent', icon: ShieldCheck },
    { title: t('menu_student_portal'), path: '/portal/student', icon: ShieldCheck },
    { title: t('menu_teacher_portal'), path: '/portal/teacher', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static top-0 bottom-0 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } z-50 w-64 bg-emerald-950 text-slate-300 flex flex-col border-gold-500/20 shrink-0 h-screen md:min-h-screen transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 shadow-2xl'
            : isRTL
            ? 'translate-x-full md:translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gold-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="School Logo"
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-gold-500/30"
            />
            <div>
              <h2 className="text-white font-extrabold tracking-wide text-xs leading-tight font-arabic">
                {t('school_name')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge */}
        <div className="px-6 py-4 bg-emerald-900/40 border-b border-emerald-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{user?.full_name || 'Administrator'}</div>
            <div className="text-[10px] text-gold-400 truncate">{user?.roles?.[0] || 'Super Administrator'}</div>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-emerald-900/60 hover:text-gold-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {active && <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-gold-500/20">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 transition cursor-pointer"
          >
            <LogOut className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} /> {t('btn_sign_out')}
          </button>
        </div>
      </aside>
    </>
  );
};
