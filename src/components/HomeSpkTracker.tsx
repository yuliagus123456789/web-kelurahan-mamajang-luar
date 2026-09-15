import { useState, FormEvent } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { ComplaintItem, SawComplaintItem } from '@/lib/types';
import {
  calculateSawPriorities,
  INITIAL_SAMPLE_COMPLAINTS,
} from '@/lib/spkSaw';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Droplets,
  Lightbulb,
  Building2,
  X,
  Send,
  MessageSquareQuote,
  Camera,
} from 'lucide-react';

export default function HomeSpkTracker() {
  const [ticketQuery, setTicketQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SawComplaintItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const handleSearch = async (e?: FormEvent, forcedQuery?: string) => {
    if (e) e.preventDefault();
    const query = (forcedQuery !== undefined ? forcedQuery : ticketQuery).trim().toLowerCase();
    if (!query) return;

    if (forcedQuery !== undefined) {
      setTicketQuery(forcedQuery);
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setSearchResult(null);

    try {
      // 1. Ambil data dari Supabase
      let supabaseItems: ComplaintItem[] = [];
      try {
        const { data } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          supabaseItems = data;
        }
      } catch (sbErr) {
        console.warn('Supabase offline or schema pending, using local store:', sbErr);
      }

      // 2. Ambil data lokal browser
      let localItems: ComplaintItem[] = [];
      try {
        const saved = localStorage.getItem('mamajang_local_complaints');
        if (saved) localItems = JSON.parse(saved);
      } catch {
        // ignore
      }

      // 3. Gabungkan seluruh data unik
      const combined = [...supabaseItems, ...localItems, ...INITIAL_SAMPLE_COMPLAINTS];
      const seen = new Set<string>();
      const uniqueList: ComplaintItem[] = [];
      for (const item of combined) {
        const key = item.ticket_number || item.id;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueList.push(item);
        }
      }

      // 4. Hitung skor SPK SAW
      const scoredList = calculateSawPriorities(uniqueList);

      // 5. Cari yang cocok dengan query
      const match = scoredList.find((item) => {
        const tMatch = item.ticket_number && item.ticket_number.toLowerCase().includes(query);
        const pMatch = item.phone && item.phone.toLowerCase().includes(query);
        const nMatch = item.name && item.name.toLowerCase().includes(query);
        const sMatch = item.subject && item.subject.toLowerCase().includes(query);
        return tMatch || pMatch || nMatch || sMatch;
      });

      if (match) {
        setSearchResult(match);
      } else {
        setSearchError('Nomor tiket atau kontak tidak ditemukan. Coba gunakan contoh tiket resmi di bawah (misal: MLR-26-4819).');
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setSearchError(errObj.message || 'Gagal memproses pencarian tiket.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setTicketQuery('');
    setSearchResult(null);
    setHasSearched(false);
    setSearchError(null);
  };

  return (
    <section
      id="spk-tracker-section"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-32"
    >
      <div className="rounded-3xl bg-white text-stone-800 p-6 sm:p-10 lg:p-12 shadow-xl shadow-stone-200/60 border border-stone-200/90 relative overflow-hidden">
        {/* Subtle decorative top accent line with Makassar Maroon & Gold */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-makassar-800 via-makassar-600 to-gold-500" />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-makassar-50 text-makassar-800 text-xs font-bold uppercase tracking-wider mb-3.5 border border-makassar-200/70 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-makassar-700" />
              <span>Sistem Pengaduan Berkeadilan (SPK SAW)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-snug">
              Aspirasi & Lacak Status Tiket <span className="text-makassar-800">Pengaduan Warga</span>
            </h2>
            <p className="mt-2.5 text-stone-600 text-sm sm:text-base leading-relaxed">
              Setiap keluhan warga Mamajang Luar dinilai secara matematis menggunakan metode <strong className="text-stone-800 font-semibold">Simple Additive Weighting (SAW)</strong>. Penanganan diprioritaskan berdasarkan skala urgensi objektif, transparan, dan bebas intervensi personal.
            </p>
          </div>

          <Link
            to="/kontak"
            className="shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 group"
          >
            <Send className="w-4 h-4 text-gold-300 group-hover:translate-x-0.5 transition-transform" />
            <span>Kirim Pengaduan Baru</span>
          </Link>
        </div>

        {/* 3 Pilar Transparansi Penanganan Berkeadilan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-makassar-50/60 border border-makassar-100/90 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-makassar-800 flex items-center justify-center shrink-0 text-gold-300 font-black text-sm shadow-xs">
              40%
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-900">Tingkat Bahaya Masalah</p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Masalah darurat lingkungan & keselamatan warga dinilai dengan prioritas tertinggi.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-gold-600 flex items-center justify-center shrink-0 text-stone-950 font-black text-sm shadow-xs">
              30%
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-900">Cakupan Warga Terdampak</p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Keluhan yang berdampak pada satu lorong, RW, atau kelurahan diproses lebih cepat.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/80 border border-stone-200 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-stone-700 flex items-center justify-center shrink-0 text-white font-black text-sm shadow-xs">
              30%
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-900">Kedaruratan Situasi</p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Kata kunci darurat (banjir, amblas, padam total) langsung menaikkan antrean penanganan.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Search Box */}
        <div className="pt-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  placeholder="Masukkan Nomor Tiket (cth: MLR-26-4819), No. WhatsApp, atau topik..."
                  className="w-full pl-11 pr-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-makassar-800/20 focus:border-makassar-800 transition-all shadow-2xs"
                />
                {ticketQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching || !ticketQuery.trim()}
                className="px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                {isSearching ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-gold-300" />
                    <span>Mengecek...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-gold-300" />
                    <span>Lacak Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Examples on Mobile / Desktop */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-600">Contoh tiket tersimpan:</span>
            {['MLR-26-4819', 'MLR-26-5192', 'MLR-26-3021'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleSearch(undefined, ex)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-makassar-50 hover:text-makassar-800 hover:border-makassar-300 text-stone-700 font-mono text-[11px] font-semibold border border-stone-200 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Search Result Box */}
          {hasSearched && searchResult && (
            <div className="mt-6 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-white to-stone-50/70 border-2 border-makassar-300 shadow-xl shadow-makassar-900/5 animate-slide-down">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500 block">
                    Hasil Pencarian Tiket Resmi
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-makassar-900">
                      {searchResult.ticket_number}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        searchResult.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : searchResult.status === 'Diproses'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Status: {searchResult.status}
                    </span>
                  </div>
                </div>

                {/* Skor Prioritas SAW */}
                <div className="text-left sm:text-right bg-white p-3.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-stone-200 shadow-2xs sm:shadow-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    Skor Prioritas SAW
                  </span>
                  <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                    <span className="text-xl font-extrabold font-mono text-stone-900">
                      {(searchResult.saw.finalScore * 100).toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                        searchResult.saw.priorityLevel === 'Tinggi'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : searchResult.saw.priorityLevel === 'Sedang'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      Prioritas {searchResult.saw.priorityLevel} (Rank #{searchResult.saw.rank})
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Aduan */}
              <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-stone-700">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Topik / Subjek:</span>
                  <span className="font-bold text-stone-900">{searchResult.subject}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Pelapor:</span>
                  <span className="font-semibold text-stone-800">{searchResult.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Kategori Masalah:</span>
                  <span className="font-semibold text-stone-800">{searchResult.category}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Cakupan Wilayah:</span>
                  <span className="font-semibold text-stone-800">{searchResult.impact_scope}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Waktu Masuk:</span>
                  <span className="font-mono text-stone-800">
                    {new Date(searchResult.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} WITA
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500 font-medium">Isi Aduan:</span>
                  <span className="text-stone-700 leading-relaxed max-w-xl">{searchResult.message}</span>
                </div>
                {searchResult.saw.matchedKeywords && searchResult.saw.matchedKeywords.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 py-1.5 border-b border-stone-200/80">
                    <span className="text-stone-500 font-medium">Kata Kunci Kedaruratan (C3):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.saw.matchedKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {searchResult.image_url && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-stone-200/80">
                    <span className="text-stone-500 font-medium">Foto Bukti Lapangan:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage(searchResult.image_url!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-makassar-800" />
                      <span>Buka Foto Bukti Lapangan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Respon Tindak Lanjut dari Admin / Lurah */}
              {searchResult.admin_response ? (
                <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tindak Lanjut Pemerintah Kelurahan:</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-stone-700">
                    {searchResult.admin_response}
                  </p>
                  {searchResult.responded_at && (
                    <p className="text-[11px] font-semibold text-emerald-700 mt-2">
                      Diperbarui pada: {new Date(searchResult.responded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-stone-700 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Aduan ini telah terverifikasi oleh sistem dan sedang masuk dalam antrean koordinasi satgas wilayah.</span>
                </div>
              )}

              {/* Tombol Detail Lengkap */}
              <div className="mt-5 flex justify-end">
                <Link
                  to="/kontak"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-makassar-800 hover:text-makassar-700 hover:underline"
                >
                  <span>Buka Portal Aspirasi Lengkap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Search Error Box */}
          {hasSearched && searchError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Data Tidak Ditemukan</p>
                <p className="mt-0.5 text-stone-600">{searchError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pintasan Kategori Darurat Populer */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3.5">
            Pintasan Laporan Masalah Lingkungan yang Sering Dihadapi:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              to="/kontak?kategori=drainase"
              className="p-4 rounded-2xl bg-stone-50/80 hover:bg-makassar-50/50 border border-stone-200 hover:border-makassar-300 text-stone-800 text-xs sm:text-sm flex items-center justify-between transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                  <Droplets className="w-4.5 h-4.5 text-cyan-700" />
                </div>
                <span className="font-semibold text-stone-800 group-hover:text-makassar-900">Drainase Buntu & Sampah</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-makassar-800 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/kontak?kategori=lampu"
              className="p-4 rounded-2xl bg-stone-50/80 hover:bg-makassar-50/50 border border-stone-200 hover:border-makassar-300 text-stone-800 text-xs sm:text-sm flex items-center justify-between transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-700" />
                </div>
                <span className="font-semibold text-stone-800 group-hover:text-makassar-900">Lampu Jalan Padam / Rusak</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-makassar-800 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/kontak?kategori=keamanan"
              className="p-4 rounded-2xl bg-stone-50/80 hover:bg-makassar-50/50 border border-stone-200 hover:border-makassar-300 text-stone-800 text-xs sm:text-sm flex items-center justify-between transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-700" />
                </div>
                <span className="font-semibold text-stone-800 group-hover:text-makassar-900">Ketertiban & Gangguan Umum</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-makassar-800 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Foto Bukti Ukuran Penuh */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs sm:text-sm">
                <Camera className="w-4 h-4 text-makassar-800" />
                <span>Foto Bukti Kejadian Lapangan</span>
              </div>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-stone-900/5 rounded-xl max-h-[75vh] overflow-hidden">
              <img
                src={previewModalImage}
                alt="Foto Bukti Lengkap"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
