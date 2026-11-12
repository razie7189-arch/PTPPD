import React, { useState } from 'react';
import { DashboardModule, PageId, SupabaseConfig } from '../types';
import { supabaseService } from '../services/supabaseClient';
import { DynamicIcon } from '../components/DynamicIcon';
import {
  Settings,
  Plus,
  Save,
  Trash2,
  Database,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Download,
  Upload,
  Code2,
  Flame,
  Palette,
  LayoutGrid
} from 'lucide-react';

interface TetapanPengurusanPageProps {
  modules: DashboardModule[];
  onSaveModule: (module: DashboardModule) => Promise<void>;
  onDeleteModule: (id: string) => Promise<void>;
  supabaseConfig: SupabaseConfig;
  onRefreshData: () => Promise<void>;
}

export const TetapanPengurusanPage: React.FC<TetapanPengurusanPageProps> = ({
  modules,
  onSaveModule,
  onDeleteModule,
  supabaseConfig,
  onRefreshData
}) => {
  // New Module Form State
  const [moduleForm, setModuleForm] = useState<DashboardModule>({
    id: 'mod-' + Date.now(),
    title: '',
    description: '',
    pageId: 'dashboard',
    iconName: 'Bookmark',
    accentColor: '#FF6B00',
    badgeText: 'Baharu',
    order: modules.length + 1,
    isActive: true
  });

  // Supabase Config Form
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [configStatusMessage, setConfigStatusMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);

  // Available Lucide icon suggestions
  const iconSuggestions = [
    'CalendarDays',
    'Users',
    'CheckCircle2',
    'BarChart3',
    'FileEdit',
    'GraduationCap',
    'FileText',
    'Settings',
    'Bookmark',
    'Folder',
    'Award',
    'Flame',
    'Sparkles',
    'BookOpen',
    'Layers',
    'ShieldCheck'
  ];

  // Pre-configured Wild Wings and Apple sleek colors
  const colorSuggestions = [
    '#FF6B00', // Wild Wings Primary Flame
    '#EA580C', // Deep Orange
    '#F59E0B', // Amber
    '#EAB308', // Warm Gold
    '#10B981', // Emerald
    '#0EA5E9', // Sky Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#475569'  // Slate
  ];

  const handleSaveNewModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;

    await onSaveModule({
      ...moduleForm,
      id: 'mod-' + Date.now()
    });

    // Reset form
    setModuleForm({
      id: 'mod-' + Date.now(),
      title: '',
      description: '',
      pageId: 'dashboard',
      iconName: 'Bookmark',
      accentColor: '#FF6B00',
      badgeText: 'Baharu',
      order: modules.length + 2,
      isActive: true
    });

    alert('Modul baharu berjaya didaftarkan ke dalam dashboard!');
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConnection(true);
    setConfigStatusMessage(null);

    const res = await supabaseService.saveConfig(supabaseUrl, supabaseAnonKey);
    setIsTestingConnection(false);
    setConfigStatusMessage(res.message);
    await onRefreshData();
  };

  const handleCopySql = () => {
    const sql = supabaseService.getSqlMigrationSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleExportBackup = () => {
    const dataStr = supabaseService.exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_portal_tasmik_penampang_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const res = supabaseService.importDataJson(text);
      alert(res.message);
      if (res.success) {
        await onRefreshData();
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    if (confirm('Adakah anda pasti ingin mengembalikan semua data ke tetapan asal (default seed)?')) {
      supabaseService.resetToDefaults();
      await onRefreshData();
      alert('Data telah dikembalikan ke tetapan asal.');
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
                <Settings className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Pengurusan Dashboard & Tetapan Sistem
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Urus penambahan fail/modul baharu, konfigurasi sambungan Supabase & hos Vercel, serta pengurusan pangkalan data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport Sandaran JSON</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form Penambahan Modul Baharu (As Explicitly Requested) */}
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-5 border-orange-200/60">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Plus className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Borang Input Moden: Tambah Fail / Modul Baharu
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Gunakan borang ini untuk menambah modul, pautan URL page, ikon Lucide dan warna latar khas pada grid utama.
            </p>

            <form onSubmit={handleSaveNewModule} className="space-y-4 text-xs">
              {/* Nama App */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama App / Modul (Title)
                </label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Contoh: Modul Bimbingan Guru j-QAF"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Huraian */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Huraian Ringkas Modul
                </label>
                <input
                  type="text"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Huraian ringkas peranan modul ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Pautan URL / Page ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Pautan URL / Page ID
                  </label>
                  <select
                    value={moduleForm.pageId}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, pageId: e.target.value as PageId })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    <option value="dashboard">Dashboard Utama</option>
                    <option value="status-pelaporan">Status Pelaporan Sekolah</option>
                    <option value="graf-tasmik">Graf & Analisis Tasmik (KPI 95%)</option>
                    <option value="borang-input">Borang Input Sekolah</option>
                    <option value="takwim">Takwim Unit Pendidikan Islam</option>
                    <option value="pegawai">Barisan Pegawai UPI</option>
                    <option value="senarai-guru">Senarai Guru Tasmik & GPI</option>
                    <option value="dokumen-pdf">Pusat Dokumen & PDF</option>
                    <option value="tetapan">Pengurusan Dashboard & Tetapan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Teks Lencana (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={moduleForm.badgeText || ''}
                    onChange={(e) => setModuleForm({ ...moduleForm, badgeText: e.target.value })}
                    placeholder="Contoh: Terkini / Rasmi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Icon Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Ikon (Lucide Icon Name)
                </label>
                <input
                  type="text"
                  required
                  value={moduleForm.iconName}
                  onChange={(e) => setModuleForm({ ...moduleForm, iconName: e.target.value })}
                  placeholder="Contoh: CalendarDays, FileText, Award"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Cadangan ikon:</span>
                  {iconSuggestions.slice(0, 8).map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setModuleForm({ ...moduleForm, iconName: ico })}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 cursor-pointer"
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              {/* Susunan & Warna Latar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Susunan (Order Position)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={moduleForm.order}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Warna Latar / Aksen
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={moduleForm.accentColor}
                      onChange={(e) => setModuleForm({ ...moduleForm, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={moduleForm.accentColor}
                      onChange={(e) => setModuleForm({ ...moduleForm, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Color chips */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Palet Pilihan:</span>
                {colorSuggestions.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setModuleForm({ ...moduleForm, accentColor: c })}
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded-full border border-white shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    title={c}
                  />
                ))}
              </div>

              {/* Preview Chip */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: `${moduleForm.accentColor}18`,
                    color: moduleForm.accentColor
                  }}
                >
                  <DynamicIcon name={moduleForm.iconName} className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {moduleForm.title || 'Pratonton Modul'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {moduleForm.description || 'Pautan: ' + moduleForm.pageId}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Tambah Modul Baharu</span>
              </button>
            </form>
          </div>

          {/* Existing Modules Management */}
          <div className="apple-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Senarai Modul Aktif ({modules.length})
              </h3>
              <span className="text-[11px] text-slate-400">Boleh dipadam / diurus</span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${m.accentColor}20`,
                        color: m.accentColor
                      }}
                    >
                      <DynamicIcon name={m.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{m.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        #{m.order} • {m.pageId}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Padam modul "${m.title}"?`)) {
                        onDeleteModule(m.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Padam Modul"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Supabase Configuration & Vercel Deployment & SQL Migration */}
        <div className="space-y-6">
          {/* Supabase Connection Config */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-5 border-emerald-200/60">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Konfigurasi Pangkalan Data Supabase
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  supabaseConfig.isConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {supabaseConfig.isConnected ? 'Bersambung' : 'Mod Tempatan'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Web app ini bersedia untuk digunakan secara terus sama ada menggunakan storan tempatan (local storage) atau bersambung terus dengan projek Supabase anda di Vercel.
            </p>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-xs"
                />
              </div>

              {configStatusMessage && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
                  {configStatusMessage}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isTestingConnection}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isTestingConnection ? 'Mengesahkan...' : 'Sahkan & Simpan Sambungan'}</span>
                </button>
              </div>
            </form>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block">
                🚀 Panduan Deploy ke Vercel:
              </span>
              <p className="text-[11px] leading-relaxed">
                Tetapkan Environment Variables berikut dalam Settings projek Vercel anda:
              </p>
              <div className="bg-blue-950 text-blue-200 p-2.5 rounded-xl font-mono text-[10px] space-y-1 border border-blue-900">
                <div>VITE_SUPABASE_URL=https://projek-anda.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=kunci-anon-anda</div>
              </div>
            </div>
          </div>

          {/* SQL Migration Script Generator & 1-Click Copy */}
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Skrip SQL Supabase (1-Klik Salin)
                </h3>
              </div>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Disalin!' : 'Salin Skrip SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Jalankan skrip ini dalam <b>Supabase SQL Editor</b> untuk membina semua 6 jadual rasmi (tasmik_records, upi_officers, upi_takwim, guru_tasmik, tasmik_documents, dashboard_modules) berserta polisi keselamatan RLS.
            </p>

            <div className="bg-blue-950 text-blue-200 p-3.5 rounded-2xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed border border-blue-900">
              <pre>{supabaseService.getSqlMigrationSchema()}</pre>
            </div>
          </div>

          {/* Database Backup & Reset Tools */}
          <div className="apple-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Sandaran Data & Pemulihan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Import Fail JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetDefaults}
                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>Kembalikan Default</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
