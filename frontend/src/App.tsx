import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Programmes } from './pages/public/Programmes';
import { Admissions } from './pages/public/Admissions';
import { HifzProgramme } from './pages/public/HifzProgramme';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/auth/Login';

// Dashboard & Portals
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { FinancePage } from './pages/admin/FinancePage';
import { AdmissionsPage } from './pages/admin/AdmissionsPage';
import { ParentPortal } from './pages/portals/ParentPortal';
import { StudentPortal } from './pages/portals/StudentPortal';
import { TeacherPortal } from './pages/portals/TeacherPortal';
import { UserManagement } from './pages/admin/UserManagement';

const LayoutWrapper: React.FC<{
  children: React.ReactNode;
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
}> = ({ children, user, darkMode, setDarkMode, onLogout }) => {
  const location = useLocation();
  const isAdminOrPortalRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/portal');

  if (isAdminOrPortalRoute) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <AdminSidebar user={user} onLogout={onLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={onLogout} />
          <main className="p-6 md:p-8 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={user} onLogout={onLogout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <LayoutWrapper user={user} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/hifz-programme" element={<HifzProgramme />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

          {/* Admin & Portals */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/finance" element={<FinancePage />} />
          <Route path="/admin/admissions" element={<AdmissionsPage />} />
          <Route path="/admin/users" element={<UserManagement />} />

          {/* Portals */}
          <Route path="/portal/parent" element={<ParentPortal />} />
          <Route path="/portal/student" element={<StudentPortal />} />
          <Route path="/portal/teacher" element={<TeacherPortal />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
};
export default App;
