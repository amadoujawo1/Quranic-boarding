import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  user?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, language, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_about'), path: '/about' },
    { name: t('nav_programmes'), path: '/programmes' },
    { name: t('nav_hifz'), path: '/hifz-programme' },
    { name: t('nav_admissions'), path: '/admissions' },
    { name: t('nav_contact'), path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg backdrop-blur-md bg-emerald-950/85' : 'shadow-md bg-emerald-950'}`}>
      {/* Top Bar with Islamic Info & Language / Theme Toggle */}
      <div className={`text-gold-400 px-4 text-xs font-medium border-b border-gold-500/20 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-12 py-1.5 opacity-100 bg-islamic-deepGreen'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-arabic text-sm text-gold-400 font-semibold">{t('bismillah')}</span>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Language Switcher in Top Bar */}
            <LanguageToggle className="scale-90" />

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-full hover:bg-gold-500/20 text-gold-400 transition cursor-pointer"
              title={language === 'ar' ? 'تغيير المظهر' : 'Toggle Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`text-white border-b border-gold-500/30 transition-colors duration-300 ${isScrolled ? 'bg-transparent' : 'bg-emerald-950'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="School Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-lg ring-2 ring-gold-500/40 group-hover:ring-gold-400 transition-all"
            />
            <div>
              <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-wide text-white block leading-tight font-arabic">
                {t('school_name')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive(link.path)
                    ? 'text-gold-400 bg-emerald-900/60 font-semibold border-b-2 border-gold-400'
                    : 'text-slate-200 hover:text-gold-400 hover:bg-emerald-900/40'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gold-400 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-gold-500/20">
                  👤 {user.full_name || user.username}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs font-bold hover:bg-rose-900 transition cursor-pointer"
                >
                  <LogOut className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} /> {t('btn_sign_out')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-sm shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <User className="w-4 h-4" />
                {t('nav_login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-gold-400 hover:bg-emerald-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-emerald-950/95 backdrop-blur-md border-b border-gold-500/20 px-4 overflow-hidden"
            >
              <div className="pt-2 pb-6 space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-emerald-900/60 mb-2">
                  <span className="text-xs text-gold-400 font-semibold">{t('lang_english')} / {t('lang_arabic')}</span>
                  <LanguageToggle />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.path) ? 'text-gold-400 bg-emerald-900 font-bold' : 'text-slate-200 hover:text-gold-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-emerald-900">
                  {user ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-950/80 border border-rose-700/50 text-rose-300 font-bold text-sm"
                    >
                      <LogOut className="w-4 h-4" /> {t('btn_sign_out')}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 text-emerald-950 font-bold text-sm"
                    >
                      <User className="w-4 h-4" /> {t('nav_login')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

