import React, { useState, useEffect } from 'react';
import { TasmikSchoolRecord, SubmissionStatus, PageId } from '../types';
import confetti from 'canvas-confetti';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Flame,
  AlertTriangle,
  School,
  Sparkles,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';

interface BorangInputDataPageProps {
  schools: TasmikSchoolRecord[];
  onSaveSchool: (record: TasmikSchoolRecord) => Promise<void>;
  onNavigate: (page: PageId) => void;
  initialSelectedSchoolId?: string;
}

export const BorangInputDataPage: React.FC<BorangInputDataPageProps> = ({
  schools,
  onSaveSchool,
  onNavigate,
  initialSelectedSchoolId
}) => {
  const [mode, setMode] = useState<'update' | 'new'>('update');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    initialSelectedSchoolId || schools[0]?.id || ''
  );

  // Form State
  const [formData, setFormData] = useState<TasmikSchoolRecord>({
    id: 'sch-' + Date.now(),
    schoolCode: '',
    schoolName: '',
    totalStudents: 100,
    iqra1: 5,
    iqra2: 8,
    iqra3: 10,
    iqra4: 12,
    iqra5_6: 15,
    juz1_5: 18,
    juz6_10: 14,
    juz11_15: 10,
    juz16_20: 5,
    juz21_25: 2,
    juz26_30: 1,
    khatam: 0,
    submissionStatus: 'Selesai',
    lastUpdated: new Date().toISOString().split('T')[0],
    submittedBy: '',
    phoneContact: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load school data when selected in update mode
  useEffect(() => {
    if (mode === 'update') {
      const found = schools.find((s) => s.id === selectedSchoolId);
      if (found) {
        setFormData({ ...found });
      }
    } else {
      // New school template
      setFormData({
        id: 'sch-' + Date.now(),
        schoolCode: 'XBA' + Math.floor(1000 + Math.random() * 9000),
        schoolName: '',
        totalStudents: 100,
        iqra1: 0,
        iqra2: 0,
        iqra3: 0,
        iqra4: 0,
        iqra5_6: 0,
        juz1_5: 0,
        juz6_10: 0,
        juz11_15: 0,
        juz16_20: 0,
        juz21_25: 0,
        juz26_30: 0,
        khatam: 0,
        submissionStatus: 'Selesai',
        lastUpdated: new Date().toISOString().split('T')[0],
        submittedBy: '',
        phoneContact: '',
        notes: ''
      });
    }
  }, [mode, selectedSchoolId, schools]);

  // Live calculations
  const totalIqra =
    Number(formData.iqra1 || 0) +
    Number(formData.iqra2 || 0) +
    Number(formData.iqra3 || 0) +
    Number(formData.iqra4 || 0) +
    Number(formData.iqra5_6 || 0);

  const totalQuran =
    Number(formData.juz1_5 || 0) +
    Number(formData.juz6_10 || 0) +
    Number(formData.juz11_15 || 0) +
    Number(formData.juz16_20 || 0) +
    Number(formData.juz21_25 || 0) +
    Number(formData.juz26_30 || 0);

  const totalCalculated = totalIqra + totalQuran + Number(formData.khatam || 0);
  const totalStudents = Number(formData.totalStudents || 0);
  const discrepancy = totalCalculated - totalStudents;

  const onTrackCount = totalQuran + Number(formData.khatam || 0);
  const kpiPercentage =
    totalStudents > 0 ? Math.round((onTrackCount / totalStudents) * 100) : 0;
  const khatamPercentage =
    totalStudents > 0 ? Math.round((Number(formData.khatam || 0) / totalStudents) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName.trim()) {
      alert('Sila masukkan nama sekolah.');
      return;
    }
    if (!formData.submittedBy.trim()) {
      alert('Sila masukkan nama guru penyelaras / pelapor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveSchool(formData);
      setIsSubmitting(false);
      setShowSuccessToast(true);

      // Trigger celebratory confetti if KPI target >= 95%
      if (kpiPercentage >= 95) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (err) {
      setIsSubmitting(false);
      alert('Ralat semasa menyimpan rekod: ' + String(err));
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <FileEdit className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Borang Kemasukan Data Tasmik Sekolah
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Kemas kini bilangan murid mengikut tahap bacaan Al-Quran dan Iqra secara terus ke pangkalan data Supabase.
            </p>
          </div>

          {/* Mode switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setMode('update')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'update'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kemaskini Sekolah Sedia Ada
            </button>
            <button
              onClick={() => setMode('new')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'new'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Daftar Sekolah Baharu
            </button>
          </div>
        </div>
      </div>

      {/* Success notification */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Rekod Berjaya Disimpan!</span>
              <p className="text-emerald-700 mt-0.5">
                Data {formData.schoolName} telah dikemas kini ke dalam pangkalan data.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('status-pelaporan')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Lihat Status
          </button>
        </div>
      )}

      {/* Main Form and Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Interactive Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: School Identity */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <School className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Maklumat Asas & Identiti Sekolah
              </h3>
            </div>

            {mode === 'update' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Sekolah Rendah Daerah Penampang
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.schoolName} ({s.schoolCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Rasmi Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Contoh: SK Bahang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kod Sekolah (KPM)</label>
                <input
                  type="text"
                  required
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  placeholder="Contoh: XBA4101"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Jumlah Keseluruhan Murid Sasaran Tasmik
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Pautan Google Sheet Tasmik (Auto-Sync)
                </label>
                <input
                  type="url"
                  value={formData.spreadsheetUrl || ''}
                  onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-xs text-blue-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Iqra 1 to 6 Breakdown */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Bilangan Murid Tahap Iqra (1 hingga 6)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Jumlah Iqra: {totalIqra} murid
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Iqra 1</label>
                <input
                  type="number"
                  min="0"
                  value={formData.iqra1}
                  onChange={(e) =>
                    setFormData({ ...formData, iqra1: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Iqra 2</label>
                <input
                  type="number"
                  min="0"
                  value={formData.iqra2}
                  onChange={(e) =>
                    setFormData({ ...formData, iqra2: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Iqra 3</label>
                <input
                  type="number"
                  min="0"
                  value={formData.iqra3}
                  onChange={(e) =>
                    setFormData({ ...formData, iqra3: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Iqra 4</label>
                <input
                  type="number"
                  min="0"
                  value={formData.iqra4}
                  onChange={(e) =>
                    setFormData({ ...formData, iqra4: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-800"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-600 font-semibold mb-1 text-center">
                  Iqra 5 & 6
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.iqra5_6}
                  onChange={(e) =>
                    setFormData({ ...formData, iqra5_6: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Al-Quran Juz 1 - 30 Breakdown */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  3. Bilangan Murid Tahap Al-Quran (Juz 1 hingga 30)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Jumlah Juz 1-30: {totalQuran} murid
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 1-5</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz1_5}
                  onChange={(e) =>
                    setFormData({ ...formData, juz1_5: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 6-10</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz6_10}
                  onChange={(e) =>
                    setFormData({ ...formData, juz6_10: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 11-15</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz11_15}
                  onChange={(e) =>
                    setFormData({ ...formData, juz11_15: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 16-20</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz16_20}
                  onChange={(e) =>
                    setFormData({ ...formData, juz16_20: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 21-25</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz21_25}
                  onChange={(e) =>
                    setFormData({ ...formData, juz21_25: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-center">Juz 26-30</label>
                <input
                  type="number"
                  min="0"
                  value={formData.juz26_30}
                  onChange={(e) =>
                    setFormData({ ...formData, juz26_30: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Khatam Al-Quran */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4 bg-linear-to-r from-purple-50/40 via-white to-purple-50/40 border-purple-200/80">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  4. Bilangan Murid Khatam Al-Quran
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                {khatamPercentage}% dari murid sekolah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs items-center">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Jumlah Murid Telah Khatam 30 Juzuk
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.khatam}
                  onChange={(e) =>
                    setFormData({ ...formData, khatam: parseInt(e.target.value) || 0 })
                  }
                  className="w-full py-3 px-4 rounded-xl border border-purple-200 bg-white font-mono font-extrabold text-xl text-purple-700 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <p className="text-slate-500 text-xs leading-relaxed">
                * Murid yang telah khatam Al-Quran 30 Juzuk dengan bacaan bertajwid dan telah disahkan oleh Guru Penyelaras Tasmik / Guru Besar.
              </p>
            </div>
          </div>

          {/* Section 5: Pelapor & Catatan */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              5. Maklumat Pelapor & Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Guru Penyelaras / GPI Pelapor
                </label>
                <input
                  type="text"
                  required
                  value={formData.submittedBy}
                  onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                  placeholder="Contoh: Ustaz Muhammad Amin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  No. Telefon Pelapor (WhatsApp)
                </label>
                <input
                  type="text"
                  value={formData.phoneContact || ''}
                  onChange={(e) => setFormData({ ...formData, phoneContact: e.target.value })}
                  placeholder="01X-XXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Status Penghantaran
                </label>
                <select
                  value={formData.submissionStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submissionStatus: e.target.value as SubmissionStatus
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer"
                >
                  <option value="Selesai">Selesai Hantar (Disahkan)</option>
                  <option value="Dalam Proses">Dalam Proses Kemaskini</option>
                  <option value="Belum Hantar">Draf / Belum Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Program Tasmik
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Pelaksanaan tasmik pagi Selasa & Khamis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate('status-pelaporan')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Hantar & Simpan Data Tasmik'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Col: Live Calculation & Instant Validation Panel */}
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sticky top-28 space-y-5 border-orange-200/60">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Semakan Langsung KPI 95%
                </h3>
                <p className="text-[11px] text-slate-500">Kalkulator automatik sekolah</p>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="text-4xl font-black text-slate-900 font-mono">
                {kpiPercentage}%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Pencapaian Semasa Sekolah
              </div>

              <div
                className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${
                  kpiPercentage >= 95
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-orange-50 text-orange-800 border-orange-200'
                }`}
              >
                {kpiPercentage >= 95 ? '✓ Mencapai KPI 95%!' : 'Belum Mencapai KPI 95%'}
              </div>
            </div>

            {/* Breakdown summary */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Jumlah Murid Berdaftar:</span>
                <span className="font-mono font-bold text-slate-900">{totalStudents}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Jumlah Data Dimasukkan:</span>
                <span
                  className={`font-mono font-bold ${
                    discrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {totalCalculated}
                </span>
              </div>

              {discrepancy !== 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Perhatian: Terdapat perbezaan {Math.abs(discrepancy)} murid antara jumlah berdaftar ({totalStudents}) dan pecahan bacaan ({totalCalculated}).
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Murid Iqra (1 - 6):</span>
                <span className="font-mono font-bold text-amber-700">{totalIqra}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Murid Al-Quran (Juz 1-30):</span>
                <span className="font-mono font-bold text-emerald-700">{totalQuran}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Murid Khatam Al-Quran:</span>
                <span className="font-mono font-bold text-purple-700">{formData.khatam}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('graf-tasmik')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Graf Kedudukan Sekolah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
