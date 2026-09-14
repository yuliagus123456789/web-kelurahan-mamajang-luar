import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { UmkmItem } from '@/lib/types';
import { KELURAHAN_CONFIG } from '@/lib/config';
import { Store, Phone, MapPin, Search, PlusCircle, ExternalLink, Sparkles, MessageCircle } from 'lucide-react';

import { DATA_UMKM_MALUR } from '@/data/umkmData';
import { CheckCircle2, BadgeCheck } from 'lucide-react';

export default function UmkmPage() {
  const [umkm, setUmkm] = useState<UmkmItem[]>(DATA_UMKM_MALUR);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('umkm').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          // Merge database items if any with official archive
          setUmkm(data);
        }
      } catch (err) {
        console.warn('Using authentic DATA_UMKM_MALUR data:', err);
      }
    })();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(umkm.map((u) => u.category)))];
  const filtered = umkm.filter((u) => {
    const matchCat = activeCategory === 'Semua' || u.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.owner.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q) ||
      (u.address && u.address.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const formatWaNumber = (contact: string | null) => {
    if (!contact) return '';
    const clean = contact.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) return '62' + clean.slice(1);
    if (clean.startsWith('62')) return clean;
    return '62' + clean;
  };

  return (
    <div className="pt-24">
      {/* Banner */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/37234069/pexels-photo-37234069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="UMKM Mamajang Luar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/80 to-stone-900/90" />
        </div>
        <div className="relative text-center px-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5" />
            Data Resmi Kearsipan Kelurahan & Dinas Koperasi UKM
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Potensi & UMKM Warga</h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Etalase produk unggulan, kuliner, warung, jahit, dan usaha mikro warga Kelurahan Mamajang Luar, Kota Makassar.
          </p>
          <nav className="mt-3 text-xs sm:text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2 text-stone-500">/</span>
            <span className="text-gold-300">Potensi & UMKM</span>
          </nav>
        </div>
      </section>

      {/* Banner Ajakan Pendaftaran UMKM via Google Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-gradient-to-r from-makassar-900 via-stone-900 to-makassar-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0 text-gold-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gold-300">
                Fasilitas Promosi Gratis Warga
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Punya Usaha di Wilayah Mamajang Luar?</h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Promosikan warung, kuliner, toko, atau kerajinan Anda di website resmi kelurahan tanpa dipungut biaya. Pembeli bisa langsung menghubungi WhatsApp Anda!
              </p>
            </div>
          </div>

          <a
            href={KELURAHAN_CONFIG.googleForms.pendaftaranUmkm}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-sm shadow-lg hover:shadow-gold-500/20 transition-all group"
          >
            <PlusCircle className="w-5 h-5 text-stone-950 group-hover:rotate-90 transition-transform" />
            <span>Daftarkan Usaha Anda</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      </section>

      {/* Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Quick Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-makassar-800">{umkm.length}</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Total UMKM Terdata</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">19</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Foto Gerai Asli</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-700">6</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Kategori Bidang</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-gold-600">100%</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Bebas Biaya Promosi</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Direktori Usaha Mikro Warga</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Kenali dan dukung produk lokal karya tetangga kita untuk mendorong perputaran ekonomi lorong di Mamajang Luar.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama usaha, jenis produk, jalan, atau nama pemilik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-sm bg-white shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const count = c === 'Semua' ? umkm.length : umkm.filter((u) => u.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === c
                      ? 'bg-makassar-800 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{c}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeCategory === c ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Tidak ada UMKM yang cocok dengan kata kunci tersebut.</p>
            <p className="text-stone-400 text-xs mt-1">Coba gunakan kata pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u) => {
              const waNum = formatWaNumber(u.contact);
              const waLink = waNum
                ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Halo ${u.name}, saya melihat usaha Anda di website Kelurahan Mamajang Luar. Apakah produk/layanan Anda masih tersedia?`)}`
                : null;
              const isRealPhoto = u.image_url && u.image_url.includes('/images/umkm/');

              return (
                <div
                  key={u.id}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-makassar-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 overflow-hidden relative bg-stone-100">
                      {u.image_url ? (
                        <img
                          src={u.image_url}
                          alt={u.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                          <Store className="w-12 h-12 text-stone-300" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-makassar-900 text-[11px] font-bold shadow-sm border border-stone-100">
                        {u.category}
                      </span>
                      {isRealPhoto && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-md text-gold-300 text-[10px] font-bold shadow flex items-center gap-1.5 border border-gold-400/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Foto Gerai Asli
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-stone-800 text-lg leading-snug group-hover:text-makassar-800 transition-colors">
                        {u.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 font-medium">
                        Pemilik: <span className="text-stone-700 font-semibold">{u.owner}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                        {u.description}
                      </p>

                      <div className="mt-4 space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
                        {u.address && (
                          <p className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-makassar-700 shrink-0 mt-0.5" />
                            <span>{u.address}</span>
                          </p>
                        )}
                        {u.contact && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-makassar-700 shrink-0" />
                            <span className="font-mono">{u.contact}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all group/btn"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Hubungi via WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/btn:translate-x-0.5" />
                      </a>
                    ) : (
                      <div className="w-full text-center py-2 text-xs text-stone-400 font-medium bg-stone-50 rounded-xl border border-stone-100">
                        Kontak langsung di gerai / lokasi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
