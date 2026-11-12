import React, { useState, useMemo } from 'react';
import { ClassCohortRecord, TasmikSchoolRecord } from '../types';
import { TapakRekalibrasiGraf } from '../components/TapakRekalibrasiGraf';
import {
  FileSpreadsheet,
  Save,
  Download,
  Printer,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  School,
  Building2,
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react';

interface RekalibrasiPageProps {
  cohorts: ClassCohortRecord[];
  schools: TasmikSchoolRecord[];
  onSaveCohort: (cohort: ClassCohortRecord) => Promise<void>;
  onSaveSchool: (record: TasmikSchoolRecord) => Promise<void>;
  onSyncSchool?: (school: TasmikSchoolRecord) => Promise<void>;
  onNavigateToKpi?: () => void;
  onNavigateToIntervensi?: () => void;
}

export const RekalibrasiPage: React.FC<RekalibrasiPageProps> = ({
  cohorts,
  schools,
  onSaveCohort,
  onSaveSchool,
  onSyncSchool,
  onNavigateToKpi,
  onNavigateToIntervensi
}) => {
  // Tab view: 'daerah' (Rasmi KPM & PPD) vs 'kelas' (Matriks kelas bersiri)
  const [activeTab, setActiveTab] = useState<'daerah' | 'kelas'>('daerah');
  const [localCohorts, setLocalCohorts] = useState<ClassCohortRecord[]>(cohorts);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Synchronize if prop changes
  React.useEffect(() => {
    setLocalCohorts(cohorts);
  }, [cohorts]);

  // Aggregate stats for Keseluruhan Daerah Penampang
  const districtStats = useMemo(() => {
    let totalMurid = 0;
    let totalIqra = 0;
    let totalQuran = 0;
    let totalKhatam = 0;
    let totalIqra1_3 = 0;

    schools.forEach((s) => {
      totalMurid += Number(s.totalStudents) || 0;
      const iqra =
        (Number(s.iqra1) || 0) +
        (Number(s.iqra2) || 0) +
        (Number(s.iqra3) || 0) +
        (Number(s.iqra4) || 0) +
        (Number(s.iqra5_6) || 0);
      const quran =
        (Number(s.juz1_5) || 0) +
        (Number(s.juz6_10) || 0) +
        (Number(s.juz11_15) || 0) +
        (Number(s.juz16_20) || 0) +
        (Number(s.juz21_25) || 0) +
        (Number(s.juz26_30) || 0);
      const khatam = Number(s.khatam) || 0;

      totalIqra += iqra;
      totalQuran += quran;
      totalKhatam += khatam;
      totalIqra1_3 +=
        (Number(s.iqra1) || 0) + (Number(s.iqra2) || 0) + (Number(s.iqra3) || 0);
    });

    const kebolehbacaan = totalQuran + totalKhatam;
    const pctKebolehbacaan =
      totalMurid > 0 ? ((kebolehbacaan / totalMurid) * 100).toFixed(1) : '0.0';
    const pctKhatam =
      totalMurid > 0 ? ((totalKhatam / totalMurid) * 100).toFixed(1) : '0.0';
    const pctIqra1_3 =
      totalMurid > 0 ? ((totalIqra1_3 / totalMurid) * 100).toFixed(1) : '0.0';

    return {
      totalMurid,
      totalSchools: schools.length,
      totalIqra,
      totalQuran,
      totalKhatam,
      kebolehbacaan,
      pctKebolehbacaan,
      pctKhatam,
      totalIqra1_3,
      pctIqra1_3
    };
  }, [schools]);

  // Handle cell edit for cohort matrix
  const handleCellChange = (
    index: number,
    field: keyof ClassCohortRecord,
    val: number
  ) => {
    const updated = [...localCohorts];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = isNaN(val) ? 0 : val;

    // Recalculate bilMurid for that class row
    const c = updated[index];
    const totalRow =
      c.i1 +
      c.i2 +
      c.i3 +
      c.i4 +
      c.i5 +
      c.i6 +
      c.juz1_5 +
      c.juz6_10 +
      c.juz11_15 +
      c.juz16_20 +
      c.juz21_25 +
      c.juz26_30 +
      c.khatam;
    c.bilMurid = totalRow;

    setLocalCohorts(updated);
  };

  const handleSaveAllCohorts = async () => {
    setIsSaving(true);
    for (const c of localCohorts) {
      await onSaveCohort(c);
    }
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Grand totals across cohorts
  const totals = localCohorts.reduce(
    (acc, c) => ({
      bilMurid: acc.bilMurid + c.bilMurid,
      i1: acc.i1 + c.i1,
      i2: acc.i2 + c.i2,
      i3: acc.i3 + c.i3,
      i4: acc.i4 + c.i4,
      i5: acc.i5 + c.i5,
      i6: acc.i6 + c.i6,
      juz1_5: acc.juz1_5 + c.juz1_5,
      juz6_10: acc.juz6_10 + c.juz6_10,
      juz11_15: acc.juz11_15 + c.juz11_15,
      juz16_20: acc.juz16_20 + c.juz16_20,
      juz21_25: acc.juz21_25 + c.juz21_25,
      juz26_30: acc.juz26_30 + c.juz26_30,
      khatam: acc.khatam + c.khatam
    }),
    {
      bilMurid: 0,
      i1: 0,
      i2: 0,
      i3: 0,
      i4: 0,
      i5: 0,
      i6: 0,
      juz1_5: 0,
      juz6_10: 0,
      juz11_15: 0,
      juz16_20: 0,
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    }
  );

  const grandTotal = totals.bilMurid || 1;

  // Percentage calculations
  const pcts = {
    i1: ((totals.i1 / grandTotal) * 100).toFixed(2),
    i2: ((totals.i2 / grandTotal) * 100).toFixed(2),
    i3: ((totals.i3 / grandTotal) * 100).toFixed(2),
    i4: ((totals.i4 / grandTotal) * 100).toFixed(2),
    i5: ((totals.i5 / grandTotal) * 100).toFixed(2),
    i6: ((totals.i6 / grandTotal) * 100).toFixed(2),
    juz1_5: ((totals.juz1_5 / grandTotal) * 100).toFixed(2),
    juz6_10: ((totals.juz6_10 / grandTotal) * 100).toFixed(2),
    juz11_15: ((totals.juz11_15 / grandTotal) * 100).toFixed(2),
    juz16_20: ((totals.juz16_20 / grandTotal) * 100).toFixed(2),
    juz21_25: ((totals.juz21_25 / grandTotal) * 100).toFixed(2),
    juz26_30: ((totals.juz26_30 / grandTotal) * 100).toFixed(2),
    khatam: ((totals.khatam / grandTotal) * 100).toFixed(2)
  };

  const cohortKebolehbacaan =
    totals.juz1_5 +
    totals.juz6_10 +
    totals.juz11_15 +
    totals.juz16_20 +
    totals.juz21_25 +
    totals.juz26_30 +
    totals.khatam;
  const cohortPctKebolehbacaan = ((cohortKebolehbacaan / grandTotal) * 100).toFixed(1);

  const handleExportCSV = () => {
    const headers = [
      'Kelas',
      'Bil. Murid',
      'I1 (Iqra 1)',
      'I2 (Iqra 2)',
      'I3 (Iqra 3)',
      'I4 (Iqra 4)',
      'I5 (Iqra 5)',
      'I6 (Iqra 6)',
      'Juz 1-5',
      'Juz 6-10',
      'Juz 11-15',
      'Juz 16-20',
      'Juz 21-25',
      'Juz 26-30',
      'Khatam'
    ];
    const rows = localCohorts.map((c) => [
      `"${c.kelas}"`,
      c.bilMurid,
      c.i1,
      c.i2,
      c.i3,
      c.i4,
      c.i5,
      c.i6,
      c.juz1_5,
      c.juz6_10,
      c.juz11_15,
      c.juz16_20,
      c.juz21_25,
      c.juz26_30,
      c.khatam
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tapak_Rekalibrasi_jQAF_Penampang_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Official Banner matching KPM PDF */}
      <div className="apple-card rounded-3xl p-6 sm:p-8 bg-linear-to-br from-blue-950 via-blue-900 to-indigo-950 text-white border-blue-800/80 shadow-xl shadow-blue-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                Sektor Pendidikan Islam (SPI ITQAN: menjana kualiti)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                Tahun 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              TAPAK REKALIBRASI PROGRAM j-QAF TAHUN 2026 <br />
              <span className="bg-linear-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                KESELURUHAN DAERAH PENAMPANG & SEMUA SEKOLAH
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
              Format standard dokumen rasmi KPM & JPN Sabah. Mengandungi lembaran tapak rekalibrasi
              keseluruhan Pejabat Pendidikan Daerah (PPD) Penampang serta tapak individu bagi setiap
              sekolah dengan cetakan PDF rasmi A4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('daerah')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daerah'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Tapak Daerah & Sekolah</span>
            </button>
            <button
              onClick={() => setActiveTab('kelas')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kelas'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Matriks Enrolmen Kelas</span>
            </button>
          </div>
        </div>

        {/* District Highlight Cards */}
        <div className="mt-6 pt-5 border-t border-blue-900/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-blue-900/40 border border-blue-800/60 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Sekolah Terlibat</span>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{districtStats.totalSchools} Buah Sekolah</div>
            <span className="text-[10px] text-blue-300">PPD Penampang, Sabah</span>
          </div>

          <div className="bg-blue-900/40 border border-blue-800/60 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Jumlah Murid Sasaran</span>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{districtStats.totalMurid.toLocaleString()} Orang</div>
            <span className="text-[10px] text-blue-300">Tahun 1 - Tahun 6</span>
          </div>

          <div className="bg-blue-900/40 border border-blue-800/60 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Kebolehbacaan Al-Quran</span>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">{districtStats.pctKebolehbacaan}%</div>
            <span className="text-[10px] text-blue-200">{districtStats.kebolehbacaan.toLocaleString()} Murid (Juz 1-30 & Khatam)</span>
          </div>

          <div className="bg-blue-900/40 border border-blue-800/60 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Khatam Al-Quran</span>
            <div className="text-lg sm:text-xl font-black text-purple-300 mt-0.5">{districtStats.pctKhatam}%</div>
            <span className="text-[10px] text-blue-200">{districtStats.totalKhatam.toLocaleString()} Murid Khatam 30 Juz</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daerah')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'daerah'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tapak Rekalibrasi Rasmi Daerah Penampang (KPM 2026)</span>
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'kelas'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriks Enrolmen Mengikut Kelas (Halaman 5 & 6)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          {onNavigateToKpi && (
            <button
              onClick={onNavigateToKpi}
              className="px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>KPI 6 Model</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onNavigateToIntervensi && (
            <button
              onClick={onNavigateToIntervensi}
              className="px-3 py-1.5 rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Sekolah Fokus</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: TAPAK REKALIBRASI KESELURUHAN DAERAH PENAMPANG & SEKOLAH
          ------------------------------------------------------------- */}
      {activeTab === 'daerah' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">Tapak Rekalibrasi Keseluruhan Daerah Penampang: </span>
              Pilihan lalai di bawah memaparkan analisis agregat bagi keseluruhan Daerah Penampang (PPD Penampang). Anda juga boleh memilih mana-mana sekolah daripada menu pilihan untuk melihat atau mencetak tapak rekalibrasi sekolah tersebut.
            </div>
          </div>

          <TapakRekalibrasiGraf
            schools={schools}
            onSaveSchool={onSaveSchool}
            onSyncSchool={onSyncSchool}
            selectedSchoolId="keseluruhan-daerah"
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: MATRIKS ENROLMEN KELAS (HALAMAN 5 & 6 PDF)
          ------------------------------------------------------------- */}
      {activeTab === 'kelas' && (
        <div className="space-y-8">
          {showToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in slide-in-from-top">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">
                Data Matriks Kohort Kelas Program j-QAF 2026 berjaya disimpan dan disahkan!
              </span>
            </div>
          )}

          {/* SECTION 1: Tapak Rekalibrasi Enrolmen Kelas (Tahun 1 - 5) */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h2 className="text-base font-bold text-slate-900">
                    1. Tapak Rekalibrasi Enrolmen Mengikut Kelas (Tahun 1 hingga Tahun 6)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rujuk Halaman 5 Dokumen: Masukkan bilangan murid bagi setiap tahap mengikut kelas
                </p>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white">I1 - I3 (Kritikal)</span>
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-900">I4 - I6 (Peralihan)</span>
                <span className="px-2 py-0.5 rounded bg-slate-300 text-slate-900">Juz 1 - 10</span>
                <span className="px-2 py-0.5 rounded bg-emerald-300 text-slate-900">Juz 11 - 30</span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900">Khatam</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport CSV</span>
              </button>
              <button
                onClick={handleSaveAllCohorts}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>

            {/* The Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-300 shadow-xs">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                    <th className="p-2.5 border border-slate-400 bg-slate-100 min-w-[90px] text-left">
                      KELAS
                    </th>
                    <th className="p-2.5 border border-slate-400 bg-slate-100 min-w-[70px]">
                      BIL. MURID
                    </th>
                    {/* Red Zone: I1, I2, I3 */}
                    <th className="p-2 border border-slate-400 bg-red-600 text-white min-w-[50px]">I1</th>
                    <th className="p-2 border border-slate-400 bg-red-600 text-white min-w-[50px]">I2</th>
                    <th className="p-2 border border-slate-400 bg-red-600 text-white min-w-[50px]">I3</th>
                    {/* Yellow Zone: I4, I5, I6 */}
                    <th className="p-2 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[50px]">I4</th>
                    <th className="p-2 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[50px]">I5</th>
                    <th className="p-2 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[50px]">I6</th>
                    {/* Grey Zone: Juz 1-5, Juz 6-10 */}
                    <th className="p-2 border border-slate-400 bg-slate-300 text-slate-800 min-w-[55px]">JUZ 1-5</th>
                    <th className="p-2 border border-slate-400 bg-slate-300 text-slate-800 min-w-[55px]">JUZ 6-10</th>
                    {/* Green Zone: Juz 11-15, Juz 16-20, Juz 21-25, Juz 26-30 */}
                    <th className="p-2 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[55px]">JUZ 11-15</th>
                    <th className="p-2 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[55px]">JUZ 16-20</th>
                    <th className="p-2 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[55px]">JUZ 21-25</th>
                    <th className="p-2 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[55px]">JUZ 26-30</th>
                    {/* Gold Zone: Khatam */}
                    <th className="p-2 border border-slate-400 bg-amber-300 text-slate-900 min-w-[65px]">
                      KHATAM
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {localCohorts.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 border border-slate-300 text-left font-bold text-slate-900 bg-slate-50">
                        {row.kelas}
                      </td>
                      <td className="p-2 border border-slate-300 font-bold font-mono text-slate-900 bg-slate-100">
                        {row.bilMurid}
                      </td>

                      {/* Red Cells */}
                      {(['i1', 'i2', 'i3'] as const).map((col) => (
                        <td key={col} className="p-1 border border-slate-300 bg-red-50/70">
                          <input
                            type="number"
                            min="0"
                            value={row[col]}
                            onChange={(e) => handleCellChange(idx, col, parseInt(e.target.value) || 0)}
                            className="w-full text-center font-mono font-bold text-red-700 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded py-1"
                          />
                        </td>
                      ))}

                      {/* Yellow Cells */}
                      {(['i4', 'i5', 'i6'] as const).map((col) => (
                        <td key={col} className="p-1 border border-slate-300 bg-yellow-50/70">
                          <input
                            type="number"
                            min="0"
                            value={row[col]}
                            onChange={(e) => handleCellChange(idx, col, parseInt(e.target.value) || 0)}
                            className="w-full text-center font-mono font-bold text-amber-900 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded py-1"
                          />
                        </td>
                      ))}

                      {/* Grey Cells */}
                      {(['juz1_5', 'juz6_10'] as const).map((col) => (
                        <td key={col} className="p-1 border border-slate-300 bg-slate-100/70">
                          <input
                            type="number"
                            min="0"
                            value={row[col]}
                            onChange={(e) => handleCellChange(idx, col, parseInt(e.target.value) || 0)}
                            className="w-full text-center font-mono font-bold text-slate-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 rounded py-1"
                          />
                        </td>
                      ))}

                      {/* Green Cells */}
                      {(['juz11_15', 'juz16_20', 'juz21_25', 'juz26_30'] as const).map((col) => (
                        <td key={col} className="p-1 border border-slate-300 bg-emerald-50/70">
                          <input
                            type="number"
                            min="0"
                            value={row[col]}
                            onChange={(e) => handleCellChange(idx, col, parseInt(e.target.value) || 0)}
                            className="w-full text-center font-mono font-bold text-emerald-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded py-1"
                          />
                        </td>
                      ))}

                      {/* Gold Cell */}
                      <td className="p-1 border border-slate-300 bg-amber-50">
                        <input
                          type="number"
                          min="0"
                          value={row.khatam}
                          onChange={(e) => handleCellChange(idx, 'khatam', parseInt(e.target.value) || 0)}
                          className="w-full text-center font-mono font-extrabold text-amber-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 rounded py-1"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="bg-slate-200/90 font-extrabold font-mono text-slate-900 border-t-2 border-slate-400">
                    <td className="p-2.5 border border-slate-400 text-left font-sans font-black">
                      JUMLAH
                    </td>
                    <td className="p-2 border border-slate-400 text-blue-900">
                      {totals.bilMurid}
                    </td>
                    <td className="p-2 border border-slate-400 text-red-700">{totals.i1}</td>
                    <td className="p-2 border border-slate-400 text-red-700">{totals.i2}</td>
                    <td className="p-2 border border-slate-400 text-red-700">{totals.i3}</td>
                    <td className="p-2 border border-slate-400 text-amber-900">{totals.i4}</td>
                    <td className="p-2 border border-slate-400 text-amber-900">{totals.i5}</td>
                    <td className="p-2 border border-slate-400 text-amber-900">{totals.i6}</td>
                    <td className="p-2 border border-slate-400 text-slate-800">{totals.juz1_5}</td>
                    <td className="p-2 border border-slate-400 text-slate-800">{totals.juz6_10}</td>
                    <td className="p-2 border border-slate-400 text-emerald-800">{totals.juz11_15}</td>
                    <td className="p-2 border border-slate-400 text-emerald-800">{totals.juz16_20}</td>
                    <td className="p-2 border border-slate-400 text-emerald-800">{totals.juz21_25}</td>
                    <td className="p-2 border border-slate-400 text-emerald-800">{totals.juz26_30}</td>
                    <td className="p-2 border border-slate-400 text-amber-800">{totals.khatam}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Analisis Tahap & Peratusan Keseluruhan - Page 6 of PDF */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Analisis Kebolehbacaan & Peratusan Keseluruhan (Format Halaman 6 PDF)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jadual ringkasan rasmi bilangan murid dan peratusan (%) mengikut modul bacaan
                </p>
              </div>
            </div>

            {/* Matrix 1: IQRA 1 - 6 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                A. Modul Iqra (Iqra 1 hingga Iqra 6)
              </span>
              <div className="overflow-x-auto rounded-2xl border border-slate-300">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="font-extrabold uppercase text-slate-900">
                      <th className="p-2.5 border border-slate-400 bg-slate-100 text-left min-w-[130px]">
                        ITEM / PERKARA
                      </th>
                      <th className="p-2.5 border border-slate-400 bg-red-600 text-white min-w-[80px]">IQRA 1</th>
                      <th className="p-2.5 border border-slate-400 bg-red-600 text-white min-w-[80px]">IQRA 2</th>
                      <th className="p-2.5 border border-slate-400 bg-red-600 text-white min-w-[80px]">IQRA 3</th>
                      <th className="p-2.5 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[80px]">IQRA 4</th>
                      <th className="p-2.5 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[80px]">IQRA 5</th>
                      <th className="p-2.5 border border-slate-400 bg-yellow-400 text-slate-900 min-w-[80px]">IQRA 6</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-bold font-mono">
                    <tr>
                      <td className="p-2.5 border border-slate-300 text-left font-sans font-semibold text-slate-700 bg-slate-50">
                        Bilangan Murid
                      </td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{totals.i1}</td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{totals.i2}</td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{totals.i3}</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{totals.i4}</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{totals.i5}</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{totals.i6}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 border border-slate-300 text-left font-sans font-semibold text-slate-700">
                        Peratus (%)
                      </td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{pcts.i1}%</td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{pcts.i2}%</td>
                      <td className="p-2.5 border border-slate-300 text-red-700">{pcts.i3}%</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{pcts.i4}%</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{pcts.i5}%</td>
                      <td className="p-2.5 border border-slate-300 text-amber-900">{pcts.i6}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matrix 2: AL-QURAN & KHATAM */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                B. Modul Al-Quran (Juz 1 hingga 30 & Khatam)
              </span>
              <div className="overflow-x-auto rounded-2xl border border-slate-300">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="font-extrabold uppercase text-slate-900">
                      <th className="p-2.5 border border-slate-400 bg-slate-100 text-left min-w-[130px]">
                        ITEM / PERKARA
                      </th>
                      <th className="p-2.5 border border-slate-400 bg-slate-300 text-slate-800 min-w-[70px]">J 1-5</th>
                      <th className="p-2.5 border border-slate-400 bg-slate-300 text-slate-800 min-w-[70px]">J 6-10</th>
                      <th className="p-2.5 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[70px]">J 11-15</th>
                      <th className="p-2.5 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[70px]">J 16-20</th>
                      <th className="p-2.5 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[70px]">J 21-25</th>
                      <th className="p-2.5 border border-slate-400 bg-emerald-200 text-slate-900 min-w-[70px]">J 26-30</th>
                      <th className="p-2.5 border border-slate-400 bg-amber-300 text-slate-900 min-w-[80px]">KHATAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-bold font-mono">
                    <tr>
                      <td className="p-2.5 border border-slate-300 text-left font-sans font-semibold text-slate-700 bg-slate-50">
                        Bilangan Murid
                      </td>
                      <td className="p-2.5 border border-slate-300 text-slate-800">{totals.juz1_5}</td>
                      <td className="p-2.5 border border-slate-300 text-slate-800">{totals.juz6_10}</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{totals.juz11_15}</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{totals.juz16_20}</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{totals.juz21_25}</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{totals.juz26_30}</td>
                      <td className="p-2.5 border border-slate-300 text-amber-800">{totals.khatam}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 border border-slate-300 text-left font-sans font-semibold text-slate-700">
                        Peratus (%)
                      </td>
                      <td className="p-2.5 border border-slate-300 text-slate-800">{pcts.juz1_5}%</td>
                      <td className="p-2.5 border border-slate-300 text-slate-800">{pcts.juz6_10}%</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{pcts.juz11_15}%</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{pcts.juz16_20}%</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{pcts.juz21_25}%</td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800">{pcts.juz26_30}%</td>
                      <td className="p-2.5 border border-slate-300 text-amber-800">{pcts.khatam}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
