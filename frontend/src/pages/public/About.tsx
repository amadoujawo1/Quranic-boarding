import React from 'react';
import { BookOpen, ShieldCheck, Heart, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Our Sacred Legacy</span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">About the Centre for Quranic Memorization</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Founded on authentic Islamic values, the Centre for Quranic Memorization provides an integrated boarding environment where pupils master Quranic memorization (Hifz), Tajweed science, Islamic jurisprudence, and modern academic subjects.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 rounded-2xl border border-gold-500/20 space-y-4 hover:shadow-xl hover:-translate-y-1 transition duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            To be a global beacon of Quranic boarding education, producing righteous Huffaz who embody Islamic character, excel in academic leadership, and serve humanity.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-8 rounded-2xl border border-gold-500/20 space-y-4 hover:shadow-xl hover:-translate-y-1 transition duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            To nurture students in a safe, disciplined residential environment with authentic Sanad-certified teachers, rigorous academic standards, and holistic character development.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
