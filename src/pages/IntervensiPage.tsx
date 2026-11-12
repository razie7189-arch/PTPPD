import React, { useState, useMemo } from 'react';
import { IntervensiProgram, SekolahFokus, TasmikSchoolRecord } from '../types';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  School,
  X,
  Save,
  Download,
  Flame,
  Search,
  Filter,
  Users
} from 'lucide-react';

interface IntervensiPageProps {
  intervensiList: IntervensiProgram[];
  sekolahFokusList: SekolahFokus[];
  schools: TasmikSchoolRecord[];
  onSaveIntervensi: (item: IntervensiProgram) => Promise<void>;
  onDeleteIntervensi: (id: string) => Promise<void>;
  onSaveSekolahFokus: (item: SekolahFokus) => Promise<void>;
  onDeleteSekolahFokus: (id: string) => Promise<void>;
}

export const IntervensiPage: React.FC<IntervensiPageProps> = ({
  intervensiList,
  sekolahFokusList,
  schools,
  onSaveIntervensi,
  onDeleteIntervensi,
  onSaveSekolahFokus,
  onDeleteSekolahFokus
}) => {
  const [activeTab, setActiveTab] = useState<'isu' | 'khatam' | 'sekolah-fokus'>('isu');

  // Intervensi Modal State
  const [isIntervensiModalOpen, setIsIntervensiModalOpen] = useState(false);
  const [editingIntervensi, setEditingIntervensi] = useState<IntervensiProgram | null>(null);

  // Sekolah Fokus Modal State
  const [isFokusModalOpen, setIsFokusModalOpen] = useState(false);
  const [editingFokus, setEditingFokus] = useState<SekolahFokus | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // --- Handlers for Intervensi ---
  const handleOpenAddIntervensi = (cat: 'IQRA 1-3' | 'IQRA 4-6' | 'JUZ 11-30') => {
    setEditingIntervensi({
      id: 'int-' + Date.now(),
      category: cat,
      isu: '',
      programIntervensi: '',
      sasaran: '',
      tempoh: 'Sepanjang Tahun 2026',
      status: 'Dalam Pelaksanaan',
      pegawaiPenyelaras: 'Unit Pendidikan Islam PPD Penampang'
    });
    setIsIntervensiModalOpen(true);
  };

  const handleOpenEditIntervensi = (item: IntervensiProgram) => {
    setEditingIntervensi({ ...item });
    setIsIntervensiModalOpen(true);
  };

  const handleSaveIntervensiForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntervensi || !editingIntervensi.isu) return;
    setIsSaving(true);
    await onSaveIntervensi(editingIntervensi);
    setIsSaving(false);
    setIsIntervensiModalOpen(false);
    setEditingIntervensi(null);
  };

  // --- Handlers for Sekolah Fokus ---
  const handleOpenAddFokus = () => {
    setEditingFokus({
      id: 'fok-' + Date.now(),
      schoolName: schools[0]?.schoolName || 'SK Babagon',
      schoolCode: schools[0]?.schoolCode || 'XBA4112',
      fokusIsu: 'Iqra 1-3 Melebihi Sasaran',
      tindakanIntervensi: '',
      tarikhBimbingan: '2026-04-15',
      pegawaiBimbingan: 'Pegawai UPI PPD Penampang',
      statusTindakan: 'Akan Dilawati'
    });
    setIsFokusModalOpen(true);
  };

  const handleOpenEditFokus = (item: SekolahFokus) => {
    setEditingFokus({ ...item });
    setIsFokusModalOpen(true);
  };

  const handleSaveFokusForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFokus || !editingFokus.schoolName) return;
    setIsSaving(true);
    await onSaveSekolahFokus(editingFokus);
    setIsSaving(false);
    setIsFokusModalOpen(false);
    setEditingFokus(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner matching Pages 7, 8, 9 of PDF */}
      <div
        className="royal-blue-banner rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #091E42 0%, #0F2D6B 25%, #0052CC 70%, #0747A6 100%)',
          backgroundColor: '#0052CC'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/30 text-cyan-300 border border-blue-400/40">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                Pelan Tindakan Strategik (SPI ITQAN: menjana kualiti)
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white">
              Isu, Program Intervensi & Sekolah Fokus Tahun 2026
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Pelan tindakan rasmi bagi mengatasi kelemahan membaca Iqra 1-3, Iqra 4-6, strategi pecutan Khatam Al-Quran Juz 11-30, serta pemantauan bimbingan sekolah fokus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddIntervensi('IQRA 1-3')}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black bg-white text-blue-950 hover:bg-blue-50 shadow-md shadow-blue-950/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-blue-900" />
              <span>Tambah Program</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-blue-700/60 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('isu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'isu'
                ? 'bg-white text-blue-950 shadow-md font-black'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            📋 Isu & Intervensi (Iqra 1-3 & 4-6) - Hal. 7
          </button>
          <button
            onClick={() => setActiveTab('khatam')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'khatam'
                ? 'bg-white text-blue-950 shadow-md font-black'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            📖 Strategi Pelaksanaan Khatam (Juz 11-30) - Hal. 8
          </button>
          <button
            onClick={() => setActiveTab('sekolah-fokus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sekolah-fokus'
                ? 'bg-white text-blue-950 shadow-md font-black'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            🏫 Senarai Sekolah Fokus Tahun 2026 - Hal. 9
          </button>
        </div>
      </div>

      {/* TAB 1: Isu & Program / Intervensi (Page 7 of PDF) */}
      {activeTab === 'isu' && (
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ISU & PROGRAM / INTERVENSI (HALAMAN 7 PDF)
                </h2>
                <p className="text-xs text-slate-500">
                  Pelan tindakan intervensi bagi tahap Iqra 1-3 dan Iqra 4-6
                </p>
              </div>

              <button
                onClick={() => handleOpenAddIntervensi('IQRA 1-3')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Intervensi</span>
              </button>
            </div>

            {/* Table layout matching Page 7 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-extrabold uppercase text-slate-800 border-b border-slate-300">
                    <th className="py-3 px-4 border-r border-slate-300 w-32">ITEM</th>
                    <th className="py-3 px-4 border-r border-slate-300">ISU PEMBELAJARAN</th>
                    <th className="py-3 px-4 border-r border-slate-300">PROGRAM / INTERVENSI</th>
                    <th className="py-3 px-3 text-right">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* IQRA 1 - 3 */}
                  {intervensiList
                    .filter((i) => i.category === 'IQRA 1-3')
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        {idx === 0 && (
                          <td
                            rowSpan={intervensiList.filter((i) => i.category === 'IQRA 1-3').length || 1}
                            className="py-4 px-4 font-black text-sm text-red-700 bg-red-50/60 border-r border-slate-300 align-top"
                          >
                            IQRA 1 - 3
                          </td>
                        )}
                        <td className="py-3.5 px-4 border-r border-slate-300 align-top text-slate-800 font-medium">
                          {item.isu}
                          {item.sasaran && (
                            <span className="block text-[11px] text-slate-400 mt-1">
                              🎯 Sasaran: {item.sasaran}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-300 align-top">
                          <div className="font-bold text-slate-900 leading-relaxed">
                            {item.programIntervensi}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {item.status}
                            </span>
                            <span>•</span>
                            <span>{item.tempoh}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditIntervensi(item)}
                              className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteIntervensi(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* IQRA 4 - 6 */}
                  {intervensiList
                    .filter((i) => i.category === 'IQRA 4-6')
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 border-t-2 border-slate-300">
                        {idx === 0 && (
                          <td
                            rowSpan={intervensiList.filter((i) => i.category === 'IQRA 4-6').length || 1}
                            className="py-4 px-4 font-black text-sm text-amber-800 bg-yellow-50/60 border-r border-slate-300 align-top"
                          >
                            IQRA 4 - 6
                          </td>
                        )}
                        <td className="py-3.5 px-4 border-r border-slate-300 align-top text-slate-800 font-medium">
                          {item.isu}
                          {item.sasaran && (
                            <span className="block text-[11px] text-slate-400 mt-1">
                              🎯 Sasaran: {item.sasaran}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-300 align-top">
                          <div className="font-bold text-slate-900 leading-relaxed">
                            {item.programIntervensi}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {item.status}
                            </span>
                            <span>•</span>
                            <span>{item.tempoh}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditIntervensi(item)}
                              className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteIntervensi(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Strategi Pelaksanaan Khatam Al-Quran (Page 8 of PDF) */}
      {activeTab === 'khatam' && (
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase">
                  STRATEGI PELAKSANAAN KHATAM AL-QURAN (HALAMAN 8 PDF)
                </h2>
                <p className="text-xs text-slate-500">
                  Pelan tindakan intensif bagi murid berada pada Juz 11 hingga 30
                </p>
              </div>

              <button
                onClick={() => handleOpenAddIntervensi('JUZ 11-30')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Strategi</span>
              </button>
            </div>

            {/* Table layout matching Page 8 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-extrabold uppercase text-slate-800 border-b border-slate-300">
                    <th className="py-3 px-4 border-r border-slate-300 w-36">ITEM</th>
                    <th className="py-3 px-4 border-r border-slate-300">PROGRAM / INTERVENSI</th>
                    <th className="py-3 px-3 text-right">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {intervensiList
                    .filter((i) => i.category === 'JUZ 11-30')
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        {idx === 0 && (
                          <td
                            rowSpan={intervensiList.filter((i) => i.category === 'JUZ 11-30').length || 1}
                            className="py-4 px-4 font-black text-sm text-emerald-900 bg-emerald-100/60 border-r border-slate-300 align-top"
                          >
                            JUZ 11 - 30
                          </td>
                        )}
                        <td className="py-3.5 px-4 border-r border-slate-300 align-top">
                          <div className="font-bold text-slate-900 leading-relaxed text-sm">
                            {item.programIntervensi}
                          </div>
                          {item.isu && (
                            <p className="text-xs text-slate-600 mt-1 italic">
                              &ldquo;{item.isu}&rdquo;
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {item.status}
                            </span>
                            <span>•</span>
                            <span>Sasaran: {item.sasaran}</span>
                            <span>•</span>
                            <span>Penyelaras: {item.pegawaiPenyelaras}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditIntervensi(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteIntervensi(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Senarai Sekolah Fokus Tahun 2026 (Page 9 of PDF) */}
      {activeTab === 'sekolah-fokus' && (
        <div className="space-y-6">
          <div className="apple-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase">
                  SENARAI SEKOLAH FOKUS TAHUN 2026 (HALAMAN 9 PDF)
                </h2>
                <p className="text-xs text-slate-500">
                  Sekolah-sekolah sasaran bimbingan berfokus Unit Pendidikan Islam PPD Penampang
                </p>
              </div>

              <button
                onClick={handleOpenAddFokus}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-blue-700 to-indigo-700 text-white shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Daftar Sekolah Fokus Baharu</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-[11px] font-extrabold uppercase text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="py-3 px-4">Nama Sekolah & Kod</th>
                    <th className="py-3 px-3">Isu Utama / Rasional Fokus</th>
                    <th className="py-3 px-3">Tindakan Intervensi UPI</th>
                    <th className="py-3 px-3">Tarikh Lawatan</th>
                    <th className="py-3 px-3">Pegawai Pembimbing</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {sekolahFokusList.map((fok) => (
                    <tr key={fok.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {fok.schoolName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {fok.schoolCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {fok.fokusIsu}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-800">
                        {fok.tindakanIntervensi}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-600">
                        {fok.tarikhBimbingan}
                      </td>

                      <td className="py-3.5 px-3 text-slate-800">
                        {fok.pegawaiBimbingan}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            fok.statusTindakan === 'Selesai Bimbingan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fok.statusTindakan === 'Dalam Pemantauan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {fok.statusTindakan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditFokus(fok)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSekolahFokus(fok.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Intervensi */}
      {isIntervensiModalOpen && editingIntervensi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveIntervensiForm}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Program Intervensi ({editingIntervensi.category})
              </h3>
              <button
                type="button"
                onClick={() => setIsIntervensiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Tahap</label>
                <select
                  value={editingIntervensi.category}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setEditingIntervensi({ ...editingIntervensi, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value="IQRA 1-3">IQRA 1 - 3 (Kritikal)</option>
                  <option value="IQRA 4-6">IQRA 4 - 6 (Peralihan)</option>
                  <option value="JUZ 11-30">JUZ 11 - 30 (Pecutan Khatam)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Isu Pembelajaran / Cabaran</label>
                <textarea
                  rows={2}
                  required
                  value={editingIntervensi.isu}
                  onChange={(e) => setEditingIntervensi({ ...editingIntervensi, isu: e.target.value })}
                  placeholder="Huraian isu seperti kekeliruan makhraj, kelambatan membaca, dll."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Program / Intervensi Khusus</label>
                <textarea
                  rows={2}
                  required
                  value={editingIntervensi.programIntervensi}
                  onChange={(e) =>
                    setEditingIntervensi({ ...editingIntervensi, programIntervensi: e.target.value })
                  }
                  placeholder="Contoh: Kem Literasi Al-Quran j-QAF, Bimbingan 1-ke-1, Modul Fonik Bersanad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kumpulan Sasaran</label>
                  <input
                    type="text"
                    value={editingIntervensi.sasaran}
                    onChange={(e) => setEditingIntervensi({ ...editingIntervensi, sasaran: e.target.value })}
                    placeholder="Contoh: Murid Tahun 1 - 3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tempoh Pelaksanaan</label>
                  <input
                    type="text"
                    value={editingIntervensi.tempoh}
                    onChange={(e) => setEditingIntervensi({ ...editingIntervensi, tempoh: e.target.value })}
                    placeholder="Contoh: Mac - Ogos 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pegawai / GPI Penyelaras</label>
                  <input
                    type="text"
                    value={editingIntervensi.pegawaiPenyelaras}
                    onChange={(e) =>
                      setEditingIntervensi({ ...editingIntervensi, pegawaiPenyelaras: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Pelaksanaan</label>
                  <select
                    value={editingIntervensi.status}
                    onChange={(e) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setEditingIntervensi({ ...editingIntervensi, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Dalam Pelaksanaan">Dalam Pelaksanaan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Perancangan">Perancangan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsIntervensiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Intervensi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add / Edit Sekolah Fokus */}
      {isFokusModalOpen && editingFokus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveFokusForm}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Daftar / Kemaskini Sekolah Fokus Tahun 2026
              </h3>
              <button
                type="button"
                onClick={() => setIsFokusModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Sekolah Sasaran</label>
                <select
                  value={editingFokus.schoolName}
                  onChange={(e) => {
                    const sel = schools.find((s) => s.schoolName === e.target.value);
                    setEditingFokus({
                      ...editingFokus,
                      schoolName: e.target.value,
                      schoolCode: sel?.schoolCode || editingFokus.schoolCode
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.schoolName}>
                      {s.schoolName} ({s.schoolCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fokus Isu Utama</label>
                <select
                  value={editingFokus.fokusIsu}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setEditingFokus({ ...editingFokus, fokusIsu: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value="Iqra 1-3 Melebihi Sasaran">Iqra 1-3 Melebihi Sasaran</option>
                  <option value="Peralihan Al-Quran Perlahan">Peralihan Al-Quran Perlahan</option>
                  <option value="Sasaran Khatam Rendah">Sasaran Khatam Rendah</option>
                  <option value="Bimbingan Pedagogi GPI">Bimbingan Pedagogi GPI</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tindakan Intervensi UPI</label>
                <textarea
                  rows={2}
                  required
                  value={editingFokus.tindakanIntervensi}
                  onChange={(e) =>
                    setEditingFokus({ ...editingFokus, tindakanIntervensi: e.target.value })
                  }
                  placeholder="Contoh: Lawatan Bimbingan Instruksional Berfokus & bengkel kaedah fonik hijaiyyah pantas."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tarikh Lawatan Bimbingan</label>
                  <input
                    type="date"
                    required
                    value={editingFokus.tarikhBimbingan}
                    onChange={(e) =>
                      setEditingFokus({ ...editingFokus, tarikhBimbingan: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pegawai Pembimbing</label>
                  <input
                    type="text"
                    required
                    value={editingFokus.pegawaiBimbingan}
                    onChange={(e) =>
                      setEditingFokus({ ...editingFokus, pegawaiBimbingan: e.target.value })
                    }
                    placeholder="Contoh: Ustazah Norazlin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status Tindakan</label>
                <select
                  value={editingFokus.statusTindakan}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setEditingFokus({ ...editingFokus, statusTindakan: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value="Akan Dilawati">Akan Dilawati</option>
                  <option value="Dalam Pemantauan">Dalam Pemantauan</option>
                  <option value="Selesai Bimbingan">Selesai Bimbingan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFokusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Rekod Sekolah Fokus</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
