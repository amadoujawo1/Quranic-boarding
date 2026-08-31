import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Award, Star, GraduationCap, CheckCircle2, UserCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export const HifzProgramme: React.FC = () => {
  const { t } = useLanguage();
  const [graduates, setGraduates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/students/alumni')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.alumni) {
          setGraduates(data.alumni);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">{t('hifz_label')}</span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('hifz_title')}</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          {t('hifz_subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: t('hifz_sabaq_title'), desc: t('hifz_sabaq_desc') },
          { title: t('hifz_sabqi_title'), desc: t('hifz_sabqi_desc') },
          { title: t('hifz_manzil_title'), desc: t('hifz_manzil_desc') }
        ].map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 hover:shadow-xl hover:-translate-y-1 transition duration-300"
          >
            <div className="text-gold-500 font-bold text-xl">{item.title}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Featured Hifz Huffaz Graduates Showcase */}
      <section className="space-y-8 bg-gradient-to-b from-emerald-950/90 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-gold-500/30 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">{t('hifz_graduates_title')}</h2>
          <p className="text-xs text-slate-300">
            {t('hifz_graduates_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {graduates.slice(0, 6).map((g) => (
            <div 
              key={g.id} 
              className="bg-slate-900/90 border border-gold-500/30 rounded-2xl p-5 space-y-3 hover:border-gold-400 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-600 text-emerald-950 font-black text-xs flex items-center justify-center">
                    {g.full_name?.substring(0, 2).toUpperCase() || 'HF'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{g.full_name}</h3>
                    <span className="text-[11px] text-gold-400 font-semibold">{g.student_id_number || `GRAD-${g.graduation_year}`}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/40">
                  {g.graduation_year} {t('hifz_graduates_hafiz')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-gold-400" /> {t('hifz_graduates_higher_ed')}</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">{g.higher_education || 'Islamic Studies'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('hifz_graduates_profession')}</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">{g.current_occupation || 'Alumni Hafiz'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gold-400 font-bold border-t border-slate-800 pt-2">
                <span>{t('hifz_graduates_completed')} {g.hifz_completion_date || `${g.graduation_year}-05-15`}</span>
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> {t('hifz_graduates_30_juz')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

