export type PageId =
  | 'dashboard'
  | 'status-pelaporan'
  | 'graf-tasmik'
  | 'borang-input'
  | 'takwim'
  | 'pegawai'
  | 'senarai-guru'
  | 'dokumen-pdf'
  | 'tetapan'
  | 'rekalibrasi'
  | 'kpi-jqaf'
  | 'intervensi';

export type SubmissionStatus = 'Selesai' | 'Dalam Proses' | 'Belum Hantar';

export interface YearClassData {
  kelas: string; // 'Tahun 1' | 'Tahun 2' | 'Tahun 3' | 'Tahun 4' | 'Tahun 5' | 'Tahun 6'
  bilMurid: number;
  i1: number;
  i2: number;
  i3: number;
  i4: number;
  i5: number;
  i6: number;
  juz1_5: number;
  juz6_10: number;
  juz11_15: number;
  juz16_20: number;
  juz21_25: number;
  juz26_30: number;
  khatam: number;
}

export interface TasmikSchoolRecord {
  id: string;
  schoolCode: string;
  schoolName: string;
  zone?: string;
  totalStudents: number;
  
  // Iqra breakdown
  iqra1: number;
  iqra2: number;
  iqra3: number;
  iqra4: number;
  iqra5_6: number; // Iqra 5 dan 6

  // Al-Quran Juz breakdown
  juz1_5: number;   // juz 1 hingga 5
  juz6_10: number;  // juz 6 hingga 10
  juz11_15: number; // juz 11 hingga 15
  juz16_20: number; // juz 16 hingga 20
  juz21_25: number; // juz 21 hingga 25
  juz26_30: number; // juz 26 hingga 30

  // Khatam
  khatam: number;

  // Breakdown mengikut kelas (Tahun 1 hingga Tahun 6) tepat seperti PDF Tapak Rekalibrasi j-QAF
  classBreakdown?: YearClassData[];

  // Integrasi Google Spreadsheet & Auto-Sync
  spreadsheetUrl?: string;
  sheetGid?: string;
  syncStatus?: 'Synced' | 'Error' | 'Tiada Pautan' | 'Sedang Sinkron';
  lastSyncedAt?: string;
  syncedStudentCount?: number;
  syncError?: string;

  submissionStatus: SubmissionStatus;
  lastUpdated: string;
  submittedBy: string;
  phoneContact?: string;
  notes?: string;
}

export interface AutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 5, 15, 30, 60
  lastSyncTimestamp?: string;
  syncOnLoad: boolean;
}

export interface Officer {
  id: string;
  name: string;
  designation: string;
  roleDescription: string;
  grade: string;
  sector: string;
  phone: string;
  email: string;
  avatarUrl: string;
  order: number;
}

export interface TakwimEvent {
  id: string;
  title: string;
  date: string;
  month: string;
  category: 'Tasmik' | 'j-QAF' | 'Dakwah' | 'Mesyuarat' | 'Bengkel' | 'Peperiksaan';
  venue: string;
  targetAudience: string;
  status: 'Akan Datang' | 'Selesai' | 'Tangguh';
  coordinator?: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  name: string;
  icNumber?: string;
  schoolName: string;
  grade: string;
  role: 'Guru Penyelaras Tasmik' | 'Guru Pendidikan Islam' | 'Guru j-QAF';
  phone: string;
  email: string;
  status: 'Aktif' | 'Cuti Belajar' | 'Pertukaran';
}

export interface DocumentPdf {
  id: string;
  title: string;
  category: 'DSKP' | 'Modul Tasmik' | 'Pekeliling' | 'Buku Panduan' | 'Borang & Format';
  description: string;
  googleDriveEmbedUrl: string; // Preview URL suitable for <iframe>
  downloadUrl?: string;
  dateUpdated: string;
  fileSize?: string;
}

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  pageId: PageId;
  iconName: string;
  accentColor: string; // Tailwind color code or hex e.g. '#FF6B00', '#F59E0B'
  badgeText?: string;
  order: number;
  isActive: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastTested?: string;
}

export interface TasmikDistrictSummary {
  totalSchools: number;
  submittedSchools: number;
  inProgressSchools: number;
  pendingSchools: number;
  totalStudents: number;
  totalIqra: number;
  totalAlQuran: number;
  totalKhatam: number;
  khatamPercentage: number;
  onTrackPercentage: number;
  kpiTarget: number; // 95%
  isKpiAchieved: boolean;
}

export interface ClassCohortRecord {
  id: string;
  kelas: string; // 'Tahun 1' | 'Tahun 2' | 'Tahun 3' | 'Tahun 4' | 'Tahun 5'
  bilMurid: number;
  i1: number;
  i2: number;
  i3: number;
  i4: number;
  i5: number;
  i6: number;
  juz1_5: number;
  juz6_10: number;
  juz11_15: number;
  juz16_20: number;
  juz21_25: number;
  juz26_30: number;
  khatam: number;
}

export interface ModelLevelTarget {
  kebolehbacaan?: number;
  khatam?: number;
  peratus?: number;
  gredA?: number;
  modelAlQuran?: number;
  value?: number;
}

export interface JqafModelKpi {
  id: string;
  name: string;
  badge: string;
  iconName: string;
  description: string;
  currentScore?: number;
  kebangsaan: ModelLevelTarget;
  negeri: ModelLevelTarget;
  ppd: ModelLevelTarget;
}

export interface IntervensiProgram {
  id: string;
  category: 'IQRA 1-3' | 'IQRA 4-6' | 'JUZ 11-30';
  isu: string;
  programIntervensi: string;
  sasaran: string;
  tempoh: string;
  status: 'Selesai' | 'Dalam Pelaksanaan' | 'Perancangan';
  pegawaiPenyelaras: string;
}

export interface SekolahFokus {
  id: string;
  schoolName: string;
  schoolCode: string;
  zone?: string;
  fokusIsu: string;
  tindakanIntervensi: string;
  tarikhBimbingan: string;
  pegawaiBimbingan: string;
  statusTindakan: 'Selesai Dilawati' | 'Akan Dilawati' | 'Dalam Tindakan' | 'Selesai Bimbingan' | 'Dalam Pemantauan';
}
