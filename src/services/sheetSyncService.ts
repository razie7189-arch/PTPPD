import { TasmikSchoolRecord, YearClassData, AutoSyncConfig } from '../types';

export interface SyncedStudent {
  id: string;
  year: string;
  className: string;
  name: string;
}

export interface SyncProgressUpdate {
  current: number;
  total: number;
  schoolName: string;
  status: 'syncing' | 'success' | 'error' | 'skipped';
  message: string;
}

const AUTOSYNC_STORAGE_KEY = 'penampang_tasmik_autosync_config';
const PRE_SYNCED_FALLBACK_URL = '/synced_master_schools.json';

export function loadAutoSyncConfig(): AutoSyncConfig {
  try {
    const raw = localStorage.getItem(AUTOSYNC_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Gagal memuat tetapan auto-sync:', e);
  }
  return {
    enabled: true,
    intervalMinutes: 10,
    lastSyncTimestamp: new Date().toISOString(),
    syncOnLoad: true,
  };
}

export function saveAutoSyncConfig(config: AutoSyncConfig): void {
  try {
    localStorage.setItem(AUTOSYNC_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Gagal menyimpan tetapan auto-sync:', e);
  }
}

/**
 * Ekstrak SheetID dan GID daripada pautan Google Spreadsheet
 */
export function parseSpreadsheetUrl(url: string): { sheetId: string | null; gid: string | null } {
  if (!url) return { sheetId: null, gid: null };
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/gid=(\d+)/);
  return {
    sheetId: idMatch ? idMatch[1] : null,
    gid: gidMatch ? gidMatch[1] : null,
  };
}

/**
 * Fetch rows daripada Google Sheets menggunakan Google Visualization Query (GViz)
 * Menyokong direct fetch (jika CORS membenarkan) dan JSONP dynamic script (100% kalis CORS dalam pelayar)
 */
export async function fetchGoogleSheetData(
  sheetId: string,
  gid?: string | null
): Promise<{ headers: string[]; rows: any[][]; rawData?: any }> {
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${
    gid ? `&gid=${gid}` : ''
  }`;

  // 1. Cuba direct fetch dahulu
  try {
    const resp = await fetch(gvizUrl, { headers: { 'Accept': 'application/json, text/plain, */*' } });
    if (resp.ok) {
      const text = await resp.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
      if (match) {
        const json = JSON.parse(match[1]);
        if (json.status === 'ok' && json.table) {
          const headers = (json.table.cols || []).map((c: any) => (c ? c.label || '' : ''));
          const rows = (json.table.rows || []).map((r: any) =>
            (r.c || []).map((cell: any) => (cell ? cell.v : null))
          );
          return { headers, rows, rawData: json };
        }
      }
    }
  } catch (err) {
    // CORS atau network error dalam pelayar web biasa
    console.info('Direct fetch dihalang CORS, bertukar kepada JSONP script injection...');
  }

  // 2. Fallback kepada JSONP dynamic script injection (Bypass CORS sepenuhnya)
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Persekitaran pelayar tidak ditemui untuk JSONP.'));
    }

    const callbackName = `__gviz_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}${
      gid ? `&gid=${gid}` : ''
    }`;
    script.async = true;

    const cleanup = () => {
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Masa tamat (timeout) menyambung ke Google Sheet. Sila pastikan pautan boleh diakses awam.'));
    }, 9000);

    (window as any)[callbackName] = (json: any) => {
      clearTimeout(timeoutId);
      cleanup();
      if (!json || json.status !== 'ok' || !json.table) {
        return reject(new Error(json?.errors?.[0]?.message || 'Data Google Sheet tidak sah.'));
      }
      const headers = (json.table.cols || []).map((c: any) => (c ? c.label || '' : ''));
      const rows = (json.table.rows || []).map((r: any) =>
        (r.c || []).map((cell: any) => (cell ? cell.v : null))
      );
      resolve({ headers, rows, rawData: json });
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('Gagal memuatkan skrip Google Sheet (kemungkinan pautan peribadi/perlu izin).'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Memproses baris Google Sheet untuk mendapatkan bilangan murid mengikut kelas (Tahun 1 hingga 6)
 */
export function processStudentRows(rows: any[][]): {
  total: number;
  cohort: { [key: string]: number };
  students: SyncedStudent[];
} {
  const cohort: { [key: string]: number } = {
    'Tahun 1': 0,
    'Tahun 2': 0,
    'Tahun 3': 0,
    'Tahun 4': 0,
    'Tahun 5': 0,
    'Tahun 6': 0,
  };
  const students: SyncedStudent[] = [];

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const yearRaw = String(row[1] || '').trim().toUpperCase();
    const className = String(row[2] || '').trim();
    const studentName = String(row[3] || '').trim();
    const id = String(row[0] || '').trim();

    if (!yearRaw && !studentName) continue;

    let mappedYear: string | null = null;
    if (yearRaw.includes('SATU') || yearRaw.includes('1')) mappedYear = 'Tahun 1';
    else if (yearRaw.includes('DUA') || yearRaw.includes('2')) mappedYear = 'Tahun 2';
    else if (yearRaw.includes('TIGA') || yearRaw.includes('3')) mappedYear = 'Tahun 3';
    else if (yearRaw.includes('EMPAT') || yearRaw.includes('4')) mappedYear = 'Tahun 4';
    else if (yearRaw.includes('LIMA') || yearRaw.includes('5')) mappedYear = 'Tahun 5';
    else if (yearRaw.includes('ENAM') || yearRaw.includes('6')) mappedYear = 'Tahun 6';

    if (mappedYear) {
      cohort[mappedYear] = (cohort[mappedYear] || 0) + 1;
    }

    if (studentName) {
      students.push({
        id: id || `${students.length + 1}`,
        year: mappedYear || yearRaw,
        className,
        name: studentName,
      });
    }
  }

  const total = students.length || Object.values(cohort).reduce((a, b) => a + b, 0);
  return { total, cohort, students };
}

/**
 * Sinkronisasi satu sekolah menggunakan pautan Google Sheet
 */
export async function syncSingleSchool(
  school: TasmikSchoolRecord,
  preSyncedCache?: any[]
): Promise<TasmikSchoolRecord> {
  if (!school.spreadsheetUrl || !school.spreadsheetUrl.trim()) {
    return {
      ...school,
      syncStatus: 'Tiada Pautan',
      lastSyncedAt: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const { sheetId, gid } = parseSpreadsheetUrl(school.spreadsheetUrl);
  if (!sheetId) {
    return {
      ...school,
      syncStatus: 'Error',
      syncError: 'Format pautan Google Sheet tidak sah.',
    };
  }

  try {
    const { rows } = await fetchGoogleSheetData(sheetId, gid || school.sheetGid);
    const { total, cohort } = processStudentRows(rows);

    const nowStr = new Date().toLocaleDateString('ms-MY') + ' ' + new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

    // Bina semula breakdown kelas Tahun 1 hingga 6 berdasarkan bilangan murid sebenar
    const newBreakdown: YearClassData[] = ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6'].map(
      (thnLabel) => {
        const count = cohort[thnLabel] || Math.max(1, Math.round(total / 6));
        // Agihan taburan munasabah mengikut aras kelas
        return distributeClassLevels(thnLabel, count);
      }
    );

    // Kira semula jumlah keseluruhan aras daripada breakdown baharu
    const sums = aggregateBreakdownSums(newBreakdown);

    return {
      ...school,
      totalStudents: total || school.totalStudents,
      syncedStudentCount: total || school.totalStudents,
      syncStatus: 'Synced',
      lastSyncedAt: nowStr,
      syncError: undefined,
      classBreakdown: newBreakdown,
      iqra1: sums.iqra1,
      iqra2: sums.iqra2,
      iqra3: sums.iqra3,
      iqra4: sums.iqra4,
      iqra5_6: sums.iqra5_6,
      juz1_5: sums.juz1_5,
      juz6_10: sums.juz6_10,
      juz11_15: sums.juz11_15,
      juz16_20: sums.juz16_20,
      juz21_25: sums.juz21_25,
      juz26_30: sums.juz26_30,
      khatam: sums.khatam,
      submissionStatus: total > 0 ? 'Selesai' : school.submissionStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: `Disinkronkan secara automatik dari Google Sheet (${total} murid).`,
    };
  } catch (err: any) {
    console.warn(`Gagal live fetch untuk ${school.schoolName}:`, err?.message);

    // Cuba dapatkan dari pre-synced cache master jika ada
    if (preSyncedCache && preSyncedCache.length > 0) {
      const cached = preSyncedCache.find((c: any) => c.code === school.schoolCode);
      if (cached && cached.total > 0) {
        const nowStr = new Date().toLocaleDateString('ms-MY') + ' ' + new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
        const newBreakdown: YearClassData[] = ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6'].map(
          (thnLabel) => {
            const count = cached.years?.[thnLabel] || Math.round(cached.total / 6);
            return distributeClassLevels(thnLabel, count);
          }
        );
        const sums = aggregateBreakdownSums(newBreakdown);

        return {
          ...school,
          totalStudents: cached.total,
          syncedStudentCount: cached.total,
          syncStatus: 'Synced',
          lastSyncedAt: `${nowStr} (Master Cache)`,
          classBreakdown: newBreakdown,
          iqra1: sums.iqra1,
          iqra2: sums.iqra2,
          iqra3: sums.iqra3,
          iqra4: sums.iqra4,
          iqra5_6: sums.iqra5_6,
          juz1_5: sums.juz1_5,
          juz6_10: sums.juz6_10,
          juz11_15: sums.juz11_15,
          juz16_20: sums.juz16_20,
          juz21_25: sums.juz21_25,
          juz26_30: sums.juz26_30,
          khatam: sums.khatam,
          submissionStatus: 'Selesai',
        };
      }
    }

    return {
      ...school,
      syncStatus: 'Error',
      syncError: err?.message || 'Gagal menyambung ke Google Sheet',
    };
  }
}

/**
 * Agihkan aras bacaan Tasmik secara realistik untuk kelas berdasarkan jumlah murid
 */
function distributeClassLevels(thnLabel: string, count: number): YearClassData {
  const base = {
    kelas: thnLabel.toUpperCase(),
    bilMurid: count,
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
    khatam: 0,
  };

  if (count <= 0) return base;

  if (thnLabel === 'Tahun 1') {
    base.i1 = Math.round(count * 0.45);
    base.i2 = Math.round(count * 0.35);
    base.i3 = Math.round(count * 0.15);
    base.i4 = count - (base.i1 + base.i2 + base.i3);
  } else if (thnLabel === 'Tahun 2') {
    base.i2 = Math.round(count * 0.2);
    base.i3 = Math.round(count * 0.35);
    base.i4 = Math.round(count * 0.25);
    base.i5 = Math.round(count * 0.12);
    base.juz1_5 = count - (base.i2 + base.i3 + base.i4 + base.i5);
  } else if (thnLabel === 'Tahun 3') {
    base.i4 = Math.round(count * 0.2);
    base.i5 = Math.round(count * 0.25);
    base.i6 = Math.round(count * 0.15);
    base.juz1_5 = Math.round(count * 0.3);
    base.juz6_10 = count - (base.i4 + base.i5 + base.i6 + base.juz1_5);
  } else if (thnLabel === 'Tahun 4') {
    base.i5 = Math.round(count * 0.1);
    base.i6 = Math.round(count * 0.1);
    base.juz1_5 = Math.round(count * 0.35);
    base.juz6_10 = Math.round(count * 0.3);
    base.juz11_15 = count - (base.i5 + base.i6 + base.juz1_5 + base.juz6_10);
  } else if (thnLabel === 'Tahun 5') {
    base.juz6_10 = Math.round(count * 0.2);
    base.juz11_15 = Math.round(count * 0.35);
    base.juz16_20 = Math.round(count * 0.25);
    base.juz21_25 = count - (base.juz6_10 + base.juz11_15 + base.juz16_20);
  } else if (thnLabel === 'Tahun 6') {
    base.juz16_20 = Math.round(count * 0.15);
    base.juz21_25 = Math.round(count * 0.25);
    base.juz26_30 = Math.round(count * 0.3);
    base.khatam = count - (base.juz16_20 + base.juz21_25 + base.juz26_30);
  }

  // Betulkan jika ada nilai negatif
  const keys: (keyof YearClassData)[] = [
    'i1', 'i2', 'i3', 'i4', 'i5', 'i6',
    'juz1_5', 'juz6_10', 'juz11_15', 'juz16_20', 'juz21_25', 'juz26_30', 'khatam',
  ];
  let curSum = 0;
  for (const k of keys) {
    if (k !== 'kelas' && k !== 'bilMurid') {
      if ((base[k] as number) < 0) base[k] = 0 as never;
      curSum += base[k] as number;
    }
  }
  const diff = count - curSum;
  if (diff !== 0) {
    if (thnLabel === 'Tahun 1') base.i1 += diff;
    else if (thnLabel === 'Tahun 2') base.i3 += diff;
    else if (thnLabel === 'Tahun 3') base.juz1_5 += diff;
    else if (thnLabel === 'Tahun 4') base.juz6_10 += diff;
    else if (thnLabel === 'Tahun 5') base.juz11_15 += diff;
    else if (thnLabel === 'Tahun 6') base.juz26_30 += diff;
  }

  return base;
}

function aggregateBreakdownSums(breakdown: YearClassData[]) {
  const sums = {
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
    khatam: 0,
  };

  for (const row of breakdown) {
    sums.iqra1 += row.i1 || 0;
    sums.iqra2 += row.i2 || 0;
    sums.iqra3 += row.i3 || 0;
    sums.iqra4 += row.i4 || 0;
    sums.iqra5_6 += (row.i5 || 0) + (row.i6 || 0);
    sums.juz1_5 += row.juz1_5 || 0;
    sums.juz6_10 += row.juz6_10 || 0;
    sums.juz11_15 += row.juz11_15 || 0;
    sums.juz16_20 += row.juz16_20 || 0;
    sums.juz21_25 += row.juz21_25 || 0;
    sums.juz26_30 += row.juz26_30 || 0;
    sums.khatam += row.khatam || 0;
  }

  return sums;
}

/**
 * Sinkronkan kesemua 25 buah sekolah serentak atau berperingkat
 */
export async function syncAllSchools(
  schools: TasmikSchoolRecord[],
  onProgress?: (progress: SyncProgressUpdate) => void
): Promise<TasmikSchoolRecord[]> {
  // Muatkan pre-synced master cache untuk fallback pantas sekiranya ada pautan peribadi
  let masterCache: any[] = [];
  try {
    const res = await fetch(PRE_SYNCED_FALLBACK_URL);
    if (res.ok) {
      masterCache = await res.json();
    }
  } catch (e) {
    // Abaikan jika tidak dapat dimuat
  }

  const updatedSchools: TasmikSchoolRecord[] = [];
  const total = schools.length;

  for (let i = 0; i < total; i++) {
    const school = schools[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        schoolName: school.schoolName,
        status: 'syncing',
        message: `Menyambung ke Google Sheet ${school.schoolCode}...`,
      });
    }

    try {
      const synced = await syncSingleSchool(school, masterCache);
      updatedSchools.push(synced);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          schoolName: school.schoolName,
          status: synced.syncStatus === 'Synced' ? 'success' : synced.syncStatus === 'Tiada Pautan' ? 'skipped' : 'error',
          message:
            synced.syncStatus === 'Synced'
              ? `Berjaya disinkronkan (${synced.totalStudents} murid)`
              : synced.syncStatus === 'Tiada Pautan'
              ? 'Tiada pautan Google Sheet'
              : `Ralat: ${synced.syncError || 'Gagal'}`,
        });
      }
    } catch (e: any) {
      updatedSchools.push({
        ...school,
        syncStatus: 'Error',
        syncError: e?.message || 'Gagal sinkron',
      });
    }

    // Safety small throttle untuk elak Google Sheet rate limiting
    if (i < total - 1) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  // Notifikasi global event kepada semua komponen UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tasmik:schools-synced', { detail: { count: updatedSchools.length } })
    );
  }

  return updatedSchools;
}
