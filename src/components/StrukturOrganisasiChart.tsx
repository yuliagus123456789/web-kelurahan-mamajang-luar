import { useState } from 'react';
import { KELURAHAN_CONFIG } from '@/lib/config';
import {
  Landmark,
  Briefcase,
  ClipboardList,
  Shield,
  Award,
  Users,
  Phone,
  ArrowDown,
  Home,
  Layers,
  ChevronDown,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface StrukturOrganisasiChartProps {
  onNavigateToRtRw?: () => void;
}

export default function StrukturOrganisasiChart({ onNavigateToRtRw }: StrukturOrganisasiChartProps) {
  const [viewMode, setViewMode] = useState<'bagan' | 'grid'>('bagan');
  const aparatur = KELURAHAN_CONFIG.aparatur;

  // Staf kesekretariatan & operasional (di bawah Seklur)
  const stafSekretariat = aparatur.staf.filter(
    (s) =>
      s.jabatan.includes('Pengadministrasi') ||
      s.jabatan.includes('Operator')
  );

  // Staf teknis kewilayahan, trantib & rohani (di bawah Kasi / mitra pelayanan)
  const stafKewilayahan = aparatur.staf.filter(
    (s) =>
      s.jabatan.includes('Satlinmas') ||
      s.jabatan.includes('Trantib') ||
      s.jabatan.includes('Imam')
  );

  return (
    <div className="space-y-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-makassar-50 text-makassar-800 border border-makassar-200 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              Hierarki Resmi Pemerintahan
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">&bull; Berdasarkan Perda Kota Makassar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            Bagan Struktur Organisasi Kelurahan
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Garis komando, koordinasi administratif, dan pembinaan kewilayahan warga Mamajang Luar.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl shrink-0 border border-stone-200">
          <button
            onClick={() => setViewMode('bagan')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'bagan'
                ? 'bg-makassar-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Bagan Hierarki
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-makassar-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Daftar Kartu
          </button>
        </div>
      </div>

      {/* TAMPILAN 1: BAGAN HIERARKI DENGAN GARIS-GARIS PENGHUBUNG */}
      {viewMode === 'bagan' && (
        <div className="relative py-4">
          {/* LEVEL 1: LURAH (KEPALA KELURAHAN) */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-full max-w-lg">
              <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-makassar-900 via-makassar-800 to-stone-950 text-white text-center shadow-2xl border-2 border-gold-400/40 overflow-hidden group hover:border-gold-400 transition-all">
                {/* Background glow & accents */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-gold-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-makassar-600/30 rounded-full blur-xl pointer-events-none" />

                {/* Level Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-[11px] font-bold tracking-wider uppercase mb-3 border border-gold-500/30">
                  <Award className="w-3.5 h-3.5 text-gold-400" />
                  Pimpinan Kelurahan &bull; Tingkat I
                </div>

                {/* Avatar Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-300 p-1 mx-auto mb-3.5 shadow-lg group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-xl bg-makassar-900 flex items-center justify-center text-white">
                    <Landmark className="w-9 h-9 text-gold-300" />
                  </div>
                </div>

                <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                  {aparatur.lurah.nama}
                </h3>
                <p className="text-gold-300 text-xs sm:text-sm font-semibold mt-1 font-mono">
                  NIP. {aparatur.lurah.nip}
                </p>
                <div className="flex items-center justify-center gap-2 text-stone-300 text-xs mt-1">
                  <span className="px-2 py-0.5 rounded bg-white/10">{aparatur.lurah.pangkat}</span>
                  <span>&bull;</span>
                  <span className="text-gold-200">{aparatur.lurah.jabatan}</span>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/62${aparatur.lurah.kontak.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kontak Resmi: {aparatur.lurah.kontak}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* GARIS PENGHUBUNG 1: Dari Lurah ke Percabangan Pejabat Struktural */}
            <div className="flex flex-col items-center">
              {/* Garis vertikal atas */}
              <div className="w-1 h-8 bg-gradient-to-b from-gold-500 to-makassar-600" />
              {/* Node persimpangan */}
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-makassar-800 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                </div>
                <div className="absolute left-7 top-0 -translate-y-1/2 whitespace-nowrap hidden sm:block">
                  <span className="px-2 py-0.5 rounded-full bg-makassar-100 text-makassar-900 text-[10px] font-bold border border-makassar-200">
                    Garis Komando & Koordinasi
                  </span>
                </div>
              </div>
              {/* Garis vertikal bawah menuju jembatan horizontal */}
              <div className="w-1 h-6 bg-makassar-600" />
            </div>
          </div>

          {/* JEMBATAN HORIZONTAL DESKTOP (Menghubungkan Seklur di kiri & Kasi di kanan) */}
          <div className="hidden md:block relative max-w-4xl mx-auto">
            {/* Garis horizontal pembagi dua sayap */}
            <div className="h-1 bg-makassar-600 rounded-full w-full relative">
              {/* Titik sudut kiri */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-700 border-2 border-white shadow" />
              {/* Titik sudut kanan */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-emerald-700 border-2 border-white shadow" />
              {/* Titik tengah penyambung dari Lurah */}
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-makassar-800 border-2 border-white shadow" />
            </div>

            {/* Garis drop vertikal ke masing-masing pilar */}
            <div className="grid grid-cols-2">
              <div className="flex justify-center">
                <div className="w-1 h-7 bg-blue-600 flex items-end justify-center">
                  <ChevronDown className="w-4 h-4 text-blue-700 -mb-2" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-1 h-7 bg-emerald-600 flex items-end justify-center">
                  <ChevronDown className="w-4 h-4 text-emerald-700 -mb-2" />
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 2 & 3: DUA PILAR STRUKTURAL (KIRI: SEKRETARIAT & KANAN: PEMERINTAHAN/TRANTIB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
            {/* ================= PILAR KIRI: BIDANG KESEKRETARIATAN ================= */}
            <div className="flex flex-col items-center relative">
              {/* Garis vertikal mobile */}
              <div className="md:hidden flex flex-col items-center my-2">
                <div className="w-1 h-4 bg-blue-600" />
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold mb-1">
                  Sayap Kesekretariatan
                </span>
              </div>

              {/* KARTU SEKLUR */}
              <div className="w-full bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-md hover:border-blue-400 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                        {aparatur.seklur.jabatan}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold hidden sm:inline">Tingkat II</span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-base sm:text-lg mt-1.5">
                      {aparatur.seklur.nama}
                    </h4>
                    <p className="text-xs text-stone-500 font-mono font-medium mt-0.5">
                      NIP. {aparatur.seklur.nip}
                    </p>
                    <p className="text-xs text-blue-700 font-semibold mt-1">
                      {aparatur.seklur.pangkat} &bull; Urusan Tata Kelola Administrasi
                    </p>
                  </div>
                </div>
              </div>

              {/* GARIS PENGHUBUNG DARI SEKLUR KE STAF KESEKRETARIATAN */}
              <div className="flex flex-col items-center">
                <div className="w-1 h-6 bg-blue-500" />
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <ArrowDown className="w-3 h-3 text-blue-600" />
                  Pelaksana Administrasi & Operasional
                </div>
                <div className="w-1 h-5 bg-blue-400" />
              </div>

              {/* DAFTAR STAF KESEKRETARIATAN & OPERASIONAL DENGAN GARIS CABANG */}
              <div className="w-full space-y-3.5 relative pl-4 sm:pl-6 border-l-2 border-blue-300 ml-4 sm:ml-6">
                {stafSekretariat.map((staf, idx) => (
                  <div key={staf.nama} className="relative group">
                    {/* Garis horizontal konektor cabang */}
                    <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-0.5 bg-blue-300" />
                    {/* Titik node cabang */}
                    <div className="absolute -left-[21px] sm:-left-[29px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" />

                    <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        {idx === 0 ? <UserCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase tracking-wider">
                          {staf.jabatan}
                        </span>
                        <h5 className="font-bold text-stone-900 text-sm mt-1 truncate">
                          {staf.nama}
                        </h5>
                        {staf.nip && (
                          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                            NIP. {staf.nip}
                          </p>
                        )}
                        {staf.pangkat && (
                          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                            {staf.pangkat}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= PILAR KANAN: BIDANG PEMERINTAHAN & TRANTIB ================= */}
            <div className="flex flex-col items-center relative">
              {/* Garis vertikal mobile */}
              <div className="md:hidden flex flex-col items-center my-2">
                <div className="w-1 h-4 bg-emerald-600" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold mb-1">
                  Sayap Pemerintahan & Trantib
                </span>
              </div>

              {/* KARTU KASI PEMERINTAHAN */}
              <div className="w-full bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-md hover:border-emerald-400 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        {aparatur.kasiPemerintahan.jabatan}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold hidden sm:inline">Tingkat II</span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-base sm:text-lg mt-1.5">
                      {aparatur.kasiPemerintahan.nama}
                    </h4>
                    <p className="text-xs text-stone-500 font-mono font-medium mt-0.5">
                      NIP. {aparatur.kasiPemerintahan.nip}
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                      {aparatur.kasiPemerintahan.pangkat} &bull; Urusan Ketertiban & Kewilayahan
                    </p>
                  </div>
                </div>
              </div>

              {/* GARIS PENGHUBUNG DARI KASI KE STAF TEKNIS / MITRA KEWILAYAHAN */}
              <div className="flex flex-col items-center">
                <div className="w-1 h-6 bg-emerald-500" />
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <ArrowDown className="w-3 h-3 text-emerald-600" />
                  Pelaksana Ketentraman, Linmas & Pembina
                </div>
                <div className="w-1 h-5 bg-emerald-400" />
              </div>

              {/* DAFTAR STAF TRANTIB & ROHANI DENGAN GARIS CABANG */}
              <div className="w-full space-y-3.5 relative pl-4 sm:pl-6 border-l-2 border-emerald-300 ml-4 sm:ml-6">
                {stafKewilayahan.map((staf) => (
                  <div key={staf.nama} className="relative group">
                    {/* Garis horizontal konektor cabang */}
                    <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-0.5 bg-emerald-300" />
                    {/* Titik node cabang */}
                    <div className="absolute -left-[21px] sm:-left-[29px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" />

                    <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        {staf.jabatan.includes('Linmas') ? (
                          <Shield className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <Award className="w-5 h-5 text-amber-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase tracking-wider">
                          {staf.jabatan}
                        </span>
                        <h5 className="font-bold text-stone-900 text-sm mt-1 truncate">
                          {staf.nama}
                        </h5>
                        {staf.kontak ? (
                          <a
                            href={`https://wa.me/62${staf.kontak.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" /> Siaga: {staf.kontak}
                          </a>
                        ) : (
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Pembina Rohani & Kerukunan Warga
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= LEVEL 4: GARIS TERSAMBUNG KE LEMBAGA KEMASYARAKATAN (RW & RT) ================= */}
          <div className="mt-12 pt-8 relative">
            {/* Garis vertikal penyambung dari jajaran atas ke bawah */}
            <div className="flex flex-col items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-stone-400 to-makassar-600" />
              <div className="w-5 h-5 rounded-full bg-makassar-700 border-2 border-white shadow flex items-center justify-center">
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="w-1 h-6 bg-makassar-600" />
            </div>

            {/* Kotak Lembaga Kemasyarakatan Kelurahan */}
            <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-stone-900 via-makassar-950 to-stone-900 text-white p-6 sm:p-8 border border-makassar-700/50 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-2xl mx-auto mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-[11px] font-bold tracking-wider uppercase mb-2 border border-gold-500/30">
                  <Home className="w-3 h-3" />
                  Tingkat Kewilayahan Grassroots &bull; Lembaga Kemasyarakatan (LKK)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  3 Rukun Warga (RW) & 16 Rukun Tetangga (RT)
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Mitra strategis Pemerintah Kelurahan Mamajang Luar dalam pelayanan administrasi permohonan surat, pemeliharaan ketertiban, dan gotong royong warga.
                </p>
              </div>

              {/* 3 Rukun Warga Pilar Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {KELURAHAN_CONFIG.daftarRW.map((rw) => (
                  <div
                    key={rw.rw}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:border-gold-400/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-stone-950 font-extrabold text-xs">
                        {rw.rw}
                      </span>
                      <span className="text-[11px] text-stone-300 font-semibold">{rw.jumlahRT} RT</span>
                    </div>
                    <h5 className="font-bold text-sm text-white">{rw.ketua}</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-1">{rw.wilayah}</p>
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                      <span>{rw.jumlahKK} KK</span>
                      <span>&bull;</span>
                      <span className="text-gold-300 font-semibold">{rw.jumlahJiwa} Jiwa</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tautan langsung ke Tab Direktori 16 RT */}
              {onNavigateToRtRw && (
                <div className="text-center pt-2">
                  <button
                    onClick={onNavigateToRtRw}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105"
                  >
                    <span>Buka Direktori Lengkap 16 RT (Cakupan Wilayah, Alamat & Kontak)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAMPILAN 2: DAFTAR KARTU GRID (ALTERNATIF RINGKAS) */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {/* Lurah */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-makassar-900 to-makassar-800 text-white shadow-lg flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center shrink-0">
              <Landmark className="w-10 h-10 text-gold-300" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase">
                {aparatur.lurah.jabatan}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{aparatur.lurah.nama}</h3>
              <p className="text-xs text-gold-200 font-mono">NIP. {aparatur.lurah.nip} &bull; {aparatur.lurah.pangkat}</p>
              <p className="text-xs text-stone-300 mt-1">Kontak Resmi: {aparatur.lurah.kontak}</p>
            </div>
          </div>

          {/* Seklur & Kasi Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  {aparatur.seklur.jabatan}
                </span>
                <h4 className="font-bold text-stone-900 text-base mt-1">{aparatur.seklur.nama}</h4>
                <p className="text-xs text-stone-500 font-mono">NIP. {aparatur.seklur.nip}</p>
                <p className="text-xs text-stone-400">{aparatur.seklur.pangkat}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  {aparatur.kasiPemerintahan.jabatan}
                </span>
                <h4 className="font-bold text-stone-900 text-base mt-1">{aparatur.kasiPemerintahan.nama}</h4>
                <p className="text-xs text-stone-500 font-mono">NIP. {aparatur.kasiPemerintahan.nip}</p>
                <p className="text-xs text-stone-400">{aparatur.kasiPemerintahan.pangkat}</p>
              </div>
            </div>
          </div>

          {/* Staf Grid */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Seluruh Staf Teknis & Pelayanan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {aparatur.staf.map((s) => (
                <div key={s.nama} className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-stone-900 text-xs truncate">{s.nama}</h5>
                    <p className="text-[11px] text-makassar-700 font-semibold">{s.jabatan}</p>
                    {s.nip && <p className="text-[10px] text-stone-400 font-mono">NIP. {s.nip}</p>}
                    {s.kontak && <p className="text-[10px] text-emerald-700 font-semibold">{s.kontak}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
