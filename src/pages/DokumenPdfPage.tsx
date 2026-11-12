import React, { useState } from 'react';
import { DocumentPdf } from '../types';
import {
  FileText,
  Plus,
  ExternalLink,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Trash2,
  Edit2,
  X,
  Save,
  BookOpen,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface DokumenPdfPageProps {
  documents: DocumentPdf[];
  onSaveDocument: (doc: DocumentPdf) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const DokumenPdfPage: React.FC<DokumenPdfPageProps> = ({
  documents,
  onSaveDocument,
  onDeleteDocument
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentPdf | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleOpenAdd = () => {
    setEditingDoc({
      id: 'doc-' + Date.now(),
      title: '',
      category: 'Buku Panduan',
      description: '',
      googleDriveEmbedUrl: '',
      downloadUrl: '',
      dateUpdated: new Date().toISOString().split('T')[0],
      fileSize: '2.5 MB'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentPdf) => {
    setEditingDoc({ ...doc });
    setIsModalOpen(true);
  };

  // Helper to ensure Google Drive URL has /preview format for <iframe>
  const normalizeGoogleDriveEmbed = (url: string): string => {
    let clean = url.trim();
    if (clean.includes('drive.google.com/file/d/')) {
      const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return clean;
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editingDoc.title) return;

    setIsSaving(true);
    const preparedDoc = {
      ...editingDoc,
      googleDriveEmbedUrl: normalizeGoogleDriveEmbed(editingDoc.googleDriveEmbedUrl)
    };

    await onSaveDocument(preparedDoc);
    setIsSaving(false);
    setIsModalOpen(false);
    setSelectedDocId(preparedDoc.id);
    setEditingDoc(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="apple-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Pusat Dokumen & Modul Tasmik (PDF Iframe Reader)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Komponen Iframe Google Drive interaktif untuk membaca dokumen rasmi DSKP, Buku Panduan j-QAF, pekeliling, dan format borang secara langsung.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dokumen / URL PDF</span>
          </button>
        </div>
      </div>

      {/* Main Reader View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Document Selection Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Senarai Dokumen Rasmi ({documents.length})
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = doc.id === currentDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                      : 'bg-white hover:bg-blue-50/60 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {doc.category}
                    </span>
                    {doc.fileSize && (
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {doc.fileSize}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold mt-2 line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>

                  <p
                    className={`text-[11px] mt-1 line-clamp-2 ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/10 text-[10px]">
                    <span className={isSelected ? 'text-blue-300' : 'text-slate-400'}>
                      Kemaskini: {doc.dateUpdated}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className={`p-1 rounded hover:bg-white/20 transition-colors ${
                          isSelected ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="Sunting Dokumen"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Padam fail "${doc.title}"?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className={`p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-600 transition-colors`}
                        title="Padam Dokumen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Embedded PDF Viewer Frame */}
        <div
          className={`lg:col-span-3 apple-card rounded-3xl overflow-hidden flex flex-col ${
            isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'min-h-[700px]'
          }`}
        >
          {/* Top Reader Controls */}
          {currentDoc && (
            <div className="bg-blue-950 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500 text-white">
                    {currentDoc.category}
                  </span>
                  <span className="text-xs text-blue-300 hidden sm:inline">
                    Disahkan oleh UPI PPD Penampang
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white truncate mt-1">
                  {currentDoc.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentDoc.downloadUrl && (
                  <a
                    href={currentDoc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Muat Turun</span>
                  </a>
                )}

                <a
                  href={currentDoc.googleDriveEmbedUrl.replace('/preview', '/view')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Tab Baharu</span>
                </a>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Keluar Skrin Penuh' : 'Skrin Penuh'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Iframe Container */}
          <div className="flex-1 bg-slate-100 relative min-h-[620px]">
            {currentDoc ? (
              <iframe
                key={currentDoc.id}
                src={currentDoc.googleDriveEmbedUrl}
                title={currentDoc.title}
                className="w-full h-full min-h-[620px] border-0"
                allow="autoplay"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Sila pilih dokumen untuk dibaca.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Document */}
      {isModalOpen && editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveForm}
            className="apple-card bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDoc.id.includes(Date.now().toString().slice(0, 5))
                  ? 'Tambah Dokumen / Fail PDF Google Drive'
                  : 'Sunting Pautan Dokumen'}
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
                <label className="block text-slate-700 font-bold mb-1">Tajuk Dokumen / Fail</label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  placeholder="Contoh: Modul Bimbingan Khatam Al-Quran 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori Fail</label>
                  <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={editingDoc.category}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Buku Panduan">Buku Panduan</option>
                    <option value="DSKP">DSKP</option>
                    <option value="Modul Tasmik">Modul Tasmik</option>
                    <option value="Pekeliling">Pekeliling</option>
                    <option value="Borang & Format">Borang & Format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Saiz Fail (Anggaran)</label>
                  <input
                    type="text"
                    value={editingDoc.fileSize || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, fileSize: e.target.value })}
                    placeholder="Contoh: 3.5 MB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pautan URL Google Drive (Embed Iframe)
                </label>
                <input
                  type="url"
                  required
                  value={editingDoc.googleDriveEmbedUrl}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, googleDriveEmbedUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/.../preview"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * Pautan perkongsian biasa Google Drive akan ditukar secara automatik ke mod Pratonton Iframe (/preview).
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pautan Muat Turun Terus (Pilihan)
                </label>
                <input
                  type="url"
                  value={editingDoc.downloadUrl || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, downloadUrl: e.target.value })}
                  placeholder="https://drive.google.com/.../view?usp=sharing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Huraian Ringkas Fail</label>
                <textarea
                  rows={2}
                  value={editingDoc.description}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  placeholder="Maklumat kandungan dokumen..."
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
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Dokumen'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
