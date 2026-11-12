import React, { useState } from 'react';
import {
  TasmikSchoolRecord,
  Officer,
  TakwimEvent,
  DashboardModule,
  PageId,
  TasmikDistrictSummary
} from '../types';
import { DynamicIcon } from '../components/DynamicIcon';
import {
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  CalendarDays,
  FileText,
  Sparkles,
  ChevronRight,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardHomeProps {
  schools: TasmikSchoolRecord[];
  officers: Officer[];
  takwim: TakwimEvent[];
  modules: DashboardModule[];
  summary: TasmikDistrictSummary;
  onNavigate: (page: PageId) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  schools,
  officers,
  takwim,
  modules,
  summary,
  onNavigate
}) => {
  const [selectedChartTab, setSelectedChartTab] = useState<'khatam' | 'iqra' | 'juz'>('khatam');

  // Top performing schools sorted by Khatam count
  const sortedSchools = [...schools].sort((a, b) => b.khatam - a.khatam);
  const topSchools = sortedSchools.slice(0, 6);

  // Upcoming 3 takwim events
  const upcomingEvents = takwim.slice(0, 3);

  // Top 4 officers
  const keyOfficers = officers.slice(0, 4);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner in Royal Blue Theme */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-10 border border-blue-800/80 shadow-xl shadow-blue-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Pemantauan Tasmik Bersepadu 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Portal Pelaporan Tasmik <br />
              <span className="bg-linear-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Daerah Penampang
              </span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Memacu kecemerlangan celik Al-Quran & j-QAF sekolah-sekolah daerah Penampang.
              Pantau kemajuan Iqra 1 hingga 6, Juz 1 hingga 30, dan status Khatam Al-Quran secara telus dan masa nyata.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('graf-tasmik')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Tapak Rekalibrasi PDF 2026</span>
              </button>
              <button
                onClick={() => onNavigate('borang-input')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Hantar / Kemaskini Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick KPI Gauge Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:min-w-[280px] flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-200 font-bold mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Prestasi Semasa (KPI 95%)</span>
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-blue-950/80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * Math.min(summary.onTrackPercentage, 100)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-orange-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">
                  {summary.onTrackPercentage}%
                </span>
                <span className="text-[11px] text-blue-200 font-medium">Sasaran 95%</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {summary.isKpiAchieved ? '✓ Sasaran KPI Dicapai!' : `Baki ${Math.max(0, 95 - summary.onTrackPercentage).toFixed(1)}% Menuju Sasaran`}
              </div>
              <p className="text-[11px] text-blue-200 mt-2">
                Jumlah Murid: <span className="text-white font-bold">{summary.totalStudents.toLocaleString()} orang</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box Grid - 4 Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prestasi KPI */}
        <div className="apple-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Prestasi KPI 95%
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary.onTrackPercentage}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Murid Al-Quran & Khatam</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-linear-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(summary.onTrackPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Status Pelaporan Sekolah */}
        <div
          onClick={() => onNavigate('status-pelaporan')}
          className="apple-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Pelaporan Sekolah
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary.submittedSchools} / {summary.totalSchools}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{summary.submittedSchools} Selesai</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{summary.inProgressSchools} Proses</span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">{summary.pendingSchools} Belum</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-orange-600 font-medium">
            <span>Semak senarai sekolah</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Murid Khatam Al-Quran */}
        <div className="apple-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Khatam Al-Quran
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary.totalKhatam.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-purple-600">
                {summary.khatamPercentage}%
              </span>
              <span>daripada keseluruhan murid</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(summary.khatamPercentage * 2.5, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Taburan Bacaan Iqra */}
        <div className="apple-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tahap Iqra 1 - 6
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {summary.totalIqra.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>{Math.round((summary.totalIqra / summary.totalStudents) * 100)}% dalam fasa pengukuhan</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min((summary.totalIqra / summary.totalStudents) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Main Bento Box Grid Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Interactive Chart Preview & School Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bento Card: Graf Pelaporan Mengikut Sekolah Preview */}
          <div className="apple-card rounded-3xl p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Graf Pelaporan mengikut Sekolah
                  </h2>
                  <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-md">
                    Daerah Penampang
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pecahan tahap Iqra 1-6, Juz Al-Quran (1-30), dan murid Khatam
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedChartTab('khatam')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedChartTab === 'khatam'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Khatam
                </button>
                <button
                  onClick={() => setSelectedChartTab('juz')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedChartTab === 'juz'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Juz 1-30
                </button>
                <button
                  onClick={() => setSelectedChartTab('iqra')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedChartTab === 'iqra'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Iqra 1-6
                </button>
              </div>
            </div>

            {/* Visual Bars for Schools */}
            <div className="mt-6 space-y-4">
              {topSchools.map((school) => {
                const totalQuran =
                  school.juz1_5 +
                  school.juz6_10 +
                  school.juz11_15 +
                  school.juz16_20 +
                  school.juz21_25 +
                  school.juz26_30;
                const totalIqra =
                  school.iqra1 + school.iqra2 + school.iqra3 + school.iqra4 + school.iqra5_6;

                let displayValue = school.khatam;
                let displayPct = Math.round((school.khatam / school.totalStudents) * 100);
                let barColor = 'bg-linear-to-r from-orange-500 to-amber-500';

                if (selectedChartTab === 'juz') {
                  displayValue = totalQuran;
                  displayPct = Math.round((totalQuran / school.totalStudents) * 100);
                  barColor = 'bg-linear-to-r from-emerald-500 to-teal-500';
                } else if (selectedChartTab === 'iqra') {
                  displayValue = totalIqra;
                  displayPct = Math.round((totalIqra / school.totalStudents) * 100);
                  barColor = 'bg-linear-to-r from-blue-500 to-cyan-500';
                }

                return (
                  <div key={school.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{school.schoolName}</span>
                        <span className="text-slate-400 text-[11px]">({school.schoolCode})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900">{displayValue}</span>
                        <span className="text-slate-400">/ {school.totalStudents} murid</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {displayPct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(displayPct, 3)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Memaparkan 6 daripada {schools.length} buah sekolah rendah daerah Penampang
              </span>
              <button
                onClick={() => onNavigate('graf-tasmik')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Paparan Graf Penuh & Semua Sekolah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bento Card: Modul Utama & Akses Pantas (Dynamic Modules) */}
          <div className="apple-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Modul Utama & Fail Pengurusan
                </h2>
                <p className="text-xs text-slate-500">
                  Akses terus ke dokumen, takwim, guru, dan tetapan sistem
                </p>
              </div>
              <button
                onClick={() => onNavigate('tetapan')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Urus Modul
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {modules
                .filter((m) => m.isActive)
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onNavigate(m.pageId)}
                    className="group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200/80 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${m.accentColor}15`,
                        color: m.accentColor
                      }}
                    >
                      <DynamicIcon name={m.iconName} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {m.title}
                        </h4>
                        {m.badgeText && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: `${m.accentColor}15`,
                              color: m.accentColor
                            }}
                          >
                            {m.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col wide): Takwim UPI, Officers, and Documents */}
        <div className="space-y-6">
          {/* Bento Card: Takwim Unit Pendidikan Islam */}
          <div className="apple-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Takwim Unit Pendidikan Islam
                  </h3>
                  <p className="text-[11px] text-slate-500">PPD Penampang 2026</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('takwim')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                      {evt.date}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        evt.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    📍 {evt.venue}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('takwim')}
              className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Buka Takwim Penuh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento Card: Barisan Pegawai Unit Pendidikan Islam */}
          <div className="apple-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Barisan Pegawai UPI
                  </h3>
                  <p className="text-[11px] text-slate-500">PPD Penampang, Sabah</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pegawai')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Direktori
              </button>
            </div>

            <div className="space-y-3">
              {keyOfficers.map((off) => (
                <div
                  key={off.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={off.avatarUrl}
                    alt={off.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {off.name}
                    </h4>
                    <p className="text-[11px] text-orange-600 font-medium truncate">
                      {off.designation}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Gred {off.grade} • {off.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('pegawai')}
              className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Lihat Carta Organisasi & Maklumat Penuh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento Card: Dokumen PDF & Pekeliling Quick Embed */}
          <div className="apple-card rounded-3xl p-6 bg-linear-to-br from-amber-50/50 via-white to-orange-50/50 border-orange-200/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pusat Dokumen & PDF
                </h3>
                <p className="text-[11px] text-slate-500">Google Drive PDF Iframe</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Baca terus DSKP Semakan KSSR, Buku Panduan Pelaksanaan Tasmik j-QAF, dan Surat Pekeliling Ikhtisas di dalam portal tanpa perlu muat turun.
            </p>

            <button
              onClick={() => onNavigate('dokumen-pdf')}
              className="w-full py-2.5 px-3 text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Pembaca PDF Dalam Talian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
