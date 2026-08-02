import React from 'react';
import { BookOpen, CheckCircle, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const HifzProgramme: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Core Quranic Track</span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Quran Memorization (Hifz) & Tajweed</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Our specialized methodology ensures total memorization of the 30 Juz of the Holy Quran, accompanied by Tajweed rules, Makharij evaluation, and lifelong retention through structured revision.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "1. Sabaq (New Memorization)", desc: "Daily allocation of new verses recited to the Halaqah teacher every morning after Fajr prayer." },
          { title: "2. Sabqi (Recent Revision)", desc: "Recitation of the last 5 to 10 pages memorized in previous days to solidify retention." },
          { title: "3. Manzil (Old Revision)", desc: "Systematic revision of entire completed Juz on a revolving weekly schedule." }
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
    </div>
  );
};
