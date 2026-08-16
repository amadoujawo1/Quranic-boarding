import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass123!');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

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
        setErrorMsg(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onLoginSuccess(data.user, data.access_token);

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
      setErrorMsg('Cannot connect to the server. Please ensure the backend is running on port 5000.');
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
              <p className="text-white font-bold text-sm leading-tight">Imaam Naafi' Quranic Boarding School</p>
              <p className="text-white/60 text-xs">Admin · Teachers · Parents</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="my-auto py-12">
            <h1 className="text-white font-extrabold text-3xl lg:text-4xl xl:text-[2.55rem] leading-[1.15] mb-5">
              One secure door<br />
              to every school<br />
              you belong&nbsp;to.
            </h1>
            <p className="text-white/75 text-sm lg:text-[0.95rem] leading-relaxed mb-8 max-w-xs">
              Manage admissions, classrooms, attendance and fees for every role in your school community.
            </p>
            <ul className="space-y-3">
              {[
                'Single sign-on with Google',
                'No passwords to remember',
                'Role-aware dashboards out of the box',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Imaam Naafi' Quranic Boarding School</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <h2 className="text-[1.85rem] font-extrabold text-slate-900 mb-1 tracking-tight">
            {requires2FA ? 'Two-Factor Auth' : 'Welcome back'}
          </h2>
          <p className="text-slate-500 text-sm mb-7">
            {requires2FA
              ? 'Enter the 6-digit code from your authenticator app.'
              : 'Sign in to continue to your portal.'}
          </p>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs flex items-center gap-2">
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
                onClick={() => setShowCredentials((v) => !v)}
                className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Continue with School Account</span>
              </button>

              {/* Expandable credential form */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: showCredentials ? '260px' : '0px' }}
              >
                <form onSubmit={handleSubmit} className="pt-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Username or Email</label>
                    <input
                      id="input-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                      placeholder="Enter username..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      id="input-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                      placeholder="Enter password..."
                    />
                  </div>
                  <button
                    id="btn-sign-in-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-900 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-400 tracking-widest">NEW HERE?</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <button
                  id="btn-apply-admission"
                  type="button"
                  onClick={() => navigate('/admissions')}
                  className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-150"
                >
                  Apply for admission
                </button>
                <button
                  id="btn-track-application"
                  type="button"
                  onClick={() => navigate('/admissions')}
                  className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-150"
                >
                  Track application
                </button>
              </div>

              {/* Terms */}
              <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-1">
                By continuing you agree to our{' '}
                <a href="#" className="text-emerald-700 hover:underline">Terms</a>{' '}
                and{' '}
                <a href="#" className="text-emerald-700 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          ) : (
            /* ── 2FA STEP ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Authenticator Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="input-totp"
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 tracking-widest text-center font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button
                id="btn-verify-2fa"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-900 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify 2FA Code
                  </>
                )}
              </button>
              <button
                id="btn-back-to-signin"
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 transition"
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
