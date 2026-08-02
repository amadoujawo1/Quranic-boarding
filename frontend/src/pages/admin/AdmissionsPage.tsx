import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Filter, RefreshCw, Eye, CheckCircle,
  XCircle, Calendar, ChevronDown, User, Phone, BookOpen, Heart,
  Home, Loader2, AlertTriangle, GraduationCap, FileText, Clock,
  X, Check, ArrowRight, Printer, BarChart2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: number;
  application_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  blood_group: string;
  previous_school: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_address: string;
  guardian_occupation: string;
  programme: string;
  academic_year: string;
  boarding_required: boolean;
  quran_level: string;
  current_juz: number;
  has_previous_hifz: boolean;
  medical_conditions: string;
  allergies: string;
  special_needs: string;
  status: string;
  submission_date: string;
  interview_date: string | null;
  decision_date: string | null;
  decision_notes: string;
  student_id: number | null;
}

interface Stats {
  total: number;
  Pending: number;
  'Under Review': number;
  'Interview Scheduled': number;
  Accepted: number;
  Rejected: number;
  Enrolled: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  'Pending':              { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40', icon: Clock },
  'Under Review':         { color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/40',   icon: Eye },
  'Interview Scheduled':  { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/40', icon: Calendar },
  'Accepted':             { color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40', icon: CheckCircle },
  'Rejected':             { color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/40',   icon: XCircle },
  'Enrolled':             { color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/40',   icon: GraduationCap },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META['Pending'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.bg} ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const token = () => localStorage.getItem('token') || '';

// ─── New Application Modal ─────────────────────────────────────────────────────

const NewApplicationModal: React.FC<{ onClose: () => void; onSaved: () => void }> = ({ onClose, onSaved }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: 'Male', nationality: 'Gambian',
    blood_group: '', previous_school: '',
    guardian_name: '', guardian_relationship: 'Father', guardian_phone: '',
    guardian_email: '', guardian_address: '', guardian_occupation: '',
    programme: 'Full Hifz Programme', academic_year: '2026/2027',
    boarding_required: true,
    quran_level: 'Beginner', current_juz: 0, has_previous_hifz: false,
    medical_conditions: '', allergies: '', special_needs: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Submission failed'); setLoading(false); return; }
      onSaved();
      onClose();
    } catch { setError('Cannot reach server'); setLoading(false); }
  };

  const steps = ['Applicant', 'Guardian', 'Programme', 'Medical'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 px-7 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-white font-extrabold text-lg">New Admission Application</h2>
            <p className="text-emerald-200 text-xs mt-0.5">Step {step} of {steps.length} — {steps[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i + 1)}
              className={`flex-1 py-3 text-[11px] font-bold transition ${step === i + 1
                ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >{i + 1}. {s}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-5">
          {error && <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-600 text-xs font-semibold"><AlertTriangle className="w-4 h-4" />{error}</div>}

          {/* Step 1: Applicant */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {[['Full Name', 'full_name', 'text'], ['Date of Birth', 'date_of_birth', 'date'],
                ['Blood Group', 'blood_group', 'text'], ['Previous School', 'previous_school', 'text'],
                ['Nationality', 'nationality', 'text']].map(([label, key, type]) => (
                <div key={key} className={key === 'full_name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                  {['Male', 'Female'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Guardian */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {[['Guardian Full Name', 'guardian_name', 'text'], ['Phone Number', 'guardian_phone', 'tel'],
                ['Email Address', 'guardian_email', 'email'], ['Occupation', 'guardian_occupation', 'text']].map(([label, key, type]) => (
                <div key={key} className={key === 'guardian_name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Relationship</label>
                <select value={form.guardian_relationship} onChange={e => set('guardian_relationship', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                  {['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt', 'Sibling'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Home Address</label>
                <textarea value={form.guardian_address} onChange={e => set('guardian_address', e.target.value)} rows={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white resize-none" />
              </div>
            </div>
          )}

          {/* Step 3: Programme */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Programme</label>
                <select value={form.programme} onChange={e => set('programme', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                  {['Full Hifz Programme', 'Part-Time Hifz', 'Tajweed & Recitation', 'Islamic Studies', 'General Education'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Academic Year</label>
                <select value={form.academic_year} onChange={e => set('academic_year', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                  {['2026/2027', '2025/2026', '2027/2028'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Quran Level</label>
                <select value={form.quran_level} onChange={e => set('quran_level', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Current Juz Memorised</label>
                <input type="number" min={0} max={30} value={form.current_juz} onChange={e => set('current_juz', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white" />
              </div>
              <div className="flex gap-6 items-center col-span-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.boarding_required} onChange={e => set('boarding_required', e.target.checked)} className="accent-emerald-600 w-4 h-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Boarding Required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.has_previous_hifz} onChange={e => set('has_previous_hifz', e.target.checked)} className="accent-emerald-600 w-4 h-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Has Previous Hifz Study</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Medical */}
          {step === 4 && (
            <div className="space-y-4">
              {[['Medical Conditions (if any)', 'medical_conditions'], ['Allergies (if any)', 'allergies'], ['Special Needs / Learning Support', 'special_needs']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                  <textarea value={(form as any)[key]} onChange={e => set(key, e.target.value)} rows={2}
                    placeholder="Leave blank if none"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white resize-none" />
                </div>
              ))}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                <p className="font-bold mb-1">📋 Ready to Submit</p>
                <p>Please review all sections before submitting. The application will be assigned a unique reference number and set to <strong>Pending</strong> status.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 4
            ? <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold hover:brightness-110 transition flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></button>
            : <button onClick={submit} disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold hover:brightness-110 transition flex items-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Check className="w-4 h-4" />Submit Application</>}
              </button>}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Detail / Review Modal ────────────────────────────────────────────────────

const DetailModal: React.FC<{ app: Application; onClose: () => void; onRefresh: () => void }> = ({ app, onClose, onRefresh }) => {
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.decision_notes || '');
  const [interviewDate, setInterviewDate] = useState(app.interview_date ? app.interview_date.slice(0, 16) : '');
  const [loading, setLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateStatus = async () => {
    setLoading(true); setMessage('');
    const res = await fetch(`/api/admissions/${app.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status, decision_notes: notes, interview_date: interviewDate || undefined }),
    });
    setLoading(false);
    if (res.ok) { setMessage('✅ Updated successfully'); onRefresh(); }
    else setMessage('❌ Update failed');
  };

  const enrol = async () => {
    setEnrollLoading(true); setMessage('');
    const res = await fetch(`/api/admissions/${app.id}/enrol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    setEnrollLoading(false);
    if (res.ok) { setMessage(`🎉 ${data.message} | ID: ${data.student_id_number}`); onRefresh(); }
    else setMessage(`❌ ${data.message}`);
  };

  const Field: React.FC<{ label: string; value?: string | number | boolean | null }> = ({ label, value }) => (
    <div>
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value == null || value === '' ? '—' : String(value)}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-7 py-5 flex justify-between items-start">
          <div>
            <div className="text-emerald-300 text-xs font-bold mb-1">{app.application_number}</div>
            <h2 className="text-white font-extrabold text-xl">{app.full_name}</h2>
            <p className="text-emerald-300 text-xs mt-1">{app.programme} · {app.academic_year}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            <button onClick={onClose} className="text-emerald-200 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0 divide-y divide-slate-100 dark:divide-slate-800">

            {/* Applicant Info */}
            <div className="col-span-2 p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-3.5 h-3.5" />Applicant Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Date of Birth" value={app.date_of_birth} />
                <Field label="Gender" value={app.gender} />
                <Field label="Nationality" value={app.nationality} />
                <Field label="Blood Group" value={app.blood_group} />
                <Field label="Previous School" value={app.previous_school} />
                <Field label="Boarding Required" value={app.boarding_required ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Guardian */}
            <div className="col-span-2 p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Phone className="w-3.5 h-3.5" />Guardian / Parent</h3>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Name" value={app.guardian_name} />
                <Field label="Relationship" value={app.guardian_relationship} />
                <Field label="Phone" value={app.guardian_phone} />
                <Field label="Email" value={app.guardian_email} />
                <Field label="Occupation" value={app.guardian_occupation} />
                <Field label="Address" value={app.guardian_address} />
              </div>
            </div>

            {/* Quran Background */}
            <div className="col-span-2 p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />Quran Background</h3>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Quran Level" value={app.quran_level} />
                <Field label="Juz Memorised" value={app.current_juz} />
                <Field label="Previous Hifz Study" value={app.has_previous_hifz ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Medical */}
            <div className="col-span-2 p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Heart className="w-3.5 h-3.5" />Medical & Special Needs</h3>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Medical Conditions" value={app.medical_conditions} />
                <Field label="Allergies" value={app.allergies} />
                <Field label="Special Needs" value={app.special_needs} />
              </div>
            </div>

            {/* Decision Panel */}
            <div className="col-span-2 p-6">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Review & Decision</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Update Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white">
                    {Object.keys(STATUS_META).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Interview Date & Time</label>
                  <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Decision Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add review notes or interview feedback…"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white resize-none" />
                </div>
              </div>

              {message && (
                <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${message.startsWith('✅') || message.startsWith('🎉') ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={updateStatus} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Decision
                </button>
                {app.status === 'Accepted' && !app.student_id && (
                  <button onClick={enrol} disabled={enrollLoading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white text-sm font-bold hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {enrollLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                    Enrol Student
                  </button>
                )}
                {app.student_id && (
                  <div className="flex-1 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-sm font-bold flex items-center justify-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Already Enrolled
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdmissionsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const auth = { headers: { Authorization: `Bearer ${token()}` } };
    try {
      const [appRes, statRes] = await Promise.all([
        fetch(`/api/admissions?search=${search}&status=${statusFilter}`, auth),
        fetch('/api/admissions/stats', auth),
      ]);
      if (appRes.ok) { const d = await appRes.json(); setApplications(d.applications); }
      if (statRes.ok) { const d = await statRes.json(); setStats(d); }
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const KPI: React.FC<{ label: string; value: number; color: string; icon: React.ElementType }> = ({ label, value, color, icon: Icon }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admissions Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Process and manage student admission applications</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold hover:brightness-110 transition shadow-md">
          <Plus className="w-4 h-4" /> New Application
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPI label="Total Applications" value={stats.total} color="bg-slate-600" icon={ClipboardList} />
          <KPI label="Pending" value={stats.Pending} color="bg-amber-500" icon={Clock} />
          <KPI label="Under Review" value={stats['Under Review']} color="bg-blue-500" icon={Eye} />
          <KPI label="Interview Scheduled" value={stats['Interview Scheduled']} color="bg-purple-500" icon={Calendar} />
          <KPI label="Accepted" value={stats.Accepted} color="bg-emerald-600" icon={CheckCircle} />
          <KPI label="Enrolled" value={stats.Enrolled} color="bg-teal-600" icon={GraduationCap} />
        </div>
      )}

      {/* Filters & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, reference, guardian…"
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white" />
          </div>
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white appearance-none">
              <option value="">All Statuses</option>
              {Object.keys(STATUS_META).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={fetchData} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="Refresh">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                {['Ref #', 'Applicant', 'Guardian', 'Programme', 'Year', 'Submission', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading
                ? <tr><td colSpan={8} className="text-center py-16 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-xs">Loading applications…</p></td></tr>
                : applications.length === 0
                  ? <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                      <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No applications found</p>
                    </td></tr>
                  : applications.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{a.application_number}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {a.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{a.full_name}</div>
                            <div className="text-[10px] text-slate-400">{a.gender} · {a.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.guardian_name}</div>
                        <div className="text-[10px] text-slate-400">{a.guardian_phone}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300 max-w-[130px] truncate">{a.programme}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{a.academic_year}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {a.submission_date ? new Date(a.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(a)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Review
                        </button>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNew && <NewApplicationModal onClose={() => setShowNew(false)} onSaved={fetchData} />}
        {selected && <DetailModal app={selected} onClose={() => setSelected(null)} onRefresh={fetchData} />}
      </AnimatePresence>
    </div>
  );
};

export default AdmissionsPage;
