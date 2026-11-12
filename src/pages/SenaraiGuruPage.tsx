import React, { useState, useMemo } from 'react';
import { Teacher, TasmikSchoolRecord } from '../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Save,
  Download,
  School,
  FileSpreadsheet
} from 'lucide-react';

interface SenaraiGuruPageProps {
  teachers: Teacher[];
  schools: TasmikSchoolRecord[];
  onSaveTeacher: (teacher: Teacher) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
}

export const SenaraiGuruPage: React.FC<SenaraiGuruPageProps> = ({
  teachers,
  schools,
  onSaveTeacher,
  onDeleteTeacher
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('Semua');
  const [selectedRole, setSelectedRole] = useState<string>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const schoolNames = useMemo(() => {
    const names = Array.from(new Set(schools.map((s) => s.schoolName)));
    return ['Semua', ...names];
  }, [schools]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSchool = selectedSchool === 'Semua' || t.schoolName === selectedSchool;
      const matchRole = selectedRole === 'Semua' || t.role === selectedRole;

      return matchSearch && matchSchool && matchRole;
    });
  }, [teachers, searchTerm, selectedSchool, selectedRole]);

  const handleOpenAdd = () => {
    setEditingTeacher({
      id: 'tch-' + Date.now(),
      name: '',
      icNumber: '',
      schoolName: schools[0]?.schoolName || 'SK Bahang',
      grade: 'DG41',
      role: 'Guru Penyelaras Tasmik',
      phone: '01X-XXXXXXX',
      email: '',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editingTeacher.name) return;
    setIsSaving(true);
    await onSaveTeacher(editingTeacher);
    setIsSaving(false);
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleExportCSV = () => {
    const headers = ['Nama Guru', 'No. K/P', 'Sekolah', 'Gred', 'Peranan', 'No. Telefon', 'Emel', 'Status'];
    const rows = filteredTeachers.map((t) => [
      `"${t.name}"`,
      `"${t.icNumber || ''}"`,
      `"${t.schoolName}"`,
      `"${t.grade}"`,
      `"${t.role}"`,
      `"${t.phone}"`,
      `"${t.email}"`,
      `"${t.status}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Senarai_Guru_Tasmik_Penampang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Pengurusan Guru Tasmik & Guru Pendidikan Islam
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pangkalan data guru mata pelajaran Pendidikan Islam, penyelaras tasmik dan guru j-QAF sekolah-sekolah daerah Penampang (Full CRUD).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Muat Turun CSV</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari guru, sekolah, telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              {schoolNames.map((sn) => (
                <option key={sn} value={sn}>
                  {sn === 'Semua' ? 'Semua Sekolah Penampang' : sn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Peranan Guru</option>
              <option value="Guru Penyelaras Tasmik">Guru Penyelaras Tasmik</option>
              <option value="Guru Pendidikan Islam">Guru Pendidikan Islam (GPI)</option>
              <option value="Guru j-QAF">Guru j-QAF</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Guru</th>
                <th className="py-3.5 px-3">Sekolah</th>
                <th className="py-3.5 px-3">Gred</th>
                <th className="py-3.5 px-3">Peranan</th>
                <th className="py-3.5 px-3">Hubungi</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tiada maklumat guru dijumpai.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{teacher.name}</div>
                      {teacher.icNumber && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {teacher.icNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{teacher.schoolName}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                        {teacher.grade}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                        {teacher.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-orange-500" />
                          <a href={`tel:${teacher.phone}`} className="hover:underline">
                            {teacher.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${teacher.email}`} className="hover:underline truncate max-w-[150px]">
                            {teacher.email}
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          teacher.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(teacher)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                          title="Sunting Guru"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Adakah anda pasti ingin memadam nama "${teacher.name}"?`)) {
                              onDeleteTeacher(teacher.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Padam Guru"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Teacher */}
      {isModalOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSave}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingTeacher.id.includes(Date.now().toString().slice(0, 5))
                  ? 'Tambah Guru Tasmik Baharu'
                  : 'Sunting Maklumat Guru'}
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
                <label className="block text-slate-700 font-bold mb-1">Nama Penuh Guru</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  placeholder="Contoh: Ustaz Ahmad Faizal bin Kassim"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sekolah Bertugas</label>
                <select
                  value={editingTeacher.schoolName}
                  onChange={(e) =>
                    setEditingTeacher({ ...editingTeacher, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.schoolName}>
                      {s.schoolName} ({s.schoolCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gred Jawatan</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.grade}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, grade: e.target.value })
                    }
                    placeholder="DG41 / DG44"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Peranan Guru</label>
                  <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={editingTeacher.role}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Guru Penyelaras Tasmik">Guru Penyelaras Tasmik</option>
                    <option value="Guru Pendidikan Islam">Guru Pendidikan Islam (GPI)</option>
                    <option value="Guru j-QAF">Guru j-QAF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">No. Telefon</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.phone}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, phone: e.target.value })
                    }
                    placeholder="013-XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Emel Rasmi MOE</label>
                  <input
                    type="email"
                    required
                    value={editingTeacher.email}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, email: e.target.value })
                    }
                    placeholder="nama@moe.edu.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">No. Kad Pengenalan (Pilihan)</label>
                  <input
                    type="text"
                    value={editingTeacher.icNumber || ''}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, icNumber: e.target.value })
                    }
                    placeholder="XXXXXX-XX-XXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Keberadaan</label>
                  <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={editingTeacher.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti Belajar">Cuti Belajar</option>
                    <option value="Pertukaran">Pertukaran</option>
                  </select>
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
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Maklumat Guru'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
