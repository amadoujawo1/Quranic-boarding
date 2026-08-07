import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Send, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-emerald-950 text-slate-300 border-t-4 border-gold-500 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="School Logo" className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-500/30" />
              <span className="text-xl font-bold text-white tracking-wide">Centre</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Centre for Quranic Memorization — Nurturing academic brilliance and spiritual perfection through authentic Islamic education and complete Hifz memorization.
            </p>
            <div className="text-gold-400 font-arabic text-lg pt-2">
              "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 border-b border-gold-500/30 pb-2 inline-block">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-gold-400 transition">About Our Academy</Link></li>
              <li><Link to="/hifz-programme" className="hover:text-gold-400 transition">Hifz & Tajweed Curriculum</Link></li>
              <li><Link to="/admissions" className="hover:text-gold-400 transition">Online Admission Process</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals & Contact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 border-b border-gold-500/30 pb-2 inline-block">
              Access & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Parent Portal</Link></li>
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Student Portal</Link></li>
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Staff & Teacher Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 border-b border-gold-500/30 pb-2 inline-block">
              Newsletter Subscription
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Subscribe for school announcements, event dates, and Islamic educational insights.
            </p>
            {subscribed ? (
              <div className="bg-emerald-900/80 border border-gold-500 text-gold-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <Heart className="w-4 h-4 fill-gold-400" /> JazakAllah Khair! Subscribed successfully.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter parent email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-lg hover:brightness-110 flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Subscribe Now
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 Centre for Quranic Memorization. All rights reserved.</p>
          <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
            <p className="text-slate-400">Created by Infra Vision Solutions</p>
            <p className="text-slate-400 font-arabic">وَوَفَّقَكُمُ ٱللَّهُ لِمَا يُحِبُّ وَيَرْضَىٰ</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
