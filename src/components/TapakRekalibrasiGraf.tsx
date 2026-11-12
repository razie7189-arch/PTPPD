import React, { useState, useEffect, useMemo } from 'react';
import { TasmikSchoolRecord, YearClassData } from '../types';
import {
  generateDefaultClassBreakdown,
  calculateTapakTotals
} from '../utils/tapakRekalibrasi';
import {
  Printer,
  Download,
  Edit3,
  Check,
  Save,
  RotateCcw,
  School,
  Sparkles,
  Award,
  BookOpen,
  Info,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface TapakRekalibrasiGrafProps {
  schools: TasmikSchoolRecord[];
  onSaveSchool: (record: TasmikSchoolRecord) => Promise<void>;
  selectedSchoolId?: string;
  onSelectSchool?: (schoolId: string) => void;
  onSyncSchool?: (school: TasmikSchoolRecord) => Promise<void>;
}

export const TapakRekalibrasiGraf: React.FC<TapakRekalibrasiGrafProps> = ({
  schools,
  onSaveSchool,
  selectedSchoolId,
  onSelectSchool,
  onSyncSchool
}) => {
  // District aggregate record for KESELURUHAN DAERAH PENAMPANG
  const districtRecord = useMemo<TasmikSchoolRecord>(() => {
    const sumRecord: TasmikSchoolRecord = {
      id: 'keseluruhan-daerah',
      schoolCode: 'PPD4100',
      schoolName: 'PEJABAT PENDIDIKAN DAERAH PENAMPANG (KESELURUHAN DAERAH)',
      totalStudents: 0,
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
      submissionStatus: 'Selesai',
      lastUpdated: new Date().toISOString().split('T')[0],
      submittedBy: 'Pegawai Meja j-QAF / UPI PPD Penampang',
      phoneContact: '088-712890',
      notes: `Rumusan agregat rasmi ${schools.length} buah sekolah rendah Daerah Penampang`
    };

    schools.forEach((s) => {
      sumRecord.totalStudents += Number(s.totalStudents) || 0;
      sumRecord.iqra1 += Number(s.iqra1) || 0;
      sumRecord.iqra2 += Number(s.iqra2) || 0;
      sumRecord.iqra3 += Number(s.iqra3) || 0;
      sumRecord.iqra4 += Number(s.iqra4) || 0;
      sumRecord.iqra5_6 += Number(s.iqra5_6) || 0;
      sumRecord.juz1_5 += Number(s.juz1_5) || 0;
      sumRecord.juz6_10 += Number(s.juz6_10) || 0;
      sumRecord.juz11_15 += Number(s.juz11_15) || 0;
      sumRecord.juz16_20 += Number(s.juz16_20) || 0;
      sumRecord.juz21_25 += Number(s.juz21_25) || 0;
      sumRecord.juz26_30 += Number(s.juz26_30) || 0;
      sumRecord.khatam += Number(s.khatam) || 0;
    });

    return sumRecord;
  }, [schools]);

  const [activeSchoolId, setActiveSchoolId] = useState<string>(
    selectedSchoolId || 'keseluruhan-daerah'
  );
  const [isSyncingCurrent, setIsSyncingCurrent] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Synchronize if prop changes
  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== activeSchoolId) {
      setActiveSchoolId(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const isDistrict = activeSchoolId === 'keseluruhan-daerah';

  // Current active school object
  const currentSchool = useMemo(() => {
    if (activeSchoolId === 'keseluruhan-daerah') {
      return districtRecord;
    }
    return schools.find((s) => s.id === activeSchoolId) || districtRecord || schools[0];
  }, [schools, activeSchoolId, districtRecord]);

  // Working state for rows (Tahun 1 hingga Tahun 6)
  const [classRows, setClassRows] = useState<YearClassData[]>([]);

  // When active school changes, populate classRows
  useEffect(() => {
    if (currentSchool) {
      setClassRows(generateDefaultClassBreakdown(currentSchool));
    }
  }, [currentSchool]);

  // Calculate totals across all rows
  const totals = useMemo(() => {
    return calculateTapakTotals(classRows);
  }, [classRows]);

  // Total student count across classes
  const totalStudents = totals.bilMurid || 1;

  // Handle cell edit in table
  const handleCellChange = (
    rowIndex: number,
    field: keyof YearClassData,
    value: number
  ) => {
    setClassRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value
      };
      // Auto-update bilMurid for that class if fields sum
      if (field !== 'bilMurid') {
        const r = updated[rowIndex];
        const rowSum =
          (Number(r.i1) || 0) +
          (Number(r.i2) || 0) +
          (Number(r.i3) || 0) +
          (Number(r.i4) || 0) +
          (Number(r.i5) || 0) +
          (Number(r.i6) || 0) +
          (Number(r.juz1_5) || 0) +
          (Number(r.juz6_10) || 0) +
          (Number(r.juz11_15) || 0) +
          (Number(r.juz16_20) || 0) +
          (Number(r.juz21_25) || 0) +
          (Number(r.juz26_30) || 0) +
          (Number(r.khatam) || 0);
        updated[rowIndex].bilMurid = rowSum;
      }
      return updated;
    });
  };

  // Save changes back to school record
  const handleSaveTapak = async () => {
    if (!currentSchool) return;
    setIsSaving(true);

    const updatedSchool: TasmikSchoolRecord = {
      ...currentSchool,
      totalStudents: totals.bilMurid,
      iqra1: totals.i1,
      iqra2: totals.i2,
      iqra3: totals.i3,
      iqra4: totals.i4,
      iqra5_6: totals.i5 + totals.i6,
      juz1_5: totals.juz1_5,
      juz6_10: totals.juz6_10,
      juz11_15: totals.juz11_15,
      juz16_20: totals.juz16_20,
      juz21_25: totals.juz21_25,
      juz26_30: totals.juz26_30,
      khatam: totals.khatam,
      classBreakdown: classRows,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    await onSaveSchool(updatedSchool);
    setIsSaving(false);
    setIsEditMode(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handleResetToDefaults = () => {
    if (!currentSchool) return;
    if (confirm('Tetapkan semula data kelas berdasarkan anggaran sekolah?')) {
      setClassRows(generateDefaultClassBreakdown({ ...currentSchool, classBreakdown: undefined }));
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Calculations for Page 2 Summary Tables
  // Iqra table:
  const iqraItems = [
    { label: 'IQRA 1', count: totals.i1, color: '#FF0000', textLight: true },
    { label: 'IQRA 2', count: totals.i2, color: '#FF0000', textLight: true },
    { label: 'IQRA 3', count: totals.i3, color: '#FF0000', textLight: true },
    { label: 'IQRA 4', count: totals.i4, color: '#FFFF00', textLight: false },
    { label: 'IQRA 5', count: totals.i5, color: '#FFFF00', textLight: false },
    { label: 'IQRA 6', count: totals.i6, color: '#FFFF00', textLight: false }
  ];

  // Quran table:
  const quranItems = [
    { label: 'J 1-5', count: totals.juz1_5, color: '#FFFFFF', textLight: false },
    { label: 'J 6-10', count: totals.juz6_10, color: '#FFFFFF', textLight: false },
    { label: 'J 11-15', count: totals.juz11_15, color: '#B7E1CD', textLight: false },
    { label: 'J 16-20', count: totals.juz16_20, color: '#B7E1CD', textLight: false },
    { label: 'J 21-25', count: totals.juz21_25, color: '#B7E1CD', textLight: false },
    { label: 'J 26-30', count: totals.juz26_30, color: '#B7E1CD', textLight: false },
    { label: 'KHATAM', count: totals.khatam, color: '#FCE8B2', textLight: false }
  ];

  return (
    <div className="space-y-6">
      {/* School Selector & Action Controls Bar (Hidden during print) */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 no-print border-blue-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {isDistrict ? 'Daerah Penampang (Agregat)' : 'Tapak Rekalibrasi j-QAF 2026'}
                </span>
                <span className="text-xs text-slate-400">
                  • Kod: {currentSchool?.schoolCode}
                  {isDistrict && ` • ${schools.length} Buah Sekolah`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-blue-950 mt-0.5">
                {currentSchool?.schoolName}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* School Switcher */}
            <div className="bg-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Pilih Peringkat / Sekolah:</span>
              <select
                value={activeSchoolId}
                onChange={(e) => {
                  setActiveSchoolId(e.target.value);
                  if (onSelectSchool) onSelectSchool(e.target.value);
                }}
                className="bg-transparent text-xs font-bold text-blue-900 focus:outline-none cursor-pointer max-w-[260px] sm:max-w-none truncate"
              >
                <option value="keseluruhan-daerah">
                  ⭐ KESELURUHAN DAERAH PENAMPANG (PPD PENAMPANG - {schools.length} SEKOLAH)
                </option>
                <optgroup label={`Sekolah Rendah Daerah Penampang (${schools.length} Buah Sekolah)`}>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.schoolName} ({s.schoolCode})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Live Google Sheet link & sync button */}
            {currentSchool?.spreadsheetUrl && (
              <div className="flex items-center gap-1.5">
                <a
                  href={currentSchool.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                  title="Buka pangkalan data Google Sheet sekolah ini"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Sheet</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>

                {onSyncSchool && (
                  <button
                    onClick={async () => {
                      if (!currentSchool) return;
                      setIsSyncingCurrent(true);
                      try {
                        await onSyncSchool(currentSchool);
                      } finally {
                        setIsSyncingCurrent(false);
                      }
                    }}
                    disabled={isSyncingCurrent}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    title="Sinkronkan bilangan murid terkini dari Google Sheet"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingCurrent ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCurrent ? 'Menyinkron...' : 'Sinkron'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Edit / View Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'Keluar Suntingan' : 'Sunting Data Tapak'}</span>
            </button>

            {isEditMode && (
              <>
                <button
                  onClick={handleSaveTapak}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
                <button
                  onClick={handleResetToDefaults}
                  className="p-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                  title="Tetapkan Semula"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs cursor-pointer transition-all"
              title="Cetak atau Muat Turun Format PDF A4 Landscape"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save feedback toast */}
      {saveToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 no-print animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Data Tapak Rekalibrasi {currentSchool?.schoolName} berjaya dikemas kini ke pangkalan data!
          </span>
        </div>
      )}

      {/* =========================================================================
          PRINTABLE & ON-SCREEN TAPAK REKALIBRASI CONTAINER (EXACT TO PDF)
          ========================================================================= */}
      <div className="print-container bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-black">
        {/* Printable Header with Official Jata Negara & itQan / j-QAF badge */}
        <div className="border-b-2 border-black pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_ec77c1d2.png"
              alt="Jata Negara Malaysia"
              className="w-16 h-14 object-contain"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                {isDistrict
                  ? 'KEMENTERIAN PENDIDIKAN MALAYSIA • JABATAN PENDIDIKAN NEGERI SABAH • PPD PENAMPANG'
                  : 'KEMENTERIAN PENDIDIKAN MALAYSIA • JABATAN PENDIDIKAN NEGERI SABAH'}
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-blue-950 uppercase leading-tight">
                {isDistrict
                  ? 'TAPAK REKALIBRASI PROGRAM j-QAF TAHUN 2026 (KESELURUHAN DAERAH PENAMPANG)'
                  : 'TAPAK REKALIBRASI PROGRAM j-QAF TAHUN 2026'}
              </h1>
              <p className="text-xs font-bold text-slate-700">
                {isDistrict ? (
                  <>
                    PPD: <span className="text-blue-900 underline font-black">PEJABAT PENDIDIKAN DAERAH PENAMPANG</span> (KOD: PPD4100) • {schools.length} BUAH SEKOLAH
                  </>
                ) : (
                  <>
                    SEKOLAH: <span className="text-blue-900 underline font-black">{currentSchool?.schoolName}</span> ({currentSchool?.schoolCode})
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            {/* itQan / j-QAF Logo Badge Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900 text-white text-xs font-black border-2 border-amber-400 shadow-xs">
              <span className="text-amber-300 font-serif italic text-sm">itQan</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">j-QAF 2026</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 font-mono">
              Tarikh Kemaskini: {currentSchool?.lastUpdated || new Date().toISOString().split('T')[0]}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            PAGE 1: TABLE TAPAK REKALIBRASI KELAS (Iqra 1-6 & Juz 1-30 & Khatam)
            ------------------------------------------------------------- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase">
            <span className="flex items-center gap-1 text-slate-800">
              <span>Halaman 1: Matriks Taburan Mengikut Kelas (Tahun 1 hingga Tahun 6)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Jumlah Murid: {totals.bilMurid} orang
            </span>
          </div>

          <div className="overflow-x-auto border-2 border-black rounded-lg">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                {/* Header Row */}
                <tr className="border-b-2 border-black font-black text-[11px] tracking-wider">
                  <th className="border-r border-black py-2.5 px-2 bg-slate-100 text-black w-24">
                    KELAS
                  </th>
                  <th className="border-r-2 border-black py-2.5 px-2 bg-slate-100 text-black w-20">
                    BIL.<br />MURID
                  </th>

                  {/* Iqra 1 - 3: Merah Solid (#FF0000) */}
                  <th className="border-r border-black py-2.5 px-2 bg-[#FF0000] text-black font-black w-12">
                    I1
                  </th>
                  <th className="border-r border-black py-2.5 px-2 bg-[#FF0000] text-black font-black w-12">
                    I2
                  </th>
                  <th className="border-r-2 border-black py-2.5 px-2 bg-[#FF0000] text-black font-black w-12">
                    I3
                  </th>

                  {/* Iqra 4 - 6: Kuning Solid (#FFFF00) */}
                  <th className="border-r border-black py-2.5 px-2 bg-[#FFFF00] text-black font-black w-12">
                    I4
                  </th>
                  <th className="border-r border-black py-2.5 px-2 bg-[#FFFF00] text-black font-black w-12">
                    I5
                  </th>
                  <th className="border-r-2 border-black py-2.5 px-2 bg-[#FFFF00] text-black font-black w-12">
                    I6
                  </th>

                  {/* Juz 1 - 10: Putih / Neutral */}
                  <th className="border-r border-black py-2.5 px-1.5 bg-slate-100 text-black font-black text-[10px] w-14">
                    JUZ<br />1-5
                  </th>
                  <th className="border-r-2 border-black py-2.5 px-1.5 bg-slate-100 text-black font-black text-[10px] w-14">
                    JUZ<br />6-10
                  </th>

                  {/* Juz 11 - 30: Hijau Muda (#B7E1CD) */}
                  <th className="border-r border-black py-2.5 px-1.5 bg-[#B7E1CD] text-black font-black text-[10px] w-14">
                    JUZ<br />11-15
                  </th>
                  <th className="border-r border-black py-2.5 px-1.5 bg-[#B7E1CD] text-black font-black text-[10px] w-14">
                    JUZ<br />16-20
                  </th>
                  <th className="border-r border-black py-2.5 px-1.5 bg-[#B7E1CD] text-black font-black text-[10px] w-14">
                    JUZ<br />21-25
                  </th>
                  <th className="border-r-2 border-black py-2.5 px-1.5 bg-[#B7E1CD] text-black font-black text-[10px] w-14">
                    JUZ<br />26-30
                  </th>

                  {/* Khatam: Emas (#FCE8B2) */}
                  <th className="py-2.5 px-2 bg-[#FCE8B2] text-black font-black w-18 text-[11px]">
                    KHATAM
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y border-black font-bold">
                {classRows.map((row, idx) => (
                  <tr key={row.kelas} className="border-b border-black">
                    {/* Kelas Label */}
                    <td className="border-r border-black py-2 px-2 bg-slate-50 text-black font-black text-left pl-3">
                      {row.kelas}
                    </td>

                    {/* Bilangan Murid Kelas */}
                    <td className="border-r-2 border-black py-2 px-2 bg-slate-50 text-black font-black font-mono">
                      {row.bilMurid}
                    </td>

                    {/* I1 */}
                    <td className="border-r border-black p-0 bg-[#FF0000]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i1}
                          onChange={(e) =>
                            handleCellChange(idx, 'i1', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i1}</span>
                      )}
                    </td>

                    {/* I2 */}
                    <td className="border-r border-black p-0 bg-[#FF0000]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i2}
                          onChange={(e) =>
                            handleCellChange(idx, 'i2', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i2}</span>
                      )}
                    </td>

                    {/* I3 */}
                    <td className="border-r-2 border-black p-0 bg-[#FF0000]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i3}
                          onChange={(e) =>
                            handleCellChange(idx, 'i3', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i3}</span>
                      )}
                    </td>

                    {/* I4 */}
                    <td className="border-r border-black p-0 bg-[#FFFF00]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i4}
                          onChange={(e) =>
                            handleCellChange(idx, 'i4', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i4}</span>
                      )}
                    </td>

                    {/* I5 */}
                    <td className="border-r border-black p-0 bg-[#FFFF00]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i5}
                          onChange={(e) =>
                            handleCellChange(idx, 'i5', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i5}</span>
                      )}
                    </td>

                    {/* I6 */}
                    <td className="border-r-2 border-black p-0 bg-[#FFFF00]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.i6}
                          onChange={(e) =>
                            handleCellChange(idx, 'i6', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.i6}</span>
                      )}
                    </td>

                    {/* Juz 1-5 */}
                    <td className="border-r border-black p-0 bg-slate-100">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz1_5}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz1_5', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz1_5}</span>
                      )}
                    </td>

                    {/* Juz 6-10 */}
                    <td className="border-r-2 border-black p-0 bg-slate-100">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz6_10}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz6_10', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz6_10}</span>
                      )}
                    </td>

                    {/* Juz 11-15 */}
                    <td className="border-r border-black p-0 bg-[#B7E1CD]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz11_15}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz11_15', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz11_15}</span>
                      )}
                    </td>

                    {/* Juz 16-20 */}
                    <td className="border-r border-black p-0 bg-[#B7E1CD]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz16_20}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz16_20', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz16_20}</span>
                      )}
                    </td>

                    {/* Juz 21-25 */}
                    <td className="border-r border-black p-0 bg-[#B7E1CD]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz21_25}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz21_25', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz21_25}</span>
                      )}
                    </td>

                    {/* Juz 26-30 */}
                    <td className="border-r-2 border-black p-0 bg-[#B7E1CD]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.juz26_30}
                          onChange={(e) =>
                            handleCellChange(idx, 'juz26_30', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.juz26_30}</span>
                      )}
                    </td>

                    {/* Khatam */}
                    <td className="p-0 bg-[#FCE8B2]">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          value={row.khatam}
                          onChange={(e) =>
                            handleCellChange(idx, 'khatam', parseInt(e.target.value) || 0)
                          }
                          className="w-full h-8 text-center bg-transparent text-black font-bold focus:bg-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-black font-bold">{row.khatam}</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* JUMLAH ROW */}
                <tr className="border-t-2 border-black font-black bg-slate-200 text-black">
                  <td className="border-r border-black py-2.5 px-2 text-left pl-3 uppercase">
                    JUMLAH
                  </td>
                  <td className="border-r-2 border-black py-2.5 px-2 font-mono">
                    {totals.bilMurid}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#FF0000] text-black">
                    {totals.i1}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#FF0000] text-black">
                    {totals.i2}
                  </td>
                  <td className="border-r-2 border-black py-2.5 px-1 bg-[#FF0000] text-black">
                    {totals.i3}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#FFFF00] text-black">
                    {totals.i4}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#FFFF00] text-black">
                    {totals.i5}
                  </td>
                  <td className="border-r-2 border-black py-2.5 px-1 bg-[#FFFF00] text-black">
                    {totals.i6}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-slate-100 text-black">
                    {totals.juz1_5}
                  </td>
                  <td className="border-r-2 border-black py-2.5 px-1 bg-slate-100 text-black">
                    {totals.juz6_10}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#B7E1CD] text-black">
                    {totals.juz11_15}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#B7E1CD] text-black">
                    {totals.juz16_20}
                  </td>
                  <td className="border-r border-black py-2.5 px-1 bg-[#B7E1CD] text-black">
                    {totals.juz21_25}
                  </td>
                  <td className="border-r-2 border-black py-2.5 px-1 bg-[#B7E1CD] text-black">
                    {totals.juz26_30}
                  </td>
                  <td className="py-2.5 px-1 bg-[#FCE8B2] text-black">
                    {totals.khatam}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* -------------------------------------------------------------
            PAGE 2: SUMMARY TABLES (ITEM / PERKARA & % PERATUSAN)
            ------------------------------------------------------------- */}
        <div className="space-y-6 pt-4 page-break">
          <div className="text-xs font-bold uppercase text-slate-800 border-b border-black pb-1">
            Halaman 2: Rumusan Item / Perkara & Peratusan Keseluruhan Sekolah
          </div>

          {/* Table 1: Rumusan Iqra 1 hingga 6 */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-700 uppercase">
              A. Taburan Murid Tahap Iqra (1 Hingga 6)
            </div>
            <div className="overflow-x-auto border-2 border-black rounded-lg">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-black font-black text-[11px]">
                    <th className="border-r-2 border-black py-2.5 px-3 bg-slate-100 text-black text-left pl-4 w-44">
                      ITEM / PERKARA
                    </th>
                    {iqraItems.map((item, idx) => (
                      <th
                        key={item.label}
                        style={{ backgroundColor: item.color }}
                        className={`py-2.5 px-2 text-black font-black ${
                          idx < iqraItems.length - 1 ? 'border-r border-black' : ''
                        }`}
                      >
                        {item.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y border-black font-bold">
                  {/* Row 1: Bilangan Murid */}
                  <tr className="border-b border-black">
                    <td className="border-r-2 border-black py-2.5 px-4 text-left font-black bg-slate-50 text-black">
                      BILANGAN MURID
                    </td>
                    {iqraItems.map((item, idx) => (
                      <td
                        key={item.label}
                        style={{ backgroundColor: item.color }}
                        className={`py-2.5 px-2 text-black font-mono font-bold ${
                          idx < iqraItems.length - 1 ? 'border-r border-black' : ''
                        }`}
                      >
                        {item.count}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Peratusan % */}
                  <tr className="font-black">
                    <td className="border-r-2 border-black py-2.5 px-4 text-left font-black bg-slate-50 text-black">
                      % (PERATUSAN)
                    </td>
                    {iqraItems.map((item, idx) => {
                      const pct = totalStudents > 0 ? ((item.count / totalStudents) * 100).toFixed(1) : '0.0';
                      return (
                        <td
                          key={item.label}
                          style={{ backgroundColor: item.color }}
                          className={`py-2.5 px-2 text-black font-mono font-bold ${
                            idx < iqraItems.length - 1 ? 'border-r border-black' : ''
                          }`}
                        >
                          {pct}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Rumusan Al-Quran (Juz 1-30) & Khatam */}
          <div className="space-y-1 pt-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase">
              B. Taburan Murid Tahap Al-Quran (Juz 1 Hingga 30) & Khatam
            </div>
            <div className="overflow-x-auto border-2 border-black rounded-lg">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-black font-black text-[11px]">
                    <th className="border-r-2 border-black py-2.5 px-3 bg-slate-100 text-black text-left pl-4 w-44">
                      ITEM / PERKARA
                    </th>
                    {quranItems.map((item, idx) => (
                      <th
                        key={item.label}
                        style={{ backgroundColor: item.color }}
                        className={`py-2.5 px-2 text-black font-black ${
                          idx < quranItems.length - 1 ? 'border-r border-black' : ''
                        }`}
                      >
                        {item.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y border-black font-bold">
                  {/* Row 1: Bilangan Murid */}
                  <tr className="border-b border-black">
                    <td className="border-r-2 border-black py-2.5 px-4 text-left font-black bg-slate-50 text-black">
                      BILANGAN MURID
                    </td>
                    {quranItems.map((item, idx) => (
                      <td
                        key={item.label}
                        style={{ backgroundColor: item.color }}
                        className={`py-2.5 px-2 text-black font-mono font-bold ${
                          idx < quranItems.length - 1 ? 'border-r border-black' : ''
                        }`}
                      >
                        {item.count}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Peratusan % */}
                  <tr className="font-black">
                    <td className="border-r-2 border-black py-2.5 px-4 text-left font-black bg-slate-50 text-black">
                      % (PERATUSAN)
                    </td>
                    {quranItems.map((item, idx) => {
                      const pct = totalStudents > 0 ? ((item.count / totalStudents) * 100).toFixed(1) : '0.0';
                      return (
                        <td
                          key={item.label}
                          style={{ backgroundColor: item.color }}
                          className={`py-2.5 px-2 text-black font-mono font-bold ${
                            idx < quranItems.length - 1 ? 'border-r border-black' : ''
                          }`}
                        >
                          {pct}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Visual Progress Dial & Category Stack Bar */}
        <div className="pt-4 border-t border-black space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2">
            <span>ANALISIS KEDUDUKAN MURID: {currentSchool?.schoolName}</span>
            <span className="text-orange-600">
              PENCAPAIAN KPI 95% SEKOLAH:{' '}
              {Math.round(
                ((totals.juz1_5 +
                  totals.juz6_10 +
                  totals.juz11_15 +
                  totals.juz16_20 +
                  totals.juz21_25 +
                  totals.juz26_30 +
                  totals.khatam) /
                  totalStudents) *
                  100
              )}
              % (Sasaran: 95%)
            </span>
          </div>

          <div className="h-6 w-full border border-black rounded-lg overflow-hidden flex font-mono text-[10px] font-bold">
            {/* Merah - Iqra 1-3 */}
            <div
              style={{
                width: `${Math.max(
                  ((totals.i1 + totals.i2 + totals.i3) / totalStudents) * 100,
                  2
                )}%`,
                backgroundColor: '#FF0000'
              }}
              className="h-full flex items-center justify-center text-black truncate px-1"
              title={`Iqra 1-3 (Kritikal): ${totals.i1 + totals.i2 + totals.i3}`}
            >
              I1-I3 ({totals.i1 + totals.i2 + totals.i3})
            </div>

            {/* Kuning - Iqra 4-6 */}
            <div
              style={{
                width: `${Math.max(
                  ((totals.i4 + totals.i5 + totals.i6) / totalStudents) * 100,
                  2
                )}%`,
                backgroundColor: '#FFFF00'
              }}
              className="h-full flex items-center justify-center text-black truncate px-1"
              title={`Iqra 4-6 (Pengukuhan): ${totals.i4 + totals.i5 + totals.i6}`}
            >
              I4-I6 ({totals.i4 + totals.i5 + totals.i6})
            </div>

            {/* Putih - Juz 1-10 */}
            <div
              style={{
                width: `${Math.max(
                  ((totals.juz1_5 + totals.juz6_10) / totalStudents) * 100,
                  2
                )}%`,
                backgroundColor: '#E2E8F0'
              }}
              className="h-full flex items-center justify-center text-black truncate px-1"
              title={`Juz 1-10: ${totals.juz1_5 + totals.juz6_10}`}
            >
              J1-10 ({totals.juz1_5 + totals.juz6_10})
            </div>

            {/* Hijau - Juz 11-30 */}
            <div
              style={{
                width: `${Math.max(
                  ((totals.juz11_15 + totals.juz16_20 + totals.juz21_25 + totals.juz26_30) /
                    totalStudents) *
                    100,
                  2
                )}%`,
                backgroundColor: '#B7E1CD'
              }}
              className="h-full flex items-center justify-center text-black truncate px-1"
              title={`Juz 11-30: ${totals.juz11_15 + totals.juz16_20 + totals.juz21_25 + totals.juz26_30}`}
            >
              J11-30 ({totals.juz11_15 + totals.juz16_20 + totals.juz21_25 + totals.juz26_30})
            </div>

            {/* Emas - Khatam */}
            <div
              style={{
                width: `${Math.max((totals.khatam / totalStudents) * 100, 2)}%`,
                backgroundColor: '#FCE8B2'
              }}
              className="h-full flex items-center justify-center text-black truncate px-1"
              title={`Khatam Al-Quran: ${totals.khatam}`}
            >
              Khatam ({totals.khatam})
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-black bg-[#FF0000]"></span>
              <span>Iqra 1-3 (Tahap 1 / Kritikal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-black bg-[#FFFF00]"></span>
              <span>Iqra 4-6 (Tahap 2 / Sederhana)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-black bg-slate-200"></span>
              <span>Juz 1-10 (Peralihan Al-Quran)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-black bg-[#B7E1CD]"></span>
              <span>Juz 11-30 (Lancar / Pengukuhan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-black bg-[#FCE8B2]"></span>
              <span>Khatam Al-Quran</span>
            </div>
          </div>
        </div>

        {/* Verification & Signature Section (Official Print Standard) */}
        <div className="pt-8 border-t-2 border-black grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-black">
          {isDistrict ? (
            <>
              <div className="space-y-12">
                <div>
                  <p className="font-bold">Disediakan oleh:</p>
                  <p className="text-[11px] text-slate-600">Pegawai Meja j-QAF / Tasmik Daerah</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Ustaz Mohd Zulkifli / Ustazah Norazlin</p>
                  <p className="text-[11px] text-slate-600">Unit Pendidikan Islam PPD Penampang</p>
                  <p className="text-[11px] text-slate-600">Tarikh: {new Date().toLocaleDateString('ms-MY')}</p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="font-bold">Disemak oleh:</p>
                  <p className="text-[11px] text-slate-600">Penolong PPD Pendidikan Islam</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Ustazah Hjh. Nor Asikin binti Ag. Damit</p>
                  <p className="text-[11px] text-slate-600">Sektor Pembelajaran PPD Penampang</p>
                </div>
              </div>

              <div className="space-y-12 hidden sm:block">
                <div>
                  <p className="font-bold">Disahkan oleh:</p>
                  <p className="text-[11px] text-slate-600">Pegawai Pendidikan Daerah</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Pejabat Pendidikan Daerah Penampang</p>
                  <p className="text-[11px] text-slate-600">Jabatan Pendidikan Negeri Sabah</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-12">
                <div>
                  <p className="font-bold">Disediakan oleh:</p>
                  <p className="text-[11px] text-slate-600">Guru Penyelaras Tasmik / GPI</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Nama: {currentSchool?.submittedBy || '................................................'}</p>
                  <p className="text-[11px] text-slate-600">Tarikh: {new Date().toLocaleDateString('ms-MY')}</p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="font-bold">Disemak & Disahkan oleh:</p>
                  <p className="text-[11px] text-slate-600">Guru Besar / PK Pentadbiran</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Nama: ................................................</p>
                  <p className="text-[11px] text-slate-600">Cop Rasmi Sekolah</p>
                </div>
              </div>

              <div className="space-y-12 hidden sm:block">
                <div>
                  <p className="font-bold">Pengesahan PPD:</p>
                  <p className="text-[11px] text-slate-600">Unit Pendidikan Islam PPD Penampang</p>
                </div>
                <div className="border-b border-black w-44"></div>
                <div>
                  <p className="font-bold">Pegawai Meja j-QAF / Tasmik</p>
                  <p className="text-[11px] text-slate-600">PPD Penampang, Sabah</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
