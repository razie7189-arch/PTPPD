import React, { useState, useMemo } from 'react';
import { TasmikSchoolRecord, SubmissionStatus } from '../types';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  School,
  X,
  Save,
  Check,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface StatusPelaporanPageProps {
  schools: TasmikSchoolRecord[];
  onSaveSchool: (record: TasmikSchoolRecord) => Promise<void>;
  onDeleteSchool: (id: string) => Promise<void>;
  onNavigateToInput: (schoolId?: string) => void;
  onOpenSyncModal?: () => void;
  isSyncing?: boolean;
}

export const StatusPelaporanPage: React.FC<StatusPelaporanPageProps> = ({
  schools,
  onSaveSchool,
  onDeleteSchool,
  onNavigateToInput,
  onOpenSyncModal,
  isSyncing = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Modal edit state
  const [editingSchool, setEditingSchool] = useState<TasmikSchoolRecord | null>(null);
  const [detailSchool, setDetailSchool] = useState<TasmikSchoolRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchSearch =
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.schoolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === 'Semua' || school.submissionStatus === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [schools, searchTerm, selectedStatus]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'Kod Sekolah',
      'Nama Sekolah',
      'Jumlah Murid',
      'Iqra 1',
      'Iqra 2',
      'Iqra 3',
      'Iqra 4',
      'Iqra 5-6',
      'Juz 1-5',
      'Juz 6-10',
      'Juz 11-15',
      'Juz 16-20',
      'Juz 21-25',
      'Juz 26-30',
      'Khatam',
      'Status',
      'Tarikh Kemaskini',
      'Penyelaras'
    ];

    const rows = filteredSchools.map((s) => [
      `"${s.schoolCode}"`,
      `"${s.schoolName}"`,
      s.totalStudents,
      s.iqra1,
      s.iqra2,
      s.iqra3,
      s.iqra4,
      s.iqra5_6,
      s.juz1_5,
      s.juz6_10,
      s.juz11_15,
      s.juz16_20,
      s.juz21_25,
      s.juz26_30,
      s.khatam,
      `"${s.submissionStatus}"`,
      `"${s.lastUpdated}"`,
      `"${s.submittedBy}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Status_Pelaporan_Tasmik_Penampang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickStatusUpdate = async (school: TasmikSchoolRecord, newStatus: SubmissionStatus) => {
    await onSaveSchool({
      ...school,
      submissionStatus: newStatus
    });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setIsSaving(true);
    await onSaveSchool(editingSchool);
    setIsSaving(false);
    setEditingSchool(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <School className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Status Pelaporan Tasmik Daerah Penampang
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Senarai dan pemantauan status penghantaran rekod Tasmik Al-Quran bagi 25 buah sekolah rendah di bawah PPD Penampang beserta pautan Google Sheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenSyncModal && (
              <button
                onClick={onOpenSyncModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkronisasi Google Sheets</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Muat Turun CSV / Excel</span>
            </button>
            <button
              onClick={() => onNavigateToInput()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekod Sekolah</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari sekolah, kod, penyelaras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Status Penghantaran</option>
              <option value="Selesai">Selesai Hantar</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Belum Hantar">Belum Hantar</option>
            </select>
          </div>

          {/* Summary pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-900 text-xs font-semibold">
            <span>Hasil Carian:</span>
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[11px]">
              {filteredSchools.length} Sekolah
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Sekolah & Kod</th>
                <th className="py-3.5 px-3 text-center">Jumlah Murid</th>
                <th className="py-3.5 px-3">Pecahan Bacaan</th>
                <th className="py-3.5 px-3 text-center">Khatam</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3">Tarikh Kemaskini</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tiada rekod sekolah dijumpai untuk kriteria carian anda.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const totalIqra =
                    school.iqra1 + school.iqra2 + school.iqra3 + school.iqra4 + school.iqra5_6;
                  const totalQuran =
                    school.juz1_5 +
                    school.juz6_10 +
                    school.juz11_15 +
                    school.juz16_20 +
                    school.juz21_25 +
                    school.juz26_30;

                  const iqraPct = Math.round((totalIqra / school.totalStudents) * 100);
                  const quranPct = Math.round((totalQuran / school.totalStudents) * 100);
                  const khatamPct = Math.round((school.khatam / school.totalStudents) * 100);

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {school.schoolName}
                          </span>
                          {school.spreadsheetUrl && (
                            <a
                              href={school.spreadsheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 px-2 py-0.5 rounded-full transition-colors shrink-0"
                              title="Buka fail Google Sheet j-QAF asal"
                            >
                              <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Sheet</span>
                              <ExternalLink className="w-2 h-2 text-emerald-600" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mt-0.5 flex-wrap">
                          <span>{school.schoolCode}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-sans">{school.submittedBy}</span>
                          {school.lastSyncedAt && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-sans text-[10px] font-medium">
                                Disinkron: {school.lastSyncedAt}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 text-sm">
                        {school.totalStudents}
                      </td>

                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-amber-700 font-medium">Iqra: {totalIqra} ({iqraPct}%)</span>
                            <span className="text-emerald-700 font-medium">Al-Quran: {totalQuran} ({quranPct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${iqraPct}%` }}
                              className="bg-amber-400 h-full"
                              title={`Iqra: ${totalIqra}`}
                            ></div>
                            <div
                              style={{ width: `${quranPct}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Al-Quran: ${totalQuran}`}
                            ></div>
                            <div
                              style={{ width: `${khatamPct}%` }}
                              className="bg-purple-500 h-full"
                              title={`Khatam: ${school.khatam}`}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100">
                          {school.khatam} ({khatamPct}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {school.submissionStatus === 'Selesai' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selesai</span>
                          </span>
                        )}
                        {school.submissionStatus === 'Dalam Proses' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Dalam Proses</span>
                          </span>
                        )}
                        {school.submissionStatus === 'Belum Hantar' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3" />
                            <span>Belum Hantar</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {school.lastUpdated}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailSchool(school)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Butiran Penuh"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSchool(school)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Sunting Rekod"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Adakah anda pasti ingin memadam rekod untuk ${school.schoolName}?`)) {
                                onDeleteSchool(school.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Padam Rekod"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="apple-card bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                  Maklumat Terperinci Sekolah
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {detailSchool.schoolName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {detailSchool.schoolCode}
                </p>
              </div>
              <button
                onClick={() => setDetailSchool(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Murid</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{detailSchool.totalStudents}</div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] text-amber-700 uppercase font-bold">Iqra 1-6</span>
                <div className="text-xl font-extrabold text-amber-800 mt-1">
                  {detailSchool.iqra1 + detailSchool.iqra2 + detailSchool.iqra3 + detailSchool.iqra4 + detailSchool.iqra5_6}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <span className="text-[10px] text-purple-700 uppercase font-bold">Khatam Quran</span>
                <div className="text-xl font-extrabold text-purple-800 mt-1">{detailSchool.khatam}</div>
              </div>
            </div>

            {/* Iqra Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pecahan Tahap Iqra
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Iqra 1</div>
                  <div className="font-bold text-slate-800 mt-0.5">{detailSchool.iqra1}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Iqra 2</div>
                  <div className="font-bold text-slate-800 mt-0.5">{detailSchool.iqra2}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Iqra 3</div>
                  <div className="font-bold text-slate-800 mt-0.5">{detailSchool.iqra3}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Iqra 4</div>
                  <div className="font-bold text-slate-800 mt-0.5">{detailSchool.iqra4}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Iqra 5 & 6</div>
                  <div className="font-bold text-slate-800 mt-0.5">{detailSchool.iqra5_6}</div>
                </div>
              </div>
            </div>

            {/* Al-Quran Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pecahan Tahap Al-Quran (Juz 1 hingga 30)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 1-5</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz1_5}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 6-10</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz6_10}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 11-15</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz11_15}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 16-20</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz16_20}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 21-25</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz21_25}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Juz 26-30</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{detailSchool.juz26_30}</div>
                </div>
              </div>
            </div>

            {/* Penyelaras & Notes */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Penyelaras / Guru:</span>
                <span className="font-bold text-slate-800">{detailSchool.submittedBy}</span>
              </div>
              {detailSchool.phoneContact && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">No. Telefon:</span>
                  <span className="font-mono text-slate-800">{detailSchool.phoneContact}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Kemaskini Terakhir:</span>
                <span className="text-slate-800">{detailSchool.lastUpdated}</span>
              </div>
              {detailSchool.spreadsheetUrl && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 font-semibold">Pautan Google Sheet:</span>
                  <a
                    href={detailSchool.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold underline"
                  >
                    <span>Buka Google Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {detailSchool.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Catatan Tambahan:</span>
                  <p className="text-slate-700 italic">{detailSchool.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingSchool(detailSchool);
                  setDetailSchool(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Sunting Rekod Ini
              </button>
              <button
                onClick={() => setDetailSchool(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Form */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveModal}
            className="apple-card bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase">
                  Kemaskini Pangkalan Data
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Sunting Data Tasmik: {editingSchool.schoolName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  value={editingSchool.schoolName}
                  onChange={(e) => setEditingSchool({ ...editingSchool, schoolName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kod Sekolah</label>
                <input
                  type="text"
                  required
                  value={editingSchool.schoolCode}
                  onChange={(e) => setEditingSchool({ ...editingSchool, schoolCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status Penghantaran</label>
                <select
                  value={editingSchool.submissionStatus}
                  onChange={(e) =>
                    setEditingSchool({
                      ...editingSchool,
                      submissionStatus: e.target.value as SubmissionStatus
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value="Selesai">Selesai Hantar</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Belum Hantar">Belum Hantar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Jumlah Keseluruhan Murid</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingSchool.totalStudents}
                  onChange={(e) =>
                    setEditingSchool({ ...editingSchool, totalStudents: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Pautan Google Sheet Tasmik (Auto-Sync)</label>
                <input
                  type="url"
                  value={editingSchool.spreadsheetUrl || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, spreadsheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-blue-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bil. Khatam Al-Quran</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingSchool.khatam}
                  onChange={(e) =>
                    setEditingSchool({ ...editingSchool, khatam: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-purple-700 font-bold"
                />
              </div>
            </div>

            {/* Iqra Section */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Bilangan Murid Mengikut Iqra 1 hingga 6
              </span>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {['iqra1', 'iqra2', 'iqra3', 'iqra4', 'iqra5_6'].map((field, idx) => (
                  <div key={field}>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      {idx === 4 ? 'Iqra 5 & 6' : `Iqra ${idx + 1}`}
                    </label>
                    <input
                      type="number"
                      min="0"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(editingSchool as any)[field]}
                      onChange={(e) =>
                        setEditingSchool({
                          ...editingSchool,
                          [field]: parseInt(e.target.value) || 0
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-center font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Juz Section */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Bilangan Murid Mengikut Juz Al-Quran (Juz 1 hingga 30)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {[
                  { key: 'juz1_5', label: 'Juz 1-5' },
                  { key: 'juz6_10', label: 'Juz 6-10' },
                  { key: 'juz11_15', label: 'Juz 11-15' },
                  { key: 'juz16_20', label: 'Juz 16-20' },
                  { key: 'juz21_25', label: 'Juz 21-25' },
                  { key: 'juz26_30', label: 'Juz 26-30' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(editingSchool as any)[item.key]}
                      onChange={(e) =>
                        setEditingSchool({
                          ...editingSchool,
                          [item.key]: parseInt(e.target.value) || 0
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-center font-mono text-emerald-800"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Penyelaras / GPI</label>
                <input
                  type="text"
                  required
                  value={editingSchool.submittedBy}
                  onChange={(e) => setEditingSchool({ ...editingSchool, submittedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">No. Telefon</label>
                <input
                  type="text"
                  value={editingSchool.phoneContact || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, phoneContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  placeholder="01X-XXXXXXX"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
