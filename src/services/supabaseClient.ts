import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  TasmikSchoolRecord,
  Officer,
  TakwimEvent,
  Teacher,
  DocumentPdf,
  DashboardModule,
  SupabaseConfig,
  TasmikDistrictSummary,
  ClassCohortRecord,
  JqafModelKpi,
  IntervensiProgram,
  SekolahFokus
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_OFFICERS,
  INITIAL_TAKWIM,
  INITIAL_TEACHERS,
  INITIAL_DOCUMENTS,
  INITIAL_MODULES,
  INITIAL_COHORTS,
  INITIAL_JQAF_MODELS,
  INITIAL_INTERVENSI,
  INITIAL_SEKOLAH_FOKUS
} from '../data/initialData';

const CONFIG_STORAGE_KEY = 'penampang_supabase_config_v1';
const DATA_STORAGE_KEY_PREFIX = 'penampang_tasmik_';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    isConnected: false
  };

  constructor() {
    this.initClient();
  }

  public initClient() {
    // 1. Check environment variables (e.g. on Vercel deployment)
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

    // 2. Check localStorage saved configuration
    let savedConfig: Partial<SupabaseConfig> = {};
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        savedConfig = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse saved Supabase config:', e);
    }

    const activeUrl = savedConfig.url || envUrl;
    const activeKey = savedConfig.anonKey || envKey;

    if (activeUrl && activeKey && activeUrl.startsWith('http')) {
      try {
        this.client = createClient(activeUrl, activeKey);
        this.config = {
          url: activeUrl,
          anonKey: activeKey,
          isConnected: true,
          lastTested: new Date().toISOString()
        };
      } catch (err) {
        console.error('Supabase client initialization error:', err);
        this.client = null;
        this.config = {
          url: activeUrl,
          anonKey: activeKey,
          isConnected: false
        };
      }
    } else {
      this.client = null;
      this.config = {
        url: activeUrl || '',
        anonKey: activeKey || '',
        isConnected: false
      };
    }
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public async saveConfig(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      // Clear config
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      this.client = null;
      this.config = { url: '', anonKey: '', isConnected: false };
      return { success: true, message: 'Konfigurasi telah dikosongkan. Mod simpanan tempatan aktif.' };
    }

    try {
      const testClient = createClient(cleanUrl, cleanKey);
      // Attempt a lightweight test query
      const { error } = await testClient.from('tasmik_records').select('id').limit(1);

      // Even if table does not exist yet (relation does not exist), client credentials are verified if error code is 42P01 or similar schema code, not 401/403
      if (error && error.code !== '42P01') {
        // Still save if user wants, but warn
        console.warn('Supabase test returned message:', error.message);
      }

      this.client = testClient;
      this.config = {
        url: cleanUrl,
        anonKey: cleanKey,
        isConnected: true,
        lastTested: new Date().toISOString()
      };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));

      return {
        success: true,
        message: 'Sambungan Supabase berjaya disahkan & disimpan! Sedia untuk kegunaan Vercel.'
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Ralat mengesahkan sambungan Supabase: ${errorMsg}`
      };
    }
  }

  // Helper to get local item with fallback
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(DATA_STORAGE_KEY_PREFIX + key);
      if (val) {
        return JSON.parse(val);
      }
    } catch (e) {
      console.warn(`Error reading local storage for ${key}:`, e);
    }
    this.setLocal(key, fallback);
    return fallback;
  }

  private setLocal<T>(key: string, data: T): void {
    try {
      localStorage.setItem(DATA_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Error writing to local storage for ${key}:`, e);
    }
  }

  // --- SCHOOLS / TASMIK RECORDS CRUD ---
  public async getSchools(): Promise<TasmikSchoolRecord[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('tasmik_records')
          .select('*')
          .order('schoolName', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as TasmikSchoolRecord[];
        }
      } catch (e) {
        console.warn('Supabase getSchools failed, falling back to local data:', e);
      }
    }
    const local = this.getLocal<TasmikSchoolRecord[]>('schools', INITIAL_SCHOOLS);

    // Senarai 25 kod sekolah rasmi Daerah Penampang
    const officialCodes = new Set(INITIAL_SCHOOLS.map((s) => s.schoolCode));

    // Buang sekolah tidak sah (cth: SK Buayan, SK Koidupan, SR Pendidikan Khas Tuaran)
    // dan kemas kini nama, kod serta pautan Google Sheet terkini
    const existingMap = new Map<string, TasmikSchoolRecord>();
    (local || []).forEach((s) => {
      const fixedCode = s.schoolName?.toUpperCase().includes('TANSAU') ? 'XBA4109' : s.schoolCode;
      if (officialCodes.has(fixedCode)) {
        existingMap.set(fixedCode, { ...s, schoolCode: fixedCode });
      }
    });

    const reconciled: TasmikSchoolRecord[] = INITIAL_SCHOOLS.map((master) => {
      const existing = existingMap.get(master.schoolCode);
      if (existing) {
        return {
          ...existing,
          schoolCode: master.schoolCode,
          schoolName: master.schoolName,
          spreadsheetUrl: master.spreadsheetUrl,
          sheetGid: master.sheetGid,
          zone: undefined,
        };
      }
      return { ...master, zone: undefined };
    });

    this.setLocal('schools', reconciled);
    return reconciled;
  }

  public async saveSchoolsBatch(records: TasmikSchoolRecord[]): Promise<void> {
    this.setLocal('schools', records);
    if (this.client) {
      try {
        await this.client.from('tasmik_records').upsert(records);
      } catch (e) {
        console.warn('Supabase saveSchoolsBatch failed:', e);
      }
    }
  }

  public async saveSchool(record: TasmikSchoolRecord): Promise<TasmikSchoolRecord> {
    const list = await this.getSchools();
    const index = list.findIndex(s => s.id === record.id);
    let updatedList: TasmikSchoolRecord[];

    const recordWithTimestamp = {
      ...record,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = recordWithTimestamp;
    } else {
      updatedList = [recordWithTimestamp, ...list];
    }

    this.setLocal('schools', updatedList);

    if (this.client) {
      try {
        await this.client.from('tasmik_records').upsert(recordWithTimestamp);
      } catch (e) {
        console.warn('Supabase saveSchool error:', e);
      }
    }

    return recordWithTimestamp;
  }

  public async deleteSchool(id: string): Promise<boolean> {
    const list = await this.getSchools();
    const updated = list.filter(s => s.id !== id);
    this.setLocal('schools', updated);

    if (this.client) {
      try {
        await this.client.from('tasmik_records').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteSchool error:', e);
      }
    }
    return true;
  }

  // --- OFFICERS CRUD ---
  public async getOfficers(): Promise<Officer[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('upi_officers')
          .select('*')
          .order('order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Officer[];
        }
      } catch (e) {
        console.warn('Supabase getOfficers failed:', e);
      }
    }
    return this.getLocal<Officer[]>('officers', INITIAL_OFFICERS);
  }

  public async saveOfficer(officer: Officer): Promise<Officer> {
    const list = await this.getOfficers();
    const index = list.findIndex(o => o.id === officer.id);
    let updated: Officer[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = officer;
    } else {
      updated = [...list, officer];
    }
    updated.sort((a, b) => a.order - b.order);
    this.setLocal('officers', updated);

    if (this.client) {
      try {
        await this.client.from('upi_officers').upsert(officer);
      } catch (e) {
        console.warn('Supabase saveOfficer error:', e);
      }
    }
    return officer;
  }

  public async deleteOfficer(id: string): Promise<boolean> {
    const list = await this.getOfficers();
    const updated = list.filter(o => o.id !== id);
    this.setLocal('officers', updated);

    if (this.client) {
      try {
        await this.client.from('upi_officers').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteOfficer error:', e);
      }
    }
    return true;
  }

  // --- TAKWIM CRUD ---
  public async getTakwim(): Promise<TakwimEvent[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('upi_takwim').select('*');
        if (!error && data && data.length > 0) {
          return data as TakwimEvent[];
        }
      } catch (e) {
        console.warn('Supabase getTakwim failed:', e);
      }
    }
    return this.getLocal<TakwimEvent[]>('takwim', INITIAL_TAKWIM);
  }

  public async saveTakwim(event: TakwimEvent): Promise<TakwimEvent> {
    const list = await this.getTakwim();
    const index = list.findIndex(t => t.id === event.id);
    let updated: TakwimEvent[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = event;
    } else {
      updated = [event, ...list];
    }
    this.setLocal('takwim', updated);

    if (this.client) {
      try {
        await this.client.from('upi_takwim').upsert(event);
      } catch (e) {
        console.warn('Supabase saveTakwim error:', e);
      }
    }
    return event;
  }

  public async deleteTakwim(id: string): Promise<boolean> {
    const list = await this.getTakwim();
    const updated = list.filter(t => t.id !== id);
    this.setLocal('takwim', updated);

    if (this.client) {
      try {
        await this.client.from('upi_takwim').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTakwim error:', e);
      }
    }
    return true;
  }

  // --- TEACHERS CRUD ---
  public async getTeachers(): Promise<Teacher[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('guru_tasmik')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Teacher[];
        }
      } catch (e) {
        console.warn('Supabase getTeachers failed:', e);
      }
    }
    return this.getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
  }

  public async saveTeacher(teacher: Teacher): Promise<Teacher> {
    const list = await this.getTeachers();
    const index = list.findIndex(t => t.id === teacher.id);
    let updated: Teacher[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = teacher;
    } else {
      updated = [teacher, ...list];
    }
    this.setLocal('teachers', updated);

    if (this.client) {
      try {
        await this.client.from('guru_tasmik').upsert(teacher);
      } catch (e) {
        console.warn('Supabase saveTeacher error:', e);
      }
    }
    return teacher;
  }

  public async deleteTeacher(id: string): Promise<boolean> {
    const list = await this.getTeachers();
    const updated = list.filter(t => t.id !== id);
    this.setLocal('teachers', updated);

    if (this.client) {
      try {
        await this.client.from('guru_tasmik').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTeacher error:', e);
      }
    }
    return true;
  }

  // --- DOCUMENTS CRUD ---
  public async getDocuments(): Promise<DocumentPdf[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('tasmik_documents').select('*');
        if (!error && data && data.length > 0) {
          return data as DocumentPdf[];
        }
      } catch (e) {
        console.warn('Supabase getDocuments failed:', e);
      }
    }
    return this.getLocal<DocumentPdf[]>('documents', INITIAL_DOCUMENTS);
  }

  public async saveDocument(doc: DocumentPdf): Promise<DocumentPdf> {
    const list = await this.getDocuments();
    const index = list.findIndex(d => d.id === doc.id);
    let updated: DocumentPdf[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = doc;
    } else {
      updated = [doc, ...list];
    }
    this.setLocal('documents', updated);

    if (this.client) {
      try {
        await this.client.from('tasmik_documents').upsert(doc);
      } catch (e) {
        console.warn('Supabase saveDocument error:', e);
      }
    }
    return doc;
  }

  public async deleteDocument(id: string): Promise<boolean> {
    const list = await this.getDocuments();
    const updated = list.filter(d => d.id !== id);
    this.setLocal('documents', updated);

    if (this.client) {
      try {
        await this.client.from('tasmik_documents').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteDocument error:', e);
      }
    }
    return true;
  }

  // --- DASHBOARD MODULES CRUD ---
  public async getModules(): Promise<DashboardModule[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('dashboard_modules')
          .select('*')
          .order('order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as DashboardModule[];
        }
      } catch (e) {
        console.warn('Supabase getModules failed:', e);
      }
    }
    return this.getLocal<DashboardModule[]>('modules', INITIAL_MODULES);
  }

  public async saveModule(module: DashboardModule): Promise<DashboardModule> {
    const list = await this.getModules();
    const index = list.findIndex(m => m.id === module.id);
    let updated: DashboardModule[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = module;
    } else {
      updated = [...list, module];
    }
    updated.sort((a, b) => a.order - b.order);
    this.setLocal('modules', updated);

    if (this.client) {
      try {
        await this.client.from('dashboard_modules').upsert(module);
      } catch (e) {
        console.warn('Supabase saveModule error:', e);
      }
    }
    return module;
  }

  public async deleteModule(id: string): Promise<boolean> {
    const list = await this.getModules();
    const updated = list.filter(m => m.id !== id);
    this.setLocal('modules', updated);

    if (this.client) {
      try {
        await this.client.from('dashboard_modules').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteModule error:', e);
      }
    }
    return true;
  }

  // --- TAPAK REKALIBRASI ENROLMEN KELAS (TAHUN 1 - TAHUN 5) CRUD ---
  public async getCohorts(): Promise<ClassCohortRecord[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('jqaf_cohorts').select('*');
        if (!error && data && data.length > 0) {
          return data as ClassCohortRecord[];
        }
      } catch (e) {
        console.warn('Supabase getCohorts failed:', e);
      }
    }
    return this.getLocal<ClassCohortRecord[]>('cohorts', INITIAL_COHORTS);
  }

  public async saveCohort(cohort: ClassCohortRecord): Promise<ClassCohortRecord> {
    const list = await this.getCohorts();
    const index = list.findIndex(c => c.id === cohort.id || c.kelas === cohort.kelas);
    let updated: ClassCohortRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = cohort;
    } else {
      updated = [...list, cohort];
    }
    this.setLocal('cohorts', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_cohorts').upsert(cohort);
      } catch (e) {
        console.warn('Supabase saveCohort error:', e);
      }
    }
    return cohort;
  }

  // --- MODEL PROGRAM j-QAF (6 MODEL) CRUD ---
  public async getJqafModels(): Promise<JqafModelKpi[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('jqaf_models').select('*');
        if (!error && data && data.length > 0) {
          return data as JqafModelKpi[];
        }
      } catch (e) {
        console.warn('Supabase getJqafModels failed:', e);
      }
    }
    return this.getLocal<JqafModelKpi[]>('jqaf_models', INITIAL_JQAF_MODELS);
  }

  public async saveJqafModel(model: JqafModelKpi): Promise<JqafModelKpi> {
    const list = await this.getJqafModels();
    const index = list.findIndex(m => m.id === model.id);
    let updated: JqafModelKpi[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = model;
    } else {
      updated = [...list, model];
    }
    this.setLocal('jqaf_models', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_models').upsert(model);
      } catch (e) {
        console.warn('Supabase saveJqafModel error:', e);
      }
    }
    return model;
  }

  // --- ISU & PROGRAM INTERVENSI (IQRA 1-3, IQRA 4-6, JUZ 11-30) CRUD ---
  public async getIntervensi(): Promise<IntervensiProgram[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('jqaf_intervensi').select('*');
        if (!error && data && data.length > 0) {
          return data as IntervensiProgram[];
        }
      } catch (e) {
        console.warn('Supabase getIntervensi failed:', e);
      }
    }
    return this.getLocal<IntervensiProgram[]>('intervensi', INITIAL_INTERVENSI);
  }

  public async saveIntervensi(item: IntervensiProgram): Promise<IntervensiProgram> {
    const list = await this.getIntervensi();
    const index = list.findIndex(i => i.id === item.id);
    let updated: IntervensiProgram[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [item, ...list];
    }
    this.setLocal('intervensi', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_intervensi').upsert(item);
      } catch (e) {
        console.warn('Supabase saveIntervensi error:', e);
      }
    }
    return item;
  }

  public async deleteIntervensi(id: string): Promise<boolean> {
    const list = await this.getIntervensi();
    const updated = list.filter(i => i.id !== id);
    this.setLocal('intervensi', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_intervensi').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteIntervensi error:', e);
      }
    }
    return true;
  }

  // --- SENARAI SEKOLAH FOKUS TAHUN 2026 CRUD ---
  public async getSekolahFokus(): Promise<SekolahFokus[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('jqaf_sekolah_fokus').select('*');
        if (!error && data && data.length > 0) {
          return data as SekolahFokus[];
        }
      } catch (e) {
        console.warn('Supabase getSekolahFokus failed:', e);
      }
    }
    return this.getLocal<SekolahFokus[]>('sekolah_fokus', INITIAL_SEKOLAH_FOKUS);
  }

  public async saveSekolahFokus(item: SekolahFokus): Promise<SekolahFokus> {
    const list = await this.getSekolahFokus();
    const index = list.findIndex(s => s.id === item.id);
    let updated: SekolahFokus[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [item, ...list];
    }
    this.setLocal('sekolah_fokus', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_sekolah_fokus').upsert(item);
      } catch (e) {
        console.warn('Supabase saveSekolahFokus error:', e);
      }
    }
    return item;
  }

  public async deleteSekolahFokus(id: string): Promise<boolean> {
    const list = await this.getSekolahFokus();
    const updated = list.filter(s => s.id !== id);
    this.setLocal('sekolah_fokus', updated);
    if (this.client) {
      try {
        await this.client.from('jqaf_sekolah_fokus').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteSekolahFokus error:', e);
      }
    }
    return true;
  }

  // --- STATISTICAL SUMMARY CALCULATION ---
  public calculateDistrictSummary(schools: TasmikSchoolRecord[]): TasmikDistrictSummary {
    const totalSchools = schools.length;
    const submittedSchools = schools.filter(s => s.submissionStatus === 'Selesai').length;
    const inProgressSchools = schools.filter(s => s.submissionStatus === 'Dalam Proses').length;
    const pendingSchools = schools.filter(s => s.submissionStatus === 'Belum Hantar').length;

    let totalStudents = 0;
    let totalIqra = 0;
    let totalAlQuran = 0;
    let totalKhatam = 0;

    for (const s of schools) {
      totalStudents += s.totalStudents || 0;
      const iqraCount = (s.iqra1 || 0) + (s.iqra2 || 0) + (s.iqra3 || 0) + (s.iqra4 || 0) + (s.iqra5_6 || 0);
      const quranCount = (s.juz1_5 || 0) + (s.juz6_10 || 0) + (s.juz11_15 || 0) + (s.juz16_20 || 0) + (s.juz21_25 || 0) + (s.juz26_30 || 0);
      totalIqra += iqraCount;
      totalAlQuran += quranCount;
      totalKhatam += s.khatam || 0;
    }

    const khatamPercentage = totalStudents > 0 ? (totalKhatam / totalStudents) * 100 : 0;
    // KPI 95% indicates students either in Al-Quran (Juz 1-30) or Khatam, or reading with comprehension
    const onTrackStudents = totalAlQuran + totalKhatam;
    const onTrackPercentage = totalStudents > 0 ? (onTrackStudents / totalStudents) * 100 : 0;

    return {
      totalSchools,
      submittedSchools,
      inProgressSchools,
      pendingSchools,
      totalStudents,
      totalIqra,
      totalAlQuran,
      totalKhatam,
      khatamPercentage: Math.round(khatamPercentage * 10) / 10,
      onTrackPercentage: Math.round(onTrackPercentage * 10) / 10,
      kpiTarget: 95.0,
      isKpiAchieved: onTrackPercentage >= 95.0
    };
  }

  // --- SQL SCHEMA SCRIPT GENERATOR FOR SUPABASE SQL EDITOR ---
  public getSqlMigrationSchema(): string {
    return `-- ========================================================
-- SKRIP MIGRATION SUPABASE: PORTAL PELAPORAN TASMIK PENAMPANG
-- Sektor Pendidikan Islam, Pejabat Pendidikan Daerah Penampang
-- Jalankan skrip ini dalam Supabase Dashboard -> SQL Editor -> New Query
-- ========================================================

-- 1. Jadual Rekod Pelaporan Tasmik Sekolah (Termasuk Google Sheet Sync)
CREATE TABLE IF NOT EXISTS tasmik_records (
  id TEXT PRIMARY KEY,
  "schoolCode" TEXT NOT NULL UNIQUE,
  "schoolName" TEXT NOT NULL,
  "totalStudents" INTEGER NOT NULL DEFAULT 0,
  iqra1 INTEGER NOT NULL DEFAULT 0,
  iqra2 INTEGER NOT NULL DEFAULT 0,
  iqra3 INTEGER NOT NULL DEFAULT 0,
  iqra4 INTEGER NOT NULL DEFAULT 0,
  iqra5_6 INTEGER NOT NULL DEFAULT 0,
  juz1_5 INTEGER NOT NULL DEFAULT 0,
  juz6_10 INTEGER NOT NULL DEFAULT 0,
  juz11_15 INTEGER NOT NULL DEFAULT 0,
  juz16_20 INTEGER NOT NULL DEFAULT 0,
  juz21_25 INTEGER NOT NULL DEFAULT 0,
  juz26_30 INTEGER NOT NULL DEFAULT 0,
  khatam INTEGER NOT NULL DEFAULT 0,
  "submissionStatus" TEXT NOT NULL DEFAULT 'Selesai',
  "spreadsheetUrl" TEXT,
  "sheetGid" TEXT,
  "syncStatus" TEXT DEFAULT 'Tiada Pautan',
  "lastSyncedAt" TEXT,
  "syncedStudentCount" INTEGER DEFAULT 0,
  "classBreakdown" JSONB,
  "lastUpdated" TEXT NOT NULL,
  "submittedBy" TEXT NOT NULL,
  "phoneContact" TEXT,
  notes TEXT
);

-- 2. Jadual Pegawai Unit Pendidikan Islam PPD Penampang
CREATE TABLE IF NOT EXISTS upi_officers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  "roleDescription" TEXT NOT NULL,
  grade TEXT NOT NULL,
  sector TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  "avatarUrl" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1
);

-- 3. Jadual Takwim Unit Pendidikan Islam
CREATE TABLE IF NOT EXISTS upi_takwim (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  "targetAudience" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Akan Datang',
  coordinator TEXT,
  notes TEXT
);

-- 4. Jadual Senarai Guru Tasmik & Guru Pendidikan Islam (GPI)
CREATE TABLE IF NOT EXISTS guru_tasmik (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "icNumber" TEXT,
  "schoolName" TEXT NOT NULL,
  grade TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif'
);

-- 5. Jadual Dokumen PDF & Buku Panduan
CREATE TABLE IF NOT EXISTS tasmik_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  "googleDriveEmbedUrl" TEXT NOT NULL,
  "downloadUrl" TEXT,
  "dateUpdated" TEXT NOT NULL,
  "fileSize" TEXT
);

-- 6. Jadual Modul Dashboard Dinamik
CREATE TABLE IF NOT EXISTS dashboard_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "iconName" TEXT NOT NULL,
  "accentColor" TEXT NOT NULL,
  "badgeText" TEXT,
  "order" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- 7. Jadual Kohort Matriks Rekalibrasi Kelas (Tahun 1 - 6)
CREATE TABLE IF NOT EXISTS class_cohorts (
  id TEXT PRIMARY KEY,
  kelas TEXT NOT NULL,
  "bilMurid" INTEGER NOT NULL DEFAULT 0,
  i1 INTEGER NOT NULL DEFAULT 0,
  i2 INTEGER NOT NULL DEFAULT 0,
  i3 INTEGER NOT NULL DEFAULT 0,
  i4 INTEGER NOT NULL DEFAULT 0,
  i5 INTEGER NOT NULL DEFAULT 0,
  i6 INTEGER NOT NULL DEFAULT 0,
  juz1_5 INTEGER NOT NULL DEFAULT 0,
  juz6_10 INTEGER NOT NULL DEFAULT 0,
  juz11_15 INTEGER NOT NULL DEFAULT 0,
  juz16_20 INTEGER NOT NULL DEFAULT 0,
  juz21_25 INTEGER NOT NULL DEFAULT 0,
  juz26_30 INTEGER NOT NULL DEFAULT 0,
  khatam INTEGER NOT NULL DEFAULT 0
);

-- 8. Jadual KPI 6 Model Program j-QAF 2026
CREATE TABLE IF NOT EXISTS jqaf_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "kpiKebangsaan" NUMERIC NOT NULL,
  "kpiNegeri" NUMERIC NOT NULL,
  "kpiPpd" NUMERIC NOT NULL,
  "currentScore" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  target TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 9. Jadual Program Intervensi Tasmik
CREATE TABLE IF NOT EXISTS intervensi_programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  "targetGroup" TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  tempoh TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Perancangan',
  "pegawaiPenyelaras" TEXT NOT NULL
);

-- 10. Jadual Sekolah Fokus Bimbingan UPI PPD Penampang
CREATE TABLE IF NOT EXISTS sekolah_fokus (
  id TEXT PRIMARY KEY,
  "schoolName" TEXT NOT NULL,
  "schoolCode" TEXT NOT NULL,
  "fokusIsu" TEXT NOT NULL,
  "tindakanIntervensi" TEXT NOT NULL,
  "tarikhBimbingan" TEXT NOT NULL,
  "pegawaiBimbingan" TEXT NOT NULL,
  "statusTindakan" TEXT NOT NULL DEFAULT 'Akan Dilawati'
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) & POLISI AKSES AWAM WEB
-- ========================================================
ALTER TABLE tasmik_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_takwim ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru_tasmik ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasmik_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jqaf_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervensi_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah_fokus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses Awam Tasmik Records" ON tasmik_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam UPI Officers" ON upi_officers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam UPI Takwim" ON upi_takwim FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Guru Tasmik" ON guru_tasmik FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Tasmik Documents" ON tasmik_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Dashboard Modules" ON dashboard_modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Class Cohorts" ON class_cohorts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Jqaf Models" ON jqaf_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Intervensi Programs" ON intervensi_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Awam Sekolah Fokus" ON sekolah_fokus FOR ALL USING (true) WITH CHECK (true);

-- INDEXES UNTUK KELAJUAN AKSES SISTEM
CREATE INDEX IF NOT EXISTS idx_tasmik_school_code ON tasmik_records("schoolCode");
CREATE INDEX IF NOT EXISTS idx_guru_school_name ON guru_tasmik("schoolName");
CREATE INDEX IF NOT EXISTS idx_fokus_school_code ON sekolah_fokus("schoolCode");
`;
  }

  // --- BACKUP & RESTORE ---
  public exportDataJson(): string {
    const data = {
      schools: this.getLocal('schools', INITIAL_SCHOOLS),
      officers: this.getLocal('officers', INITIAL_OFFICERS),
      takwim: this.getLocal('takwim', INITIAL_TAKWIM),
      teachers: this.getLocal('teachers', INITIAL_TEACHERS),
      documents: this.getLocal('documents', INITIAL_DOCUMENTS),
      modules: this.getLocal('modules', INITIAL_MODULES),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  public importDataJson(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.schools) this.setLocal('schools', parsed.schools);
      if (parsed.officers) this.setLocal('officers', parsed.officers);
      if (parsed.takwim) this.setLocal('takwim', parsed.takwim);
      if (parsed.teachers) this.setLocal('teachers', parsed.teachers);
      if (parsed.documents) this.setLocal('documents', parsed.documents);
      if (parsed.modules) this.setLocal('modules', parsed.modules);
      return { success: true, message: 'Data berjaya dimuat naik dan dikemas kini!' };
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      return { success: false, message: `Format fail JSON tidak sah: ${errorMsg}` };
    }
  }

  public resetToDefaults(): void {
    this.setLocal('schools', INITIAL_SCHOOLS);
    this.setLocal('officers', INITIAL_OFFICERS);
    this.setLocal('takwim', INITIAL_TAKWIM);
    this.setLocal('teachers', INITIAL_TEACHERS);
    this.setLocal('documents', INITIAL_DOCUMENTS);
    this.setLocal('modules', INITIAL_MODULES);
  }
}

export const supabaseService = new SupabaseService();
