import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, Sparkles, Save, Plus, Search, UserCheck, Calendar, GraduationCap, X, Loader2 } from 'lucide-react';

interface Graduate {
  id: number;
  student_id: number;
  student_id_number: string;
  full_name: string;
  graduation_year: number;
  hifz_completion_date: string;
  current_occupation: string;
  higher_education: string;
  contact_email: string;
}

export const HifzTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'halaqah' | 'graduates'>('halaqah');
  
  // Daily Halaqah State
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

  // Graduates State
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loadingGraduates, setLoadingGraduates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  
  // Input Graduate Modal State
  const [showInputModal, setShowInputModal] = useState(false);
  const [submittingGraduate, setSubmittingGraduate] = useState(false);
  const [gradSuccessMsg, setGradSuccessMsg] = useState('');
  const [gradErrorMsg, setGradErrorMsg] = useState('');
  
  const [newGradName, setNewGradName] = useState('');
  const [newGradIdNum, setNewGradIdNum] = useState('');
  const [newGradYear, setNewGradYear] = useState<number>(new Date().getFullYear());
  const [newGradCompletionDate, setNewGradCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newGradOccupation, setNewGradOccupation] = useState('');
  const [newGradEducation, setNewGradEducation] = useState('');
  const [newGradEmail, setNewGradEmail] = useState('');

  const fetchGraduates = async () => {
    setLoadingGraduates(true);
    try {
      const res = await fetch('/api/students/alumni');
      if (res.ok) {
        const data = await res.json();
        setGraduates(data.alumni || []);
      }
    } catch {
      // Keep existing
    } finally {
      setLoadingGraduates(false);
    }
  };

  useEffect(() => {
    fetchGraduates();
  }, []);

  const handleSaveHalaqah = (e: React.FormEvent) => {
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

  const handleInputGraduateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradErrorMsg('');
    setGradSuccessMsg('');
    setSubmittingGraduate(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        full_name: newGradName,
        student_id_number: newGradIdNum || undefined,
        graduation_year: Number(newGradYear),
        hifz_completion_date: newGradCompletionDate,
        current_occupation: newGradOccupation || 'Alumni Hafiz',
        higher_education: newGradEducation || 'Higher Islamic & Secular Studies',
        contact_email: newGradEmail || undefined
      };

      const res = await fetch('/api/students/alumni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setGradErrorMsg(data.message || 'Failed to input graduate. Please check details.');
      } else {
        setGradSuccessMsg(`Hafiz Graduate ${newGradName} successfully registered!`);
        setNewGradName('');
        setNewGradIdNum('');
        setNewGradOccupation('');
        setNewGradEducation('');
        setNewGradEmail('');
        fetchGraduates();
        setTimeout(() => {
          setShowInputModal(false);
          setGradSuccessMsg('');
        }, 1800);
      }
    } catch (err: any) {
      setGradErrorMsg(err?.message || 'Network error occurred while saving graduate.');
    } finally {
      setSubmittingGraduate(false);
    }
  };

  const filteredGraduates = graduates.filter(g => {
    const matchesSearch = !searchQuery || 
      g.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.student_id_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.current_occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.higher_education?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = selectedYear === 'All' || g.graduation_year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  const availableYears = Array.from(new Set(graduates.map(g => g.graduation_year))).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-gold-500" />
            Quran Memorization & Hifz Graduates
          </h1>
          <p className="text-xs text-slate-500">Record daily Halaqah progress and manage distinguished Hifz Huffaz Graduates.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'halaqah'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-gold-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Daily Evaluation Entry
          </button>
          <button
            onClick={() => setActiveTab('graduates')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'graduates'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Hifz Huffaz Graduates ({graduates.length})
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY HALAQAH */}
      {activeTab === 'halaqah' && (
        <div className="space-y-8">
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

              <form onSubmit={handleSaveHalaqah} className="space-y-5">
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

            {/* Tajweed Scorecard & Quick Graduate Link */}
            <div className="space-y-6">
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

                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 p-4 rounded-xl text-white text-center space-y-2 border border-gold-500/30">
                  <Sparkles className="w-6 h-6 text-gold-400 mx-auto" />
                  <div className="font-bold text-xs">Active Huffaz Graduates</div>
                  <div className="text-2xl font-extrabold text-gold-400">{graduates.length} Graduates</div>
                  <button 
                    onClick={() => { setActiveTab('graduates'); setShowInputModal(true); }} 
                    className="mt-2 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-emerald-950 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Input New Hafiz Graduate
                  </button>
                </div>
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
      )}

      {/* TAB 2: HIFZ HUFFAZ GRADUATES DIRECTORY & INPUT */}
      {activeTab === 'graduates' && (
        <div className="space-y-6">
          {/* Top Actions & Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gold-500" />
                  Hifz Huffaz Graduates Directory ({filteredGraduates.length})
                </h2>
                <p className="text-xs text-slate-500">Registry of students who completed 30 Juz memorization & Tajweed mastery.</p>
              </div>

              <button
                onClick={() => setShowInputModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-md transition self-start md:self-auto"
              >
                <Plus className="w-4 h-4" /> Input & Register Hafiz Graduate
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search graduates by name, ID, occupation, or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="All">All Graduation Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y.toString()}>{y} Graduates</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading or Empty state */}
          {loadingGraduates ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Fetching Hifz Huffaz Graduates...</p>
            </div>
          ) : filteredGraduates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Hifz Graduates Found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">No graduates match your search query. Click "Input & Register Hafiz Graduate" to add one.</p>
              <button
                onClick={() => setShowInputModal(true)}
                className="mt-2 px-4 py-2 bg-gold-500 text-emerald-950 text-xs font-bold rounded-xl hover:bg-gold-400"
              >
                + Input Graduate Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGraduates.map((g) => (
                <div 
                  key={g.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-gold-500/50 transition relative overflow-hidden group space-y-4"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gold-500 to-amber-600 text-emerald-950 font-black text-sm flex items-center justify-center shadow-inner">
                        {g.full_name?.substring(0, 2).toUpperCase() || 'HF'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-gold-500 transition">
                          {g.full_name}
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-gold-400">
                          {g.student_id_number || `GRAD-${g.graduation_year}`}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                      Class of {g.graduation_year}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" /> Completion Date:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {g.hifz_completion_date || `${g.graduation_year}-05-15`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> Higher Education:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]" title={g.higher_education}>
                        {g.higher_education || 'Islamic Studies'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Current Profession:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]" title={g.current_occupation}>
                        {g.current_occupation || 'Alumni Hafiz'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">{g.contact_email || 'Verified Hafiz'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 30 Juz Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INPUT HAFIZ GRADUATE MODAL */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowInputModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Input Hifz Huffaz Graduate</h2>
                <p className="text-xs text-slate-500">Register a student who completed Quran memorization.</p>
              </div>
            </div>

            {gradSuccessMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gradSuccessMsg}</span>
              </div>
            )}

            {gradErrorMsg && (
              <div className="p-3 bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200 rounded-xl text-xs flex items-center gap-2 border border-red-300">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{gradErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInputGraduateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name of Hafiz Graduate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood Al-Sayed"
                  value={newGradName}
                  onChange={(e) => setNewGradName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. QBS-2025-019"
                    value={newGradIdNum}
                    onChange={(e) => setNewGradIdNum(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2030}
                    value={newGradYear}
                    onChange={(e) => setNewGradYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hifz Completion Date</label>
                <input
                  type="date"
                  required
                  value={newGradCompletionDate}
                  onChange={(e) => setNewGradCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Higher Education Institution</label>
                <input
                  type="text"
                  placeholder="e.g. University of The Gambia / Al-Azhar University"
                  value={newGradEducation}
                  onChange={(e) => setNewGradEducation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Profession / Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer / Resident Imam / Medical Student"
                  value={newGradOccupation}
                  onChange={(e) => setNewGradOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. hafiz.graduate@qbsms.edu"
                  value={newGradEmail}
                  onChange={(e) => setNewGradEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGraduate}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-emerald-950 font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 shadow-md"
                >
                  {submittingGraduate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Register Graduate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

