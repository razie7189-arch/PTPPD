import React from 'react';
import { PageId } from '../types';
import { Flame, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto bg-white border-t border-blue-100 text-slate-500 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_ec77c1d2.png"
              alt="Logo Portal Pelaporan Tasmik"
              className="w-12 h-10 object-contain drop-shadow-xs"
            />
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Portal Pelaporan Tasmik Daerah Penampang</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                  UPI PPD Penampang
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pejabat Pendidikan Daerah Penampang, Peti Surat 297, 89507 Penampang, Sabah
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('status-pelaporan')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Status Pelaporan
            </button>
            <button
              onClick={() => onNavigate('graf-tasmik')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Graf & KPI 95%
            </button>
            <button
              onClick={() => onNavigate('takwim')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Takwim UPI
            </button>
            <button
              onClick={() => onNavigate('pegawai')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Barisan Pegawai
            </button>
            <button
              onClick={() => onNavigate('dokumen-pdf')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Dokumen & PDF
            </button>
            <button
              onClick={() => onNavigate('tetapan')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Tetapan Supabase
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Unit Pendidikan Islam, Pejabat Pendidikan Daerah Penampang. Hak Cipta Terpelihara.</p>
          <div className="flex items-center gap-1">
            <span>Dibina untuk pengurusan Tasmik Al-Quran & j-QAF Penampang</span>
            <Flame className="w-3 h-3 text-orange-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
