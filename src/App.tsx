import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  PageId,
  TasmikSchoolRecord,
  Officer,
  TakwimEvent,
  Teacher,
  DocumentPdf,
  DashboardModule,
  SupabaseConfig,
  TasmikDistrictSummary,
  AutoSyncConfig,
  ClassCohortRecord,
  JqafModelKpi,
  IntervensiProgram,
  SekolahFokus
} from './types';
import { supabaseService } from './services/supabaseClient';
import {
  loadAutoSyncConfig,
  saveAutoSyncConfig,
  syncAllSchools,
  syncSingleSchool,
  SyncProgressUpdate
} from './services/sheetSyncService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SyncStatusModal } from './components/SyncStatusModal';

// Pages
import { DashboardHome } from './pages/DashboardHome';
import { StatusPelaporanPage } from './pages/StatusPelaporanPage';
import { GrafTasmikPage } from './pages/GrafTasmikPage';
import { BorangInputDataPage } from './pages/BorangInputDataPage';
import { TakwimPage } from './pages/TakwimPage';
import { PegawaiPage } from './pages/PegawaiPage';
import { SenaraiGuruPage } from './pages/SenaraiGuruPage';
import { DokumenPdfPage } from './pages/DokumenPdfPage';
import { TetapanPengurusanPage } from './pages/TetapanPengurusanPage';
import { RekalibrasiPage } from './pages/RekalibrasiPage';
import { KpiJqafPage } from './pages/KpiJqafPage';
import { IntervensiPage } from './pages/IntervensiPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isPending, startTransition] = useTransition();

  // App State
  const [schools, setSchools] = useState<TasmikSchoolRecord[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [takwim, setTakwim] = useState<TakwimEvent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [documents, setDocuments] = useState<DocumentPdf[]>([]);
  const [modules, setModules] = useState<DashboardModule[]>([]);
  const [cohorts, setCohorts] = useState<ClassCohortRecord[]>([]);
  const [jqafModels, setJqafModels] = useState<JqafModelKpi[]>([]);
  const [intervensiList, setIntervensiList] = useState<IntervensiProgram[]>([]);
  const [sekolahFokusList, setSekolahFokusList] = useState<SekolahFokus[]>([]);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(supabaseService.getConfig());
  const [isLoading, setIsLoading] = useState(true);

  // Auto-Sync Google Sheets State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressUpdate | null>(null);
  const [autoSyncConfig, setAutoSyncConfig] = useState<AutoSyncConfig>(loadAutoSyncConfig());

  // Initial Data Fetch
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        schs,
        offs,
        tkws,
        tchs,
        docs,
        mods,
        cohs,
        models,
        interv,
        fokus
      ] = await Promise.all([
        supabaseService.getSchools(),
        supabaseService.getOfficers(),
        supabaseService.getTakwim(),
        supabaseService.getTeachers(),
        supabaseService.getDocuments(),
        supabaseService.getModules(),
        supabaseService.getCohorts(),
        supabaseService.getJqafModels(),
        supabaseService.getIntervensi(),
        supabaseService.getSekolahFokus()
      ]);
      setSchools(schs);
      setOfficers(offs);
      setTakwim(tkws);
      setTeachers(tchs);
      setDocuments(docs);
      setModules(mods);
      setCohorts(cohs);
      setJqafModels(models);
      setIntervensiList(interv);
      setSekolahFokusList(fokus);
      setSupabaseConfig(supabaseService.getConfig());
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute District Summary
  const summary: TasmikDistrictSummary = supabaseService.calculateDistrictSummary(schools);

  // Smooth Navigation Handler
  const handleNavigate = (page: PageId) => {
    startTransition(() => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // --- GOOGLE SHEETS LIVE SYNC HANDLERS ---
  const handleTriggerSyncAll = useCallback(async () => {
    if (isSyncing || schools.length === 0) return;
    setIsSyncing(true);
    try {
      const updated = await syncAllSchools(schools, (progress) => {
        setSyncProgress(progress);
      });
      setSchools(updated);
      await supabaseService.saveSchoolsBatch(updated);
      const newConfig: AutoSyncConfig = {
        ...autoSyncConfig,
        lastSyncTimestamp: new Date().toISOString()
      };
      setAutoSyncConfig(newConfig);
      saveAutoSyncConfig(newConfig);
    } catch (err) {
      console.error('Ralat ketika menjalankan auto-sync semua sekolah:', err);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress(null), 3000);
    }
  }, [isSyncing, schools, autoSyncConfig]);

  const handleTriggerSyncSingle = async (targetSchool: TasmikSchoolRecord) => {
    try {
      const updated = await syncSingleSchool(targetSchool);
      await handleSaveSchool(updated);
    } catch (err) {
      console.error('Ralat ketika menyinkronkan sekolah:', err);
    }
  };

  const handleUpdateAutoSyncConfig = (config: AutoSyncConfig) => {
    setAutoSyncConfig(config);
    saveAutoSyncConfig(config);
  };

  // Setup periodic background auto-sync timer
  useEffect(() => {
    if (!autoSyncConfig.enabled || autoSyncConfig.intervalMinutes <= 0) return;

    const intervalMs = autoSyncConfig.intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      console.info('Auto-sync berkala sedang dijalankan...');
      handleTriggerSyncAll();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoSyncConfig.enabled, autoSyncConfig.intervalMinutes, handleTriggerSyncAll]);

  // Listener for custom sync event
  useEffect(() => {
    const handleCustomSyncEvent = () => {
      supabaseService.getSchools().then((refreshed) => {
        setSchools(refreshed);
      });
    };
    window.addEventListener('tasmik:schools-synced', handleCustomSyncEvent);
    return () => window.removeEventListener('tasmik:schools-synced', handleCustomSyncEvent);
  }, []);

  // --- CRUD Handlers ---
  const handleSaveSchool = async (record: TasmikSchoolRecord) => {
    const saved = await supabaseService.saveSchool(record);
    setSchools((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteSchool = async (id: string) => {
    await supabaseService.deleteSchool(id);
    setSchools((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveCohort = async (cohort: ClassCohortRecord) => {
    const saved = await supabaseService.saveCohort(cohort);
    setCohorts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleSaveIntervensi = async (item: IntervensiProgram) => {
    const saved = await supabaseService.saveIntervensi(item);
    setIntervensiList((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteIntervensi = async (id: string) => {
    await supabaseService.deleteIntervensi(id);
    setIntervensiList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveSekolahFokus = async (item: SekolahFokus) => {
    const saved = await supabaseService.saveSekolahFokus(item);
    setSekolahFokusList((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteSekolahFokus = async (id: string) => {
    await supabaseService.deleteSekolahFokus(id);
    setSekolahFokusList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveOfficer = async (officer: Officer) => {
    const saved = await supabaseService.saveOfficer(officer);
    setOfficers((prev) => {
      const idx = prev.findIndex((o) => o.id === saved.id);
      let next: Officer[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [...prev, saved];
      }
      return next.sort((a, b) => a.order - b.order);
    });
  };

  const handleDeleteOfficer = async (id: string) => {
    await supabaseService.deleteOfficer(id);
    setOfficers((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSaveTakwim = async (event: TakwimEvent) => {
    const saved = await supabaseService.saveTakwim(event);
    setTakwim((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTakwim = async (id: string) => {
    await supabaseService.deleteTakwim(id);
    setTakwim((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTeacher = async (teacher: Teacher) => {
    const saved = await supabaseService.saveTeacher(teacher);
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTeacher = async (id: string) => {
    await supabaseService.deleteTeacher(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveDocument = async (doc: DocumentPdf) => {
    const saved = await supabaseService.saveDocument(doc);
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteDocument = async (id: string) => {
    await supabaseService.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveModule = async (module: DashboardModule) => {
    const saved = await supabaseService.saveModule(module);
    setModules((prev) => {
      const idx = prev.findIndex((m) => m.id === saved.id);
      let next: DashboardModule[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [...prev, saved];
      }
      return next.sort((a, b) => a.order - b.order);
    });
  };

  const handleDeleteModule = async (id: string) => {
    await supabaseService.deleteModule(id);
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const syncedCount = schools.filter((s) => s.syncStatus === 'Synced').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isSupabaseConnected={supabaseConfig.isConnected}
        onOpenSettings={() => handleNavigate('tetapan')}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={isSyncing}
        syncedCount={syncedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Memuatkan data Tasmik PPD Penampang & Google Sheets...</p>
          </div>
        ) : (
          <>
            {currentPage === 'dashboard' && (
              <DashboardHome
                schools={schools}
                officers={officers}
                takwim={takwim}
                modules={modules}
                summary={summary}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'status-pelaporan' && (
              <StatusPelaporanPage
                schools={schools}
                onSaveSchool={handleSaveSchool}
                onDeleteSchool={handleDeleteSchool}
                onNavigateToInput={() => handleNavigate('borang-input')}
                onOpenSyncModal={() => setIsSyncModalOpen(true)}
                isSyncing={isSyncing}
              />
            )}

            {currentPage === 'graf-tasmik' && (
              <GrafTasmikPage
                schools={schools}
                summary={summary}
                onSaveSchool={handleSaveSchool}
                onSyncSchool={handleTriggerSyncSingle}
              />
            )}

            {currentPage === 'borang-input' && (
              <BorangInputDataPage
                schools={schools}
                onSaveSchool={handleSaveSchool}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'takwim' && (
              <TakwimPage
                takwim={takwim}
                onSaveTakwim={handleSaveTakwim}
                onDeleteTakwim={handleDeleteTakwim}
              />
            )}

            {currentPage === 'pegawai' && (
              <PegawaiPage
                officers={officers}
                onSaveOfficer={handleSaveOfficer}
                onDeleteOfficer={handleDeleteOfficer}
              />
            )}

            {currentPage === 'senarai-guru' && (
              <SenaraiGuruPage
                teachers={teachers}
                schools={schools}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}

            {currentPage === 'dokumen-pdf' && (
              <DokumenPdfPage
                documents={documents}
                onSaveDocument={handleSaveDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            )}

            {currentPage === 'tetapan' && (
              <TetapanPengurusanPage
                modules={modules}
                onSaveModule={handleSaveModule}
                onDeleteModule={handleDeleteModule}
                supabaseConfig={supabaseConfig}
                onRefreshData={loadAllData}
              />
            )}

            {currentPage === 'rekalibrasi' && (
              <RekalibrasiPage
                cohorts={cohorts}
                schools={schools}
                onSaveCohort={handleSaveCohort}
                onSaveSchool={handleSaveSchool}
                onSyncSchool={handleTriggerSyncSingle}
                onNavigateToKpi={() => handleNavigate('kpi-jqaf')}
                onNavigateToIntervensi={() => handleNavigate('intervensi')}
              />
            )}

            {currentPage === 'kpi-jqaf' && (
              <KpiJqafPage
                models={jqafModels}
                onNavigateToRekalibrasi={() => handleNavigate('rekalibrasi')}
              />
            )}

            {currentPage === 'intervensi' && (
              <IntervensiPage
                intervensiList={intervensiList}
                sekolahFokusList={sekolahFokusList}
                schools={schools}
                onSaveIntervensi={handleSaveIntervensi}
                onDeleteIntervensi={handleDeleteIntervensi}
                onSaveSekolahFokus={handleSaveSekolahFokus}
                onDeleteSekolahFokus={handleDeleteSekolahFokus}
              />
            )}
          </>
        )}
      </main>

      {/* Sync Status & Auto-Sync Configuration Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        schools={schools}
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        autoSyncConfig={autoSyncConfig}
        onUpdateAutoSyncConfig={handleUpdateAutoSyncConfig}
        onTriggerSyncAll={handleTriggerSyncAll}
        onTriggerSyncSingle={handleTriggerSyncSingle}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
