import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  GraduationCap,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40', icon: Clock },
  'Under Review': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/40', icon: Eye },
  'Interview Scheduled': { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/40', icon: Calendar },
  Accepted: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40', icon: CheckCircle },
  Rejected: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/40', icon: XCircle },
  Enrolled: { color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/40', icon: GraduationCap },
};

const STATUS_STEPS = [
  'Pending',
  'Under Review',
  'Interview Scheduled',
  'Accepted',
  'Enrolled',
];

const StatusBadge: React.FC<{ status: string; t: (key: string) => string }> = ({ status, t }) => {
  // Map status values to translation keys
  const statusMap: Record<string, string> = {
    'Pending': t('admissions_status_pending'),
    'Under Review': t('admissions_status_under_review'),
    'Interview Scheduled': t('admissions_status_interview_scheduled'),
    'Accepted': t('admissions_status_accepted'),
    'Rejected': t('admissions_status_rejected'),
    'Enrolled': t('admissions_status_enrolled'),
  };

  const meta = STATUS_META[status] || STATUS_META['Pending'];
  const Icon = meta.icon;
  const displayStatus = statusMap[status] || status;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {displayStatus}
    </span>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Pending';
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStepState = (current: string, step: string) => {
  const currentIndex = STATUS_STEPS.indexOf(current);
  const stepIndex = STATUS_STEPS.indexOf(step);
  if (stepIndex === -1) return 'upcoming';
  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'active';
  return 'upcoming';
};

export const Admissions: React.FC = () => {
  const { t } = useLanguage();
  const [reference, setReference] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [trackError, setTrackError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [submitState, setSubmitState] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleTrack = async () => {
    if (!reference.trim()) {
      setTrackError(t('admissions_error_ref'));
      return;
    }
    setTrackingLoading(true);
    setTrackError('');
    setTracking(null);
    try {
      const res = await fetch(`/api/admissions/track?application_number=${encodeURIComponent(reference.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setTrackError(data.message || t('admissions_error_not_found'));
      } else {
        setTracking(data);
      }
    } catch {
      setTrackError(t('admissions_error_server'));
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitMessage('');
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: submitState.full_name,
          date_of_birth: submitState.date_of_birth,
          gender: submitState.gender,
          guardian_name: submitState.guardian_name,
          guardian_phone: submitState.guardian_phone,
          guardian_email: submitState.guardian_email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || t('admissions_error_submit'));
      } else {
        setSubmitMessage(`${t('admissions_success_submit')} ${data.application_number}`);
        setSubmitState({
          full_name: '',
          date_of_birth: '',
          gender: 'Male',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
        });
      }
    } catch {
      setSubmitError(t('admissions_error_server'));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-10 py-10 px-6 sm:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-slate-900 p-10 text-white shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{t('admissions_public_title')}</h1>
          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-3xl">{t('admissions_public_subtitle')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('admissions_track_title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('admissions_track_subtitle')}</p>
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400 font-semibold">Public</div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder={t('admissions_track_placeholder')}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleTrack}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                disabled={trackingLoading}
              >
                {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} {t('admissions_track_btn')}
              </button>
              {trackError && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4" />{trackError}
                </div>
              )}
            </div>

            {tracking && (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_reference')}</div>
                      <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">{tracking.application_number}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={tracking.status} t={t} />
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_applicant')}</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-semibold">{tracking.full_name}</div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_guardian')}</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-semibold">{tracking.guardian_name || 'N/A'}</div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_guardian_email')}</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-semibold truncate" title={tracking.guardian_email || 'N/A'}>{tracking.guardian_email || 'N/A'}</div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_programme')}</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-semibold">{tracking.programme}</div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 font-semibold">{t('admissions_submitted')}</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(tracking.submission_date)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admissions_progress')}</h3>
                  <div className="space-y-3">
                    {STATUS_STEPS.map(step => {
                      const state = getStepState(tracking.status, step);
                      // Map step to translation key
                      const stepTranslationMap: Record<string, string> = {
                        'Pending': t('admissions_status_pending'),
                        'Under Review': t('admissions_status_under_review_label'),
                        'Interview Scheduled': t('admissions_status_interview_scheduled_label'),
                        'Accepted': t('admissions_status_accepted'),
                        'Enrolled': t('admissions_status_enrolled'),
                      };
                      const stepLabel = stepTranslationMap[step] || step;
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
                            {state === 'complete' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : state === 'active' ? <Clock className="w-4 h-4 text-emerald-600" /> : <span className="text-xs font-bold">•</span>}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{stepLabel}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{step === 'Interview Scheduled' ? formatDate(tracking.interview_date) : step === 'Accepted' || step === 'Enrolled' ? formatDate(tracking.decision_date) : state === 'upcoming' ? t('admissions_waiting') : t('admissions_completed')}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admissions_decision_notes')}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tracking.decision_notes || t('admissions_no_notes')}</p>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('admissions_submit_title')}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('admissions_submit_subtitle')}</p>

            <div className="mt-8 space-y-4">
              {submitError && <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-700 dark:text-rose-300">{submitError}</div>}
              {submitMessage && <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-300">{submitMessage}</div>}

              <div className="grid gap-4">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_name')}</label>
                <input value={submitState.full_name} onChange={e => setSubmitState(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />

                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_dob')}</label>
                <input type="date" value={submitState.date_of_birth} onChange={e => setSubmitState(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />

                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_gender')}</label>
                <select value={submitState.gender} onChange={e => setSubmitState(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500">
                  <option>Male</option>
                  <option>Female</option>
                </select>

                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_guardian_name')}</label>
                <input value={submitState.guardian_name} onChange={e => setSubmitState(prev => ({ ...prev, guardian_name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />

                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_guardian_phone')}</label>
                <input value={submitState.guardian_phone} onChange={e => setSubmitState(prev => ({ ...prev, guardian_phone: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />

                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t('admissions_label_guardian_email')}</label>
                <input type="email" value={submitState.guardian_email} onChange={e => setSubmitState(prev => ({ ...prev, guardian_email: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <button onClick={handleSubmit} disabled={submitLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-60">
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} {t('admissions_submit_btn')}
              </button>
            </div>
          </aside>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-600 font-semibold">How it works</p>
              <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{t('admissions_how_title')}</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>{t('admissions_how_desc_1')}</p>
              <p>{t('admissions_how_desc_2')}</p>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>{t('admissions_how_desc_3')}</p>
              <p>{t('admissions_how_desc_4')} <a href="mailto:amadoujawo88@gmail.com" className="text-emerald-600 font-semibold underline">amadoujawo88@gmail.com</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
