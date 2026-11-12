import React, { useState } from 'react';
import { Officer } from '../types';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Save,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface PegawaiPageProps {
  officers: Officer[];
  onSaveOfficer: (officer: Officer) => Promise<void>;
  onDeleteOfficer: (id: string) => Promise<void>;
}

export const PegawaiPage: React.FC<PegawaiPageProps> = ({
  officers,
  onSaveOfficer,
  onDeleteOfficer
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAddModal = () => {
    setEditingOfficer({
      id: 'off-' + Date.now(),
      name: '',
      designation: '',
      roleDescription: '',
      grade: 'DG44',
      sector: 'Unit Pendidikan Islam, PPD Penampang',
      phone: '088-712892',
      email: '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      order: officers.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (off: Officer) => {
    setEditingOfficer({ ...off });
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficer || !editingOfficer.name) return;
    setIsSaving(true);
    await onSaveOfficer(editingOfficer);
    setIsSaving(false);
    setIsModalOpen(false);
    setEditingOfficer(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Barisan Pegawai Unit Pendidikan Islam PPD Penampang
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Direktori kepimpinan, carta organisasi, dan senarai pegawai meja Tasmik, j-QAF, dan kurikulum Islam daerah Penampang, Sabah.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      {/* Leadership Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officers.map((officer, index) => {
          return (
            <div
              key={officer.id}
              className="apple-card rounded-3xl p-6 flex flex-col justify-between hover:border-orange-300 transition-all group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={officer.avatarUrl}
                      alt={officer.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] font-bold flex items-center justify-center border border-white">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Gred {officer.grade}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {officer.name}
                    </h3>
                    <p className="text-xs font-semibold text-orange-600 mt-0.5">
                      {officer.designation}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <p className="line-clamp-3">{officer.roleDescription}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">{officer.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <a
                      href={`tel:${officer.phone.split('/')[0].trim()}`}
                      className="font-mono text-slate-800 hover:text-orange-600 transition-colors"
                    >
                      {officer.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <a
                      href={`mailto:${officer.email}`}
                      className="text-slate-800 hover:text-orange-600 truncate transition-colors"
                    >
                      {officer.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Susunan #{officer.order}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(officer)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    title="Sunting Pegawai"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Padam profil pegawai "${officer.name}"?`)) {
                        onDeleteOfficer(officer.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Padam Pegawai"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Officer */}
      {isModalOpen && editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveForm}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingOfficer.id.includes(Date.now().toString().slice(0, 5))
                  ? 'Tambah Pegawai Baharu'
                  : 'Sunting Profil Pegawai'}
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
                <label className="block text-slate-700 font-bold mb-1">Nama Penuh & Gelaran</label>
                <input
                  type="text"
                  required
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  placeholder="Contoh: Ustazah Norazlin binti Abdul Rahman"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jawatan Rasmi</label>
                  <input
                    type="text"
                    required
                    value={editingOfficer.designation}
                    onChange={(e) =>
                      setEditingOfficer({ ...editingOfficer, designation: e.target.value })
                    }
                    placeholder="Contoh: Pegawai Meja Tasmik"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gred Jawatan</label>
                  <input
                    type="text"
                    required
                    value={editingOfficer.grade}
                    onChange={(e) =>
                      setEditingOfficer({ ...editingOfficer, grade: e.target.value })
                    }
                    placeholder="Contoh: DG44"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bidang Tugas & Peranan</label>
                <textarea
                  rows={3}
                  required
                  value={editingOfficer.roleDescription}
                  onChange={(e) =>
                    setEditingOfficer({ ...editingOfficer, roleDescription: e.target.value })
                  }
                  placeholder="Huraian ringkas bidang kuasa dan fokus tugas pegawai..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">No. Telefon</label>
                  <input
                    type="text"
                    required
                    value={editingOfficer.phone}
                    onChange={(e) =>
                      setEditingOfficer({ ...editingOfficer, phone: e.target.value })
                    }
                    placeholder="Contoh: 013-8821942"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Emel Rasmi KPM</label>
                  <input
                    type="email"
                    required
                    value={editingOfficer.email}
                    onChange={(e) =>
                      setEditingOfficer({ ...editingOfficer, email: e.target.value })
                    }
                    placeholder="nama@moe.gov.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL Gambar Profil</label>
                <input
                  type="url"
                  value={editingOfficer.avatarUrl}
                  onChange={(e) =>
                    setEditingOfficer({ ...editingOfficer, avatarUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sektor / Unit</label>
                  <input
                    type="text"
                    value={editingOfficer.sector}
                    onChange={(e) =>
                      setEditingOfficer({ ...editingOfficer, sector: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Susunan Keutamaan</label>
                  <input
                    type="number"
                    min="1"
                    value={editingOfficer.order}
                    onChange={(e) =>
                      setEditingOfficer({
                        ...editingOfficer,
                        order: parseInt(e.target.value) || 1
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-center"
                  />
                </div>
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
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pegawai'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
