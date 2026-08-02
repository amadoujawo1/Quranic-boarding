import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, Star, Sparkles, Save, ShieldCheck } from 'lucide-react';

export const HifzTracker: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState('Youssef Al-Faruq (QBS-2026-001)');
  const [sabaqSurah, setSabaqSurah] = useState('Al-Baqarah');
  const [sabaqJuz, setSabaqJuz] = useState(2);
  const [sabaqStartPage, setSabaqStartPage] = useState(25);
  const [sabaqEndPage, setSabaqEndPage] = useState(27);
  const [sabaqGrade, setSabaqGrade] = useState('A+');
  const [teacherNotes, setTeacherNotes] = useState('Excellent Makharij and Tajweed rules compliance.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [records, setRecords] = useState([
    { id: 1, date: '2026-07-25', surah: 'Al-Baqarah', juz: 2, pages: '25-27', grade: 'A+', sabqi: 'Juz 1 (P.15-24)', manzil: 'Juz 1 (P.1-14)' },
    { id: 2, date: '2026-07-24', surah: 'Al-Baqarah', juz: 2, pages: '22-24', grade: 'A', sabqi: 'Juz 1 (P.10-20)', manzil: 'Juz 1 (P.1-10)' }
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: records.length + 1,
      date: new Date().toISOString().split('T')[0],
      surah: sabaqSurah,
      juz: sabaqJuz,
      pages: `${sabaqStartPage}-${sabaqEndPage}`,
      grade: sabaqGrade,
      sabqi: 'Juz 1',
      manzil: 'Juz 1'
    };
    setRecords([newEntry, ...records]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quran Memorization (Hifz) & Tajweed Tracker</h1>
        <p className="text-xs text-slate-500">Record daily Sabaq, Sabqi, and Manzil evaluations for boarding Halaqahs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Evaluation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gold-500" /> Daily Halaqah Record Entry
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-gold-400">Sanad Standard</span>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hifz progress record saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option>Youssef Al-Faruq (QBS-2026-001)</option>
                <option>Zaid Ibn Harith (QBS-2026-002)</option>
                <option>Maryam Al-Zahra (QBS-2026-003)</option>
              </select>
            </div>

            {/* Sabaq Section */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <div className="text-xs font-bold text-emerald-900 dark:text-gold-400 uppercase">1. Sabaq (New Memorization)</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Surah</label>
                  <input type="text" value={sabaqSurah} onChange={(e) => setSabaqSurah(e.target.value)} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Juz #</label>
                  <input type="number" value={sabaqJuz} onChange={(e) => setSabaqJuz(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Pages (Start - End)</label>
                  <div className="flex gap-1">
                    <input type="number" value={sabaqStartPage} onChange={(e) => setSabaqStartPage(Number(e.target.value))} className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-center" />
                    <input type="number" value={sabaqEndPage} onChange={(e) => setSabaqEndPage(Number(e.target.value))} className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Evaluation Grade</label>
                  <select value={sabaqGrade} onChange={(e) => setSabaqGrade(e.target.value)} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs">
                    <option value="A+">A+ (Mumtaz)</option>
                    <option value="A">A (Jayyid Jiddan)</option>
                    <option value="B">B (Jayyid)</option>
                    <option value="C">C (Maqbool)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Teacher Tajweed & Fluency Notes</label>
              <textarea rows={2} value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"></textarea>
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-2 shadow-md transition">
              <Save className="w-4 h-4" /> Save Evaluation Entry
            </button>
          </form>
        </div>

        {/* Tajweed Scorecard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-500" /> Tajweed Score Summary
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Makharij precision</span>
                <span className="text-gold-500 font-bold">98 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gold-500 h-full w-[98%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Sifat & Ghunnah Rules</span>
                <span className="text-gold-500 font-bold">95 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[95%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Fluency & Rhythm</span>
                <span className="text-gold-500 font-bold">92 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[92%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950 p-4 rounded-xl text-white text-center space-y-2 border border-gold-500/30">
            <Sparkles className="w-6 h-6 text-gold-400 mx-auto" />
            <div className="font-bold text-xs">Completion Progress</div>
            <div className="text-2xl font-extrabold text-gold-400">14 / 30 Juz</div>
            <p className="text-[10px] text-slate-300">Estimated graduation date: May 2027</p>
          </div>
        </div>

      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Evaluation History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Sabaq Surah</th>
                <th className="p-3">Juz #</th>
                <th className="p-3">Pages</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Sabqi</th>
                <th className="p-3">Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-semibold">{r.date}</td>
                  <td className="p-3 font-bold text-gold-600 dark:text-gold-400">{r.surah}</td>
                  <td className="p-3">{r.juz}</td>
                  <td className="p-3">{r.pages}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">{r.grade}</span></td>
                  <td className="p-3 text-slate-500">{r.sabqi}</td>
                  <td className="p-3 text-slate-500">{r.manzil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
