import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Users, Home as HomeIcon, CheckCircle2, ChevronRight, Calendar, Star, MapPin, Mail, Phone, Clock, GraduationCap, X, Search, Sparkles, Loader2, AlertCircle, Send } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

type PublicOverviewStats = {
  total_students: number;
  hifz_graduates: number;
  teachers: number;
  total_beds: number;
};

const StatCounter = ({ num, suffix }: { num: number, suffix: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const previousCountRef = useRef(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(previousCountRef.current, num, {
        duration: 0.8,
        ease: "easeOut",
        onUpdate: (v) => setCount(Math.floor(v)),
      });
      previousCountRef.current = num;
      return controls.stop;
    }
  }, [isInView, num]);

  return <div ref={ref}>{count}{suffix}</div>;
};

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [overviewStats, setOverviewStats] = useState<PublicOverviewStats>({
    total_students: 0,
    hifz_graduates: 0,
    teachers: 0,
    total_beds: 0,
  });

  const [showGraduatesModal, setShowGraduatesModal] = useState(false);
  const [graduatesList, setGraduatesList] = useState<any[]>([]);
  const [loadingGraduatesModal, setLoadingGraduatesModal] = useState(false);
  const [graduateSearch, setGraduateSearch] = useState('');

  const fetchPublicGraduates = async () => {
    setShowGraduatesModal(true);
    if (graduatesList.length > 0) return;
    setLoadingGraduatesModal(true);
    try {
      const res = await fetch('/api/students/alumni');
      if (res.ok) {
        const data = await res.json();
        setGraduatesList(data.alumni || []);
      }
    } catch {
      // keep
    } finally {
      setLoadingGraduatesModal(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    setInquiryError('');
    try {
      const res = await fetch('/api/admissions/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          message: inquiryMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit inquiry');
      }
      setContactSubmitted(true);
      setInquirySuccessMsg(data.message || 'Thank you for contacting us! Your inquiry has been forwarded to our admissions office (amadoujawo88@gmail.com).');
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err: any) {
      setInquiryError(err.message || 'Unable to submit inquiry at this time. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    let intervalId: number | undefined;

    const loadPublicStats = async () => {
      try {
        const res = await fetch('/api/dashboard/public-stats');
        if (!res.ok) return;

        const data = await res.json();
        if (isMounted && data?.overview) {
          setOverviewStats({
            total_students: Number(data.overview.total_students) || 0,
            hifz_graduates: Number(data.overview.hifz_graduates) || 0,
            teachers: Number(data.overview.teachers) || 0,
            total_beds: Number(data.overview.total_beds) || 0,
          });
          setLastUpdated(data.last_updated || new Date().toISOString());
        }
      } catch {
        // Keep the latest visible stats if the public endpoint is temporarily unavailable.
      }
    };

    loadPublicStats();
    intervalId = window.setInterval(loadPublicStats, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPublicStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const stats = [
    { title: t('home_stat_students'), num: overviewStats.total_students, suffix: '', icon: Users },
    { title: t('home_stat_graduates'), num: overviewStats.hifz_graduates, suffix: '', icon: Award },
    { title: t('home_stat_teachers'), num: overviewStats.teachers, suffix: '', icon: BookOpen },
    { title: t('home_stat_programmes'), num: 4, suffix: '', icon: HomeIcon },
  ];

  const programmes = [
    {
      title: t('home_program_hifz_title'),
      desc: t('home_program_hifz_desc'),
      badge: t('home_program_hifz_badge'),
      link: '/hifz-programme'
    },
    {
      title: t('home_program_islamic_title'),
      desc: t('home_program_islamic_desc'),
      badge: t('home_program_islamic_badge'),
      link: '/programmes'
    }
  ];

  const testimonials = [
    {
      quote: "The school provided my son with the ideal environment to complete his Hifz while scoring straight A's in his science exams.",
      author: "Hajji Mohammed Al-Sayed",
      role: "Parent of 2025 Hafiz Graduate"
    },
    {
      quote: "The boarding discipline, daily Fajr prayer routine, and teacher mentorship shaped my character for university life.",
      author: "Tariq Mahmood",
      role: "Alumni & Current Engineering Student"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-emerald-950 text-white py-24 overflow-hidden border-b-4 border-gold-500">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 2 }}
          className="absolute inset-0 islamic-pattern"
        ></motion.div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {t('home_hero_title')}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {t('home_hero_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/admissions"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-base shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  {t('home_btn_apply')} <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/hifz-programme"
                  className="px-6 py-3 rounded-xl bg-emerald-900/80 border border-gold-500/40 text-gold-400 font-bold text-base hover:bg-emerald-900 transition flex items-center justify-center gap-2"
                >
                  {t('home_btn_explore_hifz')}
                </Link>
              </div>
            </motion.div>

            {/* Hero Card Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex justify-center"
            >
              <div className="w-full max-w-md bg-gradient-to-b from-emerald-900/90 to-emerald-950/90 backdrop-blur-md p-8 rounded-2xl border border-gold-500/40 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="font-arabic text-3xl text-gold-400">ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ</div>
                  <p className="text-xs text-slate-300 italic">"{t('home_quran_verse')}"</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-gold-500/20 text-sm">
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>{t('home_feature_revision')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>{t('home_feature_boarding')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>{t('home_feature_meals')}</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {lastUpdated ? `${t('home_stats_updated')} ${new Date(lastUpdated).toLocaleTimeString()}` : t('home_stats_loading')}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            const isGraduateCard = item.title === 'Hifz Huffaz Graduates';

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => isGraduateCard && fetchPublicGraduates()}
                className={`glass-card p-6 rounded-2xl text-center shadow-sm border border-gold-500/20 hover:border-gold-500 transition group hover:-translate-y-1 ${isGraduateCard ? 'cursor-pointer relative ring-2 ring-gold-500/30 hover:ring-gold-500' : ''}`}
              >
                {isGraduateCard && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-gold-500 text-emerald-950 shadow-sm animate-pulse">
                    {t('home_click_to_view')}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-950 dark:text-gold-400 mb-1">
                  <StatCounter num={item.num} suffix={item.suffix} />
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.title}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Principal Message */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
        >
          <div className="space-y-4 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">{t('home_principal_label')}</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home_principal_title')}</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic">
              "{t('home_principal_message')}"
            </p>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">{t('home_principal_name')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('home_principal_role')}</div>
            </div>
          </div>
          <div className="bg-emerald-950 p-6 rounded-2xl border border-gold-500/30 text-center text-white space-y-3">
            <div className="text-sm font-semibold">{t('home_sanad_title')}</div>
            <p className="text-xs text-slate-300">{t('home_sanad_desc')}</p>
          </div>
        </motion.div>
      </section>

      {/* Programmes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home_programmes_title')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('home_programmes_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {programmes.map((prog, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-gold-400">
                  {prog.badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{prog.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{prog.desc}</p>
              </div>
              <div className="pt-6">
                <Link to={prog.link} className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1">
                  {t('home_read_full_details')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact & Google Maps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 border border-gold-500/30">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">{t('home_contact_title')}</h2>
            <p className="text-slate-300 text-sm">{t('home_contact_subtitle')}</p>

            {contactSubmitted ? (
              <div className="bg-emerald-900/90 border border-gold-400 text-gold-300 p-6 rounded-2xl text-sm space-y-3">
                <div className="flex items-center gap-2 text-gold-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{t('home_inquiry_success')}</span>
                </div>
                <p className="text-slate-200">
                  {inquirySuccessMsg || t('home_inquiry_success_msg')}
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-gold-300 hover:bg-emerald-700 transition cursor-pointer"
                >
                  {t('home_inquiry_send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {inquiryError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{inquiryError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t('home_label_name')}</label>
                    <input
                      required
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
                      placeholder={t('home_placeholder_name')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t('home_label_phone')}</label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
                      placeholder={t('home_placeholder_phone')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('home_label_email')}</label>
                  <input
                    required
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
                    placeholder={t('home_placeholder_email')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('home_label_message')}</label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
                    placeholder={t('home_placeholder_message')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-sm rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
                >
                  {inquiryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('home_btn_sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('home_btn_submit')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* PUBLIC HIFZ HUFFAZ GRADUATES SHOWCASE MODAL */}
      {showGraduatesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gold-500/30 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowGraduatesModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 text-emerald-950 flex items-center justify-center shadow-md">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('home_graduates_title')}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-gold-400 font-bold text-xs rounded-full">
                    {graduatesList.length} Huffaz
                  </span>
                </div>
                <p className="text-xs text-slate-500">{t('home_graduates_subtitle')}</p>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t('home_graduates_search')}
                value={graduateSearch}
                onChange={(e) => setGraduateSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            {/* Graduates grid */}
            {loadingGraduatesModal ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t('home_graduates_loading')}</p>
              </div>
            ) : graduatesList.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                {t('home_graduates_none')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graduatesList
                  .filter(g => !graduateSearch || 
                    g.full_name?.toLowerCase().includes(graduateSearch.toLowerCase()) ||
                    g.current_occupation?.toLowerCase().includes(graduateSearch.toLowerCase()) ||
                    g.higher_education?.toLowerCase().includes(graduateSearch.toLowerCase()) ||
                    g.graduation_year?.toString().includes(graduateSearch)
                  )
                  .map((g) => (
                    <div 
                      key={g.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-600 text-emerald-950 font-black text-xs flex items-center justify-center">
                            {g.full_name?.substring(0, 2).toUpperCase() || 'HF'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{g.full_name}</h3>
                            <span className="text-[11px] text-emerald-600 dark:text-gold-400 font-semibold">{g.student_id_number || `GRAD-${g.graduation_year}`}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                          {t('home_graduates_class')} {g.graduation_year}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/50 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('home_graduates_education')}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{g.higher_education || t('home_default_education')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('home_graduates_profession')}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{g.current_occupation || t('home_default_occupation')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200 dark:border-slate-700/50 pt-2">
                        <span>{t('home_graduates_completion')}: {g.hifz_completion_date || `${g.graduation_year}-05-15`}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {t('home_graduates_complete')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowGraduatesModal(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                {t('home_graduates_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
