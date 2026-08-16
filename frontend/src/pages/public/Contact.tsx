
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Contact: React.FC = () => {
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Get in Touch</span>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">Contact Imaam Naafi' Centre for Quranic Memorization</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              Reach out for admissions guidance, program inquiries, or general questions about our boarding and Hifz curriculum.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-950/90 border border-gold-400 text-gold-400 p-4 rounded-xl text-sm">
              Thank you for contacting us! Our admissions officer will reply to your email shortly.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500" placeholder="name@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Message</label>
                <textarea required rows={5} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl hover:brightness-110 transition">
                Send Message
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
