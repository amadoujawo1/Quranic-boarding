import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Programmes', path: '/programmes' },
    { name: 'Hifz Programme', path: '/hifz-programme' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg backdrop-blur-md bg-emerald-950/85' : 'shadow-md bg-emerald-950'}`}>
      {/* Top Bar with Islamic Info & Weather */}
      <div className={`text-gold-400 px-4 text-xs font-medium border-b border-gold-500/20 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-12 py-1.5 opacity-100 bg-islamic-deepGreen'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-arabic text-sm text-gold-400">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded-full hover:bg-gold-500/20 text-gold-400 transition"
              title="Toggle Dark Mode"
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
              alt="Imaam Naafi' Centre for Quranic Memorization"
              className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-gold-500/40 group-hover:ring-gold-400 transition-all"
            />
            <div>
              <span className="text-xl font-extrabold tracking-wide text-white block">Imaam Naafi' Centre for Quranic Memorization</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gold-400 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-gold-500/20">
                  👤 {user.full_name || user.username}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs font-bold hover:bg-rose-900 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-sm shadow-md hover:brightness-110 transition"
              >
                <User className="w-4 h-4" />
                Portals Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-gold-400 hover:bg-emerald-900"
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
                {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path) ? 'text-gold-400 bg-emerald-900' : 'text-slate-200 hover:text-gold-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-emerald-900">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 text-emerald-950 font-bold text-sm"
              >
                <User className="w-4 h-4" /> Portals Login
              </Link>
            </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
