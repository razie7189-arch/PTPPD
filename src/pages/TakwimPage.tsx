import React, { useState, useMemo } from 'react';
import { TakwimEvent } from '../types';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Save,
  Printer,
  Sparkles
} from 'lucide-react';

interface TakwimPageProps {
  takwim: TakwimEvent[];
  onSaveTakwim: (event: TakwimEvent) => Promise<void>;
  onDeleteTakwim: (id: string) => Promise<void>;
}

export const TakwimPage: React.FC<TakwimPageProps> = ({
  takwim,
  onSaveTakwim,
  onDeleteTakwim
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TakwimEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ['Semua', 'Tasmik', 'j-QAF', 'Dakwah', 'Mesyuarat', 'Bengkel', 'Peperiksaan'];

  const filteredTakwim = useMemo(() => {
    return takwim.filter((evt) => {
      const matchSearch =
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'Semua' || evt.category === selectedCategory;
      const matchStatus = selectedStatus === 'Semua' || evt.status === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [takwim, searchTerm, selectedCategory, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingEvent({
      id: 'tkw-' + Date.now(),
      title: '',
      date: '',
      month: 'Januari',
      category: 'Tasmik',
      venue: '',
      targetAudience: '',
      status: 'Akan Datang',
      coordinator: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: TakwimEvent) => {
    setEditingEvent({ ...evt });
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;
    setIsSaving(true);
    await onSaveTakwim(editingEvent);
    setIsSaving(false);
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <CalendarDays className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Takwim Unit Pendidikan Islam PPD Penampang
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kalendar aktiviti tahunan, mesyuarat, kursus dan pemantauan Tasmik & j-QAF 2026.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Takwim</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Acara Takwim</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari program, tempat, sasaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Kategori: {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Selesai">Selesai</option>
              <option value="Tangguh">Tangguh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Timeline / Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTakwim.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Tiada program takwim yang sepadan dengan pilihan anda.
          </div>
        ) : (
          filteredTakwim.map((evt) => {
            const isCompleted = evt.status === 'Selesai';
            return (
              <div
                key={evt.id}
                className="apple-card rounded-3xl p-5.5 flex flex-col justify-between hover:border-orange-300 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800">
                      📅 {evt.date}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.status === 'Tangguh'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">
                      {evt.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Sasaran: {evt.targetAudience}</span>
                    </div>
                    {evt.coordinator && (
                      <div className="text-[11px] text-slate-500">
                        Penyelaras: <span className="font-semibold">{evt.coordinator}</span>
                      </div>
                    )}
                    {evt.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1">
                        &ldquo;{evt.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    title="Sunting Acara"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Padam acara "${evt.title}"?`)) {
                        onDeleteTakwim(evt.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Padam Acara"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Takwim */}
      {isModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveForm}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEvent.id.includes(Date.now().toString().slice(0, 5))
                  ? 'Tambah Acara Takwim Baharu'
                  : 'Sunting Acara Takwim'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Program / Acara</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Contoh: Bengkel Verifikasi Tasmik Fasa 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tarikh Pelaksanaan</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="Contoh: 28 Oktober 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori Program</label>
                  <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={editingEvent.category}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Tasmik">Tasmik</option>
                    <option value="j-QAF">j-QAF</option>
                    <option value="Dakwah">Dakwah</option>
                    <option value="Mesyuarat">Mesyuarat</option>
                    <option value="Bengkel">Bengkel</option>
                    <option value="Peperiksaan">Peperiksaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tempat / Lokasi</label>
                <input
                  type="text"
                  required
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  placeholder="Contoh: Bilik Mesyuarat PPD Penampang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kumpulan Sasaran</label>
                <input
                  type="text"
                  required
                  value={editingEvent.targetAudience}
                  onChange={(e) => setEditingEvent({ ...editingEvent, targetAudience: e.target.value })}
                  placeholder="Contoh: Semua Penyelaras Tasmik Rendah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pegawai Penyelaras</label>
                  <input
                    type="text"
                    value={editingEvent.coordinator || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, coordinator: e.target.value })}
                    placeholder="Contoh: Ustazah Norazlin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={editingEvent.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Tangguh">Tangguh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editingEvent.notes || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  placeholder="Catatan penceramah, keperluan fail, dll."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Acara'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
