import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-emerald-950 text-slate-300 border-t-4 border-gold-500 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="School Logo" className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-500/30" />
              <span className="text-xl font-bold text-white tracking-wide">{t('footer_centre_label')}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer_description')}
            </p>
            <div className="text-gold-400 font-arabic text-lg pt-2">
              "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 border-b border-gold-500/30 pb-2 inline-block">
              {t('footer_quick_nav_title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-gold-400 transition">{t('footer_about_link')}</Link></li>
              <li><Link to="/hifz-programme" className="hover:text-gold-400 transition">{t('footer_hifz_link')}</Link></li>
              <li><Link to="/admissions" className="hover:text-gold-400 transition">{t('footer_admission_link')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals & Contact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 border-b border-gold-500/30 pb-2 inline-block">
              {t('footer_access_title')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t('footer_parent_portal')}</Link></li>
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t('footer_student_portal')}</Link></li>
              <li><Link to="/login" className="text-gold-400 hover:underline flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t('footer_staff_portal')}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>{t('footer_copyright')}</p>
          <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
            <p className="text-slate-400">{t('footer_created_by')}</p>
            <p className="text-slate-400 font-arabic">وَوَفَّقَكُمُ ٱللَّهُ لِمَا يُحِبُّ وَيَرْضَىٰ</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
