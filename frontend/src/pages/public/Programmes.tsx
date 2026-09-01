import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Compass, HeartHandshake, CheckCircle2, Clock, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export const Programmes: React.FC = () => {
  const { t } = useLanguage();
  const mainProgrammes = [
    {
      id: 'hifz',
      icon: BookOpen,
      badge: t('programmes_hifz_badge'),
      badgeColor: 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border-gold-500/30',
      title: t('programmes_hifz_title'),
      duration: t('programmes_hifz_duration'),
      targetAge: t('programmes_hifz_age'),
      description: t('programmes_hifz_desc'),
      highlights: [
        t('programmes_hifz_highlight_1'),
        t('programmes_hifz_highlight_2'),
        t('programmes_hifz_highlight_3'),
        t('programmes_hifz_highlight_4')
      ],
      link: '/hifz-programme'
    },
    {
      id: 'islamic',
      icon: GraduationCap,
      badge: t('programmes_islamic_badge'),
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      title: t('programmes_islamic_title'),
      duration: t('programmes_islamic_duration'),
      targetAge: t('programmes_islamic_age'),
      description: t('programmes_islamic_desc'),
      highlights: [
        t('programmes_islamic_highlight_1'),
        t('programmes_islamic_highlight_2'),
        t('programmes_islamic_highlight_3'),
        t('programmes_islamic_highlight_4')
      ]
    },
    {
      id: 'tarbiyah',
      icon: HeartHandshake,
      badge: t('programmes_tarbiyah_badge'),
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      title: t('programmes_tarbiyah_title'),
      duration: t('programmes_tarbiyah_duration'),
      targetAge: t('programmes_tarbiyah_age'),
      description: t('programmes_tarbiyah_desc'),
      highlights: [
        t('programmes_tarbiyah_highlight_1'),
        t('programmes_tarbiyah_highlight_2'),
        t('programmes_tarbiyah_highlight_3'),
        t('programmes_tarbiyah_highlight_4')
      ]
    }
  ];

  const dailySchedule = [
    { time: t('schedule_time_0430'), activity: t('schedule_activity_fajr') },
    { time: t('schedule_time_0530'), activity: t('schedule_activity_sabaq') },
    { time: t('schedule_time_0730'), activity: t('schedule_activity_breakfast') },
    { time: t('schedule_time_0830'), activity: t('schedule_activity_academics') },
    { time: t('schedule_time_1330'), activity: t('schedule_activity_dhuhr') },
    { time: t('schedule_time_1430'), activity: t('schedule_activity_sabqi') },
    { time: t('schedule_time_1630'), activity: t('schedule_activity_asr') },
    { time: t('schedule_time_1800'), activity: t('schedule_activity_manzil') },
    { time: t('schedule_time_2000'), activity: t('schedule_activity_dinner') }
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
          <Sparkles className="w-3.5 h-3.5" /> {t('programmes_label')}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('programmes_title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
          {t('programmes_subtitle')}
        </p>
      </motion.div>

      {/* Main Programmes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('programmes_key_highlights')}</span>
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
                    {t('programmes_view_hifz')} <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
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
          <span className="text-xs font-bold uppercase tracking-wider text-gold-400">{t('programmes_daily_label')}</span>
          <h2 className="text-3xl font-extrabold text-white">{t('programmes_daily_title')}</h2>
          <p className="text-slate-300 text-sm">
            {t('programmes_daily_subtitle')}
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
        <h2 className="text-3xl font-extrabold tracking-tight">{t('programmes_cta_title')}</h2>
        <p className="max-w-2xl mx-auto text-slate-900 font-medium text-sm md:text-base leading-relaxed">
          {t('programmes_cta_subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/admissions"
            className="px-8 py-3.5 rounded-xl bg-slate-950 text-gold-400 font-bold hover:bg-slate-900 transition shadow-lg inline-flex items-center gap-2"
          >
            {t('programmes_cta_apply')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-xl bg-white/30 backdrop-blur-sm text-slate-950 font-bold hover:bg-white/40 transition border border-slate-950/20"
          >
            {t('programmes_cta_contact')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
