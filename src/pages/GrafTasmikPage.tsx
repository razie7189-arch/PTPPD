import React, { useState, useMemo } from 'react';
import { TasmikSchoolRecord, TasmikDistrictSummary } from '../types';
import { TapakRekalibrasiGraf } from '../components/TapakRekalibrasiGraf';
import {
  BarChart3,
  Flame,
  Award,
  BookOpen,
  School,
  TrendingUp,
  Target,
  Layers,
  ChevronDown,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  Info,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface GrafTasmikPageProps {
  schools: TasmikSchoolRecord[];
  summary: TasmikDistrictSummary;
  onSaveSchool?: (record: TasmikSchoolRecord) => Promise<void>;
  onSyncSchool?: (school: TasmikSchoolRecord) => Promise<void>;
}

export const GrafTasmikPage: React.FC<GrafTasmikPageProps> = ({
  schools,
  summary,
  onSaveSchool,
  onSyncSchool
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tapak' | 'kpi' | 'levels' | 'compare'>('tapak');

  // Compute aggregated district numbers for each level
  const districtLevels = useMemo(() => {
    const totals = {
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
      khatam: 0
    };

    const targetList =
      selectedSchoolId === 'all'
        ? schools
        : schools.filter((s) => s.id === selectedSchoolId);

    targetList.forEach((s) => {
      totals.iqra1 += s.iqra1 || 0;
      totals.iqra2 += s.iqra2 || 0;
      totals.iqra3 += s.iqra3 || 0;
      totals.iqra4 += s.iqra4 || 0;
      totals.iqra5_6 += s.iqra5_6 || 0;
      totals.juz1_5 += s.juz1_5 || 0;
      totals.juz6_10 += s.juz6_10 || 0;
      totals.juz11_15 += s.juz11_15 || 0;
      totals.juz16_20 += s.juz16_20 || 0;
      totals.juz21_25 += s.juz21_25 || 0;
      totals.juz26_30 += s.juz26_30 || 0;
      totals.khatam += s.khatam || 0;
    });

    const totalStudents =
      selectedSchoolId === 'all'
        ? summary.totalStudents
        : targetList[0]?.totalStudents || 1;

    return {
      totals,
      totalStudents,
      iqraTotal: totals.iqra1 + totals.iqra2 + totals.iqra3 + totals.iqra4 + totals.iqra5_6,
      quranTotal:
        totals.juz1_5 +
        totals.juz6_10 +
        totals.juz11_15 +
        totals.juz16_20 +
        totals.juz21_25 +
        totals.juz26_30,
      khatamTotal: totals.khatam
    };
  }, [schools, selectedSchoolId, summary]);

  // Selected school object (if specific)
  const currentSchool = schools.find((s) => s.id === selectedSchoolId);

  // Level definition items as explicitly listed in user instructions
  const levelItems = [
    { key: 'iqra1', label: 'Iqra 1', count: districtLevels.totals.iqra1, group: 'iqra', color: '#F97316' },
    { key: 'iqra2', label: 'Iqra 2', count: districtLevels.totals.iqra2, group: 'iqra', color: '#FB923C' },
    { key: 'iqra3', label: 'Iqra 3', count: districtLevels.totals.iqra3, group: 'iqra', color: '#FDBA74' },
    { key: 'iqra4', label: 'Iqra 4', count: districtLevels.totals.iqra4, group: 'iqra', color: '#FDE047' },
    { key: 'iqra5_6', label: 'Iqra 5 dan 6', count: districtLevels.totals.iqra5_6, group: 'iqra', color: '#A3E635' },
    { key: 'juz1_5', label: 'Juz 1 hingga 5', count: districtLevels.totals.juz1_5, group: 'quran', color: '#34D399' },
    { key: 'juz6_10', label: 'Juz 6 hingga 10', count: districtLevels.totals.juz6_10, group: 'quran', color: '#10B981' },
    { key: 'juz11_15', label: 'Juz 11 hingga 15', count: districtLevels.totals.juz11_15, group: 'quran', color: '#059669' },
    { key: 'juz16_20', label: 'Juz 16 hingga 20', count: districtLevels.totals.juz16_20, group: 'quran', color: '#0D9488' },
    { key: 'juz21_25', label: 'Juz 21 hingga 25', count: districtLevels.totals.juz21_25, group: 'quran', color: '#0284C7' },
    { key: 'juz26_30', label: 'Juz 26 hingga 30', count: districtLevels.totals.juz26_30, group: 'quran', color: '#6366F1' },
    { key: 'khatam', label: 'Khatam Al-Quran', count: districtLevels.totals.khatam, group: 'khatam', color: '#A855F7' }
  ];

  const maxLevelCount = Math.max(...levelItems.map((l) => l.count), 1);

  // School KPI comparison list
  const schoolKpiList = useMemo(() => {
    return schools.map((s) => {
      const quranPlusKhatam =
        s.juz1_5 + s.juz6_10 + s.juz11_15 + s.juz16_20 + s.juz21_25 + s.juz26_30 + s.khatam;
      const kpiScore = s.totalStudents > 0 ? (quranPlusKhatam / s.totalStudents) * 100 : 0;
      return {
        id: s.id,
        name: s.schoolName,
        code: s.schoolCode,
        total: s.totalStudents,
        quranPlusKhatam,
        khatam: s.khatam,
        kpiScore: Math.round(kpiScore * 10) / 10,
        isAchieved: kpiScore >= 95.0
      };
    }).sort((a, b) => b.kpiScore - a.kpiScore);
  }, [schools]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Card */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Graf Pelaporan & Analisis Tasmik Mengikut Sekolah
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              Pemantauan kemajuan mengikut setiap modul rasmi: <span className="font-semibold text-slate-700">Iqra 1, 2, 3, 4, 5 & 6, Juz 1-5, Juz 6-10, Juz 11-15, Juz 16-20, Juz 21-25, Juz 26-30, Khatam Al-Quran</span> dan <span className="font-semibold text-orange-600">Prestasi Semasa KPI 95%</span>.
            </p>
          </div>

          {/* School Selector Dropdown */}
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200/80 flex items-center gap-2 min-w-[280px]">
            <School className="w-4 h-4 text-orange-500 ml-2" />
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer py-1.5"
            >
              <option value="all">Keseluruhan Daerah Penampang (Semua Sekolah)</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.schoolName} ({s.schoolCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('tapak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tapak'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>Tapak Rekalibrasi j-QAF (Format PDF)</span>
          </button>
          <button
            onClick={() => setActiveTab('kpi')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kpi'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            Pencapaian KPI 95% & Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'levels'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            Pecahan 12 Tahap (Iqra & Juz 1-30)
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            Perbandingan Antara Sekolah
          </button>
        </div>
      </div>

      {/* Tapak Rekalibrasi Tab (Exact to PDF) */}
      {activeTab === 'tapak' && (
        <TapakRekalibrasiGraf
          schools={schools}
          onSaveSchool={onSaveSchool || (async () => {})}
          selectedSchoolId={selectedSchoolId !== 'all' ? selectedSchoolId : undefined}
          onSelectSchool={(id) => setSelectedSchoolId(id)}
          onSyncSchool={onSyncSchool}
        />
      )}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          {/* Top KPI Box with Wild Wings style */}
          <div className="apple-card rounded-3xl p-6 sm:p-8 bg-linear-to-br from-white via-orange-50/20 to-amber-50/30 border-orange-200/70">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Target Statement */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                  <span>Sasaran Utama PPD Penampang</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Prestasi Semasa (KPI): 95%
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Penetapan KPI 95% mengukur nisbah murid yang berjaya beralih ke peringkat Al-Quran (Juz 1 hingga 30) serta menamatkan Khatam Al-Quran menjelang akhir sesi persekolahan.
                </p>
                {currentSchool && (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-orange-200/60 text-xs">
                    <span className="font-semibold text-slate-700">Penyelaras: </span>
                    <span className="text-slate-900 font-bold">{currentSchool.submittedBy}</span>
                  </div>
                )}
              </div>

              {/* Central Gauge */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E2E8F0"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#orangeGradient)"
                      strokeWidth="9"
                      strokeDasharray={251.2}
                      strokeDashoffset={
                        251.2 -
                        (251.2 *
                          Math.min(
                            selectedSchoolId === 'all'
                              ? summary.onTrackPercentage
                              : Math.round(
                                  ((districtLevels.quranTotal + districtLevels.khatamTotal) /
                                    districtLevels.totalStudents) *
                                    100
                                ),
                            100
                          )) /
                          100
                      }
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B00" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {selectedSchoolId === 'all'
                        ? summary.onTrackPercentage
                        : Math.round(
                            ((districtLevels.quranTotal + districtLevels.khatamTotal) /
                              districtLevels.totalStudents) *
                              100
                          )}
                      %
                    </span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                      KPI Sasaran 95%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Murid Al-Quran + Khatam
                    </span>
                    <div className="text-lg font-bold text-slate-900">
                      {(districtLevels.quranTotal + districtLevels.khatamTotal).toLocaleString()} murid
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Khatam Al-Quran Penuh
                    </span>
                    <div className="text-lg font-bold text-purple-700">
                      {districtLevels.khatamTotal.toLocaleString()} murid
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Pengukuhan Asas Iqra 1-6
                    </span>
                    <div className="text-lg font-bold text-amber-700">
                      {districtLevels.iqraTotal.toLocaleString()} murid
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated 3-Stage Progress Stack */}
          <div className="apple-card rounded-3xl p-6 sm:p-7">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Nisbah Taburan Murid (Iqra 1-6 vs Al-Quran vs Khatam)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Jumlah keseluruhan murid: <span className="font-bold text-slate-800">{districtLevels.totalStudents.toLocaleString()} orang</span>
            </p>

            <div className="w-full h-7 bg-slate-100 rounded-2xl overflow-hidden flex p-1 gap-1">
              <div
                style={{
                  width: `${Math.max(
                    (districtLevels.iqraTotal / districtLevels.totalStudents) * 100,
                    2
                  )}%`
                }}
                className="bg-amber-400 h-full rounded-xl transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-amber-950 truncate px-1"
                title={`Iqra 1-6: ${districtLevels.iqraTotal}`}
              >
                Iqra ({Math.round((districtLevels.iqraTotal / districtLevels.totalStudents) * 100)}%)
              </div>
              <div
                style={{
                  width: `${Math.max(
                    (districtLevels.quranTotal / districtLevels.totalStudents) * 100,
                    2
                  )}%`
                }}
                className="bg-emerald-500 h-full rounded-xl transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white truncate px-1"
                title={`Juz 1-30: ${districtLevels.quranTotal}`}
              >
                Al-Quran ({Math.round((districtLevels.quranTotal / districtLevels.totalStudents) * 100)}%)
              </div>
              <div
                style={{
                  width: `${Math.max(
                    (districtLevels.khatamTotal / districtLevels.totalStudents) * 100,
                    2
                  )}%`
                }}
                className="bg-purple-600 h-full rounded-xl transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white truncate px-1"
                title={`Khatam: ${districtLevels.khatamTotal}`}
              >
                Khatam ({Math.round((districtLevels.khatamTotal / districtLevels.totalStudents) * 100)}%)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span>
                <div>
                  <span className="text-slate-500 font-medium">Iqra 1 hingga 6:</span>
                  <div className="font-bold text-slate-800">
                    {districtLevels.iqraTotal} murid ({Math.round((districtLevels.iqraTotal / districtLevels.totalStudents) * 100)}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <div>
                  <span className="text-slate-500 font-medium">Juz 1 hingga 30:</span>
                  <div className="font-bold text-slate-800">
                    {districtLevels.quranTotal} murid ({Math.round((districtLevels.quranTotal / districtLevels.totalStudents) * 100)}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0"></span>
                <div>
                  <span className="text-slate-500 font-medium">Khatam Al-Quran:</span>
                  <div className="font-bold text-slate-800">
                    {districtLevels.khatamTotal} murid ({Math.round((districtLevels.khatamTotal / districtLevels.totalStudents) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12 Detailed Levels Breakdown Tab */}
      {activeTab === 'levels' && (
        <div className="apple-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pecahan Terperinci Mengikut 12 Modul Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Data untuk {selectedSchoolId === 'all' ? 'semua sekolah rendah daerah Penampang' : currentSchool?.schoolName}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              {districtLevels.totalStudents.toLocaleString()} Jumlah Murid
            </span>
          </div>

          <div className="space-y-4">
            {levelItems.map((item) => {
              const pct = districtLevels.totalStudents > 0
                ? ((item.count / districtLevels.totalStudents) * 100).toFixed(1)
                : '0';
              const barWidth = Math.max((item.count / maxLevelCount) * 100, 4);

              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        ({item.group === 'iqra' ? 'Modul Iqra' : item.group === 'khatam' ? 'Khatam' : 'Al-Quran'})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[11px]">murid</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 min-w-[50px] text-center">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* School Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="apple-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pencapaian KPI 95% Mengikut Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Susunan sekolah mengikut peratusan murid celik Al-Quran & Khatam
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>≥ 95% (Capai KPI)</span>
            </div>
          </div>

          <div className="space-y-4">
            {schoolKpiList.map((sch, index) => {
              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:border-orange-200/80 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-[11px]">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {sch.name}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          {sch.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Al-Quran + Khatam</div>
                        <div className="font-mono font-bold text-slate-800">
                          {sch.quranPlusKhatam} / {sch.total} murid
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 ${
                          sch.isAchieved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{sch.kpiScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sch.isAchieved
                          ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                          : 'bg-linear-to-r from-orange-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(sch.kpiScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
