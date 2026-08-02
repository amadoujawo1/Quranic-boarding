import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Compass, HeartHandshake, CheckCircle2, Clock, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Programmes: React.FC = () => {
  const mainProgrammes = [
    {
      id: 'hifz',
      icon: BookOpen,
      badge: 'Core Excellence',
      badgeColor: 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border-gold-500/30',
      title: 'Full-Time Hifz & Tajweed Track',
      duration: '2 - 3 Years',
      targetAge: 'Ages 9 - 17',
      description: 'Intensive full-boarding Quranic memorization track featuring daily Sabaq, Sabqi, and Manzil sessions guided by Sanad-certified Quraa.',
      highlights: [
        'Daily 3-phase revision methodology (Sabaq, Sabqi, Manzil)',
        'Authentic Tajweed & Makharij perfection',
        'Ijazah / Sanad path with connected chain to the Prophet (ﷺ)',
        'Quarterly oral evaluation exams by external Shaykhs'
      ],
      link: '/hifz-programme'
    },
    {
      id: 'islamic',
      icon: GraduationCap,
      badge: 'Shariah & Language',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      title: 'Islamic Studies & Shariah Sciences',
      duration: 'Ongoing Secondary',
      targetAge: 'Ages 10 - 18',
      description: 'Grounded Islamic education instilling foundational knowledge in classical Shariah disciplines, Arabic syntax, and Quranic exegesis.',
      highlights: [
        'Fiqh of Worship & Daily Transactions',
        'Aqeedah (Islamic Creed) & Philosophy',
        'Hadith Sciences & Prophetic Seerah',
        'Classical Arabic Grammar (Nahw & Sarf)'
      ]
    },
    {
      id: 'stem',
      icon: Compass,
      badge: 'Integrated Academics',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      title: 'STEM & General Academics',
      duration: 'Primary & Secondary',
      targetAge: 'Ages 8 - 18',
      description: 'Balanced modern school curriculum ensuring students maintain top academic standing in sciences, mathematics, humanities, and IT.',
      highlights: [
        'Mathematics, Physics, Chemistry & Biology',
        'ICT, Computer Literacy & Coding Basics',
        'English Language & Literature Mastery',
        'Social Studies & History'
      ]
    },
    {
      id: 'tarbiyah',
      icon: HeartHandshake,
      badge: 'Spiritual Life',
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      title: 'Tarbiyah & Character Development',
      duration: 'Integrated Daily',
      targetAge: 'All Students',
      description: 'Holistic residential mentoring focused on moral rectitude, leadership skills, emotional well-being, and daily Islamic etiquette.',
      highlights: [
        'Daily congregational prayers & Qiyam-ul-Layl',
        'Mentorship & personal spiritual counseling',
        'Leadership workshops & public speaking in Arabic/English',
        'Physical education, martial arts & outdoor activities'
      ]
    }
  ];

  const dailySchedule = [
    { time: '04:30 AM - 05:30 AM', activity: 'Qiyam-ul-Layl & Fajr Congregational Prayer' },
    { time: '05:30 AM - 07:30 AM', activity: 'Morning Hifz Session: Sabaq (New Lesson Recitation)' },
    { time: '07:30 AM - 08:30 AM', activity: 'Healthy Breakfast & Morning Assembly' },
    { time: '08:30 AM - 01:30 PM', activity: 'STEM & General Academic Classes' },
    { time: '01:30 PM - 02:30 PM', activity: 'Zuhr Prayer & Lunch Break' },
    { time: '02:30 PM - 04:30 PM', activity: 'Afternoon Session: Sabqi (Recent Revision) & Islamic Studies' },
    { time: '04:30 PM - 06:00 PM', activity: 'Asr Prayer, Sports, Recreation & Personal Time' },
    { time: '06:00 PM - 08:00 PM', activity: 'Maghrib Prayer, Manzil (Old Revision) & Isha Prayer' },
    { time: '08:00 PM - 09:30 PM', activity: 'Dinner, Homework Prep & Lights Out' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Educational Excellence
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Educational Programmes & Curriculum
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
          Discover our balanced educational tracks combining intensive Quranic memorization, authentic Shariah knowledge, modern STEM academics, and character development.
        </p>
      </motion.div>

      {/* Main Programmes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mainProgrammes.map((prog, index) => {
          const Icon = prog.icon;
          return (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-gold-500/40 transition duration-300 flex flex-col justify-between group hover:shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-gold-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-gold-500 transition-colors">
                    {prog.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold-500" /> {prog.duration}</span>
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> {prog.targetAge}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Highlights:</span>
                  <ul className="space-y-2">
                    {prog.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {prog.link && (
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={prog.link}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 transition group/link"
                  >
                    View Detailed Hifz Structure <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Daily Routine Schedule Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-card p-8 md:p-10 rounded-3xl border border-gold-500/20 bg-gradient-to-br from-emerald-950/90 to-slate-900 text-white space-y-8 shadow-2xl"
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Structured Daily Life</span>
          <h2 className="text-3xl font-extrabold text-white">A Day in the Life of a QBSMS Boarding Student</h2>
          <p className="text-slate-300 text-sm">
            Our daily schedule balances spiritual worship, Quranic memorization, academic studies, physical activity, and adequate rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailySchedule.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-emerald-900/40 p-4 rounded-xl border border-gold-500/20 flex flex-col justify-between space-y-2 hover:border-gold-400/40 transition"
            >
              <span className="text-xs font-bold text-gold-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {item.time}
              </span>
              <p className="text-xs text-slate-200 font-medium leading-snug">
                {item.activity}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 p-8 md:p-12 rounded-3xl text-slate-950 font-sans shadow-xl space-y-6"
      >
        <ShieldCheck className="w-12 h-12 mx-auto text-slate-950" />
        <h2 className="text-3xl font-extrabold tracking-tight">Ready to Enroll Your Child?</h2>
        <p className="max-w-2xl mx-auto text-slate-900 font-medium text-sm md:text-base leading-relaxed">
          Applications are open for the upcoming academic session. Provide your child with the gift of Quranic memorization and leadership.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/admissions"
            className="px-8 py-3.5 rounded-xl bg-slate-950 text-gold-400 font-bold hover:bg-slate-900 transition shadow-lg inline-flex items-center gap-2"
          >
            Apply for Admission <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-xl bg-white/30 backdrop-blur-sm text-slate-950 font-bold hover:bg-white/40 transition border border-slate-950/20"
          >
            Contact Admissions Office
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
