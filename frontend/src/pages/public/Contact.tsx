import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Send, Mail, Phone, MapPin } from 'lucide-react';

export const Contact: React.FC = () => {
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
      setSuccessMsg(data.message || 'Thank you for contacting us! Your message has been forwarded to our admissions office (ousainouss@yahoo.com).');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Unable to send message right now. Please try again.');
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
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Get in Touch</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">Contact Imaam Naafi' Centre for Quranic Memorization</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              Reach out for admissions guidance, program inquiries, or general questions about our boarding and Hifz curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 pb-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <Mail className="w-4 h-4 text-gold-500 shrink-0" />
              <span className="truncate">ousainouss@yahoo.com</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <Phone className="w-4 h-4 text-gold-500 shrink-0" />
              <span>+220 87 7918643</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
              <span>Banjul, The Gambia</span>
            </div>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-950 text-gold-300 border border-gold-500/40 p-6 rounded-2xl text-sm space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-gold-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Message Sent Successfully!</span>
              </div>
              <p className="text-slate-200">
                {successMsg || 'Thank you for contacting us! Your inquiry has been forwarded to our admissions office (ousainouss@yahoo.com), and we will reply to your email shortly.'}
              </p>
              <button
                onClick={() => setContactSubmitted(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-900 text-gold-300 hover:bg-emerald-800 transition cursor-pointer border border-emerald-700"
              >
                Send another message
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
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    placeholder="Full name..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    placeholder="+220 ... / +1 ..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  placeholder="name@domain.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Message / Inquiry *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  placeholder="How can we help you regarding admissions, boarding, or Hifz classes?"
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
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
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

