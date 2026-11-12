import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Menu,
  X,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  FileEdit,
  CalendarDays,
  Users,
  GraduationCap,
  FileText,
  Settings,
  Database,
  ExternalLink,
  Flame,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isSupabaseConnected: boolean;
  onOpenSettings: () => void;
  onOpenSyncModal?: () => void;
  isSyncing?: boolean;
  syncedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isSupabaseConnected,
  onOpenSettings,
  onOpenSyncModal,
  isSyncing = false,
  syncedCount = 25
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'rekalibrasi', label: 'Tapak Rekalibrasi', icon: <FileEdit className="w-4 h-4" />, badge: 'PDF' },
    { id: 'kpi-jqaf', label: 'KPI 6 Model', icon: <Award className="w-4 h-4" />, badge: '2026' },
    { id: 'intervensi', label: 'Isu & Intervensi', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'status-pelaporan', label: 'Status Pelaporan', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'graf-tasmik', label: 'Graf Analisis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'borang-input', label: 'Input Sekolah', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'takwim', label: 'Takwim UPI', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'pegawai', label: 'Barisan Pegawai', icon: <Users className="w-4 h-4" /> },
    { id: 'senarai-guru', label: 'Guru Tasmik', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'dokumen-pdf', label: 'Dokumen & PDF', icon: <FileText className="w-4 h-4" /> },
    { id: 'tetapan', label: 'Pengurusan', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top utility bar in Blue theme */}
      <div className="bg-blue-950 text-blue-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-blue-900/60 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white">Kementerian Pendidikan Malaysia</span>
          <span className="text-blue-400 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-blue-200">Jabatan Pendidikan Negeri Sabah</span>
          <span className="text-blue-400 hidden md:inline">•</span>
          <span className="hidden md:inline text-amber-300 font-medium">PPD Penampang</span>
          <span className="text-blue-400 hidden lg:inline">•</span>
          <span className="hidden lg:inline px-2 py-0.2 rounded bg-blue-900/80 text-[11px] font-bold text-amber-300 border border-blue-700/50">
            SPI ITQAN: menjana kualiti
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-semibold transition-all cursor-pointer"
              title="Status Penyelarasan Google Sheets (25 Sekolah)"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyinkron...' : `Auto-Sync: ${syncedCount}/25 Sekolah`}</span>
              <span className="sm:hidden">{isSyncing ? 'Sync...' : 'Auto-Sync'}</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-blue-200"
            title="Konfigurasi Supabase & Pangkalan Data"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden xs:inline">
              {isSupabaseConnected ? 'Supabase: Aktif' : 'Mod Simpanan Tempatan'}
            </span>
          </button>
          
          <div className="h-3 w-px bg-blue-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-1 text-orange-300 font-semibold bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-700/60">
            <Flame className="w-3 h-3 text-orange-400 animate-bounce" />
            <span>Sasaran KPI: 95%</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Portal Title */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-14 h-13 rounded-2xl bg-white border border-blue-200/80 p-1 flex items-center justify-center shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <img
                  src="/assets/aistudio/image_ec77c1d2.png"
                  alt="Logo Portal Pelaporan Tasmik"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-linear-to-r from-orange-500 to-amber-500 rounded-full p-0.5 shadow-xs">
                <Flame className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  Portal Pelaporan Tasmik
                </h1>
                <span className="bg-linear-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                  Daerah Penampang
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Unit Pendidikan Islam • Pejabat Pendidikan Daerah Penampang, Sabah
              </p>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {onOpenSyncModal && (
              <button
                onClick={onOpenSyncModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer"
                title="Penyelarasan Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Auto-Sync</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('borang-input')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-xs hover:shadow-orange-200 hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Input Data Sekolah</span>
            </button>
            <button
              onClick={() => onNavigate('tetapan')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Tetapan & Pengurusan Sistem"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('borang-input')}
              className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
              title="Input Data"
            >
              <FileEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-2.5 border-t border-slate-100 text-sm">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50/80'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigasi Utama
          </div>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-300' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-500" />
                <span>Tetapan Supabase & Pangkalan Data</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
