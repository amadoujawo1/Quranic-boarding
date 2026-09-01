import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Send, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admissions/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      setContactSubmitted(true);
      setSuccessMsg(data.message || t('contact_success_msg'));
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || t('contact_error_default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">{t('contact_label')}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">{t('contact_title')}</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              {t('contact_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 pb-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <Mail className="w-4 h-4 text-gold-500 shrink-0" />
              <span className="truncate">{t('contact_info_email')}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <Phone className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{t('contact_info_phone')}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{t('contact_info_location')}</span>
            </div>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-950 text-gold-300 border border-gold-500/40 p-6 rounded-2xl text-sm space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-gold-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('contact_success_title')}</span>
              </div>
              <p className="text-slate-200">
                {successMsg || t('contact_success_msg')}
              </p>
              <button
                onClick={() => setContactSubmitted(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-900 text-gold-300 hover:bg-emerald-800 transition cursor-pointer border border-emerald-700"
              >
                {t('contact_send_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact_label_name')}</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    placeholder={t('contact_placeholder_name')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact_label_phone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    placeholder={t('contact_placeholder_phone')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact_label_email')}</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  placeholder={t('contact_placeholder_email')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('contact_label_message')}</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  placeholder={t('contact_placeholder_message')}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('contact_btn_sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('contact_btn_send')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

