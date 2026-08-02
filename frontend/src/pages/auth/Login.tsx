import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, User, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

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

      // Successful login
      onLoginSuccess(data.user, data.access_token);

      // Redirect based on role
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-950 p-8 text-center text-white relative border-b-4 border-gold-500">
          <div className="w-14 h-14 rounded-full bg-gold-500 text-emerald-950 flex items-center justify-center mx-auto mb-3 font-bold shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Portal Access Login</h2>
          <p className="text-xs text-gold-400 mt-1">Quranic Boarding School Management System</p>
        </div>

        {/* Quick Demo Credentials Banner */}
        <div className="bg-emerald-900/10 border-b border-emerald-900/20 p-3 text-xs text-center text-emerald-800 dark:text-gold-400 font-medium">
          Demo Accounts: <span className="font-bold underline cursor-pointer" onClick={() => { setUsername('admin'); setPassword('AdminPass123!'); }}>admin</span> | <span className="font-bold underline cursor-pointer" onClick={() => { setUsername('teacher1'); setPassword('TeacherPass123!'); }}>teacher1</span> | <span className="font-bold underline cursor-pointer" onClick={() => { setUsername('parent1'); setPassword('ParentPass123!'); }}>parent1</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!requires2FA ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-gold-500"
                    placeholder="Enter username..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-gold-500"
                    placeholder="Enter password..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Authenticator 2FA Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-gold-500 tracking-widest text-center font-bold"
                  placeholder="000000"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-900 to-emerald-950 text-gold-400 font-bold text-sm rounded-xl hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Authenticating...' : requires2FA ? 'Verify 2FA Code' : 'Sign In to Portal'}
          </button>
        </form>

      </div>
    </div>
  );
};
