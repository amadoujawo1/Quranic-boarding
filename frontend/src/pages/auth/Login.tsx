import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { t, language, isRTL } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [formKey, setFormKey] = useState(() => Date.now());

  // Completely wipe all login fields, browser autofill, errors, and stored tokens upon loading/logout
  useEffect(() => {
    setUsername('');
    setPassword('');
    setTotpCode('');
    setRequires2FA(false);
    setErrorMsg('');
    setShowCredentials(false);
    setLoading(false);
    setFormKey(Date.now());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();

    // Aggressively clear any delayed browser autofill injections
    const timers = [50, 150, 300, 500].map(delay =>
      setTimeout(() => {
        setUsername('');
        setPassword('');
        if (formRef.current) formRef.current.reset();
      }, delay)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleToggleCredentials = () => {
    setShowCredentials(prev => {
      const next = !prev;
      if (next) {
        setUsername('');
        setPassword('');
        setFormKey(Date.now());
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, totp_code: totpCode })
      });

      const data = await res.json();

      if (res.status === 402 && data.requires_2fa) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : 'Login failed. Please check your credentials.'));
        setLoading(false);
        return;
      }

      onLoginSuccess(data.user, data.access_token);

      setUsername('');
      setPassword('');
      setTotpCode('');
      setRequires2FA(false);
      setErrorMsg('');
      setShowCredentials(false);

      const roles: string[] = data.user.roles || [];
      if (roles.includes('Super Administrator') || roles.includes('Principal') || roles.includes('Hifz Coordinator')) {
        navigate('/admin/dashboard');
      } else if (roles.includes('Parent')) {
        navigate('/portal/parent');
      } else if (roles.includes('Student')) {
        navigate('/portal/student');
      } else {
        navigate('/portal/teacher');
      }
    } catch (err) {
      setErrorMsg(language === 'ar' ? 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم الخلفي.' : 'Cannot connect to the server. Please ensure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── LEFT PANEL ── */}
      <div className="relative hidden md:flex flex-col w-[48%] xl:w-[44%] overflow-hidden">
        {/* Background image with fallback gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark tinted overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(4, 39, 20, 0.65)' }} />
        {/* Blue-grey tint on top */}
        <div className="absolute inset-0" style={{ background: 'rgba(20, 45, 75, 0.40)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8 lg:p-10">
          {/* Logo row */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0 bg-white/10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight font-arabic">{t('school_name')}</p>
              <p className="text-white/60 text-xs">{language === 'ar' ? 'الإدارة · المعلمون · أولياء الأمور' : 'Admin · Teachers · Parents'}</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="my-auto py-12">
            <h1 className="text-white font-extrabold text-2xl lg:text-3xl xl:text-4xl leading-tight mb-5 font-arabic">
              {t('login_tagline_1')}
            </h1>
            <p className="text-white/75 text-sm lg:text-base leading-relaxed mb-8 max-w-sm font-arabic">
              {t('login_tagline_2')}
            </p>
            <ul className="space-y-3 font-arabic">
              {[
                language === 'ar' ? 'تسجيل دخول آمن وسريع للمركز' : 'Secure & fast school account login',
                language === 'ar' ? 'لوحات تحكم متخصصة لكل صلاحية' : 'Role-aware portals and dashboards',
                language === 'ar' ? 'متابعة شاملة للحفظ والحضور والرسوم' : 'Comprehensive Hifz, attendance & fee tracking',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} {t('school_name')}</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 bg-white dark:bg-slate-900 overflow-y-auto relative">
        {/* Top Language Toggle */}
        <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-20">
          <LanguageToggle />
        </div>

        <div className="w-full max-w-sm my-auto py-8">

          {/* Heading */}
          <h2 className="text-[1.85rem] font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight font-arabic">
            {requires2FA ? t('login_2fa_title') : t('login_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 font-arabic">
            {requires2FA
              ? t('login_2fa_subtitle')
              : t('login_subtitle')}
          </p>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!requires2FA ? (
            <div className="space-y-4">
              {/* Primary sign-in button */}
              <button
                type="button"
                id="btn-continue-school-account"
                onClick={handleToggleCredentials}
                className="w-full flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 transition-all duration-150 shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span className="font-arabic">{t('btn_continue_school_account')}</span>
              </button>

              {/* Expandable credential form */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: showCredentials ? '280px' : '0px' }}
              >
                <form ref={formRef} key={formKey} onSubmit={handleSubmit} autoComplete="off" className="pt-1 space-y-3">
                  {/* Hidden dummy honeypots to capture browser autofill */}
                  <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                  <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 font-arabic">
                      {t('login_username_label')}
                    </label>
                    <input
                      id="input-username"
                      name="qbsms_login_user"
                      type="text"
                      required
                      readOnly
                      onFocus={(e) => (e.target.readOnly = false)}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                      placeholder={t('login_username_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 font-arabic">
                      {t('login_password_label')}
                    </label>
                    <div className="relative">
                      <input
                        id="input-password"
                        name="qbsms_login_secret"
                        type={showPassword ? 'text' : 'password'}
                        required
                        readOnly
                        onFocus={(e) => (e.target.readOnly = false)}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                        placeholder={t('login_password_placeholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                        title={showPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    id="btn-sign-in-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-900 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer font-arabic"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {t('btn_signing_in')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t('btn_sign_in')}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] font-semibold text-slate-400 tracking-widest font-arabic">{t('login_new_here')}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <button
                  id="btn-apply-admission"
                  type="button"
                  onClick={() => navigate('/admissions')}
                  className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 transition-all duration-150 font-arabic cursor-pointer"
                >
                  {t('btn_apply_admission')}
                </button>
                <button
                  id="btn-track-application"
                  type="button"
                  onClick={() => navigate('/admissions')}
                  className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 transition-all duration-150 font-arabic cursor-pointer"
                >
                  {t('btn_track_application')}
                </button>
              </div>

              {/* Back to Home Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-gold-600 dark:text-gold-400 hover:underline font-semibold font-arabic cursor-pointer"
                >
                  {language === 'ar' ? '← العودة إلى الصفحة الرئيسية' : '← Return to School Homepage'}
                </button>
              </div>
            </div>
          ) : (
            /* ── 2FA STEP ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 font-arabic">
                  {language === 'ar' ? 'رمز تطبيق المصادقة' : 'Authenticator Code'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3" />
                  <input
                    id="input-totp"
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 tracking-widest text-center font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button
                id="btn-verify-2fa"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-900 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer font-arabic"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {language === 'ar' ? 'جاري التحقق…' : 'Verifying…'}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {language === 'ar' ? 'تأكيد رمز المصادقة' : 'Verify 2FA Code'}
                  </>
                )}
              </button>
              <button
                id="btn-back-to-signin"
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition font-arabic cursor-pointer"
              >
                {language === 'ar' ? '→ العودة لتسجيل الدخول' : '← Back to sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
