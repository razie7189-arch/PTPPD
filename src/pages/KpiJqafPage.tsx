import React, { useState } from 'react';
import { JqafModelKpi } from '../types';
import {
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface KpiJqafPageProps {
  models: JqafModelKpi[];
  onNavigateToRekalibrasi?: () => void;
}

export const KpiJqafPage: React.FC<KpiJqafPageProps> = ({ models, onNavigateToRekalibrasi }) => {
  const [activeLevel, setActiveLevel] = useState<'kebangsaan' | 'negeri' | 'ppd'>('ppd');

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner matching Pages 2, 3, 4 of PDF */}
      <div className="apple-card rounded-3xl p-6 sm:p-8 bg-linear-to-br from-blue-950 via-blue-900 to-indigo-950 text-white border-blue-800/80 shadow-xl shadow-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-amber-300 border border-blue-400/30">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Sektor Pendidikan Islam (SPI ITQAN: menjana kualiti)
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white">
              KPI Mengikut Model Program j-QAF 2026 (Tahun 6)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Membandingkan penanda aras rasmi bagi 6 model teras j-QAF: Al-Quran, Jawi, Bahasa Arab, Amali Wuduk, Solat Perlakuan, dan Solat Bacaan.
            </p>
          </div>

          <button
            onClick={onNavigateToRekalibrasi}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Tapak Rekalibrasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Level Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-blue-900/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveLevel('ppd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeLevel === 'ppd'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            🏛️ KPI PPD Penampang (Halaman 4)
          </button>
          <button
            onClick={() => setActiveLevel('negeri')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeLevel === 'negeri'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            🌴 KPI Negeri Sabah (Halaman 3)
          </button>
          <button
            onClick={() => setActiveLevel('kebangsaan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeLevel === 'kebangsaan'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            🇲🇾 KPI Kebangsaan KPM (Halaman 2)
          </button>
        </div>
      </div>

      {/* Title description of selected level */}
      <div className="flex items-center justify-between text-xs font-semibold px-2">
        <span className="text-slate-500">
          Paparan Aktif:{' '}
          <span className="font-bold text-blue-950 uppercase">
            {activeLevel === 'ppd'
              ? 'KPI PPD MENGIKUT MODEL PROGRAM j-QAF 2026 (TAHUN 6)'
              : activeLevel === 'negeri'
              ? 'KPI NEGERI MENGIKUT MODEL PROGRAM j-QAF 2026 (TAHUN 6)'
              : 'KPI KEBANGSAAN MENGIKUT MODEL PROGRAM j-QAF 2026 (TAHUN 6)'}
          </span>
        </span>
        <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          Kohort Sasaran: Murid Tahun 6
        </span>
      </div>

      {/* 6 Models Grid - Direct Visual Reproduction of Pages 2, 3, 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          let targetValueDisplay: React.ReactNode = null;
          let targetPercent = 100;

          if (model.name === 'Al-Quran') {
            const data =
              activeLevel === 'kebangsaan'
                ? model.kebangsaan
                : activeLevel === 'negeri'
                ? model.negeri
                : model.ppd;

            targetPercent = data.kebolehbacaan || 95;
            targetValueDisplay = (
              <div className="space-y-2 mt-2">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="text-[11px] text-blue-800 font-semibold">
                    Penguasaan Al-Quran (Kebolehbacaan)
                  </div>
                  <div className="text-2xl font-black text-blue-950 mt-0.5">
                    {data.kebolehbacaan?.toFixed(2)} %
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="text-[11px] text-amber-800 font-semibold">
                    Khatam Al-Quran
                  </div>
                  <div className="text-2xl font-black text-amber-950 mt-0.5">
                    {data.khatam?.toFixed(2)} %
                  </div>
                </div>

                {data.modelAlQuran && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                    <span className="text-slate-500 font-medium">Model Al-Quran (KPI Negeri/PPD): </span>
                    <span className="font-extrabold text-blue-900">{data.modelAlQuran.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            );
          } else {
            const val =
              activeLevel === 'kebangsaan'
                ? model.kebangsaan.value || 100
                : activeLevel === 'negeri'
                ? model.negeri.value || 100
                : model.ppd.value || 100;

            targetPercent = val;
            targetValueDisplay = (
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50/60 border border-blue-100 my-2">
                <div className="text-4xl font-black text-blue-950 font-mono tracking-tight">
                  {val.toFixed(2)} %
                </div>
                <span className="text-[11px] text-blue-700 font-semibold mt-1">
                  Sasaran {activeLevel === 'kebangsaan' ? 'Kebangsaan' : activeLevel === 'negeri' ? 'Negeri' : 'PPD'}
                </span>
              </div>
            );
          }

          return (
            <div
              key={model.id}
              className="apple-card rounded-3xl p-6 flex flex-col justify-between hover:border-blue-400 transition-all group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-700 to-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {model.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors uppercase">
                        {model.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Model Teras j-QAF
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Tahun 6
                  </span>
                </div>

                {targetValueDisplay}

                {/* Current Achievement comparison */}
                {model.currentScore && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Pencapaian Semasa Penampang:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {model.currentScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(model.currentScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table Summary */}
      <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Jadual Perbandingan KPI Kebangsaan vs KPI Negeri vs KPI PPD Penampang 2026
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Model Program j-QAF</th>
                <th className="py-3 px-3 text-center">KPI Kebangsaan (Hal. 2)</th>
                <th className="py-3 px-3 text-center">KPI Negeri Sabah (Hal. 3)</th>
                <th className="py-3 px-3 text-center">KPI PPD Penampang (Hal. 4)</th>
                <th className="py-3 px-3 text-center">Pencapaian Daerah Semasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">
                  Al-Quran (Penguasaan / Kebolehbacaan)
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">98.50%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">95.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">95.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">96.4%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">
                  Al-Quran (Khatam Al-Quran)
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">54.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">30.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">30.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">42.5%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">Jawi</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">99.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">97.50%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">97.50%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">98.2%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">Bahasa Arab</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">Amali Wuduk</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">Solat Perlakuan</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">100.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">99.70%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">99.70%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">99.8%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-blue-950">Solat Bacaan</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">80.00%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">99.75%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">99.75%</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">98.9%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
