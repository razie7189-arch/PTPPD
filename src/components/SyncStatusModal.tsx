import React, { useState } from 'react';
import { TasmikSchoolRecord, AutoSyncConfig } from '../types';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  Link as LinkIcon,
  X,
  FileSpreadsheet,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';
import { parseSpreadsheetUrl } from '../services/sheetSyncService';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: TasmikSchoolRecord[];
  isSyncing: boolean;
  syncProgress?: {
    current: number;
    total: number;
    schoolName: string;
    message: string;
  } | null;
  autoSyncConfig: AutoSyncConfig;
  onUpdateAutoSyncConfig: (config: AutoSyncConfig) => void;
  onTriggerSyncAll: () => Promise<void>;
  onTriggerSyncSingle: (school: TasmikSchoolRecord) => Promise<void>;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  schools,
  isSyncing,
  syncProgress,
  autoSyncConfig,
  onUpdateAutoSyncConfig,
  onTriggerSyncAll,
  onTriggerSyncSingle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_url' | 'synced' | 'no_url'>('all');
  const [singleSyncingCode, setSingleSyncingCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalSchools = schools.length;
  const withUrlCount = schools.filter((s) => Boolean(s.spreadsheetUrl && s.spreadsheetUrl.trim())).length;
  const syncedCount = schools.filter((s) => s.syncStatus === 'Synced').length;
  const totalEnrolled = schools.reduce((sum, s) => sum + (s.totalStudents || 0), 0);

  const filteredSchools = schools.filter((s) => {
    const matchSearch =
      s.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.schoolCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterType === 'has_url') return Boolean(s.spreadsheetUrl);
    if (filterType === 'synced') return s.syncStatus === 'Synced';
    if (filterType === 'no_url') return !s.spreadsheetUrl;
    return true;
  });

  const handleSingleSync = async (school: TasmikSchoolRecord) => {
    setSingleSyncingCode(school.schoolCode);
    try {
      await onTriggerSyncSingle(school);
    } finally {
      setSingleSyncingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700/60 border border-blue-400/40 flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">Sinkronisasi Otomatis Google Sheets</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-semibold">
                    Live Sync Master DB
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Penyelarasan automatik 25 pangkalan data j-QAF sekolah Daerah Penampang dari Google Sheets
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-blue-200 block">Jumlah Sekolah</span>
              <span className="text-xl font-bold text-white">{totalSchools} Buah</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-blue-200 block">Pautan Spreadsheet</span>
              <span className="text-xl font-bold text-amber-300">{withUrlCount} / {totalSchools}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-blue-200 block">Status Terkini</span>
              <span className="text-xl font-bold text-emerald-300">{syncedCount} Disinkron</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-blue-200 block">Jumlah Murid Terlibat</span>
              <span className="text-xl font-bold text-white">{totalEnrolled.toLocaleString()} Murid</span>
            </div>
          </div>
        </div>

        {/* Sync Controls & Configuration Bar */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Auto-Sync Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncConfig.enabled}
                onChange={(e) =>
                  onUpdateAutoSyncConfig({
                    ...autoSyncConfig,
                    enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-blue-950">Auto-Sync Berkala</span>
            </label>

            {/* Interval Selector */}
            {autoSyncConfig.enabled && (
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Selang Masa:</span>
                <select
                  value={autoSyncConfig.intervalMinutes}
                  onChange={(e) =>
                    onUpdateAutoSyncConfig({
                      ...autoSyncConfig,
                      intervalMinutes: Number(e.target.value),
                    })
                  }
                  className="bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs font-medium text-blue-900 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value={5}>Setiap 5 minit</option>
                  <option value={10}>Setiap 10 minit (Disyorkan)</option>
                  <option value={15}>Setiap 15 minit</option>
                  <option value={30}>Setiap 30 minit</option>
                  <option value={60}>Setiap 1 jam</option>
                </select>
              </div>
            )}
          </div>

          {/* Trigger All Sync Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerSyncAll}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                isSyncing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer shadow-blue-500/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkron Semua Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Live Progress Banner if currently syncing */}
        {isSyncing && syncProgress && (
          <div className="p-3 bg-blue-100 border-b border-blue-200 text-xs">
            <div className="flex items-center justify-between font-medium text-blue-900 mb-1">
              <span>{syncProgress.message}</span>
              <span>
                {syncProgress.current} / {syncProgress.total} (
                {Math.round((syncProgress.current / syncProgress.total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Cari sekolah atau kod sekolah (cth: XBA4101)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({totalSchools})
            </button>
            <button
              onClick={() => setFilterType('has_url')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'has_url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ada Pautan ({withUrlCount})
            </button>
            <button
              onClick={() => setFilterType('synced')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'synced'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Disinkron ({syncedCount})
            </button>
          </div>
        </div>

        {/* Schools List Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredSchools.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tiada sekolah dijumpai mengikut tapisan.
            </div>
          ) : (
            filteredSchools.map((sch) => {
              const isThisSyncing = singleSyncingCode === sch.schoolCode;
              return (
                <div
                  key={sch.id}
                  className="p-3.5 hover:bg-blue-50/50 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                      {sch.schoolCode.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {sch.schoolName}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {sch.schoolCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-blue-900">
                          {sch.totalStudents} Murid
                        </span>
                        {sch.lastSyncedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              Disinkron: {sch.lastSyncedAt}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {sch.spreadsheetUrl ? (
                      <>
                        <a
                          href={sch.spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          title="Buka fail Google Sheet asal"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden md:inline">Google Sheet</span>
                        </a>

                        <button
                          onClick={() => handleSingleSync(sch)}
                          disabled={isSyncing || isThisSyncing}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isThisSyncing ? 'animate-spin' : ''}`}
                          />
                          <span>{isThisSyncing ? 'Sinkron...' : 'Sinkron'}</span>
                        </button>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-400 text-[11px] font-medium italic">
                        Tiada Pautan
                      </span>
                    )}

                    <div className="w-6 flex justify-center">
                      {sch.syncStatus === 'Synced' ? (
                        <span title="Disinkronkan">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </span>
                      ) : sch.syncStatus === 'Error' ? (
                        <span title={sch.syncError || 'Ralat'}>
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Google Visualization aktif & serasi Vercel</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
