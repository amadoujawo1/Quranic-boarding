import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Home as HomeIcon, 
  DollarSign, FileText, Settings, ShieldCheck, LogOut, ChevronRight, ClipboardList
} from 'lucide-react';

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { title: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Admissions', path: '/admin/admissions', icon: ClipboardList },
    { title: 'Student Management', path: '/admin/students', icon: Users },
    { title: 'Users & Roles', path: '/admin/users', icon: Settings },
    { title: 'Fee & Financials', path: '/admin/finance', icon: DollarSign },
    { title: 'Parent Portal', path: '/portal/parent', icon: ShieldCheck },
    { title: 'Student Portal', path: '/portal/student', icon: ShieldCheck },
    { title: 'Teacher Portal', path: '/portal/teacher', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-emerald-950 text-slate-300 flex flex-col border-r border-gold-500/20 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-gold-500/20 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="School Logo"
          className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gold-500/30"
        />
        <div>
          <h2 className="text-white font-extrabold tracking-wide text-sm leading-tight">Centre for Quranic Memorization</h2>
          <span className="text-[10px] text-gold-400 font-semibold block leading-tight"></span>
        </div>
      </div>

      {/* User Badge */}
      <div className="px-6 py-4 bg-emerald-900/40 border-b border-emerald-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 flex items-center justify-center text-xs font-bold">
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 shadow-md'
                  : 'text-slate-300 hover:bg-emerald-900/60 hover:text-gold-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-gold-500/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};
