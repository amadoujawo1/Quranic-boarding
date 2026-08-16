import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Users, Home as HomeIcon, CheckCircle2, ChevronRight, Calendar, Star, MapPin, Mail, Phone, Clock } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';

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
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] = useState<PublicOverviewStats>({
    total_students: 0,
    hifz_graduates: 0,
    teachers: 0,
    total_beds: 0,
  });

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
    { title: 'Students Enrolled', num: overviewStats.total_students, suffix: '', icon: Users },
    { title: 'Hifz Huffaz Graduates', num: overviewStats.hifz_graduates, suffix: '', icon: Award },
    { title: 'Qualified Teachers', num: overviewStats.teachers, suffix: '', icon: BookOpen },
    { title: 'Hostel Capacity', num: overviewStats.total_beds, suffix: ' Beds', icon: HomeIcon },
  ];

  const programmes = [
    {
      title: 'Full-Time Hifz Programme',
      desc: 'Complete Quran memorization within 2 to 3 years under master teachers (Huffaz & Quraa) with Tajweed mastery.',
      badge: 'Core Program',
      link: '/hifz-programme'
    },
    {
      title: 'Islamic Studies & Shariah',
      desc: 'Comprehensive curriculum covering Aqeedah, Fiqh, Hadith, Tafsir, Seerah, and Classical Arabic literature.',
      badge: 'Academic',
      link: '/programmes'
    },
    {
      title: 'Modern Science & STEM',
      desc: 'Balanced state curriculum with Physics, Chemistry, Biology, Mathematics, Computer Science, and English.',
      badge: 'Modern Curriculum',
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
                Empowering Minds with <span className="gold-gradient-text">Quranic Light</span> & Academic Excellence
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Providing a world-class Islamic residential experience. We combine full Hifz memorization, authentic Shariah knowledge, and modern academic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/admissions"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-base shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  Apply for Admission <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/hifz-programme"
                  className="px-6 py-3 rounded-xl bg-emerald-900/80 border border-gold-500/40 text-gold-400 font-bold text-base hover:bg-emerald-900 transition flex items-center justify-center gap-2"
                >
                  Explore Hifz Curriculum
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
                  <p className="text-xs text-slate-300 italic">"Read in the name of your Lord who created"</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-gold-500/20 text-sm">
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>Structured 3-Tier Revision (Sabaq, Sabqi, Manzil)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>24/7 Boarding Supervision & Prayer Discipline</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                    <span>Healthy Halal Meals & Health Monitoring</span>
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
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading latest data...'}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl text-center shadow-sm border border-gold-500/20 hover:border-gold-500 transition group hover:-translate-y-1"
              >
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
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Leadership Insights</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Message from the Principal</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic">
              "At the Centre for Quranic Memorization, our mission goes beyond academic instruction. We strive to mold young minds into upright, God-conscious leaders who carry the Holy Quran in their hearts and excel in modern sciences. Every student receives personal care in memorization, Tajweed, and character building."
            </p>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">Sheikh Suwaibou Bah</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Principal</div>
            </div>
          </div>
          <div className="bg-emerald-950 p-6 rounded-2xl border border-gold-500/30 text-center text-white space-y-3">
            <div className="text-sm font-semibold">Verified Sanad & Ijazah</div>
            <p className="text-xs text-slate-300">Our Quraa possess authentic chains of transmission (Sanad) connecting directly to the Prophet Muhammad (ﷺ).</p>
          </div>
        </motion.div>
      </section>

      {/* Programmes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Educational Programmes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tailored path for spiritual growth and academic brilliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Read Full Details <ChevronRight className="w-4 h-4" />
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
            <h2 className="text-3xl font-bold">Contact Our Admissions Office</h2>
            <p className="text-slate-300 text-sm">Have questions about admissions, entry assessments, or fee structures? Send us a message.</p>

            {contactSubmitted ? (
              <div className="bg-emerald-900/90 border border-gold-400 text-gold-400 p-4 rounded-xl text-sm">
                Thank you for contacting us! Our admissions officer will reply to your email shortly.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Parent / Guardian Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500" placeholder="Full name..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input required type="email" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500" placeholder="name@domain.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message / Inquiry</label>
                  <textarea required rows={4} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-gold-500" placeholder="Tell us about your student..."></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-sm rounded-xl hover:brightness-110 transition">
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
